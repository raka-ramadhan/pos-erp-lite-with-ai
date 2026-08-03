import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOptionsOrder } from 'typeorm';
import { Role } from '../auth/entities/role.entity';
import { Permission } from '../auth/entities/permission.entity';
import { User } from '../auth/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  permissions: Permission[];
  usersCount?: number;
  permissionsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponse> {
    // Check if role name already exists
    if (createRoleDto.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: createRoleDto.name },
      });
      if (existing) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Check if role code already exists
    if (createRoleDto.code) {
      const existingCode = await this.roleRepository.findOne({
        where: { code: createRoleDto.code },
      });
      if (existingCode) {
        throw new ConflictException('Role with this code already exists');
      }
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      permissions = await this.permissionRepository.findBy({
        id: In(createRoleDto.permissionIds),
      });
    }

    const role = this.roleRepository.create({
      code: createRoleDto.code,
      name: createRoleDto.name,
      description: createRoleDto.description,
      isActive: createRoleDto.isActive ?? true,
      sortOrder: createRoleDto.sortOrder ?? 1,
      permissions,
    });

    const savedRole = await this.roleRepository.save(role);
    return this.toRoleResponse(savedRole);
  }

  async findAll(query: QueryRoleDto): Promise<PaginatedResult<RoleResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    if (query.status !== undefined) {
      where.isActive = query.status;
    }

    // Build order
    const order: FindOptionsOrder<Role> = {};
    if (query.sort) {
      order[query.sort as keyof Role] = query.order || 'ASC';
    } else {
      order.sortOrder = 'ASC';
      order.createdAt = 'DESC';
    }

    const [roles, total] = await this.roleRepository.findAndCount({
      where,
      relations: { permissions: true },
      order,
      skip,
      take: limit,
    });

    // Get user counts for each role
    const roleResponses = await Promise.all(
      roles.map(async (role) => {
        const usersCount = await this.userRepository.count({
          where: { roleId: role.id },
        });
        return this.toRoleResponse(role, usersCount);
      }),
    );

    return {
      data: roleResponses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    const usersCount = await this.userRepository.count({
      where: { roleId: role.id },
    });

    return this.toRoleResponse(role, usersCount);
  }

  async findByCode(code: string): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { code },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with code ${code} not found`);
    }

    return this.toRoleResponse(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true, users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if name is being changed and already exists
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existing) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Check if code is being changed and already exists
    if (updateRoleDto.code && updateRoleDto.code !== role.code) {
      const existing = await this.roleRepository.findOne({
        where: { code: updateRoleDto.code },
      });
      if (existing) {
        throw new ConflictException('Role with this code already exists');
      }
    }

    // Get permissions if provided
    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionRepository.findBy({
        id: In(updateRoleDto.permissionIds),
      });
      role.permissions = permissions;
    }

    Object.assign(role, {
      code: updateRoleDto.code ?? role.code,
      name: updateRoleDto.name ?? role.name,
      description: updateRoleDto.description ?? role.description,
      isActive: updateRoleDto.isActive ?? role.isActive,
      sortOrder: updateRoleDto.sortOrder ?? role.sortOrder,
    });

    const savedRole = await this.roleRepository.save(role);
    const usersCount = await this.userRepository.count({
      where: { roleId: savedRole.id },
    });

    return this.toRoleResponse(savedRole, usersCount);
  }

  async changeStatus(id: string, isActive: boolean): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    role.isActive = isActive;
    const savedRole = await this.roleRepository.save(role);
    const usersCount = await this.userRepository.count({
      where: { roleId: savedRole.id },
    });

    return this.toRoleResponse(savedRole, usersCount);
  }

  async assignPermissions(id: string, permissionIds: string[]): Promise<RoleResponse> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (permissionIds.length === 0) {
      throw new BadRequestException('At least one permission is required');
    }

    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });

    role.permissions = permissions;
    const savedRole = await this.roleRepository.save(role);
    const usersCount = await this.userRepository.count({
      where: { roleId: savedRole.id },
    });

    return this.toRoleResponse(savedRole, usersCount);
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    // Check if this is Administrator role
    if (role.code === 'administrator' || role.name.toLowerCase() === 'administrator') {
      throw new BadRequestException('Administrator role cannot be deleted');
    }

    // Check if role has users
    if (role.users && role.users.length > 0) {
      throw new ConflictException(
        `Cannot delete role "${role.name}" because it is assigned to ${role.users.length} user(s). Please reassign or remove the users first.`,
      );
    }

    await this.roleRepository.remove(role);
    return { message: 'Role deleted successfully' };
  }

  async getRolePermissions(id: string): Promise<Permission[]> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role.permissions;
  }

  private toRoleResponse(role: Role, usersCount?: number): RoleResponse {
    return {
      id: role.id,
      code: role.code || '',
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      sortOrder: role.sortOrder,
      permissions: role.permissions || [],
      usersCount: usersCount ?? role.users?.length ?? 0,
      permissionsCount: role.permissions?.length ?? 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
