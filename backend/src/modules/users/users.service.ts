import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto, UserSortField, SortOrder } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  isActive: boolean;
  role: {
    id: string;
    name: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private toUserResponse(user: User): UserResponse {
    const { password, deletedAt, ...rest } = user;
    return {
      ...rest,
      role: user.role ? { id: user.role.id, name: user.role.name } : null,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    // Check if email already exists
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Validate role if provided
    if (createUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: createUserDto.roleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: createUserDto.password,
      phone: createUserDto.phone,
      roleId: createUserDto.roleId || null,
      isActive: createUserDto.isActive ?? true,
    });

    const savedUser = await this.userRepository.save(user);

    // Reload with role
    const userWithRole = await this.findOne(savedUser.id);
    return userWithRole;
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<UserResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<User> = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    if (query.status !== undefined) {
      where.isActive = query.status;
    }

    if (query.roleId) {
      where.roleId = query.roleId;
    }

    // Build order
    const sortField = query.sort || UserSortField.CREATED_AT;
    const sortOrder = query.order || SortOrder.DESC;
    const order: FindOptionsOrder<User> = {
      [sortField]: sortOrder,
    };

    // Query with pagination
    const [users, total] = await this.userRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data: users.map((user) => this.toUserResponse(user)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being changed and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException('Email already registered');
      }
    }

    // Validate role if being updated
    if (updateUserDto.roleId) {
      const role = await this.roleRepository.findOne({
        where: { id: updateUserDto.roleId },
      });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Hash password if being updated
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // Convert empty strings to null for nullable fields
    if (updateUserDto.phone === '') {
      updateUserDto.phone = null;
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Reload with role
    return this.findOne(updatedUser.id);
  }

  async changeStatus(id: string, isActive: boolean): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = isActive;
    await this.userRepository.save(user);

    return this.toUserResponse(user);
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete
    await this.userRepository.softDelete(id);
    return { message: 'User deleted successfully' };
  }

  async restore(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.restore(id);
    return this.findOne(id);
  }
}
