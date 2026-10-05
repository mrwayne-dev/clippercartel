/**
 * privacy.js — the /privacy page.
 *
 * Editorial layout: hero + narrow prose column + quiet closer.
 * Voice: first-person 'I' (single-barber shop). All copy is
 * placeholder the shop can rewrite without touching layout.
 */

import { observeReveal } from '../../utils/reveal.js';

export default async (mount) => {
  mount.innerHTML = `
    <div class="legal-page">

      <section class="legal-page__hero" aria-labelledby="privacy-heading">
        <div class="legal-page__hero-inner container">
          <p class="legal-page__eyebrow" data-reveal>Privacy</p>
          <h1 class="legal-page__title" id="privacy-heading" data-reveal="clip" style="--reveal-delay: 1">
            What I <em>keep</em>.
          </h1>
          <p class="legal-page__updated" data-reveal style="--reveal-delay: 2">Last updated: pending</p>
        </div>
      </section>

      <section class="legal-page__content">
        <div class="container">
          <article class="legal-page__prose" data-reveal>

            <section>
              <h2>What I collect</h2>
              <p>When you book a chair or send a message I collect: your name, phone number, email address, and the message you send. That is all.</p>
            </section>

            <section>
              <h2>How I use it</h2>
              <p>Your details are used only to confirm bookings, send reminders, and reply to messages. I do not sell data, I do not share it with marketing partners, and I do not profile anyone.</p>
            </section>

            <section>
              <h2>WhatsApp confirmations</h2>
              <p>Booking confirmations are sent via WhatsApp Business. If you prefer not to receive messages on WhatsApp, choose email at booking time and I will send the confirmation that way instead.</p>
            </section>

            <section>
              <h2>Cookies</h2>
              <p>This site uses one session cookie, strictly to prevent form spam. No tracking, no analytics cookies, no third-party tags.</p>
            </section>

            <section>
              <h2>Your rights</h2>
              <p>You can ask me to delete your record from the booking system at any time. Reach me via <a href="/contact">the contact form</a> or on WhatsApp.</p>
            </section>

            <section>
              <h2>Questions</h2>
              <p>For anything privacy-related, message me on WhatsApp or send a note through <a href="/contact">/contact</a>.</p>
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
