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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  DiningTablesService,
  PaginatedResult,
  DiningTableResponse,
} from './dining-tables.service';
import {
  CreateDiningTableDto,
  UpdateDiningTableDto,
  QueryDiningTableDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('dining-tables')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class DiningTablesController {
  constructor(private readonly diningTablesService: DiningTablesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_diningtables')
  create(
    @Body() createDiningTableDto: CreateDiningTableDto,
  ): Promise<DiningTableResponse> {
    return this.diningTablesService.create(createDiningTableDto);
  }

  @Get()
  @RequirePermission('view_diningtables')
  findAll(
    @Query() query: QueryDiningTableDto,
  ): Promise<PaginatedResult<DiningTableResponse>> {
    return this.diningTablesService.findAll(query);
  }

  @Get('active')
  @RequirePermission('use_cashier')
  findAllActive(): Promise<DiningTableResponse[]> {
    return this.diningTablesService.findAllActive();
  }

  @Get('areas')
  @RequirePermission('use_cashier')
  getDistinctAreas(): Promise<string[]> {
    return this.diningTablesService.getDistinctAreas();
  }

  /**
   * POS-specific endpoint: Get all tables with active order info
   * Returns tables with their current status and active order details
   */
  @Get('pos')
  @RequirePermission('use_cashier')
  findAllForPOS() {
    return this.diningTablesService.findAllForPOS();
  }

  @Get(':id')
  @RequirePermission('view_diningtables')
  findOne(@Param('id') id: string): Promise<DiningTableResponse> {
    return this.diningTablesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update_diningtables')
  update(
    @Param('id') id: string,
    @Body() updateDiningTableDto: UpdateDiningTableDto,
  ): Promise<DiningTableResponse> {
    return this.diningTablesService.update(id, updateDiningTableDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_diningtables')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.diningTablesService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_diningtables')
  restore(@Param('id') id: string): Promise<DiningTableResponse> {
    return this.diningTablesService.restore(id);
  }
}
