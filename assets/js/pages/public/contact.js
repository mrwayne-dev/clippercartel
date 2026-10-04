/**
 * contact.js — contact form.
 *
 * Posts to /api/contact.php. Honeypot + Turnstile wire in once the
 * shop's Turnstile sitekey lands in config.
 */

import { api, toast } from '../../services/api.js';

export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>Contact</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">Send a message. We'll get back to you.</p>

      <form id="contact-form" style="max-width: 520px; margin-top: var(--space-lg);" novalidate>
        <div class="field">
          <label for="c-name">Name</label>
          <input id="c-name" name="name" type="text" required autocomplete="name" />
        </div>
        <div class="field">
          <label for="c-email">Email</label>
          <input id="c-email" name="email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="c-subject">Subject</label>
          <input id="c-subject" name="subject" type="text" />
        </div>
        <div class="field">
          <label for="c-message">Message</label>
          <textarea id="c-message" name="message" rows="5" required></textarea>
        </div>

        <!-- honeypot: real users never see this; bots fill everything -->
        <div class="hp-field" aria-hidden="true">
          <label>Leave this field empty</label>
          <input type="text" name="website" tabindex="-1" autocomplete="off" />
        </div>

        <button class="btn btn-primary" type="submit">Send message</button>
      </form>
    </section>
  `;

  const form = mount.querySelector('#contact-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await api.post('/contact.php', data);
      form.reset();
      toast('Message sent — we\'ll be in touch.');
    } catch (err) {
      toast(err.message || 'Could not send. Try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send message';
    }
  });
};
