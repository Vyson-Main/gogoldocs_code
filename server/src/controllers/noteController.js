// ── Note Controller ───────────────────────────────────────────────────────────
import { noteService }        from '../services/noteService.js';
import { ok, created, noContent } from '../utils/response.js';

export const noteController = {
  async list(req, res, next) {
    try {
      const { q } = req.query;
      const notes = q
        ? await noteService.search(req.userId, String(q))
        : await noteService.list(req.userId);
      ok(res, notes);
    } catch (err) { next(err); }
  },

  async get(req, res, next) {
    try {
      ok(res, await noteService.get(req.params.id, req.userId));
    } catch (err) { next(err); }
  },

  async create(req, res, next) {
    try {
      const { title, body } = req.body;
      created(res, await noteService.create(req.userId, title, body));
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      ok(res, await noteService.update(req.params.id, req.userId, req.body));
    } catch (err) { next(err); }
  },

  async delete(req, res, next) {
    try {
      await noteService.delete(req.params.id, req.userId);
      noContent(res);
    } catch (err) { next(err); }
  },

  async secure(req, res, next) {
    try {
      ok(res, await noteService.secureNote(req.params.id, req.userId, req.body.password), 'Note secured');
    } catch (err) { next(err); }
  },

  async removeSecurity(req, res, next) {
    try {
      ok(res, await noteService.removeNoteSecurity(req.params.id, req.userId, req.body.password), 'Security removed');
    } catch (err) { next(err); }
  },

  async unlock(req, res, next) {
    try {
      await noteService.verifyPassword(req.params.id, req.userId, req.body.password);
      ok(res, { unlocked: true }, 'Note unlocked');
    } catch (err) { next(err); }
  },
};
