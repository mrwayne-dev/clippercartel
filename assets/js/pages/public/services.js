/**
 * services.js — service menu + pricing.
 * Will pull from /api/services.php once the admin backend lands.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>Services</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        The menu will populate from the admin panel once services are entered.
      </p>
    </section>
  `;
};
