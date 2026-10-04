/**
 * services-teaser.js — home section 02.
 *
 * Editorial two-column menu: intro + CTA on the left, four featured
 * services on the right as a hairline-divided list with duration and
 * price per row. Full menu lives at /services.
 *
 * Service data is a module-local placeholder until the admin backend
 * lands. Swap `featured` for a fetch from `/api/services.php?limit=4`
 * once the DB is seeded.
 */

import { observeReveal } from '../utils/reveal.js';

const money = (ngn) =>
  '₦' + ngn.toLocaleString('en-NG');

const featured = [
  { name: 'Signature Cut',   duration: '45 min', price: 5000, note: 'Clipper + scissor finish, hot-towel close.' },
  { name: 'Fade & Line-up',  duration: '30 min', price: 4000, note: 'Taper, mid or skin — your call.' },
  { name: 'Beard Sculpt',    duration: '20 min', price: 2500, note: 'Shape, trim, line.' },
  { name: 'Hot-Towel Shave', duration: '30 min', price: 3500, note: 'Oil, lather, straight-razor finish.' },
];

const render = () => `
  <section class="services-teaser section" aria-labelledby="services-teaser-title">
    <div class="services-teaser__inner container">

      <div class="services-teaser__intro">
        <p class="services-teaser__eyebrow" data-reveal>02 — Services</p>
        <h2 class="services-teaser__title" id="services-teaser-title" data-reveal style="--reveal-delay: 1">
          A sharper <em>line</em>, every visit.
        </h2>
        <p class="services-teaser__sub" data-reveal style="--reveal-delay: 2">
          A tight menu of cuts, shaves and sculpts. Pay at the chair, book in advance.
        </p>
        <a href="/services" class="services-teaser__all" data-reveal style="--reveal-delay: 3">
          See the full menu
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <ol class="services-teaser__list">
        ${featured.map((s, i) => `
          <li class="service-row" data-reveal style="--reveal-delay: ${i + 1}">
            <a class="service-row__link" href="/book">
              <span class="service-row__head">
                <span class="service-row__name">${s.name}</span>
                <span class="service-row__price">${money(s.price)}</span>
              </span>
              <span class="service-row__body">
                <span class="service-row__note">${s.note}</span>
                <span class="service-row__duration">${s.duration}</span>
              </span>
            </a>
          </li>
        `).join('')}
      </ol>

    </div>
  </section>
`;

export const mountServicesTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.services-teaser'));
};
