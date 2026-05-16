// ── DOM Utility Helpers ───────────────────────────────────────────────────────

/**
 * Shorthand querySelector.
 * @param {string} selector
 * @param {Element|Document} [ctx]
 * @returns {Element|null}
 */
export const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand querySelectorAll.
 * @param {string} selector
 * @param {Element|Document} [ctx]
 * @returns {NodeList}
 */
export const $$ = (selector, ctx = document) => ctx.querySelectorAll(selector);

/**
 * Create an element with optional attributes and children.
 * @param {string} tag
 * @param {Record<string,string>} [attrs]
 * @param {(string|Element)[]} [children]
 * @returns {HTMLElement}
 */
export function el(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class')       element.className = v;
    else if (k === 'html')   element.innerHTML = v;
    else if (k === 'text')   element.textContent = v;
    else                     element.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === 'string') element.insertAdjacentHTML('beforeend', child);
    else if (child instanceof Element) element.appendChild(child);
  }
  return element;
}

/**
 * Set display on an element.
 * @param {Element} element
 * @param {boolean} visible
 */
export function show(element, visible) {
  if (!element) return;
  element.style.display = visible ? '' : 'none';
}

/**
 * Replace inner HTML of a container safely.
 * @param {Element} container
 * @param {string} html
 */
export function render(container, html) {
  if (container) container.innerHTML = html;
}

/**
 * Trap keyboard navigation within a modal.
 * @param {Element} container
 * @returns {() => void} cleanup function
 */
export function trapFocus(container) {
  const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements  = () => [...container.querySelectorAll(focusable)].filter(e => !e.disabled);

  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const els   = elements();
    const first = els[0];
    const last  = els[els.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
    }
  }

  document.addEventListener('keydown', onKeydown);
  return () => document.removeEventListener('keydown', onKeydown);
}
