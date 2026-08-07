import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DiningTable } from '../../dining-tables/entities/dining-table.entity';

export enum OrderType {
  DINE_IN = 'dine_in',
  TAKE_AWAY = 'take_away',
  DELIVERY = 'delivery',
}

export enum OrderStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_number', type: 'varchar', length: 20, unique: true })
  orderNumber!: string;

  @Column({ name: 'outlet_id', type: 'varchar', length: 36, nullable: true })
  outletId!: string | null;

  @Column({ name: 'customer_id', type: 'varchar', length: 36, nullable: true })
  customerId!: string | null;

  @Column({ name: 'table_id', type: 'varchar', length: 36, nullable: true })
  tableId!: string | null;

  @ManyToOne(() => DiningTable, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table?: DiningTable;

  @Column({
    name: 'order_type',
    type: 'enum',
    enum: OrderType,
    default: OrderType.DINE_IN,
  })
  orderType!: OrderType;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.OPEN,
  })
  orderStatus!: OrderStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  discountAmount!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @Column({ name: 'total_paid', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaid!: number;

  @Column({ name: 'change_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  changeAmount!: number;

  @Column({ name: 'customer_count', type: 'int', default: 1 })
  customerCount!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes!: string | null;

  @Column({ name: 'ordered_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  orderedAt!: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt!: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt!: Date | null;

  @Column({ name: 'cancelled_reason', type: 'text', nullable: true })
  cancelledReason!: string | null;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 36, nullable: true })
  updatedBy!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt!: Date | null;
}
