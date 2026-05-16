// ── Server Environment Config ─────────────────────────────────────────────────
import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

function required(key, fallback) {
  const val = process.env[key] ?? fallback;
  if (!val) {
    console.error(`[Config] Missing required env var: ${key}`);
    console.error(`[Config] Make sure your .env file exists and is populated.`);
    process.exit(1);
  }
  return val;
}

export const env = {
  NODE_ENV:       process.env.NODE_ENV    ?? 'development',
  PORT:           parseInt(process.env.PORT ?? '3001', 10),
  // Default targets local pgAdmin4 PostgreSQL
  DATABASE_URL:   required('DATABASE_URL', 'postgres://postgres:postgres@localhost:5432/gogoldocs'),
  JWT_SECRET:     required('JWT_SECRET',   'gogoldocs_dev_secret_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CLIENT_ORIGIN:  process.env.CLIENT_ORIGIN  ?? 'http://localhost:5500',
};
