import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { TransactionItem } from './transaction-item.entity';
import { TransactionPayment } from './transaction-payment.entity';

export enum TransactionOrderType {
  DINE_IN = 'dine_in',
  TAKE_AWAY = 'take_away',
  DELIVERY = 'delivery',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_number', type: 'varchar', length: 50 })
  transactionNumber!: string;

  @Column({ name: 'order_id', type: 'char', length: 36, nullable: true })
  orderId!: string | null;

  @Column({ name: 'order_number', type: 'varchar', length: 50, nullable: true })
  orderNumber!: string | null;

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: TransactionOrderType,
    default: TransactionOrderType.DINE_IN,
  })
  orderType!: TransactionOrderType;

  @Column({ name: 'table_id', type: 'char', length: 36, nullable: true })
  tableId!: string | null;

  @Column({ name: 'table_code', type: 'varchar', length: 20, nullable: true })
  tableCode!: string | null;

  @Column({ name: 'table_name', type: 'varchar', length: 50, nullable: true })
  tableName!: string | null;

  @Column({ name: 'cashier_id', type: 'char', length: 36, nullable: true })
  cashierId!: string | null;

  @Column({ name: 'cashier_name', type: 'varchar', length: 100, nullable: true })
  cashierName!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ name: 'discount_id', type: 'char', length: 36, nullable: true })
  discountId!: string | null;

  @Column({ name: 'discount_name', type: 'varchar', length: 100, nullable: true })
  discountName!: string | null;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: DiscountType,
    nullable: true,
  })
  discountType!: DiscountType | null;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountValue!: number | null;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'tax_id', type: 'char', length: 36, nullable: true })
  taxId!: string | null;

  @Column({ name: 'tax_name', type: 'varchar', length: 100, nullable: true })
  taxName!: string | null;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  taxRate!: number | null;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'ordered_at', type: 'timestamp' })
  orderedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TransactionItem, (item) => item.transaction, { cascade: true })
  items!: TransactionItem[];

  @OneToMany(() => TransactionPayment, (payment) => payment.transaction, { cascade: true })
  payments!: TransactionPayment[];
}
