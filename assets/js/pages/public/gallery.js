/**
 * gallery.js — the /gallery page.
 *
 * Hero → horizontal pinned rail (scroll vertically, large portrait
 * cuts slide across horizontally) → socials callout → Final CTA.
 *
 * Rail mechanics:
 *   - Section is pinned via ScrollTrigger for `(trackWidth - viewport)`
 *     pixels of scroll — enough to pan the whole rail into view.
 *   - A GSAP timeline, scrubbed by scroll, translates the horizontal
 *     track from 0 to `-distance`.
 *   - Progress bar at the bottom fills as you move through the rail;
 *     counter in the top-right updates with the active index.
 *
 * Mobile / reduced-motion: pinning + large horizontal motion is
 * flaky on small screens; we skip the rail entirely and show a
 * static 2-col grid instead. Same image data, same page cadence.
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

const railSlide = (src, i) => `
  <figure class="rail__slide" data-slide-idx="${i}">
    <img
      src="/assets/images/gallery/${src}"
      alt="A cut from ClipperCartel"
      loading="${i < 3 ? 'eager' : 'lazy'}"
      decoding="async"
    >
    <figcaption class="rail__slide-cap">
      <span>${String(i + 1).padStart(2, '0')}</span>
    </figcaption>
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
          Scroll to pan the rail. Every cut, in sequence.
        </p>
      </div>
    </section>

    <!-- Horizontal pinned rail — desktop only -->
    <section class="rail" aria-label="Gallery of recent cuts">
      <div class="rail__viewport">
        <div class="rail__track" data-rail-track>
          ${images.map(railSlide).join('')}
        </div>
      </div>

      <!-- Chrome -->
      <p class="rail__eyebrow" aria-hidden="true">Scroll →</p>
      <p class="rail__counter" aria-hidden="true">
        <span data-counter-current>01</span>
        <span class="rail__counter-sep">/</span>
        <span>${String(images.length).padStart(2, '0')}</span>
      </p>
      <div class="rail__progress" aria-hidden="true">
        <span class="rail__progress-fill" data-rail-progress></span>
      </div>
    </section>

    <!-- Mobile / reduced-motion fallback: static grid (shown by CSS) -->
    <section class="rail-fallback" aria-hidden="true">
      <div class="container">
        <div class="rail-fallback__grid">
          ${images.map((src, i) => `
            <figure class="rail-fallback__tile" data-reveal style="--reveal-delay: ${Math.min(i, 6)}">
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
 *  Rail interaction — two paths.
 *   DESKTOP: section pinned via ScrollTrigger, vertical scroll
 *     scrubs the horizontal track from 0 to -distance.
 *   MOBILE: native horizontal scroll + scroll-snap on the viewport.
 *     Zero JS during drag, native iOS inertia, way less main-thread
 *     work than the smoothTouch+ScrollTrigger combo it replaces.
 *   Reduced-motion users bail to the static grid fallback.
 * ----------------------------------------------------------- */
const initRail = async (root) => {
  const rail     = root.querySelector('.rail');
  const viewport = root.querySelector('.rail__viewport');
  const track    = root.querySelector('[data-rail-track]');
  const slides   = Array.from(root.querySelectorAll('.rail__slide'));
  const counter  = root.querySelector('[data-counter-current]');
  const progress = root.querySelector('[data-rail-progress]');
  if (!rail || !track || !slides.length) return;

  if (prefersReducedMotion()) {
    rail.setAttribute('data-rail-skipped', 'true');
    return;
  }

  // Mobile path — native horizontal scroll, wire counter/progress by scrollLeft.
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  if (isMobile && viewport) {
    const updateChrome = () => {
      const max = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      const p   = viewport.scrollLeft / max;
      if (counter)  counter.textContent = String(Math.min(slides.length, Math.floor(p * slides.length) + 1)).padStart(2, '0');
      if (progress) progress.style.transform = `scaleX(${p})`;
    };
    viewport.addEventListener('scroll', updateChrome, { passive: true });
    updateChrome();
    return;
  }

  // Desktop path — original ScrollTrigger pin-scrub.
  let gsapCtx;
  try { gsapCtx = await loadScrollTrigger(); } catch { return; }
  const { gsap, ScrollTrigger } = gsapCtx;

  const setup = () => Math.max(0, track.scrollWidth - window.innerWidth);
  let distance = setup();
  if (distance <= 0) return;

  gsap.to(track, {
    x: () => -distance,
    ease: 'none',
    scrollTrigger: {
      trigger: rail,
      start:   'top top',
      end:     () => `+=${distance}`,
      pin:     true,
      anticipatePin: 1,
      // scrub: true tracks the smoothed scroll position exactly.
      // Previously scrub:0.6 added its own 0.6s catch-up ON TOP of
      // Lenis's smoothing, giving a double-smoothed hesitation
      // between every discrete wheel/touch delta.
      scrub:   true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const idx = Math.min(slides.length - 1, Math.floor(p * slides.length));
        counter.textContent = String(idx + 1).padStart(2, '0');
        if (progress) progress.style.transform = `scaleX(${p})`;
      },
    },
  });

  // Wait for ALL images to load, then refresh ScrollTrigger ONCE.
  // Previously we refreshed per-image, which recomputed `distance`
  // mid-scroll and nudged the animation each time a late image came
  // in. One batched refresh = no visible nudges.
  const imgs = Array.from(root.querySelectorAll('.rail img'));
  Promise.all(imgs.map((img) => (
    img.complete
      ? Promise.resolve()
      : new Promise((resolve) => img.addEventListener('load',  resolve, { once: true }))
  ))).then(() => {
    distance = setup();
    ScrollTrigger.refresh();
  });
};

export default async (mount) => {
  mount.innerHTML = render();

  // Closing CTA (shared with home + services).
  mountFinalCta(mount);

  observeReveal(mount);
  await initRail(mount);
};
