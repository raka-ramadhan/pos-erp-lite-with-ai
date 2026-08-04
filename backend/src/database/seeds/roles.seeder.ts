import { DataSource } from 'typeorm';
import { Role } from '../../modules/auth/entities/role.entity';
import { Permission } from '../../modules/auth/entities/permission.entity';

interface RoleSeed {
  code: string;
  name: string;
  description: string;
  sortOrder: number;
  permissionCodes: string[];
}

const roles: RoleSeed[] = [
  {
    code: 'administrator',
    name: 'Administrator',
    description: 'Full system access with all permissions',
    sortOrder: 1,
    permissionCodes: [
      'dashboard.view',
      // Users
      'user.view', 'user.create', 'user.update', 'user.delete', 'user.change_status',
      // Roles
      'role.view', 'role.create', 'role.update', 'role.delete',
      // Permissions
      'permission.view', 'permission.create', 'permission.update', 'permission.delete',
      // Menus
      'menu.view', 'menu.create', 'menu.update', 'menu.delete',
      // Categories
      'view_categories', 'create_categories', 'update_categories', 'delete_categories',
      // Files
      'upload_files', 'delete_files',
    ],
  },
  {
    code: 'manager',
    name: 'Manager',
    description: 'Can manage users and view roles',
    sortOrder: 2,
    permissionCodes: [
      'dashboard.view',
      'user.view', 'user.create', 'user.update', 'user.change_status',
      'role.view',
      'permission.view',
      'menu.view',
    ],
  },
  {
    code: 'staff',
    name: 'Staff',
    description: 'Basic staff access',
    sortOrder: 3,
    permissionCodes: [
      'dashboard.view',
      'user.view',
    ],
  },
  {
    code: 'user',
    name: 'User',
    description: 'Basic user access',
    sortOrder: 4,
    permissionCodes: [
      'dashboard.view',
    ],
  },
];

export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  for (const roleData of roles) {
    // Check if role exists
    let role = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    // Find permissions by codes
    const permissions = await permissionRepository
      .createQueryBuilder('permission')
      .where('permission.code IN (:...codes)', { codes: roleData.permissionCodes })
      .getMany();

    if (!role) {
      // Create new role
      role = roleRepository.create({
        code: roleData.code,
        name: roleData.name,
        description: roleData.description,
        sortOrder: roleData.sortOrder,
        isActive: true,
        permissions,
      });
      await roleRepository.save(role);
      console.log(`✅ Role created: ${roleData.name}`);
    } else {
      // Update existing role - set code if not set
      if (!role.code) {
        role.code = roleData.code;
      }
      role.description = roleData.description;
      role.sortOrder = roleData.sortOrder;
      role.permissions = permissions;
      await roleRepository.save(role);
      console.log(`✅ Role updated: ${roleData.name}`);
    }
  }
}
