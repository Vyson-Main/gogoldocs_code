// ── Note Model ────────────────────────────────────────────────────────────────
import { pool } from '../database/pool.js';

function toNote(row) {
  return {
    id:             row.id,
    userId:         row.user_id,
    title:          row.title,
    body:           row.body,
    isSecure:       row.is_secure,
    isLocked:       row.is_secure,
    createdAt:      row.created_at.toISOString(),
    updatedAt:      row.updated_at.toISOString(),
    passwordHash:   row.password_hash,
    failedAttempts: row.failed_attempts,
  };
}

export const NoteModel = {
  async findByUser(userId) {
    const { rows } = await pool.query(
      `SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC`, [userId]
    );
    return rows.map(toNote);
  },

  async findById(id, userId) {
    const { rows } = await pool.query(
      `SELECT * FROM notes WHERE id = $1 AND user_id = $2`, [id, userId]
    );
    return rows[0] ? toNote(rows[0]) : null;
  },

  async search(userId, query) {
    const { rows } = await pool.query(
      `SELECT * FROM notes
       WHERE user_id = $1
         AND is_secure = FALSE
         AND (
           to_tsvector('english', title) @@ plainto_tsquery($2)
           OR to_tsvector('english', body)  @@ plainto_tsquery($2)
           OR title ILIKE $3
         )
       ORDER BY updated_at DESC`,
      [userId, query, `%${query}%`]
    );
    return rows.map(toNote);
  },

  async create(userId, title, body = '') {
    const { rows } = await pool.query(
      `INSERT INTO notes (user_id, title, body) VALUES ($1, $2, $3) RETURNING *`,
      [userId, title, body]
    );
    return toNote(rows[0]);
  },

  async update(id, userId, fields) {
    const { rows } = await pool.query(
      `UPDATE notes SET
         title = COALESCE($3, title),
         body  = COALESCE($4, body)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, fields.title, fields.body]
    );
    return rows[0] ? toNote(rows[0]) : null;
  },

  async delete(id, userId) {
    const { rowCount } = await pool.query(
      `DELETE FROM notes WHERE id = $1 AND user_id = $2`, [id, userId]
    );
    return (rowCount ?? 0) > 0;
  },

  async setPassword(id, userId, hash) {
    const { rows } = await pool.query(
      `UPDATE notes SET is_secure = TRUE, password_hash = $3, failed_attempts = 0
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId, hash]
    );
    return rows[0] ? toNote(rows[0]) : null;
  },

  async removePassword(id, userId) {
    const { rows } = await pool.query(
      `UPDATE notes SET is_secure = FALSE, password_hash = NULL, failed_attempts = 0
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId]
    );
    return rows[0] ? toNote(rows[0]) : null;
  },

  async incrementFailedAttempts(id) {
    const { rows } = await pool.query(
      `UPDATE notes SET failed_attempts = failed_attempts + 1
       WHERE id = $1 RETURNING failed_attempts`,
      [id]
    );
    return rows[0]?.failed_attempts ?? 0;
  },

  async resetFailedAttempts(id) {
    await pool.query(`UPDATE notes SET failed_attempts = 0 WHERE id = $1`, [id]);
  },
};
