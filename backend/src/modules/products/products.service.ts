import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, FindOptionsRelations, DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { FilesService } from '../files/files.service';
import { Media } from '../files/entities/media.entity';
import { Tax } from '../taxes/entities/tax.entity';
import { ModifierGroup } from '../modifier-groups/entities/modifier-group.entity';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ModifierGroupSummary {
  id: string;
  name: string;
  slug: string;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  modifierCount: number;
}

export interface ModifierDetail {
  id: string;
  name: string;
  sku: string | null;
  additionalPrice: number;
  isDefault: boolean;
  isAvailable: boolean;
  sortOrder: number;
}

export interface ModifierGroupWithModifiers {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  selectionType: string;
  isRequired: boolean;
  minSelections: number | null;
  maxSelections: number | null;
  modifiers: ModifierDetail[];
}

export interface TaxSummary {
  id: string;
  code: string;
  name: string;
  taxType: string;
  rate: number;
}

export interface ProductWithModifiersResponse {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  price: number;
  unitType: string;
  hasVariants: boolean;
  isAvailable: boolean;
  modifierGroups: ModifierGroupWithModifiers[];
}

export interface ProductResponse {
  id: string;
  outletId: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
  } | null;
  sku: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  mediaId: string | null;
  price: number;
  costPrice: number | null;
  unitType: string;
  hasVariants: boolean;
  isAvailable: boolean;
  isFeatured: boolean;
  preparationTime: number | null;
  sortOrder: number;
  isActive: boolean;
  taxId: string | null;
  tax: TaxSummary | null;
  modifierGroups: ModifierGroupSummary[];
  modifierGroupCount: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ProductsService {
  private readonly entityType = 'products';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(ModifierGroup)
    private readonly modifierGroupRepository: Repository<ModifierGroup>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly filesService: FilesService,
    private readonly dataSource: DataSource,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async getImageUrl(productId: string): Promise<{ imageUrl: string | null; mediaId: string | null }> {
    // First try to find media with exact entityId match
    const media = await this.mediaRepository.findOne({
      where: [
        { entityType: 'products', entityId: productId },
        { entityType: 'product', entityId: productId },
      ],
      order: { createdAt: 'DESC' },
    });

    if (media) {
      return {
        imageUrl: media.url || null,
        mediaId: media.id || null,
      };
    }

    // Fallback: If product has mediaId stored, try to find that media record
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (product?.mediaId) {
      const mediaById = await this.mediaRepository.findOne({
        where: { id: product.mediaId },
      });
      if (mediaById) {
        return {
          imageUrl: mediaById.url || null,
          mediaId: mediaById.id || null,
        };
      }
    }

    return {
      imageUrl: null,
      mediaId: null,
    };
  }

  private async getProductTax(productId: string): Promise<TaxSummary | null> {
    const result = await this.mediaRepository.manager.query(
      `SELECT t.id, t.code, t.name, t.tax_type, t.rate FROM taxes t
       INNER JOIN product_taxes pt ON t.id = pt.tax_id
       WHERE pt.product_id = ? AND t.is_active = 1
       LIMIT 1`,
      [productId]
    );
    if (result && result.length > 0) {
      const t = result[0];
      return {
        id: t.id,
        code: t.code,
        name: t.name,
        taxType: t.tax_type,
        rate: Number(t.rate),
      };
    }
    return null;
  }

  private async toModifierGroupResponse(mg: ModifierGroup): Promise<ModifierGroupSummary> {
    return {
      id: mg.id,
      name: mg.name,
      slug: mg.slug,
      selectionType: mg.selectionType,
      isRequired: mg.isRequired,
      minSelections: mg.minSelections,
      maxSelections: mg.maxSelections,
      modifierCount: mg.modifiers?.length || 0,
    };
  }

  private async toProductResponse(product: Product, includeRelations = false): Promise<ProductResponse> {
    const { imageUrl, mediaId } = await this.getImageUrl(product.id);
    const tax = await this.getProductTax(product.id);

    // Use eager-loaded modifier groups if available
    let modifierGroups: ModifierGroupSummary[] = [];
    if (includeRelations && product.modifierGroups) {
      modifierGroups = await Promise.all(
        product.modifierGroups
          .filter((mg) => mg.isActive)
          .sort((a, b) => (a as any).sortOrder - (b as any).sortOrder)
          .map((mg) => this.toModifierGroupResponse(mg))
      );
    } else {
      // Fallback to query if not loaded
      const rawMgs = await this.mediaRepository.manager.query(
        `SELECT mg.*, pmg.sort_order FROM modifier_groups mg
         INNER JOIN product_modifier_groups pmg ON mg.id = pmg.modifier_group_id
         WHERE pmg.product_id = ? AND pmg.is_active = 1
         ORDER BY pmg.sort_order ASC`,
        [product.id]
      );
      modifierGroups = rawMgs.map((mg: any) => ({
        id: mg.id,
        name: mg.name,
        slug: mg.slug,
        selectionType: mg.selection_type,
        isRequired: !!mg.is_required,
        minSelections: mg.min_selections,
        maxSelections: mg.max_selections,
        modifierCount: 0,
      }));
    }

    return {
      id: product.id,
      outletId: product.outletId,
      categoryId: product.categoryId,
      category: product.category ? { id: product.category.id, name: product.category.name } : null,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl,
      mediaId,
      price: Number(product.price),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      unitType: product.unitType,
      hasVariants: product.hasVariants || modifierGroups.length > 0,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      preparationTime: product.preparationTime,
      sortOrder: product.sortOrder,
      isActive: product.isActive,
      taxId: tax?.id || null,
      tax,
      modifierGroups,
      modifierGroupCount: modifierGroups.length,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
    // Check if slug already exists
    const slug = createProductDto.slug || this.generateSlug(createProductDto.name);
    const existing = await this.productRepository.findOne({
      where: { slug },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    // Check if SKU already exists
    if (createProductDto.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: createProductDto.sku },
        withDeleted: true,
      });
      if (existingSku) {
        throw new ConflictException(`Product with SKU "${createProductDto.sku}" already exists`);
      }
    }

    // Validate modifier groups exist and are active
    if (createProductDto.modifierGroupIds?.length) {
      const validGroups = await this.modifierGroupRepository.find({
        where: createProductDto.modifierGroupIds.map((id) => ({ id, isActive: true })),
      });
      if (validGroups.length !== createProductDto.modifierGroupIds.length) {
        throw new NotFoundException('One or more modifier groups are invalid or inactive');
      }
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.productRepository.create({
        name: createProductDto.name,
        slug,
        sku: createProductDto.sku || null,
        description: createProductDto.description || null,
        categoryId: createProductDto.categoryId,
        mediaId: createProductDto.mediaId || null,
        price: createProductDto.price ?? 0,
        costPrice: createProductDto.costPrice || null,
        unitType: createProductDto.unitType || 'unit',
        hasVariants: (createProductDto.modifierGroupIds?.length ?? 0) > 0,
        isAvailable: createProductDto.isAvailable ?? true,
        isFeatured: createProductDto.isFeatured ?? false,
        preparationTime: createProductDto.preparationTime || null,
        sortOrder: createProductDto.sortOrder ?? 0,
        isActive: createProductDto.isActive ?? true,
      });

      const savedProduct = await queryRunner.manager.save(product);

      // Link tax
      if (createProductDto.taxId) {
        await queryRunner.manager.query(
          `INSERT INTO product_taxes (id, product_id, tax_id, is_exclusive, created_at) VALUES (UUID(), ?, ?, 0, NOW())`,
          [savedProduct.id, createProductDto.taxId]
        );
      }

      // Link modifier groups with sort order
      if (createProductDto.modifierGroupIds?.length) {
        for (let i = 0; i < createProductDto.modifierGroupIds.length; i++) {
          await queryRunner.manager.query(
            `INSERT INTO product_modifier_groups (id, product_id, modifier_group_id, sort_order, is_active, created_at) VALUES (UUID(), ?, ?, ?, 1, NOW())`,
            [savedProduct.id, createProductDto.modifierGroupIds[i], i]
          );
        }
      }

      await queryRunner.commitTransaction();

      // Update media entityId if mediaId provided
      if (createProductDto.mediaId) {
        await this.filesService.updateEntityId(createProductDto.mediaId, savedProduct.id);
      }

      return this.findOne(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithImage(
    createProductDto: CreateProductDto,
    file: any,
    userId?: string,
  ): Promise<ProductResponse> {
    // Upload file first to get the media ID
    const uploadResult = await this.filesService.uploadFile(
      file,
      this.entityType,
      undefined, // No entityId yet - we'll update it after product creation
      userId,
    );

    // Validate modifier groups exist and are active
    if (createProductDto.modifierGroupIds?.length) {
      const validGroups = await this.modifierGroupRepository.find({
        where: createProductDto.modifierGroupIds.map((id) => ({ id, isActive: true })),
      });
      if (validGroups.length !== createProductDto.modifierGroupIds.length) {
        throw new NotFoundException('One or more modifier groups are invalid or inactive');
      }
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = this.productRepository.create({
        name: createProductDto.name,
        slug: createProductDto.slug || this.generateSlug(createProductDto.name),
        sku: createProductDto.sku || null,
        description: createProductDto.description || null,
        categoryId: createProductDto.categoryId,
        mediaId: uploadResult.id,
        price: createProductDto.price ?? 0,
        costPrice: createProductDto.costPrice || null,
        unitType: createProductDto.unitType || 'unit',
        hasVariants: (createProductDto.modifierGroupIds?.length ?? 0) > 0,
        isAvailable: createProductDto.isAvailable ?? true,
        isFeatured: createProductDto.isFeatured ?? false,
        preparationTime: createProductDto.preparationTime || null,
        sortOrder: createProductDto.sortOrder ?? 0,
        isActive: createProductDto.isActive ?? true,
      });

      const savedProduct = await queryRunner.manager.save(product);

      // Update media entityId now that we have the product ID
      await this.filesService.updateEntityId(uploadResult.id, savedProduct.id);

      // Link tax
      if (createProductDto.taxId) {
        await queryRunner.manager.query(
          `INSERT INTO product_taxes (id, product_id, tax_id, is_exclusive, created_at) VALUES (UUID(), ?, ?, 0, NOW())`,
          [savedProduct.id, createProductDto.taxId]
        );
      }

      // Link modifier groups with sort order
      if (createProductDto.modifierGroupIds?.length) {
        for (let i = 0; i < createProductDto.modifierGroupIds.length; i++) {
          await queryRunner.manager.query(
            `INSERT INTO product_modifier_groups (id, product_id, modifier_group_id, sort_order, is_active, created_at) VALUES (UUID(), ?, ?, ?, 1, NOW())`,
            [savedProduct.id, createProductDto.modifierGroupIds[i], i]
          );
        }
      }

      await queryRunner.commitTransaction();
      return this.findOne(savedProduct.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<ProductResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Product> = {};

    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

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
      }
    }

    if (query.isAvailable !== undefined) {
      where.isAvailable = query.isAvailable;
    }

    const sortField = query.sort || 'createdAt';
    const sortOrder: FindOptionsOrder<Product> = {
      [sortField]: query.order || 'DESC',
    };

    const [products, total] = await this.productRepository.findAndCount({
      where,
      order: sortOrder,
      skip,
      take: limit,
      relations: {
        category: true,
        modifierGroups: true,
      } as FindOptionsRelations<Product>,
    });

    // Transform modifierGroups to only include active ones
    products.forEach((p) => {
      if (p.modifierGroups) {
        (p as any).modifierGroups = p.modifierGroups.filter((mg) => mg.isActive);
      }
    });

    const data = await Promise.all(
      products.map((product) => this.toProductResponse(product, true))
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

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: {
        category: true,
        modifierGroups: true,
      } as FindOptionsRelations<Product>,
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Filter only active modifier groups
    if (product.modifierGroups) {
      (product as any).modifierGroups = product.modifierGroups.filter((mg) => mg.isActive);
    }

    return this.toProductResponse(product, true);
  }

  async findAllActive(): Promise<ProductResponse[]> {
    const products = await this.productRepository.find({
      where: { isActive: true, isAvailable: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: {
        category: true,
        modifierGroups: true,
      } as FindOptionsRelations<Product>,
    });

    // Filter only active modifier groups
    products.forEach((p) => {
      if (p.modifierGroups) {
        (p as any).modifierGroups = p.modifierGroups.filter((mg) => mg.isActive);
      }
    });

    // Batch load all media and taxes to avoid N+1 queries
    const productIds = products.map((p) => p.id);
    const imageUrlMap = await this.batchGetImageUrls(productIds);
    const taxMap = await this.batchGetProductTaxes(productIds);

    return Promise.all(
      products.map((product) =>
        this.toProductResponseBatch(product, true, imageUrlMap, taxMap)
      )
    );
  }

  /**
   * Batch load image URLs for multiple products (avoids N+1 queries)
   */
  private async batchGetImageUrls(productIds: string[]): Promise<Map<string, { imageUrl: string | null; mediaId: string | null }>> {
    const result = new Map<string, { imageUrl: string | null; mediaId: string | null }>();

    if (productIds.length === 0) return result;

    const mediaList = await this.mediaRepository.find({
      where: productIds.map((entityId) => ({
        entityType: 'products' as any,
        entityId,
      })),
      order: { createdAt: 'DESC' },
    });

    // Group by entityId and take first (most recent)
    const mediaByProduct = new Map<string, any>();
    for (const media of mediaList) {
      if (!mediaByProduct.has(media.entityId)) {
        mediaByProduct.set(media.entityId, media);
      }
    }

    for (const id of productIds) {
      const media = mediaByProduct.get(id);
      result.set(id, {
        imageUrl: media?.url || null,
        mediaId: media?.id || null,
      });
    }

    return result;
  }

  /**
   * Batch load taxes for multiple products (avoids N+1 queries)
   */
  private async batchGetProductTaxes(productIds: string[]): Promise<Map<string, TaxSummary | null>> {
    const result = new Map<string, TaxSummary | null>();

    if (productIds.length === 0) return result;

    const placeholders = productIds.map(() => '?').join(',');
    const taxData = await this.mediaRepository.manager.query(
      `SELECT pt.product_id, t.id, t.code, t.name, t.tax_type, t.rate
       FROM taxes t
       INNER JOIN product_taxes pt ON t.id = pt.tax_id
       WHERE pt.product_id IN (${placeholders}) AND t.is_active = 1`,
      productIds
    );

    const taxByProduct = new Map<string, any>();
    for (const row of taxData) {
      if (!taxByProduct.has(row.product_id)) {
        taxByProduct.set(row.product_id, {
          id: row.id,
          code: row.code,
          name: row.name,
          taxType: row.tax_type,
          rate: Number(row.rate),
        });
      }
    }

    for (const id of productIds) {
      result.set(id, taxByProduct.get(id) || null);
    }

    return result;
  }

  /**
   * Batch version of toProductResponse (uses pre-loaded data)
   */
  private toProductResponseBatch(
    product: Product,
    includeRelations: boolean,
    imageUrlMap: Map<string, { imageUrl: string | null; mediaId: string | null }>,
    taxMap: Map<string, TaxSummary | null>
  ): ProductResponse {
    const imageData = imageUrlMap.get(product.id) || { imageUrl: null, mediaId: null };
    const tax = taxMap.get(product.id) || null;

    let modifierGroups: ModifierGroupSummary[] = [];
    if (includeRelations && product.modifierGroups) {
      modifierGroups = product.modifierGroups
        .filter((mg) => mg.isActive)
        .sort((a, b) => (a as any).sortOrder - (b as any).sortOrder)
        .map((mg) => ({
          id: mg.id,
          name: mg.name,
          slug: mg.slug,
          selectionType: mg.selectionType,
          isRequired: mg.isRequired,
          minSelections: mg.minSelections,
          maxSelections: mg.maxSelections,
          modifierCount: mg.modifiers?.length || 0,
        }));
    }

    return {
      id: product.id,
      outletId: product.outletId,
      categoryId: product.categoryId,
      category: product.category ? { id: product.category.id, name: product.category.name } : null,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      description: product.description,
      imageUrl: imageData.imageUrl,
      mediaId: imageData.mediaId,
      price: Number(product.price),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      unitType: product.unitType,
      hasVariants: product.hasVariants || modifierGroups.length > 0,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      preparationTime: product.preparationTime,
      sortOrder: product.sortOrder,
      isActive: product.isActive,
      taxId: tax?.id || null,
      tax,
      modifierGroups,
      modifierGroupCount: modifierGroups.length,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Validate modifier groups exist and are active
    if (updateProductDto.modifierGroupIds?.length) {
      const validGroups = await this.modifierGroupRepository.find({
        where: updateProductDto.modifierGroupIds.map((mid) => ({ id: mid, isActive: true })),
      });
      if (validGroups.length !== updateProductDto.modifierGroupIds.length) {
        throw new NotFoundException('One or more modifier groups are invalid or inactive');
      }
    }

    // Use transaction for data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check slug uniqueness
      if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
        const existing = await queryRunner.manager.findOne(Product, {
          where: { slug: updateProductDto.slug },
          withDeleted: true,
        });
        if (existing) {
          throw new ConflictException(`Product with slug "${updateProductDto.slug}" already exists`);
        }
      } else if (updateProductDto.name && !updateProductDto.slug) {
        const newSlug = this.generateSlug(updateProductDto.name);
        if (newSlug !== product.slug) {
          const existing = await queryRunner.manager.findOne(Product, {
            where: { slug: newSlug },
            withDeleted: true,
          });
          if (existing) {
            throw new ConflictException(`Product with slug "${newSlug}" already exists`);
          }
          updateProductDto.slug = newSlug;
        }
      }

      // Check SKU uniqueness
      if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
        const existingSku = await queryRunner.manager.findOne(Product, {
          where: { sku: updateProductDto.sku },
          withDeleted: true,
        });
        if (existingSku) {
          throw new ConflictException(`Product with SKU "${updateProductDto.sku}" already exists`);
        }
      }

      // Build update object
      const updateData: Partial<Product> = {};
      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.slug !== undefined) updateData.slug = updateProductDto.slug;
      if (updateProductDto.sku !== undefined) updateData.sku = updateProductDto.sku || null;
      if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description || null;
      if (updateProductDto.categoryId !== undefined) updateData.categoryId = updateProductDto.categoryId;
      if (updateProductDto.mediaId !== undefined) updateData.mediaId = updateProductDto.mediaId;
      if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
      if (updateProductDto.costPrice !== undefined) updateData.costPrice = updateProductDto.costPrice || null;
      if (updateProductDto.unitType !== undefined) updateData.unitType = updateProductDto.unitType;
      if (updateProductDto.hasVariants !== undefined) updateData.hasVariants = updateProductDto.hasVariants;
      if (updateProductDto.isAvailable !== undefined) updateData.isAvailable = updateProductDto.isAvailable;
      if (updateProductDto.isFeatured !== undefined) updateData.isFeatured = updateProductDto.isFeatured;
      if (updateProductDto.preparationTime !== undefined) updateData.preparationTime = updateProductDto.preparationTime || null;
      if (updateProductDto.sortOrder !== undefined) updateData.sortOrder = updateProductDto.sortOrder;
      if (updateProductDto.isActive !== undefined) updateData.isActive = updateProductDto.isActive;

      Object.assign(product, updateData);
      await queryRunner.manager.save(product);

      // Handle tax changes
      if (updateProductDto.taxId !== undefined) {
        await queryRunner.manager.query(
          `DELETE FROM product_taxes WHERE product_id = ?`,
          [id]
        );
        if (updateProductDto.taxId) {
          await queryRunner.manager.query(
            `INSERT INTO product_taxes (id, product_id, tax_id, is_exclusive, created_at) VALUES (UUID(), ?, ?, 0, NOW())`,
            [id, updateProductDto.taxId]
          );
        }
      }

      // Handle modifier group changes with sort order
      if (updateProductDto.modifierGroupIds !== undefined) {
        await queryRunner.manager.query(
          `DELETE FROM product_modifier_groups WHERE product_id = ?`,
          [id]
        );
        for (let i = 0; i < updateProductDto.modifierGroupIds.length; i++) {
          await queryRunner.manager.query(
            `INSERT INTO product_modifier_groups (id, product_id, modifier_group_id, sort_order, is_active, created_at) VALUES (UUID(), ?, ?, ?, 1, NOW())`,
            [id, updateProductDto.modifierGroupIds[i], i]
          );
        }
        // Update hasVariants flag
        await queryRunner.manager.update(Product, id, { hasVariants: updateProductDto.modifierGroupIds.length > 0 });
      }

      await queryRunner.commitTransaction();

      // Update media entityId
      if (updateProductDto.mediaId !== undefined && updateProductDto.mediaId) {
        await this.filesService.updateEntityId(updateProductDto.mediaId, id);
      }

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.softDelete(id);
    return { message: 'Product deleted successfully' };
  }

  async restore(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.productRepository.restore(id);
    return this.findOne(id);
  }

  async findOneWithModifiers(id: string): Promise<ProductWithModifiersResponse> {
    const product = await this.productRepository.findOne({
      where: { id, isActive: true },
      relations: {
        category: true,
        modifierGroups: {
          modifiers: true,
        },
      } as FindOptionsRelations<Product>,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Get image URL
    const { imageUrl } = await this.getImageUrl(product.id);

    // Filter active modifier groups and their active modifiers
    const modifierGroups: ModifierGroupWithModifiers[] = product.modifierGroups
      .filter((mg) => mg.isActive)
      .sort((a, b) => (a as any).sortOrder - (b as any).sortOrder)
      .map((mg) => ({
        id: mg.id,
        name: mg.name,
        slug: mg.slug,
        description: mg.description,
        selectionType: mg.selectionType,
        isRequired: mg.isRequired,
        minSelections: mg.minSelections,
        maxSelections: mg.maxSelections,
        modifiers: mg.modifiers
          .filter((m) => m.isActive && m.isAvailable)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((m) => ({
            id: m.id,
            name: m.name,
            sku: m.sku,
            additionalPrice: Number(m.additionalPrice),
            isDefault: m.isDefault,
            isAvailable: m.isAvailable,
            sortOrder: m.sortOrder,
          })),
      }));

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      imageUrl,
      price: Number(product.price),
      unitType: product.unitType,
      hasVariants: modifierGroups.length > 0,
      isAvailable: product.isAvailable,
      modifierGroups,
    };
  }
}
