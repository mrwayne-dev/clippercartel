/**
 * home.js — landing page.
 * Content intentionally minimal until design direction lands.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1 style="font-size: var(--text-hero); margin-bottom: var(--space-md);">ClipperCartel</h1>
      <p style="font-size: var(--text-lg); color: var(--color-text-muted); max-width: 60ch; margin-bottom: var(--space-lg);">
        Precision cuts, hot-towel shaves and beard sculpts. Book your chair.
      </p>
      <div style="display:flex; gap: var(--space-md); flex-wrap: wrap;">
        <a href="/book" class="btn btn-primary">Book your chair</a>
        <a href="/services" class="btn btn-ghost">See services</a>
      </div>
    </section>
  `;
};
