// ── Modal Component ───────────────────────────────────────────────────────────
import { trapFocus } from '/src/utils/dom.js';

/**
 * Creates and mounts a modal dialog.
 *
 * @param {Object} opts
 * @param {string}      opts.title
 * @param {string}      opts.bodyHTML   - inner HTML of modal body
 * @param {() => void}  opts.onClose
 * @returns {{ el: HTMLElement, close: () => void }}
 */
export function createModal({ title, bodyHTML, onClose }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h3 class="modal__title" id="modal-title">${title}</h3>
      <div class="modal__body">${bodyHTML}</div>
    </div>
  `;

  const modal = backdrop.querySelector('.modal');

  // Click outside closes
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  // Escape closes
  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', onKeydown);

  // Trap focus
  const releaseTrap = trapFocus(modal);

  document.body.appendChild(backdrop);

  // Focus first focusable element
  requestAnimationFrame(() => {
    const first = modal.querySelector('input, button, textarea, [tabindex]');
    if (first) first.focus();
  });

  function close() {
    onClose?.();
    backdrop.remove();
    document.removeEventListener('keydown', onKeydown);
    releaseTrap();
  }

  return { el: backdrop, modal, close };
}
