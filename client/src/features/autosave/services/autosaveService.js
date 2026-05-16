// ── Autosave Service ──────────────────────────────────────────────────────────
// Debounced, cancellable autosave controller factory.
// Decoupled from the editor component so it can be reused anywhere.

import { editService }    from '/src/features/edit/services/editService.js';
import { autosaveStore }  from '/src/features/autosave/store/autosaveStore.js';
import { AUTOSAVE_DELAY_MS } from '/src/shared/constants/index.js';

/**
 * Create a new autosave controller tied to a specific note.
 * @param {string} noteId
 * @returns {{ save: (title: string, body: string) => void, cancel: () => void }}
 */
export function createAutosaveController(noteId) {
  let timer    = null;
  let firstRun = true;   // skip the very first call (initial mount)

  function save(title, body) {
    if (firstRun) { firstRun = false; return; }

    // Optimistic local update
    editService.patchLocally(noteId, { title, body });

    // Signal UI: saving pending
    autosaveStore.setState({ status: 'pending' });

    clearTimeout(timer);
    timer = setTimeout(async () => {
      autosaveStore.setState({ status: 'saving' });
      try {
        await editService.saveNote(noteId, { title, body });
        autosaveStore.setState({ status: 'saved' });

        // Reset to idle after 2 s
        setTimeout(() => autosaveStore.setState({ status: 'idle' }), 2000);
      } catch {
        autosaveStore.setState({ status: 'error' });
      }
    }, AUTOSAVE_DELAY_MS);
  }

  function cancel() {
    clearTimeout(timer);
    timer    = null;
    firstRun = true;
    autosaveStore.setState({ status: 'idle' });
  }

  return { save, cancel };
}
