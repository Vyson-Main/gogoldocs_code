// ── Note Service (Server) ─────────────────────────────────────────────────────
import bcrypt   from 'bcrypt';
import { NoteModel } from '../models/Note.js';
import { ApiError }  from '../utils/ApiError.js';
import { MAX_UNLOCK_ATTEMPTS } from '../../../shared/constants/index.js';

const SALT_ROUNDS = 12;

function sanitize(note) {
  const { passwordHash, failedAttempts, ...safe } = note;
  return safe;
}

export const noteService = {
  async list(userId) {
    return (await NoteModel.findByUser(userId)).map(sanitize);
  },

  async get(id, userId) {
    const note = await NoteModel.findById(id, userId);
    if (!note) throw ApiError.notFound('Note not found');
    return sanitize(note);
  },

  async search(userId, query) {
    return (await NoteModel.search(userId, query)).map(sanitize);
  },

  async create(userId, title, body) {
    return sanitize(await NoteModel.create(userId, title, body));
  },

  async update(id, userId, fields) {
    const note = await NoteModel.update(id, userId, fields);
    if (!note) throw ApiError.notFound('Note not found');
    return sanitize(note);
  },

  async delete(id, userId) {
    const note = await NoteModel.findById(id, userId);
    if (!note) throw ApiError.notFound('Note not found');
    await NoteModel.delete(id, userId);
  },

  async secureNote(id, userId, password) {
    const existing = await NoteModel.findById(id, userId);
    if (!existing)       throw ApiError.notFound('Note not found');
    if (existing.isSecure) throw ApiError.conflict('Note is already secured');
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const note = await NoteModel.setPassword(id, userId, hash);
    if (!note) throw ApiError.internal();
    return sanitize(note);
  },

  async removeNoteSecurity(id, userId, password) {
    const existing = await NoteModel.findById(id, userId);
    if (!existing)                    throw ApiError.notFound('Note not found');
    if (!existing.isSecure || !existing.passwordHash)
      throw ApiError.badRequest('Note is not secured');
    const match = await bcrypt.compare(password, existing.passwordHash);
    if (!match) throw ApiError.forbidden('Incorrect password');
    return sanitize(await NoteModel.removePassword(id, userId));
  },

  async verifyPassword(id, userId, password) {
    const note = await NoteModel.findById(id, userId);
    if (!note)                   throw ApiError.notFound('Note not found');
    if (!note.isSecure || !note.passwordHash)
      throw ApiError.badRequest('Note is not secured');

    if ((note.failedAttempts ?? 0) >= MAX_UNLOCK_ATTEMPTS)
      throw ApiError.forbidden('Too many failed attempts');

    const match = await bcrypt.compare(password, note.passwordHash);
    if (!match) {
      const attempts  = await NoteModel.incrementFailedAttempts(id);
      const remaining = MAX_UNLOCK_ATTEMPTS - attempts;
      throw new ApiError(403, `Incorrect password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
    }

    await NoteModel.resetFailedAttempts(id);
    return true;
  },
};
