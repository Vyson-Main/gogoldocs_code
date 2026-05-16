// ── Shared Constants ──────────────────────────────────────────────────────────
export const API_ROUTES = {
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN:    '/auth/login',
  AUTH_ME:       '/auth/me',
  NOTES:         '/notes',
  NOTE:          (id) => `/notes/${id}`,
  NOTE_SECURE:   (id) => `/notes/${id}/secure`,
  NOTE_UNLOCK:   (id) => `/notes/${id}/unlock`,
  NOTE_LOCK:     (id) => `/notes/${id}/lock`,
};

export const MAX_UNLOCK_ATTEMPTS  = 5;
export const AUTOSAVE_DELAY_MS    = 800;
export const TOAST_DURATION_MS    = 3000;
export const DEBOUNCE_SEARCH_MS   = 300;
export const MAX_TITLE_LENGTH     = 120;
export const MIN_PASSWORD_LENGTH  = 4;
