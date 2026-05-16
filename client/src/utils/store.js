export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();
  return {
    getState() { return state; },
    setState(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      listeners.forEach(fn => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export const authStore = createStore({
  user:    null,
  token:   localStorage.getItem('gogoldocs_token'),
  loading: false,
  error:   null,
});

export const notesStore = createStore({
  items:    [],
  activeId: null,
  loading:  false,
  saving:   false,
  error:    null,
});

export const securityStore = createStore({
  unlockedIds:    [],
  failedAttempts: {},
});

export function selectIsUnlocked(noteId) {
  return securityStore.getState().unlockedIds.includes(noteId);
}
export function selectFailedAttempts(noteId) {
  return securityStore.getState().failedAttempts[noteId] ?? 0;
}
export function selectIsBlocked(noteId) {
  return selectFailedAttempts(noteId) >= 5;
}
export function selectAttemptsLeft(noteId) {
  return Math.max(0, 5 - selectFailedAttempts(noteId));
}

export const searchStore = createStore({ query: '' });

export const toastStore = createStore({ toasts: [] });

export const themeStore = createStore({
  mode: (localStorage.getItem('gogoldocs_theme') ?? 'light'),
});
