// ── Theme Utilities ───────────────────────────────────────────────────────────

/**
 * Apply a theme mode to the document root.
 * @param {'light'|'dark'} mode
 */
export function applyThemeClass(mode) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
  document.documentElement.classList.toggle('light', mode === 'light');
}

/**
 * Get the opposite theme mode.
 * @param {'light'|'dark'} mode
 * @returns {'light'|'dark'}
 */
export function oppositeMode(mode) {
  return mode === 'light' ? 'dark' : 'light';
}
