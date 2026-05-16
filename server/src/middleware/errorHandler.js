// ── Error Handler Middleware ──────────────────────────────────────────────────
import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }
  console.error('[ERROR]', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

// ── Validation Middleware ─────────────────────────────────────────────────────
import { validationResult } from 'express-validator';

/**
 * @param {import('express-validator').ValidationChain[]} validators
 */
export function validate(validators) {
  return async (req, res, next) => {
    await Promise.all(validators.map(v => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }
    next();
  };
}
