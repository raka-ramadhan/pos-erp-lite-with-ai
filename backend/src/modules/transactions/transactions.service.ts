import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Transaction, TransactionOrderType, DiscountType as TransactionDiscountType } from './entities/transaction.entity';
import { TransactionItem } from './entities/transaction-item.entity';
import { TransactionItemModifier } from './entities/transaction-item-modifier.entity';
import { TransactionPayment, TransactionPaymentStatus } from './entities/transaction-payment.entity';
import { Order, OrderType } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderItemModifier } from '../orders/entities/order-item-modifier.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { Discount, DiscountType } from '../discounts/entities/discount.entity';
import { Tax } from '../taxes/entities/tax.entity';
import { User } from '../auth/entities/user.entity';
import {
  TransactionListQueryDto,
  TransactionDetailDto,
  PaginatedTransactionDto,
  TransactionSummaryDto,
  TransactionItemDto,
  TransactionPaymentDto,
  DiscountInfoDto,
  TaxInfoDto,
} from './dto';

/**
 * Service for managing POS transaction history
 * Handles snapshot creation from orders and transaction retrieval
 */
@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionItem)
    private readonly transactionItemRepository: Repository<TransactionItem>,
    @InjectRepository(TransactionItemModifier)
    private readonly transactionItemModifierRepository: Repository<TransactionItemModifier>,
    @InjectRepository(TransactionPayment)
    private readonly transactionPaymentRepository: Repository<TransactionPayment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Listen for payment completed events to create transaction snapshots
    this.eventEmitter.on('payment.completed', async (data: { orderId: string; paymentId: string }) => {
      try {
        this.logger.log(`Received payment.completed event for order ${data.orderId}`);
        await this.createSnapshotFromOrder(data.orderId);
        this.logger.log(`Transaction snapshot created for order ${data.orderId}`);
      } catch (error) {
        this.logger.error(`Failed to create transaction snapshot for order ${data.orderId}`, error);
      }
    });
  }

  /**
   * Generate unique transaction number with format: TRX-YYYYMMDD-XXXXXX
   * Uses pessimistic lock for concurrency safety
   */
  async generateTransactionNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TRX-${dateStr}-`;

    return this.dataSource.transaction(async (manager) => {
      // Get the latest transaction number for today with row lock
      const latestTransaction = await manager
        .createQueryBuilder(Transaction, 'transaction')
        .where('transaction.transactionNumber LIKE :prefix', { prefix: `${prefix}%` })
        .setLock('pessimistic_write')
        .orderBy('transaction.transactionNumber', 'DESC')
        .getOne();

      let sequence = 1;
      if (latestTransaction) {
        // Extract sequence number from latest transaction
        const lastSequence = parseInt(
          latestTransaction.transactionNumber.split('-')[2],
          10,
        );
        sequence = lastSequence + 1;
      }

      // Format: TRX-YYYYMMDD-XXXXXX (6 digit sequence)
      return `${prefix}${sequence.toString().padStart(6, '0')}`;
    });
  }

  /**
   * Create transaction snapshot from completed order
   * Uses DataSource.transaction for atomic operation
   */
  async createSnapshotFromOrder(orderId: string): Promise<Transaction> {
    // Check if transaction already exists for this order
    const existingTransaction = await this.transactionRepository.findOne({
      where: { orderId },
    });

    if (existingTransaction) {
      this.logger.warn(`Transaction already exists for order ${orderId}: ${existingTransaction.transactionNumber}`);
      return existingTransaction;
    }

    // Use transaction for atomic snapshot creation
    return this.dataSource.transaction(async (manager) => {
      // 1. Fetch order with table relation
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: { table: true },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      // 2. Fetch order items with modifiers and product
      const orderItems = await manager.find(OrderItem, {
        where: { orderId },
        relations: { modifiers: true, product: true },
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });

      // 3. Fetch completed payment with payment method
      const payment = await manager.findOne(Payment, {
        where: {
          orderId,
          status: PaymentStatus.COMPLETED,
        },
        relations: { paymentMethod: true },
      });

      // 4. Get cashier name from User
      let cashierName: string | null = null;
      if (order.createdBy) {
        const cashier = await manager.findOne(User, {
          where: { id: order.createdBy },
        });
        cashierName = cashier?.name || null;
      }

      // 5. Get discount info if applied
      let discountInfo: {
        discountId: string | null;
        discountName: string | null;
        discountType: TransactionDiscountType | null;
        discountValue: number | null;
        discountAmount: number;
      } | null = null;

      if (order.discountAmount > 0) {
        // Find the applied discount by name (simplified - in real app might store discount_id on order)
        const discounts = await manager.find(Discount, {
          where: { isActive: true },
        });

        // Match by discount amount approximation
        const appliedDiscount = discounts.find(d => {
          const discountValue = Number(d.value);
          const discountAmount = Number(order.discountAmount);
          if (d.discountType === DiscountType.PERCENTAGE) {
            const calculatedDiscount = Number(order.subtotal) * (discountValue / 100);
            return Math.abs(calculatedDiscount - discountAmount) < 0.01;
          } else {
            return Math.abs(discountValue - discountAmount) < 0.01;
          }
        });

        if (appliedDiscount) {
          discountInfo = {
            discountId: appliedDiscount.id,
            discountName: appliedDiscount.name,
            discountType: appliedDiscount.discountType === DiscountType.PERCENTAGE
              ? TransactionDiscountType.PERCENTAGE
              : TransactionDiscountType.FIXED,
            discountValue: Number(appliedDiscount.value),
            discountAmount: Number(order.discountAmount),
          };
        } else {
          discountInfo = {
            discountId: null,
            discountName: null,
            discountType: null,
            discountValue: null,
            discountAmount: Number(order.discountAmount),
          };
        }
      }

      // 6. Get tax info
      const activeTaxes = await manager.find(Tax, {
        where: { isActive: true },
        order: { calculationOrder: 'ASC' },
      });

      let taxInfo: {
        taxId: string | null;
        taxName: string | null;
        taxRate: number | null;
        taxAmount: number;
      } | null = null;

      if (activeTaxes.length > 0 && Number(order.taxAmount) > 0) {
        // Use the first active tax as primary tax
        const primaryTax = activeTaxes[0];
        taxInfo = {
          taxId: primaryTax.id,
          taxName: primaryTax.name,
          taxRate: Number(primaryTax.rate),
          taxAmount: Number(order.taxAmount),
        };
      } else {
        taxInfo = {
          taxId: null,
          taxName: null,
          taxRate: null,
          taxAmount: Number(order.taxAmount),
        };
      }

      // 7. Generate transaction number
      const transactionNumber = await this.generateTransactionNumberInTransaction(manager);

      // 8. Create transaction record
      const transaction = manager.create(Transaction, {
        transactionNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderType: this.mapOrderTypeToTransactionOrderType(order.orderType),
        tableId: order.tableId,
        tableCode: order.table?.tableCode || null,
        tableName: order.table?.tableName || null,
        cashierId: order.createdBy,
        cashierName,
        subtotal: Number(order.subtotal),
        discountId: discountInfo?.discountId || null,
        discountName: discountInfo?.discountName || null,
        discountType: discountInfo?.discountType || null,
        discountValue: discountInfo?.discountValue || null,
        discountAmount: discountInfo?.discountAmount || 0,
        taxId: taxInfo?.taxId || null,
        taxName: taxInfo?.taxName || null,
        taxRate: taxInfo?.taxRate || null,
        taxAmount: taxInfo?.taxAmount || 0,
        totalAmount: Number(order.totalAmount),
        notes: order.notes,
        orderedAt: order.orderedAt,
        completedAt: order.completedAt || new Date(),
      });

      const savedTransaction = await manager.save(transaction);

      // 9. Create transaction items with modifiers
      for (const orderItem of orderItems) {
        const transactionItem = manager.create(TransactionItem, {
          transactionId: savedTransaction.id,
          productId: orderItem.productId,
          productName: orderItem.product?.name || 'Unknown Product',
          variantName: orderItem.variantName,
          quantity: Number(orderItem.quantity),
          unitPrice: Number(orderItem.unitPrice),
          subtotal: Number(orderItem.subtotal),
          notes: orderItem.notes,
          sortOrder: orderItem.sortOrder,
        });

        const savedItem = await manager.save(transactionItem);

        // Create item modifiers
        for (const modifier of orderItem.modifiers || []) {
          const transactionModifier = manager.create(TransactionItemModifier, {
            transactionItemId: savedItem.id,
            modifierId: modifier.modifierId,
            modifierName: modifier.modifierName,
            quantity: modifier.quantity,
            unitPrice: Number(modifier.unitPrice),
            totalAmount: Number(modifier.totalAmount),
          });
          await manager.save(transactionModifier);
        }
      }

      // 10. Create transaction payment record
      if (payment && payment.paymentMethod) {
        const transactionPayment = manager.create(TransactionPayment, {
          transactionId: savedTransaction.id,
          paymentMethodId: payment.paymentMethodId,
          paymentMethodName: payment.paymentMethod.name,
          paymentType: payment.paymentType,
          provider: payment.provider,
          amount: Number(payment.amount),
          totalAmount: Number(payment.totalAmount),
          changeAmount: Number(payment.changeAmount),
          referenceNumber: payment.referenceNumber,
          cardNumber: payment.cardNumber,
          cardHolder: payment.cardHolder,
          status: TransactionPaymentStatus.COMPLETED,
          paidAt: payment.createdAt,
        });
        await manager.save(transactionPayment);
      }

      this.logger.log(`Created transaction ${savedTransaction.transactionNumber} for order ${order.orderNumber}`);
      return savedTransaction;
    });
  }

  /**
   * Generate transaction number within a transaction manager context
   */
  private async generateTransactionNumberInTransaction(manager: any): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `TRX-${dateStr}-`;

    // Get the latest transaction number for today with row lock
    const latestTransaction = await manager
      .createQueryBuilder(Transaction, 'transaction')
      .where('transaction.transactionNumber LIKE :prefix', { prefix: `${prefix}%` })
      .setLock('pessimistic_write')
      .orderBy('transaction.transactionNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (latestTransaction) {
      const lastSequence = parseInt(
        latestTransaction.transactionNumber.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }

  /**
   * Map OrderType to TransactionOrderType
   */
  private mapOrderTypeToTransactionOrderType(orderType: OrderType): TransactionOrderType {
    switch (orderType) {
      case OrderType.DINE_IN:
        return TransactionOrderType.DINE_IN;
      case OrderType.TAKE_AWAY:
        return TransactionOrderType.TAKE_AWAY;
      case OrderType.DELIVERY:
        return TransactionOrderType.DELIVERY;
      default:
        return TransactionOrderType.TAKE_AWAY;
    }
  }

  /**
   * Find all transactions with pagination and filters
   */
  async findAll(query: TransactionListQueryDto): Promise<PaginatedTransactionDto> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.items', 'items')
      .leftJoinAndSelect('transaction.payments', 'payments');

    // Search by transaction number or order number
    if (query.search) {
      qb.andWhere(
        '(transaction.transactionNumber LIKE :search OR transaction.orderNumber LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Date range filter
    if (query.dateFrom) {
      qb.andWhere('transaction.completedAt >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('transaction.completedAt <= :dateTo', { dateTo: query.dateTo });
    }

    // Order type filter
    if (query.orderType) {
      qb.andWhere('transaction.orderType = :orderType', { orderType: query.orderType });
    }

    // Get total count
    const total = await qb.getCount();

    // Get paginated results
    const transactions = await qb
      .orderBy('transaction.completedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getMany();

    // Map to summary DTOs
    const data = transactions.map((t) => this.mapToSummaryDto(t));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find single transaction by ID with full details
   */
  async findOne(id: string): Promise<TransactionDetailDto> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: {
        items: {
          modifiers: true,
        },
        payments: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    // Sort items and modifiers
    if (transaction.items) {
      transaction.items.sort((a, b) => a.sortOrder - b.sortOrder);
      for (const item of transaction.items) {
        if (item.modifiers) {
          item.modifiers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
      }
    }

    return this.mapToDetailDto(transaction);
  }

  /**
   * Get receipt data for a transaction
   * Same as findOne but could be extended for receipt-specific formatting
   */
  async getReceipt(id: string): Promise<TransactionDetailDto> {
    return this.findOne(id);
  }

  /**
   * Check if transaction exists for an order
   */
  async hasTransactionForOrder(orderId: string): Promise<boolean> {
    const transaction = await this.transactionRepository.findOne({
      where: { orderId },
    });
    return !!transaction;
  }

  /**
   * Map Transaction entity to TransactionSummaryDto
   */
  private mapToSummaryDto(transaction: Transaction): TransactionSummaryDto {
    const itemCount = transaction.items?.length || 0;
    const hasPayment = transaction.payments?.some(p => p.status === TransactionPaymentStatus.COMPLETED);

    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      orderType: transaction.orderType,
      tableCode: transaction.tableCode,
      tableName: transaction.tableName,
      cashierName: transaction.cashierName,
      subtotal: Number(transaction.subtotal),
      discountAmount: Number(transaction.discountAmount),
      taxAmount: Number(transaction.taxAmount),
      totalAmount: Number(transaction.totalAmount),
      orderedAt: transaction.orderedAt,
      completedAt: transaction.completedAt,
      itemCount,
      paymentStatus: hasPayment ? 'paid' : 'unpaid',
    };
  }

  /**
   * Map Transaction entity to TransactionDetailDto
   */
  private mapToDetailDto(transaction: Transaction): TransactionDetailDto {
    // Map discount info
    const discount: DiscountInfoDto = {
      discountId: transaction.discountId,
      discountName: transaction.discountName,
      discountType: transaction.discountType,
      discountValue: transaction.discountValue,
      discountAmount: Number(transaction.discountAmount),
    };

    // Map tax info
    const tax: TaxInfoDto = {
      taxId: transaction.taxId,
      taxName: transaction.taxName,
      taxRate: transaction.taxRate,
      taxAmount: Number(transaction.taxAmount),
    };

    // Map items
    const items: TransactionItemDto[] = (transaction.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      variantName: item.variantName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      notes: item.notes,
      sortOrder: item.sortOrder,
      modifiers: (item.modifiers || []).map((mod) => ({
        id: mod.id,
        modifierId: mod.modifierId,
        modifierName: mod.modifierName,
        quantity: mod.quantity,
        unitPrice: Number(mod.unitPrice),
        totalAmount: Number(mod.totalAmount),
      })),
    }));

    // Map payments
    const payments: TransactionPaymentDto[] = (transaction.payments || []).map((p) => ({
      id: p.id,
      paymentMethodId: p.paymentMethodId,
      paymentMethodName: p.paymentMethodName,
      paymentType: p.paymentType,
      provider: p.provider,
      amount: Number(p.amount),
      totalAmount: Number(p.totalAmount),
      changeAmount: Number(p.changeAmount),
      referenceNumber: p.referenceNumber,
      cardNumber: p.cardNumber,
      cardHolder: p.cardHolder,
      status: p.status,
      paidAt: p.paidAt,
    }));

    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      orderId: transaction.orderId,
      orderNumber: transaction.orderNumber,
      orderType: transaction.orderType,
      tableId: transaction.tableId,
      tableCode: transaction.tableCode,
      tableName: transaction.tableName,
      cashierId: transaction.cashierId,
      cashierName: transaction.cashierName,
      subtotal: Number(transaction.subtotal),
      discount,
      tax,
      totalAmount: Number(transaction.totalAmount),
      notes: transaction.notes,
      orderedAt: transaction.orderedAt,
      completedAt: transaction.completedAt,
      items,
      payments,
    };
  }
}
