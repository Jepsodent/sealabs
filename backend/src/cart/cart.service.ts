import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartDto } from './dto/add-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma:PrismaService){}


    async getCart(userId: string){
        const cart = await this.prisma.cartItem.findMany({
            where:{ 
                userId
            },
            include: {
                product: {
                    include:{ 
                        store: {
                            select: {name:true, id:true}
                        }
                    }
                }
            }
        })
        let totalQuantity = 0
        let subTotal = 0
        
        cart.forEach((item) => {
            totalQuantity += item.quantity
            subTotal += item.product.price * item.quantity
        })
        const isEmpty = cart.length === 0
        const items = cart.map((item) => {
            return { 
                id: item.id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                quantity: item.quantity,
                productId: item.productId,
            }            
        })
        return { 
            items,
            store: isEmpty ? null: {name: cart[0].product.store.name, storeId: cart[0].product.store.id},
            totalQuantity,
            subTotal
        }
    }

    async addCart(dto:AddCartDto, userId: string){
        const product = await this.prisma.product.findUnique({
            where: {id: dto.productId}
        })
        if(!product)  throw new NotFoundException("Product tidak ditemukan!")
        const otherStoreItem = await this.prisma.cartItem.findFirst({
            where: {
                userId,
                product: {
                    storeId: {
                        not: product.storeId
                    }
                }
            },
            include: {
                product: true
            }
        })

        if(otherStoreItem) throw new BadRequestException("Keranjang anda sudah berisi product dari toko lain!")

        return await this.prisma.cartItem.upsert({
            where: {
                userId_productId: {
                    userId,
                    productId: dto.productId
                }
            },
            update: {
                quantity:{
                    increment: dto.quantity
                }
            },
            create: {
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
            },
        })
    }

    async updateCart(userId: string , productId: string, dto: UpdateCartDto){
        const item = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    productId,
                    userId
                }
            }
        })
        if(!item) throw new NotFoundException("Product tidak ditemukan!")

        return this.prisma.cartItem.update({
            where: {
                userId_productId: {
                    userId,productId
                }
            },
            data:{ 
                quantity: dto.quantity
            }
        })
    }

    async deleteCart(userId: string, productId:string){
        const item = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId: {
                    productId,
                    userId
                }
            }
        })
        if(!item) throw new NotFoundException("Product tidak ditemukan!") 
        return this.prisma.cartItem.delete({
            where: {
                userId_productId: {
                    productId,
                    userId
                }
            }
        })
    }

}
