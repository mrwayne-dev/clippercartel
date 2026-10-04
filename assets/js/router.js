/**
 * router.js — Client-side Route Definitions
 *
 * Maps URL paths to page modules.
 * app.js calls router.init() on DOMContentLoaded.
 *
 * Route shape:
 *   { path: '/about', view: () => import('./pages/public/about.js') }
 */

const routes = [
  // { path: '/',           view: () => import('./pages/public/home.js')       },
  // { path: '/about',      view: () => import('./pages/public/about.js')      },
  // { path: '/contact',    view: () => import('./pages/public/contact.js')    },
  // { path: '/dashboard',  view: () => import('./pages/user/dashboard.js')    },
  // { path: '/admin',      view: () => import('./pages/admin/dashboard.js')   },
];

module.exports = { routes };
