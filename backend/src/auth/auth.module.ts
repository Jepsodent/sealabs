import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from "@nestjs/jwt"
import { AppConfigService } from 'src/config/config.service';
import { ConfigModule } from 'src/config/config.module';
import { JwtStrategy } from './strategy/jwt-strategy';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [AppConfigService],
    useFactory: (appConfig: AppConfigService) => ({
      secret: appConfig.jwtAccessSecret,
      signOptions: {expiresIn: '1d'}
    })
  }) ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
