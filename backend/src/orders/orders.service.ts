import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CartService } from 'src/cart/cart.service';
import { DeliveryPrice, ppnTax } from 'src/common/delivery.constant';
import { WalletService } from 'src/wallet/wallet.service';
import { DeliveryStatus, TransactionType } from '@prisma/client';

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
            if(!address) throw new NotFoundException('Alamat tidak ditemukan!')
            
            //4. Tulis snapshot address string - label - fullAddress
            const snapshotAddress = `${address.label} - ${address.fullAddress}`

            //5. Hitung totalPrice dan payment pake walletService
            const taxAmount = Math.floor(cartItem.subTotal * ppnTax)
            const totalPrice = taxAmount + cartItem.subTotal + DeliveryPrice[dto.deliveryMethod]

            const wallet = await tx.wallet.findUnique({where: {userId}, select: {balance: true}})
            if(!wallet || wallet.balance < totalPrice){
                throw new BadRequestException("Saldo anda tidak mencukupi transaksi ini!")
            }
            await tx.wallet.update({
                where:{userId},
                data: {
                    balance: {
                        decrement: totalPrice
                    }
                }
            })
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

}
