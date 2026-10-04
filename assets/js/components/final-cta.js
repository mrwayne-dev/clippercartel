/**
 * final-cta.js — home section 08.
 *
 * Closing moment of the home page. Dark surface — the only dark
 * section — so it reads as a definitive endpoint before the footer
 * continues the dark background through the bottom of the page.
 *
 * Centre-aligned big italic headline, two CTAs below (Book + WhatsApp),
 * one line of shop meta beneath.
 */

import { shop, waLink } from '../services/shop.js';
import { observeReveal } from '../utils/reveal.js';

const render = () => {
  const phone = shop.phone();
  const hours = shop.hours();

  return `
  <section class="final-cta section" data-surface="dark" aria-labelledby="final-cta-heading">
    <div class="final-cta__inner container">
      <h2 class="final-cta__title" id="final-cta-heading" data-reveal>
        Your chair
        <em>is waiting.</em>
      </h2>
      <div class="final-cta__actions" data-reveal style="--reveal-delay: 1">
        <a href="/book" class="btn btn-accent final-cta__btn">Book your chair</a>
        ${shop.whatsapp() ? `
          <a href="${waLink("Hi, I'd like to book a chair.")}" class="btn btn-outline final-cta__btn" rel="noopener" target="_blank">WhatsApp us</a>
        ` : ''}
      </div>
      ${phone || hours ? `
        <p class="final-cta__meta" data-reveal style="--reveal-delay: 2">
          ${[phone, hours].filter(Boolean).join('  ·  ')}
        </p>
      ` : ''}
    </div>
  </section>
  `;
};

export const mountFinalCta = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.final-cta'));
};
