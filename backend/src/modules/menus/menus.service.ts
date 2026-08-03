import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { Permission } from '../auth/entities/permission.entity';
import { User } from '../auth/entities/user.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

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

    // Filter menus based on permissions
    const accessibleMenus = allMenus.filter((menu) => {
      // Menu without permission requirement is accessible to all
      if (!menu.permissions || menu.permissions.length === 0) {
        return true;
      }
      // Check if user has any of the required permissions
      const menuPermissions = menu.permissions.map((p) => p.code);
      return menuPermissions.some((perm) => userPermissions.includes(perm));
    });

    // Build tree structure
    return this.buildMenuTree(accessibleMenus);
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
