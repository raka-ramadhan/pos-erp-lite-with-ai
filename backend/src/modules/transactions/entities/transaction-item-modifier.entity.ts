import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TransactionItem } from './transaction-item.entity';

@Entity('transaction_item_modifiers')
export class TransactionItemModifier {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'transaction_item_id', type: 'char', length: 36 })
  transactionItemId!: string;

  @ManyToOne(() => TransactionItem, (item) => item.modifiers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_item_id' })
  transactionItem!: TransactionItem;

  @Column({ name: 'modifier_id', type: 'char', length: 36 })
  modifierId!: string;

  @Column({ name: 'modifier_name', type: 'varchar', length: 100 })
  modifierName!: string;

  @Column({ type: 'int', default: 1 })
  quantity!: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 12, scale: 2, default: 0 })
  unitPrice!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
