import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { Menu } from './menu.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  code: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ default: 'dashboard' })
  group: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 1 })
  sortOrder: number;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => Menu, (menu) => menu.permissions, {
    cascade: true,
  })
  @JoinTable({
    name: 'menu_permissions',
    joinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Menu[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
