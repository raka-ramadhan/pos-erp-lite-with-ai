import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../../common/decorators';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@RequirePermission('use_cashier')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Create a new payment for an order
   * This is the main payment endpoint used by POS
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createPayment(@Body() createDto: CreatePaymentDto) {
    return this.paymentsService.createPayment(createDto);
  }

  /**
   * Get payment by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  /**
   * Get all payments for an order
   */
  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(orderId);
  }

  /**
   * Check if order is paid
   */
  @Get('order/:orderId/status')
  isOrderPaid(@Param('orderId') orderId: string) {
    return this.paymentsService.isOrderPaid(orderId);
  }
}
