/**
 * gallery.js — the /gallery page.
 *
 * Flow: Hero -> uniform portrait grid of recent work -> socials
 * callout -> Final CTA.
 *
 * All images come from /assets/images/gallery/. First-person voice
 * ('I') for consistency with the rest of the site. Swap the hard-
 * coded images list for `/api/gallery.php` once the admin uploader
 * is in.
 */

import { observeReveal } from '../../utils/reveal.js';
import { mountFinalCta } from '../../components/final-cta.js';
import { shop }          from '../../services/shop.js';

const images = [
  'gallery3.jpeg',
  'gallery4.jpeg',
  'gallery5.jpeg',
  'gallery6.jpeg',
  'gallery7.jpeg',
  'gallery8.jpeg',
  'gallery9.jpeg',
  'gallery11.jpeg',
  'gallery13.jpeg',
  'gallery15.jpeg',
  'gallery19.jpeg',
  'galler2.jpeg',
  'galler12.jpeg',
  'galler14.jpeg',
];

const tile = (name, i) => `
  <figure class="gallery-tile" data-reveal style="--reveal-delay: ${Math.min(i, 8)}">
    <img
      src="/assets/images/gallery/${name}"
      alt="A recent cut at ClipperCartel"
      loading="${i < 3 ? 'eager' : 'lazy'}"
      decoding="async"
    >
  </figure>
`;

const render = () => `
  <div class="gallery-page">

    <!-- Hero -->
    <section class="gallery-page__hero" aria-labelledby="gallery-page-heading">
      <div class="gallery-page__hero-inner container">
        <p class="gallery-page__eyebrow" data-reveal>Portfolio</p>
        <h1 class="gallery-page__title" id="gallery-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          The whole <em>catalogue</em>.
        </h1>
        <p class="gallery-page__sub" data-reveal style="--reveal-delay: 2">
          A rolling selection of recent work. Browse, screenshot, bring the reference when you book.
        </p>
      </div>
    </section>

    <!-- Grid of cuts -->
    <section class="gallery-page__grid-section">
      <div class="container">
        <div class="gallery-page__grid">
          ${images.map(tile).join('')}
        </div>
      </div>
    </section>

    <!-- Socials: more cuts on IG/TikTok/Snapchat -->
    <section class="gallery-page__more">
      <div class="gallery-page__more-inner container">
        <p class="gallery-page__more-eyebrow" data-reveal>Still looking?</p>
        <h2 class="gallery-page__more-title" data-reveal="clip" style="--reveal-delay: 1">
          Fresh cuts, <em>daily</em>.
        </h2>
        <p class="gallery-page__more-sub" data-reveal style="--reveal-delay: 2">
          Reels, stories, posts. Follow for the newest work before it lands here.
        </p>
        <div class="gallery-page__more-links" data-reveal style="--reveal-delay: 3">
          ${shop.instagram() ? `<a href="${shop.instagram()}" rel="noopener" target="_blank" class="gallery-page__more-link">Instagram <span aria-hidden="true">↗</span></a>` : ''}
          ${shop.tiktok()    ? `<a href="${shop.tiktok()}"    rel="noopener" target="_blank" class="gallery-page__more-link">TikTok <span aria-hidden="true">↗</span></a>` : ''}
          ${shop.snapchat()  ? `<a href="${shop.snapchat()}"  rel="noopener" target="_blank" class="gallery-page__more-link">Snapchat <span aria-hidden="true">↗</span></a>` : ''}
          ${shop.facebook()  ? `<a href="${shop.facebook()}"  rel="noopener" target="_blank" class="gallery-page__more-link">Facebook <span aria-hidden="true">↗</span></a>` : ''}
        </div>
      </div>
    </section>

  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  // Closing CTA (shared with home + services).
  mountFinalCta(mount);

  observeReveal(mount);
};
