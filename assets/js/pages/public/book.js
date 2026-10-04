/**
 * book.js — booking widget.
 * Full flow (service → slot → details → confirm) lands in the booking phase.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>Book Your Chair</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        The booking widget wires up in the next phase. Confirmation sent via WhatsApp.
      </p>
    </section>
  `;
};
