import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTimeDto } from './dto/update-time.dto';

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

}
