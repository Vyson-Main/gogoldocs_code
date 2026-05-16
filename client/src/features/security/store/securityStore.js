// ── Security Store ────────────────────────────────────────────────────────────
// Tracks which notes are currently unlocked and failed attempt counts.
// Reset on page reload — unlock state is intentionally session-only.

import { createStore } from '/src/utils/store.js';
import { MAX_UNLOCK_ATTEMPTS } from '/src/shared/constants/index.js';

export const securityStore = createStore({
  /** @type {string[]} IDs of notes unlocked this session */
  unlockedIds:    [],
  /** @type {Record<string, number>} noteId → failed attempt count */
  failedAttempts: {},
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectIsUnlocked(noteId) {
  return securityStore.getState().unlockedIds.includes(noteId);
}

export function selectFailedAttempts(noteId) {
  return securityStore.getState().failedAttempts[noteId] ?? 0;
}

export function selectIsBlocked(noteId) {
  return selectFailedAttempts(noteId) >= MAX_UNLOCK_ATTEMPTS;
}

export function selectAttemptsLeft(noteId) {
  return Math.max(0, MAX_UNLOCK_ATTEMPTS - selectFailedAttempts(noteId));
}
