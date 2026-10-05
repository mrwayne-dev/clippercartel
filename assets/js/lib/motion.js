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

let lenisPromise = null;
export const loadLenis = () => {
  if (window.Lenis) return Promise.resolve(window.Lenis);
  if (lenisPromise) return lenisPromise;
  lenisPromise = loadScript('/assets/vendor/lenis.min.js').then(() => window.Lenis);
  return lenisPromise;
};

/**
 * Initialise global smooth scroll via Lenis, wired into GSAP's
 * ticker so ScrollTrigger stays in sync (no desync between pinned
 * sections, scroll-driven animations and the page's actual scroll
 * position).
 *
 *   - Native scroll steps in discrete deltaY chunks (~100-500px per
 *     wheel tick). ScrollTrigger scrub against raw native scroll
 *     looks jumpy. Lenis interpolates the scroll position frame-by-
 *     frame so animations get a continuous input.
 *   - Pin-leave jumps vanish because Lenis holds the scroll
 *     position continuously through the pin release.
 *   - prefers-reduced-motion: skipped entirely — native scroll.
 *   - Touch: left native (smoothTouch:false). iOS native inertia
 *     is better than any JS smoothing on handheld.
 */
let lenisInstance = null;
export const initSmoothScroll = async () => {
  if (lenisInstance) return lenisInstance;
  if (prefersReducedMotion()) return null;

  const [Lenis, { gsap, ScrollTrigger }] = await Promise.all([
    loadLenis(),
    loadScrollTrigger(),
  ]);

  lenisInstance = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // ease-out expo
    smoothWheel: true,
    // smoothTouch:true is needed so vertical finger-drag on mobile
    // drives ScrollTrigger-scrubbed sections (pinned horizontal rail
    // on /gallery) frame-by-frame instead of batching through the
    // native fling. Mild inertia loss vs iOS native scroll is worth
    // it for the parity in motion between desktop and mobile.
    smoothTouch: true,
    touchMultiplier: 1.5,
  });

  // Keep ScrollTrigger in sync with every Lenis-reported scroll frame.
  lenisInstance.on('scroll', ScrollTrigger.update);

  // Drive Lenis's own RAF loop from GSAP's ticker so we have one
  // shared frame clock. Prevents double-RAF jank.
  gsap.ticker.add((time) => lenisInstance.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenisInstance;
};

export const getLenis = () => lenisInstance;
