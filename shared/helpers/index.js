// ── Shared Utility Helpers ────────────────────────────────────────────────────

/**
 * Count words in a string.
 * @param {string} text
 * @returns {number}
 */
export function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { fn.apply(this, args); timer = null; }, delay);
  };
}

/**
 * Format ISO date string as relative or absolute.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  const now  = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1)   return 'just now';
  if (diffMins < 60)  return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Short date for list item display.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDateShort(isoString) {
  const date = new Date(isoString);
  const now  = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

/**
 * Generate a short random ID.
 * @returns {string}
 */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
