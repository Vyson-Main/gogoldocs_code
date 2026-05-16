// ── Remove Security Modal ─────────────────────────────────────────────────────
import { createModal }  from '../modals/modal.js';
import { notesService } from '../../features/notes/services/notesService.js';
import { toast }        from '../../features/toasts/toastService.js';

/** @param {string} noteId */
export function openRemoveSecurityModal(noteId) {
  let closeModal;

  const { modal, close } = createModal({
    title: 'Remove Lock',
    bodyHTML: `
      <p class="modal__desc">
        Enter your current password to remove the lock from this note.
      </p>
      <div class="input-group" style="margin-bottom:16px">
        <label for="rm-password">Current Password</label>
        <input id="rm-password" class="input-base" type="password" placeholder="Enter password" />
        <span class="input-error" id="rm-error" style="display:none"></span>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" id="rm-cancel">Cancel</button>
        <button class="btn btn--danger" id="rm-submit">Remove Lock</button>
      </div>
    `,
    onClose: () => {},
  });

  closeModal = close;

  const pwInput  = modal.querySelector('#rm-password');
  const errorEl  = modal.querySelector('#rm-error');
  const cancelBtn = modal.querySelector('#rm-cancel');
  const submitBtn = modal.querySelector('#rm-submit');

  cancelBtn.addEventListener('click', () => closeModal());
  pwInput.addEventListener('input', () => { errorEl.style.display = 'none'; });
  pwInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });

  async function handleSubmit() {
    const pw = pwInput.value;
    if (!pw) {
      errorEl.textContent = 'Password is required.';
      errorEl.style.display = '';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn__spinner"></span> Removing…`;

    try {
      await notesService.removeSecurity(noteId, pw);
      toast('Password removed from note.', 'info');
      closeModal();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = '';
      pwInput.value = '';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Remove Lock';
    }
  }

  submitBtn.addEventListener('click', handleSubmit);
}
