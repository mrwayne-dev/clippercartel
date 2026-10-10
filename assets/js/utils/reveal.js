/**
 * reveal.js — scroll-triggered reveal via IntersectionObserver.
 *
 * Any element with [data-reveal] starts hidden (via animations.css)
 * and gets `.is-revealed` when it enters the viewport.
 *
 * Optional attrs:
 *   data-reveal-delay="2"   — multiplier for the stagger step (80ms * n)
 *
 * Reduced-motion users: the CSS short-circuits all transitions, so the
 * elements render fully visible on first paint.
 */

export const observeReveal = (scope = document) => {
  const targets = scope.querySelectorAll('[data-reveal]:not(.is-revealed)');
  if (!targets.length) return;

  // Fallback: no IntersectionObserver → show everything immediately.
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // threshold: 0 (reveal as soon as the box crosses into the shrunk root),
  // NOT an area threshold. The "clip" variant starts at
  // clip-path: inset(0 100% 0 0) — zero visible width — and Chromium reports
  // its intersectionRatio as 0, so any area-based threshold (e.g. 0.08) would
  // never fire and the heading would stay clipped forever. The -8% bottom
  // rootMargin still holds the "a little into view" trigger feel.
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-revealed');
        io.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  targets.forEach((el) => io.observe(el));
};
