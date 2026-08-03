import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, select: false })
  password: string;

  @Column({ length: 100, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'role_id', type: 'uuid', nullable: true })
  roleId: string | null;

  @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      // Skip if already hashed (bcrypt hashes start with $2)
      if (this.password.startsWith('$2')) {
        return;
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
