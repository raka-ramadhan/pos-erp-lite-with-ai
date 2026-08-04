import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, IsNull } from 'typeorm';
import { Tax } from './entities/tax.entity';
import { CreateTaxDto, UpdateTaxDto, QueryTaxDto, TaxSortField, SortOrder } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TaxResponse {
  id: string;
  outletId: string | null;
  code: string;
  name: string;
  description: string | null;
  taxType: string;
  rate: number;
  isDefault: boolean;
  calculationBase: string;
  calculationOrder: number;
  isInclusive: boolean;
  isActive: boolean;
  sortOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TaxesService {
  constructor(
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  private toTaxResponse(tax: Tax): TaxResponse {
    return {
      id: tax.id,
      outletId: tax.outletId,
      code: tax.code,
      name: tax.name,
      description: tax.description,
      taxType: tax.taxType,
      rate: Number(tax.rate),
      isDefault: tax.isDefault,
      calculationBase: tax.calculationBase,
      calculationOrder: tax.calculationOrder,
      isInclusive: tax.isInclusive,
      isActive: tax.isActive,
      sortOrder: (tax as any).sortOrder ?? 0,
      createdBy: tax.createdBy,
      updatedBy: tax.updatedBy,
      createdAt: tax.createdAt,
      updatedAt: tax.updatedAt,
    };
  }

  async create(createTaxDto: CreateTaxDto): Promise<TaxResponse> {
    // Check if code already exists
    const existingCode = await this.taxRepository.findOne({
      where: { code: createTaxDto.code },
      withDeleted: true,
    });

    if (existingCode) {
      throw new ConflictException(`Tax with code "${createTaxDto.code}" already exists`);
    }

    // Check if name already exists
    const existingName = await this.taxRepository.findOne({
      where: { name: createTaxDto.name },
      withDeleted: true,
    });

    if (existingName) {
      throw new ConflictException(`Tax with name "${createTaxDto.name}" already exists`);
    }

    // Validate percentage rate
    if (createTaxDto.taxType === 'percentage' && createTaxDto.rate > 100) {
      throw new ConflictException('Percentage tax rate cannot exceed 100%');
    }

    const tax = this.taxRepository.create({
      code: createTaxDto.code,
      name: createTaxDto.name,
      description: createTaxDto.description || null,
      taxType: createTaxDto.taxType,
      rate: createTaxDto.rate,
      isDefault: createTaxDto.isDefault ?? false,
      calculationBase: createTaxDto.calculationBase || 'subtotal',
      calculationOrder: createTaxDto.calculationOrder ?? 1,
      isInclusive: createTaxDto.isInclusive ?? false,
      isActive: createTaxDto.isActive ?? true,
      outletId: null,
    });

    const savedTax = await this.taxRepository.save(tax);
    return this.toTaxResponse(savedTax);
  }

  async findAll(query: QueryTaxDto): Promise<PaginatedResult<TaxResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Default: exclude soft-deleted records
    const where: FindOptionsWhere<Tax> = {
      deletedAt: IsNull(),
    };

    // Search by name or code
    if (query.search) {
      where.name = Like(`%${query.search}%`);
      (where as any).code = Like(`%${query.search}%`);
    }

    // Filter by tax type
    if (query.taxType) {
      where.taxType = query.taxType;
    } else if (query.type && query.type !== 'all') {
      where.taxType = query.type;
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
    const sortField = query.sort || TaxSortField.CALCULATION_ORDER;
    const sortOrder = query.order || SortOrder.ASC;
    const order: FindOptionsOrder<Tax> = {
      [sortField]: sortOrder,
    };

    const [taxes, total] = await this.taxRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      withDeleted: false,
    });

    return {
      data: taxes.map((tax) => this.toTaxResponse(tax)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TaxResponse> {
    const tax = await this.taxRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    return this.toTaxResponse(tax);
  }

  async findAllActive(): Promise<TaxResponse[]> {
    const taxes = await this.taxRepository.find({
      where: { isActive: true },
      order: { calculationOrder: 'ASC', name: 'ASC' },
    });

    return taxes.map((tax) => this.toTaxResponse(tax));
  }

  async update(id: string, updateTaxDto: UpdateTaxDto): Promise<TaxResponse> {
    const tax = await this.taxRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    // Check if code is being changed and already exists
    if (updateTaxDto.code && updateTaxDto.code !== tax.code) {
      const existingCode = await this.taxRepository.findOne({
        where: { code: updateTaxDto.code },
        withDeleted: true,
      });
      if (existingCode) {
        throw new ConflictException(`Tax with code "${updateTaxDto.code}" already exists`);
      }
    }

    // Check if name is being changed and already exists
    if (updateTaxDto.name && updateTaxDto.name !== tax.name) {
      const existingName = await this.taxRepository.findOne({
        where: { name: updateTaxDto.name },
        withDeleted: true,
      });
      if (existingName) {
        throw new ConflictException(`Tax with name "${updateTaxDto.name}" already exists`);
      }
    }

    // Validate percentage rate
    const effectiveTaxType = updateTaxDto.taxType ?? tax.taxType;
    const effectiveRate = updateTaxDto.rate ?? tax.rate;
    if (effectiveTaxType === 'percentage' && effectiveRate > 100) {
      throw new ConflictException('Percentage tax rate cannot exceed 100%');
    }

    // Build update data
    if (updateTaxDto.code !== undefined) (tax as any).code = updateTaxDto.code;
    if (updateTaxDto.name !== undefined) (tax as any).name = updateTaxDto.name;
    if (updateTaxDto.description !== undefined) (tax as any).description = updateTaxDto.description || null;
    if (updateTaxDto.taxType !== undefined) (tax as any).taxType = updateTaxDto.taxType;
    if (updateTaxDto.rate !== undefined) (tax as any).rate = updateTaxDto.rate;
    if (updateTaxDto.isDefault !== undefined) (tax as any).isDefault = updateTaxDto.isDefault;
    if (updateTaxDto.calculationBase !== undefined) (tax as any).calculationBase = updateTaxDto.calculationBase;
    if (updateTaxDto.calculationOrder !== undefined) (tax as any).calculationOrder = updateTaxDto.calculationOrder;
    if (updateTaxDto.isInclusive !== undefined) (tax as any).isInclusive = updateTaxDto.isInclusive;
    if (updateTaxDto.isActive !== undefined) (tax as any).isActive = updateTaxDto.isActive;

    const updatedTax = await this.taxRepository.save(tax);
    return this.toTaxResponse(updatedTax);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tax = await this.taxRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    // If already deleted, return success (idempotent)
    if (tax.deletedAt) {
      return { message: 'Tax is already deleted' };
    }

    await this.taxRepository.softDelete(id);
    return { message: 'Tax deleted successfully' };
  }

  async restore(id: string): Promise<TaxResponse> {
    const tax = await this.taxRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!tax) {
      throw new NotFoundException(`Tax with ID ${id} not found`);
    }

    await this.taxRepository.restore(id);

    const restoredTax = await this.taxRepository.findOne({
      where: { id },
    });

    return this.toTaxResponse(restoredTax!);
  }
}
