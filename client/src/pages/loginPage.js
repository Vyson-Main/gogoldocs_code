// ── Login Page ────────────────────────────────────────────────────────────────
import { authService } from '../features/auth/authService.js';
import { authStore }   from '../utils/store.js';

/**
 * Renders the login/register page into #app.
 * @param {HTMLElement} appEl
 */
export function mountLoginPage(appEl) {
  let mode = 'login'; // 'login' | 'register'

  function render() {
    const { loading, error } = authStore.getState();
    const isLogin = mode === 'login';

    appEl.innerHTML = `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-card__logo">
            <h1>GoGolDocs</h1>
            <p>${isLogin ? 'Sign in to your notes' : 'Create your account'}</p>
          </div>

          <div class="auth-card__box">
            <div class="form-fields">
              <div class="input-group">
                <label for="auth-email">Email</label>
                <input id="auth-email" class="input-base" type="email"
                       placeholder="you@example.com" autocomplete="email" />
              </div>
              <div class="input-group">
                <label for="auth-password">Password</label>
                <input id="auth-password" class="input-base" type="password"
                       placeholder="${isLogin ? 'Your password' : 'At least 8 characters'}"
                       autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
              </div>
            </div>

            ${error ? `<p class="auth-error">${error}</p>` : ''}

            <button class="btn btn--primary btn--full" id="auth-submit"
              ${loading ? 'disabled' : ''}>
              ${loading
                ? `<span class="btn__spinner"></span> ${isLogin ? 'Signing in…' : 'Creating…'}`
                : (isLogin ? 'Sign In' : 'Create Account')
              }
            </button>

            <div class="auth-switch">
              ${isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button id="auth-mode-toggle">
                ${isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </div>

          <p class="auth-card__hint">Demo: demo@gogoldocs.app / demo1234</p>
        </div>
      </div>`;

    bindEvents();
  }

  function bindEvents() {
    const emailInput  = appEl.querySelector('#auth-email');
    const pwInput     = appEl.querySelector('#auth-password');
    const submitBtn   = appEl.querySelector('#auth-submit');
    const modeToggle  = appEl.querySelector('#auth-mode-toggle');

    modeToggle?.addEventListener('click', () => {
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });

    async function handleSubmit() {
      const email    = emailInput?.value ?? '';
      const password = pwInput?.value ?? '';
      const action   = mode === 'login' ? authService.login : authService.register;
      await action({ email, password });
    }

    submitBtn?.addEventListener('click', handleSubmit);
    pwInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
  }

  // Re-render on auth state changes (shows errors, loading)
  const unsub = authStore.subscribe(() => render());

  render();

  return () => unsub();
}
