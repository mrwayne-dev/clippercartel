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
  { name: 'Signature', note: 'An everyday precision cut, tailored to your head shape.',   image: '/assets/images/gallery/gallery5.jpeg' },
  { name: 'Precision', note: 'Clean lines, defined edges. The look that gets noticed.',   image: '/assets/images/gallery/gallery3.jpeg' },
  { name: 'Craft',     note: 'Shape, trim, sculpt. The full styling treatment.',          image: '/assets/images/gallery/gallery7.jpeg' },
  { name: 'Finish',    note: 'Ritual close. Warm towel, line-up, every detail.',          image: '/assets/images/gallery/gallery9.jpeg' },
];

const INTERVAL   = 6000;
const SWAP_FADE  = 220;

const render = () => `
  <section class="services section" aria-labelledby="services-heading">
    <div class="services__split" role="region" aria-roledescription="service showcase" tabindex="-1">

      <!-- Text panel -->
      <div class="services__text">
        <div class="services__text-inner">

          <p class="services__index">
            <span data-active-index>01</span>
            <span class="services__index-sep" aria-hidden="true">/</span>
            <span>${String(services.length).padStart(2, '0')}</span>
          </p>

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
  const nameEl    = root.querySelector('[data-active-name]');
  const noteEl    = root.querySelector('[data-active-note]');
  const indexEl   = root.querySelector('[data-active-index]');
  const dots      = Array.from(root.querySelectorAll('.services__dot'));
  const images    = Array.from(root.querySelectorAll('[data-service-image]'));
  const split     = root.querySelector('.services__split');
  let active = 0;
  let timer  = null;

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

  const start = () => { stop(); if (!document.hidden) timer = setInterval(next, INTERVAL); };
  const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };
  const kick  = () => { stop(); start(); };

  dots.forEach((d, i) => d.addEventListener('click', () => { setActive(i); kick(); }));

  split.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); kick(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); kick(); }
  });

  // Swipe (touch only)
  let startX = null;
  split.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  split.addEventListener('touchend',   (e) => {
    if (startX == null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    startX = null;
    start();
  });

  // Pause on hover (desktop pointer only)
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    split.addEventListener('mouseenter', stop);
    split.addEventListener('mouseleave', start);
  }

  // Pause when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
};

export const mountServicesTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  const root = mount.querySelector('.services');
  initInteraction(root);
  observeReveal(root);
};
