/**
 * contact.js — the /contact page.
 *
 * Flow: Hero → form + info split (map on the right) → Final CTA.
 *
 * Form posts to /api/contact.php which runs honeypot → Turnstile →
 * rate-limit → validate → mail (shop + auto-reply). Hardened in
 * phase 1 and still the same backend.
 *
 * Voice: 'I' (single-barber shop).
 */

import { api, toast }     from '../../services/api.js';
import { observeReveal }  from '../../utils/reveal.js';
import { mountFinalCta }  from '../../components/final-cta.js';
import { shop, telLink, waLink } from '../../services/shop.js';

const render = () => {
  const addressFull  = shop.address();
  const addressLines = addressFull.split(',').map(s => s.trim()).filter(Boolean);
  const mapQuery     = encodeURIComponent(addressFull);

  const socials = [
    { href: shop.instagram(), label: 'Instagram' },
    { href: shop.tiktok(),    label: 'TikTok'    },
    { href: shop.snapchat(),  label: 'Snapchat'  },
    { href: shop.facebook(),  label: 'Facebook'  },
  ].filter((s) => s.href);

  return `
  <div class="contact-page">

    <!-- Hero -->
    <section class="contact-page__hero" aria-labelledby="contact-page-heading">
      <div class="contact-page__hero-inner container">
        <p class="contact-page__eyebrow" data-reveal>Reach me</p>
        <h1 class="contact-page__title" id="contact-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          Send a <em>line</em>.
        </h1>
        <p class="contact-page__sub" data-reveal style="--reveal-delay: 2">
          Questions, bookings, custom cuts. Fastest answer is WhatsApp; email works too.
        </p>
      </div>
    </section>

    <!-- Form + info split -->
    <section class="contact-page__main">
      <div class="contact-page__main-inner container">

        <!-- Form -->
        <form id="contact-form" class="contact-page__form" novalidate data-reveal="fade-right">
          <p class="contact-page__col-label">Write me</p>

          <div class="field">
            <label for="c-name">Name</label>
            <input id="c-name" name="name" type="text" required autocomplete="name">
          </div>
          <div class="field">
            <label for="c-email">Email</label>
            <input id="c-email" name="email" type="email" required autocomplete="email">
          </div>
          <div class="field">
            <label for="c-subject">Subject <span class="field__optional">(optional)</span></label>
            <input id="c-subject" name="subject" type="text">
          </div>
          <div class="field">
            <label for="c-message">Message</label>
            <textarea id="c-message" name="message" rows="5" required></textarea>
          </div>

          <!-- Honeypot -->
          <div class="hp-field" aria-hidden="true">
            <label>Leave this field empty</label>
            <input type="text" name="website" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="btn btn-accent contact-page__submit">
            Send message
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <!-- Info -->
        <aside class="contact-page__info" data-reveal="fade-left" style="--reveal-delay: 1">
          <p class="contact-page__col-label">Direct</p>

          <ul class="contact-page__direct">
            ${shop.phone() ? `
              <li>
                <a href="${telLink()}">
                  <span class="contact-page__direct-label">Call</span>
                  <span class="contact-page__direct-value">${shop.phone()}</span>
                </a>
              </li>` : ''}
            ${shop.whatsapp() ? `
              <li>
                <a href="${waLink("Hi, I'd like to book a chair.")}" rel="noopener" target="_blank">
                  <span class="contact-page__direct-label">WhatsApp</span>
                  <span class="contact-page__direct-value">Message me <span aria-hidden="true">↗</span></span>
                </a>
              </li>` : ''}
          </ul>

          ${socials.length ? `
            <p class="contact-page__col-label contact-page__col-label--mt">Follow</p>
            <ul class="contact-page__socials">
              ${socials.map(s => `
                <li>
                  <a href="${s.href}" rel="noopener" target="_blank">
                    ${s.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              `).join('')}
            </ul>` : ''}

          <p class="contact-page__col-label contact-page__col-label--mt">Visit</p>
          <address class="contact-page__address">
            ${addressLines.map(line => `<span>${line}</span>`).join('')}
          </address>
          ${shop.hours() ? `<p class="contact-page__hours">${shop.hours()}</p>` : ''}

          <div class="contact-page__map">
            <iframe
              src="https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed"
              title="ClipperCartel on Google Maps"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </aside>

      </div>
    </section>

  </div>
  `;
};

export default async (mount) => {
  mount.innerHTML = render();

  // Submit handler
  const form = mount.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const originalLabel = btn.innerHTML;
      btn.innerHTML = 'Sending…';

      const data = Object.fromEntries(new FormData(form).entries());
      try {
        await api.post('/contact.php', data);
        form.reset();
        toast("Message sent. I'll be in touch.");
      } catch (err) {
        toast(err.message || 'Could not send. Try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalLabel;
      }
    });
  }

  // Closing CTA (shared).
  mountFinalCta(mount);

  observeReveal(mount);
};
