import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { ModifierGroup } from '../../modifier-groups/entities/modifier-group.entity';

@Entity('product_modifier_groups')
@Unique(['productId', 'modifierGroupId'])
@Index(['productId'])
@Index(['modifierGroupId'])
export class ProductModifierGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'modifier_group_id', type: 'varchar', length: 36 })
  modifierGroupId!: string;

  @ManyToOne(() => ModifierGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modifier_group_id' })
  modifierGroup!: ModifierGroup;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'created_by', type: 'varchar', length: 36, nullable: true })
  createdBy!: string | null;
}
