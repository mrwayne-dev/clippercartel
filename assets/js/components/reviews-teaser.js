/**
 * reviews-teaser.js — home section 06.
 *
 * Compact header (title left, 'View all reviews →' right) → aggregate
 * rating strip (stars · score · count) → three editorial quote cards.
 *
 * All review data below is PLACEHOLDER. When the admin backend lands
 * and customer-submitted reviews are approved, swap to:
 *   const reviews   = await api.get('/reviews.php?featured=true&limit=3');
 *   const aggregate = await api.get('/reviews/aggregate.php');
 */

import { observeReveal } from '../utils/reveal.js';

const aggregate = {
  rating: 4.9,
  count:  128,
};

const reviews = [
  {
    quote:  'The best fade in Port Harcourt. Hands down.',
    name:   'Chuks O.',
    detail: 'Regular since 2023',
  },
  {
    quote:  'Attention to detail is next level. Never had a cut this clean.',
    name:   'Ada N.',
    detail: 'Monthly client',
  },
  {
    quote:  'Been coming here three years. Never leaves me down.',
    name:   'Tunde A.',
    detail: 'Weekly',
  },
];

// Filled star + empty star by rounded rating value.
const stars = (rating) => {
  const full = Math.round(rating);
  return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
};

const reviewCard = (r, i) => `
  <blockquote class="review" data-reveal style="--reveal-delay: ${i + 1}">
    <p class="review__quote">${r.quote}</p>
    <footer class="review__footer">
      <p class="review__name">${r.name}</p>
      <p class="review__detail">${r.detail}</p>
    </footer>
  </blockquote>
`;

const render = () => `
  <section class="reviews-teaser section" aria-labelledby="reviews-teaser-heading">
    <div class="reviews-teaser__inner container">

      <header class="reviews-teaser__header">
        <h2 class="reviews-teaser__title" id="reviews-teaser-heading" data-reveal>
          Kind <em>words</em>.
        </h2>
        <a href="/reviews" class="reviews-teaser__cta" data-reveal style="--reveal-delay: 1">
          View all reviews
          <span aria-hidden="true">→</span>
        </a>
      </header>

      <div class="reviews-teaser__meta" data-reveal style="--reveal-delay: 1" aria-label="Average rating ${aggregate.rating} out of 5 across ${aggregate.count} reviews">
        <span class="reviews-teaser__stars" aria-hidden="true">${stars(aggregate.rating)}</span>
        <div class="reviews-teaser__rating">
          <span class="reviews-teaser__score">${aggregate.rating.toFixed(1)}</span>
          <span class="reviews-teaser__count">${aggregate.count} reviews</span>
        </div>
      </div>

      <div class="reviews-teaser__grid">
        ${reviews.map(reviewCard).join('')}
      </div>

    </div>
  </section>
`;

export const mountReviewsTeaser = (mount) => {
  mount.insertAdjacentHTML('beforeend', render());
  observeReveal(mount.querySelector('.reviews-teaser'));
};
