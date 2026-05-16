// ── Locked State Component ────────────────────────────────────────────────────
// Renders the unlock UI when a secure note is in a locked state.

import { securityService } from '/src/features/security/services/securityService.js';
import { securityStore, selectAttemptsLeft, selectIsBlocked } from '/src/features/security/store/securityStore.js';
import { MAX_UNLOCK_ATTEMPTS } from '/src/shared/constants/index.js';

const ICON_LOCK = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.5">
  <rect x="3" y="11" width="18" height="11" rx="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>`;

/**
 * Render the locked state into a container element.
 * @param {HTMLElement} container
 * @param {string} noteId
 * @param {() => void} onUnlocked - called after successful unlock
 */
export function renderLockedState(container, noteId, onUnlocked) {
  function render() {
    const attemptsLeft = selectAttemptsLeft(noteId);
    const isBlocked    = selectIsBlocked(noteId);

    container.innerHTML = `
      <div class="security-locked">
        <div class="security-locked__ring">${ICON_LOCK}</div>

        <div class="security-locked__text">
          <h2>Secured Note</h2>
          <p>Enter your password to open, edit, or delete this note.</p>
        </div>

        ${isBlocked
          ? `<p class="security-locked__blocked">
               Too many failed attempts. Select another note to continue.
             </p>`
          : `<div class="security-locked__form">
               <input
                 class="input-base security-locked__input"
                 id="unlock-pw"
                 type="password"
                 placeholder="Enter password"
                 autocomplete="current-password"
               />
               <span class="input-error security-locked__error" id="unlock-error"
                     style="display:none"></span>
               ${attemptsLeft < MAX_UNLOCK_ATTEMPTS
                 ? `<p class="security-locked__attempts">
                      ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining
                    </p>`
                 : ''}
               <button class="btn btn--full security-locked__btn" id="unlock-btn"
                 style="background:var(--color-gold);color:#fff;margin-top:4px">
                 Unlock
               </button>
             </div>`
        }
      </div>`;

    if (!isBlocked) bindEvents();
  }

  function bindEvents() {
    const pwInput   = container.querySelector('#unlock-pw');
    const errorEl   = container.querySelector('#unlock-error');
    const unlockBtn = container.querySelector('#unlock-btn');

    pwInput?.focus();
    pwInput?.addEventListener('input', () => { errorEl.style.display = 'none'; });
    pwInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleUnlock(); });
    unlockBtn?.addEventListener('click', handleUnlock);

    async function handleUnlock() {
      const pw = pwInput?.value ?? '';
      if (!pw) {
        errorEl.textContent = 'Password is required.';
        errorEl.style.display = '';
        return;
      }

      unlockBtn.disabled = true;
      unlockBtn.innerHTML = `<span class="btn__spinner"></span> Unlocking…`;

      try {
        await securityService.unlock(noteId, pw);
        onUnlocked();
      } catch (err) {
        securityService.recordFailedAttempt(noteId);
        render(); // re-render to show updated attempt count
        const newError = container.querySelector('#unlock-error');
        if (newError) {
          newError.textContent = err.message ?? 'Incorrect password.';
          newError.style.display = '';
        }
        container.querySelector('#unlock-pw')?.focus();
      }
    }
  }

  // Re-render when security state changes (e.g. blocked)
  const unsub = securityStore.subscribe(() => {
    if (selectIsBlocked(noteId)) render();
  });

  render();
  return () => unsub();
}
