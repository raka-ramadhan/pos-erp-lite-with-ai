import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionPayment } from '../transactions/entities/transaction-payment.entity';
import { Order } from '../orders/entities/order.entity';
import { DiningTable } from '../dining-tables/entities/dining-table.entity';
import { DashboardOverviewQueryDto } from './dto/dashboard-overview-query.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(TransactionPayment)
    private paymentRepo: Repository<TransactionPayment>,
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(DiningTable)
    private tableRepo: Repository<DiningTable>,
  ) {}

  async getOverview(query: DashboardOverviewQueryDto) {
    const { startDate, endDate, previousStartDate, previousEndDate } = this.getDateRanges(query.range || 'today');

    const [sales, orders, transactions, activeOrders, orderTypes, paymentMethods, recentTransactions, tableStats, chartData] = await Promise.all([
      this.getSalesMetrics(startDate, endDate, previousStartDate, previousEndDate),
      this.getOrderMetrics(startDate, endDate, previousStartDate, previousEndDate),
      this.getTransactionCount(startDate, endDate),
      this.getActiveOrders(),
      this.getOrderTypeDistribution(startDate, endDate),
      this.getPaymentMethodDistribution(startDate, endDate),
      this.getRecentTransactions(5),
      this.getTableStats(),
      this.getChartData(startDate, endDate),
    ]);

    return {
      sales,
      orders,
      transactions,
      activeOrders,
      orderTypes,
      paymentMethods,
      recentTransactions,
      tableStats,
      chartData,
    };
  }

  private getDateRanges(range: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;
    const endDate = tomorrow;

    switch (range) {
      case '7d':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        break;
      case '30d':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        break;
      default: // today
        startDate = today;
        previousStartDate = yesterday;
        previousEndDate = today;
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
  }

  private async getSalesMetrics(startDate: Date, endDate: Date, prevStart: Date, prevEnd: Date) {
    const current = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.total_amount), 0)', 'value')
      .where('t.completed_at >= :start', { start: startDate.toISOString() })
      .andWhere('t.completed_at < :end', { end: endDate.toISOString() })
      .getRawOne();

    const previous = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.total_amount), 0)', 'value')
      .where('t.completed_at >= :start', { start: prevStart.toISOString() })
      .andWhere('t.completed_at < :end', { end: prevEnd.toISOString() })
      .getRawOne();

    const currentValue = Number(current?.value || 0);
    const previousValue = Number(previous?.value || 0);
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

    return {
      value: currentValue,
      previousValue,
      change: Math.round(change * 100) / 100,
    };
  }

  private async getOrderMetrics(startDate: Date, endDate: Date, prevStart: Date, prevEnd: Date) {
    const current = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'value')
      .where('o.ordered_at >= :start', { start: startDate.toISOString() })
      .andWhere('o.ordered_at < :end', { end: endDate.toISOString() })
      .andWhere('o.deleted_at IS NULL')
      .getRawOne();

    const previous = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'value')
      .where('o.ordered_at >= :start', { start: prevStart.toISOString() })
      .andWhere('o.ordered_at < :end', { end: prevEnd.toISOString() })
      .andWhere('o.deleted_at IS NULL')
      .getRawOne();

    const currentValue = Number(current?.value || 0);
    const previousValue = Number(previous?.value || 0);
    const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;

    return {
      value: currentValue,
      previousValue,
      change: Math.round(change * 100) / 100,
    };
  }

  private async getTransactionCount(startDate: Date, endDate: Date) {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COUNT(*)', 'value')
      .where('t.completed_at >= :start', { start: startDate.toISOString() })
      .andWhere('t.completed_at < :end', { end: endDate.toISOString() })
      .getRawOne();

    return { value: Number(result?.value || 0) };
  }

  private async getActiveOrders() {
    const orders = await this.orderRepo
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.table', 'table')
      .where('o.order_status = :status', { status: 'open' })
      .andWhere('o.deleted_at IS NULL')
      .orderBy('o.ordered_at', 'DESC')
      .limit(10)
      .getMany();

    return {
      count: orders.length,
      items: orders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        orderType: o.orderType,
        tableName: o.table?.tableName || null,
      })),
    };
  }

  private async getOrderTypeDistribution(startDate: Date, endDate: Date) {
    const results = await this.transactionRepo
      .createQueryBuilder('t')
      .select('t.order_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('t.completed_at >= :start', { start: startDate.toISOString() })
      .andWhere('t.completed_at < :end', { end: endDate.toISOString() })
      .groupBy('t.order_type')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + Number(r.count), 0);

    return results.map(r => ({
      type: r.type,
      count: Number(r.count),
      percentage: total > 0 ? Math.round((Number(r.count) / total) * 100) : 0,
    }));
  }

  private async getPaymentMethodDistribution(startDate: Date, endDate: Date) {
    const results = await this.paymentRepo
      .createQueryBuilder('tp')
      .innerJoin('tp.transaction', 't')
      .select('tp.payment_method_name', 'method')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(tp.amount)', 'total')
      .where('t.completed_at >= :start', { start: startDate.toISOString() })
      .andWhere('t.completed_at < :end', { end: endDate.toISOString() })
      .groupBy('tp.payment_method_name')
      .getRawMany();

    const total = results.reduce((sum, r) => sum + Number(r.total), 0);

    return results.map(r => ({
      method: r.method,
      count: Number(r.count),
      total: Number(r.total),
      percentage: total > 0 ? Math.round((Number(r.total) / total) * 100) : 0,
    }));
  }

  private async getRecentTransactions(limit: number) {
    const transactions = await this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.payments', 'p')
      .where('t.completed_at IS NOT NULL')
      .orderBy('t.completed_at', 'DESC')
      .limit(limit)
      .getMany();

    return transactions.map(t => ({
      id: t.id,
      transactionNumber: t.transactionNumber,
      orderType: t.orderType,
      totalAmount: Number(t.totalAmount),
      completedAt: t.completedAt?.toISOString() || null,
      paymentMethod: t.payments?.[0]?.paymentMethodName || 'N/A',
    }));
  }

  private async getTableStats() {
    const total = await this.tableRepo
      .createQueryBuilder('dt')
      .where('dt.is_active = 1')
      .andWhere('dt.deleted_at IS NULL')
      .getCount();

    const occupiedTables = await this.orderRepo
      .createQueryBuilder('o')
      .select('DISTINCT o.table_id', 'tableId')
      .where('o.order_status = :status', { status: 'open' })
      .andWhere('o.table_id IS NOT NULL')
      .andWhere('o.deleted_at IS NULL')
      .getRawMany();

    return {
      total,
      occupied: occupiedTables.length,
      available: total - occupiedTables.length,
    };
  }

  private async getChartData(startDate: Date, endDate: Date) {
    const results = await this.transactionRepo
      .createQueryBuilder('t')
      .select('DATE(t.completed_at)', 'date')
      .addSelect('SUM(t.total_amount)', 'value')
      .where('t.completed_at >= :start', { start: startDate.toISOString() })
      .andWhere('t.completed_at < :end', { end: endDate.toISOString() })
      .groupBy('DATE(t.completed_at)')
      .orderBy('DATE(t.completed_at)', 'ASC')
      .getRawMany();

    return results.map(r => ({
      date: r.date,
      value: Number(r.value),
    }));
  }
}
