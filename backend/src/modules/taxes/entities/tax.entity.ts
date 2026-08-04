import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('taxes')
export class Tax {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'outlet_id', type: 'varchar', length: 36, nullable: true })
  outletId!: string | null;

  @Column({ type: 'varchar', length: 30 })
  code!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'tax_type', type: 'varchar', length: 20, default: 'percentage' })
  taxType!: string;

  @Column({ type: 'decimal', precision: 8, scale: 4, default: 0 })
  rate!: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault!: boolean;

  @Column({ name: 'calculation_base', type: 'varchar', length: 20, default: 'subtotal' })
  calculationBase!: string;

  @Column({ name: 'calculation_order', type: 'int', default: 1 })
  calculationOrder!: number;

  @Column({ name: 'is_inclusive', type: 'boolean', default: false })
  isInclusive!: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'effective_from', type: 'datetime', nullable: true })
  effectiveFrom!: Date | null;

  @Column({ name: 'effective_until', type: 'datetime', nullable: true })
  effectiveUntil!: Date | null;

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
