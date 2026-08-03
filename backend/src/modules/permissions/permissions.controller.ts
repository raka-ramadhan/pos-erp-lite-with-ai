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
import {
  PermissionsService,
  PaginatedResult,
  PermissionResponse,
  PermissionDetailResponse,
} from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('permission.create')
  create(@Body() createPermissionDto: CreatePermissionDto): Promise<PermissionResponse> {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @RequirePermission('permission.view')
  findAll(@Query() query: QueryPermissionDto): Promise<PaginatedResult<PermissionResponse>> {
    return this.permissionsService.findAll(query);
  }

  @Get('grouped')
  @RequirePermission('permission.view')
  findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  @Get('modules')
  @RequirePermission('permission.view')
  getModules(): Promise<string[]> {
    return this.permissionsService.getModules();
  }

  @Get(':id')
  @RequirePermission('permission.view')
  findOne(@Param('id') id: string): Promise<PermissionResponse> {
    return this.permissionsService.findOne(id);
  }

  @Get(':id/detail')
  @RequirePermission('permission.view')
  findOneDetailed(@Param('id') id: string): Promise<PermissionDetailResponse> {
    return this.permissionsService.findOneDetailed(id);
  }

  @Put(':id')
  @RequirePermission('permission.update')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Patch(':id/status')
  @RequirePermission('permission.update')
  changeStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ): Promise<PermissionResponse> {
    return this.permissionsService.changeStatus(id, isActive);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('permission.delete')
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.permissionsService.remove(id);
  }
}
