// ── Delete Note Modal Component ───────────────────────────────────────────────
// Self-contained modal for deleting a note.
// If the note is secure, user must enter the password to confirm.

import { createModal }  from '../../../components/modals/modal.js';
import { deleteService } from '../services/deleteService.js';
import { toast }        from '../../toasts/toastService.js';
import { escapeHtml }   from '../../../../../shared/helpers/index.js';

/**
 * @param {import('../../../../../shared/types/index.js').Note} note
 * @param {boolean} isUnlocked - whether the note is currently unlocked in this session
 */
export function openDeleteModal(note, isUnlocked) {
  const displayTitle   = note.isSecure ? 'Secured Note' : (note.title || 'Untitled');
  const requiresPassword = note.isSecure && !isUnlocked;

  let closeModal;

  const { modal, close } = createModal({
    title: 'Delete Note',
    bodyHTML: `
      <p class="modal__desc">
        Permanently delete <strong>"${escapeHtml(displayTitle)}"</strong>?
        This cannot be undone.
      </p>

      ${requiresPassword ? `
        <div class="input-group" style="margin-bottom:16px">
          <label for="del-password">Confirm Password</label>
          <input
            id="del-password"
            class="input-base"
            type="password"
            placeholder="Enter note password to confirm"
            autocomplete="current-password"
          />
          <span class="input-error" id="del-error" style="display:none"></span>
        </div>
      ` : ''}

      <div class="modal__actions">
        <button class="btn btn--ghost"  id="del-cancel">Cancel</button>
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
  pwInput?.addEventListener('keydown',  e => { if (e.key === 'Enter') handleDelete(); });
  pwInput?.addEventListener('input', () => { if (errorEl) errorEl.style.display = 'none'; });

  async function handleDelete() {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="btn__spinner"></span> Deleting…`;

    try {
      if (requiresPassword) {
        const pw = pwInput?.value ?? '';
        if (!pw) {
          if (errorEl) { errorEl.textContent = 'Password is required.'; errorEl.style.display = ''; }
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Delete';
          return;
        }
        await deleteService.deleteSecureNote(note.id, pw);
      } else {
        await deleteService.deleteNote(note.id);
      }

      toast('Note deleted.', 'info');
      closeModal();
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message ?? 'Incorrect password.';
        errorEl.style.display = '';
        if (pwInput) pwInput.value = '';
      } else {
        toast(err.message, 'error');
      }
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete';
    }
  }

  confirmBtn.addEventListener('click', handleDelete);
}
