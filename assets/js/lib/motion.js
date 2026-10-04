/**
 * motion.js — single entry for the motion stack.
 *
 * Loads GSAP from /assets/vendor/ once, memoises it, and exposes a thin
 * API so page modules don't each wire their own GSAP boot.
 *
 * All animations are gated behind prefers-reduced-motion: reduced users
 * get the final state instantly, no motion.
 */

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let gsapPromise = null;

export const loadGsap = () => {
  if (window.gsap) return Promise.resolve(window.gsap);
  if (gsapPromise) return gsapPromise;
  gsapPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = '/assets/vendor/gsap.min.js';
    s.async = true;
    s.onload  = () => resolve(window.gsap);
    s.onerror = () => reject(new Error('gsap failed to load'));
    document.head.appendChild(s);
  });
  return gsapPromise;
};
