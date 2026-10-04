/**
 * footer.js — persistent global footer.
 *
 * Dark surface. Continues the dark background from the home page's
 * final-cta section so the bottom of the page reads as one slab.
 *
 * Two-column top (brand+contact left, link lists right), hairline,
 * copyright + legal row.
 */

import { shop, telLink, waLink } from '../services/shop.js';

const siteLinks = [
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery'  },
  { href: '/about',    label: 'About'    },
  { href: '/reviews',  label: 'Reviews'  },
  { href: '/contact',  label: 'Contact'  },
  { href: '/faq',      label: 'FAQ'      },
];

/* Phosphor-style brand icons (16px, inline SVG so no extra font fetch).
 * stroke="currentColor" so they adopt the surrounding text colour. */
const icons = {
  instagram: `<svg class="footer__icon" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="36" y="36" width="184" height="184" rx="48"/><circle cx="128" cy="128" r="40"/><circle cx="180" cy="76" r="10" fill="currentColor" stroke="none"/></svg>`,
  tiktok:    `<svg class="footer__icon" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M168,24V88a40,40,0,0,0,40,40"/><path d="M168,88V168a56,56,0,1,1-56-56"/></svg>`,
  whatsapp:  `<svg class="footer__icon" width="16" height="16" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M44.1,208.6l15.5-45.8a80,80,0,1,1,33.6,33.6L44.1,212A3.4,3.4,0,0,1,44.1,208.6Z"/><path d="M100,112a16,16,0,0,0,16,16"/><path d="M140,144a16,16,0,0,0,16-16"/></svg>`,
};

export const mountFooter = (mount) => {
  const year     = new Date().getFullYear();
  const name     = shop.name();
  const phone    = shop.phone();
  const address  = shop.address();
  const hours    = shop.hours();
  const insta    = shop.instagram();
  const tiktok   = shop.tiktok();
  const whatsapp = shop.whatsapp();

  mount.setAttribute('data-surface', 'dark');
  mount.innerHTML = `
    <div class="footer__inner container">

      <div class="footer__top">
        <div class="footer__brand">
          <a href="/" class="footer__wordmark">${name}</a>
          ${address ? `<address class="footer__address">${address.split(',').map(s => `<span>${s.trim()}</span>`).join('')}</address>` : ''}
          <div class="footer__contact">
            ${phone    ? `<a href="${telLink()}">${phone}</a>` : ''}
            ${hours    ? `<span class="footer__hours">${hours}</span>` : ''}
          </div>
        </div>

        <nav class="footer__nav" aria-label="Footer navigation">
          <div class="footer__col">
            <p class="footer__col-head">Site</p>
            <ul>
              ${siteLinks.map((l) => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer__col">
            <p class="footer__col-head">Follow</p>
            <ul>
              ${insta    ? `<li><a href="${insta}"  rel="noopener" target="_blank">${icons.instagram}<span class="footer__link-label">Instagram</span></a></li>` : ''}
              ${tiktok   ? `<li><a href="${tiktok}" rel="noopener" target="_blank">${icons.tiktok}<span class="footer__link-label">TikTok</span></a></li>` : ''}
              ${whatsapp ? `<li><a href="${waLink("Hi, I'd like to book a chair.")}" rel="noopener" target="_blank">${icons.whatsapp}<span class="footer__link-label">WhatsApp</span></a></li>` : ''}
            </ul>
          </div>
        </nav>
      </div>

      <div class="footer__bottom">
        <p class="footer__copy">© ${year} ${name}. All rights reserved.</p>
        <ul class="footer__legal">
          <li><a href="/privacy">Privacy</a></li>
          <li><a href="/terms">Terms</a></li>
        </ul>
      </div>

    </div>
  `;
};
