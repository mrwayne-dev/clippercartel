/**
 * reviews.js — client reviews.
 * Will source from an admin-managed reviews table.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>Reviews</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        What clients say after sitting in the chair.
      </p>
    </section>
  `;
};
