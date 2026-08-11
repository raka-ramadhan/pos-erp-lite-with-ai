import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'payment_method_id', type: 'varchar', length: 36 })
  paymentMethodId!: string;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ name: 'change_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  changeAmount!: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber!: string | null;

  @Column({ name: 'card_number', type: 'varchar', length: 20, nullable: true })
  cardNumber!: string | null;

  @Column({ name: 'card_holder', type: 'varchar', length: 100, nullable: true })
  cardHolder!: string | null;

  @Column({ name: 'payment_type', type: 'varchar', length: 20 })
  paymentType!: string;

  @Column({ name: 'provider', type: 'varchar', length: 50, nullable: true })
  provider!: string | null;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
