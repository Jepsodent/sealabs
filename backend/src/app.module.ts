import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import { WalletModule } from './wallet/wallet.module';
import { AddressesModule } from './addresses/addresses.module';

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule, ReviewsModule, ProductsModule, StoresModule, WalletModule, AddressesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
