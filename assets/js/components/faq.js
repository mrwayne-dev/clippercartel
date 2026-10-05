/**
 * faq.js — reusable FAQ accordion.
 *
 * Uses native <details><summary> markup for a11y (keyboard, screen
 * readers), then intercepts summary clicks and animates the answer's
 * height for a smooth open/close. The browser's default `open`
 * attribute is still what state we read, but we delay flipping it on
 * close until the shrink finishes.
 *
 * Call initFaq(root) once after inserting the markup, otherwise the
 * accordion falls back to the native (instant) toggle.
 *
 * Usage:
 *   mount.insertAdjacentHTML('beforeend', renderFaq({ eyebrow, title, items }));
 *   initFaq(mount.querySelector('.faq-section'));
 */

const OPEN_DURATION  = 420;      // keep in sync with .faq__a transition in faq.css
const CLOSE_DURATION = 320;

export const renderFaq = ({ eyebrow, title, items, headingId = 'faq-heading' }) => `
  <section class="faq-section" aria-labelledby="${headingId}">
    <div class="faq-section__inner container">
      <header class="faq-section__header">
        ${eyebrow ? `<p class="faq-section__eyebrow" data-reveal>${eyebrow}</p>` : ''}
        <h2 class="faq-section__title" id="${headingId}" data-reveal="clip" style="--reveal-delay: 1">${title}</h2>
      </header>

      <dl class="faq">
        ${items.map((item, i) => `
          <details class="faq__item" data-reveal style="--reveal-delay: ${i + 1}">
            <summary class="faq__q">
              <span class="faq__q-text">${item.q}</span>
              <span class="faq__icon" aria-hidden="true"></span>
            </summary>
            <div class="faq__a-outer">
              <div class="faq__a">
                <p>${item.a}</p>
              </div>
            </div>
          </details>
        `).join('')}
      </dl>
    </div>
  </section>
`;

export const initFaq = (root) => {
  if (!root) return;
  const items = root.querySelectorAll('.faq__item');

  items.forEach((details) => {
    const summary = details.querySelector('.faq__q');
    const panel   = details.querySelector('.faq__a-outer');
    if (!summary || !panel) return;

    summary.addEventListener('click', (e) => {
      e.preventDefault();

      if (details.open) {
        // -------- Close --------
        // Lock current height, flush, then animate to 0.
        panel.style.height  = panel.scrollHeight + 'px';
        panel.style.opacity = '1';
        requestAnimationFrame(() => {
          panel.style.height  = '0px';
          panel.style.opacity = '0';
        });
        setTimeout(() => {
          details.open = false;
          panel.style.height  = '';
          panel.style.opacity = '';
        }, CLOSE_DURATION);
      } else {
        // -------- Open --------
        details.open = true;                     // reveal content so we can measure
        const target = panel.scrollHeight;
        panel.style.height  = '0px';
        panel.style.opacity = '0';
        requestAnimationFrame(() => {
          panel.style.height  = target + 'px';
          panel.style.opacity = '1';
        });
        setTimeout(() => {
          panel.style.height  = '';            // let natural height take over (handles reflow)
          panel.style.opacity = '';
        }, OPEN_DURATION);
      }
    });
  });
};
