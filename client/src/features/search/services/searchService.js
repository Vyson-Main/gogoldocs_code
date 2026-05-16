// ── Search Service ────────────────────────────────────────────────────────────
import { searchStore } from '../../utils/store.js';
import { notesService } from '../notes/services/notesService.js';
import { debounce }    from '../../../../shared/helpers/index.js';
import { DEBOUNCE_SEARCH_MS } from '../../../../shared/constants/index.js';

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
