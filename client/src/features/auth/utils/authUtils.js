// ── Auth Utilities ────────────────────────────────────────────────────────────
import { config } from '../../../config/index.js';

/**
 * Read the stored JWT from localStorage.
 * @returns {string|null}
 */
export function getStoredToken() {
  return localStorage.getItem(config.TOKEN_KEY);
}

/**
 * Persist a JWT to localStorage.
 * @param {string} token
 */
export function storeToken(token) {
  localStorage.setItem(config.TOKEN_KEY, token);
}

/**
 * Remove the JWT from localStorage.
 */
export function clearToken() {
  localStorage.removeItem(config.TOKEN_KEY);
}

/**
 * Check whether a user is currently authenticated.
 * @returns {boolean}
 */
export function isAuthenticated() {
  return Boolean(getStoredToken());
}
