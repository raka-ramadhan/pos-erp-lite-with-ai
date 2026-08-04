import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('taxes')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class TaxesController {
  constructor(private readonly taxesService: TaxesService) {}

  @Get('active')
  @RequirePermission('view_products')
  async findAllActive() {
    return this.taxesService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_products')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taxesService.findOne(id);
  }
}
