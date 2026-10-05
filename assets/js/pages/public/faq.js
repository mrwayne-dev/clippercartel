/**
 * faq.js — the /faq page.
 *
 * Flow: Hero → full FAQ accordion → Final CTA.
 *
 * Uses the reusable FAQ component (components/faq.js). Voice is
 * first-person 'I' (single-barber shop). Copy is editorial
 * placeholder the shop can rewrite without touching layout.
 */

import { observeReveal }      from '../../utils/reveal.js';
import { mountFinalCta }      from '../../components/final-cta.js';
import { renderFaq, initFaq } from '../../components/faq.js';
import { waLink }             from '../../services/shop.js';

const items = [
  { q: 'How do I book a chair?',
    a: 'Easiest route is WhatsApp. Message me with the style you want, your preferred day, and a reference photo if you have one. You will get a confirmation back with the slot.' },

  { q: 'Can I bring a reference photo?',
    a: 'Yes. Pull up the picture, I match it. The clearer the pic, the sharper the finish.' },

  { q: 'What if I need to reschedule or run late?',
    a: 'Message me on WhatsApp before your slot. Two hours of notice is kind; if it is tighter, let me know and I will try to squeeze you in.' },

  { q: 'Do you take walk-ins?',
    a: 'If a chair is open, yes. If you are coming far, book ahead so the trip does not waste.' },

  { q: 'My style is not on your menu. Can you still do it?',
    a: 'Almost certainly. Everything under barbing lives here: braids, dreads, fades, designs, colour, treatments, beard work. If you have seen it, I can cut it. Ask on WhatsApp first if you want to be sure.' },

  { q: 'Do you cut kids?',
    a: 'All ages. Even the ones who no fit sit still.' },

  { q: 'How long does a cut take?',
    a: 'Twenty to forty-five minutes for most cuts. Longer for braids, twists, locs, or colour.' },

  { q: 'Do you do house calls?',
    a: 'On request. Message me on WhatsApp with the location and I will quote you.' },

  { q: 'Where is the shop?',
    a: '18 Ada George Road, Port Harcourt. The shop front carries the ClipperCartel sign.' },

  { q: 'What are the opening hours?',
    a: 'Monday to Saturday, 09:00 to 20:00. Sunday is closed.' },

  { q: 'How do I pay?',
    a: 'Cash or bank transfer at the chair. No deposits required.' },

  { q: 'Can I buy products at the shop?',
    a: 'A small selection of care products is on the shelf. If you want something specific, message ahead and I will check stock.' },
];

const render = () => `
  <div class="faq-page">
    <section class="faq-page__hero" aria-labelledby="faq-page-heading">
      <div class="faq-page__hero-inner container">
        <p class="faq-page__eyebrow" data-reveal>FAQ</p>
        <h1 class="faq-page__title" id="faq-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          Fair <em>questions</em>.
        </h1>
        <p class="faq-page__sub" data-reveal style="--reveal-delay: 2">
          Short answers to the ones that come up most. Still stuck?
          <a href="${waLink('Hi, I have a question about ClipperCartel.')}" rel="noopener" target="_blank" class="faq-page__wa-link">Message me on WhatsApp</a>.
        </p>
      </div>
    </section>
  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  // FAQ accordion (reusable component).
  mount.insertAdjacentHTML('beforeend', renderFaq({
    eyebrow:   '',                      // page already has 'FAQ' eyebrow in hero; keep section header clean
    title:     'Everything, straight <em>up</em>.',
    items,
    headingId: 'faq-page-accordion',
    idPrefix:  'faqpage',
  }));
  initFaq(mount.querySelector('.faq-section'));

  // Closing CTA (shared).
  mountFinalCta(mount);

  observeReveal(mount);
};
