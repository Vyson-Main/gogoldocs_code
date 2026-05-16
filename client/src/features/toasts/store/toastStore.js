// ── Toast Store ───────────────────────────────────────────────────────────────
import { createStore } from '../../../utils/store.js';

export const toastStore = createStore({
  /** @type {Array<{id: string, message: string, type: 'success'|'error'|'info'}>} */
  toasts: [],
});
