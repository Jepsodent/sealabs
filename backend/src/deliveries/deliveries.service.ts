import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryJobStatus, DeliveryStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeliveriesService {

    constructor(private readonly prisma:PrismaService){}

    async getAllDeliveryJob(){
        return this.prisma.deliveryJob.findMany({
            where: {
                status: DeliveryJobStatus.AVAILABLE
            },
            include: {
                order: {select: {deliveryAddress: true, deliveryMethod: true, deliveryFee: true}}
            }
        })
    }
    async getDeliveryDetail(deliveryId:string){
        const result =  await this.prisma.deliveryJob.findUnique({
            where: {id: deliveryId},
            include :{
                order: {
                    include: {
                        orderItem:{
                            select: {quantity: true, price:true},
                            include: {product: {select: {name: true, imageUrl: true}}}
                        },
                        store: {select: {name: true}}
                    }
                }
            }
        })
        if(!result){
            throw new NotFoundException('Detail pekerjaan tidak ditemukan!')
        }
        return result
    }

    async takeDeliveryJob(deliveryId: string, userId:string){
        const result = await this.prisma.$transaction(async(tx) => {
            const takenJob = await tx.deliveryJob.findFirst({
                where:{ 
                    driverId: userId,
                    status: DeliveryJobStatus.TAKEN
                }
            })
            if(takenJob){
                throw new BadRequestException('Anda masih memiliki pengantaran yang belum selesai!')
            }

            const deliveryJob = await tx.deliveryJob.findUnique({
                where: {
                    id: deliveryId
                }
            })
            if(!deliveryJob) throw new NotFoundException('Job pengiriman tidak ditemukan!')
            if(deliveryJob.status === DeliveryJobStatus.COMPLETED) throw new BadRequestException('Job pengiriman sudah diselesaikan!')

            const updateDelivery = await tx.deliveryJob.updateMany({
                where: {
                    id:deliveryId,
                    driverId: null,
                    status: {
                        equals: DeliveryJobStatus.AVAILABLE
                    }
                },
                data: {
                    driverId: userId,
                    status: DeliveryJobStatus.TAKEN
                }
            })
            if(updateDelivery.count === 0){
                throw new BadRequestException('Pekerjaan sudah diambil driver lain!')
            }
            

            await tx.order.update({
                where: {
                    id: deliveryJob.orderId
                },
                data: {
                    status: DeliveryStatus.SEDANG_DIKIRIM
                }
            })
            await tx.orderStatusHistory.create({
                data: {
                    orderId: deliveryJob.orderId,
                    status: DeliveryStatus.SEDANG_DIKIRIM 
                }
            })

            return tx.deliveryJob.findUnique({
                where: {id: deliveryId}
            })
        } )
        return result
    }

}
