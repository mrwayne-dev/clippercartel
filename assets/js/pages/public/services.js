/**
 * services.js — the /services page.
 *
 * Flow: Hero -> service grid (6) -> 'not on the list?' custom-cuts
 * callout -> FAQ accordion -> Final CTA.
 *
 * Service names picked to match what each photo actually shows (no
 * blind labels). Copy uses the first-person 'I' because the shop is
 * run by a single barber.
 *
 * Images are picked from the gallery pool with no overlap with the
 * home-page services teaser (which uses gallery3/5/7/9).
 *
 * Content note: both service and FAQ copy are editorial placeholders
 * the shop can revise. Swap for /api/services.php once admin lands.
 */

import { observeReveal }    from '../../utils/reveal.js';
import { mountFinalCta }    from '../../components/final-cta.js';
import { renderFaq, initFaq } from '../../components/faq.js';
import { applyParallax }    from '../../lib/parallax.js';
import { waLink }           from '../../services/shop.js';

const services = [
  { name: 'Low Cut',      note: 'A clean, close finish. The everyday standard.',            image: '/assets/images/gallery/gallery4.webp'  },
  { name: 'Fade',         note: 'Taper, mid or skin. Sharp line to close.',                 image: '/assets/images/gallery/galler2.webp'   },
  { name: 'Design',       note: 'Custom shapes cut sharp. Bring the idea, I match it.',     image: '/assets/images/gallery/gallery8.webp'  },
  { name: 'Colour',       note: 'Dye, tips, highlights. Bold or subtle, your call.',        image: '/assets/images/gallery/galler12.webp'  },
  { name: 'Beard Sculpt', note: 'Shape, trim, define. Face framed right.',                  image: '/assets/images/gallery/galler14.webp'  },
  { name: 'Kids',         note: 'All ages. Patient hands, calm chair.',                     image: '/assets/images/gallery/gallery15.webp' },
];

const faqItems = [
  { q: 'Can I bring a reference photo?',
    a: 'Yes. Pull up the picture, I match it. The clearer the pic, the sharper the finish.' },
  { q: 'Do you cut kids?',
    a: 'All ages. Even the ones who no fit sit still.' },
  { q: 'What if I need to reschedule or run late?',
    a: 'Message me on WhatsApp before your slot. Two hours of notice is kind; if it is tighter, let me know and I will try to squeeze you in.' },
  { q: 'Do you take walk-ins?',
    a: 'If a chair is open, yes. If you are coming far, book ahead so the trip does not waste.' },
  { q: 'How long does a cut take?',
    a: 'Twenty to forty-five minutes depending on the style. Longer for braids, twists, locs.' },
  { q: 'Do you do house calls?',
    a: 'On request. Message me on WhatsApp with the location and I will quote you.' },
  { q: 'My style is not on this list. Can you still do it?',
    a: 'Almost certainly. Everything under barbing lives here: braids, dreads, fades, designs, treatments. If you have seen it, I can cut it. Ask on WhatsApp first if you want to be sure.' },
];

const serviceCard = (s, i) => `
  <article class="service-card" data-reveal="${i % 2 === 0 ? 'fade-right' : 'fade-left'}" style="--reveal-delay: ${(i % 2) + 1}">
    <figure class="service-card__media">
      <img
        src="${s.image}"
        alt="A ${s.name} at ClipperCartel"
        loading="lazy"
        decoding="async"
        data-parallax="40"
      >
      <span class="service-card__index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    </figure>
    <h2 class="service-card__name">${s.name}</h2>
    <p class="service-card__note">${s.note}</p>
    <a href="/book" class="service-card__cta">
      Book this
      <span aria-hidden="true">→</span>
    </a>
  </article>
`;

const render = () => `
  <div class="services-page">

    <!-- Hero -->
    <section class="services-page__hero" aria-labelledby="services-page-heading">
      <div class="services-page__hero-inner container">
        <h1 class="services-page__title" id="services-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          Everything, <em>basically</em>.
        </h1>
        <p class="services-page__sub" data-reveal style="--reveal-delay: 2">
          A menu to anchor on. Every chair is custom. If you have seen a cut you want, bring the reference. Everything under barbing lives here.
        </p>
      </div>
    </section>

    <!-- Grid of 6 service cards -->
    <section class="services-page__grid-section">
      <div class="container">
        <div class="services-page__grid">
          ${services.map(serviceCard).join('')}
        </div>
      </div>
    </section>

    <!-- Custom-cuts callout (warm soft bg) -->
    <section class="services-page__callout" aria-label="Custom cuts">
      <div class="services-page__callout-inner container">
        <h3 class="services-page__callout-title" data-reveal="clip" style="--reveal-delay: 1">
          If you can describe it, <em>I can cut it</em>.
        </h3>
        <p class="services-page__callout-sub" data-reveal style="--reveal-delay: 2">
          Braids, dreads, designs, treatments. Anything under barbing. Message me first if you want to be sure.
        </p>
        <a href="${waLink('Hi, I have a custom cut in mind. Can you do it?')}" class="services-page__callout-cta btn btn-accent" rel="noopener" target="_blank" data-reveal style="--reveal-delay: 3">
          Ask on WhatsApp
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>

  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  // FAQ accordion (reusable component, also used on /faq later).
  mount.insertAdjacentHTML('beforeend', renderFaq({
    eyebrow:   '',
    title:     'Fair <em>ones</em>.',
    items:     faqItems,
    headingId: 'services-faq-heading',
  }));
  initFaq(mount.querySelector('.faq-section'));

  // Closing CTA (shared with home).
  mountFinalCta(mount);

  observeReveal(mount);
  applyParallax(mount);
};
