import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AddressesService } from './addresses.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RoleGuard)
@CurrentRole(Role.BUYER)
export class AddressesController {
    constructor(private readonly addressService: AddressesService){}
    
    @Post()
    async createAddress(@CurrentUser() user: SafeUser, @Body() dto: CreateAddressDto){
        return this.addressService.createAddress(user.id, dto)
    }

    @Get()
    async getAddress(@CurrentUser() user:SafeUser){
        return this.addressService.getAddress(user.id)
    }

    @Put(':id')
    async updateAddress(@CurrentUser() user:SafeUser, @Param('id') addressId: string, @Body() dto: UpdateAddressDto){
        return this.addressService.editAddress(user.id, addressId, dto)
    }

    @Delete(':id')
    async deleteAddress(@CurrentUser() user:SafeUser, @Param('id') addressId: string){
        return this.addressService.deleteAddress(user.id, addressId)
    }

}
