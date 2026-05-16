// ── Password Utilities ────────────────────────────────────────────────────────

/**
 * Analyse password strength and return a UI-ready descriptor.
 * @param {string} pw
 * @returns {{ label: string, color: string, pct: number }}
 */
export function getPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 4)  score++;
  if (pw.length >= 8)  score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw))  score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const map = [
    { label: '',             color: 'transparent', pct: 0   },
    { label: 'Weak',         color: '#ef4444',     pct: 20  },
    { label: 'Weak',         color: '#ef4444',     pct: 40  },
    { label: 'Fair',         color: '#c8772a',     pct: 65  },
    { label: 'Strong',       color: '#22c55e',     pct: 85  },
    { label: 'Very strong',  color: '#22c55e',     pct: 100 },
  ];
  return map[Math.min(score, 5)];
}

/**
 * Check that two passwords match.
 * @param {string} pw1
 * @param {string} pw2
 * @returns {string|null} error message or null if ok
 */
export function validatePasswordMatch(pw1, pw2) {
  if (!pw1) return 'Password is required.';
  if (pw1.length < 4) return 'Password must be at least 4 characters.';
  if (pw1 !== pw2)    return 'Passwords do not match.';
  return null;
}
