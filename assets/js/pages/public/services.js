/**
 * services.js — the /services page.
 *
 * Flow: Hero → service grid (6) → 'not on the list?' custom-cuts
 * callout → FAQ accordion → Final CTA.
 *
 * Service names + descriptions use broad categories rather than
 * specific titles — the message is 'everything, basically'. Light
 * Port Harcourt / Nigerian slang in the copy where it reads
 * naturally (not forced), so visitors from elsewhere still parse it.
 *
 * Images are picked from the gallery pool with NO overlap with the
 * home-page services teaser (which uses gallery3/5/7/9).
 *
 * Content note: both service and FAQ copy are editorial placeholders
 * the shop can revise. Swap for /api/services.php once admin lands.
 */

import { observeReveal } from '../../utils/reveal.js';
import { mountFinalCta } from '../../components/final-cta.js';
import { renderFaq }     from '../../components/faq.js';
import { applyParallax } from '../../lib/parallax.js';
import { waLink }        from '../../services/shop.js';

const services = [
  { name: 'Low Cut',          note: 'The everyday standard. Clean, close, freshy.',             image: '/assets/images/gallery/gallery4.jpeg'  },
  { name: 'Fade',             note: 'Taper, mid or skin — sharp sharp.',                        image: '/assets/images/gallery/gallery8.jpeg'  },
  { name: 'Waves',            note: '360 na the target. We get you there with the right pattern.', image: '/assets/images/gallery/galler12.jpeg' },
  { name: 'Line-Up',          note: 'A line that holds through the week. Crisp edge, no shake.', image: '/assets/images/gallery/gallery15.jpeg' },
  { name: 'Beard Sculpt',     note: 'Shape, trim and define. Your face, framed right.',          image: '/assets/images/gallery/gallery13.jpeg' },
  { name: 'Twists & Locs',    note: 'Starting, maintenance, retwists. No wahala.',               image: '/assets/images/gallery/gallery19.jpeg' },
];

const faqItems = [
  { q: 'Can I bring a reference photo?',
    a: 'Yes — pull up the picture, we match it. The clearer the pic, the sharper the finish.' },
  { q: 'Do you cut kids?',
    a: 'All ages. Even the ones who no fit sit still.' },
  { q: 'What if I need to reschedule or run late?',
    a: 'Message us on WhatsApp before your slot. Two hours of notice is kind; if it is tighter, let us know and we will try to squeeze you in.' },
  { q: 'Do you take walk-ins?',
    a: 'If a chair is open, yes. If you are coming far, book ahead — do not let the trip waste.' },
  { q: 'How long does a cut take?',
    a: 'Twenty to forty-five minutes depending on the style. Longer for braids, twists, locs.' },
  { q: 'Do you do house calls?',
    a: 'On request. Message us on WhatsApp with the location and we will quote you.' },
  { q: 'My style is not on this list — can you still do it?',
    a: 'Almost certainly. Everything under barbing lives here — braids, dreads, fades, designs, treatments. If you have seen it, we can cut it. Ask on WhatsApp first if you want to be sure.' },
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
        <p class="services-page__eyebrow" data-reveal>The menu</p>
        <h1 class="services-page__title" id="services-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          Everything, <em>basically</em>.
        </h1>
        <p class="services-page__sub" data-reveal style="--reveal-delay: 2">
          A menu to anchor on. But every chair is custom — if you have seen a cut you want, bring the reference. Everything under barbing lives here.
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
        <p class="services-page__callout-eyebrow" data-reveal>Not on the list?</p>
        <h3 class="services-page__callout-title" data-reveal="clip" style="--reveal-delay: 1">
          If you can describe it, <em>we can cut it</em>.
        </h3>
        <p class="services-page__callout-sub" data-reveal style="--reveal-delay: 2">
          Braids, dreads, designs, treatments — anything under barbing. Message us first if you want to be sure.
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

  // FAQ accordion (reusable component — also used on /faq later).
  mount.insertAdjacentHTML('beforeend', renderFaq({
    eyebrow:   'Questions',
    title:     'Fair <em>ones</em>.',
    items:     faqItems,
    headingId: 'services-faq-heading',
  }));

  // Closing CTA (shared with home).
  mountFinalCta(mount);

  observeReveal(mount);
  applyParallax(mount);
};
