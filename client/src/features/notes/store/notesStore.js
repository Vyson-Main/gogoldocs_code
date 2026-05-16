// ── Notes Store ───────────────────────────────────────────────────────────────
// Single source of truth for all note state.
// Consumed by: noteList, noteEditor, notesService, autosave, security, delete, edit.

import { createStore } from '../../../utils/store.js';

export const notesStore = createStore({
  /** @type {import('../../../../../shared/types/index.js').Note[]} */
  items:          [],
  /** @type {string|null} Active note ID */
  activeId:       null,
  loading:        false,
  saving:         false,
  /** @type {string|null} */
  error:          null,
});

// ── Selectors ─────────────────────────────────────────────────────────────────

export function selectActiveNote() {
  const { items, activeId } = notesStore.getState();
  return items.find(n => n.id === activeId) ?? null;
}

export function selectNoteById(id) {
  return notesStore.getState().items.find(n => n.id === id) ?? null;
}

export function selectSortedNotes() {
  return [...notesStore.getState().items].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}
