import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { CurrentUser } from 'src/auth/decorator/current-user.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { type SafeUser } from 'src/auth/types/User';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ReportsController {
    constructor (private readonly reportService: ReportsService){}

    @CurrentRole(Role.BUYER)
    @Get('buyer')
    async getReportBuyer(@CurrentUser() user:SafeUser){
        return this.reportService.getBuyerReport(user.id)
    }
    @CurrentRole(Role.SELLER)
    @Get('seller')
    async getReportSeller(@CurrentUser() user:SafeUser){
        return this.reportService.getSellerReport(user.id)
    }
}
