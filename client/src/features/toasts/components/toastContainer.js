// ── Toast Container Component ─────────────────────────────────────────────────
// Subscribes to the toast store and renders/removes toast elements in the DOM.

import { toastStore } from '/src/features/toasts/store/toastStore.js';

let containerEl = null;

function getContainer() {
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.className = 'toast-container';
    containerEl.setAttribute('aria-live', 'polite');
    containerEl.setAttribute('aria-atomic', 'false');
    document.body.appendChild(containerEl);
  }
  return containerEl;
}

function syncToasts(toasts) {
  const container = getContainer();

  // Build lookup of current DOM toasts
  const existing = new Map(
    [...container.children].map(el => [el.dataset.id, el])
  );
  const incoming = new Set(toasts.map(t => t.id));

  // Remove departed toasts
  for (const [id, el] of existing) {
    if (!incoming.has(id)) el.remove();
  }

  // Add new toasts
  for (const toast of toasts) {
    if (!existing.has(toast.id)) {
      const el = document.createElement('div');
      el.className   = `toast toast--${toast.type}`;
      el.dataset.id  = toast.id;
      el.textContent = toast.message;
      el.setAttribute('role', 'status');
      container.appendChild(el);
    }
  }
}

// Subscribe immediately on import
toastStore.subscribe(s => syncToasts(s.toasts));
