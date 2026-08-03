import { DataSource } from 'typeorm';
import { Menu, MenuType } from '../../modules/auth/entities/menu.entity';
import { Permission } from '../../modules/auth/entities/permission.entity';

interface MenuSeed {
  name: string;
  code: string;
  description?: string;
  type: MenuType;
  icon?: string;
  path?: string;
  sortOrder: number;
  isHidden?: boolean;
  permissionCode?: string;
  children?: MenuSeed[];
}

const menus: MenuSeed[] = [
  {
    name: 'Dashboard',
    code: 'dashboard',
    description: 'Dashboard overview',
    type: MenuType.GROUP,
    icon: 'LayoutDashboard',
    sortOrder: 1,
    children: [
      {
        name: 'Overview',
        code: 'dashboard_overview',
        type: MenuType.MENU,
        icon: 'LayoutDashboard',
        path: '/dashboard',
        sortOrder: 1,
        permissionCode: 'dashboard.view',
      },
    ],
  },
  {
    name: 'RBAC',
    code: 'rbac',
    description: 'Role Based Access Control',
    type: MenuType.GROUP,
    icon: 'Shield',
    sortOrder: 2,
    children: [
      {
        name: 'Users',
        code: 'users',
        type: MenuType.MENU,
        icon: 'Users',
        path: '/dashboard/users',
        sortOrder: 10,
        permissionCode: 'user.view',
      },
      {
        name: 'Roles',
        code: 'roles',
        type: MenuType.MENU,
        icon: 'Shield',
        path: '/dashboard/roles',
        sortOrder: 11,
        permissionCode: 'role.view',
      },
      {
        name: 'Permissions',
        code: 'permissions',
        type: MenuType.MENU,
        icon: 'Key',
        path: '/dashboard/permissions',
        sortOrder: 12,
        permissionCode: 'permission.view',
      },
      {
        name: 'Menus',
        code: 'menus',
        type: MenuType.MENU,
        icon: 'Menu',
        path: '/dashboard/menus',
        sortOrder: 13,
        permissionCode: 'menu.view',
      },
    ],
  },
];

async function createMenuTree(
  dataSource: DataSource,
  menuItems: MenuSeed[],
  parentId: string | null = null,
): Promise<void> {
  const menuRepository = dataSource.getRepository(Menu);
  const permissionRepository = dataSource.getRepository(Permission);

  for (const menuData of menuItems) {
    // Check if menu exists
    let menu = await menuRepository.findOne({
      where: { code: menuData.code },
    });

    // Get permission if specified
    let permission: Permission | null = null;
    if (menuData.permissionCode) {
      permission = await permissionRepository.findOne({
        where: { code: menuData.permissionCode },
      });
    }

    if (!menu) {
      menu = menuRepository.create({
        name: menuData.name,
        code: menuData.code,
        description: menuData.description || '',
        type: menuData.type,
        icon: menuData.icon || '',
        path: menuData.path || '',
        sortOrder: menuData.sortOrder,
        isActive: true,
        isHidden: menuData.isHidden || false,
        parentId,
        permissions: permission ? [permission] : [],
      });
      await menuRepository.save(menu);
      console.log(`✅ Menu created: ${menuData.code}`);
    } else {
      // Update existing
      menu.name = menuData.name;
      menu.description = menuData.description || '';
      menu.type = menuData.type;
      menu.icon = menuData.icon || '';
      menu.path = menuData.path || '';
      menu.sortOrder = menuData.sortOrder;
      menu.isHidden = menuData.isHidden || false;
      menu.parentId = parentId;
      if (permission) {
        menu.permissions = [permission];
      }
      await menuRepository.save(menu);
      console.log(`✅ Menu updated: ${menuData.code}`);
    }

    // Create children recursively
    if (menuData.children && menuData.children.length > 0) {
      await createMenuTree(dataSource, menuData.children, menu.id);
    }
  }
}

export async function seedMenus(dataSource: DataSource): Promise<void> {
  await createMenuTree(dataSource, menus);
}
