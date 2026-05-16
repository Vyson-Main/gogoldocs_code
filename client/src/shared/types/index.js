/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} title
 * @property {string} body
 * @property {boolean} isSecure
 * @property {boolean} isLocked
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} userId
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user
 * @property {string} token
 */

/**
 * @typedef {'success'|'error'|'info'} ToastType
 * @typedef {'light'|'dark'} ThemeMode
 */

export {};
