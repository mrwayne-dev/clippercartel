/**
 * faq.js — reusable FAQ accordion.
 *
 * Native <details><summary> markup so the control is accessible by
 * default (keyboard, screen readers). CSS handles the +/× indicator
 * rotation.
 *
 * Usage:
 *   mount.insertAdjacentHTML('beforeend', renderFaq({
 *     eyebrow: 'FAQ',
 *     title:   'Questions, <em>fair ones</em>.',
 *     items: [
 *       { q: 'Question?', a: 'Answer.' },
 *       ...
 *     ],
 *   }));
 *
 * The <h2> is wrapped in a <header class="faq__header"> so pages can
 * target spacing/padding around it without touching the component.
 * Pass `headingId` so the parent <section> can aria-labelledby it.
 */

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
            <div class="faq__a">
              <p>${item.a}</p>
            </div>
          </details>
        `).join('')}
      </dl>
    </div>
  </section>
`;
