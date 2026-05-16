// ── Secure Note Modal ─────────────────────────────────────────────────────────
import { createModal }  from '../modals/modal.js';
import { notesService } from '../../features/notes/services/notesService.js';
import { toast }        from '../../features/toasts/toastService.js';
import { getPasswordStrength } from '../../features/notes/utils/noteHelpers.js';
import { MIN_PASSWORD_LENGTH } from '../../../../shared/constants/index.js';

/** @param {string} noteId */
export function openSecureNoteModal(noteId) {
  let closeModal;

  const { modal, close } = createModal({
    title: 'Secure This Note',
    bodyHTML: `
      <p class="modal__desc">
        Set a password to protect this note. Required to open, edit, or delete it.
      </p>
      <div class="form-fields">
        <div class="input-group">
          <label for="sec-pw1">Password</label>
          <input id="sec-pw1" class="input-base" type="password" placeholder="Enter password" />
          <div id="sec-strength-wrap" style="display:none">
            <div class="strength-bar-wrap">
              <div class="strength-bar" id="sec-strength-bar"></div>
            </div>
            <span class="strength-label" id="sec-strength-label"></span>
          </div>
        </div>
        <div class="input-group">
          <label for="sec-pw2">Confirm Password</label>
          <input id="sec-pw2" class="input-base" type="password" placeholder="Repeat password" />
          <span class="input-error" id="sec-error" style="display:none"></span>
        </div>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" id="sec-cancel">Cancel</button>
        <button class="btn btn--primary" id="sec-submit">Lock Note</button>
      </div>
    `,
    onClose: () => {},
  });

  closeModal = close;

  const pw1Input    = modal.querySelector('#sec-pw1');
  const pw2Input    = modal.querySelector('#sec-pw2');
  const errorEl     = modal.querySelector('#sec-error');
  const strengthWrap = modal.querySelector('#sec-strength-wrap');
  const strengthBar  = modal.querySelector('#sec-strength-bar');
  const strengthLabel = modal.querySelector('#sec-strength-label');
  const cancelBtn   = modal.querySelector('#sec-cancel');
  const submitBtn   = modal.querySelector('#sec-submit');

  // Live password strength
  pw1Input.addEventListener('input', () => {
    const val = pw1Input.value;
    if (!val) { strengthWrap.style.display = 'none'; return; }
    const s = getPasswordStrength(val);
    strengthWrap.style.display = '';
    strengthBar.style.width      = s.pct + '%';
    strengthBar.style.background = s.color;
    strengthLabel.textContent    = s.label;
    errorEl.style.display = 'none';
  });

  pw2Input.addEventListener('input', () => { errorEl.style.display = 'none'; });
  pw2Input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  cancelBtn.addEventListener('click', () => closeModal());

  async function handleSubmit() {
    const pw1 = pw1Input.value;
    const pw2 = pw2Input.value;

    if (pw1.length < MIN_PASSWORD_LENGTH) {
      errorEl.textContent = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
      errorEl.style.display = '';
      return;
    }
    if (pw1 !== pw2) {
      errorEl.textContent = 'Passwords do not match.';
      errorEl.style.display = '';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="btn__spinner"></span> Locking…`;

    try {
      await notesService.secure(noteId, pw1);
      toast('Note is now password-protected.', 'success');
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Lock Note';
    }
  }

  submitBtn.addEventListener('click', handleSubmit);
}
