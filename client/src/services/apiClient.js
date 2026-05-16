// ── API Client ────────────────────────────────────────────────────────────────
import { config } from '/src/config/index.js';

/**
 * Core fetch wrapper with auth, error normalization, and JSON handling.
 *
 * @param {string} path
 * @param {RequestInit & { params?: Record<string,string> }} [options]
 * @returns {Promise<any>}
 */
async function request(path, options = {}) {
  const { params, ...fetchOptions } = options;

  // Build URL with optional query params
  let url = config.API_BASE_URL + path;
  if (params && Object.keys(params).length) {
    url += '?' + new URLSearchParams(params).toString();
  }

  // Attach JWT
  const token = localStorage.getItem(config.TOKEN_KEY);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(fetchOptions.headers ?? {}),
  };

  const response = await fetch(url, { ...fetchOptions, headers });

  // No-content responses
  if (response.status === 204) return null;

  let body;
  try { body = await response.json(); } catch { body = {}; }

  if (!response.ok) {
    const message = body?.error ?? body?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  return body?.data ?? body;
}

export const apiClient = {
  get:    (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  post:   (path, data, opts = {}) => request(path, { ...opts, method: 'POST',  body: JSON.stringify(data) }),
  patch:  (path, data, opts = {}) => request(path, { ...opts, method: 'PATCH', body: JSON.stringify(data) }),
  delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
};
