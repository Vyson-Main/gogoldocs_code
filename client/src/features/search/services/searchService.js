// ── Search Service ────────────────────────────────────────────────────────────
import { searchStore } from '/src/utils/store.js';
import { notesService } from '/src/features/search/notes/services/notesService.js';
import { debounce }    from '/src/shared/helpers/index.js';
import { DEBOUNCE_SEARCH_MS } from '/src/shared/constants/index.js';

const debouncedFetch = debounce((query) => {
  notesService.list(query || undefined);
}, DEBOUNCE_SEARCH_MS);

export const searchService = {
  setQuery(value) {
    searchStore.setState({ query: value });
    debouncedFetch(value);
  },

  clear() {
    searchStore.setState({ query: '' });
    notesService.list();
  },

  getQuery() {
    return searchStore.getState().query;
  },
};
