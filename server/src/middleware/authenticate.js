// ── Auth Middleware ───────────────────────────────────────────────────────────
import jwt        from 'jsonwebtoken';
import { env }    from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(ApiError.unauthorized('No token provided'));

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired token'));
  }
}
