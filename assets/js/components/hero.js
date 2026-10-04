/**
 * hero.js — home hero section.
 *
 * Desktop (≥820px):
 *   White canvas. ClipperCartel wordmark+poles (desktopherobg.png) sits
 *   centre-top. Three-line serif headline below. Dual CTA at the base.
 *   No cards, no status pill, no scroll indicator — intentionally sparse.
 *
 * Mobile (<820px):
 *   Full-bleed carousel of 4 shop portraits auto-advancing every 4.5s.
 *   Swipe-to-change. Dot indicators. Headline + CTAs stack beneath.
 *
 * Motion (prefers-reduced-motion aware):
 *   - desktop: brand image fades in from scale 0.97, 3 headline lines
 *     and CTAs stagger in beneath it.
 *   - mobile:  carousel + staggered copy; carousel auto-advance ignores
 *     reduced-motion only for the active-slide swap, no crossfade.
 */

import { loadGsap, prefersReducedMotion } from '../lib/motion.js';

const mobileSlides = [
  '/assets/images/hero/mobileheroimg1.png',
  '/assets/images/hero/mobileheroimg2.png',
  '/assets/images/hero/mobileheroimg3.png',
  '/assets/images/hero/mobileheroimg4.png',
];

const render = () => `
  <section class="hero" aria-label="ClipperCartel — introduction">

    <!-- Desktop brand plate (hidden on mobile via CSS) -->
    <div class="hero__brand" data-hero-el="brand">
      <img
        src="/assets/images/hero/desktopherobg.png"
        alt="ClipperCartel"
        fetchpriority="high"
        decoding="async"
      />
    </div>

    <!-- Mobile carousel (hidden on desktop via CSS) -->
    <div class="hero__carousel" data-hero-el="carousel" role="region" aria-roledescription="carousel" aria-label="Shop photos">
      <div class="hero__carousel-track" data-carousel-track>
        ${mobileSlides.map((src, i) => `
          <figure class="hero__slide ${i === 0 ? 'is-active' : ''}" data-slide-idx="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}">
            <img src="${src}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${i === 0 ? 'high' : 'low'}">
          </figure>
        `).join('')}
      </div>
      <div class="hero__carousel-dots" role="tablist" aria-label="Choose slide">
        ${mobileSlides.map((_, i) => `
          <button class="hero__dot ${i === 0 ? 'is-active' : ''}" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0 ? 'true' : 'false'}" data-slide-to="${i}" type="button"></button>
        `).join('')}
      </div>
    </div>

    <!-- Headline + CTAs stack -->
    <div class="hero__copy">
      <h1 class="hero__title" data-hero-el="title">
        <span>Precision cuts.</span>
        <span>Hot-towel shaves.</span>
        <span>A sharper you.</span>
      </h1>
      <div class="hero__cta" data-hero-el="cta">
        <a href="/book" class="btn btn-accent">Book your chair</a>
        <a href="/services" class="btn btn-ghost">See services</a>
      </div>
    </div>
  </section>
`;

const initCarousel = (root) => {
  const track = root.querySelector('[data-carousel-track]');
  const slides = Array.from(track.querySelectorAll('.hero__slide'));
  const dots = Array.from(root.querySelectorAll('[data-slide-to]'));
  if (slides.length < 2) return;

  let index = 0;
  let autoplayTimer;
  const reduced = prefersReducedMotion();
  const interval = reduced ? 7000 : 4500;

  const goTo = (next) => {
    if (next === index) return;
    slides[index].classList.remove('is-active');
    slides[index].setAttribute('aria-hidden', 'true');
    dots[index].classList.remove('is-active');
    dots[index].setAttribute('aria-selected', 'false');
    index = (next + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    slides[index].setAttribute('aria-hidden', 'false');
    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-selected', 'true');
  };

  const start = () => {
    stop();
    autoplayTimer = setInterval(() => goTo(index + 1), interval);
  };
  const stop  = () => { if (autoplayTimer) clearInterval(autoplayTimer); };

  dots.forEach(d => d.addEventListener('click', () => {
    goTo(parseInt(d.dataset.slideTo, 10));
    start();
  }));

  // Swipe
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
    start();
  });

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
};

const animate = async (root) => {
  if (prefersReducedMotion()) return;
  let gsap;
  try { gsap = await loadGsap(); } catch { return; }

  const brand      = root.querySelector('[data-hero-el="brand"]');
  const carousel   = root.querySelector('[data-hero-el="carousel"]');
  const titleLines = root.querySelectorAll('.hero__title span');
  const cta        = root.querySelector('[data-hero-el="cta"]');

  gsap.set([brand, carousel, cta, ...titleLines], { opacity: 0 });
  gsap.set([...titleLines, cta], { y: 18 });
  gsap.set(brand,    { scale: 0.97 });
  gsap.set(carousel, { y: 12 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.to(brand,    { opacity: 1, scale: 1, duration: 1.1 }, 0)
    .to(carousel, { opacity: 1, y: 0, duration: 0.9 }, 0)
    .to(titleLines, { opacity: 1, y: 0, duration: 0.75, stagger: 0.1 }, 0.5)
    .to(cta,      { opacity: 1, y: 0, duration: 0.6 }, 0.95);
};

export const mountHero = async (mount) => {
  mount.insertAdjacentHTML('afterbegin', render());
  const root = mount.querySelector('.hero');
  initCarousel(root);
  await animate(root);
};
