import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RoleGuard)
export class OrdersController {
    constructor(private readonly orderService: OrdersService){}

    @Post('/checkout')
    @CurrentRole(Role.BUYER)
    async checkout(@Body() dto:CheckoutDto, @CurrentUser() user:SafeUser) {
        return this.orderService.checkout(dto, user.id)
    }
    @Get('buyer')
    @CurrentRole(Role.BUYER)
    async getOrderBuyer(@CurrentUser() user:SafeUser){
        return this.orderService.getOrders(user.id, 'BUYER')
    }
    
    @Get('seller')
    @CurrentRole(Role.SELLER)
    async getOrderSeller(@CurrentUser() user:SafeUser){
        return this.orderService.getOrders(user.id, 'SELLER')
    }


}
