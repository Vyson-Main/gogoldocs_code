// ── Auth Store ────────────────────────────────────────────────────────────────
import { createStore } from '/src/utils/store.js';
import { config }      from '/src/config/index.js';

export const authStore = createStore({
  /** @type {import('../../../../../shared/types/index.js').User|null} */
  user:    null,
  /** @type {string|null} */
  token:   localStorage.getItem(config.TOKEN_KEY),
  loading: false,
  /** @type {string|null} */
  error:   null,
});
