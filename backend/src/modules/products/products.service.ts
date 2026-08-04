import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, FindOptionsRelations } from 'typeorm';
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
  taxes: any[];
  modifierGroups: any[];
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
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async getImageUrl(productId: string): Promise<{ imageUrl: string | null; mediaId: string | null }> {
    const media = await this.mediaRepository.findOne({
      where: [
        { entityType: 'products', entityId: productId },
        { entityType: 'product', entityId: productId },
      ],
      order: { createdAt: 'DESC' },
    });
    return {
      imageUrl: media?.url || null,
      mediaId: media?.id || null,
    };
  }

  private async getProductTaxes(productId: string): Promise<any[]> {
    const result = await this.mediaRepository.manager.query(
      `SELECT t.* FROM taxes t
       INNER JOIN product_taxes pt ON t.id = pt.tax_id
       WHERE pt.product_id = ?`,
      [productId]
    );
    return result || [];
  }

  private async getProductModifierGroups(productId: string): Promise<any[]> {
    const result = await this.mediaRepository.manager.query(
      `SELECT mg.* FROM modifier_groups mg
       INNER JOIN product_modifier_groups pmg ON mg.id = pmg.modifier_group_id
       WHERE pmg.product_id = ?`,
      [productId]
    );
    return result || [];
  }

  private async toProductResponse(product: Product): Promise<ProductResponse> {
    const { imageUrl, mediaId } = await this.getImageUrl(product.id);
    const taxes = await this.getProductTaxes(product.id);
    const modifierGroups = await this.getProductModifierGroups(product.id);

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
      hasVariants: product.hasVariants,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured,
      preparationTime: product.preparationTime,
      sortOrder: product.sortOrder,
      isActive: product.isActive,
      taxes,
      modifierGroups,
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

    const savedProduct = await this.productRepository.save(product);

    // Link taxes
    if (createProductDto.taxIds?.length) {
      for (const taxId of createProductDto.taxIds) {
        await this.mediaRepository.manager.query(
          `INSERT INTO product_taxes (id, product_id, tax_id, is_exclusive, created_at) VALUES (UUID(), ?, ?, 0, NOW())`,
          [savedProduct.id, taxId]
        );
      }
    }

    // Link modifier groups
    if (createProductDto.modifierGroupIds?.length) {
      for (const modifierGroupId of createProductDto.modifierGroupIds) {
        await this.mediaRepository.manager.query(
          `INSERT INTO product_modifier_groups (id, product_id, modifier_group_id, sort_order, is_active, created_at) VALUES (UUID(), ?, ?, 0, 1, NOW())`,
          [savedProduct.id, modifierGroupId]
        );
      }
    }

    // Update media entityId if mediaId provided
    if (createProductDto.mediaId) {
      await this.filesService.updateEntityId(createProductDto.mediaId, savedProduct.id);
    }

    return this.findOne(savedProduct.id);
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
      relations: { category: true } as FindOptionsRelations<Product>,
    });

    const data = await Promise.all(
      products.map((product) => this.toProductResponse(product))
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
      relations: { category: true } as FindOptionsRelations<Product>,
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toProductResponse(product);
  }

  async findAllActive(): Promise<ProductResponse[]> {
    const products = await this.productRepository.find({
      where: { isActive: true, isAvailable: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      relations: { category: true } as FindOptionsRelations<Product>,
    });

    return Promise.all(
      products.map((product) => this.toProductResponse(product))
    );
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Check slug uniqueness
    if (updateProductDto.slug && updateProductDto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({
        where: { slug: updateProductDto.slug },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Product with slug "${updateProductDto.slug}" already exists`);
      }
    } else if (updateProductDto.name && !updateProductDto.slug) {
      const newSlug = this.generateSlug(updateProductDto.name);
      if (newSlug !== product.slug) {
        const existing = await this.productRepository.findOne({
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
      const existingSku = await this.productRepository.findOne({
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
    await this.productRepository.save(product);

    // Handle tax changes
    if (updateProductDto.taxIds !== undefined) {
      await this.mediaRepository.manager.query(
        `DELETE FROM product_taxes WHERE product_id = ?`,
        [id]
      );
      for (const taxId of updateProductDto.taxIds) {
        await this.mediaRepository.manager.query(
          `INSERT INTO product_taxes (id, product_id, tax_id, is_exclusive, created_at) VALUES (UUID(), ?, ?, 0, NOW())`,
          [id, taxId]
        );
      }
    }

    // Handle modifier group changes
    if (updateProductDto.modifierGroupIds !== undefined) {
      await this.mediaRepository.manager.query(
        `DELETE FROM product_modifier_groups WHERE product_id = ?`,
        [id]
      );
      for (const modifierGroupId of updateProductDto.modifierGroupIds) {
        await this.mediaRepository.manager.query(
          `INSERT INTO product_modifier_groups (id, product_id, modifier_group_id, sort_order, is_active, created_at) VALUES (UUID(), ?, ?, 0, 1, NOW())`,
          [id, modifierGroupId]
        );
      }
      await this.productRepository.update(id, { hasVariants: updateProductDto.modifierGroupIds.length > 0 });
    }

    // Update media entityId
    if (updateProductDto.mediaId !== undefined && updateProductDto.mediaId) {
      await this.filesService.updateEntityId(updateProductDto.mediaId, id);
    }

    return this.findOne(id);
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
}
