/**
 * signature-work.js — home section 03.
 *
 * Editorial slab: single large portrait of recent shop work on the
 * left, headline + short line + 'View the gallery →' on the right.
 * Image alternates to the LEFT (services teaser has image right), so
 * the eye zig-zags down the page — classic magazine rhythm.
 *
 * Picked gallery11 as the hero image: twist braids with a sharp line
 * finish, and the CLIPPER·CARTEL wordmark visible in the mirror
 * behind. The brand is in the shot — reinforces the section's
 * 'signature' name without an extra badge.
 *
 * Image is a trivial swap — just change `heroImage` below.
 */

import { observeReveal } from '../utils/reveal.js';

const heroImage = {
  src:  '/assets/images/gallery/gallery11.webp',
  alt:  'A recent cut at ClipperCartel. Twist braids finished with a sharp line, ClipperCartel wordmark visible in the mirror behind.',
};

const render = () => `
  <section class="signature section" aria-labelledby="signature-heading">
    <div class="signature__inner container">

      <figure class="signature__media" data-reveal="scale">
        <img
          src="${heroImage.src}"
          alt="${heroImage.alt}"
          loading="lazy"
          decoding="async"
          data-parallax="60"
        >
      </figure>

      <div class="signature__text">
        <h2 class="signature__title" id="signature-heading" data-reveal="fade-left">
          Recent <em>work</em>.
        </h2>
        <p class="signature__sub" data-reveal="fade-left" style="--reveal-delay: 1">
          A selection of cuts from the chair, lately.
        </p>
        <a href="/gallery" class="signature__cta" data-reveal="fade-left" style="--reveal-delay: 2">
          View the gallery
          <span aria-hidden="true">→</span>
        </a>
      </div>

    </div>
  </section>
`;

export const mountSignatureWork = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.signature'));
};
