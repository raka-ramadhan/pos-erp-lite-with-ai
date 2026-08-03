import { DataSource } from 'typeorm';
import { Permission } from '../../modules/auth/entities/permission.entity';

interface PermissionSeed {
  name: string;
  code: string;
  description: string;
  group: string;
  sortOrder: number;
}

const permissions: PermissionSeed[] = [
  // Dashboard
  { name: 'View Dashboard', code: 'dashboard.view', description: 'Access to dashboard', group: 'Dashboard', sortOrder: 1 },

  // Users
  { name: 'View Users', code: 'user.view', description: 'View user list', group: 'Users', sortOrder: 10 },
  { name: 'Create Users', code: 'user.create', description: 'Create new user', group: 'Users', sortOrder: 11 },
  { name: 'Update Users', code: 'user.update', description: 'Update existing user', group: 'Users', sortOrder: 12 },
  { name: 'Delete Users', code: 'user.delete', description: 'Delete user', group: 'Users', sortOrder: 13 },
  { name: 'Change User Status', code: 'user.change_status', description: 'Change user active status', group: 'Users', sortOrder: 14 },

  // Roles
  { name: 'View Roles', code: 'role.view', description: 'View role list', group: 'Roles', sortOrder: 20 },
  { name: 'Create Roles', code: 'role.create', description: 'Create new role', group: 'Roles', sortOrder: 21 },
  { name: 'Update Roles', code: 'role.update', description: 'Update existing role', group: 'Roles', sortOrder: 22 },
  { name: 'Delete Roles', code: 'role.delete', description: 'Delete role', group: 'Roles', sortOrder: 23 },

  // Permissions
  { name: 'View Permissions', code: 'permission.view', description: 'View permission list', group: 'Permissions', sortOrder: 30 },
  { name: 'Create Permissions', code: 'permission.create', description: 'Create new permission', group: 'Permissions', sortOrder: 31 },
  { name: 'Update Permissions', code: 'permission.update', description: 'Update existing permission', group: 'Permissions', sortOrder: 32 },
  { name: 'Delete Permissions', code: 'permission.delete', description: 'Delete permission', group: 'Permissions', sortOrder: 33 },

  // Menus
  { name: 'View Menus', code: 'menu.view', description: 'View menu list', group: 'Menus', sortOrder: 40 },
  { name: 'Create Menus', code: 'menu.create', description: 'Create new menu', group: 'Menus', sortOrder: 41 },
  { name: 'Update Menus', code: 'menu.update', description: 'Update existing menu', group: 'Menus', sortOrder: 42 },
  { name: 'Delete Menus', code: 'menu.delete', description: 'Delete menu', group: 'Menus', sortOrder: 43 },

  // Products
  { name: 'View Products', code: 'product.view', description: 'View product list', group: 'Products', sortOrder: 50 },
  { name: 'Create Products', code: 'product.create', description: 'Create new product', group: 'Products', sortOrder: 51 },
  { name: 'Update Products', code: 'product.update', description: 'Update existing product', group: 'Products', sortOrder: 52 },
  { name: 'Delete Products', code: 'product.delete', description: 'Delete product', group: 'Products', sortOrder: 53 },
];

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);

  for (const permData of permissions) {
    const existing = await permissionRepository.findOne({
      where: { code: permData.code },
    });

    if (!existing) {
      const permission = permissionRepository.create({
        name: permData.name,
        code: permData.code,
        description: permData.description,
        group: permData.group,
        sortOrder: permData.sortOrder,
        isActive: true,
      });
      await permissionRepository.save(permission);
      console.log(`✅ Permission created: ${permData.code}`);
    } else {
      // Update existing
      existing.name = permData.name;
      existing.description = permData.description;
      existing.group = permData.group;
      existing.sortOrder = permData.sortOrder;
      await permissionRepository.save(existing);
      console.log(`✅ Permission updated: ${permData.code}`);
    }
  }
}
