import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, FindOptionsRelations, IsNull } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, QueryCategoryDto, CategorySortField, SortOrder } from './dto';
import { FilesService } from '../files/files.service';
import { Media } from '../files/entities/media.entity';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryResponse {
  id: string;
  outletId: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
  } | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class CategoriesService {
  private readonly entityType = 'categories';

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly filesService: FilesService,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async getImageUrl(categoryId: string): Promise<{ imageUrl: string | null; mediaId: string | null }> {
    // Check both 'categories' (new) and 'category' (legacy) entityType for backwards compatibility
    const media = await this.mediaRepository.findOne({
      where: [
        { entityType: 'categories', entityId: categoryId },
        { entityType: 'category', entityId: categoryId },
      ],
      order: { createdAt: 'DESC' },
    });
    return {
      imageUrl: media?.url || null,
      mediaId: media?.id || null,
    };
  }

  private async toCategoryResponse(category: Category): Promise<CategoryResponse> {
    const { imageUrl, mediaId } = await this.getImageUrl(category.id);
    return {
      id: category.id,
      outletId: category.outletId,
      parentId: category.parentId,
      parent: category.parent ? { id: category.parent.id, name: category.parent.name } : null,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl,
      mediaId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private async linkMediaToCategory(categoryId: string, mediaId: string): Promise<void> {
    await this.filesService.updateEntityId(mediaId, categoryId);
  }

  private async unlinkMediaFromCategory(categoryId: string): Promise<void> {
    await this.filesService.deleteFileByEntity(this.entityType, categoryId);
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponse> {
    // Check if slug already exists (with soft deleted records)
    const slug = createCategoryDto.slug || this.generateSlug(createCategoryDto.name);
    const existing = await this.categoryRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    // Validate parent category if provided
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findOne({
        where: { id: createCategoryDto.parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      name: createCategoryDto.name,
      slug,
      description: createCategoryDto.description || null,
      sortOrder: createCategoryDto.sortOrder ?? 0,
      isActive: createCategoryDto.isActive ?? true,
      parentId: createCategoryDto.parentId || null,
      outletId: createCategoryDto.outletId || null,
    });

    const savedCategory = await this.categoryRepository.save(category);

    // Link media to category if provided
    if (createCategoryDto.mediaId) {
      await this.linkMediaToCategory(savedCategory.id, createCategoryDto.mediaId);
    }

    // Reload with parent relation
    const categoryWithParent = await this.categoryRepository.findOne({
      where: { id: savedCategory.id },
      relations: { parent: true } as FindOptionsRelations<Category>,
    });

    return this.toCategoryResponse(categoryWithParent!);
  }

  async findAll(query: QueryCategoryDto): Promise<PaginatedResult<CategoryResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<Category> = {};

    // Search by name or slug
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    // Filter by parent
    if (query.parentId !== undefined) {
      if (query.parentId === 'null' || query.parentId === '') {
        where.parentId = IsNull();
      } else {
        where.parentId = query.parentId;
      }
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
        // 'all' - no filter applied
      }
    }

    // Build order
    const sortField = query.sort || CategorySortField.CREATED_AT;
    const sortOrder = query.order || SortOrder.DESC;
    const order: FindOptionsOrder<Category> = {
      [sortField]: sortOrder,
    };

    // Query with pagination
    const [categories, total] = await this.categoryRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      relations: { parent: true } as FindOptionsRelations<Category>,
    });

    const data = await Promise.all(
      categories.map((category) => this.toCategoryResponse(category))
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

  async findOne(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true, children: true } as FindOptionsRelations<Category>,
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return this.toCategoryResponse(category);
  }

  async findAllActive(): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: { parent: true } as FindOptionsRelations<Category>,
    });

    // Batch load all media to avoid N+1 queries
    const categoryIds = categories.map((c) => c.id);
    const imageUrlMap = await this.batchGetImageUrls(categoryIds);

    return categories.map((category) =>
      this.toCategoryResponseBatch(category, imageUrlMap)
    );
  }

  /**
   * Batch load image URLs for multiple categories (avoids N+1 queries)
   */
  private async batchGetImageUrls(categoryIds: string[]): Promise<Map<string, { imageUrl: string | null; mediaId: string | null }>> {
    const result = new Map<string, { imageUrl: string | null; mediaId: string | null }>();

    if (categoryIds.length === 0) return result;

    const mediaList = await this.mediaRepository.find({
      where: categoryIds.map((entityId) => ({
        entityType: 'categories' as any,
        entityId,
      })),
      order: { createdAt: 'DESC' },
    });

    // Also check 'category' (legacy) entityType
    const legacyMedia = await this.mediaRepository.find({
      where: categoryIds.map((entityId) => ({
        entityType: 'category' as any,
        entityId,
      })),
      order: { createdAt: 'DESC' },
    });

    // Combine and dedupe
    const allMedia = [...mediaList];
    for (const m of legacyMedia) {
      if (!allMedia.some((existing) => existing.entityId === m.entityId && existing.entityType === m.entityType)) {
        allMedia.push(m);
      }
    }

    // Group by entityId and take first (most recent per type)
    const mediaByCategory = new Map<string, any>();
    for (const media of allMedia) {
      const key = `${media.entityType}-${media.entityId}`;
      if (!mediaByCategory.has(key)) {
        mediaByCategory.set(key, media);
      }
    }

    for (const id of categoryIds) {
      const primary = mediaByCategory.get(`categories-${id}`);
      const legacy = mediaByCategory.get(`category-${id}`);
      const media = primary || legacy;
      result.set(id, {
        imageUrl: media?.url || null,
        mediaId: media?.id || null,
      });
    }

    return result;
  }

  /**
   * Batch version of toCategoryResponse (uses pre-loaded data)
   */
  private toCategoryResponseBatch(
    category: Category,
    imageUrlMap: Map<string, { imageUrl: string | null; mediaId: string | null }>
  ): CategoryResponse {
    const imageData = imageUrlMap.get(category.id) || { imageUrl: null, mediaId: null };
    return {
      id: category.id,
      outletId: category.outletId,
      parentId: category.parentId,
      parent: category.parent ? { id: category.parent.id, name: category.parent.name } : null,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: imageData.imageUrl,
      mediaId: imageData.mediaId,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Check if slug is being changed and already exists
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Category with slug "${updateCategoryDto.slug}" already exists`);
      }
    } else if (updateCategoryDto.name && !updateCategoryDto.slug) {
      // If name changed but no slug provided, generate new slug
      const newSlug = this.generateSlug(updateCategoryDto.name);
      if (newSlug !== category.slug) {
        const existing = await this.categoryRepository.findOne({
          where: { slug: newSlug },
          withDeleted: true,
        });
        if (existing) {
          throw new ConflictException(`Category with slug "${newSlug}" already exists`);
        }
        updateCategoryDto.slug = newSlug;
      }
    }

    // Validate parent category if being updated
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (updateCategoryDto.parentId) {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: updateCategoryDto.parentId },
        });
        if (!parentCategory) {
          throw new NotFoundException('Parent category not found');
        }
      }
    }

    // Create a new object with properly typed values to avoid DTO mutation issues
    const updateData: Partial<Category> = {};

    if (updateCategoryDto.name !== undefined) updateData.name = updateCategoryDto.name;
    if (updateCategoryDto.slug !== undefined) updateData.slug = updateCategoryDto.slug;
    if (updateCategoryDto.description !== undefined) {
      updateData.description = updateCategoryDto.description || null;
    }
    if (updateCategoryDto.parentId !== undefined) {
      updateData.parentId = updateCategoryDto.parentId || null;
    }
    if (updateCategoryDto.sortOrder !== undefined) updateData.sortOrder = updateCategoryDto.sortOrder;
    if (updateCategoryDto.isActive !== undefined) updateData.isActive = updateCategoryDto.isActive;

    Object.assign(category, updateData);
    await this.categoryRepository.save(category);

    // Handle media changes
    if (updateCategoryDto.mediaId !== undefined) {
      // Remove existing media
      await this.unlinkMediaFromCategory(id);

      // Link new media if provided
      if (updateCategoryDto.mediaId) {
        await this.linkMediaToCategory(id, updateCategoryDto.mediaId);
      }
    }

    // Reload with relations
    const updatedCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true } as FindOptionsRelations<Category>,
    });

    return this.toCategoryResponse(updatedCategory!);
  }

  async remove(id: string): Promise<{ message: string }> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    // Delete associated media files
    await this.unlinkMediaFromCategory(id);

    // Soft delete the category
    await this.categoryRepository.softDelete(id);
    return { message: 'Category deleted successfully' };
  }

  async restore(id: string): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    await this.categoryRepository.restore(id);

    // Reload with relations
    const restoredCategory = await this.categoryRepository.findOne({
      where: { id },
      relations: { parent: true } as FindOptionsRelations<Category>,
    });

    return this.toCategoryResponse(restoredCategory!);
  }
}
