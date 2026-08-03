import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Permission } from './permission.entity';

export enum MenuType {
  GROUP = 'GROUP',
  MENU = 'MENU',
  SUBMENU = 'SUBMENU',
  LINK = 'LINK',
}

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100 })
  code: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: MenuType, default: MenuType.MENU })
  type: MenuType;

  @Column({ length: 255, nullable: true })
  icon: string;

  @Column({ length: 255, nullable: true })
  path: string;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isHidden: boolean;

  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu | null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  // Menu is the inverse side - Permission has the @JoinTable
  @ManyToMany(() => Permission, (permission) => permission.menus)
  permissions: Permission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
