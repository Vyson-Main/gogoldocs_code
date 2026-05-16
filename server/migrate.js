// ── db:migrate ────────────────────────────────────────────────────────────────
// Creates the gogoldocs database (if it doesn't exist) then runs the schema.
// Usage: npm run db:migrate

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });
import pg from 'pg';

const { Pool, Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgres://postgres:postgres@localhost:5432/gogoldocs';

// Parse the DB name out of the URL so we can create it if missing
const url      = new URL(DATABASE_URL);
const DB_NAME  = url.pathname.replace('/', '');          // e.g. "gogoldocs"
const ROOT_URL = DATABASE_URL.replace(url.pathname, '/postgres'); // connect to postgres DB first

// ── Step 1: Create the database if it doesn't exist ──────────────────────────
async function createDatabase() {
  const client = new Client({ connectionString: ROOT_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`, [DB_NAME]
  );

  if (rows.length === 0) {
    await client.query(`CREATE DATABASE "${DB_NAME}"`);
    console.log(`✅ Database "${DB_NAME}" created`);
  } else {
    console.log(`ℹ️  Database "${DB_NAME}" already exists — skipping create`);
  }

  await client.end();
}

// ── Step 2: Run schema (tables, indexes, triggers) ────────────────────────────
async function runSchema() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email         VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ Table: users');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title           VARCHAR(120) NOT NULL,
      body            TEXT DEFAULT '',
      is_secure       BOOLEAN DEFAULT FALSE,
      password_hash   TEXT,
      failed_attempts INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('✅ Table: notes');

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_user_id    ON notes(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_title_fts  ON notes USING gin(to_tsvector('english', title))`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_notes_body_fts   ON notes USING gin(to_tsvector('english', body))`);
  console.log('✅ Indexes created');

  await pool.query(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS users_updated_at ON users;
    CREATE TRIGGER users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
  `);

  await pool.query(`
    DROP TRIGGER IF EXISTS notes_updated_at ON notes;
    CREATE TRIGGER notes_updated_at
      BEFORE UPDATE ON notes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at()
  `);
  console.log('✅ Triggers created');

  await pool.end();
}

// ── Run ───────────────────────────────────────────────────────────────────────
try {
  console.log('\n🔧 Running migrations...\n');
  await createDatabase();
  await runSchema();
  console.log('\n🎉 Migration complete. Run npm run db:seed to add demo data.\n');
} catch (err) {
  console.error('\n❌ Migration failed:', err.message);
  console.error('   Check your DATABASE_URL in .env\n');
  process.exit(1);
}
