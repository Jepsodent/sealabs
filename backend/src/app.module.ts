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
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule, ReviewsModule, ProductsModule, StoresModule, WalletModule, AddressesModule, CartModule, OrdersModule, DiscountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
