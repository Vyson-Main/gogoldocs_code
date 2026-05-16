// ── Theme Toggle Component ────────────────────────────────────────────────────
import { themeService } from '/src/features/theme/services/themeService.js';
import { themeStore }   from '/src/utils/store.js';

const MOON_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const SUN_ICON  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;

/**
 * @param {HTMLElement} container
 */
export function mountThemeToggle(container) {
  const btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.title = 'Toggle dark mode';

  function updateIcon(mode) {
    btn.innerHTML = mode === 'dark' ? SUN_ICON : MOON_ICON;
  }

  updateIcon(themeService.getMode());

  btn.addEventListener('click', () => {
    themeService.toggle();
  });

  themeStore.subscribe(({ mode }) => updateIcon(mode));

  container.appendChild(btn);
}
