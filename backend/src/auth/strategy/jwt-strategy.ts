import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Role } from "@prisma/client";
import { ExtractJwt, Strategy } from "passport-jwt";
import { SafeUser } from "src/auth/types/User";
import { AppConfigService } from "src/config/config.service";
import { PrismaService } from "src/prisma/prisma.service";




@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private readonly config: AppConfigService, private readonly prisma: PrismaService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.jwtAccessSecret,
        })
    }


    async validate(payload: {sub: string, username: string, roles: Role[]} ): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({
            where: {username: payload.username}
        })

        if(!user){
            throw new UnauthorizedException('User not found!')
        }
        const {passwordHash, ...result} = user
        return result 
    }
}