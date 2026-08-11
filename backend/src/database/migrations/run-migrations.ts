import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  console.log('🚀 Starting database migrations...');

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'superuser',
    password: process.env.DB_PASSWORD || 'rhr12345',
    database: process.env.DB_DATABASE || 'erp_lite',
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📋 Found ${files.length} migration file(s)`);

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`\n📄 Running migration: ${file}`);

      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        try {
          await dataSource.query(statement);
        } catch (err: any) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            console.error(`   ❌ Error: ${err.message}`);
          }
        }
      }

      console.log(`   ✅ ${file} completed`);
    }

    console.log('\n🎉 All migrations completed!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runMigrations();
