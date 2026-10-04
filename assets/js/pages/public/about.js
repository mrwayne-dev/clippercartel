/**
 * about.js — shop story + single-operator bio.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>About</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm); max-width: 60ch;">
        The story behind the shop. Copy lands with shop details.
      </p>
    </section>
  `;
};
