// ── Security Service ──────────────────────────────────────────────────────────
// All note locking / unlocking / password management logic lives here.

import { apiClient }     from '../../../services/apiClient.js';
import { securityStore } from '../store/securityStore.js';
import { notesStore }    from '../../notes/store/notesStore.js';
import { API_ROUTES }    from '../../../../../shared/constants/index.js';

export const securityService = {
  /**
   * Set a password on a note (lock it).
   * @param {string} noteId
   * @param {string} password
   */
  async secureNote(noteId, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_SECURE(noteId), { password });
    // Update the note in the notes store
    notesStore.setState(s => ({
      items: s.items.map(n => n.id === noteId ? note : n),
    }));
    // Mark as unlocked for this session (user just set the password)
    securityStore.setState(s => ({
      unlockedIds: [...new Set([...s.unlockedIds, noteId])],
    }));
    return note;
  },

  /**
   * Remove the password from a note (unlock permanently).
   * @param {string} noteId
   * @param {string} password
   */
  async removeNoteSecurity(noteId, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_LOCK(noteId), { password });
    notesStore.setState(s => ({
      items: s.items.map(n => n.id === noteId ? note : n),
    }));
    securityStore.setState(s => ({
      unlockedIds:    s.unlockedIds.filter(id => id !== noteId),
      failedAttempts: { ...s.failedAttempts, [noteId]: 0 },
    }));
    return note;
  },

  /**
   * Verify a password to unlock a note for this session.
   * @param {string} noteId
   * @param {string} password
   */
  async unlock(noteId, password) {
    await apiClient.post(API_ROUTES.NOTE_UNLOCK(noteId), { password });
    securityStore.setState(s => ({
      unlockedIds:    [...new Set([...s.unlockedIds, noteId])],
      failedAttempts: { ...s.failedAttempts, [noteId]: 0 },
    }));
  },

  /**
   * Record a failed unlock attempt locally.
   * @param {string} noteId
   */
  recordFailedAttempt(noteId) {
    securityStore.setState(s => {
      const prev = s.failedAttempts[noteId] ?? 0;
      return { failedAttempts: { ...s.failedAttempts, [noteId]: prev + 1 } };
    });
  },

  /**
   * Re-lock a note when navigating away (session lock only).
   * @param {string} noteId
   */
  reLock(noteId) {
    securityStore.setState(s => ({
      unlockedIds: s.unlockedIds.filter(id => id !== noteId),
    }));
  },
};
