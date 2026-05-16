-- GoGolDocs — PostgreSQL Schema
-- Run automatically by Docker on first start, or manually via:
--   psql $DATABASE_URL -f database/schema/init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notes ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(120) NOT NULL,
  body            TEXT DEFAULT '',
  is_secure       BOOLEAN DEFAULT FALSE,
  password_hash   TEXT,                  -- bcrypt hash; NULL when not secured
  failed_attempts INTEGER DEFAULT 0,     -- server-side brute-force protection
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notes_user_id    ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_title_fts  ON notes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_notes_body_fts   ON notes USING gin(to_tsvector('english', body));

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
