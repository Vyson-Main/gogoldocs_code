// ── Notes Page ────────────────────────────────────────────────────────────────
import { authService }   from '../features/auth/authService.js';
import { notesService }  from '../features/notes/services/notesService.js';
import { notesStore, authStore } from '../utils/store.js';
import { mountNoteList } from '../features/notes/components/noteList.js';
import { mountEditor }   from '../features/notes/components/noteEditor.js';
import { mountSearchBar } from '../features/search/components/searchBar.js';
import { mountThemeToggle } from '../features/theme/components/themeToggle.js';
import { openNewNoteModal } from '../components/modals/newNoteModal.js';

const LOGOUT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
const PLUS_ICON   = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>`;

/**
 * Renders the main notes page into #app.
 * @param {HTMLElement} appEl
 */
export function mountNotesPage(appEl) {
  const user = authStore.getState().user;

  appEl.innerHTML = `
    <div class="app-shell">
      <!-- Titlebar -->
      <header class="titlebar">
        <div class="titlebar__dots">
          <span class="titlebar__dot titlebar__dot--red"></span>
          <span class="titlebar__dot titlebar__dot--yellow"></span>
          <span class="titlebar__dot titlebar__dot--green"></span>
        </div>
        <span class="titlebar__title">GoGolDocs</span>
        <div class="titlebar__actions">
          ${user ? `<span class="titlebar__email">${user.email}</span>` : ''}
          <div id="theme-toggle-mount"></div>
          <button class="logout-btn" id="logout-btn" title="Sign out">${LOGOUT_ICON}</button>
        </div>
      </header>

      <!-- Body -->
      <div class="app-body">
        <!-- Sidebar -->
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

        <!-- Editor -->
        <main class="editor-area" id="editor-mount"></main>
      </div>
    </div>`;

  // Mount sub-components
  mountThemeToggle(appEl.querySelector('#theme-toggle-mount'));
  mountSearchBar(appEl.querySelector('#search-bar-mount'));
  mountNoteList(appEl.querySelector('#note-list-mount'));
  mountEditor(appEl.querySelector('#editor-mount'));

  // Note count
  const noteCountEl = appEl.querySelector('#note-count');
  notesStore.subscribe(({ items }) => {
    const n = items.length;
    if (noteCountEl) noteCountEl.textContent = `${n} note${n !== 1 ? 's' : ''}`;
  });

  // Logout
  appEl.querySelector('#logout-btn')?.addEventListener('click', () => {
    authService.logout();
  });

  // New note
  appEl.querySelector('#new-note-btn')?.addEventListener('click', () => {
    openNewNoteModal();
  });

  // Load notes
  notesService.list();
}
