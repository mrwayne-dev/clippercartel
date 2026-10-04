/**
 * hero.js — home hero section.
 *
 * Layout:
 *   full-bleed shop image (right/centre on desktop; full visibility on mobile)
 *   bottom-left copy stack  — brand mark, tagline, dual CTA
 *   right-side Visit card   — address · hours · tap-to-call · WhatsApp · socials
 *
 * Motion (prefers-reduced-motion aware):
 *   1. image fades in + Ken Burns zoom (scale 1.08 → 1.00, 1.6s)
 *   2. bottom-left stack staggers in — eyebrow → brand → tagline → CTAs (120ms)
 *   3. right-side card lifts in (translateY 24 → 0, fade)
 *   4. scroll indicator fades in last
 *
 * Right-side card option "A" (Visit) picked over Next-Slot and Live-Counter.
 * Swap to Next-Slot the moment the booking API is live (phase 3).
 */

import { shop, telLink, waLink }      from '../services/shop.js';
import { loadGsap, prefersReducedMotion } from '../lib/motion.js';

const render = () => {
  const address = shop.address();
  const hours   = shop.hours();
  const phone   = shop.phone();
  const maps    = shop.maps();
  const insta   = shop.instagram();
  const tiktok  = shop.tiktok();

  return `
  <section class="hero" aria-label="ClipperCartel — introduction">
    <div class="hero__image" role="img" aria-label="ClipperCartel shop portrait">
      <img
        src="/assets/images/hero/hero-primary.jpg"
        alt=""
        fetchpriority="high"
        decoding="async"
      />
      <div class="hero__scrim" aria-hidden="true"></div>
    </div>

    <!-- Open-now indicator (top-right, independent of card) -->
    <div class="hero__status" data-hero-el="status">
      <span class="hero__status-dot" aria-hidden="true"></span>
      <span>Open now · until 20:00</span>
    </div>

    <!-- Right-side Visit card -->
    <aside class="hero__card" data-hero-el="card" aria-label="Visit">
      <p class="hero__card-eyebrow">Visit</p>
      <p class="hero__card-address">${address || '18 Ada George Road, Port Harcourt'}</p>
      <p class="hero__card-hours">${hours || 'Mon–Sat 09:00–20:00'}</p>

      <div class="hero__card-actions">
        <a href="${telLink()}" class="hero__card-row">
          <span>Call</span><span>${phone || ''}</span>
        </a>
        <a href="${waLink("Hi, I'd like to book a chair.")}" class="hero__card-row" rel="noopener" target="_blank">
          <span>WhatsApp</span><span>Message us →</span>
        </a>
        ${maps ? `<a href="${maps}" class="hero__card-row" rel="noopener" target="_blank">
          <span>Directions</span><span>Open map →</span>
        </a>` : ''}
      </div>

      <div class="hero__card-socials">
        ${insta  ? `<a href="${insta}"  rel="noopener" target="_blank" aria-label="Instagram">Instagram</a>` : ''}
        ${tiktok ? `<a href="${tiktok}" rel="noopener" target="_blank" aria-label="TikTok">TikTok</a>` : ''}
      </div>
    </aside>

    <!-- Bottom-left copy stack -->
    <div class="hero__copy">
      <p class="hero__eyebrow" data-hero-el="eyebrow">Port Harcourt · Est. for the sharp line</p>
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

    <!-- Scroll indicator -->
    <div class="hero__scroll" data-hero-el="scroll" aria-hidden="true">
      <span>Scroll</span>
      <span class="hero__scroll-line"></span>
    </div>
  </section>
  `;
};

const animate = async (root) => {
  if (prefersReducedMotion()) return;
  let gsap;
  try { gsap = await loadGsap(); } catch { return; }

  const q = (sel) => root.querySelector(sel);
  const img      = q('.hero__image img');
  const status   = q('[data-hero-el="status"]');
  const card     = q('[data-hero-el="card"]');
  const eyebrow  = q('[data-hero-el="eyebrow"]');
  const titleLines = root.querySelectorAll('.hero__title span');
  const cta      = q('[data-hero-el="cta"]');
  const scrollEl = q('[data-hero-el="scroll"]');

  // Lock pre-animation state so first paint doesn't flash the final.
  gsap.set([status, card, eyebrow, cta, scrollEl, ...titleLines], { opacity: 0 });
  gsap.set(card,    { y: 24 });
  gsap.set([eyebrow, ...titleLines, cta], { y: 20 });
  gsap.set(status,  { y: -8 });
  gsap.set(img,     { scale: 1.08, opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.to(img,     { opacity: 1, duration: 0.8 }, 0)
    .to(img,     { scale: 1,  duration: 1.8, ease: 'power1.out' }, 0)
    .to(status,  { opacity: 1, y: 0, duration: 0.5 }, 0.5)
    .to(eyebrow, { opacity: 1, y: 0, duration: 0.6 }, 0.6)
    .to(titleLines, { opacity: 1, y: 0, duration: 0.7, stagger: 0.09 }, 0.75)
    .to(cta,     { opacity: 1, y: 0, duration: 0.6 }, 1.0)
    .to(card,    { opacity: 1, y: 0, duration: 0.6 }, 1.0)
    .to(scrollEl,{ opacity: 1, duration: 0.6 }, 1.3);
};

export const mountHero = async (mount) => {
  mount.insertAdjacentHTML('afterbegin', render());
  const root = mount.querySelector('.hero');
  await animate(root);
};
