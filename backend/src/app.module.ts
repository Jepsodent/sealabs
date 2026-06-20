import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule, ReviewsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
