import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateStoreDto } from './dto/create-store.dto';
import { StoresService } from './stores.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';
import { EditStoreDto } from './dto/edit-store.dto';

@Controller('stores')

export class StoresController {
    constructor(private readonly storeService: StoresService){}
    
    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @Post()
    async createStore(@Body() dto:CreateStoreDto, @CurrentUser() user: SafeUser){
        return this.storeService.createStore(dto, user.id)
    }
    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @Get('/my-store')
    async getMyStore(@CurrentUser() user:SafeUser){
        return this.storeService.getMyStore(user.id)
    }
    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    @Patch('/my-store')
    async updateMyStore (@Body() dto: EditStoreDto, @CurrentUser() user:SafeUser ){
        return this.storeService.updateMyStore(dto, user.id)
    }
    // public endpoints
    @Get(':id')
    async getDetailStore(@Param('id') storeId: string){
        return this.storeService.getDetailStore(storeId)
    }
}
