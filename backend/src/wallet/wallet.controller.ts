import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TopUpDto } from './dto/top-up.dto';
import { WalletService } from './wallet.service';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { type SafeUser } from 'src/auth/types/User';

@Controller('wallet')
@UseGuards(JwtAuthGuard, RoleGuard)
@CurrentRole(Role.BUYER)
export class WalletController {
    constructor(private readonly walletService: WalletService){}
    @Post('top-up')
    async topUp(@CurrentUser() user:SafeUser, @Body() dto:TopUpDto){
        return this.walletService.topUp(user.id, dto)
    }

    @Get('transactions')
    async getTransactionHistory(@CurrentUser() user:SafeUser){
        return this.walletService.getTransactionHistory(user.id)
    }
    @Get()
    async getWalletBalance(@CurrentUser() user:SafeUser){
        return this.walletService.getWalletBalance(user.id)
    }

}
