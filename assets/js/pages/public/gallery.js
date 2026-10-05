/**
 * gallery.js — the /gallery page.
 *
 * Hero → immersive deck (pinned ScrollTrigger: each image flies in
 * from a different angle, rotates, and lands on the stack as the
 * user scrolls) → socials callout → Final CTA.
 *
 * Deck mechanics:
 *   - Section is pinned via ScrollTrigger for `cards.length × step`
 *     pixels of scroll.
 *   - Each card has a pre-seeded (deterministic per index) start
 *     position off-screen on one of four sides, with a rotation.
 *   - A GSAP timeline, scrubbed by scroll, interpolates each card to
 *     its resting position — slight random offset + a few degrees of
 *     rotation — stacking on top of the previous ones.
 *   - The counter at the bottom-left updates in sync.
 *
 * Mobile / reduced-motion: pinning + heavy transforms are flaky on
 * small screens; we skip the deck entirely and show a static 2-col
 * grid instead. Same image data, same page cadence.
 */

import { observeReveal }                   from '../../utils/reveal.js';
import { mountFinalCta }                   from '../../components/final-cta.js';
import { loadScrollTrigger, prefersReducedMotion } from '../../lib/motion.js';
import { shop }                            from '../../services/shop.js';

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

/* -------------------------------------------------------------
 *  Markup
 * ----------------------------------------------------------- */

const deckCard = (src, i) => `
  <figure class="deck__card" data-card-idx="${i}">
    <img src="/assets/images/gallery/${src}" alt="A cut from ClipperCartel" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
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
          Scroll through the deck. Each cut lands on top of the last.
        </p>
      </div>
    </section>

    <!-- Immersive deck -->
    <section class="deck" aria-label="Gallery of recent cuts">
      <div class="deck__inner">
        <div class="deck__stage">
          ${images.map(deckCard).join('')}
        </div>
        <div class="deck__caption" aria-hidden="true">
          <p class="deck__label">In the chair</p>
          <p class="deck__counter">
            <span data-counter-current>01</span>
            <span class="deck__counter-sep">/</span>
            <span>${String(images.length).padStart(2, '0')}</span>
          </p>
        </div>
      </div>
    </section>

    <!-- Mobile / reduced-motion fallback: static grid (shown by CSS) -->
    <section class="deck-fallback" aria-hidden="true">
      <div class="container">
        <div class="deck-fallback__grid">
          ${images.map((src, i) => `
            <figure class="deck-fallback__tile" data-reveal style="--reveal-delay: ${Math.min(i, 6)}">
              <img src="/assets/images/gallery/${src}" alt="A cut from ClipperCartel" loading="lazy" decoding="async">
            </figure>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Socials -->
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

/* -------------------------------------------------------------
 *  Deck interaction (GSAP ScrollTrigger)
 * ----------------------------------------------------------- */

// Deterministic pseudo-random from index — stable positions across
// reloads so the stack always lands the same.
const seeded = (i, salt) => {
  const x = Math.sin((i + 1) * 1337 + salt * 7) * 10000;
  return x - Math.floor(x);
};

const configFor = (i) => {
  const side = i % 4;                               // cycle through the 4 sides
  const r1 = seeded(i, 1);
  const r2 = seeded(i, 2);
  const r3 = seeded(i, 3);
  const startRot = (r1 * 24 + 10) * (side % 2 === 0 ? -1 : 1);
  const start = (
    side === 0 ? { x: '-130vw', y: `${(r2 - 0.5) * 40}vh` } :    // from left
    side === 1 ? { x: '130vw',  y: `${(r2 - 0.5) * 40}vh` } :    // from right
    side === 2 ? { x: `${(r2 - 0.5) * 40}vw`, y: '-120vh' } :    // from top
                 { x: `${(r2 - 0.5) * 40}vw`, y: '120vh'  }      // from bottom
  );
  return {
    ...start,
    startRot,
    endX:   (r1 - 0.5) * 60,                        // ±30px final offset
    endY:   (r2 - 0.5) * 60,
    endRot: (r3 - 0.5) * 12,                        // ±6deg final tilt
  };
};

const initDeck = async (root) => {
  const deck    = root.querySelector('.deck');
  const stage   = root.querySelector('.deck__stage');
  const cards   = Array.from(root.querySelectorAll('.deck__card'));
  const counter = root.querySelector('[data-counter-current]');
  if (!deck || !cards.length) return;

  // Skip the pinned deck on small screens — static grid takes over.
  const isMobile = window.matchMedia('(max-width: 820px)').matches;
  if (isMobile || prefersReducedMotion()) {
    deck.setAttribute('data-deck-skipped', 'true');
    return;
  }

  let gsapCtx;
  try { gsapCtx = await loadScrollTrigger(); } catch { return; }
  const { gsap, ScrollTrigger } = gsapCtx;

  // Set the initial off-screen state before pinning
  cards.forEach((card, i) => {
    const c = configFor(i);
    gsap.set(card, {
      x: c.x, y: c.y,
      rotate: c.startRot,
      opacity: 0,
      zIndex: i,
    });
  });

  const CARD_SCROLL = 420;                          // px of scroll per card
  const total       = cards.length * CARD_SCROLL;

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: deck,
      start:   'top top',
      end:     `+=${total}`,
      pin:     true,
      scrub:   0.7,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const idx = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
        counter.textContent = String(idx + 1).padStart(2, '0');
      },
    },
  });

  cards.forEach((card, i) => {
    const c = configFor(i);
    tl.to(card, {
      x: c.endX,
      y: c.endY,
      rotate: c.endRot,
      opacity: 1,
      duration: 1,
    }, i);
  });

  // Re-run after images load (changes the measured heights)
  const imgs = root.querySelectorAll('.deck img');
  imgs.forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
  });
};

export default async (mount) => {
  mount.innerHTML = render();

  // Closing CTA (shared with home + services).
  mountFinalCta(mount);

  observeReveal(mount);
  await initDeck(mount);
};
