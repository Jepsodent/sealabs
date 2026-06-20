import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { Request } from "express";
import { SafeUser } from "../types/User";



@Injectable()
export class RoleGuard implements CanActivate { 
    constructor(private reflector: Reflector){ }

    canActivate(context: ExecutionContext):boolean{
        const requiredRole = this.reflector.getAllAndOverride<Role[]>("allowed_roles", [
            context.getHandler(),
            context.getClass(),
        ])
        if (!requiredRole){
            return true
        }
        const user = context.switchToHttp().getRequest<Request>().user as SafeUser
        if(!user || !user.activeRole){
            throw new ForbiddenException('Akses ditolak. User tidak memiliki role aktif!')
        }
        
        const hasRole = requiredRole.includes(user.activeRole)
        if(!hasRole){
            throw new ForbiddenException('Akses ditolak. Role anda tidak memiliki izin!')
        }
        return true
    }
}