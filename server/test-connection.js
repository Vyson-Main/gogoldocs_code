// ── Database Connection Test ───────────────────────────────────────────────────
// Run this before starting the server to confirm pgAdmin4 is reachable.
//
// Usage:
//   cd server
//   node test-connection.js

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgres://postgres:postgres@localhost:5432/gogoldocs';

console.log('\n🔍 Testing connection to:', DATABASE_URL.replace(/:([^:@]+)@/, ':****@'));

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 1 });

async function run() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check DB version
    const { rows: [ver] } = await client.query('SELECT version()');
    console.log('   PG version :', ver.version.split(' ').slice(0,2).join(' '));

    // Check tables exist
    const { rows: tables } = await client.query(`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log('   Tables     :', tables.length
      ? tables.map(r => r.tablename).join(', ')
      : '⚠️  None found — run pgadmin4_setup.sql first');

    // Row counts
    if (tables.some(t => t.tablename === 'users')) {
      const { rows: [uc] } = await client.query('SELECT COUNT(*) FROM users');
      const { rows: [nc] } = await client.query('SELECT COUNT(*) FROM notes');
      console.log('   Users      :', uc.count);
      console.log('   Notes      :', nc.count);
    }

    console.log('\n🎉 All good — run `npm run dev` to start the server.\n');
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Make sure PostgreSQL is running in pgAdmin4');
    console.error('  2. Check your DATABASE_URL in .env');
    console.error('  3. Make sure the "gogoldocs" database exists');
    console.error('     → Run database/schema/pgadmin4_setup.sql in pgAdmin4 Query Tool\n');
    process.exit(1);
  } finally {
    client?.release();
    await pool.end();
  }
}

run();
