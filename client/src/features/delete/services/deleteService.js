// ── Delete Service ────────────────────────────────────────────────────────────
// Handles note deletion including password-gated deletion for secure notes.

import { apiClient }  from '/src/services/apiClient.js';
import { notesStore } from '/src/features/notes/store/notesStore.js';
import { securityStore } from '/src/features/security/store/securityStore.js';
import { API_ROUTES } from '/src/shared/constants/index.js';

export const deleteService = {
  /**
   * Delete a note by ID.
   * For secure notes, the server verifies ownership; client should have already
   * unlocked via securityService.unlock() before calling this.
   * @param {string} noteId
   */
  async deleteNote(noteId) {
    await apiClient.delete(API_ROUTES.NOTE(noteId));

    notesStore.setState(s => {
      const items    = s.items.filter(n => n.id !== noteId);
      const activeId = s.activeId === noteId ? (items[0]?.id ?? null) : s.activeId;
      return { items, activeId };
    });

    // Clean up any security state for this note
    securityStore.setState(s => ({
      unlockedIds:    s.unlockedIds.filter(id => id !== noteId),
      failedAttempts: Object.fromEntries(
        Object.entries(s.failedAttempts).filter(([id]) => id !== noteId)
      ),
    }));
  },

  /**
   * Verify a secure note's password, then delete it.
   * @param {string} noteId
   * @param {string} password
   */
  async deleteSecureNote(noteId, password) {
    // Verify password first — throws if incorrect
    await apiClient.post(API_ROUTES.NOTE_UNLOCK(noteId), { password });
    await this.deleteNote(noteId);
  },
};
