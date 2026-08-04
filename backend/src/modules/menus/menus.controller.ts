import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { AssignPermissionsToMenuDto, MenuPermissionResponse } from './dto/menu-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { PermissionSimple } from './menus.service';

interface CurrentUserData {
  id: string;
  email: string;
  name: string;
  role: {
    id: string;
    name: string;
    permissions: string[];
  } | null;
}

@Controller('menus')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  /**
   * Get sidebar menus for the current authenticated user
   * Permission filtering is done based on user's role
   */
  @Get('sidebar')
  async getSidebar(@CurrentUser() user: CurrentUserData) {
    return this.menusService.getSidebarForUser(user.id);
  }

  /**
   * Get all menus for sidebar (admin view - no permission filtering)
   */
  @Get('sidebar/admin')
  async getSidebarAdmin() {
    return this.menusService.getSidebarForAdmin();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermission('create_menus')
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @RequirePermission('view_menus')
  findAll() {
    return this.menusService.findAll();
  }

  @Get(':id')
  @RequirePermission('view_menus')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('update_menus')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('delete_menus')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.remove(id);
  }

  // ==================== MENU PERMISSIONS ENDPOINTS ====================

  /**
   * Get all menus with their assigned permissions
   */
  @Get('permissions/all')
  @RequirePermission('view_menus')
  async getAllMenusWithPermissions(): Promise<MenuPermissionResponse[]> {
    return this.menusService.getAllMenusWithPermissions();
  }

  /**
   * Get all available permissions
   */
  @Get('permissions/permissions-list')
  @RequirePermission('view_menus')
  async getAllPermissions(): Promise<PermissionSimple[]> {
    return this.menusService.getAllPermissions();
  }

  /**
   * Get permissions for a specific menu
   */
  @Get(':id/permissions')
  @RequirePermission('view_menus')
  async getMenuPermissions(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MenuPermissionResponse> {
    return this.menusService.getMenuPermissions(id);
  }

  /**
   * Assign permissions to a menu (additive)
   */
  @Post(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_menus')
  async assignPermissionsToMenu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    return this.menusService.assignPermissionsToMenu(id, dto);
  }

  /**
   * Set permissions for a menu (replace all)
   */
  @Put(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_menus')
  async setMenuPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    return this.menusService.setMenuPermissions(id, dto);
  }

  /**
   * Remove permissions from a menu
   */
  @Delete(':id/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('update_menus')
  async removePermissionsFromMenu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    return this.menusService.removePermissionsFromMenu(id, dto);
  }
}
