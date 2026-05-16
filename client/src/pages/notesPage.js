// ── Notes Page ────────────────────────────────────────────────────────────────
import { authService }   from '/src/features/auth/authService.js';
import { notesService }  from '/src/features/notes/services/notesService.js';
import { notesStore, authStore } from '/src/utils/store.js';
import { mountNoteList } from '/src/features/notes/components/noteList.js';
import { mountEditor }   from '/src/features/notes/components/noteEditor.js';
import { mountSearchBar } from '/src/features/search/components/searchBar.js';
import { mountThemeToggle } from '/src/features/theme/components/themeToggle.js';
import { openNewNoteModal } from '/src/components/modals/newNoteModal.js';

const LOGOUT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
const PLUS_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;

export function mountNotesPage(appEl) {
  const user = authStore.getState().user;

  appEl.innerHTML = `
    <div class="app-shell">
      <header class="titlebar">
        <div class="titlebar__actions titlebar__actions--left">
          <div id="theme-toggle-mount"></div>
        </div>
        <span class="titlebar__title">GoGolDocs</span>
        <div class="titlebar__actions titlebar__actions--right">
          ${user ? `<span class="titlebar__email">${user.email}</span>` : ''}
          <button class="logout-btn" id="logout-btn" title="Sign out">${LOGOUT_ICON}</button>
        </div>
      </header>

      <div class="app-body">
        <nav class="sidebar">
          <div class="sidebar__header">
            <div id="search-bar-mount"></div>
            <button class="btn btn--primary btn-new-note" id="new-note-btn">
              ${PLUS_ICON} New Note
            </button>
          </div>
          <div class="note-list" id="note-list-mount"></div>
          <div class="sidebar__footer" id="note-count">0 notes</div>
        </nav>
        <main class="editor-area" id="editor-mount"></main>
      </div>
    </div>

    <div id="logout-modal" style="display:none" class="modal-backdrop">
      <div class="modal">
        <h3 class="modal__title">Sign out?</h3>
        <p class="modal__desc">You will be returned to the login screen.</p>
        <div class="modal__actions">
          <button class="btn btn--ghost" id="logout-cancel">Cancel</button>
          <button class="btn btn--danger" id="logout-confirm">Sign out</button>
        </div>
      </div>
    </div>`;

  mountThemeToggle(appEl.querySelector('#theme-toggle-mount'));
  mountSearchBar(appEl.querySelector('#search-bar-mount'));
  mountNoteList(appEl.querySelector('#note-list-mount'));
  mountEditor(appEl.querySelector('#editor-mount'));

  const noteCountEl = appEl.querySelector('#note-count');
  notesStore.subscribe(({ items }) => {
    const n = items.length;
    if (noteCountEl) noteCountEl.textContent = `${n} note${n !== 1 ? 's' : ''}`;
  });

  const logoutModal   = appEl.querySelector('#logout-modal');
  const logoutCancel  = appEl.querySelector('#logout-cancel');
  const logoutConfirm = appEl.querySelector('#logout-confirm');

  appEl.querySelector('#logout-btn')?.addEventListener('click', () => {
    logoutModal.style.display = 'flex';
  });
  logoutCancel?.addEventListener('click', () => {
    logoutModal.style.display = 'none';
  });
  logoutConfirm?.addEventListener('click', () => {
    authService.logout();
  });
  logoutModal?.addEventListener('click', (e) => {
    if (e.target === logoutModal) logoutModal.style.display = 'none';
  });

  appEl.querySelector('#new-note-btn')?.addEventListener('click', () => {
    openNewNoteModal();
  });

  notesService.list();
}
