import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionItemModifier } from './transaction-item-modifier.entity';

@Entity('transaction_items')
export class TransactionItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_id', type: 'char', length: 36 })
  transactionId!: string;

  @ManyToOne(() => Transaction, (transaction) => transaction.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction!: Transaction;

  @Column({ name: 'product_id', type: 'char', length: 36 })
  productId!: string;

  @Column({ name: 'product_name', type: 'varchar', length: 200 })
  productName!: string;

  @Column({ name: 'variant_name', type: 'varchar', length: 100, nullable: true })
  variantName!: string | null;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @OneToMany(() => TransactionItemModifier, (modifier) => modifier.transactionItem, { cascade: true })
  modifiers!: TransactionItemModifier[];
}
