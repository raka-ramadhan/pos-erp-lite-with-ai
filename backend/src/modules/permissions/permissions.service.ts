import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, FindOptionsOrder } from 'typeorm';
import { Permission } from '../auth/entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  group: string;
  isActive: boolean;
  sortOrder: number;
  rolesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionDetailResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  group: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    usersCount?: number;
  }[];
  menus: {
    id: string;
    code: string;
    name: string;
    type: string;
    path: string;
  }[];
}

export interface PermissionGroupedResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  group: string;
  isActive: boolean;
  sortOrder: number;
  rolesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponse> {
    // Check if permission code already exists
    const existingCode = await this.permissionRepository.findOne({
      where: { code: createPermissionDto.code },
    });
    if (existingCode) {
      throw new ConflictException('Permission with this code already exists');
    }

    const permission = this.permissionRepository.create({
      code: createPermissionDto.code,
      name: createPermissionDto.name,
      description: createPermissionDto.description,
      group: createPermissionDto.group || 'Other',
      isActive: createPermissionDto.isActive ?? true,
      sortOrder: createPermissionDto.sortOrder ?? 1,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    return this.toPermissionResponse(savedPermission);
  }

  async findAll(query: QueryPermissionDto): Promise<PaginatedResult<PermissionResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: any = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    if (query.module) {
      where.group = query.module;
    }

    if (query.status !== undefined) {
      where.isActive = query.status === 'true';
    }

    // Build order
    const order: FindOptionsOrder<Permission> = {};
    if (query.sort) {
      order[query.sort as keyof Permission] = query.order || 'ASC';
    } else {
      order.group = 'ASC';
      order.sortOrder = 'ASC';
    }

    const [permissions, total] = await this.permissionRepository.findAndCount({
      where,
      relations: { roles: true },
      order,
      skip,
      take: limit,
    });

    const permissionResponses = permissions.map((perm) =>
      this.toPermissionResponse(perm, perm.roles?.length || 0),
    );

    return {
      data: permissionResponses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllGrouped(): Promise<{ group: string; permissions: PermissionResponse[] }[]> {
    const permissions = await this.permissionRepository.find({
      relations: { roles: true },
      order: { group: 'ASC', sortOrder: 'ASC' },
    });

    const grouped = permissions.reduce((acc, perm) => {
      const group = perm.group || 'Other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(this.toPermissionResponse(perm, perm.roles?.length || 0));
      return acc;
    }, {} as Record<string, PermissionResponse[]>);

    return Object.entries(grouped).map(([group, items]) => ({
      group,
      permissions: items,
    }));
  }

  async findOne(id: string): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return this.toPermissionResponse(permission, permission.roles?.length || 0);
  }

  async findOneDetailed(id: string): Promise<PermissionDetailResponse> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: {
        roles: {
          users: true,
        },
        menus: true,
      },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      group: permission.group,
      isActive: permission.isActive,
      sortOrder: permission.sortOrder,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
      roles: (permission.roles || []).map((role) => ({
        id: role.id,
        code: role.code,
        name: role.name,
        isActive: role.isActive,
        usersCount: role.users?.length || 0,
      })),
      menus: (permission.menus || []).map((menu) => ({
        id: menu.id,
        code: menu.code,
        name: menu.name,
        type: menu.type,
        path: menu.path,
      })),
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // Check if code is being changed and already exists
    if (updatePermissionDto.code && updatePermissionDto.code !== permission.code) {
      const existing = await this.permissionRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existing) {
        throw new ConflictException('Permission with this code already exists');
      }
    }

    Object.assign(permission, {
      code: updatePermissionDto.code ?? permission.code,
      name: updatePermissionDto.name ?? permission.name,
      description: updatePermissionDto.description ?? permission.description,
      group: updatePermissionDto.group ?? permission.group,
      isActive: updatePermissionDto.isActive ?? permission.isActive,
      sortOrder: updatePermissionDto.sortOrder ?? permission.sortOrder,
    });

    const savedPermission = await this.permissionRepository.save(permission);
    return this.toPermissionResponse(savedPermission, permission.roles?.length || 0);
  }

  async changeStatus(id: string, isActive: boolean): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    permission.isActive = isActive;
    const savedPermission = await this.permissionRepository.save(permission);
    return this.toPermissionResponse(savedPermission, permission.roles?.length || 0);
  }

  async remove(id: string): Promise<{ message: string }> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: { roles: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    // Check if permission is used by any roles
    if (permission.roles && permission.roles.length > 0) {
      throw new ConflictException(
        `Cannot delete permission "${permission.name}" because it is used by ${permission.roles.length} role(s). Please remove the permission from all roles first.`,
      );
    }

    await this.permissionRepository.remove(permission);
    return { message: 'Permission deleted successfully' };
  }

  async findByCodes(codes: string[]): Promise<Permission[]> {
    return this.permissionRepository.findBy({
      code: In(codes),
    });
  }

  async getModules(): Promise<string[]> {
    const permissions = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.group', 'group')
      .orderBy('permission.group', 'ASC')
      .getRawMany();

    return permissions.map((p) => p.group);
  }

  private toPermissionResponse(permission: Permission, rolesCount?: number): PermissionResponse {
    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      group: permission.group,
      isActive: permission.isActive,
      sortOrder: permission.sortOrder,
      rolesCount: rolesCount ?? permission.roles?.length ?? 0,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    };
  }
}
