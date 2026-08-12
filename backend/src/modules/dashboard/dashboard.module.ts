import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionPayment } from '../transactions/entities/transaction-payment.entity';
import { Order } from '../orders/entities/order.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, TransactionPayment, Order, DiningTable]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
