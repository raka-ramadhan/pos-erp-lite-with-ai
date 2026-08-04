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
  ParseUUIDPipe,
} from '@nestjs/common';
import { ModifierGroupsService, PaginatedResult, ModifierGroupResponse } from './modifier-groups.service';
import { CreateModifierGroupDto, UpdateModifierGroupDto, QueryModifierGroupDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('modifier-groups')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ModifierGroupsController {
  constructor(private readonly modifierGroupsService: ModifierGroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_modifiergroups')
  create(@Body() createModifierGroupDto: CreateModifierGroupDto): Promise<ModifierGroupResponse> {
    return this.modifierGroupsService.create(createModifierGroupDto);
  }

  @Get()
  @RequirePermission('view_modifiergroups')
  findAll(@Query() query: QueryModifierGroupDto): Promise<PaginatedResult<ModifierGroupResponse>> {
    return this.modifierGroupsService.findAll(query);
  }

  @Get('active')
  @RequirePermission('view_modifiergroups')
  findAllActive(): Promise<ModifierGroupResponse[]> {
    return this.modifierGroupsService.findAllActive();
  }

  @Get(':id')
  @RequirePermission('view_modifiergroups')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ModifierGroupResponse> {
    return this.modifierGroupsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update_modifiergroups')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateModifierGroupDto: UpdateModifierGroupDto,
  ): Promise<ModifierGroupResponse> {
    return this.modifierGroupsService.update(id, updateModifierGroupDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_modifiergroups')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    return this.modifierGroupsService.remove(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_modifiergroups')
  restore(@Param('id', ParseUUIDPipe) id: string): Promise<ModifierGroupResponse> {
    return this.modifierGroupsService.restore(id);
  }
}
