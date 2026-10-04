/**
 * gallery.js — portfolio grid.
 * Pulls from /api/gallery.php once admin uploads land.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>Gallery</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        Recent cuts from the chair.
      </p>
    </section>
  `;
};
