/**
 * faq.js — frequently asked questions.
 */
export default async (mount) => {
  mount.innerHTML = `
    <section class="section container">
      <h1>FAQ</h1>
      <p style="color: var(--color-text-muted); margin-top: var(--space-sm);">
        Questions land once the shop's policy copy comes through.
      </p>
    </section>
  `;
};
