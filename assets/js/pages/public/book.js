/**
 * book.js — the /book page.
 *
 * Flow: Hero → intake form + info sidebar → footer.
 *
 * On submit the form POSTs to /api/booking.php. The endpoint saves
 * the booking (status='pending'), notifies the owner on WhatsApp,
 * and returns an 8-char confirmation code. The owner then confirms
 * the slot + price over WhatsApp.
 *
 * Voice: first-person 'I' (single-barber shop).
 */

import { api, toast }     from '../../services/api.js';
import { observeReveal }  from '../../utils/reveal.js';
import { shop, telLink, waLink } from '../../services/shop.js';

const services = [
  'Low Cut',
  'Fade',
  'Design',
  'Colour',
  'Beard Sculpt',
  'Kids',
  'Custom / Other',
];

/* Time slots: every 30 min inside the shop's working window. */
const slots = (() => {
  const out = [];
  for (let h = 9; h < 20; h += 1) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;              // 09:00 … 19:30
})();

/* min date = today, max = +90 days — guards against obvious nonsense. */
const today = new Date();
const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};
const toISO = (d) => d.toISOString().slice(0, 10);

const render = () => `
  <div class="book-page">

    <!-- Hero -->
    <section class="book-page__hero" aria-labelledby="book-page-heading">
      <div class="book-page__hero-inner container">
        <p class="book-page__eyebrow" data-reveal>Book</p>
        <h1 class="book-page__title" id="book-page-heading" data-reveal="clip" style="--reveal-delay: 1">
          Reserve the <em>chair</em>.
        </h1>
        <p class="book-page__sub" data-reveal style="--reveal-delay: 2">
          Fill in the details below. The final yes happens on WhatsApp — I confirm the slot and the price before anything is locked in.
        </p>
      </div>
    </section>

    <!-- Form + info split -->
    <section class="book-page__main">
      <div class="book-page__main-inner container">

        <form id="book-form" class="book-form" novalidate data-reveal="fade-right">

          <fieldset class="book-form__group">
            <legend class="book-form__legend">01 — You</legend>
            <div class="field">
              <label for="b-name">Name</label>
              <input id="b-name" name="name" type="text" required autocomplete="name" placeholder="How I should greet you">
            </div>
            <div class="field">
              <label for="b-phone">Phone <span class="field__optional">(for WhatsApp)</span></label>
              <input id="b-phone" name="phone" type="tel" required autocomplete="tel" placeholder="e.g. 0912 345 6789">
            </div>
          </fieldset>

          <fieldset class="book-form__group">
            <legend class="book-form__legend">02 — The cut</legend>
            <div class="book-form__chips" role="radiogroup" aria-label="Pick a service">
              ${services.map((s, i) => `
                <label class="book-form__chip">
                  <input type="radio" name="service" value="${s}" ${i === 0 ? 'checked' : ''} required>
                  <span>${s}</span>
                </label>
              `).join('')}
            </div>
          </fieldset>

          <fieldset class="book-form__group">
            <legend class="book-form__legend">03 — Preferred time</legend>
            <div class="book-form__row">
              <div class="field">
                <label for="b-date">Date</label>
                <input id="b-date" name="date" type="date" required min="${toISO(today)}" max="${toISO(addDays(today, 90))}">
              </div>
              <div class="field">
                <label for="b-time">Time</label>
                <select id="b-time" name="time" required>
                  ${slots.map((t) => `<option value="${t}">${t}</option>`).join('')}
                </select>
              </div>
            </div>
            <p class="book-form__hint">Mon–Sat 09:00–20:00. Sundays closed.</p>
          </fieldset>

          <fieldset class="book-form__group">
            <legend class="book-form__legend">04 — Anything else? <span class="book-form__legend-opt">(optional)</span></legend>
            <div class="field">
              <label class="sr-only" for="b-notes">Notes</label>
              <textarea id="b-notes" name="notes" rows="4" placeholder="A reference photo you'll bring, a style request, anything I should know."></textarea>
            </div>
          </fieldset>

          <!-- Honeypot: real users never see this -->
          <div class="hp-field" aria-hidden="true">
            <label>Leave this field empty</label>
            <input type="text" name="website" tabindex="-1" autocomplete="off">
          </div>

          <button type="submit" class="btn btn-accent book-form__submit">
            Request this chair
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <!-- Info panel -->
        <aside class="book-info" data-reveal="fade-left" style="--reveal-delay: 1">

          <p class="book-info__eyebrow">How it works</p>
          <ol class="book-info__steps">
            <li><span class="book-info__step-num">01</span><p>Fill in your details, pick a cut and a time.</p></li>
            <li><span class="book-info__step-num">02</span><p>Submit — the request lands on my WhatsApp straight away.</p></li>
            <li><span class="book-info__step-num">03</span><p>I confirm the slot and the price. Your chair is sealed.</p></li>
          </ol>

          <p class="book-info__eyebrow book-info__eyebrow--mt">Rather just message?</p>
          <ul class="book-info__direct">
            ${shop.whatsapp() ? `<li><a href="${waLink("Hi, I'd like to book a chair.")}" rel="noopener" target="_blank">WhatsApp me <span aria-hidden="true">↗</span></a></li>` : ''}
            ${shop.phone()    ? `<li><a href="${telLink()}">Call ${shop.phone()}</a></li>` : ''}
          </ul>

          <p class="book-info__note">
            No deposit required. Pricing is confirmed at the chair before service begins.
          </p>

        </aside>

      </div>
    </section>

  </div>
`;

export default async (mount) => {
  mount.innerHTML = render();

  const form = mount.querySelector('#book-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Light client-side validation (native required attributes do the rest)
      if (!form.reportValidity()) return;

      const btn           = form.querySelector('button[type="submit"]');
      const originalLabel = btn.innerHTML;
      btn.disabled        = true;
      btn.innerHTML       = 'Sending…';

      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const res = await api.post('/booking.php', data);
        form.reset();
        const code = res?.confirmation_code ? ` · ${res.confirmation_code}` : '';
        toast(`Booking received${code}. I'll confirm on WhatsApp shortly.`);
      } catch (err) {
        toast(err.message || 'Could not send the booking. Try again.', 'error');
      } finally {
        btn.disabled  = false;
        btn.innerHTML = originalLabel;
      }
    });
  }

  observeReveal(mount);
};
