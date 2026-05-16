// ── Note Editor Component ─────────────────────────────────────────────────────
import { notesStore }    from '../../utils/store.js';
import { notesService }  from '../notes/services/notesService.js';
import { createAutosave } from '../../utils/autosave.js';
import { getNoteWordCount, formatDate } from '../notes/utils/noteHelpers.js';
import { MAX_UNLOCK_ATTEMPTS } from '../../../../shared/constants/index.js';
import { escapeHtml } from '../../../../shared/helpers/index.js';

// Lazy-import modals to avoid circular deps
const getNewNoteModal        = () => import('../../components/modals/newNoteModal.js').then(m => m.openNewNoteModal);
const getSecureNoteModal     = () => import('../../components/modals/secureNoteModal.js').then(m => m.openSecureNoteModal);
const getRemoveSecurityModal = () => import('../../components/modals/removeSecurityModal.js').then(m => m.openRemoveSecurityModal);
const getDeleteNoteModal     = () => import('../../components/modals/deleteNoteModal.js').then(m => m.openDeleteNoteModal);

// ── SVG icons ────────────────────────────────────────────────────────────────
const ICON_LOCK = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
const ICON_DOC  = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
const ICON_TRASH = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>`;

/**
 * Mounts the complete note editor (empty state, locked state, active editor).
 * @param {HTMLElement} container
 */
export function mountEditor(container) {
  let autosave = createAutosave(() => {});
  let savedVisible = false;
  let currentNoteId = null;

  // ── Templates ──────────────────────────────────────────────────────────────

  function emptyStateHTML() {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${ICON_DOC}</div>
        <div class="empty-state__text">
          <p class="font-serif" style="font-size:20px;color:var(--color-text-secondary)">No note selected</p>
          <p>Pick a note or create a new one.</p>
        </div>
      </div>`;
  }

  function toolbarHTML(note, isLocked) {
    const isSecure   = note.isSecure;
    const secureBtn  = isSecure
      ? `<button class="toolbar__btn toolbar__btn--secure" id="tb-remove-lock">${ICON_LOCK} Remove Lock</button>`
      : `<button class="toolbar__btn" id="tb-secure">${ICON_LOCK} Secure Note</button>`;

    const savedBadge = savedVisible
      ? `<div class="toolbar__saved"><span class="toolbar__saved-dot"></span>Saved</div><div class="toolbar__divider"></div>`
      : '';

    const deleteDisabled = (isLocked) ? 'disabled title="Unlock the note first to delete"' : '';

    return `
      <div class="toolbar">
        ${secureBtn}
        <div class="toolbar__divider"></div>
        <div class="toolbar__spacer"></div>
        ${savedBadge}
        <button class="toolbar__btn toolbar__btn--delete" id="tb-delete" ${deleteDisabled}>${ICON_TRASH} Delete</button>
      </div>`;
  }

  function lockedStateHTML(note, attemptsLeft, isBlocked) {
    return `
      ${toolbarHTML(note, true)}
      <div class="locked-state">
        <div class="locked-state__ring">${ICON_LOCK}</div>
        <div class="locked-state__text">
          <h2>Secured Note</h2>
          <p>Enter your password to open, edit, or delete this note.</p>
        </div>
        ${isBlocked
          ? `<p class="locked-state__blocked">Too many failed attempts. Select another note.</p>`
          : `<div class="locked-state__form">
               <input class="input-base" id="unlock-pw" type="password"
                      placeholder="Enter password" style="text-align:center;letter-spacing:.15em" />
               <span class="input-error" id="unlock-error" style="display:none"></span>
               ${attemptsLeft < MAX_UNLOCK_ATTEMPTS && attemptsLeft > 0
                 ? `<p class="locked-state__attempts">${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining</p>`
                 : ''}
               <button class="btn btn--primary btn--full" id="unlock-btn"
                 style="background:var(--color-gold);color:#fff">Unlock</button>
             </div>`
        }
      </div>`;
  }

  function editorHTML(note) {
    const secureTag = note.isSecure
      ? `<span class="editor__meta-secure">${ICON_LOCK} Secured</span>`
      : '';
    return `
      ${toolbarHTML(note, false)}
      <input class="editor__title" id="editor-title" type="text"
             placeholder="Note title…" maxlength="120"
             value="${escapeHtml(note.title)}" />
      <div class="editor__meta">
        <span>Edited ${escapeHtml(formatDate(note.updatedAt))}</span>
        ${secureTag}
      </div>
      <textarea class="editor__body" id="editor-body"
                placeholder="Start writing…">${escapeHtml(note.body)}</textarea>
      <div class="editor__wordcount" id="editor-wc">${getNoteWordCount(note.body)}</div>`;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  function render() {
    const { items, activeId, unlockedIds, failedAttempts } = notesStore.getState();
    const note = activeId ? items.find(n => n.id === activeId) : null;

    if (!note) {
      container.innerHTML = emptyStateHTML();
      autosave.cancel();
      currentNoteId = null;
      return;
    }

    const isUnlocked = unlockedIds.includes(note.id);
    const isLocked   = note.isSecure && !isUnlocked;
    const attempts   = failedAttempts[note.id] ?? 0;
    const isBlocked  = attempts >= MAX_UNLOCK_ATTEMPTS;
    const attemptsLeft = Math.max(0, MAX_UNLOCK_ATTEMPTS - attempts);

    if (isLocked) {
      container.innerHTML = lockedStateHTML(note, attemptsLeft, isBlocked);
      autosave.cancel();
      currentNoteId = null;
      bindLockedEvents(note);
      return;
    }

    // If switching notes, reset autosave
    if (note.id !== currentNoteId) {
      autosave.cancel();
      autosave = createAutosave((saved) => {
        savedVisible = saved;
        // Re-render toolbar only
        const tb = container.querySelector('.toolbar');
        if (tb) tb.outerHTML = toolbarHTML(note, false);
        bindToolbarEvents(note, isUnlocked);
      });
      currentNoteId = note.id;
      container.innerHTML = editorHTML(note);
      bindEditorEvents(note);
      bindToolbarEvents(note, isUnlocked);
    } else {
      // Only update wordcount and toolbar
      const wc = container.querySelector('#editor-wc');
      const body = container.querySelector('#editor-body');
      if (wc && body) wc.textContent = getNoteWordCount(body.value);
    }
  }

  // ── Event bindings ─────────────────────────────────────────────────────────

  function bindEditorEvents(note) {
    const titleInput = container.querySelector('#editor-title');
    const bodyInput  = container.querySelector('#editor-body');
    const wcEl       = container.querySelector('#editor-wc');

    if (!titleInput || !bodyInput) return;

    titleInput.addEventListener('input', () => {
      autosave.save(note.id, titleInput.value, bodyInput.value);
    });

    bodyInput.addEventListener('input', () => {
      if (wcEl) wcEl.textContent = getNoteWordCount(bodyInput.value);
      autosave.save(note.id, titleInput.value, bodyInput.value);
    });
  }

  function bindToolbarEvents(note, isUnlocked) {
    const secureBtn     = container.querySelector('#tb-secure');
    const removeLockBtn = container.querySelector('#tb-remove-lock');
    const deleteBtn     = container.querySelector('#tb-delete');

    secureBtn?.addEventListener('click', async () => {
      const open = await getSecureNoteModal();
      open(note.id);
    });

    removeLockBtn?.addEventListener('click', async () => {
      const open = await getRemoveSecurityModal();
      open(note.id);
    });

    deleteBtn?.addEventListener('click', async () => {
      const open = await getDeleteNoteModal();
      open(note, isUnlocked);
    });
  }

  function bindLockedEvents(note) {
    const pwInput   = container.querySelector('#unlock-pw');
    const errorEl   = container.querySelector('#unlock-error');
    const unlockBtn = container.querySelector('#unlock-btn');
    const removeLockBtn = container.querySelector('#tb-remove-lock');
    const deleteBtn = container.querySelector('#tb-delete');

    removeLockBtn?.addEventListener('click', async () => {
      const open = await getRemoveSecurityModal();
      open(note.id);
    });

    deleteBtn?.addEventListener('click', async () => {
      const open = await getDeleteNoteModal();
      open(note, false);
    });

    if (!pwInput || !unlockBtn) return;

    pwInput.focus();
    pwInput.addEventListener('input', () => { errorEl.style.display = 'none'; });
    pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleUnlock(); });
    unlockBtn.addEventListener('click', handleUnlock);

    async function handleUnlock() {
      const pw = pwInput.value;
      if (!pw) {
        errorEl.textContent = 'Password is required.';
        errorEl.style.display = '';
        return;
      }

      unlockBtn.disabled = true;
      unlockBtn.innerHTML = `<span class="btn__spinner"></span> Unlocking…`;

      try {
        await notesService.unlock(note.id, pw);
        // notesStore update triggers re-render automatically
      } catch (err) {
        notesService.recordFailedAttempt(note.id);
        errorEl.textContent = err.message ?? 'Incorrect password.';
        errorEl.style.display = '';
        pwInput.value = '';
        unlockBtn.disabled = false;
        unlockBtn.textContent = 'Unlock';
      }
    }
  }

  // ── Subscribe & init ───────────────────────────────────────────────────────
  notesStore.subscribe(render);
  render();
}
