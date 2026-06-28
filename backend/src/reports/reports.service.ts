import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
    constructor(private readonly prisma:PrismaService){}


    async getSellerReport(sellerId:string){
        const store = await this.prisma.store.findUnique(
            {
                where: {
                    ownerId: sellerId
                }
            }
        )
        if(!store){
            throw new NotFoundException("Toko tidak ditemukan")
        }
        const order = await this.prisma.order.aggregate({
            where: {
                storeId: store.id,
                status: {
                    in:[
                        DeliveryStatus.MENUNGGU_PENGIRIM,
                        DeliveryStatus.SEDANG_DIKIRIM,
                        DeliveryStatus.PESANAN_SELESAI
                    ]
                },
            },
            _sum: {
                subTotal: true,
                discount: true,
            }
        })
        const revenue = (order._sum.subTotal ?? 0) -  (order._sum.discount ?? 0)

        return {
            revenue
        }

    }
    async getBuyerReport(userId:string){
        const result = await this.prisma.order.aggregate({
            where: {
                buyerId: userId,
                status: {
                    not: DeliveryStatus.DIKEMBALIKAN
                }
            },
            _sum: {
                total:true
            }
        })
        const totalExpense = result._sum.total ?? 0
        return {
            totalExpense
        }
    }

}
