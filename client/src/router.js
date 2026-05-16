// ── Client Router ─────────────────────────────────────────────────────────────
import { authStore }    from '/src/utils/store.js';
import { authService }  from '/src/features/auth/authService.js';
import { mountLoginPage } from '/src/pages/loginPage.js';
import { mountNotesPage } from '/src/pages/notesPage.js';

const appEl = document.getElementById('app');
let currentPage = null;
let cleanup     = null;

/**
 * Navigate to a named route.
 * @param {'login'|'notes'} route
 */
function navigate(route) {
  if (cleanup) { cleanup(); cleanup = null; }

  if (route === 'login') {
    currentPage = 'login';
    cleanup = mountLoginPage(appEl) ?? null;
  } else {
    currentPage = 'notes';
    mountNotesPage(appEl);
  }
}

/**
 * Bootstrap the router: check auth, then navigate.
 */
export async function initRouter() {
  const { token } = authStore.getState();

  // Show loading spinner while we verify token
  appEl.innerHTML = `<div class="loading-center"><div class="spinner"></div></div>`;

  if (token) {
    await authService.me(); // hydrates user or clears token
  }

  // Decide initial route
  const { user } = authStore.getState();
  navigate(user ? 'notes' : 'login');

  // React to future auth state changes
  authStore.subscribe(({ user: u }) => {
    const wantsLogin = !u;
    if (wantsLogin && currentPage !== 'login')  navigate('login');
    if (!wantsLogin && currentPage !== 'notes') navigate('notes');
  });
}
