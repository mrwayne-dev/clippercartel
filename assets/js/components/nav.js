/**
 * nav.js — primary nav.
 *
 * Two variants, picked via ?nav=A|B in the URL (persisted in localStorage
 * so navigation preserves the choice). Default = A. This exists so you
 * can toggle live before we lock the final layout.
 *
 *   A — logo left, links right                (Animos / Framer pattern)
 *   B — logo centre, links split either side  (Watts / Samuel Snider pattern)
 */

const links = [
  { href: '/',         label: 'Home'     },
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery'  },
  { href: '/about',    label: 'About'    },
  { href: '/reviews',  label: 'Reviews'  },
  { href: '/contact',  label: 'Contact'  },
];

const KEY = 'cc:nav-variant';

const readVariant = () => {
  const url = new URLSearchParams(location.search).get('nav');
  if (url === 'A' || url === 'B') {
    try { localStorage.setItem(KEY, url); } catch {}
    return url;
  }
  try { return localStorage.getItem(KEY) === 'B' ? 'B' : 'A'; } catch { return 'A'; }
};

const link = (href, label) =>
  `<a href="${href}" data-nav-link="${href}" class="nav__link">${label}</a>`;

const bookCta = `<a href="/book" class="nav__cta btn btn-accent">Book</a>`;
const brand   = `<a href="/" class="nav__brand" aria-label="ClipperCartel home">ClipperCartel</a>`;

const renderA = () => `
  <div class="nav__inner nav--a container">
    <div class="nav__brand-slot">${brand}</div>
    <nav class="nav__links">${links.map(l => link(l.href, l.label)).join('')}</nav>
    <div class="nav__cta-slot">${bookCta}</div>
  </div>
`;

const renderB = () => {
  const left  = links.slice(0, 3);
  const right = links.slice(3);
  return `
    <div class="nav__inner nav--b container">
      <nav class="nav__links nav__links--left">${left.map(l => link(l.href, l.label)).join('')}</nav>
      <div class="nav__brand-slot nav__brand-slot--center">${brand}</div>
      <nav class="nav__links nav__links--right">${right.map(l => link(l.href, l.label)).join('')}${bookCta}</nav>
    </div>
  `;
};

export const mountNav = (mount) => {
  const variant = readVariant();
  mount.dataset.variant = variant;
  mount.innerHTML = variant === 'B' ? renderB() : renderA();

  const highlight = () => {
    mount.querySelectorAll('[data-nav-link]').forEach(a => {
      a.toggleAttribute('aria-current', a.getAttribute('href') === location.pathname);
    });
  };
  highlight();
  window.addEventListener('popstate', highlight);
  document.addEventListener('click', () => queueMicrotask(highlight));
};
