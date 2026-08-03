import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database.config';
import { seedPermissions } from './permissions.seeder';
import { seedRoles } from './roles.seeder';
import { seedMenus } from './menus.seeder';
import { seedUsers } from './auth.seeder';

async function runSeeds() {
  console.log('🌱 Starting database seeds...');

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'superuser',
    password: process.env.DB_PASSWORD || 'rhr12345',
    database: process.env.DB_DATABASE || 'erp_lite',
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
    synchronize: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Seed order matters: Permissions -> Roles -> Menus -> Users
    console.log('\n📦 Seeding permissions...');
    await seedPermissions(dataSource);

    console.log('\n📦 Seeding roles...');
    await seedRoles(dataSource);

    console.log('\n📦 Seeding menus...');
    await seedMenus(dataSource);

    console.log('\n📦 Seeding users...');
    await seedUsers(dataSource);

    console.log('\n🎉 All seeding completed!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
