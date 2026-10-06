/**
 * about.js — the /about page.
 *
 * Flow: Hero → story (portrait + text) → principles (3 pillars) →
 * shop (big interior shot) → Final CTA.
 *
 * Voice: 'I' throughout — single-barber shop. Copy is editorial
 * placeholder the shop can revise without touching layout.
 */

import { observeReveal } from '../../utils/reveal.js';
import { mountFinalCta } from '../../components/final-cta.js';
import { applyParallax } from '../../lib/parallax.js';

const principles = [
  { title: 'Precision',   note: 'Every line is deliberate. Every edge is sharp.' },
  { title: 'Consistency', note: 'The cut that holds its shape through the week, not just the day.' },
  { title: 'Respect',     note: 'The chair runs on the clock you booked. I value your time.' },
];

const render = () => `
  <div class="about-page">

    <!-- Hero -->
    <section class="about-page__hero" aria-labelledby="about-page-heading">
      <div class="about-page__hero-inner container">
        <p class="about-page__eyebrow" data-reveal>About</p>
        <h1 class="about-page__title" id="about-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          The chair, and the <em>hands</em> behind it.
        </h1>
        <p class="about-page__sub" data-reveal style="--reveal-delay: 2">
          A one-barber shop in Port Harcourt. Precision, consistency, and respect for your time.
        </p>
      </div>
    </section>

    <!-- Story -->
    <section class="about-page__story" aria-label="Our story">
      <div class="about-page__story-inner container">
        <div class="about-page__story-text">
          <p class="about-page__story-label" data-reveal>The story</p>
          <div class="about-page__story-body" data-reveal="fade-right" style="--reveal-delay: 1">
            <p>ClipperCartel started with one chair and one principle: the cut should match what you came in asking for. No shortcuts, no almost-right.</p>
            <p>I have been clipping heads for years. Along the way the cuts got sharper, the lines cleaner, and the chair earned a quiet reputation. Low cut, fade, design, colour, beard, kids. If it is barbering, it lives here.</p>
            <p>Book a chair. Bring a reference if you have got one. I will work from there.</p>
          </div>
        </div>
        <figure class="about-page__story-media" data-reveal="fade-left" style="--reveal-delay: 1">
          <img
            src="/assets/images/about/portrait-full.webp"
            alt="A portrait of the barber at ClipperCartel"
            loading="lazy"
            decoding="async"
            data-parallax="80"
          >
        </figure>
      </div>
    </section>

    <!-- Principles -->
    <section class="about-page__principles" aria-labelledby="about-page-principles-heading">
      <div class="about-page__principles-inner container">
        <header class="about-page__principles-header">
          <p class="about-page__eyebrow" data-reveal>Principles</p>
          <h2 class="about-page__principles-title" id="about-page-principles-heading" data-reveal="clip" style="--reveal-delay: 1">
            What the chair <em>runs on</em>.
          </h2>
        </header>
        <ol class="about-page__principles-grid">
          ${principles.map((p, i) => `
            <li class="principle" data-reveal="fade-up" style="--reveal-delay: ${i + 1}">
              <span class="principle__num">${String(i + 1).padStart(2, '0')}</span>
              <h3 class="principle__title">${p.title}</h3>
              <p class="principle__note">${p.note}</p>
            </li>
          `).join('')}
        </ol>
      </div>
    </section>

    <!-- The shop -->
    <section class="about-page__shop" aria-labelledby="about-page-shop-heading">
      <div class="about-page__shop-inner container">
        <header class="about-page__shop-header">
          <p class="about-page__eyebrow" data-reveal>The shop</p>
          <h2 class="about-page__shop-title" id="about-page-shop-heading" data-reveal="clip" style="--reveal-delay: 1">
            Where the <em>work</em> happens.
          </h2>
          <p class="about-page__shop-address" data-reveal style="--reveal-delay: 2">
            18 Ada George Road, Port Harcourt.
          </p>
        </header>
        <figure class="about-page__shop-media" data-reveal="scale" style="--reveal-delay: 1">
          <img
            src="/assets/images/gallery/mirror1.webp"
            alt="Inside ClipperCartel. The CLIPPER CARTEL wordmark on the mirror, chair, checkered floor visible in the reflection."
            loading="lazy"
            decoding="async"
            data-parallax="60"
          >
        </figure>
      </div>
    </section>

  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  // Closing CTA (shared with home + services + gallery).
  mountFinalCta(mount);

  observeReveal(mount);
  applyParallax(mount);
};
