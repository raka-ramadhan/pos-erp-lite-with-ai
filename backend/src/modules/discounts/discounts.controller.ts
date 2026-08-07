import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto, UpdateDiscountDto, QueryDiscountDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('discounts')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Get()
  @RequirePermission('view_discounts')
  async findAll(@Query() query: QueryDiscountDto) {
    return this.discountsService.findAll(query);
  }

  @Get('active')
  @RequirePermission('use_cashier')
  async findAllActive() {
    return this.discountsService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_discounts')
  async findOne(@Param('id') id: string) {
    return this.discountsService.findOne(id);
  }

  @Post()
  @RequirePermission('create_discounts')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDiscountDto: CreateDiscountDto,
    @CurrentUser() user?: { userId?: string },
  ) {
    return this.discountsService.create(createDiscountDto, user?.userId);
  }

  @Put(':id')
  @RequirePermission('update_discounts')
  async update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
    @CurrentUser() user?: { userId?: string },
  ) {
    return this.discountsService.update(id, updateDiscountDto, user?.userId);
  }

  @Delete(':id')
  @RequirePermission('delete_discounts')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.discountsService.remove(id);
  }

  @Post(':id/restore')
  @RequirePermission('update_discounts')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    return this.discountsService.restore(id);
  }
}
