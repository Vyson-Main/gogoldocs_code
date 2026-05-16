// ── Autosave Manager ─────────────────────────────────────────────────────────
import { notesService } from '/src/features/notes/services/notesService.js';
import { AUTOSAVE_DELAY_MS } from '/src/shared/constants/index.js';

/**
 * Creates an autosave controller for a note editor.
 * @param {(saved: boolean) => void} onSavedChange - callback to update UI saved indicator
 * @returns {{ save: (id: string, title: string, body: string) => void, cancel: () => void }}
 */
export function createAutosave(onSavedChange) {
  let timer = null;
  let firstRun = true;

  function save(id, title, body) {
    if (firstRun) { firstRun = false; return; }
    if (!id) return;

    onSavedChange(false);
    notesService.patchLocally(id, { title, body });

    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        await notesService.update(id, { title, body });
        onSavedChange(true);
        setTimeout(() => onSavedChange(false), 2000);
      } catch {
        // silently fail; user can retry by continuing to type
      }
    }, AUTOSAVE_DELAY_MS);
  }

  function cancel() {
    if (timer) { clearTimeout(timer); timer = null; }
    firstRun = true;
  }

  return { save, cancel };
}
