import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { Role } from '@prisma/client';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService){}
    // public endpoints
    @Get()
    async getProduct(){
        return this.productService.getProduct()
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @ApiBearerAuth()
    @Get("my-products")
    async getMyProduct(@CurrentUser() user:SafeUser){
        return this.productService.getMyProduct(user.id)
    }

    // public endpoints
    @Get(':id')
    async getProductById(@Param('id') id: string){
        return this.productService.getProductById(id)
    }

    // role seller endpoints
    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @ApiBearerAuth()
    @Post()
    async createProduct(@CurrentUser() user:SafeUser, @Body() dto:CreateProductDto){
        return this.productService.createProduct(user.id, dto)
    }
    

    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @ApiBearerAuth()
    @Put(':id')
    async updateMyProduct(@CurrentUser() user:SafeUser, @Param('id') productId: string, @Body() dto:UpdateProductDto ){
        return this.productService.updateProduct(user.id,productId, dto)
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @ApiBearerAuth()
    @Delete(":id")
    async deleteMyProduct(@CurrentUser() user:SafeUser, @Param('id') productId:string){
        return this.productService.deleteProduct(user.id, productId)
    }

}
