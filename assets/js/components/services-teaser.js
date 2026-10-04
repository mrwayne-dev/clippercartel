/**
 * services-teaser.js — home section 02.
 *
 * Hydroxyapatite-pattern (see design-direction/servicedesign1.webp):
 *   - Small eyebrow label
 *   - Big typographic list of service names on the left
 *   - Image preview on the right that crossfades when a name is
 *     hovered/focused/tapped
 *   - Short note + Book CTA beneath the preview
 *
 * No prices, no durations — the shop hasn't finalised them.
 *
 * Service data is a module-local placeholder (names + preview images).
 * Swap to a fetch from /api/services.php once the admin backend lands.
 */

import { observeReveal } from '../utils/reveal.js';

const services = [
  { name: 'Signature Cut',   note: 'Clipper and scissor finish — tailored to your head shape and style.', image: '/assets/images/gallery/gallery5.jpeg' },
  { name: 'Fade & Line-up',  note: 'Taper, mid or skin fade. Crisp line-up to finish.',                   image: '/assets/images/gallery/gallery3.jpeg' },
  { name: 'Beard Sculpt',    note: 'Shape, trim and define — contoured to your jawline.',                 image: '/assets/images/gallery/gallery7.jpeg' },
  { name: 'Hot-Towel Shave', note: 'Pre-oil, warm lather, straight-razor finish — the full ritual.',     image: '/assets/images/gallery/gallery9.jpeg' },
];

const render = () => `
  <section class="services section" aria-labelledby="services-heading">
    <div class="services__inner container">

      <header class="services__header">
        <p class="services__eyebrow" data-reveal>02 — Services</p>
        <h2 class="services__heading" id="services-heading" data-reveal style="--reveal-delay: 1">
          A sharper <em>line</em>.
        </h2>
      </header>

      <div class="services__grid">

        <!-- Mobile: image sits above the list.  Desktop: image is on the right. -->
        <div class="services__preview" aria-hidden="true" data-reveal style="--reveal-delay: 2">
          <div class="services__image-stack">
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
          <p class="services__note" data-service-note>${services[0].note}</p>
          <a href="/book" class="services__book" data-service-cta>
            Book this
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <ol class="services__list" role="tablist" aria-label="Service menu">
          ${services.map((s, i) => `
            <li class="services__item ${i === 0 ? 'is-active' : ''}" role="presentation" data-reveal style="--reveal-delay: ${i + 2}">
              <button
                type="button"
                class="services__name"
                role="tab"
                aria-selected="${i === 0 ? 'true' : 'false'}"
                aria-controls="service-preview"
                data-service-idx="${i}"
              >
                <span class="services__arrow" aria-hidden="true">→</span>
                <span class="services__label">${s.name}</span>
              </button>
            </li>
          `).join('')}
        </ol>

      </div>
    </div>
  </section>
`;

const initInteraction = (root) => {
  const items   = Array.from(root.querySelectorAll('.services__item'));
  const buttons = Array.from(root.querySelectorAll('[data-service-idx]'));
  const images  = Array.from(root.querySelectorAll('[data-service-image]'));
  const noteEl  = root.querySelector('[data-service-note]');

  let active = 0;
  const setActive = (idx) => {
    if (idx === active) return;
    active = idx;
    items.forEach((li, i)  => li.classList.toggle('is-active', i === idx));
    buttons.forEach((b, i) => b.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    images.forEach((img, i) => img.classList.toggle('is-active', i === idx));
    // crossfade note by fading out, swapping text, fading back in
    noteEl.classList.add('is-swapping');
    setTimeout(() => {
      noteEl.textContent = services[idx].note;
      noteEl.classList.remove('is-swapping');
    }, 180);
  };

  buttons.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => setActive(i));
    btn.addEventListener('focus',      () => setActive(i));
    btn.addEventListener('click',      () => setActive(i));
  });

  // Keyboard: arrow keys navigate between tabs
  root.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = (active + dir + buttons.length) % buttons.length;
    buttons[next].focus();
  });
};

export const mountServicesTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  const root = mount.querySelector('.services');
  initInteraction(root);
  observeReveal(root);
};
