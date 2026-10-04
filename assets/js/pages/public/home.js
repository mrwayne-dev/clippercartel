/**
 * home.js — landing page.
 * Sections built: 01 hero · 02 services teaser · 03 signature work.
 * Still to come: about teaser, gallery marquee, reviews teaser,
 * visit, final CTA.
 */

import { mountHero }           from '../../components/hero.js';
import { mountServicesTeaser } from '../../components/services-teaser.js';
import { mountSignatureWork }  from '../../components/signature-work.js';

export default async (mount) => {
  await mountHero(mount);
  mountServicesTeaser(mount);
  mountSignatureWork(mount);
};
