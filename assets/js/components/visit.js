/**
 * visit.js — home section 07.
 *
 * Text column on the left (address, hours, call / WhatsApp / open in
 * maps), Google Maps iframe on the right. All copy sourced from
 * services/shop.js so the single source of truth is .env.
 *
 * The iframe uses Google's keyless public embed URL (maps.google.com
 * ?q=...&output=embed). CSP (.htaccess) already allows
 * frame-src https://www.google.com — no header change required.
 */

import { shop, telLink, waLink } from '../services/shop.js';
import { observeReveal }         from '../utils/reveal.js';

const render = () => {
  const addressFull  = shop.address();
  const addressLines = addressFull
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const mapQuery = encodeURIComponent(addressFull);
  const mapsHref = shop.maps() || `https://maps.google.com/?q=${mapQuery}`;
  const hours    = shop.hours();

  return `
  <section class="visit section" aria-labelledby="visit-heading">
    <div class="visit__inner container">

      <div class="visit__text">
        <p class="visit__label" data-reveal="fade-right">Visit</p>
        <h2 class="visit__title" id="visit-heading" data-reveal="fade-right" style="--reveal-delay: 1">
          Come <em>through</em>.
        </h2>

        <address class="visit__address" data-reveal="fade-right" style="--reveal-delay: 2">
          ${addressLines.map((line) => `<span>${line}</span>`).join('')}
        </address>

        ${hours ? `
          <p class="visit__hours" data-reveal="fade-right" style="--reveal-delay: 3">${hours}</p>
        ` : ''}

        <div class="visit__actions" data-reveal="fade-right" style="--reveal-delay: 4">
          ${shop.phone()   ? `<a href="${telLink()}" class="btn btn-accent">Call</a>` : ''}
          ${shop.whatsapp()? `<a href="${waLink("Hi, I'd like to book a chair.")}" class="btn btn-outline" rel="noopener" target="_blank">WhatsApp</a>` : ''}
        </div>

        <a href="${mapsHref}" class="visit__directions" rel="noopener" target="_blank" data-reveal="fade-right" style="--reveal-delay: 5">
          Open in Google Maps
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="visit__map" data-reveal="scale" style="--reveal-delay: 1">
        <iframe
          src="https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed"
          title="ClipperCartel on Google Maps"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          allow="geolocation"
        ></iframe>
      </div>

    </div>
  </section>
  `;
};

export const mountVisit = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.visit'));
};
