import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentMethodsService, PaginatedResult, PaymentMethodResponse } from './payment-methods.service';
import { CreatePaymentMethodDto, UpdatePaymentMethodDto, QueryPaymentMethodDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('payment-methods')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @RequirePermission('view_paymentmethods')
  async findAll(@Query() query: QueryPaymentMethodDto): Promise<PaginatedResult<PaymentMethodResponse>> {
    return this.paymentMethodsService.findAll(query);
  }

  @Get('active')
  @RequirePermission('view_paymentmethods')
  async findAllActive() {
    const paymentMethods = await this.paymentMethodsService.findAllActive();
    return { data: paymentMethods };
  }

  @Get(':id')
  @RequirePermission('view_paymentmethods')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const paymentMethod = await this.paymentMethodsService.findOne(id);
    return { data: paymentMethod };
  }

  @Post()
  @RequirePermission('create_paymentmethods')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePaymentMethodDto) {
    const paymentMethod = await this.paymentMethodsService.create(createDto);
    return { data: paymentMethod };
  }

  @Patch(':id')
  @RequirePermission('update_paymentmethods')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePaymentMethodDto,
  ) {
    const paymentMethod = await this.paymentMethodsService.update(id, updateDto);
    return { data: paymentMethod };
  }

  @Delete(':id')
  @RequirePermission('delete_paymentmethods')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.paymentMethodsService.remove(id);
    return { data: result };
  }

  @Post(':id/restore')
  @RequirePermission('update_paymentmethods')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const paymentMethod = await this.paymentMethodsService.restore(id);
    return { data: paymentMethod };
  }
}
