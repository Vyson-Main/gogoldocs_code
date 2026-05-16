// ── Client Configuration ──────────────────────────────────────────────────────
// API_BASE_URL is injected by the server at runtime via window.__ENV__
// In production (Vercel), this points to your Render backend URL.
// In development, it falls back to localhost:3001.
export const config = {
  API_BASE_URL: window.__ENV__?.API_BASE_URL ?? 'http://localhost:3001/api',
  TOKEN_KEY:    'gogoldocs_token',
  THEME_KEY:    'gogoldocs_theme',
};
