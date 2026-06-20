import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule, ReviewsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
