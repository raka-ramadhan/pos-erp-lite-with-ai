import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, FindOptionsOrder, IsNull, In } from 'typeorm';
import { DiningTable, DiningTableStatus } from './entities/dining-table.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import {
  CreateDiningTableDto,
  UpdateDiningTableDto,
  QueryDiningTableDto,
  DiningTableSortField,
  SortOrder,
} from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DiningTableResponse {
  id: string;
  outletId: string | null;
  tableCode: string;
  tableName: string;
  areaName: string | null;
  description: string | null;
  capacity: number;
  sortOrder: number;
  isActive: boolean;
  status: DiningTableStatus;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// POS-specific response with active order info
export interface POSDiningTableResponse extends DiningTableResponse {
  activeOrder: {
    id: string;
    orderNumber: string;
    orderStatus: OrderStatus;
    customerCount: number;
    itemCount: number;
    totalAmount: number;
    orderedAt: Date;
    durationMinutes: number;
  } | null;
}

@Injectable()
export class DiningTablesService {
  constructor(
    @InjectRepository(DiningTable)
    private readonly diningTableRepository: Repository<DiningTable>,
  ) {}

  private toDiningTableResponse(table: DiningTable): DiningTableResponse {
    return {
      id: table.id,
      outletId: table.outletId,
      tableCode: table.tableCode,
      tableName: table.tableName,
      areaName: table.areaName,
      description: table.description,
      capacity: table.capacity,
      sortOrder: table.sortOrder,
      isActive: table.isActive,
      status: table.status,
      createdBy: table.createdBy,
      updatedBy: table.updatedBy,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }

  async create(createDiningTableDto: CreateDiningTableDto): Promise<DiningTableResponse> {
    // Check if table code already exists (with soft deleted records)
    const existing = await this.diningTableRepository.findOne({
      where: { tableCode: createDiningTableDto.tableCode },
      withDeleted: true,
    });

    if (existing) {
      throw new ConflictException(
        `Dining table with code "${createDiningTableDto.tableCode}" already exists`,
      );
    }

    // Check if table name already exists (with soft deleted records)
    const existingByName = await this.diningTableRepository.findOne({
      where: { tableName: createDiningTableDto.tableName },
      withDeleted: true,
    });

    if (existingByName) {
      throw new ConflictException(
        `Dining table with name "${createDiningTableDto.tableName}" already exists`,
      );
    }

    const table = this.diningTableRepository.create({
      tableCode: createDiningTableDto.tableCode,
      tableName: createDiningTableDto.tableName,
      areaName: createDiningTableDto.areaName || null,
      description: createDiningTableDto.description || null,
      capacity: createDiningTableDto.capacity ?? 4,
      sortOrder: createDiningTableDto.sortOrder ?? 0,
      isActive: createDiningTableDto.isActive ?? true,
      status: createDiningTableDto.status ?? DiningTableStatus.AVAILABLE,
      outletId: createDiningTableDto.outletId || null,
    });

    const savedTable = await this.diningTableRepository.save(table);
    return this.toDiningTableResponse(savedTable);
  }

  async findAll(query: QueryDiningTableDto): Promise<PaginatedResult<DiningTableResponse>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<DiningTable> = {};

    // Search by table code or table name
    if (query.search) {
      where.tableCode = Like(`%${query.search}%`);
    }

    // Filter by area
    if (query.areaName) {
      where.areaName = query.areaName;
    }

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by active status
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    } else if (query.status) {
      // When filtering by status, don't filter by isActive
    }

    // Build order
    const sortField = query.sort || DiningTableSortField.CREATED_AT;
    const sortOrder = query.order || SortOrder.DESC;
    const order: FindOptionsOrder<DiningTable> = {
      [sortField]: sortOrder,
    };

    // Query with pagination
    const [tables, total] = await this.diningTableRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });

    return {
      data: tables.map((table) => this.toDiningTableResponse(table)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<DiningTableResponse> {
    const table = await this.diningTableRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!table) {
      throw new NotFoundException(`Dining table with ID ${id} not found`);
    }

    return this.toDiningTableResponse(table);
  }

  async findAllActive(): Promise<DiningTableResponse[]> {
    const tables = await this.diningTableRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', tableName: 'ASC' },
    });

    return tables.map((table) => this.toDiningTableResponse(table));
  }

  async update(id: string, updateDiningTableDto: UpdateDiningTableDto): Promise<DiningTableResponse> {
    const table = await this.diningTableRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!table) {
      throw new NotFoundException(`Dining table with ID ${id} not found`);
    }

    // Check if table code is being changed and already exists
    if (updateDiningTableDto.tableCode && updateDiningTableDto.tableCode !== table.tableCode) {
      const existing = await this.diningTableRepository.findOne({
        where: { tableCode: updateDiningTableDto.tableCode },
        withDeleted: true,
      });
      if (existing) {
        throw new ConflictException(
          `Dining table with code "${updateDiningTableDto.tableCode}" already exists`,
        );
      }
    }

    // Check if table name is being changed and already exists
    if (updateDiningTableDto.tableName && updateDiningTableDto.tableName !== table.tableName) {
      const existingByName = await this.diningTableRepository.findOne({
        where: { tableName: updateDiningTableDto.tableName },
        withDeleted: true,
      });
      if (existingByName) {
        throw new ConflictException(
          `Dining table with name "${updateDiningTableDto.tableName}" already exists`,
        );
      }
    }

    // Create a new object with properly typed values to avoid DTO mutation issues
    const updateData: Partial<DiningTable> = {};

    if (updateDiningTableDto.tableCode !== undefined) updateData.tableCode = updateDiningTableDto.tableCode;
    if (updateDiningTableDto.tableName !== undefined) updateData.tableName = updateDiningTableDto.tableName;
    if (updateDiningTableDto.areaName !== undefined) updateData.areaName = updateDiningTableDto.areaName || null;
    if (updateDiningTableDto.description !== undefined) {
      updateData.description = updateDiningTableDto.description || null;
    }
    if (updateDiningTableDto.capacity !== undefined) updateData.capacity = updateDiningTableDto.capacity;
    if (updateDiningTableDto.sortOrder !== undefined) updateData.sortOrder = updateDiningTableDto.sortOrder;
    if (updateDiningTableDto.isActive !== undefined) updateData.isActive = updateDiningTableDto.isActive;
    if (updateDiningTableDto.status !== undefined) updateData.status = updateDiningTableDto.status;

    Object.assign(table, updateData);
    await this.diningTableRepository.save(table);

    return this.toDiningTableResponse(table);
  }

  async remove(id: string): Promise<{ message: string }> {
    const table = await this.diningTableRepository.findOne({
      where: { id },
    });

    if (!table) {
      throw new NotFoundException(`Dining table with ID ${id} not found`);
    }

    // Soft delete the table
    await this.diningTableRepository.softDelete(id);
    return { message: 'Dining table deleted successfully' };
  }

  async restore(id: string): Promise<DiningTableResponse> {
    const table = await this.diningTableRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!table) {
      throw new NotFoundException(`Dining table with ID ${id} not found`);
    }

    await this.diningTableRepository.restore(id);

    // Reload the table
    const restoredTable = await this.diningTableRepository.findOne({
      where: { id },
    });

    return this.toDiningTableResponse(restoredTable!);
  }

  async getDistinctAreas(): Promise<string[]> {
    const result = await this.diningTableRepository
      .createQueryBuilder('dt')
      .select('DISTINCT dt.area_name', 'areaName')
      .where('dt.area_name IS NOT NULL')
      .orderBy('dt.area_name', 'ASC')
      .getRawMany();

    return result.map((r) => r.areaName).filter(Boolean);
  }

  /**
   * Get all active tables with their active order info for POS
   * This is the main endpoint for POS table selection screen
   */
  async findAllForPOS(): Promise<POSDiningTableResponse[]> {
    // Get all active tables
    const tables = await this.diningTableRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', tableName: 'ASC' },
    });

    // Get all active orders (open or in_progress)
    const activeOrderStatuses = [OrderStatus.OPEN, OrderStatus.IN_PROGRESS];
    const activeOrders = await this.diningTableRepository.manager
      .createQueryBuilder(Order, 'order')
      .where('order.orderStatus IN (:...statuses)', { statuses: activeOrderStatuses })
      .andWhere('order.tableId IS NOT NULL')
      .getMany();

    // Map orders by tableId for quick lookup
    const ordersByTableId = new Map<string, Order>();
    activeOrders.forEach((order) => {
      ordersByTableId.set(order.tableId!, order);
    });

    // Combine tables with their active orders
    return tables.map((table) => {
      const activeOrder = ordersByTableId.get(table.id);

      // Calculate duration in minutes
      const durationMinutes = activeOrder
        ? Math.floor((Date.now() - new Date(activeOrder.orderedAt).getTime()) / 60000)
        : 0;

      // Derive status from active orders: if there's an active order, table is OCCUPIED
      // This overrides the table's own status for POS display purposes
      const tableResponse = this.toDiningTableResponse(table);
      const derivedStatus = activeOrder ? 'occupied' : tableResponse.status;

      return {
        ...tableResponse,
        status: derivedStatus as any, // Override with derived status
        activeOrder: activeOrder
          ? {
              id: activeOrder.id,
              orderNumber: activeOrder.orderNumber,
              orderStatus: activeOrder.orderStatus,
              customerCount: activeOrder.customerCount,
              itemCount: 0, // Will be populated when order items are implemented
              totalAmount: Number(activeOrder.totalAmount),
              orderedAt: activeOrder.orderedAt,
              durationMinutes,
            }
          : null,
      };
    });
  }
}
