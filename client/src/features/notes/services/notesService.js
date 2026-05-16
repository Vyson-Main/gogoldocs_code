// ── Notes Service ─────────────────────────────────────────────────────────────
import { apiClient }  from '/src/services/apiClient.js';
import { notesStore } from '/src/utils/store.js';
import { API_ROUTES } from '/src/shared/constants/index.js';
import { MAX_UNLOCK_ATTEMPTS } from '/src/shared/constants/index.js';

export const notesService = {
  /** @param {string} [query] */
  async list(query) {
    notesStore.setState({ loading: true, error: null });
    try {
      const params = query ? { q: query } : {};
      const items = await apiClient.get(API_ROUTES.NOTES, { params });
      notesStore.setState({ items, loading: false });
      return items;
    } catch (err) {
      notesStore.setState({ loading: false, error: err.message });
      throw err;
    }
  },

  /** @param {{ title: string, body?: string }} payload */
  async create(payload) {
    const note = await apiClient.post(API_ROUTES.NOTES, payload);
    notesStore.setState(s => ({
      items:    [note, ...s.items],
      activeId: note.id,
    }));
    return note;
  },

  /**
   * @param {string} id
   * @param {{ title?: string, body?: string }} payload
   */
  async update(id, payload) {
    notesStore.setState({ saving: true });
    try {
      const updated = await apiClient.patch(API_ROUTES.NOTE(id), payload);
      notesStore.setState(s => ({
        saving: false,
        items: s.items.map(n => n.id === id ? updated : n),
      }));
      return updated;
    } catch (err) {
      notesStore.setState({ saving: false });
      throw err;
    }
  },

  /** Optimistic local patch for autosave UI feedback */
  patchLocally(id, patch) {
    notesStore.setState(s => ({
      items: s.items.map(n =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
      ),
    }));
  },

  /** @param {string} id */
  async delete(id) {
    await apiClient.delete(API_ROUTES.NOTE(id));
    notesStore.setState(s => {
      const items = s.items.filter(n => n.id !== id);
      const activeId = s.activeId === id ? (items[0]?.id ?? null) : s.activeId;
      const unlockedIds = s.unlockedIds.filter(uid => uid !== id);
      return { items, activeId, unlockedIds };
    });
  },

  /**
   * @param {string} id
   * @param {string} password
   */
  async secure(id, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_SECURE(id), { password });
    notesStore.setState(s => ({
      items: s.items.map(n => n.id === id ? note : n),
      unlockedIds: s.unlockedIds.includes(id) ? s.unlockedIds : [...s.unlockedIds, id],
    }));
    return note;
  },

  /**
   * @param {string} id
   * @param {string} password
   */
  async removeSecurity(id, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_LOCK(id), { password });
    notesStore.setState(s => ({
      items: s.items.map(n => n.id === id ? note : n),
      unlockedIds: s.unlockedIds.filter(uid => uid !== id),
    }));
    return note;
  },

  /**
   * @param {string} id
   * @param {string} password
   */
  async unlock(id, password) {
    await apiClient.post(API_ROUTES.NOTE_UNLOCK(id), { password });
    notesStore.setState(s => ({
      unlockedIds:    [...new Set([...s.unlockedIds, id])],
      failedAttempts: { ...s.failedAttempts, [id]: 0 },
    }));
  },

  /** Called on unlock failure — increments failed attempt count in local store. */
  recordFailedAttempt(id) {
    notesStore.setState(s => {
      const prev = s.failedAttempts[id] ?? 0;
      const next = Math.min(prev + 1, MAX_UNLOCK_ATTEMPTS);
      return { failedAttempts: { ...s.failedAttempts, [id]: next } };
    });
  },

  /** Set active note; re-lock previous secure note on switch. */
  setActive(id) {
    notesStore.setState(s => {
      const prev = s.activeId;
      const unlockedIds = (prev && prev !== id)
        ? s.unlockedIds.filter(uid => uid !== prev)
        : s.unlockedIds;
      return { activeId: id, unlockedIds };
    });
  },
};
