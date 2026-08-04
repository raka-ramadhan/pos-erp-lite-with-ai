import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, IsNull, Or } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto, QueryPaymentMethodDto, PaymentMethodSortField, SortOrder } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaymentMethodResponse {
  id: string;
  outletId: string;
  code: string;
  name: string;
  description: string | null;
  paymentType: string;
  provider: string | null;
  iconUrl: string | null;
  isIntegration: boolean;
  minAmount: number | null;
  maxAmount: number | null;
  sortOrder: number;
  isActive: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
  ) {}

  private toPaymentMethodResponse(pm: PaymentMethod): PaymentMethodResponse {
    return {
      id: pm.id,
      outletId: pm.outletId,
      code: pm.code,
      name: pm.name,
      description: pm.description,
      paymentType: pm.paymentType,
      provider: pm.provider,
      iconUrl: pm.iconUrl,
      isIntegration: pm.isIntegration,
      minAmount: pm.minAmount ? Number(pm.minAmount) : null,
      maxAmount: pm.maxAmount ? Number(pm.maxAmount) : null,
      sortOrder: pm.sortOrder,
      isActive: pm.isActive,
      createdBy: pm.createdBy,
      updatedBy: pm.updatedBy,
      createdAt: pm.createdAt,
      updatedAt: pm.updatedAt,
    };
  }

  async create(createDto: CreatePaymentMethodDto): Promise<PaymentMethodResponse> {
    // Check if code already exists
    const existingCode = await this.paymentMethodRepository.findOne({
      where: { code: createDto.code },
      withDeleted: true,
    });

    if (existingCode) {
      throw new ConflictException(`Payment method with code "${createDto.code}" already exists`);
    }

    // Check if name already exists
    const existingName = await this.paymentMethodRepository.findOne({
      where: { name: createDto.name },
      withDeleted: true,
    });

    if (existingName) {
      throw new ConflictException(`Payment method with name "${createDto.name}" already exists`);
    }

    const paymentMethod = this.paymentMethodRepository.create({
      code: createDto.code,
      name: createDto.name,
      description: createDto.description || null,
      paymentType: createDto.paymentType,
      provider: createDto.provider || null,
      iconUrl: createDto.iconUrl || null,
      isIntegration: createDto.isIntegration ?? false,
      minAmount: createDto.minAmount ?? null,
      maxAmount: createDto.maxAmount ?? null,
      sortOrder: createDto.sortOrder ?? 0,
      isActive: createDto.isActive ?? true,
      outletId: 'default',
    });

    const saved = await this.paymentMethodRepository.save(paymentMethod);
    return this.toPaymentMethodResponse(saved);
  }

  async findAll(query: QueryPaymentMethodDto): Promise<PaginatedResult<PaymentMethodResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Default: exclude soft-deleted records
    const where: FindOptionsWhere<PaymentMethod> = {
      deletedAt: IsNull(),
    };

    // Search by name or code
    if (query.search) {
      where.name = Like(`%${query.search}%`);
      (where as any).code = Like(`%${query.search}%`);
    }

    // Filter by payment type
    if (query.paymentType) {
      where.paymentType = query.paymentType;
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
    const sortField = query.sort || PaymentMethodSortField.SORT_ORDER;
    const sortOrder = query.order || SortOrder.ASC;
    const order: FindOptionsOrder<PaymentMethod> = {
      [sortField]: sortOrder,
    };

    const [paymentMethods, total] = await this.paymentMethodRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      withDeleted: false,
    });

    return {
      data: paymentMethods.map((pm) => this.toPaymentMethodResponse(pm)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return this.toPaymentMethodResponse(paymentMethod);
  }

  async findAllActive(): Promise<PaymentMethodResponse[]> {
    const paymentMethods = await this.paymentMethodRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    return paymentMethods.map((pm) => this.toPaymentMethodResponse(pm));
  }

  async update(id: string, updateDto: UpdatePaymentMethodDto): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // Check if code is being changed and already exists
    if (updateDto.code && updateDto.code !== paymentMethod.code) {
      const existingCode = await this.paymentMethodRepository.findOne({
        where: { code: updateDto.code },
        withDeleted: true,
      });
      if (existingCode) {
        throw new ConflictException(`Payment method with code "${updateDto.code}" already exists`);
      }
    }

    // Check if name is being changed and already exists
    if (updateDto.name && updateDto.name !== paymentMethod.name) {
      const existingName = await this.paymentMethodRepository.findOne({
        where: { name: updateDto.name },
        withDeleted: true,
      });
      if (existingName) {
        throw new ConflictException(`Payment method with name "${updateDto.name}" already exists`);
      }
    }

    // Build update data
    if (updateDto.code !== undefined) (paymentMethod as any).code = updateDto.code;
    if (updateDto.name !== undefined) (paymentMethod as any).name = updateDto.name;
    if (updateDto.description !== undefined) (paymentMethod as any).description = updateDto.description || null;
    if (updateDto.paymentType !== undefined) (paymentMethod as any).paymentType = updateDto.paymentType;
    if (updateDto.provider !== undefined) (paymentMethod as any).provider = updateDto.provider || null;
    if (updateDto.iconUrl !== undefined) (paymentMethod as any).iconUrl = updateDto.iconUrl || null;
    if (updateDto.isIntegration !== undefined) (paymentMethod as any).isIntegration = updateDto.isIntegration;
    if (updateDto.minAmount !== undefined) (paymentMethod as any).minAmount = updateDto.minAmount;
    if (updateDto.maxAmount !== undefined) (paymentMethod as any).maxAmount = updateDto.maxAmount;
    if (updateDto.sortOrder !== undefined) (paymentMethod as any).sortOrder = updateDto.sortOrder;
    if (updateDto.isActive !== undefined) (paymentMethod as any).isActive = updateDto.isActive;

    const updated = await this.paymentMethodRepository.save(paymentMethod);
    return this.toPaymentMethodResponse(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    // If already deleted, return success (idempotent)
    if (paymentMethod.deletedAt) {
      return { message: 'Payment method is already deleted' };
    }

    await this.paymentMethodRepository.softDelete(id);
    return { message: 'Payment method deleted successfully' };
  }

  async restore(id: string): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!paymentMethod) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    await this.paymentMethodRepository.restore(id);

    const restored = await this.paymentMethodRepository.findOne({
      where: { id },
    });

    return this.toPaymentMethodResponse(restored!);
  }
}
