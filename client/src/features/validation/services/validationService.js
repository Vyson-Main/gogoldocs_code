// ── Validation Service ────────────────────────────────────────────────────────
// Client-side validation rules for all note-related inputs.
// Mirror of the server-side express-validator rules in noteValidators.js.

import { MAX_TITLE_LENGTH, MIN_PASSWORD_LENGTH } from '/src/shared/constants/index.js';

/**
 * @typedef {{ valid: boolean, error: string|null }} ValidationResult
 */

export const validationService = {
  /**
   * Validate a note title.
   * @param {string} title
   * @returns {ValidationResult}
   */
  validateTitle(title) {
    const trimmed = title.trim();
    if (!trimmed)
      return { valid: false, error: 'Title cannot be empty.' };
    if (trimmed.length > MAX_TITLE_LENGTH)
      return { valid: false, error: `Title must be under ${MAX_TITLE_LENGTH} characters.` };
    return { valid: true, error: null };
  },

  /**
   * Validate note body (always valid — empty body is allowed).
   * @param {string} _body
   * @returns {ValidationResult}
   */
  validateBody(_body) {
    return { valid: true, error: null };
  },

  /**
   * Validate a new password (length + confirmation match).
   * @param {string} password
   * @param {string} confirm
   * @returns {ValidationResult}
   */
  validateNewPassword(password, confirm) {
    if (!password)
      return { valid: false, error: 'Password is required.' };
    if (password.length < MIN_PASSWORD_LENGTH)
      return { valid: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
    if (password !== confirm)
      return { valid: false, error: 'Passwords do not match.' };
    return { valid: true, error: null };
  },

  /**
   * Validate a password field is non-empty (for unlock / confirm flows).
   * @param {string} password
   * @returns {ValidationResult}
   */
  validatePassword(password) {
    if (!password)
      return { valid: false, error: 'Password is required.' };
    return { valid: true, error: null };
  },

  /**
   * Validate an email address.
   * @param {string} email
   * @returns {ValidationResult}
   */
  validateEmail(email) {
    const trimmed = email.trim();
    if (!trimmed)
      return { valid: false, error: 'Email is required.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return { valid: false, error: 'Please enter a valid email address.' };
    return { valid: true, error: null };
  },
};
