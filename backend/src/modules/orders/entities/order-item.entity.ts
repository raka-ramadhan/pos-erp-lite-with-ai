import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { OrderItemModifier } from './order-item-modifier.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'variant_name', type: 'varchar', length: 100, nullable: true })
  variantName!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @OneToMany(() => OrderItemModifier, (modifier) => modifier.orderItem, { cascade: true })
  modifiers!: OrderItemModifier[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
