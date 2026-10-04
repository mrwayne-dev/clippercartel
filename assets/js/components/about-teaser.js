/**
 * about-teaser.js — home section 04.
 *
 * Short editorial introduction to the shop + the barber. Two
 * paragraphs of text on the left, a single portrait on the right.
 * Mirrors design-direction/aboutdesign1.webp (Samuel Snider):
 *   small ABOUT label → paragraphs → big portrait on the other side.
 *
 * Image swap: `portrait` constant below.
 *
 * Copy is editorial placeholder — shop can edit the two paragraphs
 * without touching layout.
 */

import { observeReveal } from '../utils/reveal.js';

const portrait = {
  src: '/assets/images/about/portrait.jpg',
  alt: 'Portrait of the barber at ClipperCartel.',
};

const render = () => `
  <section class="about-teaser section" aria-labelledby="about-teaser-heading">
    <div class="about-teaser__inner container">

      <div class="about-teaser__text">
        <p class="about-teaser__label" data-reveal>About</p>
        <h2 class="about-teaser__title" id="about-teaser-heading" data-reveal style="--reveal-delay: 1">
          A Port Harcourt <em>chair</em>, built on the small things.
        </h2>
        <div class="about-teaser__body" data-reveal style="--reveal-delay: 2">
          <p>ClipperCartel runs on three principles: a crisp line, a cut that holds its shape through the week, and respect for the time you booked.</p>
          <p>Every chair, every blade, every towel. Craft is what the mirror shows when the cape comes off.</p>
        </div>
        <a href="/about" class="about-teaser__cta" data-reveal style="--reveal-delay: 3">
          Our story
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <figure class="about-teaser__media" data-reveal style="--reveal-delay: 1">
        <img
          src="${portrait.src}"
          alt="${portrait.alt}"
          loading="lazy"
          decoding="async"
        >
      </figure>

    </div>
  </section>
`;

export const mountAboutTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.about-teaser'));
};
