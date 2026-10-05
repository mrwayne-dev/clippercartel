# ClipperCartel — Progress Report

Last updated: 2026-10-05.
Repo: `git@github.com:mrwayne-dev/clippercartel.git` · branch: `main`.

---

## Where we are

The **home page** is complete end-to-end. All 8 sections plus the global nav
and footer are built, wired to real shop data from `.env`, scroll-animated,
and verified serving over HTTPS at `https://clippercartel.test/`.

Everything else on the public site is still phase-1 scaffolding (route
exists, module loads, placeholder content).

---

## Done today

### Infrastructure (recap from earlier phases)

- HTTPS vhost at `clippercartel.test` (via `wayne serve`)
- Self-hosted fonts: Cal Sans, Switzer, Phosphor, Kudryashev Display + Headline,
  Instrument Serif (Latin subset)
- Palette locked: white bg · black text · brown accent (`#7a4a2b`)
- SEO baseline: per-route meta/OG/canonical, HairSalon JSON-LD, llms.txt,
  robots.txt (18 AI crawlers blocked), sitemap.xml
- Security: `.htaccess` with CSP, HSTS, X-Frame-Options, hotlink block,
  source-dir denies
- Contact form hardened: honeypot + Turnstile + rate-limit + auto-reply
- Anti-cloning JS: right-click/F12 blocks, devtools detection
  (localhost/.test skipped so dev stays usable)
- Full-page mobile drawer (slides down, numbered rows, contact chips,
  Book CTA, address + hours)
- Nav locked variant A (logo left · links right · Book CTA)

### Home page sections (built today)

| # | Section | Design DNA |
|---|---|---|
| 01 | Hero | Full-bleed brand plate (desktop) / 5-slide carousel (mobile); bottom-left Kudryashev + Instrument Serif italic headline + dual CTA (one filled brown, one outlined-inverts); GSAP timeline on entry |
| 02 | Services showcase | **Full-height split**: text panel left (01/04 index · big serif name · subtitle · progress bar · Book CTA) / image panel right. Auto-advances every 6s, text + image swap in sync, viewport-gated |
| 03 | Signature work | Image left, text right; gallery11 (CLIPPER·CARTEL visible in mirror); 1.03x hover scale |
| 04 | About teaser | Text left, portrait right; two short editorial paragraphs; new `/assets/images/about/portrait.jpg` |
| 05 | Gallery marquee | Full-bleed auto-scrolling strip of 8 cuts; CSS keyframe translateX(-50%) over 42s; hover pauses; mask-edge fade |
| 06 | Reviews teaser | Aggregate rating strip (★ 4.9 · 128 reviews) between hairline dividers; 3 italic Instrument Serif quotes (name/attribution stripped) |
| 07 | Visit | Address + hours + Call/WhatsApp buttons left; Google Maps iframe right (keyless embed, filter: saturate(0.9) to blend with warm palette) |
| 08 | Final CTA | Dark surface (first on page) · 'Your chair is waiting.' giant display headline · dual CTA |

### Global chrome

- **Nav**: logo left, links right, Book CTA (desktop); logo + burger on mobile
  → full-page drawer with 5 numbered links + Book CTA + contact chips +
  address/hours
- **Footer**: dark surface (seamless with final CTA); 2-col top (brand +
  contact / Site + Follow lists with Phosphor-style SVG icons); hairline
  divider; copyright + Privacy/Terms

### Design iteration log (today)

1. Palette locked white/black/brown
2. Nav variants A/B built, A locked, Home link removed
3. Kudryashev added as display face, Cal Sans demoted to fallback
4. Instrument Serif italic added as accent face (for 'em' spans in headings)
5. Hero redesigned twice — first with Visit card + status pill, then
   stripped to bottom-left copy + CTAs only; mobile carousel added
   (4 slides → 5 after `mobileheroimagemain.png`)
6. Mobile drawer rebuilt as full-page overlay (fixed the backdrop-filter
   containing-block bug that was clipping it to the 72px nav strip)
7. Services teaser rebuilt three times: menu list → Hydroxyapatite pattern
   → **current full-height split showcase**
8. Em-dashes swept out of all user-facing content
9. Italic bump (1.12em + line-height 0.9) across all display headings so
   Instrument Serif visually matches Kudryashev
10. Reviews collapsed to quote-only (no name/attribution)
11. Footer gained Phosphor-style SVG social icons

### Motion stack (added today, final pass)

- GSAP core 3.12.5 (71KB) + **ScrollTrigger plugin 3.12.5 (43KB)** —
  both self-hosted at `/assets/vendor/`
- `assets/js/lib/motion.js` loads them lazily & memoised
- `assets/js/lib/parallax.js` NEW: scans for `[data-parallax="N"]`, sets up
  ScrollTrigger that translates Y as the element passes through the viewport
- `assets/js/utils/reveal.js` IntersectionObserver + `[data-reveal="type"]`
  (CSS-driven) with 7 variants: `fade-up` (default) / `fade-down` /
  `fade-left` / `fade-right` / `scale` / `blur` / `clip`
- All motion gated by `prefers-reduced-motion`

### Varied enter animations per section (today)

| Section | Entry animation |
|---|---|
| Hero | GSAP timeline — image fade + Ken Burns + staggered 2-line title |
| Services | Full-viewport, no entry animation (auto-advance carousel inside) |
| Signature work | Image `scale` + parallax 60px; title/sub/CTA `fade-left` stagger |
| About | Text `fade-right` stagger; portrait `fade-left` + parallax 80px |
| Gallery marquee | Title `clip` reveal, viewport `scale` in |
| Reviews | Title `clip`, aggregate `scale`, quotes `fade-up` stagger |
| Visit | Text block `fade-right` stagger; map `scale` |
| Final CTA | Headline `scale`, actions + meta `fade-up` stagger |

### Audit (today)

- JS lint: all green across all components
- PHP lint: all green across api + config + includes
- All 10 section JS + 13 CSS files serve 200 OK via Apache
- No TODOs / FIXMEs / stray `console.log` in production JS
- No missing image references
- No unencoded filename spaces in hrefs
- Minor: 2 `:has()` usages in CSS for the hero nav-bleed — fine for
  Chrome 105+/Safari 15.4+/Firefox 121+ (released Dec 2023)

---

## Known issues / tidy-up for tomorrow

Small quality items I'd clean up before launch:

1. **Hero mobile carousel always inits even on desktop** — `initCarousel`
   runs regardless of viewport. Harmless (images are `display:none` on
   desktop) but wastes a timer. Should gate behind matchMedia.
2. **`.marquee` class could collide** with marquee patterns elsewhere;
   consider renaming to `.gallery-marquee__` for safety.
3. **services-teaser.js calls `observeReveal(root)` but has no
   `[data-reveal]` targets** — intentional (the full-height section
   doesn't need entry reveal) but the call is a no-op. Remove.
4. **`:has()` fallback** for older Firefox: add a JS class on `#app`
   when `.hero` is first child, matched by a `.has-hero` CSS rule.
5. **Service section images on left column** (list column) could be the
   source of layout jank on narrow desktops if any image's intrinsic
   width is unknown — add explicit `aspect-ratio` on `<img>` tags where
   missing.

---

## Remaining work (tomorrow and beyond)

### Public site — pages still placeholder

All exist as modules, routable, meta-wired, but content is thin:

| Route | State | Next step |
|---|---|---|
| `/services` | Placeholder paragraph | Full menu once real services + prices land |
| `/gallery` | Placeholder paragraph | Masonry grid of all shop photos (admin-uploaded eventually) |
| `/book` | Placeholder paragraph | **Booking widget** — the big one (phase 3) |
| `/reviews` | Placeholder paragraph | Full list + submission form + aggregate (needs backend) |
| `/about` | Placeholder paragraph | Full story page: hero, shop story, barber bio, principles, interior gallery, book CTA |
| `/contact` | Form + honeypot wired, no map | Add map embed + redesign to match home style |
| `/faq` | Placeholder paragraph | Accordion once FAQ copy lands |
| `/privacy` | Placeholder content | Replace with real policy |
| `/terms` | Placeholder content | Replace with real terms |
| `/404` | Styled | Done |

### Backend — not started

Everything the admin panel and booking widget needs:

- MySQL schema (from PROJECT_PLAN.md section 9c) — customers, services,
  schedule, time_off, bookings, messages, reviews, admins, settings
- `/api/services.php` (GET list)
- `/api/availability.php` (compute open slots)
- `/api/booking.php` (POST a booking — the full flow with race-condition
  guard + WhatsApp confirmation)
- `/api/reviews.php` (POST + moderation)
- `/api/admin/*` endpoints
- Admin panel UI (`/admin/dashboard`, `/admin/bookings`, `/admin/services`,
  `/admin/schedule`, `/admin/customers`, `/admin/gallery`,
  `/admin/reviews`, `/admin/content`, `/admin/settings`, `/admin/messages`)
- Session/auth (`requireAdmin()`)
- Daily DB backup cron + offsite rotation

### Integrations — not started

- **WhatsApp Meta Cloud API** — register business number, create message
  templates (confirmation / reminder / cancellation), wire outbound +
  inbound webhook for CANCEL / RESCHEDULE replies
- **Cloudflare Turnstile** — generate site key, drop into `.env`, add
  widget to contact + reviews + booking forms
- **UptimeRobot** — point at `/api/health.php` (not yet built)

### Content still pending from you

- Real services + descriptions (names, categories if any)
- Contact email (`CONTACT_TO=` in `.env`)
- Production domain (`APP_URL`)
- Real FAQ, privacy policy, terms copy
- About-page copy (story, principles)
- Review photos / permission (if ever using photos)

### Polish before launch

- Image pipeline: resize uploads to AVIF/WebP/JPEG × 3 sizes; add
  server-side watermark
- Monitoring health endpoint + UptimeRobot
- Lighthouse pass (target 95+ performance, 100 accessibility)
- Final content pass — all placeholder copy swapped
- OG image generation (1200×630 shots per route)

---

## Technical scorecard (today)

- **Repo:** 25 commits on main
- **Files:** 10 section components · 13 section stylesheets · 2 vendor libs
  (GSAP + ScrollTrigger, both self-hosted, 114KB total)
- **No build step** — pure ES modules + CSS, served direct by Apache
- **Bundle budget:** no single section > 10KB JS; total JS < 50KB gz
  (excluding GSAP vendors which load on-demand)
- **A11y:** aria-labels on burger, aggregate ratings, every nav button;
  `prefers-reduced-motion` short-circuits all transitions
- **CSP:** strict `'self'` policy + explicit allow-list for Cloudflare
  Turnstile and Google Maps subdomains
- **Cache:** fonts immutable (1yr); images 1 day; CSS/JS no-cache
  with ETag revalidate (fixes the broken-cache incident from earlier)
