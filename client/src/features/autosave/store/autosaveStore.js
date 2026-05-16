// ── Autosave Store ────────────────────────────────────────────────────────────
// Tracks the current save status so any component can reflect it in the UI.

import { createStore } from '/src/utils/store.js';

/**
 * @typedef {'idle'|'pending'|'saving'|'saved'|'error'} AutosaveStatus
 */

export const autosaveStore = createStore({
  /** @type {AutosaveStatus} */
  status: 'idle',
});
