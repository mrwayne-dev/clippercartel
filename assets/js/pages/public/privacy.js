/**
 * privacy.js — privacy policy.
 * Placeholder. Replace with the shop's final text when it's approved.
 * Voice: single barber (I / me), consistent with the rest of the site.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container" style="max-width: 72ch;">
      <h1>Privacy Policy</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">Last updated: pending</p>

      <h2 style="margin-top: var(--space-lg);">What I collect</h2>
      <p>When you book or send a message I collect: name, phone, email, and the message you send. Nothing more.</p>

      <h2 style="margin-top: var(--space-lg);">How I use it</h2>
      <p>Your details are used only to confirm bookings, send reminders, and reply to messages. I don't sell data, I don't share it with marketing partners, and I don't profile anyone.</p>

      <h2 style="margin-top: var(--space-lg);">WhatsApp confirmations</h2>
      <p>Booking confirmations are sent via WhatsApp Business. Opting out at booking time switches you to email only.</p>

      <h2 style="margin-top: var(--space-lg);">Cookies</h2>
      <p>This site uses one session cookie, strictly to prevent form spam. No tracking, no analytics cookies.</p>

      <h2 style="margin-top: var(--space-lg);">Your rights</h2>
      <p>You can ask me to delete your record from the booking system at any time. Reach me via <a href="/contact">the contact form</a>.</p>
    </section>
  `;
};
