// ── db:seed ───────────────────────────────────────────────────────────────────
// Inserts a demo user and two starter notes.
// Safe to run multiple times — skips if data already exists.
// Usage: npm run db:seed

import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });
import pg from 'pg';

const DATABASE_URL = process.env.DATABASE_URL
  ?? 'postgres://postgres:postgres@localhost:5432/gogoldocs';

const pool = new pg.Pool({ connectionString: DATABASE_URL });

try {
  console.log('\n🌱 Seeding database...\n');

  // Demo user — password is: demo1234
  const { rowCount: userRows } = await pool.query(`
    INSERT INTO users (id, email, password_hash)
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'demo@gogoldocs.app',
      '$2b$12$9tKnzrdU4BPomHBKhJyNKO6uCblUmRqZ.EhgNlrW.mGH.CJpsBD7O'
    )
    ON CONFLICT (email) DO NOTHING
  `);

  if (userRows > 0) {
    console.log('✅ Demo user created: demo@gogoldocs.app / demo1234');
  } else {
    console.log('ℹ️  Demo user already exists — skipping');
  }

  // Starter notes
  const { rowCount: noteRows } = await pool.query(`
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
    ON CONFLICT DO NOTHING
  `);

  if (noteRows > 0) {
    console.log(`✅ ${noteRows} starter note(s) created`);
  } else {
    console.log('ℹ️  Starter notes already exist — skipping');
  }

  // Verify
  const { rows: [counts] } = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM notes) AS notes
  `);
  console.log(`\n📊 Database now has ${counts.users} user(s) and ${counts.notes} note(s)`);
  console.log('\n🎉 Seed complete. Run npm run dev:server to start.\n');

  await pool.end();
} catch (err) {
  console.error('\n❌ Seed failed:', err.message);
  console.error('   Make sure you ran npm run db:migrate first.\n');
  process.exit(1);
}
