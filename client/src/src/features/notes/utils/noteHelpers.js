// ── Note Utility Helpers ──────────────────────────────────────────────────────
import { wordCount, formatDate, formatDateShort } from '/src/shared/helpers/index.js';

/**
 * @param {string} body
 * @returns {string}
 */
export function getNoteWordCount(body) {
  const w = wordCount(body);
  const c = body.length;
  return `${w} word${w !== 1 ? 's' : ''} · ${c} character${c !== 1 ? 's' : ''}`;
}

/**
 * @param {import('../../../../shared/types/index.js').Note} note
 * @returns {string}
 */
export function getNotePreview(note) {
  if (note.isSecure) return 'Password protected';
  return note.body.replace(/\n/g, ' ').trim() || 'No content';
}

/**
 * @param {import('../../../../shared/types/index.js').Note} note
 * @returns {string}
 */
export function getNoteDisplayTitle(note) {
  if (note.isSecure) return '••••••••••••';
  return note.title || 'Untitled';
}

/**
 * Password strength analysis.
 * @param {string} pw
 * @returns {{ label: string, color: string, pct: number }}
 */
export function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 4) score++;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: '',            color: 'transparent', pct: 0   },
    { label: 'Weak',        color: '#ef4444',      pct: 20  },
    { label: 'Weak',        color: '#ef4444',      pct: 40  },
    { label: 'Fair',        color: '#c8772a',      pct: 65  },
    { label: 'Strong',      color: '#22c55e',      pct: 85  },
    { label: 'Very strong', color: '#22c55e',      pct: 100 },
  ];
  return map[score] ?? map[0];
}

export { formatDate, formatDateShort };
