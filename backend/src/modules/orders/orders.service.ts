import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { Order, OrderType, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemModifier } from './entities/order-item-modifier.entity';
import { Tax } from '../taxes/entities/tax.entity';
import { Discount, DiscountType } from '../discounts/entities/discount.entity';
import { Product } from '../products/entities/product.entity';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
  CreateOrderItemDto,
  UpdateOrderItemDto,
  ApplyDiscountDto,
  OrderItemResponseDto,
  OrderResponseDto,
  OrderWithItemsResponseDto,
  OrderCalculationResponseDto,
} from './dto';

export interface OrderCalculationResult {
  subtotal: number;
  productDiscountTotal: number;
  subtotalAfterProductDiscount: number;
  orderDiscountAmount: number;
  subtotalAfterDiscount: number;
  serviceChargeAmount: number;
  taxAmount: number;
  totalAmount: number;
  appliedDiscountId: string | null;
  appliedDiscountName: string | null;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemModifier)
    private readonly orderItemModifierRepository: Repository<OrderItemModifier>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate unique order number with format: ORD-YYYYMMDD-XXXXXX
   * Uses database transaction with row locking for concurrency safety
   */
  async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const prefix = `ORD-${dateStr}-`;

    // Use transaction with pessimistic lock for concurrency safety
    return await this.dataSource.transaction(async (manager) => {
      // Get the latest order number for today with row lock
      const latestOrder = await manager
        .createQueryBuilder(Order, 'order')
        .where('order.orderNumber LIKE :prefix', { prefix: `${prefix}%` })
        .setLock('pessimistic_write')
        .orderBy('order.orderNumber', 'DESC')
        .getOne();

      let sequence = 1;
      if (latestOrder) {
        // Extract sequence number from latest order
        const lastSequence = parseInt(
          latestOrder.orderNumber.split('-')[2],
          10,
        );
        sequence = lastSequence + 1;
      }

      // Format: ORD-YYYYMMDD-XXXXXX (6 digit sequence)
      return `${prefix}${sequence.toString().padStart(6, '0')}`;
    });
  }

  /**
   * Create a new order with order number generation
   */
  async create(
    createOrderDto: CreateOrderDto,
    userId?: string,
  ): Promise<Order> {
    // Business validation: Dine-in orders must have table
    if (createOrderDto.orderType === OrderType.DINE_IN && !createOrderDto.tableId) {
      throw new BadRequestException(
        'Table is required for Dine-In orders',
      );
    }

    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    // Create order entity
    const order = this.orderRepository.create({
      ...createOrderDto,
      orderNumber,
      orderStatus: createOrderDto.orderStatus || OrderStatus.OPEN,
      createdBy: userId || null,
    });

    const savedOrder = await this.orderRepository.save(order);

    // If dine-in with table, load table relation
    if (savedOrder.tableId) {
      return this.findOne(savedOrder.id);
    }

    return savedOrder;
  }

  /**
   * Find all orders with optional filtering
   */
  async findAll(query: OrderQueryDto): Promise<Order[]> {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table');

    if (query.orderType) {
      qb.andWhere('order.orderType = :orderType', {
        orderType: query.orderType,
      });
    }

    if (query.orderStatus) {
      qb.andWhere('order.orderStatus = :orderStatus', {
        orderStatus: query.orderStatus,
      });
    }

    if (query.tableId) {
      qb.andWhere('order.tableId = :tableId', { tableId: query.tableId });
    }

    if (query.dateFrom) {
      qb.andWhere('order.orderedAt >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('order.orderedAt <= :dateTo', { dateTo: query.dateTo });
    }

    if (query.search) {
      qb.andWhere(
        '(order.orderNumber LIKE :search OR order.notes LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return qb.orderBy('order.createdAt', 'DESC').getMany();
  }

  /**
   * Find single order by ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { table: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: { table: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Order with number ${orderNumber} not found`,
      );
    }

    return order;
  }

  /**
   * Update order
   */
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
    userId?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Business validation: Cannot update completed or cancelled orders
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update completed or cancelled orders',
      );
    }

    Object.assign(order, updateOrderDto);
    order.updatedBy = userId || null;

    return this.orderRepository.save(order);
  }

  /**
   * Update order status with proper state transitions
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
    userId?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);

    const { orderStatus, cancelledReason } = updateStatusDto;

    // Validate status transition
    this.validateStatusTransition(order.orderStatus, orderStatus);

    // Handle cancellation
    if (orderStatus === OrderStatus.CANCELLED) {
      if (!cancelledReason) {
        throw new BadRequestException(
          'Cancellation reason is required',
        );
      }
      order.cancelledAt = new Date();
      order.cancelledReason = cancelledReason;
    }

    // Handle completion
    if (orderStatus === OrderStatus.COMPLETED) {
      order.completedAt = new Date();
    }

    // Handle confirmation
    if (
      order.orderStatus === OrderStatus.OPEN &&
      orderStatus === OrderStatus.IN_PROGRESS
    ) {
      order.confirmedAt = new Date();
    }

    order.orderStatus = orderStatus;
    order.updatedBy = userId || null;

    return this.orderRepository.save(order);
  }

  /**
   * Validate order status transitions
   */
  private validateStatusTransition(
    current: OrderStatus,
    next: OrderStatus,
  ): void {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.OPEN]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED],
      [OrderStatus.IN_PROGRESS]: [
        OrderStatus.COMPLETED,
        OrderStatus.CANCELLED,
      ],
      [OrderStatus.COMPLETED]: [], // Terminal state
      [OrderStatus.CANCELLED]: [], // Terminal state
    };

    if (!allowedTransitions[current].includes(next)) {
      throw new BadRequestException(
        `Invalid status transition from ${current} to ${next}`,
      );
    }
  }

  /**
   * Get open orders count (useful for POS)
   */
  async getOpenOrdersCount(): Promise<number> {
    return this.orderRepository.count({
      where: [
        { orderStatus: OrderStatus.OPEN },
        { orderStatus: OrderStatus.IN_PROGRESS },
      ],
    });
  }

  /**
   * Get open order for a specific table
   */
  async getOpenOrderByTable(tableId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: {
        tableId,
        orderStatus: OrderStatus.OPEN,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Assign a table to an order
   * Used when selecting a table for dine-in order
   */
  async assignTable(orderId: string, tableId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    // Business validation: Cannot modify completed or cancelled orders
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot assign table to completed or cancelled orders',
      );
    }

    // Business validation: Order must be dine_in type
    if (order.orderType !== OrderType.DINE_IN) {
      throw new BadRequestException(
        'Table assignment is only allowed for Dine-In orders',
      );
    }

    // Check if table already has an active order (excluding current order)
    const existingOrder = await this.orderRepository.findOne({
      where: {
        tableId,
        orderStatus: OrderStatus.OPEN,
      },
    });

    // Also check in_progress status
    const existingOrderInProgress = await this.orderRepository.findOne({
      where: {
        tableId,
        orderStatus: OrderStatus.IN_PROGRESS,
      },
    });

    if (existingOrder && existingOrder.id !== orderId) {
      throw new BadRequestException(
        `Table is already occupied by order ${existingOrder.orderNumber}`,
      );
    }

    if (existingOrderInProgress && existingOrderInProgress.id !== orderId) {
      throw new BadRequestException(
        `Table is already occupied by order ${existingOrderInProgress.orderNumber}`,
      );
    }

    // Assign table
    order.tableId = tableId;
    return this.orderRepository.save(order);
  }

  /**
   * Change table - move order from one table to another
   * Used when customer wants to change their table
   */
  async changeTable(orderId: string, newTableId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    // Business validation: Cannot modify completed or cancelled orders
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot change table for completed or cancelled orders',
      );
    }

    // Business validation: Order must have a current table
    if (!order.tableId) {
      throw new BadRequestException('Order does not have a table assigned');
    }

    // Business validation: Cannot change to same table
    if (order.tableId === newTableId) {
      throw new BadRequestException('New table must be different from current table');
    }

    // Check if new table already has an active order
    const existingOrder = await this.orderRepository.findOne({
      where: {
        tableId: newTableId,
        orderStatus: OrderStatus.OPEN,
      },
    });

    const existingOrderInProgress = await this.orderRepository.findOne({
      where: {
        tableId: newTableId,
        orderStatus: OrderStatus.IN_PROGRESS,
      },
    });

    if (existingOrder) {
      throw new BadRequestException(
        `New table is already occupied by order ${existingOrder.orderNumber}`,
      );
    }

    if (existingOrderInProgress) {
      throw new BadRequestException(
        `New table is already occupied by order ${existingOrderInProgress.orderNumber}`,
      );
    }

    // Change table
    order.tableId = newTableId;
    return this.orderRepository.save(order);
  }

  // ==================== ORDER ITEMS ====================

  /**
   * Get all order items for an order with modifiers and product
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    // Verify order exists
    await this.findOne(orderId);

    return this.orderItemRepository.find({
      where: { orderId },
      relations: { modifiers: true, product: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Add item to order
   * If product already exists (same product + same modifiers), increment quantity instead of creating new item
   */
  async addOrderItem(
    orderId: string,
    createDto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    const order = await this.findOne(orderId);

    // Business validation: Cannot modify completed or cancelled orders
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot add items to completed or cancelled orders',
      );
    }

    // Calculate modifier total
    let modifierTotal = 0;
    if (createDto.modifiers && createDto.modifiers.length > 0) {
      modifierTotal = createDto.modifiers.reduce(
        (sum, mod) => sum + (mod.unitPrice * mod.quantity),
        0,
      );
    }

    // Calculate subtotal: (basePrice + modifierTotal) * quantity
    const itemSubtotal = (createDto.unitPrice + modifierTotal) * createDto.quantity;

    // Get next sort order
    const maxSortOrder = await this.orderItemRepository
      .createQueryBuilder('item')
      .where('item.orderId = :orderId', { orderId })
      .select('MAX(item.sortOrder)', 'max')
      .getRawOne();

    const sortOrder = (maxSortOrder?.max || 0) + 1;

    // Generate variantName from selected modifiers
    let variantName: string | null = null;
    if (createDto.modifiers && createDto.modifiers.length > 0) {
      variantName = createDto.modifiers.map((m) => m.modifierName).join(', ');
    }

    // Check if same product exists with same modifiers
    // Only merge if no modifiers selected (simple add)
    if (!createDto.modifiers || createDto.modifiers.length === 0) {
      const existingItem = await this.orderItemRepository.findOne({
        where: {
          orderId,
          productId: createDto.productId,
          variantName: IsNull(),
        },
      });

      if (existingItem) {
        // Increment quantity
        existingItem.quantity += createDto.quantity;
        existingItem.subtotal = Number(existingItem.quantity) * Number(existingItem.unitPrice);
        const savedItem = await this.orderItemRepository.save(existingItem);

        // Recalculate order totals
        await this.recalculateOrderTotals(orderId);

        return savedItem;
      }
    }

    // Create new order item
    const orderItem = this.orderItemRepository.create({
      orderId,
      productId: createDto.productId,
      variantName,
      quantity: createDto.quantity,
      unitPrice: createDto.unitPrice,
      subtotal: itemSubtotal,
      notes: createDto.notes || null,
      sortOrder,
    });

    const savedItem = await this.orderItemRepository.save(orderItem);

    // Save modifiers if any
    if (createDto.modifiers && createDto.modifiers.length > 0) {
      const orderItemModifiers = createDto.modifiers.map((mod) =>
        this.orderItemModifierRepository.create({
          orderItemId: savedItem.id,
          modifierId: mod.modifierId,
          modifierName: mod.modifierName,
          quantity: mod.quantity,
          unitPrice: mod.unitPrice,
          totalAmount: mod.unitPrice * mod.quantity,
        }),
      );
      await this.orderItemModifierRepository.save(orderItemModifiers);
    }

    // Recalculate order totals
    await this.recalculateOrderTotals(orderId);

    // Return with modifiers loaded
    return this.getOrderItemWithModifiers(savedItem.id);
  }

  /**
   * Get order item with modifiers
   */
  private async getOrderItemWithModifiers(orderItemId: string): Promise<OrderItem> {
    return this.orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: { modifiers: true },
    }) as Promise<OrderItem>;
  }

  /**
   * Update order item (quantity, notes, etc.)
   */
  async updateOrderItem(
    orderId: string,
    itemId: string,
    updateDto: UpdateOrderItemDto,
  ): Promise<OrderItem> {
    const order = await this.findOne(orderId);

    // Business validation
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update items in completed or cancelled orders',
      );
    }

    const orderItem = await this.orderItemRepository.findOne({
      where: { id: itemId, orderId },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${itemId} not found`);
    }

    // Update fields
    if (updateDto.quantity !== undefined) {
      orderItem.quantity = updateDto.quantity;
    }
    if (updateDto.variantName !== undefined) {
      orderItem.variantName = updateDto.variantName;
    }
    if (updateDto.notes !== undefined) {
      orderItem.notes = updateDto.notes;
    }

    // Recalculate subtotal
    orderItem.subtotal = Number(orderItem.quantity) * Number(orderItem.unitPrice);

    const savedItem = await this.orderItemRepository.save(orderItem);

    // Recalculate order totals
    await this.recalculateOrderTotals(orderId);

    return savedItem;
  }

  /**
   * Update order item notes only
   */
  async updateOrderItemNotes(
    orderId: string,
    itemId: string,
    notes: string,
  ): Promise<OrderItem> {
    return this.updateOrderItem(orderId, itemId, { notes });
  }

  /**
   * Remove item from order
   */
  async removeOrderItem(orderId: string, itemId: string): Promise<void> {
    const order = await this.findOne(orderId);

    // Business validation
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot remove items from completed or cancelled orders',
      );
    }

    const orderItem = await this.orderItemRepository.findOne({
      where: { id: itemId, orderId },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${itemId} not found`);
    }

    await this.orderItemRepository.remove(orderItem);

    // Recalculate order totals
    await this.recalculateOrderTotals(orderId);
  }

  /**
   * Recalculate order totals with full calculation (discounts + taxes)
   * This is the Single Source of Truth for all order calculations
   */
  private async recalculateOrderTotals(orderId: string): Promise<void> {
    const order = await this.findOne(orderId);
    const items = await this.orderItemRepository.find({
      where: { orderId },
    });

    // Calculate base subtotal from items
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.subtotal),
      0,
    );

    // Calculate full order with discounts and taxes
    const calculation = await this.calculateOrderTotals(orderId, subtotal, order.discountAmount > 0 ? null : undefined);

    await this.orderRepository.update(orderId, {
      subtotal,
      discountAmount: calculation.orderDiscountAmount,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
    });
  }

  /**
   * Calculate order totals including discounts and taxes
   */
  async calculateOrderTotals(
    orderId: string,
    subtotal: number,
    appliedDiscountId?: string | null,
  ): Promise<OrderCalculationResult> {
    const order = await this.findOne(orderId);

    let productDiscountTotal = 0;
    let subtotalAfterProductDiscount = subtotal;

    // Calculate order discount
    let orderDiscountAmount = 0;
    let discountName: string | null = null;
    let discountId: string | null = appliedDiscountId ?? null;

    // Check if there's an existing discount applied (only if no new discount passed)
    const effectiveDiscountId = appliedDiscountId !== undefined
      ? appliedDiscountId
      : (order.discountAmount > 0 ? null : undefined);

    if (effectiveDiscountId) {
      const discount = await this.discountRepository.findOne({
        where: { id: effectiveDiscountId, isActive: true },
      });

      if (discount && this.isDiscountValid(discount, subtotalAfterProductDiscount)) {
        discountId = discount.id;
        discountName = discount.name;
        orderDiscountAmount = this.calculateDiscountAmount(
          discount.discountType,
          Number(discount.value),
          subtotalAfterProductDiscount,
          discount.maxDiscountAmount ? Number(discount.maxDiscountAmount) : null,
        );
      }
    }

    // Subtotal after discount
    const subtotalAfterDiscount = subtotalAfterProductDiscount - orderDiscountAmount;

    // Calculate taxes
    const activeTaxes = await this.taxRepository.find({
      where: { isActive: true },
      order: { calculationOrder: 'ASC', name: 'ASC' },
    });

    let totalTaxAmount = 0;
    for (const tax of activeTaxes) {
      // Calculate tax based on calculation base
      const taxableAmount = tax.calculationBase === 'after_discount'
        ? subtotalAfterDiscount
        : subtotalAfterProductDiscount;

      let taxAmount: number;
      if (tax.taxType === 'percentage') {
        taxAmount = taxableAmount * (Number(tax.rate) / 100);
      } else {
        taxAmount = Number(tax.rate);
      }

      // For inclusive tax
      if (tax.isInclusive) {
        taxAmount = taxableAmount - (taxableAmount / (1 + Number(tax.rate) / 100));
      }

      totalTaxAmount += taxAmount;
    }

    totalTaxAmount = Math.round(totalTaxAmount * 100) / 100;

    // Calculate grand total
    const totalAmount = Math.round((subtotalAfterDiscount + totalTaxAmount) * 100) / 100;

    return {
      subtotal,
      productDiscountTotal,
      subtotalAfterProductDiscount,
      orderDiscountAmount,
      subtotalAfterDiscount,
      serviceChargeAmount: 0,
      taxAmount: totalTaxAmount,
      totalAmount,
      appliedDiscountId: discountId,
      appliedDiscountName: discountName,
    };
  }

  /**
   * Check if discount is valid for current order
   */
  private isDiscountValid(discount: Discount, subtotal: number): boolean {
    const now = new Date();
    if (discount.startDate && new Date(discount.startDate) > now) {
      return false;
    }
    if (discount.endDate && new Date(discount.endDate) < now) {
      return false;
    }
    if (discount.minOrderAmount && Number(discount.minOrderAmount) > subtotal) {
      return false;
    }
    return true;
  }

  /**
   * Calculate discount amount based on type
   */
  private calculateDiscountAmount(
    discountType: DiscountType,
    value: number,
    baseAmount: number,
    maxDiscountAmount?: number | null,
  ): number {
    if (baseAmount <= 0) return 0;

    let discountAmount: number;
    if (discountType === DiscountType.PERCENTAGE) {
      discountAmount = baseAmount * (Number(value) / 100);
    } else {
      discountAmount = Number(value);
    }

    if (maxDiscountAmount && discountAmount > maxDiscountAmount) {
      discountAmount = maxDiscountAmount;
    }
    if (discountAmount > baseAmount) {
      discountAmount = baseAmount;
    }

    return Math.round(discountAmount * 100) / 100;
  }

  /**
   * Apply discount to order
   */
  async applyDiscount(
    orderId: string,
    applyDiscountDto: ApplyDiscountDto,
  ): Promise<Order> {
    const order = await this.findOne(orderId);

    // Business validation
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot apply discount to completed or cancelled orders');
    }

    const { discountId } = applyDiscountDto;

    // Get current subtotal
    const items = await this.orderItemRepository.find({ where: { orderId } });
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    // Validate discount
    if (discountId) {
      const discount = await this.discountRepository.findOne({
        where: { id: discountId, isActive: true },
      });

      if (!discount) {
        throw new NotFoundException('Discount not found');
      }

      if (!this.isDiscountValid(discount, subtotal)) {
        throw new BadRequestException('Discount is not valid for this order');
      }
    }

    // Calculate with discount
    const calculation = await this.calculateOrderTotals(orderId, subtotal, discountId);

    // Update order
    await this.orderRepository.update(orderId, {
      discountAmount: calculation.orderDiscountAmount,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
    });

    return this.findOne(orderId);
  }

  /**
   * Remove discount from order
   */
  async removeDiscount(orderId: string): Promise<Order> {
    const order = await this.findOne(orderId);

    // Business validation
    if (
      order.orderStatus === OrderStatus.COMPLETED ||
      order.orderStatus === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot remove discount from completed or cancelled orders');
    }

    // Get current subtotal
    const items = await this.orderItemRepository.find({ where: { orderId } });
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    // Recalculate without discount
    const calculation = await this.calculateOrderTotals(orderId, subtotal, null);

    // Update order
    await this.orderRepository.update(orderId, {
      discountAmount: 0,
      taxAmount: calculation.taxAmount,
      totalAmount: calculation.totalAmount,
    });

    return this.findOne(orderId);
  }

  /**
   * Get order calculation preview (for frontend)
   */
  async getOrderCalculation(orderId: string): Promise<OrderCalculationResult> {
    const order = await this.findOne(orderId);

    const items = await this.orderItemRepository.find({ where: { orderId } });
    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    return this.calculateOrderTotals(orderId, subtotal);
  }

  /**
   * Get order with items
   */
  async getOrderWithItems(orderId: string): Promise<{ order: Order; items: OrderItem[] }> {
    const order = await this.findOne(orderId);
    const items = await this.getOrderItems(orderId);
    return { order, items };
  }

  /**
   * Get order with items - response DTO (includes product name)
   */
  async getOrderWithItemsResponse(orderId: string): Promise<OrderWithItemsResponseDto> {
    const order = await this.findOne(orderId);
    const items = await this.getOrderItems(orderId);

    return {
      order: this.mapOrderToResponse(order),
      items: items.map(item => this.mapOrderItemToResponse(item)),
    };
  }

  /**
   * Get order calculation - response DTO
   */
  async getOrderCalculationResponse(orderId: string): Promise<OrderCalculationResponseDto> {
    return this.getOrderCalculation(orderId);
  }

  /**
   * Map Order entity to OrderResponseDto
   */
  private mapOrderToResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      orderStatus: order.orderStatus,
      subtotal: Number(order.subtotal),
      taxAmount: Number(order.taxAmount),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      totalPaid: Number(order.totalPaid),
      changeAmount: Number(order.changeAmount),
      customerCount: order.customerCount,
      notes: order.notes,
      table: order.table ? {
        id: order.table.id,
        tableCode: order.table.tableCode,
        tableName: order.table.tableName,
        areaName: order.table.areaName || null,
      } : null,
      orderedAt: order.orderedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  /**
   * Map OrderItem entity to OrderItemResponseDto (includes product name)
   */
  private mapOrderItemToResponse(item: OrderItem): OrderItemResponseDto {
    // Get product name from already loaded relation (no additional query)
    const productName = item.product?.name || null;

    return {
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName,
      variantName: item.variantName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
      notes: item.notes,
      sortOrder: item.sortOrder,
      modifiers: (item.modifiers || []).map(mod => ({
        id: mod.id,
        modifierId: mod.modifierId,
        modifierName: mod.modifierName,
        quantity: mod.quantity,
        unitPrice: Number(mod.unitPrice),
        totalAmount: Number(mod.totalAmount),
      })),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }
}
