import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddCartDto } from './dto/add-cart.dto';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';
import { CartService } from './cart.service';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard, RoleGuard)
@CurrentRole(Role.BUYER)
export class CartController {
    constructor(private readonly cartService: CartService){}
    @Post()
    async addCart(@Body() dto: AddCartDto, @CurrentUser() user:SafeUser ){ 
        return this.cartService.addCart(dto, user.id)
    }

    @Put(':productId')
    async updateCart(@Body() dto:UpdateCartDto, @CurrentUser() user:SafeUser, @Param('productId') productId: string){
        return this.cartService.updateCart(user.id, productId, dto)
    } 

    @Delete(':productId')
    async deleteCart(@CurrentUser() user:SafeUser, @Param('productId') productId: string){
        return this.cartService.deleteCart(user.id, productId)
    }

    @Get()
    async getCartItem(@CurrentUser() user:SafeUser){
        return this.cartService.getCart(user.id)
    }

}
