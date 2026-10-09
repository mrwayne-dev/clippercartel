/**
 * nav.js — primary nav. Logo left · links right · Book CTA (desktop only).
 *
 * On mobile the Book CTA is hidden (CSS). The burger opens a full-page
 * drawer: large serif links staggered in, a hairline divider, a contact
 * strip (Call / WhatsApp / Instagram / TikTok), and the shop address +
 * hours at the base. No Book CTA inside the drawer either.
 */

import { shop, telLink, waLink } from '../services/shop.js';

const links = [
  { href: '/services', label: 'Services' },
  { href: '/gallery',  label: 'Gallery'  },
  { href: '/about',    label: 'About'    },
  { href: '/contact',  label: 'Contact'  },
];

const link = (href, label) =>
  `<a href="${href}" data-nav-link="${href}" class="nav__link">${label}</a>`;

const sheetLink = (href, label, index) =>
  `<a href="${href}" data-nav-link="${href}" class="nav__sheet-link" style="--i:${index}">
     <span class="nav__sheet-num">${String(index + 1).padStart(2, '0')}</span>
     <span class="nav__sheet-label">${label}</span>
   </a>`;

export const mountNav = (mount) => {
  const phone      = shop.phone();
  const instaUrl   = shop.instagram();
  const tiktokUrl  = shop.tiktok();
  const snapchatUrl = shop.snapchat();
  const facebookUrl = shop.facebook();
  const address    = shop.address();
  const hours      = shop.hours();

  // Nav bar only — the sheet lives on document.body (see below).
  // Reason: #nav has backdrop-filter which creates a new containing
  // block, trapping any fixed-positioned descendant inside the 72px
  // nav strip. The sheet needs to escape to the viewport.
  mount.innerHTML = `
    <div class="nav__inner nav--a container">
      <a href="/" class="nav__brand" aria-label="ClipperCartel home">ClipperCartel</a>
      <nav class="nav__links" aria-label="Main navigation">
        ${links.map(l => link(l.href, l.label)).join('')}
      </nav>
      <a href="/book" class="nav__cta btn btn-accent">Book</a>
      <button class="nav__burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-sheet">
        <span></span><span></span>
      </button>
    </div>
  `;

  // Build the sheet on document.body — outside #nav's containing block.
  let sheet = document.getElementById('nav-sheet');
  if (sheet) sheet.remove();                       // idempotent — SPA re-mounts
  sheet = document.createElement('div');
  sheet.className = 'nav__sheet';
  sheet.id = 'nav-sheet';
  sheet.setAttribute('aria-hidden', 'true');
  sheet.setAttribute('aria-label', 'Site menu');
  sheet.innerHTML = `
    <div class="nav__sheet-inner">

      <nav class="nav__sheet-links" aria-label="Mobile menu">
        ${links.map((l, i) => sheetLink(l.href, l.label, i)).join('')}
      </nav>

      <a href="/book" class="nav__sheet-cta btn btn-accent" data-nav-link="/book">Book your chair</a>

      <div class="nav__sheet-footer">
        <div class="nav__sheet-row">
          ${phone        ? `<a href="${telLink()}" class="nav__sheet-chip">Call</a>` : ''}
          ${phone        ? `<a href="${waLink("Hi, I'd like to book a chair.")}" class="nav__sheet-chip" rel="noopener" target="_blank">WhatsApp</a>` : ''}
          ${instaUrl     ? `<a href="${instaUrl}"    class="nav__sheet-chip" rel="noopener" target="_blank">Instagram</a>` : ''}
          ${tiktokUrl    ? `<a href="${tiktokUrl}"   class="nav__sheet-chip" rel="noopener" target="_blank">TikTok</a>` : ''}
          ${snapchatUrl  ? `<a href="${snapchatUrl}" class="nav__sheet-chip" rel="noopener" target="_blank">Snapchat</a>` : ''}
          ${facebookUrl  ? `<a href="${facebookUrl}" class="nav__sheet-chip" rel="noopener" target="_blank">Facebook</a>` : ''}
        </div>
        ${address || hours ? `<div class="nav__sheet-meta">
          ${address ? `<p>${address}</p>` : ''}
          ${hours   ? `<p>${hours}</p>`   : ''}
        </div>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(sheet);

  const burger = mount.querySelector('.nav__burger');
  const toggleSheet = (open) => {
    const next = open ?? sheet.getAttribute('aria-hidden') === 'true';
    sheet.setAttribute('aria-hidden', String(!next));
    burger.setAttribute('aria-expanded', String(next));
    burger.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('body--locked', next);
  };
  burger.addEventListener('click', () => toggleSheet());
  // Any link inside the sheet closes it (SPA router handles the navigation)
  sheet.addEventListener('click', (e) => { if (e.target.closest('a')) toggleSheet(false); });
  // Escape closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sheet.getAttribute('aria-hidden') === 'false') toggleSheet(false);
  });

  const highlight = () => {
    // Query both the nav bar + the mobile sheet (lives on document.body).
    document.querySelectorAll('[data-nav-link]').forEach(a => {
      a.toggleAttribute('aria-current', a.getAttribute('href') === location.pathname);
    });
  };
  highlight();
  // Fires after the router has pushed the new URL (see router.js).
  window.addEventListener('cc:route',  highlight);
  window.addEventListener('popstate',  highlight);
};
