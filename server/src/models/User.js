// ── User Model ────────────────────────────────────────────────────────────────
import { pool } from '../database/pool.js';

function toUser(row) {
  return {
    id:           row.id,
    email:        row.email,
    passwordHash: row.password_hash,
    createdAt:    row.created_at.toISOString(),
  };
}

export const UserModel = {
  async findByEmail(email) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );
    return rows[0] ? toUser(rows[0]) : null;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT * FROM users WHERE id = $1`, [id]
    );
    return rows[0] ? toUser(rows[0]) : null;
  },

  async create(email, passwordHash) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`,
      [email, passwordHash]
    );
    return toUser(rows[0]);
  },
};
