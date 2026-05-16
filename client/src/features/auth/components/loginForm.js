// ── Login Form Component ──────────────────────────────────────────────────────
// Renders the login/register form and handles submission.

import { authService }   from '../authService.js';
import { authStore }     from '../store/authStore.js';
import { validationService } from '../../validation/services/validationService.js';
import { showFieldError, clearFieldError } from '../../validation/utils/validationUtils.js';

/**
 * @param {HTMLElement} container
 * @param {'login'|'register'} initialMode
 * @param {() => void} onModeSwitch
 */
export function mountLoginForm(container, initialMode = 'login', onModeSwitch) {
  let mode = initialMode;

  function render() {
    const { loading, error } = authStore.getState();
    const isLogin = mode === 'login';

    container.innerHTML = `
      <div class="form-fields">
        <div class="input-group">
          <label for="auth-email">Email</label>
          <input id="auth-email" class="input-base" type="email"
                 placeholder="you@example.com" autocomplete="email" />
          <span class="input-error field-error" id="auth-email-error"></span>
        </div>
        <div class="input-group">
          <label for="auth-password">Password</label>
          <input id="auth-password" class="input-base" type="password"
                 placeholder="${isLogin ? 'Your password' : 'At least 8 characters'}"
                 autocomplete="${isLogin ? 'current-password' : 'new-password'}" />
          <span class="input-error field-error" id="auth-pw-error"></span>
        </div>
      </div>

      ${error ? `<p class="form-error">${error}</p>` : ''}

      <button class="btn btn--primary btn--full" id="auth-submit" ${loading ? 'disabled' : ''}>
        ${loading
          ? `<span class="btn__spinner"></span> ${isLogin ? 'Signing in…' : 'Creating account…'}`
          : (isLogin ? 'Sign In' : 'Create Account')
        }
      </button>

      <div class="auth-switch">
        ${isLogin ? "Don't have an account?" : 'Already have an account?'}
        <button id="auth-mode-toggle">${isLogin ? 'Sign up' : 'Sign in'}</button>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const emailInput  = container.querySelector('#auth-email');
    const pwInput     = container.querySelector('#auth-password');
    const emailError  = container.querySelector('#auth-email-error');
    const pwError     = container.querySelector('#auth-pw-error');
    const submitBtn   = container.querySelector('#auth-submit');
    const modeToggle  = container.querySelector('#auth-mode-toggle');

    modeToggle?.addEventListener('click', () => {
      mode = mode === 'login' ? 'register' : 'login';
      onModeSwitch?.();
      render();
    });

    pwInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSubmit(); });
    submitBtn?.addEventListener('click', handleSubmit);

    // Auto-clear errors on input
    emailInput?.addEventListener('input', () => clearFieldError(emailInput, emailError));
    pwInput?.addEventListener('input', () => clearFieldError(pwInput, pwError));

    async function handleSubmit() {
      let valid = true;

      const emailResult = validationService.validateEmail(emailInput?.value ?? '');
      if (!emailResult.valid) {
        showFieldError(emailInput, emailError, emailResult.error);
        valid = false;
      }

      const pwResult = validationService.validatePassword(pwInput?.value ?? '');
      if (!pwResult.valid) {
        showFieldError(pwInput, pwError, pwResult.error);
        valid = false;
      }

      if (!valid) return;

      const fn = mode === 'login' ? authService.login.bind(authService) : authService.register.bind(authService);
      await fn({ email: emailInput.value, password: pwInput.value });
    }
  }

  const unsub = authStore.subscribe(() => render());
  render();
  return () => unsub();
}
