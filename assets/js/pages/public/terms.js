/**
 * terms.js — the /terms page.
 *
 * Editorial layout mirror of /privacy. Voice: first-person 'I'
 * (single-barber shop). All copy is placeholder the shop can
 * rewrite without touching layout.
 */

import { observeReveal } from '../../utils/reveal.js';

export default async (mount) => {
  mount.innerHTML = `
    <div class="legal-page">

      <section class="legal-page__hero" aria-labelledby="terms-heading">
        <div class="legal-page__hero-inner container">
          <h1 class="legal-page__title" id="terms-heading" data-reveal="clip" style="--reveal-delay: 1">
            The <em>agreement</em>.
          </h1>
          <p class="legal-page__updated" data-reveal style="--reveal-delay: 2">Last updated: pending</p>
        </div>
      </section>

      <section class="legal-page__content">
        <div class="container">
          <article class="legal-page__prose" data-reveal>

            <section>
              <h2>About these terms</h2>
              <p>By booking a chair or using this site, you agree to the terms below. Simple ones. The kind of agreement that should fit on one page.</p>
            </section>

            <section>
              <h2>Bookings</h2>
              <p>Booking a chair reserves time; it is not a prepayment or a binding contract of sale. The price for your cut is confirmed at the chair before service begins.</p>
            </section>

            <section>
              <h2>Cancellations and no-shows</h2>
              <p>Please cancel at least two hours before your slot. Repeated no-shows may be declined future bookings.</p>
            </section>

            <section>
              <h2>Pricing</h2>
              <p>Service prices are set at my discretion and may change without notice. The final price is always confirmed at the chair before any service begins.</p>
            </section>

            <section>
              <h2>Service limitations</h2>
              <p>I reserve the right to decline service that would risk injury, that falls outside my skill set, or that would compromise the shop. For custom work or unusual requests, message ahead so I can confirm.</p>
            </section>

            <section>
              <h2>In the shop</h2>
              <p>The shop is a quiet, professional space. I reserve the right to end a session if a client is abusive, intoxicated to the point of incapacity, or otherwise disruptive to others.</p>
            </section>

            <section>
              <h2>Content ownership</h2>
              <p>Photography, imagery, text, and branding on this site belong to ClipperCartel. Reuse requires written permission.</p>
            </section>

            <section>
              <h2>Changes</h2>
              <p>These terms may be revised. The current version always lives at this URL. Material changes carry an updated 'Last updated' date above.</p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>Questions about anything here? Message me on WhatsApp or send a note through <a href="/contact">/contact</a>.</p>
            </section>

          </article>
        </div>
      </section>

      <section class="legal-page__closer">
        <div class="legal-page__closer-inner container">
          <a href="/"><span aria-hidden="true">←</span> Back home</a>
          <a href="/contact">Message me <span aria-hidden="true">→</span></a>
        </div>
      </section>

    </div>
  `;

  observeReveal(mount);
};
