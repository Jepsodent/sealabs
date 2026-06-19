import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import { updateActiveRoleDto } from './dto/update-active-role.dto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService){}

    async register(dto: RegisterDto){
        const existedUser = await this.prisma.user.findUnique({
            where: {
                username: dto.username
            }
        })
        if(existedUser){
            throw new ConflictException("User sudah terdaftar, mohon login!")
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10) 

        const result = await this.prisma.user.create({
            data: {
                username: dto.username,
                passwordHash: hashedPassword, 
                roles: dto.roles,
            }
        })

        const {passwordHash, ...user} = result
        return user
    }

    async login(dto: LoginDto){
        const existedUser = await this.prisma.user.findUnique({
            where:{username: dto.username}
        })
        if(!existedUser){
            throw new UnauthorizedException("Username atau Password salah")
        }
        
        const checkPassword = await bcrypt.compare(dto.password, existedUser.passwordHash)
        if (!checkPassword){
            throw new UnauthorizedException("Username atau Password salah")
        }

        const payload = {
            sub: existedUser.id,
            username: existedUser.username,
            roles: existedUser.roles
        }
        const token = await this.jwt.signAsync(payload)
        return { 
            accessToken: token,
            data: payload
        }
    }

    async updateActiveRole(userId:string, dto:updateActiveRoleDto){
        const user = await this.prisma.user.findUnique({
            where: {id: userId}
        })
        // udah pasti ada user karena ada useGuards jwt 
        if(!user){
            throw new UnauthorizedException("User not found!")
        }   
        const checkRole = user.roles.includes(dto.activeRole)
        if(!checkRole){
            throw new BadRequestException('Anda tidak memiliki akses ke role ini!')
        } 
        const result = await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                activeRole: dto.activeRole
            }
        })
        const {passwordHash, ...updatedUser} = result
        return updatedUser;
    }
    

    

}
