/**
 * services-teaser.js — home section 02 (rebuild).
 *
 * Full-viewport split-screen service showcase.
 *   - Left panel: index (01/04) · big serif service name · subtitle
 *                 · progress bar · Book this CTA
 *   - Right panel: single edge-to-edge image, cover-cropped
 *   - Advancing to the next service swaps BOTH text and image in sync
 *     (crossfade + 1.02 → 1.00 scale on the image; translateY + fade
 *     on the text)
 *
 * Interactions:
 *   · auto-advance every 6s
 *   · click progress bar segments to jump
 *   · arrow-left / arrow-right while focused inside the section
 *   · swipe left / right on touch
 *   · hover pauses the auto-advance (desktop)
 *   · pauses when the browser tab is hidden
 */

import { observeReveal } from '../utils/reveal.js';

const services = [
  { name: 'Signature', note: 'An everyday precision cut, tailored to your head shape.',   image: '/assets/images/gallery/gallery5.webp' },
  { name: 'Precision', note: 'Clean lines, defined edges. The look that gets noticed.',   image: '/assets/images/gallery/gallery3.webp' },
  { name: 'Craft',     note: 'Shape, trim, sculpt. The full styling treatment.',          image: '/assets/images/gallery/gallery7.webp' },
  { name: 'Finish',    note: 'Ritual close. Warm towel, line-up, every detail.',          image: '/assets/images/gallery/gallery9.webp' },
];

const INTERVAL   = 6000;
const SWAP_FADE  = 220;

const render = () => `
  <section class="services section" aria-labelledby="services-heading">
    <div class="services__split" role="region" aria-roledescription="service showcase" tabindex="-1">

      <!-- Text panel -->
      <div class="services__text">
        <div class="services__text-inner">

          <h2 class="services__name" id="services-heading" data-active-name>${services[0].name}</h2>
          <p class="services__note" data-active-note>${services[0].note}</p>

          <div class="services__nav" role="tablist" aria-label="Choose service">
            ${services.map((s, i) => `
              <button
                type="button"
                class="services__dot ${i === 0 ? 'is-active' : ''}"
                role="tab"
                aria-selected="${i === 0 ? 'true' : 'false'}"
                aria-label="Show ${s.name}"
                data-service-idx="${i}"
              ><span class="services__dot-fill"></span></button>
            `).join('')}
          </div>

          <a href="/book" class="services__book">
            Book this
            <span aria-hidden="true">→</span>
          </a>

        </div>
      </div>

      <!-- Image panel -->
      <div class="services__image-pane" aria-hidden="true">
        ${services.map((s, i) => `
          <img
            src="${s.image}"
            alt=""
            class="services__image ${i === 0 ? 'is-active' : ''}"
            data-service-image="${i}"
            loading="${i === 0 ? 'eager' : 'lazy'}"
            decoding="async"
          >
        `).join('')}
      </div>

    </div>
  </section>
`;

const initInteraction = (root) => {
  const nameEl  = root.querySelector('[data-active-name]');
  const noteEl  = root.querySelector('[data-active-note]');
  const indexEl = root.querySelector('[data-active-index]');
  const dots    = Array.from(root.querySelectorAll('.services__dot'));
  const images  = Array.from(root.querySelectorAll('[data-service-image]'));
  const split   = root.querySelector('.services__split');
  let active = 0;
  let timer  = null;
  let inView = false;       // true while the section is on screen

  const setActive = (idx) => {
    if (idx === active) return;
    active = idx;

    // Fade text out, swap, fade back in
    nameEl.classList.add('is-swapping');
    noteEl.classList.add('is-swapping');
    setTimeout(() => {
      nameEl.textContent  = services[idx].name;
      noteEl.textContent  = services[idx].note;
      indexEl.textContent = String(idx + 1).padStart(2, '0');
      nameEl.classList.remove('is-swapping');
      noteEl.classList.remove('is-swapping');
    }, SWAP_FADE);

    images.forEach((img, i) => img.classList.toggle('is-active', i === idx));
    dots.forEach((d,   i) => {
      d.classList.toggle('is-active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  };

  const next = () => setActive((active + 1) % services.length);
  const prev = () => setActive((active - 1 + services.length) % services.length);

  const start = () => {
    stop();
    if (!inView || document.hidden) return;
    timer = setInterval(next, INTERVAL);
  };
  const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
  const kick  = () => { stop(); start(); };

  // Dots: tap/click to jump + reset the timer
  dots.forEach((d, i) => d.addEventListener('click', () => { setActive(i); kick(); }));

  // Arrow-key navigation (section must be focused)
  split.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); kick(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); kick(); }
  });

  // Swipe (touch only). Do NOT stop the timer during the gesture —
  // scroll-touches would unintentionally pause the carousel on mobile.
  let startX = null;
  split.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  split.addEventListener('touchend',   (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); kick(); }
    startX = null;
  });

  // Viewport gate — auto-advance only runs while the section is on screen.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      for (const e of entries) {
        inView = e.isIntersecting;
        inView ? start() : stop();
      }
    }, { threshold: 0.35 }).observe(split);
  } else {
    inView = true;
    start();
  }

  // Pause when the whole browser tab is hidden; resume (if still in view).
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else                 start();
  });
};

export const mountServicesTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  const root = mount.querySelector('.services');
  initInteraction(root);
  observeReveal(root);
};
