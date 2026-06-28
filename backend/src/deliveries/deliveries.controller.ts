import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { DeliveriesService } from './deliveries.service';

@Controller('deliveries')
@UseGuards(JwtAuthGuard, RoleGuard)
@CurrentRole(Role.DRIVER)
export class DeliveriesController {
    constructor (private readonly deliveryService: DeliveriesService){}
    @Get("available")
    async getDeliveryJob(){
        return this.deliveryService.getAllDeliveryJob()
    }

    @Get(':id')
    async getDeliveryDetail(@Param('id') id:string){
        return this.deliveryService.getDeliveryDetail(id)
    }
}
