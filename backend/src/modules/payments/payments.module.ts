import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Order } from '../orders/entities/order.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Order, PaymentMethod])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
