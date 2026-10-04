/**
 * home.js — landing page.
 * Sections built so far: 01 hero · 02 services teaser.
 * Still to come: signature work, about teaser, gallery marquee,
 * reviews teaser, visit, final CTA.
 */

import { mountHero }           from '../../components/hero.js';
import { mountServicesTeaser } from '../../components/services-teaser.js';

export default async (mount) => {
  await mountHero(mount);
  mountServicesTeaser(mount);
};
