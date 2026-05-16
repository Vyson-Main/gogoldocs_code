// ── Edit Service ──────────────────────────────────────────────────────────────
// Handles all note content editing: updating title/body via the API and
// keeping the local store in sync optimistically.

import { apiClient }  from '/src/services/apiClient.js';
import { notesStore } from '/src/features/notes/store/notesStore.js';
import { API_ROUTES } from '/src/shared/constants/index.js';

export const editService = {
  /**
   * Optimistically patch the note in the local store (instant UI feedback).
   * @param {string} noteId
   * @param {{ title?: string, body?: string }} patch
   */
  patchLocally(noteId, patch) {
    notesStore.setState(s => ({
      items: s.items.map(n =>
        n.id === noteId
          ? { ...n, ...patch, updatedAt: new Date().toISOString() }
          : n
      ),
    }));
  },

  /**
   * Persist note changes to the server.
   * @param {string} noteId
   * @param {{ title?: string, body?: string }} fields
   * @returns {Promise<import('../../../../../shared/types/index.js').Note>}
   */
  async saveNote(noteId, fields) {
    notesStore.setState({ saving: true });
    try {
      const updated = await apiClient.patch(API_ROUTES.NOTE(noteId), fields);
      notesStore.setState(s => ({
        saving: false,
        items: s.items.map(n => n.id === noteId ? updated : n),
      }));
      return updated;
    } catch (err) {
      notesStore.setState({ saving: false });
      throw err;
    }
  },
};
