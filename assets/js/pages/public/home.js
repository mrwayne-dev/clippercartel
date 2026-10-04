/**
 * home.js — landing page.
 * Only the hero so far; services teaser, signature work, about teaser,
 * gallery marquee, reviews teaser, visit, final CTA land next.
 */

import { mountHero } from '../../components/hero.js';

export default async (mount) => {
  await mountHero(mount);
};
