import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
  AssignTableDto,
  ChangeTableDto,
  CreateOrderItemDto,
  UpdateOrderItemDto,
  UpdateOrderItemNotesDto,
  ApplyDiscountDto,
  CancelOrderDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators';

@Controller('orders')
@UseGuards(JwtAuthGuard)
@RequirePermission('use_cashier')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get('open/count')
  getOpenOrdersCount() {
    return this.ordersService.getOpenOrdersCount();
  }

  @Get('table/:tableId/open')
  getOpenOrderByTable(@Param('tableId') tableId: string) {
    return this.ordersService.getOpenOrderByTable(tableId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  /**
   * Assign a table to an order
   */
  @Patch(':id/assign-table')
  assignTable(
    @Param('id') id: string,
    @Body() assignTableDto: AssignTableDto,
  ) {
    return this.ordersService.assignTable(id, assignTableDto.tableId);
  }

  /**
   * Change table - move order to different table
   */
  @Patch(':id/change-table')
  changeTable(
    @Param('id') id: string,
    @Body() changeTableDto: ChangeTableDto,
  ) {
    return this.ordersService.changeTable(id, changeTableDto.newTableId);
  }

  // ==================== ORDER ITEMS ====================

  /**
   * Get all items for an order
   */
  @Get(':id/items')
  getOrderItems(@Param('id') orderId: string) {
    return this.ordersService.getOrderItems(orderId);
  }

  /**
   * Get order with items (includes product name)
   */
  @Get(':id/with-items')
  getOrderWithItems(@Param('id') orderId: string) {
    return this.ordersService.getOrderWithItemsResponse(orderId);
  }

  /**
   * Add item to order
   * If same product exists without modifiers, increment quantity
   */
  @Post(':id/items')
  @HttpCode(HttpStatus.CREATED)
  addOrderItem(
    @Param('id') orderId: string,
    @Body() createDto: CreateOrderItemDto,
  ) {
    return this.ordersService.addOrderItem(orderId, createDto);
  }

  /**
   * Update order item (quantity, notes, etc.)
   */
  @Patch(':id/items/:itemId')
  updateOrderItem(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateOrderItemDto,
  ) {
    return this.ordersService.updateOrderItem(orderId, itemId, updateDto);
  }

  /**
   * Update order item notes only
   */
  @Patch(':id/items/:itemId/notes')
  updateOrderItemNotes(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateOrderItemNotesDto,
  ) {
    return this.ordersService.updateOrderItemNotes(orderId, itemId, updateDto.notes);
  }

  /**
   * Remove item from order
   */
  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.OK)
  removeOrderItem(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.ordersService.removeOrderItem(orderId, itemId);
  }

  // ==================== DISCOUNT & CALCULATION ====================

  /**
   * Get order calculation (preview of all totals)
   */
  @Get(':id/calculation')
  getOrderCalculation(@Param('id') orderId: string) {
    return this.ordersService.getOrderCalculationResponse(orderId);
  }

  /**
   * Apply discount to order
   */
  @Post(':id/discount')
  @HttpCode(HttpStatus.OK)
  applyDiscount(
    @Param('id') orderId: string,
    @Body() applyDiscountDto: ApplyDiscountDto,
  ) {
    return this.ordersService.applyDiscount(orderId, applyDiscountDto);
  }

  /**
   * Remove discount from order
   */
  @Delete(':id/discount')
  @HttpCode(HttpStatus.OK)
  removeDiscount(@Param('id') orderId: string) {
    return this.ordersService.removeDiscount(orderId);
  }

  /**
   * Cancel order (soft delete)
   * Used when user cancels or abandons the order
   */
  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelOrder(
    @Param('id') orderId: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(orderId, cancelDto.reason);
  }
}
