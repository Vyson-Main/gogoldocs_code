// ── Response Helpers ──────────────────────────────────────────────────────────

export function ok(res, data, message) {
  res.status(200).json({ success: true, data, ...(message ? { message } : {}) });
}

export function created(res, data, message) {
  res.status(201).json({ success: true, data, ...(message ? { message } : {}) });
}

export function noContent(res) {
  res.status(204).end();
}
