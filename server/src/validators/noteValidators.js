// ── Note Validators ───────────────────────────────────────────────────────────
import { body } from 'express-validator';
import { MAX_TITLE_LENGTH, MIN_PASSWORD_LENGTH } from '../../../shared/constants/index.js';

export const createNoteValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ max: MAX_TITLE_LENGTH }).withMessage(`Title max ${MAX_TITLE_LENGTH} chars`),
  body('body').optional().isString(),
];

export const updateNoteValidator = [
  body('title').optional().trim().isLength({ max: MAX_TITLE_LENGTH }),
  body('body').optional().isString(),
];

export const secureNoteValidator = [
  body('password').isLength({ min: MIN_PASSWORD_LENGTH })
    .withMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`),
];

export const unlockNoteValidator = [
  body('password').notEmpty().withMessage('Password is required'),
];
