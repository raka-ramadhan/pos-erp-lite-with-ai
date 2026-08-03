import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService, PaginatedResult, RoleResponse } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Permission } from '../auth/entities/permission.entity';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('role.create')
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponse> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @RequirePermission('role.view')
  findAll(@Query() query: QueryRoleDto): Promise<PaginatedResult<RoleResponse>> {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('role.view')
  findOne(@Param('id') id: string): Promise<RoleResponse> {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @RequirePermission('role.update')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponse> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/status')
  @RequirePermission('role.update')
  changeStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<RoleResponse> {
    return this.rolesService.changeStatus(id, isActive);
  }

  @Get(':id/permissions')
  @RequirePermission('role.view')
  getPermissions(@Param('id') id: string): Promise<Permission[]> {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('role.update')
  assignPermissions(
    @Param('id') id: string,
    @Body('permissionIds') permissionIds: string[],
  ): Promise<RoleResponse> {
    return this.rolesService.assignPermissions(id, permissionIds);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('role.delete')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.rolesService.remove(id);
  }
}
