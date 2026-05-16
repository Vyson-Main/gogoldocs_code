// ── Theme Store ───────────────────────────────────────────────────────────────
import { createStore } from '/src/utils/store.js';
import { config }      from '/src/config/index.js';

export const themeStore = createStore({
  /** @type {'light'|'dark'} */
  mode: (localStorage.getItem(config.THEME_KEY) ?? 'light'),
});
