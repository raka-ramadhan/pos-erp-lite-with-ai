import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull, FindOptionsWhere, In } from 'typeorm';
import { Discount, DiscountType } from './entities/discount.entity';
import { CreateDiscountDto, UpdateDiscountDto, QueryDiscountDto } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto, userId?: string): Promise<Discount> {
    // Validate code uniqueness if provided
    if (createDiscountDto.code) {
      const existing = await this.discountRepository.findOne({
        where: { code: createDiscountDto.code, outletId: 'default' },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(`Discount with code "${createDiscountDto.code}" already exists`);
      }
    }

    // Validate name uniqueness
    const existingByName = await this.discountRepository.findOne({
      where: { name: createDiscountDto.name, outletId: 'default' },
      withDeleted: true,
    });
    if (existingByName) {
      throw new ConflictException(`Discount with name "${createDiscountDto.name}" already exists`);
    }

    // Validate date range
    if (createDiscountDto.startDate && createDiscountDto.endDate) {
      if (new Date(createDiscountDto.startDate) > new Date(createDiscountDto.endDate)) {
        throw new BadRequestException('End date cannot be before start date');
      }
    }

    // Validate percentage value
    if (createDiscountDto.discountType === DiscountType.PERCENTAGE && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    const discount = this.discountRepository.create({
      ...createDiscountDto,
      outletId: 'default',
      createdBy: userId,
      updatedBy: userId,
      startDate: createDiscountDto.startDate ? new Date(createDiscountDto.startDate) : null,
      endDate: createDiscountDto.endDate ? new Date(createDiscountDto.endDate) : null,
    });

    return this.discountRepository.save(discount);
  }

  async findAll(query: QueryDiscountDto): Promise<PaginatedResult<Discount>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Discount> = {
      outletId: 'default',
      deletedAt: IsNull(),
    };

    // Search
    if (query.search) {
      where.name = Like(`%${query.search}%`);
    }

    // Filter by discount type
    if (query.discountType) {
      where.discountType = query.discountType;
    }

    // Filter by status
    if (query.status === 'active') {
      where.isActive = true;
    } else if (query.status === 'inactive') {
      where.isActive = false;
    }

    // Sort
    const sortField = query.sort || 'sortOrder';
    const sortOrder = query.order || 'ASC';

    const allowedSortFields = ['sortOrder', 'name', 'code', 'value', 'createdAt'];
    const sortColumn = allowedSortFields.includes(sortField) ? sortField : 'sortOrder';

    const [data, total] = await this.discountRepository.findAndCount({
      where,
      order: { [sortColumn]: sortOrder },
      skip,
      take: limit,
    });

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

  async findAllActive(): Promise<Discount[]> {
    const now = new Date();
    return this.discountRepository.find({
      where: {
        outletId: 'default',
        isActive: true,
        deletedAt: IsNull(),
      },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id, outletId: 'default' },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID "${id}" not found`);
    }

    return discount;
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto, userId?: string): Promise<Discount> {
    const discount = await this.findOne(id);

    // Validate code uniqueness if changing
    if (updateDiscountDto.code && updateDiscountDto.code !== discount.code) {
      const existing = await this.discountRepository.findOne({
        where: { code: updateDiscountDto.code, outletId: 'default' },
        withDeleted: true,
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Discount with code "${updateDiscountDto.code}" already exists`);
      }
    }

    // Validate name uniqueness if changing
    if (updateDiscountDto.name && updateDiscountDto.name !== discount.name) {
      const existingByName = await this.discountRepository.findOne({
        where: { name: updateDiscountDto.name, outletId: 'default' },
        withDeleted: true,
      });
      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(`Discount with name "${updateDiscountDto.name}" already exists`);
      }
    }

    // Validate date range
    const startDate = updateDiscountDto.startDate !== undefined
      ? new Date(updateDiscountDto.startDate!)
      : discount.startDate;
    const endDate = updateDiscountDto.endDate !== undefined
      ? new Date(updateDiscountDto.endDate!)
      : discount.endDate;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('End date cannot be before start date');
    }

    // Validate percentage value
    const value = updateDiscountDto.value ?? discount.value;
    const discountType = updateDiscountDto.discountType ?? discount.discountType;
    if (discountType === DiscountType.PERCENTAGE && value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    Object.assign(discount, {
      ...updateDiscountDto,
      updatedBy: userId,
      startDate: updateDiscountDto.startDate !== undefined
        ? (updateDiscountDto.startDate ? new Date(updateDiscountDto.startDate) : null)
        : discount.startDate,
      endDate: updateDiscountDto.endDate !== undefined
        ? (updateDiscountDto.endDate ? new Date(updateDiscountDto.endDate) : null)
        : discount.endDate,
    });

    return this.discountRepository.save(discount);
  }

  async remove(id: string): Promise<void> {
    const discount = await this.findOne(id);
    await this.discountRepository.softDelete(id);
  }

  async restore(id: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id, outletId: 'default' },
      withDeleted: true,
    });

    if (!discount || discount.deletedAt === null) {
      throw new NotFoundException(`Discount with ID "${id}" not found`);
    }

    await this.discountRepository.restore(id);
    return this.findOne(id);
  }
}
