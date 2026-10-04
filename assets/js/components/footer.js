/**
 * footer.js — persistent site footer.
 *
 * Shop details (address, phone, hours, socials) are hard-coded as TODO
 * placeholders until you send them through; swap them in `shop` below.
 */

import { h } from '../utils/dom.js';

const shop = {
  name:      'ClipperCartel',
  phone:     '+000 000 0000',  // TODO: real number
  address:   'Address pending',
  hours:     'Hours pending',
  instagram: '#',
  whatsapp:  '#',
};

export const mountFooter = (mount) => {
  const year = new Date().getFullYear();
  mount.innerHTML = '';
  const container = h('div', { class: 'container' },
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' } },
      h('div', {},
        h('h3', { style: { marginBottom: 'var(--space-sm)' } }, shop.name),
        h('p', {}, shop.address),
        h('p', {}, shop.hours),
      ),
      h('div', {},
        h('h4', { style: { marginBottom: 'var(--space-sm)' } }, 'Contact'),
        h('p', {}, h('a', { href: `tel:${shop.phone.replace(/\s/g, '')}` }, shop.phone)),
        h('p', {}, h('a', { href: shop.whatsapp, rel: 'noopener', target: '_blank' }, 'WhatsApp')),
        h('p', {}, h('a', { href: shop.instagram, rel: 'noopener', target: '_blank' }, 'Instagram')),
      ),
      h('div', {},
        h('h4', { style: { marginBottom: 'var(--space-sm)' } }, 'More'),
        h('p', {}, h('a', { href: '/faq' }, 'FAQ')),
        h('p', {}, h('a', { href: '/privacy' }, 'Privacy')),
        h('p', {}, h('a', { href: '/terms' }, 'Terms')),
      ),
    ),
    h('div', { style: { borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-sm)' } },
      h('p', {}, `© ${year} ${shop.name}. All rights reserved.`),
      h('p', {}, 'Built with care.'),
    )
  );
  mount.appendChild(container);
};
