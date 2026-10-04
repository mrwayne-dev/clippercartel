/**
 * api.js — fetch wrapper. All API calls go through here.
 *
 * Returns { success, data } on 2xx, throws ApiError otherwise.
 */

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const base = '/api';

const request = async (path, { method = 'GET', body, headers = {} } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  let json;
  try { json = await res.json(); } catch { json = {}; }

  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || res.statusText, res.status, json);
  }
  return json.data ?? json;
};

export const api = {
  get:  (p, opts)       => request(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => request(p, { ...opts, method: 'POST', body }),
};

/* ------------------------------------------------------------------
 *  Toast helper — surfaces API error messages consistently.
 * ------------------------------------------------------------------ */
export const toast = (message, type = 'info') => {
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : ''}`;
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));
  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 400);
  }, 3500);
};
