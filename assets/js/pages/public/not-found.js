/**
 * not-found.js — 404 page module. Served by the router for unknown paths.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container" style="text-align:center;">
      <p style="font-family: var(--font-display); font-size: var(--text-hero); line-height: 1;">404</p>
      <h1 style="margin-top: var(--space-md);">Page not found</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        Couldn't find what you were looking for.
      </p>
      <div style="margin-top: var(--space-lg); display:inline-flex; gap: var(--space-md);">
        <a href="/" class="btn btn-primary">Back home</a>
        <a href="/book" class="btn btn-ghost">Book a chair</a>
      </div>
    </section>
  `;
};
