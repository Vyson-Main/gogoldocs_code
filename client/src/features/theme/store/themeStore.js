// ── Theme Store ───────────────────────────────────────────────────────────────
import { createStore } from '../../../utils/store.js';
import { config }      from '../../../config/index.js';

export const themeStore = createStore({
  /** @type {'light'|'dark'} */
  mode: (localStorage.getItem(config.THEME_KEY) ?? 'light'),
});
