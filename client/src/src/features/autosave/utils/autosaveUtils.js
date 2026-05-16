// ── Autosave Utilities ────────────────────────────────────────────────────────

/**
 * Returns the toolbar badge HTML for a given autosave status.
 * @param {'idle'|'pending'|'saving'|'saved'|'error'} status
 * @returns {string} HTML string
 */
export function getAutosaveBadgeHTML(status) {
  switch (status) {
    case 'pending':
      return `<div class="edit-saving-badge">
                <span class="edit-unsaved-dot"></span> Unsaved
              </div>`;
    case 'saving':
      return `<div class="edit-saving-badge">
                <span class="btn__spinner" style="width:10px;height:10px;border-width:1.5px"></span>
                Saving…
              </div>`;
    case 'saved':
      return `<div class="edit-saved-badge">
                <span class="edit-saved-badge__dot"></span> Saved
              </div>`;
    case 'error':
      return `<div class="edit-saving-badge" style="color:var(--color-error)">Save failed</div>`;
    case 'idle':
    default:
      return '';
  }
}
