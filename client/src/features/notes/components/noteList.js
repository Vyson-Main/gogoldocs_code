// ── Note List Component ───────────────────────────────────────────────────────
import { notesStore, searchStore } from '/src/utils/store.js';
import { notesService } from '/src/features/notes/services/notesService.js';
import { getNoteDisplayTitle, getNotePreview, formatDateShort } from '/src/features/notes/utils/noteHelpers.js';
import { escapeHtml } from '/src/shared/helpers/index.js';

const LOCK_ICON = `
  <svg class="note-item__lock-icon" width="11" height="11" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="2.5">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>`;

/**
 * Renders the note list into a container element.
 * @param {HTMLElement} container
 */
export function mountNoteList(container) {
  function renderItem(note) {
    const activeId = notesStore.getState().activeId;
    const isActive = note.id === activeId;
    const title    = escapeHtml(getNoteDisplayTitle(note));
    const preview  = escapeHtml(getNotePreview(note));
    const date     = escapeHtml(formatDateShort(note.updatedAt));

    return `
      <div class="note-item ${isActive ? 'note-item--active' : ''}"
           data-id="${note.id}" role="button" tabindex="0">
        <div class="note-item__header">
          ${note.isSecure ? LOCK_ICON : ''}
          <span class="note-item__title">${title}</span>
          <span class="note-item__date">${date}</span>
        </div>
        <p class="note-item__preview">${preview}</p>
      </div>
    `;
  }

  function render() {
    const { items, loading, error } = notesStore.getState();
    const { query } = searchStore.getState();

    if (loading) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;padding:40px">
          <div class="spinner"></div>
        </div>`;
      return;
    }

    if (error) {
      container.innerHTML = `<p style="padding:32px 16px;text-align:center;font-size:13px;color:var(--color-error)">${escapeHtml(error)}</p>`;
      return;
    }

    if (!items.length) {
      const msg = query ? 'No matching notes.' : 'No notes yet.\nCreate one to get started.';
      container.innerHTML = `<p style="padding:32px 16px;text-align:center;font-size:13px;color:var(--color-text-muted);white-space:pre-line">${msg}</p>`;
      return;
    }

    const sorted = [...items].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    container.innerHTML = sorted.map(renderItem).join('');
  }

  // Event delegation — click on note items
  container.addEventListener('click', (e) => {
    const item = e.target.closest('.note-item');
    if (item?.dataset.id) notesService.setActive(item.dataset.id);
  });

  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.note-item');
      if (item?.dataset.id) notesService.setActive(item.dataset.id);
    }
  });

  // Subscribe to state
  notesStore.subscribe(render);
  searchStore.subscribe(render);

  // Initial render
  render();
}
