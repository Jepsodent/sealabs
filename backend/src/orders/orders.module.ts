import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { CartModule } from 'src/cart/cart.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [CartModule, WalletModule]
})
export class OrdersModule {}
