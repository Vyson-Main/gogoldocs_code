-- ═══════════════════════════════════════════════════════════════════════════
-- GoGolDocs — STEP 2 of 2
-- ⚠️  Make sure you are connected to the "gogoldocs" database before running
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extensions ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 2. Users table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. Notes table ───────────────────────────────────────────────────────────
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
);

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_notes_user_id
  ON notes(user_id);

CREATE INDEX IF NOT EXISTS idx_notes_updated_at
  ON notes(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_notes_title_fts
  ON notes USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_notes_body_fts
  ON notes USING gin(to_tsvector('english', body));

-- ── 5. Auto-update updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS notes_updated_at ON notes;
CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 6. Seed: demo user ────────────────────────────────────────────────────────
-- Password is: demo1234
INSERT INTO users (id, email, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'demo@gogoldocs.app',
  '$2b$12$9tKnzrdU4BPomHBKhJyNKO6uCblUmRqZ.EhgNlrW.mGH.CJpsBD7O'
)
ON CONFLICT (email) DO NOTHING;

-- ── 7. Seed: starter notes ────────────────────────────────────────────────────
INSERT INTO notes (user_id, title, body) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'Welcome to GoGolDocs',
  E'GoGolDocs is your minimal, secure notes app.\n\nThings you can do:\n- Create notes with the New Note button\n- Lock any note with a password (Secure Note in the toolbar)\n- Search notes using the search bar\n- Toggle dark mode with the icon in the top-right\n- Notes save automatically as you type\n\nEnjoy!'
),
(
  'a0000000-0000-0000-0000-000000000001',
  'Keyboard shortcuts',
  E'Enter    Confirm modal actions\nEsc      Close modals\nTab      Navigate focus within modals'
)
ON CONFLICT DO NOTHING;

-- ── 8. Verify everything worked ───────────────────────────────────────────────
SELECT
  (SELECT COUNT(*) FROM users) AS user_count,
  (SELECT COUNT(*) FROM notes) AS note_count,
  current_database()           AS database;
