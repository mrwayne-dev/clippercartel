/**
 * router.js — client-side router (History API).
 *
 * Route table maps paths → dynamic module imports + <head> metadata.
 * Each page module default-exports a `render(mount)` function.
 *
 *   routes[path] = {
 *     view:        () => import(...)   dynamic import, code-split per page
 *     title:       string              <title>
 *     description: string              <meta name="description">
 *     ogImage:     string              OG image path (relative to /assets/images/og/)
 *     schema:      object | null       JSON-LD payload for #ld-route
 *   }
 */

import { applyMeta }  from './utils/meta.js';
import { transitionIn, transitionOut } from './utils/transitions.js';

const routes = {
  '/': {
    view:        () => import('./pages/public/home.js'),
    title:       'ClipperCartel — Precision Cuts & Shaves',
    description: 'Precision cuts, hot-towel shaves and beard sculpts. Book your chair at ClipperCartel.',
    ogImage:     'og-default.jpg',
    schema:      null,
  },
  '/services': {
    view:        () => import('./pages/public/services.js'),
    title:       'Services & Pricing — ClipperCartel',
    description: 'Full barbering menu — fades, beard sculpts, hot-towel shaves and more.',
    ogImage:     'og-services.jpg',
    schema:      null,
  },
  '/gallery': {
    view:        () => import('./pages/public/gallery.js'),
    title:       'Portfolio — ClipperCartel',
    description: 'A selection of recent cuts and styles from the chair.',
    ogImage:     'og-gallery.jpg',
    schema:      null,
  },
  '/book': {
    view:        () => import('./pages/public/book.js'),
    title:       'Book Your Chair — ClipperCartel',
    description: 'Choose a service, pick a time, done. Confirmation sent via WhatsApp.',
    ogImage:     'og-book.jpg',
    schema:      null,
  },
  '/about': {
    view:        () => import('./pages/public/about.js'),
    title:       'About — ClipperCartel',
    description: 'The story behind the shop. Craft, consistency, a sharp line.',
    ogImage:     'og-about.jpg',
    schema:      null,
  },
  '/contact': {
    view:        () => import('./pages/public/contact.js'),
    title:       'Contact — ClipperCartel',
    description: 'Reach the shop. Hours, location, and a message form.',
    ogImage:     'og-default.jpg',
    schema:      null,
  },
  '/faq': {
    view:        () => import('./pages/public/faq.js'),
    title:       'FAQ — ClipperCartel',
    description: 'Everything you want to know before you sit down.',
    ogImage:     'og-default.jpg',
    schema:      null,
  },
  '/privacy': {
    view:        () => import('./pages/public/privacy.js'),
    title:       'Privacy Policy — ClipperCartel',
    description: 'How ClipperCartel handles your personal information.',
    ogImage:     'og-default.jpg',
    schema:      null,
  },
  '/terms': {
    view:        () => import('./pages/public/terms.js'),
    title:       'Terms of Service — ClipperCartel',
    description: 'The terms under which ClipperCartel provides its services.',
    ogImage:     'og-default.jpg',
    schema:      null,
  },
};

const notFoundRoute = {
  view:        () => import('./pages/public/not-found.js'),
  title:       '404 — Not Found — ClipperCartel',
  description: 'The page you were looking for could not be found.',
  ogImage:     'og-default.jpg',
  schema:      null,
};

let mountEl   = null;
let currentPath = null;

const resolve = (path) => routes[path] || notFoundRoute;

const navigate = async (path, { push = true } = {}) => {
  if (path === currentPath) return;
  const route = resolve(path);

  if (push) history.pushState({ path }, '', path);
  currentPath = path;

  // Transition out current view
  await transitionOut(mountEl);

  // Load page module (dynamic import = per-route chunk)
  let mod;
  try {
    mod = await route.view();
  } catch (err) {
    console.error('[router] view load failed', err);
    mod = await notFoundRoute.view();
  }

  // Clear + render
  mountEl.innerHTML = '';
  await mod.default(mountEl);

  // Head updates
  applyMeta(route, path);

  // Transition in
  await transitionIn(mountEl);

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Let the nav (and anyone else interested) sync to the new route.
  // Fires AFTER history.pushState so listeners read the fresh pathname.
  window.dispatchEvent(new CustomEvent('cc:route', { detail: { path } }));
};

const onLinkClick = (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');

  // Let modified clicks, downloads, external, anchor-only links fall through.
  if (
    a.target === '_blank' ||
    a.hasAttribute('download') ||
    a.rel === 'external' ||
    e.metaKey || e.ctrlKey || e.shiftKey || e.altKey ||
    e.button !== 0
  ) return;

  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return;

  e.preventDefault();
  navigate(url.pathname);
};

export const startRouter = async (mount) => {
  mountEl = mount;

  document.addEventListener('click', onLinkClick);
  window.addEventListener('popstate', () => navigate(location.pathname, { push: false }));

  await navigate(location.pathname, { push: false });
};

export { navigate, routes };
