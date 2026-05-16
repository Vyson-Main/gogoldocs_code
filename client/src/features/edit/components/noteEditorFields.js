// ── Note Editor Fields Component ──────────────────────────────────────────────
// Renders just the editable title + body fields (no toolbar, no locked state).
// Used inside noteEditor.js for the active-and-unlocked state.

import { editService } from '../services/editService.js';
import { getNoteWordCount, formatDate } from '../../notes/utils/noteHelpers.js';
import { escapeHtml } from '../../../../../shared/helpers/index.js';

const ICON_LOCK = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5">
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>`;

/**
 * Render editable fields into container and wire up autosave.
 * @param {HTMLElement} container
 * @param {import('../../../../../shared/types/index.js').Note} note
 * @param {(saving: boolean) => void} onSavingChange
 * @returns {{ destroy: () => void }}
 */
export function renderEditorFields(container, note, onSavingChange) {
  container.innerHTML = `
    <input
      class="editor__title"
      id="editor-title"
      type="text"
      placeholder="Note title…"
      maxlength="120"
      value="${escapeHtml(note.title)}"
    />
    <div class="editor__meta">
      <span id="editor-updated">Edited ${escapeHtml(formatDate(note.updatedAt))}</span>
      ${note.isSecure
        ? `<span class="editor__meta-secure">${ICON_LOCK} Secured</span>`
        : ''}
    </div>
    <textarea
      class="editor__body"
      id="editor-body"
      placeholder="Start writing…"
    >${escapeHtml(note.body)}</textarea>
    <div class="editor__wordcount" id="editor-wc">
      ${getNoteWordCount(note.body)}
    </div>
  `;

  const titleEl = container.querySelector('#editor-title');
  const bodyEl  = container.querySelector('#editor-body');
  const wcEl    = container.querySelector('#editor-wc');

  let saveTimer = null;

  function scheduleAutosave() {
    onSavingChange(true);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        await editService.saveNote(note.id, {
          title: titleEl.value,
          body:  bodyEl.value,
        });
        onSavingChange(false);
      } catch {
        // silent — retry on next keystroke
        onSavingChange(null);
      }
    }, 800);
  }

  titleEl.addEventListener('input', () => {
    editService.patchLocally(note.id, { title: titleEl.value });
    scheduleAutosave();
  });

  bodyEl.addEventListener('input', () => {
    if (wcEl) wcEl.textContent = getNoteWordCount(bodyEl.value);
    editService.patchLocally(note.id, { body: bodyEl.value });
    scheduleAutosave();
  });

  return {
    destroy() {
      clearTimeout(saveTimer);
    },
  };
}
