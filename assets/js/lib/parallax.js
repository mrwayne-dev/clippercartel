/**
 * parallax.js — universal scroll-driven parallax via GSAP ScrollTrigger.
 *
 * Any element with [data-parallax] gets its Y translated as it passes
 * through the viewport. The amount is set via `data-parallax` as a
 * number (treated as pixels of movement end-to-end). Positive numbers
 * drift the element DOWN relative to scroll (slower-than-scroll feel);
 * negative numbers drift it UP (faster-than-scroll).
 *
 *   <img data-parallax="80">        slow drift
 *   <div data-parallax="-40">       faster drift
 *
 * Reduced-motion users: no transforms are applied at all.
 */

import { loadScrollTrigger, prefersReducedMotion } from './motion.js';

export const applyParallax = async (scope = document) => {
  if (prefersReducedMotion()) return;
  const targets = scope.querySelectorAll('[data-parallax]');
  if (!targets.length) return;

  const { gsap, ScrollTrigger } = await loadScrollTrigger();

  targets.forEach((el) => {
    const dist = parseFloat(el.dataset.parallax) || 60;
    gsap.fromTo(el, { y: -dist / 2 }, {
      y: dist / 2,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end:   'bottom top',
        scrub: true,
      },
    });
  });

  // Settle after the first paint so initial positions are correct.
  requestAnimationFrame(() => ScrollTrigger.refresh());
};
