/**
 * faq.js — reusable FAQ accordion.
 *
 * Why not <details>: native <details> can't be reliably animated —
 * Chrome 131+ exposes ::details-content, older browsers hide children
 * via internal rules, and the UA instant toggle fights any JS height
 * transition. We rebuild the pattern with button + aria-expanded +
 * controlled panel so the animation is fully in our hands.
 *
 * A11y preserved: button is a real button, aria-expanded tracks state,
 * aria-controls links to the panel's id, role="region" + aria-labelledby
 * links the panel back to the button for screen readers.
 *
 * Call initFaq(root) once after inserting the markup to wire the
 * open/close animation.
 */

export const renderFaq = ({ eyebrow, title, items, headingId = 'faq-heading', idPrefix = 'faq' }) => `
  <section class="faq-section" aria-labelledby="${headingId}">
    <div class="faq-section__inner container">
      <header class="faq-section__header">
        ${eyebrow ? `<p class="faq-section__eyebrow" data-reveal>${eyebrow}</p>` : ''}
        <h2 class="faq-section__title" id="${headingId}" data-reveal="clip" style="--reveal-delay: 1">${title}</h2>
      </header>

      <div class="faq" role="list">
        ${items.map((item, i) => {
          const btnId    = `${idPrefix}-btn-${i}`;
          const panelId  = `${idPrefix}-panel-${i}`;
          return `
            <div class="faq__item" role="listitem" data-reveal style="--reveal-delay: ${i + 1}">
              <button
                class="faq__q"
                type="button"
                id="${btnId}"
                aria-expanded="false"
                aria-controls="${panelId}"
              >
                <span class="faq__q-text">${item.q}</span>
                <span class="faq__icon" aria-hidden="true"></span>
              </button>
              <div
                class="faq__a-outer"
                id="${panelId}"
                role="region"
                aria-labelledby="${btnId}"
              >
                <div class="faq__a"><p>${item.a}</p></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>
`;

export const initFaq = (root) => {
  if (!root) return;
  const items = root.querySelectorAll('.faq__item');

  items.forEach((item) => {
    const btn   = item.querySelector('.faq__q');
    const panel = item.querySelector('.faq__a-outer');
    if (!btn || !panel) return;

    let cleanup = null;

    btn.addEventListener('click', () => {
      // Cancel any pending transitionend from a previous click so a
      // mid-animation re-click doesn't fire its stale cleanup.
      if (cleanup) {
        panel.removeEventListener('transitionend', cleanup);
        cleanup = null;
      }

      const open = btn.getAttribute('aria-expanded') === 'true';

      if (open) {
        // -------- Collapse --------
        // Lock the current natural height into an inline value so the
        // transition has a defined start point, flush, then go to 0.
        panel.style.height = panel.scrollHeight + 'px';
        void panel.offsetHeight;              // force reflow
        panel.style.height  = '0px';
        panel.style.opacity = '0';
        btn.setAttribute('aria-expanded', 'false');
        item.classList.remove('is-open');
      } else {
        // -------- Expand --------
        // Start height is CSS default (0). Measuring scrollHeight on
        // the clipped panel still returns the natural content height.
        const target = panel.scrollHeight;
        panel.style.height  = target + 'px';
        panel.style.opacity = '1';
        btn.setAttribute('aria-expanded', 'true');
        item.classList.add('is-open');

        // After the height animation lands, let the panel breathe at
        // auto height so later reflow (fonts loading, responsive
        // wrapping) still shows the full content.
        cleanup = (e) => {
          if (e.propertyName !== 'height') return;
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', cleanup);
          cleanup = null;
        };
        panel.addEventListener('transitionend', cleanup);
      }
    });
  });
};
