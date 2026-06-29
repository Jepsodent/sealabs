import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CartService } from 'src/cart/cart.service';
import { DeliveryPrice, ppnTax } from 'src/common/delivery.constant';
import { WalletService } from 'src/wallet/wallet.service';
import { DeliveryJobStatus, DeliveryStatus, DiscountType, TransactionType } from '@prisma/client';

@Injectable()


export class OrdersService {
    constructor(private readonly prisma: PrismaService, private readonly cartService: CartService, private readonly walletService: WalletService){}

    async checkout(dto:CheckoutDto, userId:string){
        const result = await this.prisma.$transaction(async(tx) => {
            //1. ambil cartItem user
            const cartItem = await this.cartService.getCart(userId)
            if (!cartItem || !cartItem.store){
                throw new BadRequestException("Keranjang belanja kosong!")
            }
            // 2. ambil storeId nya
            const storeId = cartItem.store.storeId
            
            // 3. cek address nya ada atau engga
            const address = await tx.address.findUnique({
                where:{ 
                    id: dto.addressId
                }
            })
            if(!address || address.userId !== userId) throw new NotFoundException('Alamat tidak ditemukan!')
            
            //4. Tulis snapshot address string - label - fullAddress
            const snapshotAddress = `${address.label} - ${address.fullAddress}`

            // tambahan untuk cek discount
            let discountPrice: number = 0
            let discountType: DiscountType | null = null
            
            if(dto.discountCode){
                const [promo, voucher] = await Promise.all([
                    tx.promo.findUnique({where: {code: dto.discountCode}}),
                    tx.voucher.findUnique({where: {code: dto.discountCode}})
                ])
                const discount = promo || voucher
                if(!discount) throw new NotFoundException('Kode diskon tidak valid / tidak ditemukan')
                
                if(discount.expiryDate < new Date()) throw new BadRequestException('Kode diskon sudah kadaluwarsa')

                if(voucher){
                    discountType = DiscountType.VOUCHER
                    const updatedVoucher = await tx.voucher.updateMany({
                        where: {
                            code: dto.discountCode,
                            remainingUsage: {gte: 1}
                        },
                        data: {
                            remainingUsage: {decrement: 1}
                        }
                    })
                    if (updatedVoucher.count === 0){
                        throw new BadRequestException('Kuota voucher telah habis!')
                    }

                }else{
                    discountType =DiscountType.PROMO
                }
                const rawDiscount = discount.isPercent ? Math.floor((cartItem.subTotal * discount.discountValue) / 100) : discount.discountValue
                discountPrice = Math.min(rawDiscount, cartItem.subTotal)
            }

            //5. Hitung totalPrice dan payment pake walletService
            const taxAmount = Math.floor((cartItem.subTotal - discountPrice) * ppnTax)
            const totalPrice = cartItem.subTotal - discountPrice + taxAmount  + DeliveryPrice[dto.deliveryMethod]

            const updatedWallet = await tx.wallet.updateMany({
                where:{ 
                    userId,
                    balance: {gte: totalPrice}
                },
                data: {
                    balance: {decrement: totalPrice}
                }
            })
            if(updatedWallet.count === 0){
                throw new BadRequestException('Saldo anda tidak mencukupi transaksi ini!')
            }

            await tx.walletTransaction.create({
                data: {
                    amount: totalPrice,
                    userId,
                    type: TransactionType.PAYMENT
                }
            })
            
            //6. ambil produk dan cek jika stock nya < quantity nya, lalu kuranign stock producknya
            // karena product Service itu hanya bisa di tembak using seller id , jadi kt hrs buat logic nya dsni
            for (const item of cartItem.items){
                const updated = await tx.product.updateMany({
                    where: {
                        id: item.productId,
                        stock: {gte: item.quantity}
                    },
                    data:{
                        stock: {decrement: item.quantity}
                    }
                })
                if(updated.count === 0){
                    throw new BadRequestException(`Stock dari product ${item.name} tidak mencukupi`)
                }
            }

            const order = await tx.order.create({
                data: {
                    deliveryAddress: snapshotAddress,
                    buyerId: userId,
                    storeId: storeId,
                    deliveryMethod: dto.deliveryMethod,
                    deliveryFee: DeliveryPrice[dto.deliveryMethod],
                    subTotal: cartItem.subTotal,
                    tax: taxAmount,
                    total: totalPrice,
                    discountCode: dto.discountCode,
                    discount: discountPrice,
                    discountType,

                    orderItem: {
                        create: cartItem.items.map((item) => ({
                            price: item.price,
                            quantity: item.quantity,
                            productId: item.productId
                        }))
                    },
                    orderStatusHistory: {
                        create: {
                            status: DeliveryStatus.SEDANG_DIKEMAS
                        }
                    }
                }
            })

            await tx.cartItem.deleteMany({
                where: {userId}
            })

            return order
        })

        return result
    }

    async getOrders(userId:string, type: 'BUYER'|'SELLER'){
        switch(type){
            case 'BUYER':{
                return this.prisma.order.findMany({
                    where: {
                        buyerId: userId
                    },
                    include:{
                        orderItem:{
                            include:{
                                product: true,
                            }
                        },
                        orderStatusHistory:true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            }
            case 'SELLER':{
                const hasStore = await this.prisma.store.findUnique({
                    where: {
                        ownerId: userId
                    }
                }) 
                if(!hasStore) throw new BadRequestException("Anda belum memiliki toko!")

               return this.prisma.order.findMany({
                    where: {
                        storeId: hasStore.id
                    },
                    include:{
                        orderItem:{
                            include:{
                                product: true,
                            }
                        },
                        orderStatusHistory:true,
                        buyer: {
                            select: {address: true, username:true}
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                })
            }
        }
    }
    //seller
    async updateStatusOrder(userId: string, orderId:string){
        const order = await this.prisma.order.findUnique({
            where:{id: orderId},
            include: {
                store: {select: {ownerId: true}}
            }
        })
        if(!order){
            throw new NotFoundException('Pesanan tidak ditemukkan')
        }
        if(order.store.ownerId !== userId){
            throw new ForbiddenException('Anda tidak berhak memproses pesanan ini!')
        }
        if (order.status !== DeliveryStatus.SEDANG_DIKEMAS){
            throw new BadRequestException('Pesanan tidak dapat diproses lagi!')
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.order.updateMany({
                where: {
                    id: orderId,
                    status: DeliveryStatus.SEDANG_DIKEMAS
                },
                data: {status: DeliveryStatus.MENUNGGU_PENGIRIM}
            })
            if(updated.count === 0) {
                throw new BadRequestException('Pesanan tidak dapat diproses lagi!')
            }
            await tx.orderStatusHistory.create({
                data: {
                    orderId,
                    status: DeliveryStatus.MENUNGGU_PENGIRIM
                }
            })
            await tx.deliveryJob.create({
                data: {
                    orderId,
                    status: DeliveryJobStatus.AVAILABLE,
                }
            })
            return tx.order.findUnique({where: {id: orderId}})
        })
    }


}
