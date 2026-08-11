import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { TransactionItemModifier } from './entities/transaction-item-modifier.entity';
import { TransactionPayment } from './entities/transaction-payment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderItemModifier } from '../orders/entities/order-item-modifier.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Discount } from '../discounts/entities/discount.entity';
import { Tax } from '../taxes/entities/tax.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionItem,
      TransactionItemModifier,
      TransactionPayment,
      Order,
      OrderItem,
      OrderItemModifier,
      Payment,
      PaymentMethod,
      Discount,
      Tax,
      User,
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
