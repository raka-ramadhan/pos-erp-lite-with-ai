/**
 * Seeder for Modifier Groups Menu
 *
 * Run with: npm run seed:modifier-groups
 *
 * This seeder adds the Modifier Groups menu item to the sidebar
 * with proper permissions linked.
 */

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'superuser',
  password: process.env.DB_PASSWORD || 'superuser',
  database: process.env.DB_DATABASE || 'erp_lite',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function seed() {
  console.log('🔄 Connecting to database...');
  await dataSource.initialize();
  console.log('✅ Connected!');

  const connection = dataSource;

  try {
    // Get permission IDs for modifier groups
    const permissions = await connection.query(`
      SELECT id, code FROM permissions
      WHERE code IN ('view_modifiergroups', 'create_modifiergroups', 'update_modifiergroups', 'delete_modifiergroups')
    `);

    if (permissions.length === 0) {
      console.log('⚠️  No modifier group permissions found. Please ensure permissions exist first.');
      return;
    }

    const permissionMap = new Map(permissions.map(p => [p.code, p.id]));
    console.log('📋 Found permissions:', permissionMap);

    // Check if menu already exists
    const existingMenu = await connection.query(`
      SELECT id FROM menus WHERE code = 'modifier-groups'
    `);

    if (existingMenu.length > 0) {
      console.log('⚠️  Menu "Modifier Groups" already exists. Skipping...');
      return;
    }

    // Get the "Master Data" parent menu (Products menu's parent or create under Master Data)
    let parentId = null;
    const masterDataMenu = await connection.query(`
      SELECT id FROM menus WHERE name = 'Master Data' LIMIT 1
    `);

    if (masterDataMenu.length > 0) {
      parentId = masterDataMenu[0].id;
    }

    // Insert the Modifier Groups menu
    const insertResult = await connection.query(`
      INSERT INTO menus (id, name, code, description, type, icon, path, sort_order, is_active, is_hidden, parent_id, created_at, updated_at)
      VALUES (
        UUID(),
        'Modifier Groups',
        'modifier-groups',
        'Manage product modifier groups',
        'MENU',
        'Layers',
        '/dashboard/modifier-groups',
        6,
        1,
        0,
        ${parentId ? `'${parentId}'` : 'NULL'},
        NOW(),
        NOW()
      )
    `);

    // Get the inserted menu ID
    const newMenu = await connection.query(`
      SELECT id FROM menus WHERE code = 'modifier-groups' LIMIT 1
    `);

    if (newMenu.length > 0) {
      const menuId = newMenu[0].id;

      // Link permissions to the menu
      const viewPermId = permissionMap.get('view_modifiergroups');
      const createPermId = permissionMap.get('create_modifiergroups');
      const updatePermId = permissionMap.get('update_modifiergroups');
      const deletePermId = permissionMap.get('delete_modifiergroups');

      await connection.query(`
        INSERT INTO menu_permissions (menu_id, permission_id)
        VALUES
          ${viewPermId ? `('${menuId}', '${viewPermId}')` : ''},
          ${createPermId ? `('${menuId}', '${createPermId}')` : ''},
          ${updatePermId ? `('${menuId}', '${updatePermId}')` : ''},
          ${deletePermId ? `('${menuId}', '${deletePermId}')` : ''}
      `);

      console.log('✅ Successfully added Modifier Groups menu with permissions!');
    }

  } catch (error) {
    console.error('❌ Error seeding menu:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

seed().catch(console.error);
