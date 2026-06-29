import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentRole } from 'src/auth/decorator/current-role.decorator';
import { RoleGuard } from 'src/auth/guards/active-role.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateTimeDto } from './dto/update-time.dto';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard,RoleGuard)
@CurrentRole(Role.ADMIN)
export class AdminController {
    constructor(private readonly adminService:AdminService){}
    
    @Get('system-time')
    async getSystemTime(){
        return this.adminService.getSystemTime()
    }
    
    @Post('advance-time')
    async updateTime(@Body() dto:UpdateTimeDto){
        return this.adminService.updateTime(dto)
    }
}
