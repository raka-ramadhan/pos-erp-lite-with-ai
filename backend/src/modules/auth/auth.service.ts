import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Menu } from './entities/menu.entity';
import { LoginDto, RegisterDto, AppType } from './dto';
import { JwtPayload } from './strategies/jwt.strategy';

// Permission constants for app access
const APP_PERMISSIONS = {
  [AppType.DASHBOARD]: 'use_dashboard',
  [AppType.POS]: 'use_cashier',
} as const;

export interface RoleInfo {
  id: string;
  code: string;
  name: string;
  permissions: string[];
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: RoleInfo | null;
  };
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: RoleInfo | null;
  permissions: string[];
  menu: MenuItemResponse[];
}

export interface MenuItemResponse {
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
  children: MenuItemResponse[];
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    });
    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email, isActive: true },
      relations: { role: { permissions: true } },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phone: true,
        avatar: true,
        isActive: true,
        roleId: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Validate app-level permission
    const app = loginDto.app || AppType.DASHBOARD;
    const requiredPermission = APP_PERMISSIONS[app];
    const userPermissions = user.role?.permissions?.map((p) => p.code) || [];

    if (!userPermissions.includes(requiredPermission)) {
      const appName = app === AppType.DASHBOARD ? 'Dashboard Admin' : 'POS Cashier';
      throw new ForbiddenException(
        `You do not have permission to access ${appName}. Please contact your administrator.`,
      );
    }

    return this.generateToken(user);
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
  }

  /**
   * Get full user profile with role, permissions, and accessible menu
   */
  async getProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: { permissions: true } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPermissions = user.role?.permissions?.map((p) => p.code) || [];
    const menu = await this.getAccessibleMenu(userPermissions);

    const roleInfo: RoleInfo | null = user.role
      ? {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
          permissions: user.role.permissions?.map((p) => p.code) || [],
        }
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      role: roleInfo,
      permissions: userPermissions,
      menu,
    };
  }

  /**
   * Get sidebar menu based on user permissions
   */
  async getSidebarMenu(userId: string): Promise<MenuItemResponse[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: { permissions: true } },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPermissions = user.role?.permissions?.map((p) => p.code) || [];
    return this.getAccessibleMenu(userPermissions);
  }

  /**
   * Get accessible menu items based on permissions
   */
  private async getAccessibleMenu(userPermissions: string[]): Promise<MenuItemResponse[]> {
    const allMenus = await this.menuRepository.find({
      where: { isActive: true },
      relations: { permissions: true },
      order: { sortOrder: 'ASC' },
    });

    const accessibleMenus = allMenus.filter((menu) => {
      if (!menu.permissions || menu.permissions.length === 0) {
        return false;
      }
      const menuPermissions = menu.permissions.map((p) => p.code);
      return menuPermissions.some((perm) => userPermissions.includes(perm));
    });

    return this.buildMenuTree(accessibleMenus);
  }

  /**
   * Build menu tree from flat menu list
   */
  private buildMenuTree(menus: Menu[]): MenuItemResponse[] {
    const menuMap = new Map<string, MenuItemResponse>();
    const roots: MenuItemResponse[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, {
        id: menu.id,
        name: menu.name,
        code: menu.code,
        description: menu.description || '',
        type: menu.type,
        icon: menu.icon || '',
        path: menu.path || '',
        sortOrder: menu.sortOrder,
        isActive: menu.isActive,
        isHidden: menu.isHidden || false,
        children: [],
      });
    });

    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        menuMap.get(menu.parentId)!.children.push(menuItem);
      } else if (!menu.isHidden) {
        roots.push(menuItem);
      }
    });

    return roots;
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  private generateToken(user: User): AuthResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const roleInfo: RoleInfo | null = user.role
      ? {
          id: user.role.id,
          code: user.role.code,
          name: user.role.name,
          permissions: user.role.permissions?.map((p) => p.code) || [],
        }
      : null;

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        avatar: user.avatar || undefined,
        role: roleInfo,
      },
    };
  }
}
