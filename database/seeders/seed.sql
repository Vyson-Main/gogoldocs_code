-- GoGolDocs — Seed Data
-- Usage: psql $DATABASE_URL -f database/seeders/seed.sql
--
-- Password for demo user: demo1234
-- Password hash generated with bcrypt, 12 rounds.

INSERT INTO users (id, email, password_hash)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'demo@gogoldocs.app',
  '$2b$12$9tKnzrdU4BPomHBKhJyNKO6uCblUmRqZ.EhgNlrW.mGH.CJpsBD7O'  -- demo1234
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO notes (user_id, title, body)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Welcome to GoGolDocs',
    'GoGolDocs is a clean, secure notes app.

You can:
- Create notes with the New Note button
- Lock notes with a password using Secure Note
- Search notes with the search bar
- Toggle dark mode with the moon icon

Enjoy!'
  ),
  (
    'a0000000-0000-0000-0000-000000000001',
    'Keyboard shortcuts',
    'Enter  — Confirm modal actions
Esc    — Close modals
Tab    — Navigate focus within modals'
  )
ON CONFLICT DO NOTHING;
