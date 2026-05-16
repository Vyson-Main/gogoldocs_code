// ── Search Utilities ──────────────────────────────────────────────────────────

/**
 * Highlight matching terms in a string with a <mark> tag.
 * @param {string} text
 * @param {string} query
 * @returns {string} HTML string with matches wrapped in <mark>
 */
export function highlightMatch(text, query) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex   = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Check if a note matches a query locally (client-side fallback).
 * @param {{ title: string, body: string, isSecure: boolean }} note
 * @param {string} query
 * @returns {boolean}
 */
export function noteMatchesQuery(note, query) {
  if (note.isSecure) return false;
  const q = query.toLowerCase();
  return note.title.toLowerCase().includes(q) || note.body.toLowerCase().includes(q);
}
