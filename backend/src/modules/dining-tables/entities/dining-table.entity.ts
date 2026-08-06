import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export enum DiningTableStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
  INACTIVE = 'inactive',
}

@Entity('dining_tables')
export class DiningTable {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'outlet_id', type: 'varchar', length: 36, nullable: true })
  outletId!: string | null;

  @Column({ name: 'table_code', type: 'varchar', length: 20 })
  tableCode!: string;

  @Column({ name: 'table_name', type: 'varchar', length: 100 })
  tableName!: string;

  @Column({ name: 'area_name', type: 'varchar', length: 100, nullable: true })
  areaName!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 4 })
  capacity!: number;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: DiningTableStatus,
    default: DiningTableStatus.AVAILABLE,
  })
  status!: DiningTableStatus;

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
