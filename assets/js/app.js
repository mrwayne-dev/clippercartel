/**
 * app.js — SPA entry point.
 *
 *   1. Mount nav + footer (persistent across routes)
 *   2. Install anti-cloning guards (production only)
 *   3. Boot the router — it owns #app and all per-route meta updates
 */

import { mountNav }        from './components/nav.js';
import { mountFooter }     from './components/footer.js';
import { installGuards }   from './lib/anti-cloning.js';
import { startRouter }     from './router.js';

const bootstrap = async () => {
  mountNav(document.getElementById('nav'));
  mountFooter(document.getElementById('site-footer'));

  // Guards are soft layer only; real content protection is server-side.
  // Skipped on localhost / .test so devtools stays usable in development.
  const isLocal = /\.test$|localhost|127\.0\.0\.1/.test(location.hostname);
  if (!isLocal) installGuards();

  await startRouter(document.getElementById('app'));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
