// ── New Note Modal ────────────────────────────────────────────────────────────
import { createModal } from '/src/components/modals/modal.js';
import { notesService } from '/src/features/notes/services/notesService.js';
import { toast }        from '/src/features/toasts/toastService.js';
import { MAX_TITLE_LENGTH } from '/src/shared/constants/index.js';

export function openNewNoteModal() {
  let closeModal;

  const { modal, close } = createModal({
    title: 'New Note',
    bodyHTML: `
      <p class="modal__desc">Give your note a title to get started.</p>
      <div class="input-group">
        <label for="new-note-title">Title</label>
        <input
          id="new-note-title"
          class="input-base"
          type="text"
          placeholder="e.g. Meeting Notes"
          maxlength="${MAX_TITLE_LENGTH}"
          autocomplete="off"
        />
        <span class="input-error" id="new-note-error" style="display:none"></span>
      </div>
      <div class="modal__actions">
        <button class="btn btn--ghost" id="new-note-cancel">Cancel</button>
        <button class="btn btn--primary" id="new-note-create">Create</button>
      </div>
    `,
    onClose: () => {},
  });

  closeModal = close;

  const input    = modal.querySelector('#new-note-title');
  const errorEl  = modal.querySelector('#new-note-error');
  const cancelBtn = modal.querySelector('#new-note-cancel');
  const createBtn = modal.querySelector('#new-note-create');

  cancelBtn.addEventListener('click', () => closeModal());

  async function handleCreate() {
    const title = input.value.trim();
    if (!title) {
      errorEl.textContent = 'Title cannot be empty.';
      errorEl.style.display = '';
      return;
    }

    createBtn.disabled = true;
    createBtn.innerHTML = `<span class="btn__spinner"></span> Creating…`;

    try {
      await notesService.create({ title });
      toast('Note created.', 'success');
      closeModal();
    } catch (err) {
      toast(err.message, 'error');
      createBtn.disabled = false;
      createBtn.textContent = 'Create';
    }
  }

  createBtn.addEventListener('click', handleCreate);
  input.addEventListener('input', () => { errorEl.style.display = 'none'; });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleCreate(); });
}
