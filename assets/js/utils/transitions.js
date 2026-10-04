/**
 * transitions.js — page transition in/out.
 *
 * Uses Motion One if present (will land when motion libs are installed);
 * falls back to CSS class toggles that reference animations.css. Both
 * paths respect prefers-reduced-motion.
 */

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const transitionOut = (el) => new Promise((resolve) => {
  if (!el || reduced) return resolve();
  el.classList.add('is-leaving');
  setTimeout(() => resolve(), 220);
});

export const transitionIn = (el) => new Promise((resolve) => {
  if (!el || reduced) return resolve();
  el.classList.remove('is-leaving');
  el.classList.add('is-entering');
  requestAnimationFrame(() => {
    el.classList.remove('is-entering');
    setTimeout(() => resolve(), 220);
  });
});
