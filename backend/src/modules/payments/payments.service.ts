import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { CreatePaymentDto } from './dto';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

export interface PaymentResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  paymentMethodId: string;
  paymentMethodName: string;
  paymentType: string;
  amount: number;
  totalAmount: number;
  changeAmount: number;
  referenceNumber: string | null;
  cardNumber: string | null;
  cardHolder: string | null;
  status: PaymentStatus;
  createdAt: Date;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create payment for an order with atomic transaction
   * This creates payment AND updates order status in one transaction
   */
  async createPayment(
    createDto: CreatePaymentDto,
    userId?: string,
  ): Promise<PaymentResponse> {
    // Use transaction for atomic operation
    return await this.dataSource.transaction(async (manager) => {
      // 1. Load and validate Order
      const order = await manager.findOne(Order, {
        where: { id: createDto.orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${createDto.orderId} not found`);
      }

      // 2. Validate order status - must be OPEN or IN_PROGRESS
      if (order.orderStatus === OrderStatus.COMPLETED) {
        throw new ConflictException('Order is already completed');
      }

      if (order.orderStatus === OrderStatus.CANCELLED) {
        throw new ConflictException('Order is cancelled');
      }

      // 3. Check if order has items
      const items = await manager
        .createQueryBuilder()
        .from('order_items', 'item')
        .where('item.order_id = :orderId', { orderId: createDto.orderId })
        .getRawOne();

      // 4. Validate Payment Method
      const paymentMethod = await manager.findOne(PaymentMethod, {
        where: { id: createDto.paymentMethodId },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      if (!paymentMethod.isActive) {
        throw new BadRequestException('Payment method is not active');
      }

      // 5. Validate amount
      const totalAmount = Number(order.totalAmount);
      const paidAmount = Number(createDto.amount);

      // For cash payment, validate amount paid >= total
      if (paymentMethod.paymentType === 'cash') {
        if (paidAmount < totalAmount) {
          throw new BadRequestException(
            `Amount paid (${paidAmount}) is less than total amount (${totalAmount})`,
          );
        }
      }

      // 6. Check for existing completed payment (duplicate protection)
      const existingPayment = await manager.findOne(Payment, {
        where: {
          orderId: createDto.orderId,
          status: PaymentStatus.COMPLETED,
        },
      });

      if (existingPayment) {
        throw new ConflictException('Order is already paid');
      }

      // 7. Create Payment record
      const payment = manager.create(Payment, {
        orderId: order.id,
        paymentMethodId: paymentMethod.id,
        amount: paidAmount,
        totalAmount: totalAmount,
        changeAmount: createDto.changeAmount || 0,
        status: PaymentStatus.COMPLETED,
        referenceNumber: createDto.referenceNumber || null,
        cardNumber: createDto.cardNumber || null,
        cardHolder: createDto.cardHolder || null,
        paymentType: paymentMethod.paymentType,
        provider: paymentMethod.provider,
        createdBy: userId || null,
      });

      const savedPayment = await manager.save(payment);

      // 8. Update Order status to COMPLETED
      await manager.update(Order, order.id, {
        orderStatus: OrderStatus.COMPLETED,
        totalPaid: paidAmount,
        changeAmount: createDto.changeAmount || 0,
        completedAt: new Date(),
      });

      // 9. Emit payment completed event for transaction snapshot creation
      this.eventEmitter.emit('payment.completed', {
        orderId: order.id,
        paymentId: savedPayment.id,
      });
      this.logger.log(`Payment completed for order ${order.orderNumber}, event emitted`);

      // Return payment response with related data
      return {
        id: savedPayment.id,
        orderId: savedPayment.orderId,
        orderNumber: order.orderNumber,
        paymentMethodId: savedPayment.paymentMethodId,
        paymentMethodName: paymentMethod.name,
        paymentType: savedPayment.paymentType,
        amount: Number(savedPayment.amount),
        totalAmount: Number(savedPayment.totalAmount),
        changeAmount: Number(savedPayment.changeAmount),
        referenceNumber: savedPayment.referenceNumber,
        cardNumber: savedPayment.cardNumber,
        cardHolder: savedPayment.cardHolder,
        status: savedPayment.status,
        createdAt: savedPayment.createdAt,
      };
    });
  }

  /**
   * Find payment by ID
   */
  async findOne(id: string): Promise<PaymentResponse> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: { paymentMethod: true, order: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return this.toPaymentResponse(payment);
  }

  /**
   * Find payments for an order
   */
  async findByOrder(orderId: string): Promise<PaymentResponse[]> {
    const payments = await this.paymentRepository.find({
      where: { orderId },
      relations: { paymentMethod: true },
      order: { createdAt: 'DESC' },
    });

    return payments.map((p) => this.toPaymentResponse(p));
  }

  /**
   * Check if order is paid
   */
  async isOrderPaid(orderId: string): Promise<boolean> {
    const payment = await this.paymentRepository.findOne({
      where: {
        orderId,
        status: PaymentStatus.COMPLETED,
      },
    });
    return !!payment;
  }

  private toPaymentResponse(payment: Payment): PaymentResponse {
    return {
      id: payment.id,
      orderId: payment.orderId,
      orderNumber: payment.order?.orderNumber || '',
      paymentMethodId: payment.paymentMethodId,
      paymentMethodName: payment.paymentMethod?.name || '',
      paymentType: payment.paymentType,
      amount: Number(payment.amount),
      totalAmount: Number(payment.totalAmount),
      changeAmount: Number(payment.changeAmount),
      referenceNumber: payment.referenceNumber,
      cardNumber: payment.cardNumber,
      cardHolder: payment.cardHolder,
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }
}
