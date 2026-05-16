// ── Toast Container Component ─────────────────────────────────────────────────
import { toastStore } from '../../utils/store.js';

let containerEl = null;

function getContainer() {
  if (!containerEl) {
    containerEl = document.createElement('div');
    containerEl.className = 'toast-container';
    document.body.appendChild(containerEl);
  }
  return containerEl;
}

function renderToasts(toasts) {
  const container = getContainer();
  // Diff: remove toasts no longer in state
  const existing = new Set([...container.children].map(el => el.dataset.id));
  const incoming = new Set(toasts.map(t => t.id));

  // Remove departed
  for (const child of [...container.children]) {
    if (!incoming.has(child.dataset.id)) child.remove();
  }

  // Add new
  for (const toast of toasts) {
    if (!existing.has(toast.id)) {
      const el = document.createElement('div');
      el.className = `toast toast--${toast.type}`;
      el.dataset.id = toast.id;
      el.textContent = toast.message;
      container.appendChild(el);
    }
  }
}

// Subscribe to store
toastStore.subscribe(s => renderToasts(s.toasts));
