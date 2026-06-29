import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTimeDto } from './dto/update-time.dto';
import { DeliveryJobStatus, DeliveryStatus, TransactionType } from '@prisma/client';
import { DeliveryTime } from 'src/common/delivery.constant';

@Injectable()
export class AdminService {

    constructor(private readonly prisma:PrismaService){}

    async getSystemTime(){
        const config = await this.prisma.systemConfig.findUnique({
            where: {
                id: "time_config"
            }
        })
        const offsetDate = (config?.virtualTimeOffsetDays || 0) * 24 * 60 * 60 * 1000
        return new Date(Date.now() + offsetDate)
    }

    async updateTime(dto: UpdateTimeDto){
        return this.prisma.systemConfig.update({
            where: {
                id: "time_config"
            },
            data: {
                virtualTimeOffsetDays: {
                    increment: dto.days
                }
            }
        })
    }
    async resetTime(){
        return this.prisma.systemConfig.update({
            where: {
                id: "time_config"
            },
            data: {
                virtualTimeOffsetDays: 0
            }
        })
    }

    async checkOverdue(){
        const systemTime = await this.getSystemTime()
        const activeOrders = await this.prisma.order.findMany({
            where: {
                status: {
                    in: [
                        DeliveryStatus.SEDANG_DIKEMAS,
                        DeliveryStatus.MENUNGGU_PENGIRIM,
                        DeliveryStatus.SEDANG_DIKIRIM,
                    ]
                }
            },
            include: {
                orderItem:true,
                deliveryJob:true
            }
        })

        const overdueOrders = activeOrders.filter((order) => {
            const slaDays = DeliveryTime[order.deliveryMethod]
            const limitTime = order.createdAt.getTime() + (slaDays * 24 * 60 * 60 * 1000)
            return systemTime.getTime() > limitTime // contoh brg sampe harus di tgl 12 (limit time), systemtime nya 13 maka telat 
        })
        
        for (const order of overdueOrders){
            await this.prisma.$transaction(async(tx) => {
                // failsafe
                const currentOrder = await tx.order.findUnique({where:{id: order.id}})
                if(!currentOrder || currentOrder.status === DeliveryStatus.DIKEMBALIKAN || currentOrder.status === DeliveryStatus.PESANAN_SELESAI){
                    return;
                }

                await tx.order.update({
                    where: {id:order.id},
                    data: {status: DeliveryStatus.DIKEMBALIKAN}
                })
                await tx.orderStatusHistory.create({
                    data: {
                        orderId: order.id,
                        status: DeliveryStatus.DIKEMBALIKAN,
                        timestamp: systemTime //waktu virtualnya
                    }
                })

                const wallet = await tx.wallet.updateMany({
                    where: {userId: order.buyerId},
                    data: {
                        balance: {increment: order.total}
                    }
                })
                if(wallet.count === 0) {
                    throw new NotFoundException('Dompet pembeli tidak ditemukan')
                }
                await tx.walletTransaction.create({
                    data: {
                        userId: order.buyerId,
                        amount: order.total,
                        type: TransactionType.REFUND,
                        createdAt: systemTime
                    }
                })

                for(const item of order.orderItem){
                    await tx.product.update({
                        where: {id: item.productId},
                        data: {
                            stock: {increment: item.quantity}
                        }
                    })
                }
                if(order.deliveryJob){
                    await tx.deliveryJob.update({
                        where: {id: order.deliveryJob.id},
                        data: {
                            status: DeliveryJobStatus.CANCELLED,
                        }
                    })
                }
                        
            })

        }
        return {
            success:true,
            message: `Berhasil memproses ${overdueOrders.length} pesanan overdue secara otomatis.`,
            processedCount: overdueOrders.length,
        }

    }

}
