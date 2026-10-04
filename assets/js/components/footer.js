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
              ${insta    ? `<li><a href="${insta}"  rel="noopener" target="_blank">Instagram <span aria-hidden="true">↗</span></a></li>` : ''}
              ${tiktok   ? `<li><a href="${tiktok}" rel="noopener" target="_blank">TikTok <span aria-hidden="true">↗</span></a></li>` : ''}
              ${whatsapp ? `<li><a href="${waLink("Hi, I'd like to book a chair.")}" rel="noopener" target="_blank">WhatsApp <span aria-hidden="true">↗</span></a></li>` : ''}
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
