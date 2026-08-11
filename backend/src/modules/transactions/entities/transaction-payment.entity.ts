import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum TransactionPaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('transaction_payments')
export class TransactionPayment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_id', type: 'char', length: 36 })
  transactionId!: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Transaction;

  @Column({ name: 'payment_method_id', type: 'char', length: 36 })
  paymentMethodId!: string;

  @Column({ name: 'payment_method_name', type: 'varchar', length: 100 })
  paymentMethodName!: string;

  @Column({ name: 'payment_type', type: 'varchar', length: 50 })
  paymentType!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  amount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ name: 'change_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  changeAmount!: number;

  @Column({ name: 'reference_number', type: 'varchar', length: 100, nullable: true })
  referenceNumber!: string | null;

  @Column({ name: 'card_number', type: 'varchar', length: 20, nullable: true })
  cardNumber!: string | null;

  @Column({ name: 'card_holder', type: 'varchar', length: 100, nullable: true })
  cardHolder!: string | null;

  @Column({
    type: 'enum',
    enum: TransactionPaymentStatus,
    default: TransactionPaymentStatus.PENDING,
  })
  status!: TransactionPaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
