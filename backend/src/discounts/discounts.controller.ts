import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { Role } from '@prisma/client';
import { CreateVoucerDto } from './dto/create-voucer.dto';
import { CreatePromoDto } from './dto/create-promo.dto';

@Controller('discounts')
@UseGuards(JwtAuthGuard, RoleGuard)
export class DiscountsController {

    constructor(private readonly discountService:DiscountsService){}

    @Post('vouchers')
    @CurrentRole(Role.ADMIN)
    async createVouchers(@Body() dto:CreateVoucerDto){
        return this.discountService.createVoucer(dto)
    }
    @Post('promos')
    @CurrentRole(Role.ADMIN)
    async createPromos(@Body() dto:CreatePromoDto){
        return this.discountService.createPromo(dto)
    }
    
    @Get('validate/:code')
    async getValidateCode(@Param('code') code:string){
        return this.discountService.getValidateCode(code)
    }


}
