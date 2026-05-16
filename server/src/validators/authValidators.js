// ── Auth Validators ───────────────────────────────────────────────────────────
import { body } from 'express-validator';

export const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];
