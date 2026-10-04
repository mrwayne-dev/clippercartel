/**
 * privacy.js — privacy policy.
 * Placeholder — swap in the final text when policy is approved.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container" style="max-width: 72ch;">
      <h1>Privacy Policy</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">Last updated: pending</p>

      <h2 style="margin-top: var(--space-lg);">What we collect</h2>
      <p>When you book or contact us we collect: name, phone, email, and the message you send. Nothing more.</p>

      <h2 style="margin-top: var(--space-lg);">How we use it</h2>
      <p>Your details are used only to confirm bookings, send reminders, and reply to messages. We don't sell data, we don't share it with marketing partners, and we don't profile you.</p>

      <h2 style="margin-top: var(--space-lg);">WhatsApp confirmations</h2>
      <p>Booking confirmations are sent via WhatsApp Business. Opting out at booking time switches you to email only.</p>

      <h2 style="margin-top: var(--space-lg);">Cookies</h2>
      <p>This site uses one session cookie, strictly to prevent form spam. No tracking, no analytics cookies.</p>

      <h2 style="margin-top: var(--space-lg);">Your rights</h2>
      <p>You can ask us to delete your record from our booking system at any time. Email us via <a href="/contact">the contact form</a>.</p>
    </section>
  `;
};
