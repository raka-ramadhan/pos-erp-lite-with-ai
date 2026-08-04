import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'outlet_id', type: 'varchar', length: 50, default: 'default' })
  outletId!: string;

  @Column({ type: 'varchar', length: 30 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'payment_type', type: 'varchar', length: 20 })
  paymentType!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider!: string | null;

  @Column({ name: 'icon_url', type: 'varchar', length: 500, nullable: true })
  iconUrl!: string | null;

  @Column({ name: 'is_integration', type: 'boolean', default: false })
  isIntegration!: boolean;

  @Column({ name: 'min_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  minAmount!: number | null;

  @Column({ name: 'max_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  maxAmount!: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

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
