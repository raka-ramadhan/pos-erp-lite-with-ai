import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Permission } from '../auth/entities/permission.entity';
import { User } from '../auth/entities/user.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { AssignPermissionsToMenuDto, MenuPermissionResponse } from './dto/menu-permission.dto';

export interface MenuWithChildren {
  id: string;
  name: string;
  code: string;
  description: string;
  type: string;
  icon: string;
  path: string;
  sortOrder: number;
  isActive: boolean;
  isHidden: boolean;
  parentId: string | null;
  children: MenuWithChildren[];
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionSimple {
  id: string;
  code: string;
  name: string;
}

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    // Check if menu code already exists
    const existing = await this.menuRepository.findOne({
      where: { code: createMenuDto.code },
    });

    if (existing) {
      throw new ConflictException('Menu with this code already exists');
    }

    // Get permission if provided
    let permission: Permission | null = null;
    if (createMenuDto.permissionId) {
      permission = await this.permissionRepository.findOne({
        where: { id: createMenuDto.permissionId },
      });
    }

    const menu = this.menuRepository.create({
      ...createMenuDto,
      permissions: permission ? [permission] : [],
    });

    return this.menuRepository.save(menu);
  }

  async findAll() {
    const menus = await this.menuRepository.find({
      relations: { permissions: true, parent: true, children: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    return menus;
  }

  async findOne(id: string) {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: { permissions: true, parent: true, children: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto) {
    const menu = await this.findOne(id);

    // Check if code is being changed and already exists
    if (updateMenuDto.code && updateMenuDto.code !== menu.code) {
      const existing = await this.menuRepository.findOne({
        where: { code: updateMenuDto.code },
      });
      if (existing) {
        throw new ConflictException('Menu with this code already exists');
      }
    }

    // Get permission if provided
    if (updateMenuDto.permissionId) {
      const permission = await this.permissionRepository.findOne({
        where: { id: updateMenuDto.permissionId },
      });
      if (permission) {
        menu.permissions = [permission];
      }
    }

    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: string) {
    const menu = await this.findOne(id);

    // Check if menu has children
    if (menu.children && menu.children.length > 0) {
      throw new ConflictException('Cannot delete menu that has child menus');
    }

    await this.menuRepository.remove(menu);
    return { message: 'Menu deleted successfully' };
  }

  /**
   * Get all menus with their assigned permissions
   */
  async getAllMenusWithPermissions(): Promise<MenuPermissionResponse[]> {
    const menus = await this.menuRepository.find({
      where: { isActive: true },
      relations: { permissions: true },
      order: { type: 'ASC', sortOrder: 'ASC' },
    });

    return menus.map((menu) => ({
      menuId: menu.id,
      menuName: menu.name,
      menuCode: menu.code,
      type: menu.type,
      permissions: menu.permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    }));
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<PermissionSimple[]> {
    const permissions = await this.permissionRepository.find({
      order: { code: 'ASC' },
    });

    return permissions.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
    }));
  }

  /**
   * Assign permissions to a menu
   */
  async assignPermissionsToMenu(
    menuId: string,
    dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: { permissions: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    // Get the permissions to assign
    const permissions = await this.permissionRepository.find({
      where: { id: In(dto.permissionIds) },
    });

    if (permissions.length !== dto.permissionIds.length) {
      const foundIds = permissions.map((p) => p.id);
      const notFound = dto.permissionIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Permissions not found: ${notFound.join(', ')}`);
    }

    // Add new permissions (avoid duplicates)
    const existingIds = menu.permissions.map((p) => p.id);
    const newPermissions = permissions.filter((p) => !existingIds.includes(p.id));
    menu.permissions = [...menu.permissions, ...newPermissions];

    await this.menuRepository.save(menu);

    return {
      menuId: menu.id,
      menuName: menu.name,
      menuCode: menu.code,
      type: menu.type,
      permissions: menu.permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    };
  }

  /**
   * Remove permissions from a menu
   */
  async removePermissionsFromMenu(
    menuId: string,
    dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: { permissions: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    // Filter out the permissions to remove
    menu.permissions = menu.permissions.filter(
      (p) => !dto.permissionIds.includes(p.id),
    );

    await this.menuRepository.save(menu);

    return {
      menuId: menu.id,
      menuName: menu.name,
      menuCode: menu.code,
      type: menu.type,
      permissions: menu.permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    };
  }

  /**
   * Get permissions for a specific menu
   */
  async getMenuPermissions(menuId: string): Promise<MenuPermissionResponse> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: { permissions: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    return {
      menuId: menu.id,
      menuName: menu.name,
      menuCode: menu.code,
      type: menu.type,
      permissions: menu.permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    };
  }

  /**
   * Set permissions for a menu (replace all)
   */
  async setMenuPermissions(
    menuId: string,
    dto: AssignPermissionsToMenuDto,
  ): Promise<MenuPermissionResponse> {
    const menu = await this.menuRepository.findOne({
      where: { id: menuId },
      relations: { permissions: true },
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${menuId} not found`);
    }

    // Get the permissions to set
    const permissions = await this.permissionRepository.find({
      where: { id: In(dto.permissionIds) },
    });

    if (permissions.length !== dto.permissionIds.length) {
      const foundIds = permissions.map((p) => p.id);
      const notFound = dto.permissionIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Permissions not found: ${notFound.join(', ')}`);
    }

    menu.permissions = permissions;
    await this.menuRepository.save(menu);

    return {
      menuId: menu.id,
      menuName: menu.name,
      menuCode: menu.code,
      type: menu.type,
      permissions: menu.permissions.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
      })),
    };
  }

  /**
   * Get sidebar menu for a specific user based on their role and permissions
   */
  async getSidebarForUser(userId: string): Promise<MenuWithChildren[]> {
    // Get user with role and permissions
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: { role: { permissions: true } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get all active menus with permissions
    const allMenus = await this.menuRepository.find({
      where: { isActive: true, isHidden: false },
      relations: { permissions: true, parent: true },
      order: { sortOrder: 'ASC' },
    });

    // Get user's permission codes
    const userPermissions = user.role?.permissions?.map((p) => p.code) || [];

    // Helper function to check if a menu is accessible to user
    const isMenuAccessible = (menu: Menu): boolean => {
      // Menu without permissions is hidden from all users
      if (!menu.permissions || menu.permissions.length === 0) {
        return false;
      }
      // Check if user has any of the required permissions
      const menuPermissions = menu.permissions.map((p) => p.code);
      return menuPermissions.some((perm) => userPermissions.includes(perm));
    };

    // Build full tree first, then filter
    const fullTree = this.buildMenuTree(allMenus);

    // Filter tree: keep a node if it has accessible children or itself is accessible
    const filterTree = (menus: MenuWithChildren[]): MenuWithChildren[] => {
      return menus
        .map((menu) => ({
          ...menu,
          // Recursively filter children
          children: filterTree(menu.children),
        }))
        .filter((menu) => {
          // Keep menu if:
          // 1. It has accessible children (has children after filtering), OR
          // 2. It itself is accessible (has permissions that user has)
          const hasAccessibleChildren = menu.children.length > 0;
          const isAccessible = isMenuAccessible(menu as unknown as Menu);
          return hasAccessibleChildren || isAccessible;
        });
    };

    return filterTree(fullTree);
  }

  /**
   * Get all menus for sidebar (admin view - no permission filtering)
   */
  async getSidebarForAdmin(): Promise<MenuWithChildren[]> {
    const allMenus = await this.menuRepository.find({
      where: { isActive: true, isHidden: false },
      relations: { permissions: true },
      order: { sortOrder: 'ASC' },
    });

    return this.buildMenuTree(allMenus);
  }

  private buildMenuTree(menus: Menu[]): MenuWithChildren[] {
    const menuMap = new Map<string, MenuWithChildren>();
    const roots: MenuWithChildren[] = [];

    // First pass: create map with children array
    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        ...menu,
        children: [],
        description: menu.description || '',
        icon: menu.icon || '',
        path: menu.path || '',
      });
    });

    // Second pass: build tree
    menus.forEach((menu) => {
      const menuWithChildren = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        menuMap.get(menu.parentId)!.children.push(menuWithChildren);
      } else {
        roots.push(menuWithChildren);
      }
    });

    return roots;
  }
}
