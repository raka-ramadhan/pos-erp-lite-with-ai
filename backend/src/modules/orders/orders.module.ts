import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemModifier } from './entities/order-item-modifier.entity';
import { Tax } from '../taxes/entities/tax.entity';
import { Discount } from '../discounts/entities/discount.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, OrderItemModifier, Tax, Discount, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
