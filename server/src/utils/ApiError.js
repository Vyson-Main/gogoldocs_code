// ── ApiError ──────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {unknown} [details]
   */
  constructor(statusCode, message, details) {
    super(message);
    this.name       = 'ApiError';
    this.statusCode = statusCode;
    this.details    = details;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(msg)  { return new ApiError(400, msg); }
  static unauthorized(msg = 'Unauthorized') { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden')       { return new ApiError(403, msg); }
  static notFound(msg = 'Not found')        { return new ApiError(404, msg); }
  static conflict(msg)    { return new ApiError(409, msg); }
  static internal(msg = 'Internal server error') { return new ApiError(500, msg); }
}
