/**
 * hero.js — home hero section.
 *
 * Desktop (≥820px):
 *   Full-width brand plate (desktopherobg.png) fills the viewport edge
 *   to edge. Two-line Kudryashev headline + dual CTA pinned bottom-left.
 *
 * Mobile (<820px):
 *   Full-bleed carousel of 4 shop portraits (auto-advance 4.5s, swipe,
 *   dots). Bottom gradient overlay lifts the text out of the photo. Same
 *   headline + CTAs land bottom-left over the gradient so the whole
 *   section — image, copy, buttons — reads in one viewport without
 *   scrolling.
 *
 * Motion (prefers-reduced-motion aware):
 *   image/carousel fade+scale on entry → 2 headline lines stagger →
 *   CTAs land last. Reduced-motion users get the final state instantly.
 */

import { loadGsap, prefersReducedMotion } from '../lib/motion.js';

const mobileSlides = [
  '/assets/images/hero/mobileheroimagemain.webp',   // brand slide leads
  '/assets/images/hero/mobileheroimg1.webp',
  '/assets/images/hero/mobileheroimg2.webp',
  '/assets/images/hero/mobileheroimg3.webp',
  '/assets/images/hero/mobileheroimg4.webp',
];

const render = () => `
  <section class="hero" aria-label="ClipperCartel introduction">

    <!-- Desktop background (hidden on mobile) -->
    <div class="hero__bg hero__bg--desktop" data-hero-el="desktop" aria-hidden="true">
      <img
        src="/assets/images/hero/desktopherobg.webp"
        alt=""
        fetchpriority="high"
        decoding="async"
      />
    </div>

    <!-- Mobile carousel (hidden on desktop) -->
    <div class="hero__bg hero__bg--mobile" data-hero-el="carousel" role="region" aria-roledescription="carousel" aria-label="Shop photos">
      <div class="hero__carousel-track" data-carousel-track>
        ${mobileSlides.map((src, i) => `
          <figure class="hero__slide ${i === 0 ? 'is-active' : ''}" data-slide-idx="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}">
            <img src="${src}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${i === 0 ? 'high' : 'low'}">
          </figure>
        `).join('')}
      </div>
    </div>

    <!-- Mobile gradient scrim (only shown on mobile via CSS) -->
    <div class="hero__gradient" aria-hidden="true"></div>

    <!-- Headline + CTAs — bottom-left, both breakpoints -->
    <div class="hero__copy">
      <h1 class="hero__title">
        <span data-hero-el="title-line">Precision cuts.</span>
        <span data-hero-el="title-line">A sharper you.</span>
      </h1>
      <div class="hero__cta" data-hero-el="cta">
        <a href="/book" class="btn btn-accent">Book your chair</a>
        <a href="/services" class="btn btn-outline">See services</a>
      </div>
    </div>

    <!-- Mobile dot indicators (bottom-right so they don't collide with copy) -->
    <div class="hero__carousel-dots" role="tablist" aria-label="Choose slide">
      ${mobileSlides.map((_, i) => `
        <button class="hero__dot ${i === 0 ? 'is-active' : ''}" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0 ? 'true' : 'false'}" data-slide-to="${i}" type="button"></button>
      `).join('')}
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

  const start = () => { stop(); autoplayTimer = setInterval(() => goTo(index + 1), interval); };
  const stop  = () => { if (autoplayTimer) clearInterval(autoplayTimer); };

  dots.forEach(d => d.addEventListener('click', () => {
    goTo(parseInt(d.dataset.slideTo, 10));
    start();
  }));

  // Swipe (mobile only matters, listeners harmless on desktop)
  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend',   (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
    start();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
};

const animate = async (root) => {
  if (prefersReducedMotion()) return;
  let gsap;
  try { gsap = await loadGsap(); } catch { return; }

  const desktopBg  = root.querySelector('[data-hero-el="desktop"]');
  const carousel   = root.querySelector('[data-hero-el="carousel"]');
  const titleLines = root.querySelectorAll('[data-hero-el="title-line"]');
  const cta        = root.querySelector('[data-hero-el="cta"]');

  gsap.set([desktopBg, carousel], { opacity: 0 });
  gsap.set(desktopBg, { scale: 1.02 });
  gsap.set([...titleLines, cta], { opacity: 0, y: 24 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.to(desktopBg, { opacity: 1, scale: 1, duration: 1.4, ease: 'power1.out' }, 0)
    .to(carousel,  { opacity: 1, duration: 0.9 }, 0)
    .to(titleLines, { opacity: 1, y: 0, duration: 0.75, stagger: 0.12 }, 0.45)
    .to(cta,        { opacity: 1, y: 0, duration: 0.6 }, 0.85);
};

export const mountHero = async (mount) => {
  mount.insertAdjacentHTML('afterbegin', render());
  const root = mount.querySelector('.hero');
  initCarousel(root);
  await animate(root);
};
