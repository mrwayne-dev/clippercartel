/**
 * home.js — landing page.
 * 7 sections: 01 hero · 02 services · 03 signature work · 04 about ·
 *             05 gallery marquee · 06 visit · 07 final CTA.
 */

import { mountHero }           from '../../components/hero.js';
import { mountServicesTeaser } from '../../components/services-teaser.js';
import { mountSignatureWork }  from '../../components/signature-work.js';
import { mountAboutTeaser }    from '../../components/about-teaser.js';
import { mountGalleryMarquee } from '../../components/gallery-marquee.js';
import { mountVisit }          from '../../components/visit.js';
import { mountFinalCta }       from '../../components/final-cta.js';
import { applyParallax }       from '../../lib/parallax.js';

export default async (mount) => {
  await mountHero(mount);
  mountServicesTeaser(mount);
  mountSignatureWork(mount);
  mountAboutTeaser(mount);
  mountGalleryMarquee(mount);
  mountVisit(mount);
  mountFinalCta(mount);

  // Universal parallax — any element with [data-parallax] gets a
  // scroll-driven Y translate. Fire after sections are in the DOM.
  applyParallax(mount);
};
