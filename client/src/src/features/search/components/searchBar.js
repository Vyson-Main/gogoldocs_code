// ── Search Bar Component ──────────────────────────────────────────────────────
import { searchService } from '/src/features/search/services/searchService.js';
import { searchStore }   from '/src/utils/store.js';

const SEARCH_ICON = `<svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
const CLEAR_ICON  = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>`;

/**
 * Mount the search bar into a container.
 * @param {HTMLElement} container
 */
export function mountSearchBar(container) {
  container.innerHTML = `
    <div class="search-wrap">
      ${SEARCH_ICON}
      <input
        id="search-input"
        class="input-base search-input"
        type="text"
        placeholder="Search notes…"
        autocomplete="off"
      />
      <button class="search-clear" id="search-clear" style="display:none" aria-label="Clear search">
        ${CLEAR_ICON}
      </button>
    </div>`;

  const input    = container.querySelector('#search-input');
  const clearBtn = container.querySelector('#search-clear');

  input.addEventListener('input', (e) => {
    searchService.setQuery(e.target.value);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    searchService.clear();
  });

  // Sync clear button visibility from store
  searchStore.subscribe(({ query }) => {
    clearBtn.style.display = query ? '' : 'none';
    if (input.value !== query) input.value = query;
  });
}
