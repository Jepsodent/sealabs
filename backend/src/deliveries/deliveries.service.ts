import { Injectable, NotFoundException } from '@nestjs/common';
import { DeliveryJobStatus } from '@prisma/client';
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

}
