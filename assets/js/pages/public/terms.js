/**
 * terms.js — terms of service.
 * Placeholder — swap in the final text when terms are approved.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container" style="max-width: 72ch;">
      <h1>Terms of Service</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">Last updated: pending</p>

      <h2 style="margin-top: var(--space-lg);">Bookings</h2>
      <p>Bookings are a reservation of time, not a contract of sale. Pricing is confirmed at the chair before service begins.</p>

      <h2 style="margin-top: var(--space-lg);">Cancellations &amp; no-shows</h2>
      <p>Please cancel at least two hours before your slot. Repeated no-shows may be declined future bookings.</p>

      <h2 style="margin-top: var(--space-lg);">Content ownership</h2>
      <p>All photography, imagery and written content on this site is the property of ClipperCartel. Reuse requires written permission.</p>

      <h2 style="margin-top: var(--space-lg);">Changes</h2>
      <p>These terms may be updated. The current version always lives at this URL.</p>
    </section>
  `;
};
