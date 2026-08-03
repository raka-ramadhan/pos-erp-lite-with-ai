import { DataSource } from 'typeorm';
import { User } from '../../modules/auth/entities/user.entity';
import { Role } from '../../modules/auth/entities/role.entity';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  // Get Administrator role
  const adminRole = await roleRepository.findOne({
    where: { name: 'Administrator' },
    relations: { permissions: true },
  });

  // Get User role
  const userRole = await roleRepository.findOne({
    where: { name: 'User' },
    relations: { permissions: true },
  });

  // Check if admin exists (including soft-deleted)
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@nexus.com' },
    withDeleted: true,
  });

  if (!existingAdmin && adminRole) {
    // Create new admin with hashed password
    const admin = userRepository.create({
      name: 'Admin User',
      email: 'admin@nexus.com',
      password: 'admin123', // Will be hashed by BeforeInsert
      roleId: adminRole.id,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('✅ Admin user created: admin@nexus.com / admin123 (Role: Administrator)');
  } else if (existingAdmin && adminRole) {
    // Update existing admin - DON'T change password, just update role and restore
    existingAdmin.roleId = adminRole.id;
    existingAdmin.isActive = true;
    existingAdmin.deletedAt = null;
    // Keep existing password
    await userRepository.save(existingAdmin);
    console.log('✅ Admin user updated with Administrator role (password unchanged)');
  }

  // Check if demo user exists
  const existingUser = await userRepository.findOne({
    where: { email: 'user@nexus.com' },
    withDeleted: true,
  });

  if (!existingUser && userRole) {
    // Create new demo user
    const user = userRepository.create({
      name: 'Demo User',
      email: 'user@nexus.com',
      password: 'user123', // Will be hashed by BeforeInsert
      roleId: userRole.id,
      isActive: true,
    });
    await userRepository.save(user);
    console.log('✅ Demo user created: user@nexus.com / user123 (Role: User)');
  } else if (existingUser && userRole) {
    // Update existing user - DON'T change password, just update role
    existingUser.roleId = userRole.id;
    existingUser.isActive = true;
    existingUser.deletedAt = null;
    // Keep existing password
    await userRepository.save(existingUser);
    console.log('✅ Demo user updated with User role (password unchanged)');
  }
}
