import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity('order_item_modifiers')
export class OrderItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_item_id', type: 'varchar', length: 36 })
  orderItemId!: string;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem!: OrderItem;

  @Column({ name: 'modifier_id', type: 'varchar', length: 36 })
  modifierId!: string;

  @Column({ name: 'modifier_name', type: 'varchar', length: 100 })
  modifierName!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
