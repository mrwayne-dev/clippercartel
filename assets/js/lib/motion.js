/**
 * motion.js — single entry for the motion stack.
 *
 * Loads GSAP + ScrollTrigger from /assets/vendor/ once each, memoises
 * them, and exposes a thin API so page modules don't each wire their
 * own GSAP boot.
 *
 * All animations are gated behind prefers-reduced-motion: reduced
 * users get the final state instantly, no motion.
 */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.async = true;
  s.onload  = () => resolve();
  s.onerror = () => reject(new Error(`failed to load ${src}`));
  document.head.appendChild(s);
});

let gsapPromise = null;
export const loadGsap = () => {
  if (window.gsap) return Promise.resolve(window.gsap);
  if (gsapPromise) return gsapPromise;
  gsapPromise = loadScript('/assets/vendor/gsap.min.js').then(() => window.gsap);
  return gsapPromise;
};

let scrollTriggerPromise = null;
export const loadScrollTrigger = async () => {
  const gsap = await loadGsap();
  if (window.ScrollTrigger) {
    if (gsap.plugins && gsap.plugins.ScrollTrigger) {
      // already registered
    } else {
      gsap.registerPlugin(window.ScrollTrigger);
    }
    return { gsap, ScrollTrigger: window.ScrollTrigger };
  }
  if (scrollTriggerPromise) return scrollTriggerPromise;
  scrollTriggerPromise = loadScript('/assets/vendor/ScrollTrigger.min.js').then(() => {
    gsap.registerPlugin(window.ScrollTrigger);
    return { gsap, ScrollTrigger: window.ScrollTrigger };
  });
  return scrollTriggerPromise;
};
