import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, FindOptionsRelations, IsNull } from 'typeorm';
import { ModifierGroup } from './entities/modifier-group.entity';
import { Modifier } from '../modifiers/entities/modifier.entity';
import { CreateModifierGroupDto, UpdateModifierGroupDto, QueryModifierGroupDto, ModifierGroupSortField, SortOrder } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ModifierGroupResponse {
  id: string;
  outletId: string | null;
  name: string;
  slug: string;
  description: string | null;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  sortOrder: number;
  isActive: boolean;
  modifiers?: ModifierResponse[];
  modifierCount?: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModifierResponse {
  id: string;
  sku: string | null;
  name: string;
  description: string | null;
  additionalPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
}

@Injectable()
export class ModifierGroupsService {
  constructor(
    @InjectRepository(ModifierGroup)
    private readonly modifierGroupRepository: Repository<ModifierGroup>,
    @InjectRepository(Modifier)
    private readonly modifierRepository: Repository<Modifier>,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private toModifierResponse(modifier: Modifier): ModifierResponse {
    return {
      id: modifier.id,
      sku: modifier.sku,
      name: modifier.name,
      description: modifier.description,
      additionalPrice: Number(modifier.additionalPrice),
      isDefault: modifier.isDefault,
      isAvailable: modifier.isAvailable,
      sortOrder: modifier.sortOrder,
      isActive: modifier.isActive,
    };
  }

  private async toModifierGroupResponse(modifierGroup: ModifierGroup, includeModifiers = false): Promise<ModifierGroupResponse> {
    const response: ModifierGroupResponse = {
      id: modifierGroup.id,
      outletId: modifierGroup.outletId,
      name: modifierGroup.name,
      slug: modifierGroup.slug,
      description: modifierGroup.description,
      selectionType: modifierGroup.selectionType,
      isRequired: modifierGroup.isRequired,
      minSelections: modifierGroup.minSelections,
      maxSelections: modifierGroup.maxSelections,
      sortOrder: modifierGroup.sortOrder,
      isActive: modifierGroup.isActive,
      modifierCount: modifierGroup.modifiers?.length ?? 0,
      createdBy: modifierGroup.createdBy,
      updatedBy: modifierGroup.updatedBy,
      createdAt: modifierGroup.createdAt,
      updatedAt: modifierGroup.updatedAt,
    };

    if (includeModifiers && modifierGroup.modifiers) {
      response.modifiers = modifierGroup.modifiers
        .filter((m) => m.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => this.toModifierResponse(m));
    }

    return response;
  }

  private validateSelectionRules(
    selectionType: string,
    minSelections: number | null | undefined,
    maxSelections: number | null | undefined,
  ): void {
    if (selectionType === 'single') {
      // Single choice: minSelections and maxSelections should be null or 1
      if (minSelections !== null && minSelections !== undefined && minSelections > 1) {
        throw new BadRequestException('Single choice modifier group cannot have minimum selections greater than 1');
      }
      if (maxSelections !== null && maxSelections !== undefined && maxSelections > 1) {
        throw new BadRequestException('Single choice modifier group cannot have maximum selections greater than 1');
      }
    } else if (selectionType === 'multiple') {
      // Multiple choice: validate min/max
      if (minSelections !== null && minSelections !== undefined && minSelections < 0) {
        throw new BadRequestException('Minimum selections cannot be negative');
      }
      if (maxSelections !== null && maxSelections !== undefined && maxSelections < 1) {
        throw new BadRequestException('Maximum selections must be at least 1');
      }
      if (
        minSelections !== null &&
        minSelections !== undefined &&
        maxSelections !== null &&
        maxSelections !== undefined &&
        minSelections > maxSelections
      ) {
        throw new BadRequestException('Minimum selections cannot be greater than maximum selections');
      }
    }
  }

  async create(createModifierGroupDto: CreateModifierGroupDto): Promise<ModifierGroupResponse> {
    // Generate or use provided slug
    const slug = createModifierGroupDto.slug || this.generateSlug(createModifierGroupDto.name);

    // Check if slug already exists (including soft deleted)
    const existing = await this.modifierGroupRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Modifier group with slug "${slug}" already exists`);
    }

    // Validate selection rules
    this.validateSelectionRules(
      createModifierGroupDto.selectionType || 'single',
      createModifierGroupDto.minSelections,
      createModifierGroupDto.maxSelections,
    );

    const modifierGroup = this.modifierGroupRepository.create({
      name: createModifierGroupDto.name,
      slug,
      description: createModifierGroupDto.description || null,
      selectionType: createModifierGroupDto.selectionType || 'single',
      isRequired: createModifierGroupDto.isRequired ?? false,
      minSelections: createModifierGroupDto.selectionType === 'multiple' ? (createModifierGroupDto.minSelections ?? 0) : null,
      maxSelections: createModifierGroupDto.selectionType === 'multiple' ? (createModifierGroupDto.maxSelections ?? 1) : null,
      sortOrder: createModifierGroupDto.sortOrder ?? 0,
      isActive: createModifierGroupDto.isActive ?? true,
      outletId: createModifierGroupDto.outletId || 'default',
    });

    const savedModifierGroup = await this.modifierGroupRepository.save(modifierGroup);

    return this.toModifierGroupResponse(savedModifierGroup);
  }

  async findAll(query: QueryModifierGroupDto): Promise<PaginatedResult<ModifierGroupResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Default: exclude soft-deleted records
    const where: FindOptionsWhere<ModifierGroup> = {
      deletedAt: IsNull(), // Only show non-deleted records
    };

    // Search by name
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    // Filter by selection type
    if (query.selectionType) {
      where.selectionType = query.selectionType;
    }

    // Filter by active status
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    } else if (query.status) {
      switch (query.status) {
        case 'active':
          where.isActive = true;
          break;
        case 'inactive':
          where.isActive = false;
          break;
        // 'all' - no filter applied (but still exclude deleted)
      }
    }

    // Build order
    const sortField = query.sort || ModifierGroupSortField.SORT_ORDER;
    const sortOrder = query.order || SortOrder.ASC;
    const order: FindOptionsOrder<ModifierGroup> = {
      [sortField]: sortOrder,
    };

    const [modifierGroups, total] = await this.modifierGroupRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      relations: { modifiers: true } as FindOptionsRelations<ModifierGroup>,
      withDeleted: false, // Don't include soft-deleted records in list
    });

    const data = await Promise.all(
      modifierGroups.map((mg) => this.toModifierGroupResponse(mg, true))
    );

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ModifierGroupResponse> {
    const modifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      relations: { modifiers: true } as FindOptionsRelations<ModifierGroup>,
      withDeleted: true,
    });

    if (!modifierGroup) {
      throw new NotFoundException(`Modifier group with ID ${id} not found`);
    }

    return this.toModifierGroupResponse(modifierGroup, true);
  }

  async findAllActive(): Promise<ModifierGroupResponse[]> {
    const modifierGroups = await this.modifierGroupRepository.find({
      where: { isActive: true },
      relations: { modifiers: true } as FindOptionsRelations<ModifierGroup>,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return Promise.all(
      modifierGroups.map((mg) => this.toModifierGroupResponse(mg, true))
    );
  }

  async update(id: string, updateModifierGroupDto: UpdateModifierGroupDto): Promise<ModifierGroupResponse> {
    const modifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifierGroup) {
      throw new NotFoundException(`Modifier group with ID ${id} not found`);
    }

    // Check if slug is being changed and already exists
    if (updateModifierGroupDto.slug && updateModifierGroupDto.slug !== modifierGroup.slug) {
      const existing = await this.modifierGroupRepository.findOne({
        where: { slug: updateModifierGroupDto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Modifier group with slug "${updateModifierGroupDto.slug}" already exists`);
      }
    } else if (updateModifierGroupDto.name && !updateModifierGroupDto.slug) {
      // If name changed but no slug provided, generate new slug
      const newSlug = this.generateSlug(updateModifierGroupDto.name);
      if (newSlug !== modifierGroup.slug) {
        const existing = await this.modifierGroupRepository.findOne({
          where: { slug: newSlug },
          withDeleted: true,
        });
        if (existing) {
          throw new ConflictException(`Modifier group with slug "${newSlug}" already exists`);
        }
        updateModifierGroupDto.slug = newSlug;
      }
    }

    // Determine effective values for validation
    const effectiveSelectionType = updateModifierGroupDto.selectionType ?? modifierGroup.selectionType;
    const effectiveMinSelections = updateModifierGroupDto.minSelections ?? modifierGroup.minSelections;
    const effectiveMaxSelections = updateModifierGroupDto.maxSelections ?? modifierGroup.maxSelections;

    // Validate selection rules
    this.validateSelectionRules(
      effectiveSelectionType,
      effectiveMinSelections,
      effectiveMaxSelections,
    );

    // Create update data object
    const updateData: Partial<ModifierGroup> = {};

    if (updateModifierGroupDto.name !== undefined) updateData.name = updateModifierGroupDto.name;
    if (updateModifierGroupDto.slug !== undefined) updateData.slug = updateModifierGroupDto.slug;
    if (updateModifierGroupDto.description !== undefined) {
      updateData.description = updateModifierGroupDto.description || null;
    }
    if (updateModifierGroupDto.selectionType !== undefined) {
      updateData.selectionType = updateModifierGroupDto.selectionType;
      // Reset min/max if changing to single
      if (updateModifierGroupDto.selectionType === 'single') {
        updateData.minSelections = null;
        updateData.maxSelections = null;
      } else {
        updateData.minSelections = updateModifierGroupDto.minSelections ?? 0;
        updateData.maxSelections = updateModifierGroupDto.maxSelections ?? 1;
      }
    }
    if (updateModifierGroupDto.isRequired !== undefined) updateData.isRequired = updateModifierGroupDto.isRequired;
    if (updateModifierGroupDto.minSelections !== undefined) updateData.minSelections = updateModifierGroupDto.minSelections;
    if (updateModifierGroupDto.maxSelections !== undefined) updateData.maxSelections = updateModifierGroupDto.maxSelections;
    if (updateModifierGroupDto.sortOrder !== undefined) updateData.sortOrder = updateModifierGroupDto.sortOrder;
    if (updateModifierGroupDto.isActive !== undefined) updateData.isActive = updateModifierGroupDto.isActive;

    Object.assign(modifierGroup, updateData);
    await this.modifierGroupRepository.save(modifierGroup);

    // Reload with modifiers
    const updatedModifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      relations: { modifiers: true } as FindOptionsRelations<ModifierGroup>,
    });

    return this.toModifierGroupResponse(updatedModifierGroup!);
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check if exists (including soft-deleted)
    const modifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifierGroup) {
      throw new NotFoundException(`Modifier group with ID ${id} not found`);
    }

    // If already deleted, return success (idempotent)
    if (modifierGroup.deletedAt) {
      return { message: 'Modifier group is already deleted' };
    }

    await this.modifierGroupRepository.softDelete(id);
    return { message: 'Modifier group deleted successfully' };
  }

  async restore(id: string): Promise<ModifierGroupResponse> {
    const modifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifierGroup) {
      throw new NotFoundException(`Modifier group with ID ${id} not found`);
    }

    await this.modifierGroupRepository.restore(id);

    const restoredModifierGroup = await this.modifierGroupRepository.findOne({
      where: { id },
      relations: { modifiers: true } as FindOptionsRelations<ModifierGroup>,
    });

    return this.toModifierGroupResponse(restoredModifierGroup!);
  }
}
