/**
 * nav.js — persistent primary nav.
 *
 * Links use plain href; the router intercepts same-origin clicks and
 * navigates without a page reload.
 *
 * Styleless until the design direction lands — the actual look (colour,
 * typography, interaction) is a design-time decision.
 */

import { h } from '../utils/dom.js';

const links = [
  { href: '/',         label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery' },
  { href: '/about',    label: 'About' },
  { href: '/reviews',  label: 'Reviews' },
  { href: '/contact',  label: 'Contact' },
];

export const mountNav = (mount) => {
  mount.innerHTML = '';
  const container = h('div', { class: 'container', style: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
    h('a', { href: '/', 'aria-label': 'ClipperCartel home', style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: '600' } }, 'ClipperCartel'),
    h('ul', { style: { display: 'flex', gap: 'var(--space-lg)', alignItems: 'center' } },
      ...links.map(l => h('li', {},
        h('a', { href: l.href, 'data-nav-link': l.href }, l.label)
      )),
      h('li', {},
        h('a', { href: '/book', class: 'btn btn-primary', 'aria-label': 'Book your chair' }, 'Book')
      )
    )
  );
  mount.appendChild(container);

  // Mark the active link so CSS can style it when design lands.
  const highlight = () => {
    mount.querySelectorAll('[data-nav-link]').forEach(a => {
      a.toggleAttribute('aria-current', a.getAttribute('href') === location.pathname);
    });
  };
  highlight();
  window.addEventListener('popstate', highlight);
  document.addEventListener('click', () => queueMicrotask(highlight));
};
