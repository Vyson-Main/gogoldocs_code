// ── Toast Service ─────────────────────────────────────────────────────────────
import { toastStore } from '../../utils/store.js';
import { uid }        from '../../../../shared/helpers/index.js';
import { TOAST_DURATION_MS } from '../../../../shared/constants/index.js';

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'} [type]
 */
export function toast(message, type = 'info') {
  const id = uid();
  toastStore.setState(s => ({
    toasts: [...s.toasts, { id, message, type }],
  }));
  setTimeout(() => {
    toastStore.setState(s => ({
      toasts: s.toasts.filter(t => t.id !== id),
    }));
  }, TOAST_DURATION_MS);
}
