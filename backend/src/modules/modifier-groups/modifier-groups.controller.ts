import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ModifierGroupsService } from './modifier-groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('modifier-groups')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ModifierGroupsController {
  constructor(private readonly modifierGroupsService: ModifierGroupsService) {}

  @Get('active')
  @RequirePermission('view_products')
  async findAllActive() {
    return this.modifierGroupsService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_products')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.modifierGroupsService.findOne(id);
  }
}
