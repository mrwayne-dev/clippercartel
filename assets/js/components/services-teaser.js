/**
 * services-teaser.js — home section 02.
 *
 * Hydroxyapatite-pattern (see design-direction/servicedesign1.webp):
 *   - Big typographic list of service names on the left
 *   - Image preview on the right that crossfades when a name is
 *     hovered/focused/tapped
 *   - Short note + Book CTA beneath the preview
 *
 * No prices, no durations, no eyebrow label.
 * Names are general placeholders (Signature / Precision / Craft /
 * Finish) because the shop photos we have aren't tied to specific
 * service types. Swap for real services once the admin backend lands.
 */

import { observeReveal } from '../utils/reveal.js';

const services = [
  { name: 'Signature', note: 'An everyday precision cut, tailored to your head shape.',   image: '/assets/images/gallery/gallery5.jpeg' },
  { name: 'Precision', note: 'Clean lines, defined edges. The look that gets noticed.',   image: '/assets/images/gallery/gallery3.jpeg' },
  { name: 'Craft',     note: 'Shape, trim, sculpt. Full styling treatment.',              image: '/assets/images/gallery/gallery7.jpeg' },
  { name: 'Finish',    note: 'Ritual close. Warm towel, line-up, every detail.',          image: '/assets/images/gallery/gallery9.jpeg' },
];

const render = () => `
  <section class="services section" aria-labelledby="services-heading">
    <div class="services__inner container">

      <header class="services__header">
        <h2 class="services__heading" id="services-heading" data-reveal>
          A sharper <em>line</em>.
        </h2>
      </header>

      <div class="services__grid">

        <!-- Mobile: image sits above the list.  Desktop: image is on the right. -->
        <div class="services__preview" aria-hidden="true" data-reveal style="--reveal-delay: 1">
          <!-- Mobile-only eyebrow tabs above the image.
               Auto-cycle on mobile; also tappable. Hidden on desktop
               (the big typographic list on the left takes over there). -->
          <div class="services__tabs" role="tablist" aria-label="Service style">
            ${services.map((s, i) => `
              <button
                type="button"
                class="services__tab ${i === 0 ? 'is-active' : ''}"
                role="tab"
                aria-selected="${i === 0 ? 'true' : 'false'}"
                data-service-idx="${i}"
              >${s.name}</button>
            `).join('')}
          </div>

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
            <li class="services__item ${i === 0 ? 'is-active' : ''}" role="presentation" data-reveal style="--reveal-delay: ${i + 1}">
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
  // Two tab controls: desktop list buttons + mobile eyebrow tabs.
  const desktopBtns = Array.from(root.querySelectorAll('.services__name[data-service-idx]'));
  const mobileTabs  = Array.from(root.querySelectorAll('.services__tab[data-service-idx]'));
  const allBtns     = [...desktopBtns, ...mobileTabs];
  const images      = Array.from(root.querySelectorAll('[data-service-image]'));
  const noteEl      = root.querySelector('[data-service-note]');

  let active = 0;
  const setActive = (idx) => {
    if (idx === active) return;
    active = idx;
    items.forEach((li, i)        => li.classList.toggle('is-active', i === idx));
    mobileTabs.forEach((t, i)    => t.classList.toggle('is-active', i === idx));
    allBtns.forEach((b)          => b.setAttribute('aria-selected', Number(b.dataset.serviceIdx) === idx ? 'true' : 'false'));
    images.forEach((img, i)      => img.classList.toggle('is-active', i === idx));
    noteEl.classList.add('is-swapping');
    setTimeout(() => {
      noteEl.textContent = services[idx].note;
      noteEl.classList.remove('is-swapping');
    }, 180);
  };

  // Desktop list: hover + focus + click drive active state.
  desktopBtns.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => { stopAuto(); setActive(i); });
    btn.addEventListener('focus',      () => { stopAuto(); setActive(i); });
    btn.addEventListener('click',      () => { stopAuto(); setActive(i); });
  });

  // Mobile tabs: tap to switch, resets the auto-cycle timer.
  mobileTabs.forEach((btn, i) => {
    btn.addEventListener('click', () => { setActive(i); startAuto(); });
  });

  // Keyboard: arrow keys navigate between desktop tabs.
  const list = root.querySelector('.services__list');
  if (list) list.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const dir = e.key === 'ArrowDown' ? 1 : -1;
    const next = (active + dir + desktopBtns.length) % desktopBtns.length;
    desktopBtns[next].focus();
  });

  // ---------- Auto-cycle (mobile only) ----------
  const mql = window.matchMedia('(max-width: 899px)');
  let timer = null;
  const INTERVAL = 3800;
  const startAuto = () => {
    stopAuto();
    if (!mql.matches || document.hidden) return;
    timer = setInterval(() => setActive((active + 1) % services.length), INTERVAL);
  };
  const stopAuto = () => { if (timer) { clearInterval(timer); timer = null; } };

  // Kick off / tear down when the viewport crosses the mobile breakpoint
  mql.addEventListener('change', (e) => { e.matches ? startAuto() : stopAuto(); });

  // Pause when the tab/window is hidden; resume on return (mobile only)
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  startAuto();
};

export const mountServicesTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  const root = mount.querySelector('.services');
  initInteraction(root);
  observeReveal(root);
};
