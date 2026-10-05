/**
 * services.js — the /services page.
 *
 * Full menu with hero + card grid + closing CTA. All copy currently
 * placeholder (names + notes mirror the home-page teaser); swap to a
 * fetch from /api/services.php once the admin backend lands.
 */

import { observeReveal } from '../../utils/reveal.js';
import { mountFinalCta } from '../../components/final-cta.js';
import { applyParallax } from '../../lib/parallax.js';

const services = [
  { name: 'Signature', note: 'An everyday precision cut, tailored to your head shape.',  image: '/assets/images/gallery/gallery5.jpeg' },
  { name: 'Precision', note: 'Clean lines, defined edges. The look that gets noticed.',  image: '/assets/images/gallery/gallery3.jpeg' },
  { name: 'Craft',     note: 'Shape, trim, sculpt. The full styling treatment.',         image: '/assets/images/gallery/gallery7.jpeg' },
  { name: 'Finish',    note: 'Ritual close. Warm towel, line-up, every detail.',         image: '/assets/images/gallery/gallery9.jpeg' },
];

const card = (s, i) => `
  <article class="service-card" data-reveal="${i % 2 === 0 ? 'fade-right' : 'fade-left'}" style="--reveal-delay: ${(i % 2) + 1}">
    <figure class="service-card__media">
      <img
        src="${s.image}"
        alt="A ${s.name} finish at ClipperCartel"
        loading="lazy"
        decoding="async"
        data-parallax="40"
      >
      <span class="service-card__index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </figure>
    <h2 class="service-card__name">${s.name}</h2>
    <p class="service-card__note">${s.note}</p>
    <a href="/book" class="service-card__cta">
      Book this
      <span aria-hidden="true">→</span>
    </a>
  </article>
`;

const render = () => `
  <div class="services-page">

    <!-- Hero -->
    <section class="services-page__hero" aria-labelledby="services-page-heading">
      <div class="services-page__hero-inner container">
        <p class="services-page__eyebrow" data-reveal>The menu</p>
        <h1 class="services-page__title" id="services-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          What we <em>do</em>.
        </h1>
        <p class="services-page__sub" data-reveal style="--reveal-delay: 2">
          A tight menu of cuts, shaves and sculpts. Pay at the chair, book in advance.
        </p>
      </div>
    </section>

    <!-- Grid of service cards -->
    <section class="services-page__grid-section">
      <div class="container">
        <div class="services-page__grid">
          ${services.map(card).join('')}
        </div>
      </div>
    </section>

  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  // Closing CTA — same component used on the home page.
  mountFinalCta(mount);

  observeReveal(mount);
  applyParallax(mount);
};
