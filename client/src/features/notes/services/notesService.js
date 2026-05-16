import { apiClient } from '/src/services/apiClient.js';
import { notesStore, securityStore } from '/src/utils/store.js';
import { API_ROUTES, MAX_UNLOCK_ATTEMPTS } from '/src/shared/constants/index.js';

export const notesService = {
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

  async create(payload) {
    const note = await apiClient.post(API_ROUTES.NOTES, payload);
    notesStore.setState(s => ({ items: [note, ...s.items], activeId: note.id }));
    return note;
  },

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

  patchLocally(id, patch) {
    notesStore.setState(s => ({
      items: s.items.map(n =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
      ),
    }));
  },

  async delete(id) {
    await apiClient.delete(API_ROUTES.NOTE(id));
    notesStore.setState(s => {
      const items    = s.items.filter(n => n.id !== id);
      const activeId = s.activeId === id ? (items[0]?.id ?? null) : s.activeId;
      return { items, activeId };
    });
    securityStore.setState(s => ({
      unlockedIds: s.unlockedIds.filter(uid => uid !== id),
      failedAttempts: Object.fromEntries(
        Object.entries(s.failedAttempts).filter(([k]) => k !== id)
      ),
    }));
  },

  async secure(id, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_SECURE(id), { password });
    notesStore.setState(s => ({ items: s.items.map(n => n.id === id ? note : n) }));
    securityStore.setState(s => ({ unlockedIds: [...new Set([...s.unlockedIds, id])] }));
    return note;
  },

  async removeSecurity(id, password) {
    const note = await apiClient.post(API_ROUTES.NOTE_LOCK(id), { password });
    notesStore.setState(s => ({ items: s.items.map(n => n.id === id ? note : n) }));
    securityStore.setState(s => ({ unlockedIds: s.unlockedIds.filter(uid => uid !== id) }));
    return note;
  },

  async unlock(id, password) {
    await apiClient.post(API_ROUTES.NOTE_UNLOCK(id), { password });
    securityStore.setState(s => ({
      unlockedIds:    [...new Set([...s.unlockedIds, id])],
      failedAttempts: { ...s.failedAttempts, [id]: 0 },
    }));
  },

  recordFailedAttempt(id) {
    securityStore.setState(s => {
      const prev = s.failedAttempts[id] ?? 0;
      return { failedAttempts: { ...s.failedAttempts, [id]: Math.min(prev + 1, MAX_UNLOCK_ATTEMPTS) } };
    });
  },

  setActive(id) {
    const { activeId } = notesStore.getState();
    if (activeId && activeId !== id) {
      securityStore.setState(s => ({
        unlockedIds: s.unlockedIds.filter(uid => uid !== activeId),
      }));
    }
    notesStore.setState({ activeId: id });
  },
};
