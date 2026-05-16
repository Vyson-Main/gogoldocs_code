// ── Auth Controller ───────────────────────────────────────────────────────────
import { authService } from '../services/authService.js';
import { ok, created } from '../utils/response.js';

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      created(res, await authService.register(email, password));
    } catch (err) { next(err); }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      ok(res, await authService.login(email, password));
    } catch (err) { next(err); }
  },

  async me(req, res, next) {
    try {
      ok(res, await authService.me(req.userId));
    } catch (err) { next(err); }
  },
};
