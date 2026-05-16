// ── Theme Service ─────────────────────────────────────────────────────────────
import { themeStore } from '../../utils/store.js';
import { config }     from '../../config/index.js';

function applyTheme(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

// Apply on load
applyTheme(themeStore.getState().mode);

export const themeService = {
  toggle() {
    const next = themeStore.getState().mode === 'light' ? 'dark' : 'light';
    themeStore.setState({ mode: next });
    localStorage.setItem(config.THEME_KEY, next);
    applyTheme(next);
  },

  getMode() {
    return themeStore.getState().mode;
  },
};
