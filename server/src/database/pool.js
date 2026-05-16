// ── PostgreSQL Connection Pool ────────────────────────────────────────────────
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis:   30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

export async function connectDB() {
  const client = await pool.connect();
  console.log('[DB] PostgreSQL connected');
  client.release();
}
