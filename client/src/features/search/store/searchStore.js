// ── Search Store ──────────────────────────────────────────────────────────────
import { createStore } from '/src/utils/store.js';

export const searchStore = createStore({
  /** @type {string} Current search query */
  query: '',
  /** @type {boolean} Whether a search is in flight */
  searching: false,
});
