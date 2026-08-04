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
import { TaxesService, PaginatedResult, TaxResponse } from './taxes.service';
import { CreateTaxDto, UpdateTaxDto, QueryTaxDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('taxes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get()
  @RequirePermission('view_taxes')
  async findAll(@Query() query: QueryTaxDto): Promise<PaginatedResult<TaxResponse>> {
    return this.taxesService.findAll(query);
  }

  @Get('active')
  @RequirePermission('view_taxes')
  async findAllActive() {
    const taxes = await this.taxesService.findAllActive();
    return { data: taxes };
  }

  @Get(':id')
  @RequirePermission('view_taxes')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const tax = await this.taxesService.findOne(id);
    return { data: tax };
  }

  @Post()
  @RequirePermission('create_taxes')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTaxDto: CreateTaxDto) {
    const tax = await this.taxesService.create(createTaxDto);
    return { data: tax };
  }

  @Patch(':id')
  @RequirePermission('update_taxes')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaxDto: UpdateTaxDto,
  ) {
    const tax = await this.taxesService.update(id, updateTaxDto);
    return { data: tax };
  }

  @Delete(':id')
  @RequirePermission('delete_taxes')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.taxesService.remove(id);
    return { data: result };
  }

  @Post(':id/restore')
  @RequirePermission('update_taxes')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const tax = await this.taxesService.restore(id);
    return { data: tax };
  }
}
