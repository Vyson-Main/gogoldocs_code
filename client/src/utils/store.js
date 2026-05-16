// ── Reactive State Store ──────────────────────────────────────────────────────
// A tiny reactive store pattern using the Observer pattern.
// No dependencies. Works with ES modules.

/**
 * Creates a reactive state slice.
 * @template T
 * @param {T} initialState
 * @returns {{ getState: () => T, setState: (patch: Partial<T>|((s:T)=>Partial<T>)) => void, subscribe: (fn: (s:T) => void) => () => void }}
 */
export function createStore(initialState) {
  let state = { ...initialState };
  const listeners = new Set();

  return {
    getState() {
      return state;
    },

    setState(patch) {
      const next = typeof patch === 'function' ? patch(state) : patch;
      state = { ...state, ...next };
      listeners.forEach(fn => fn(state));
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);   // returns unsubscribe
    },
  };
}

// ── Global App Stores ─────────────────────────────────────────────────────────

export const authStore = createStore({
  /** @type {import('../../shared/types/index.js').User|null} */
  user:    null,
  /** @type {string|null} */
  token:   localStorage.getItem('gogoldocs_token'),
  loading: false,
  error:   null,
});

export const notesStore = createStore({
  /** @type {import('../../shared/types/index.js').Note[]} */
  items:          [],
  /** @type {string|null} */
  activeId:       null,
  /** @type {string[]} */
  unlockedIds:    [],
  /** @type {Record<string,number>} */
  failedAttempts: {},
  loading:        false,
  saving:         false,
  error:          null,
});

export const searchStore = createStore({
  query: '',
});

export const toastStore = createStore({
  /** @type {Array<{id:string, message:string, type:string}>} */
  toasts: [],
});

export const themeStore = createStore({
  /** @type {'light'|'dark'} */
  mode: (localStorage.getItem('gogoldocs_theme') ?? 'light'),
});
