/**
 * nav.js — primary nav. Variant A, locked.
 * Logo left · links right · Book CTA far right.
 */

import { h } from '../utils/dom.js';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery'  },
  { href: '/about',    label: 'About'    },
  { href: '/reviews',  label: 'Reviews'  },
  { href: '/contact',  label: 'Contact'  },
];

const link = (href, label) =>
  `<a href="${href}" data-nav-link="${href}" class="nav__link">${label}</a>`;

export const mountNav = (mount) => {
  mount.innerHTML = `
    <div class="nav__inner nav--a container">
      <a href="/" class="nav__brand" aria-label="ClipperCartel home">ClipperCartel</a>
      <nav class="nav__links">${links.map(l => link(l.href, l.label)).join('')}</nav>
      <a href="/book" class="nav__cta btn btn-accent">Book</a>
      <button class="nav__burger" type="button" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span>
      </button>
    </div>
    <div class="nav__sheet" aria-hidden="true">
      <nav class="nav__sheet-links" aria-label="Mobile menu">
        ${links.map(l => link(l.href, l.label)).join('')}
      </nav>
    </div>
  `;

  const burger = mount.querySelector('.nav__burger');
  const sheet  = mount.querySelector('.nav__sheet');
  const toggleSheet = (open) => {
    const next = open ?? sheet.getAttribute('aria-hidden') === 'true';
    sheet.setAttribute('aria-hidden', String(!next));
    burger.setAttribute('aria-expanded', String(next));
    document.body.classList.toggle('body--locked', next);
  };
  burger.addEventListener('click', () => toggleSheet());
  sheet.addEventListener('click',  (e) => { if (e.target.tagName === 'A') toggleSheet(false); });

  const highlight = () => {
    mount.querySelectorAll('[data-nav-link]').forEach(a => {
      a.toggleAttribute('aria-current', a.getAttribute('href') === location.pathname);
    });
  };
  highlight();
  window.addEventListener('popstate', highlight);
  document.addEventListener('click', () => queueMicrotask(highlight));
};
