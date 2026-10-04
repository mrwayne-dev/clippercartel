/**
 * home.js — landing page.
 * Sections built: 01 hero · 02 services · 03 signature work ·
 *                 04 about · 05 gallery marquee.
 * Still to come: reviews teaser, visit, final CTA.
 */

import { mountHero }           from '../../components/hero.js';
import { mountServicesTeaser } from '../../components/services-teaser.js';
import { mountSignatureWork }  from '../../components/signature-work.js';
import { mountAboutTeaser }    from '../../components/about-teaser.js';
import { mountGalleryMarquee } from '../../components/gallery-marquee.js';

export default async (mount) => {
  await mountHero(mount);
  mountServicesTeaser(mount);
  mountSignatureWork(mount);
  mountAboutTeaser(mount);
  mountGalleryMarquee(mount);
};
