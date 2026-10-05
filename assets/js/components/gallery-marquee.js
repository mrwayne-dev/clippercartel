/**
 * gallery-marquee.js — home section 05.
 *
 * Full-bleed horizontal strip of recent cuts, auto-scrolling right→
 * left on a CSS keyframe loop. The track renders the image list twice
 * so when the first copy exits on the left, the second copy is
 * already in position — the loop is seamless.
 *
 * Interactions:
 *   - hover anywhere over the track → animation pauses so visitors
 *     can look at a specific cut without it drifting away
 *   - each tile links to /gallery
 *
 * prefers-reduced-motion: the track becomes a native horizontal
 * scroll container instead (user drives it manually, no auto-motion).
 *
 * Image list is a module-local placeholder; swap to a fetch from
 * /api/gallery.php?limit=12 once admin uploads land.
 */

import { observeReveal } from '../utils/reveal.js';

const images = [
  '/assets/images/gallery/galler2.jpeg',
  '/assets/images/gallery/gallery4.jpeg',
  '/assets/images/gallery/gallery8.jpeg',
  '/assets/images/gallery/galler12.jpeg',
  '/assets/images/gallery/gallery13.jpeg',
  '/assets/images/gallery/galler14.jpeg',
  '/assets/images/gallery/gallery15.jpeg',
  '/assets/images/gallery/gallery19.jpeg',
];

const tile = (src, duplicate = false) => `
  <a href="/gallery" class="marquee__item" ${duplicate ? 'aria-hidden="true" tabindex="-1"' : ''}>
    <img
      src="${src}"
      alt="${duplicate ? '' : 'A recent cut at ClipperCartel'}"
      loading="lazy"
      decoding="async"
    >
  </a>
`;

const render = () => `
  <section class="marquee section" aria-labelledby="marquee-heading">

    <div class="marquee__header container">
      <h2 class="marquee__title" id="marquee-heading" data-reveal="clip">
        The <em>look</em>.
      </h2>
      <a href="/gallery" class="marquee__cta" data-reveal="fade-left" style="--reveal-delay: 1">
        View the full gallery
        <span aria-hidden="true">→</span>
      </a>
    </div>

    <div class="marquee__viewport" data-reveal="scale" style="--reveal-delay: 1">
      <div class="marquee__track">
        ${images.map(src => tile(src)).join('')}
        ${images.map(src => tile(src, true)).join('')}
      </div>
    </div>

  </section>
`;

export const mountGalleryMarquee = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.marquee'));
};
