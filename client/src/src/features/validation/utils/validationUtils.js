// ── Validation UI Utilities ───────────────────────────────────────────────────
// Helpers for showing/hiding error messages next to form fields.

/**
 * Show an error message on an input.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 * @param {string} message
 */
export function showFieldError(input, errorEl, message) {
  if (input)   input.classList.add('input-base--error');
  if (errorEl) { errorEl.textContent = message; errorEl.style.display = ''; }
}

/**
 * Clear an error message on an input.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 */
export function clearFieldError(input, errorEl) {
  if (input)   input.classList.remove('input-base--error');
  if (errorEl) { errorEl.textContent = ''; errorEl.style.display = 'none'; }
}

/**
 * Wire up auto-clear on input event.
 * @param {HTMLElement} input
 * @param {HTMLElement} errorEl
 */
export function autoClearError(input, errorEl) {
  input?.addEventListener('input', () => clearFieldError(input, errorEl));
}
