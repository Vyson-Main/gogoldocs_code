// ── Delete Note Modal ─────────────────────────────────────────────────────────
import { createModal } from '../modals/modal.js';
import { notesService } from '../../features/notes/services/notesService.js';
import { toast }        from '../../features/toasts/toastService.js';
import { apiClient }    from '../../services/apiClient.js';
import { API_ROUTES }   from '../../../../shared/constants/index.js';
import { escapeHtml }   from '../../../../shared/helpers/index.js';

/**
 * @param {import('../../../../shared/types/index.js').Note} note
 * @param {boolean} isUnlocked
 */
export function openDeleteNoteModal(note, isUnlocked) {
  const needsPassword = note.isSecure && isUnlocked;
  const displayTitle  = note.isSecure ? 'Secured Note' : (note.title || 'Untitled');

  let closeModal;

  const { modal, close } = createModal({
    title: 'Delete Note',
    bodyHTML: `
      <p class="modal__desc">
        Delete <strong>"${escapeHtml(displayTitle)}"</strong>? This cannot be undone.
      </p>
      ${needsPassword ? `
        <div class="input-group" style="margin-bottom:16px">
          <label for="del-password">Confirm Password</label>
          <input id="del-password" class="input-base" type="password" placeholder="Enter note password" />
          <span class="input-error" id="del-error" style="display:none"></span>
        </div>
      ` : ''}
      <div class="modal__actions">
        <button class="btn btn--ghost" id="del-cancel">Cancel</button>
        <button class="btn btn--danger" id="del-confirm">Delete</button>
      </div>
    `,
    onClose: () => {},
  });

  closeModal = close;

  const cancelBtn  = modal.querySelector('#del-cancel');
  const confirmBtn = modal.querySelector('#del-confirm');
  const pwInput    = modal.querySelector('#del-password');
  const errorEl    = modal.querySelector('#del-error');

  cancelBtn.addEventListener('click', () => closeModal());
  if (pwInput) {
    pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleDelete(); });
    pwInput.addEventListener('input', () => { if (errorEl) errorEl.style.display = 'none'; });
  }

  async function handleDelete() {
    if (needsPassword) {
      const pw = pwInput?.value ?? '';
      if (!pw) {
        errorEl.textContent = 'Password is required.';
        errorEl.style.display = '';
        return;
      }
      // Verify password via unlock endpoint
      try {
        await apiClient.post(API_ROUTES.NOTE_UNLOCK(note.id), { password: pw });
      } catch {
        if (errorEl) {
          errorEl.textContent = 'Incorrect password.';
          errorEl.style.display = '';
        }
        if (pwInput) pwInput.value = '';
        return;
      }
    }

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="btn__spinner"></span> Deleting…`;

    try {
      await notesService.delete(note.id);
      toast('Note deleted.', 'info');
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete';
    }
  }

  confirmBtn.addEventListener('click', handleDelete);
}
