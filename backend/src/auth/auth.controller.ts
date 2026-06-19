import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorator/current-user.decorator';
import { type SafeUser } from './types/User';
import { updateActiveRoleDto } from './dto/update-active-role.dto';
import { RoleGuard } from './guards/active-role.guard';
import { CurrentRole } from './decorator/current-role.decorator';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}
    
    @Post("register")
    async register(@Body() dto: RegisterDto){
        return this.authService.register(dto)
    }

    @Post("login")
    async login(@Body() dto:LoginDto){
        return this.authService.login(dto)
    }

    @Get("me")
    @UseGuards(JwtAuthGuard)
    profile(@CurrentUser() user:SafeUser){  
        return user
    }

    @Patch('active-role')
    @UseGuards(JwtAuthGuard)
    async updateRole(@CurrentUser() user:SafeUser, @Body() dto:updateActiveRoleDto){
        return this.authService.updateActiveRole(user.id, dto)
    }

    @Get('penjual-bodong')
    @UseGuards(JwtAuthGuard, RoleGuard)
    @CurrentRole(Role.SELLER)
    sellerOnly(){
        return 'Ini cuma bisa diakses penjual'
    }
}
