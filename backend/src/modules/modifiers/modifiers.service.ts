import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, FindOptionsRelations, IsNull } from 'typeorm';
import { Modifier } from './entities/modifier.entity';
import { ModifierGroup } from '../modifier-groups/entities/modifier-group.entity';
import { CreateModifierDto, UpdateModifierDto, QueryModifierDto, ModifierSortField, SortOrder } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ModifierResponse {
  id: string;
  modifierGroupId: string;
  modifierGroup?: {
    id: string;
    name: string;
    slug: string;
    selectionType: string;
  };
  sku: string | null;
  name: string;
  description: string | null;
  additionalPrice: number;
  costPrice: number | null;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ModifiersService {
  constructor(
    @InjectRepository(Modifier)
    private readonly modifierRepository: Repository<Modifier>,
    @InjectRepository(ModifierGroup)
    private readonly modifierGroupRepository: Repository<ModifierGroup>,
  ) {}

  private async toModifierResponse(modifier: Modifier, includeGroup = false): Promise<ModifierResponse> {
    const response: ModifierResponse = {
      id: modifier.id,
      modifierGroupId: modifier.modifierGroupId,
      sku: modifier.sku,
      name: modifier.name,
      description: modifier.description,
      additionalPrice: Number(modifier.additionalPrice),
      costPrice: modifier.costPrice ? Number(modifier.costPrice) : null,
      isDefault: modifier.isDefault,
      isAvailable: modifier.isAvailable,
      sortOrder: modifier.sortOrder,
      isActive: modifier.isActive,
      createdBy: modifier.createdBy,
      updatedBy: modifier.updatedBy,
      createdAt: modifier.createdAt,
      updatedAt: modifier.updatedAt,
    };

    if (includeGroup && modifier.modifierGroup) {
      response.modifierGroup = {
        id: modifier.modifierGroup.id,
        name: modifier.modifierGroup.name,
        slug: modifier.modifierGroup.slug,
        selectionType: modifier.modifierGroup.selectionType,
      };
    }

    return response;
  }

  async create(createModifierDto: CreateModifierDto): Promise<ModifierResponse> {
    // Validate modifier group exists
    const modifierGroup = await this.modifierGroupRepository.findOne({
      where: { id: createModifierDto.modifierGroupId },
    });

    if (!modifierGroup) {
      throw new NotFoundException(`Modifier group with ID ${createModifierDto.modifierGroupId} not found`);
    }

    // Check for duplicate SKU within the same modifier group
    if (createModifierDto.sku) {
      const existingSku = await this.modifierRepository.findOne({
        where: {
          modifierGroupId: createModifierDto.modifierGroupId,
          sku: createModifierDto.sku,
        },
        withDeleted: true,
      });

      if (existingSku) {
        throw new ConflictException(`Modifier with SKU "${createModifierDto.sku}" already exists in this modifier group`);
      }
    }

    // Check for duplicate name within the same modifier group
    const existingName = await this.modifierRepository.findOne({
      where: {
        modifierGroupId: createModifierDto.modifierGroupId,
        name: createModifierDto.name,
      },
      withDeleted: true,
    });

    if (existingName) {
      throw new ConflictException(`Modifier with name "${createModifierDto.name}" already exists in this modifier group`);
    }

    // If isDefault is true, unset other defaults in the same group
    if (createModifierDto.isDefault) {
      await this.modifierRepository.update(
        { modifierGroupId: createModifierDto.modifierGroupId, isDefault: true },
        { isDefault: false }
      );
    }

    const modifier = this.modifierRepository.create({
      modifierGroupId: createModifierDto.modifierGroupId,
      sku: createModifierDto.sku || null,
      name: createModifierDto.name,
      description: createModifierDto.description || null,
      additionalPrice: createModifierDto.additionalPrice ?? 0,
      costPrice: createModifierDto.costPrice || null,
      isDefault: createModifierDto.isDefault ?? false,
      isAvailable: createModifierDto.isAvailable ?? true,
      sortOrder: createModifierDto.sortOrder ?? 0,
      isActive: createModifierDto.isActive ?? true,
    });

    const savedModifier = await this.modifierRepository.save(modifier);

    // Reload with relations
    const loadedModifier = await this.modifierRepository.findOne({
      where: { id: savedModifier.id },
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
    });

    return this.toModifierResponse(loadedModifier!);
  }

  async findAll(query: QueryModifierDto): Promise<PaginatedResult<ModifierResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Default: exclude soft-deleted records
    const where: FindOptionsWhere<Modifier> = {
      deletedAt: IsNull(), // Only show non-deleted records
    };

    // Search by name
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    // Filter by modifier group
    if (query.modifierGroupId) {
      where.modifierGroupId = query.modifierGroupId;
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
    const sortField = query.sort || ModifierSortField.SORT_ORDER;
    const sortOrder = query.order || SortOrder.ASC;
    const order: FindOptionsOrder<Modifier> = {
      [sortField]: sortOrder,
    };

    const [modifiers, total] = await this.modifierRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
      withDeleted: false, // Don't include soft-deleted records in list
    });

    const data = await Promise.all(
      modifiers.map((m) => this.toModifierResponse(m, true))
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

  async findOne(id: string): Promise<ModifierResponse> {
    const modifier = await this.modifierRepository.findOne({
      where: { id },
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
      withDeleted: true,
    });

    if (!modifier) {
      throw new NotFoundException(`Modifier with ID ${id} not found`);
    }

    return this.toModifierResponse(modifier, true);
  }

  async findAllByModifierGroup(modifierGroupId: string): Promise<ModifierResponse[]> {
    const modifiers = await this.modifierRepository.find({
      where: { modifierGroupId, isActive: true },
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return Promise.all(
      modifiers.map((m) => this.toModifierResponse(m, true))
    );
  }

  async update(id: string, updateModifierDto: UpdateModifierDto): Promise<ModifierResponse> {
    const modifier = await this.modifierRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifier) {
      throw new NotFoundException(`Modifier with ID ${id} not found`);
    }

    // If modifierGroupId is being changed, validate new group exists
    if (updateModifierDto.modifierGroupId && updateModifierDto.modifierGroupId !== modifier.modifierGroupId) {
      const newGroup = await this.modifierGroupRepository.findOne({
        where: { id: updateModifierDto.modifierGroupId },
      });

      if (!newGroup) {
        throw new NotFoundException(`Modifier group with ID ${updateModifierDto.modifierGroupId} not found`);
      }
    }

    const effectiveGroupId = updateModifierDto.modifierGroupId || modifier.modifierGroupId;

    // Check for duplicate SKU within the same modifier group
    if (updateModifierDto.sku && updateModifierDto.sku !== modifier.sku) {
      const existingSku = await this.modifierRepository.findOne({
        where: {
          modifierGroupId: effectiveGroupId,
          sku: updateModifierDto.sku,
        },
        withDeleted: true,
      });

      if (existingSku && existingSku.id !== id) {
        throw new ConflictException(`Modifier with SKU "${updateModifierDto.sku}" already exists in this modifier group`);
      }
    }

    // Check for duplicate name within the same modifier group
    if (updateModifierDto.name && updateModifierDto.name !== modifier.name) {
      const existingName = await this.modifierRepository.findOne({
        where: {
          modifierGroupId: effectiveGroupId,
          name: updateModifierDto.name,
        },
        withDeleted: true,
      });

      if (existingName && existingName.id !== id) {
        throw new ConflictException(`Modifier with name "${updateModifierDto.name}" already exists in this modifier group`);
      }
    }

    // If isDefault is being set to true, unset other defaults in the same group
    if (updateModifierDto.isDefault === true) {
      await this.modifierRepository.update(
        { modifierGroupId: effectiveGroupId, isDefault: true, id: undefined as any },
        { isDefault: false }
      );
    }

    // Create update data object
    const updateData: Partial<Modifier> = {};

    if (updateModifierDto.modifierGroupId !== undefined) updateData.modifierGroupId = updateModifierDto.modifierGroupId;
    if (updateModifierDto.sku !== undefined) updateData.sku = updateModifierDto.sku || null;
    if (updateModifierDto.name !== undefined) updateData.name = updateModifierDto.name;
    if (updateModifierDto.description !== undefined) updateData.description = updateModifierDto.description || null;
    if (updateModifierDto.additionalPrice !== undefined) updateData.additionalPrice = updateModifierDto.additionalPrice;
    if (updateModifierDto.costPrice !== undefined) updateData.costPrice = updateModifierDto.costPrice || null;
    if (updateModifierDto.isDefault !== undefined) updateData.isDefault = updateModifierDto.isDefault;
    if (updateModifierDto.isAvailable !== undefined) updateData.isAvailable = updateModifierDto.isAvailable;
    if (updateModifierDto.sortOrder !== undefined) updateData.sortOrder = updateModifierDto.sortOrder;
    if (updateModifierDto.isActive !== undefined) updateData.isActive = updateModifierDto.isActive;

    Object.assign(modifier, updateData);
    await this.modifierRepository.save(modifier);

    // Reload with relations
    const updatedModifier = await this.modifierRepository.findOne({
      where: { id },
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
    });

    return this.toModifierResponse(updatedModifier!);
  }

  async remove(id: string): Promise<{ message: string }> {
    // Check if exists (including soft-deleted)
    const modifier = await this.modifierRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifier) {
      throw new NotFoundException(`Modifier with ID ${id} not found`);
    }

    // If already deleted, return success (idempotent)
    if ((modifier as any).deletedAt) {
      return { message: 'Modifier is already deleted' };
    }

    await this.modifierRepository.softDelete(id);
    return { message: 'Modifier deleted successfully' };
  }

  async restore(id: string): Promise<ModifierResponse> {
    const modifier = await this.modifierRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!modifier) {
      throw new NotFoundException(`Modifier with ID ${id} not found`);
    }

    await this.modifierRepository.restore(id);

    const restoredModifier = await this.modifierRepository.findOne({
      where: { id },
      relations: { modifierGroup: true } as FindOptionsRelations<Modifier>,
    });

    return this.toModifierResponse(restoredModifier!);
  }
}
