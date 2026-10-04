/**
 * meta.js — update <head> on route change.
 *
 * Keeps the SPA SEO-equivalent to multi-page: every route gets its own
 * title, description, canonical, OG tags, and (optionally) JSON-LD.
 */

const setMeta = (selector, attr, value) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

export const applyMeta = (route, path) => {
  const origin = location.origin;
  const url    = origin + path;
  const ogImg  = `${origin}/assets/images/og/${route.ogImage}`;

  document.title = route.title;

  setMeta('meta[name="description"]',     'content', route.description);
  setMeta('link[rel="canonical"]',        'href',    url);

  setMeta('meta[property="og:title"]',       'content', route.title);
  setMeta('meta[property="og:description"]', 'content', route.description);
  setMeta('meta[property="og:url"]',         'content', url);
  setMeta('meta[property="og:image"]',       'content', ogImg);

  setMeta('meta[name="twitter:title"]',       'content', route.title);
  setMeta('meta[name="twitter:description"]', 'content', route.description);
  setMeta('meta[name="twitter:image"]',       'content', ogImg);

  // Per-route structured data
  const ld = document.getElementById('ld-route');
  if (ld) ld.textContent = route.schema ? JSON.stringify(route.schema) : '';
};
