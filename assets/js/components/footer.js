/**
 * footer.js — persistent site footer.
 *
 * Reads shop details from <body data-shop-*> via services/shop.js so
 * values are stamped once by PHP from .env and never duplicated here.
 */

import { h } from '../utils/dom.js';
import { shop, waLink, telLink } from '../services/shop.js';

export const mountFooter = (mount) => {
  const year = new Date().getFullYear();
  const name     = shop.name();
  const phone    = shop.phone();
  const address  = shop.address();
  const hours    = shop.hours();
  const insta    = shop.instagram();
  const maps     = shop.maps();

  mount.innerHTML = '';
  const container = h('div', { class: 'container' },
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' } },
      h('div', {},
        h('h3', { style: { marginBottom: 'var(--space-sm)' } }, name),
        maps
          ? h('p', {}, h('a', { href: maps, rel: 'noopener', target: '_blank' }, address || 'View on map'))
          : h('p', {}, address || 'Address pending'),
        hours ? h('p', { style: { color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)' } }, hours) : null,
      ),
      h('div', {},
        h('h4', { style: { marginBottom: 'var(--space-sm)' } }, 'Contact'),
        phone ? h('p', {}, h('a', { href: telLink() }, phone))                              : null,
        phone ? h('p', {}, h('a', { href: waLink('Hi, I\'d like to book a chair.'), rel: 'noopener', target: '_blank' }, 'WhatsApp')) : null,
        insta ? h('p', {}, h('a', { href: insta, rel: 'noopener', target: '_blank' }, 'Instagram')) : null,
      ),
      h('div', {},
        h('h4', { style: { marginBottom: 'var(--space-sm)' } }, 'More'),
        h('p', {}, h('a', { href: '/faq' }, 'FAQ')),
        h('p', {}, h('a', { href: '/privacy' }, 'Privacy')),
        h('p', {}, h('a', { href: '/terms' }, 'Terms')),
      ),
    ),
    h('div', { style: { borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' } },
      h('p', {}, `© ${year} ${name}. All rights reserved.`),
      h('p', { style: { color: 'var(--color-text-dim)' } }, 'Port Harcourt, Nigeria'),
    )
  );
  mount.appendChild(container);
};
