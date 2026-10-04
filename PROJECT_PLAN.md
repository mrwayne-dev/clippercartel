# ClipperCartel — Pre-Build Analysis & Decisions

> SPA for a barber business. Vanilla PHP + vanilla JS, Phosphor Icons, SPA shell (`index.php`) with client-side routing. Repo: `git@github.com:mrwayne-dev/clippercartel.git` (pushed to `main`).

Everything below is a decision I'm asking you to confirm, or a thing I need from you before I start writing feature code. Nothing has been installed yet — this is the plan.

---

## 1. Local Hosting (Vhost via `wayne`)

The `wayne` CLI at `/usr/local/bin/wayne` handles Apache vhosts for anything under `/home/mrwayne/Documents/wayne/web_dev/`. It auto-detects doc root (`public/` if present, else project root), writes `/etc/apache2/sites-available/<project>.test.conf`, adds `127.0.0.1 <project>.test` to `/etc/hosts`, and reloads Apache.

For ClipperCartel the project root is the doc root (no `public/` subfolder — `index.php` lives at the top), so this is one command:

```bash
wayne setup clippercartel        # HTTP → http://clippercartel.test
wayne serve clippercartel        # HTTPS via mkcert → https://clippercartel.test
```

I'll run **`wayne serve`** so we're on HTTPS from day one — the booking flow will need it (secure cookies, WhatsApp webhook callbacks won't accept plain HTTP), and Service Workers (if we add one for offline booking confirmation pages later) require HTTPS.

Secondary benefit: `wayne share clippercartel` tunnels through ngrok when you need to show a client or let Meta's WhatsApp webhook hit it in dev.

**Action for you:** confirm the domain `clippercartel.test` locally; the production domain you'll register separately (`clippercartel.com`?) — I'll plug it into `.env` → `APP_URL` and every canonical/og:url tag reads from there, so changing it later is one line.

---

## 2. Icons & Fonts

### Icons — Phosphor (locked in)

Already wired in `index.php:56` via CDN. **I'd change this to a self-hosted woff2 subset** before launch, same way `mgbah.dev` does it (`assets/fonts/phosphor/Phosphor-regular.woff2` + `Phosphor-fill.woff2`, ~140KB each). Reasons:

- CDN adds a third-party DNS/TLS handshake on every first visit
- Blocks on `unpkg` uptime
- Lets us subset to the ~40 icons we'll actually use (shears, calendar, clock, star, map-pin, phone, instagram, etc.) and drop the file to ~15–25KB

### Fonts — my two picks for you to compare against Cal Sans

Pulled from `mgbah.dev/assets/fonts/`. Both are free, modern, and already proven in your own templates — so there's no licensing surprise and I know they render well in the kind of dark-mode-heavy editorial layouts you build.

| Option | Weights available | Vibe | Best use |
|---|---|---|---|
| **Cal Sans** (your current pick) | Single display weight | Semi-serif, warm, confident, slightly playful | Headings, hero titles, logo-adjacent. Needs a workhorse pair for body. |
| **Host Grotesk** *(my #1 pick)* | 300–800, italics for every weight | Modern grotesque, geometric but humanist. Reads like Inter but with more character. | Can do *both* headings and body on its own. Zero pairing complexity. |
| **Switzer** *(my #2 pick)* | 400, 500, 600 | Clean, confident, slightly condensed. Feels premium — matches the "cartel" positioning. | Body + UI; pairs beautifully with Cal Sans for headings. |

**My recommended combo** (if you don't want to decide blind): **Cal Sans for H1/H2/display + Switzer for everything else**. That gives you distinct brand voice in the hero and clean legibility everywhere else. If you want one font for the whole site, pick **Host Grotesk** — it does both jobs.

Three fonts total (Cal Sans + body font + Phosphor icon font), all self-hosted woff2 with `font-display: swap`, preloaded in `<head>`. Total font payload target: < 180 KB.

**Decide:** `Cal Sans alone` / `Cal Sans + Host Grotesk` / `Cal Sans + Switzer` / `Host Grotesk alone`.

---

## 3. SPA Architecture (already scaffolded, confirming the pattern)

The scaffold in `assets/js/` matches the SPA pattern in `ARCHITECTURE.md`:

```
assets/js/
├── app.js           ← bootstrap on DOMContentLoaded
├── router.js        ← route table, hash or History API
├── pages/
│   ├── public/      ← home, services, book, gallery, contact...
│   ├── user/        ← my bookings, profile
│   └── admin/       ← dashboard, bookings mgmt, services mgmt
├── components/      ← nav, footer, modal, booking-widget, service-card, barber-card
├── services/        ← api.js (fetch wrapper), booking.js, auth.js
├── utils/           ← dom.js, transitions.js, format.js, validators.js
└── lib/             ← third-party adapters (gsap, lenis, motion-one)
```

**History API over hash routing** — real URLs (`/services`, not `/#/services`), already handled by `.htaccess` rewriting non-file requests to `index.php`.

**Dynamic imports** per route so each page module is a separate chunk the browser only fetches when the user navigates to it. This keeps the initial payload (`app.js` + `router.js` + nav/footer components) under ~30KB gzipped and defers the booking widget (biggest module) until someone opens `/book`.

**No build step** — ES modules natively in the browser (`<script type="module">`). This matches the mgbah.dev approach. If we later need bundling (e.g., when we start importing GSAP's ScrollTrigger plugin), I'll add **esbuild** — single binary, zero config, ~0.1s build. Rejecting Vite/Webpack/Rollup for complexity we don't need.

---

## 4. Motion / Animation Stack

Three libraries, each with a sharp purpose. Together ~45KB gzipped — small enough that I'd rather have the right tool for each job than wedge one library into doing everything.

| Library | Purpose | Size (gz) | Why this one |
|---|---|---|---|
| **GSAP 3** (core only, no Club plugins) | Scroll-driven reveals, hero animations, timeline sequences | ~25 KB | Industry standard. Battle-tested. No competitor is close on timelines + scroll scrubbing. Free for commercial use since 2024 (Webflow acquisition). |
| **Lenis** | Smooth-scroll inertia (the "buttery" feeling premium sites have) | ~5 KB | Pairs natively with GSAP's ScrollTrigger. Respects `prefers-reduced-motion`. Replaces Locomotive Scroll. |
| **Motion One** | Page transitions between SPA routes, micro-interactions | ~4 KB | Uses the browser's native Web Animations API — buttery and GPU-accelerated. Written by the Framer Motion author. Overkill-free for small stuff where GSAP would be heavy. |

**All three guarded by `prefers-reduced-motion`** — motion gets stripped to opacity-only fades for users who've opted out at the OS level. `animations.css` already has that structure per `ARCHITECTURE.md`.

### Additional features / languages I'd add

- **Zod-lite validator (hand-rolled, ~1KB)** for client-side form validation — stops bad data at the browser before it hits the API.
- **DOMPurify** (~20KB) *only if* we ever render user-generated HTML (e.g., admin editing service descriptions with a WYSIWYG). Skip for now.
- **date-fns** (tree-shaken, ~5KB for just what we use) for booking date math — "next available slot", "90 days from today", etc. Hand-rolling Date math is a bug factory.
- **No TypeScript.** Vanilla JS matches the mgbah.dev / wayne-template pattern. JSDoc comments where the typing actually earns its keep (API response shapes).
- **No frontend framework.** This is a <10-page SPA; React/Vue would 10x the stack weight for zero benefit.

---

## 5. Anti-Cloning / Content Protection

No defence is bulletproof — anyone determined can still copy — but we can make casual cloning annoying enough that drive-by scrapers give up.

Layered approach:

**Server-side (strongest):**
- Minify + optionally obfuscate production JS (`esbuild --minify` + optional javascript-obfuscator pass for pages/admin).
- Strip source maps from production build.
- `.htaccess` denies hotlinking of images (RewriteCond on `HTTP_REFERER`).
- Server-side watermarking of gallery images (PHP GD lib — adds a faint "ClipperCartel" diagonal on upload).
- HTTP headers via `.htaccess`:
  - `X-Frame-Options: SAMEORIGIN` (no iframe embedding)
  - `Content-Security-Policy` (locks down script/image/font origins)
  - `Permissions-Policy` restrictions

**Client-side (defence in depth, not security):**
- Disable right-click context menu (`contextmenu` event preventDefault)
- Disable text selection on brand elements via CSS `user-select: none` (keep selectable on content paragraphs — SEO & accessibility matter more than paranoia)
- Block `Ctrl+U` / `Ctrl+S` / `F12` / `Ctrl+Shift+I` keydowns on production builds
- DevTools detection (window dimension diff on open) — logs attempts to API, doesn't visually scream at the user (that's hostile)
- Image `pointer-events: none` + decorative wrapper divs to defeat right-click-save

**What I explicitly won't do** because it hurts real users more than it hurts copiers:
- Blur or black-out on devtools open — annoys developers and accessibility users
- Full-page selection disable — breaks screen readers
- Fullscreen takeover modal "please don't copy" — looks amateur

**Action for you:** confirm you're OK with the client-side blocks. The right-click disable in particular is a UX tradeoff — some users do right-click to open images in a new tab legitimately.

---

## 6. SEO, Privacy, Compliance & Integrity

### Per-page SEO (dynamic via router)

Each route in `router.js` carries a `meta` block the router applies on navigation:

```js
{
  path: '/services',
  title: 'Services & Pricing — ClipperCartel',
  description: 'Full barbering menu: fades, beard sculpts, hot-towel shaves...',
  og: { image: '/assets/images/og/services.jpg' },
  canonical: 'https://clippercartel.com/services',
  schema: 'Service'   // JSON-LD type to inject
}
```

Router updates `<title>`, `<meta name="description">`, canonical, OG tags, and injects the right JSON-LD block on every navigation. No page can ship without a meta block — I'll add a lint check.

### Structured data (JSON-LD)

- `LocalBusiness` + `HairSalon` on home page (NAP, hours, payment accepted, geo)
- `Service` on each service entry
- `Person` for each barber
- `Review` + `AggregateRating` on reviews page
- `FAQPage` on FAQ
- `BreadcrumbList` on all deeper pages

### `robots.txt` (block AI scrapers)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /uploads/

# AI training crawlers — blocked
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Claude-Web
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: anthropic-ai
Disallow: /
User-agent: PerplexityBot
Disallow: /
User-agent: FacebookBot
Disallow: /
User-agent: Bytespider
Disallow: /

Sitemap: https://clippercartel.com/sitemap.xml
```

### `/llms.txt` (opt-out signal)

Standard body-less declaration at site root telling AI systems not to use the content for training. Reinforces robots but at the content layer.

### `sitemap.xml`

Static file generated from the route table — `priority` and `changefreq` per section. Regenerated on deploy.

### Other integrity items

- **404 page** — scoped to a dedicated `/pages/public/404.php` + JS fallback for client-side bad routes. On-brand, not Apache default.
- **View-source**: HTML will show a stripped `index.php` shell (no secrets). Vendor + node_modules + `.env` + `/api/` sources are blocked by `.htaccess` already. Devtools can still see rendered DOM — unavoidable in a web browser, that's the honest answer.
- **Alt text everywhere** — enforced via a `<Image>` helper component that errors in dev if `alt` is missing.
- **Source maps** off in production (dev-only).
- **JS bundle budget** — I'll track with a size-check script in `/scripts/`. Initial JS budget: 50KB gzipped. Per-route chunk budget: 30KB gzipped. CI (or local pre-commit) fails over.
- **Privacy page** (`/privacy`) and **Terms** (`/terms`) — placeholder content you'll replace; I'll scaffold the pages.
- **Cookie consent banner** — minimal, GDPR-aware. Only shows if we actually set non-essential cookies (analytics). If we don't do analytics, we don't need the banner.
- **Spam protection**: three layers on the contact + booking forms:
  1. Honeypot field (hidden input bots fill in)
  2. Session-based rate limit (already in `includes/rate_limit.php`)
  3. Cloudflare Turnstile — free, no user puzzles, better UX than reCAPTCHA
- **No exposure**: `.env`, `/vendor/`, `/api/includes/`, `/config/` are all behind `.htaccess` denies. I'll add a smoke test that curls each one and confirms a 403.

---

## 7. Page Scope (all routes)

### Public (unauthenticated)

| Route | Purpose |
|---|---|
| `/` | Home — hero, services teaser, latest cuts, CTA to book |
| `/services` | Full service menu with pricing, duration, add-ons |
| `/gallery` | Portfolio grid — filterable by style |
| `/book` | **Booking widget** (the big one — see section 9) |
| `/reviews` | Manual reviews with aggregate rating |
| `/about` | Story, values, shop photos, barber bio (single-operator shop) |
| `/contact` | Form + map + hours + directions |
| `/faq` | Hair prep, cancellations, kids, walk-ins |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/404` | Not-found page |

### User tier — **skipped for v1** (guest-booking-only, per decision)

### Admin (`requireAdmin()`)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard — today's bookings, upcoming week, revenue, no-show rate |
| `/admin/bookings` | Full calendar view + list — filter by status, date |
| `/admin/services` | CRUD services + pricing |
| `/admin/schedule` | Weekly working hours + days off / holidays (single operator) |
| `/admin/customers` | Customer list, booking history per customer, no-show flags |
| `/admin/gallery` | Upload / tag / caption portfolio images |
| `/admin/reviews` | Moderate manual reviews before publication |
| `/admin/content` | Edit home hero text, about page, FAQs — no code deploy needed |
| `/admin/settings` | Shop hours, holidays, WhatsApp config, notification toggles |
| `/admin/messages` | Contact form submissions inbox |

**Decision locked:** no `/account` tier. Guest booking only — customer identifies by phone, confirmation sent via WhatsApp + email, cancel/reschedule happens via WhatsApp reply (CANCEL / RESCHEDULE keywords handled by the webhook) or by calling the shop.

---

## 8. This Document

You're reading it. Lives at `/PROJECT_PLAN.md` in the repo root. Not committed yet — I'll commit after you've read it and given feedback, so your edits ride in the same commit as mine.

---

## 9. Contact Form + Booking System — Backend Architecture

The two forms that matter. Both go through the same `/api/` layer, same rate limiter, same mailer, but different data models and different downstream routing.

### 9a. Contact form (lightweight)

```
Browser (/contact)
   │  POST /api/contact.php {name, email, subject, message, honeypot, turnstile_token}
   ▼
contact.php
   ├─ verify Turnstile token (fail → 400)
   ├─ check honeypot empty (fail → silent 200, log suspected bot)
   ├─ rateLimit('contact_form', 5, 60)
   ├─ validate (name, valid email, message non-empty)
   ├─ INSERT INTO messages (customer-visible admin inbox at /admin/messages)
   ├─ send email to shop (via existing mailer.php)
   └─ send auto-reply to customer ("we got your message")
   ▼
jsonSuccess() → browser shows success state
```

Already 80% wired in `api/contact.php` — I'll add the DB insert, Turnstile verification, honeypot check, and the auto-reply.

### 9b. Booking system — the main feature

```
Browser (/book)
   │  Step 1: GET /api/services.php               → [{id, name, price, duration_min}]
   │  Step 2: GET /api/availability.php           → open slots for the date range
   │             ?service_id=X&from=2026-10-05&to=2026-10-19
   │  Step 3: POST /api/booking.php               → create booking
   │             {service_id, start_at, customer:{name,email,phone}, notes}
   ▼
booking.php
   ├─ verify Turnstile + honeypot + rate limit
   ├─ BEGIN TX
   │     ├─ re-check slot is still free (race condition guard)
   │     ├─ INSERT INTO customers (ON DUPLICATE KEY on phone → update)
   │     ├─ INSERT INTO bookings (status='pending')
   │     └─ COMMIT or ROLLBACK
   ├─ send WhatsApp message to customer (Meta WhatsApp Cloud API)
   │     "Hi {name}, your booking at ClipperCartel is confirmed for {date}.
   │      Reply CANCEL to cancel, RESCHEDULE to change."
   ├─ send WhatsApp message to shop owner (new booking alert)
   ├─ send confirmation email (fallback if WA fails)
   └─ send calendar .ics attachment
   ▼
jsonSuccess({booking_id, confirmation_code}) → browser shows confirmation screen
```

### 9c. Database schema (MySQL)

```sql
customers
  id              BIGINT PK AUTO_INCREMENT
  name            VARCHAR(120)
  email           VARCHAR(190) NULL
  phone           VARCHAR(32) UNIQUE   -- E.164 format, canonical identifier
  whatsapp_opt_in TINYINT(1) DEFAULT 1
  no_show_count   INT DEFAULT 0
  notes           TEXT NULL              -- admin notes, allergies, preferences
  created_at      DATETIME
  updated_at      DATETIME

services
  id              BIGINT PK
  name            VARCHAR(120)
  slug            VARCHAR(120) UNIQUE
  description     TEXT
  price_cents     INT                     -- always store money in cents, never floats
  duration_min    INT
  is_active       TINYINT(1) DEFAULT 1
  display_order   INT

schedule (weekly working hours — single operator, one row per day)
  day_of_week     TINYINT PK  -- 0=Sun ... 6=Sat
  start_time      TIME
  end_time        TIME
  is_working      TINYINT(1) DEFAULT 1

time_off (holidays, sick days, one-off blocks)
  id              BIGINT PK
  starts_at       DATETIME
  ends_at         DATETIME
  reason          VARCHAR(255)

bookings
  id              BIGINT PK
  confirmation_code CHAR(8) UNIQUE   -- shown to customer, used in WA replies
  customer_id     BIGINT FK
  service_id      BIGINT FK
  starts_at       DATETIME         -- INDEXED (starts_at)
  ends_at         DATETIME         -- derived from starts_at + service.duration
  status          ENUM('pending','confirmed','completed','cancelled','no_show')
  price_cents_at_booking INT        -- price frozen at booking time (not FK)
  notes           TEXT
  created_at      DATETIME
  updated_at      DATETIME

messages (contact form inbox)
  id              BIGINT PK
  name            VARCHAR(120)
  email           VARCHAR(190)
  subject         VARCHAR(190)
  body            TEXT
  is_read         TINYINT(1) DEFAULT 0
  received_at     DATETIME

admins
  id              BIGINT PK
  email           VARCHAR(190) UNIQUE
  password_hash   VARCHAR(255)
  name            VARCHAR(120)
  last_login_at   DATETIME

settings (key-value for admin-editable site config)
  key             VARCHAR(64) PK
  value           TEXT
```

**Why phone is the customer identifier**: barber shops lose way more customers to typo'd emails than typo'd phone numbers, and WhatsApp needs the phone anyway.

### 9d. Availability algorithm (summary)

For a given service and date range:

1. Pull the weekly `schedule` row for each day in range.
2. Subtract `time_off` windows.
3. Subtract existing bookings (any status except `cancelled`).
4. Walk the remaining windows in service-duration-sized steps (snapped to configurable grid — 15 min default).
5. Return array of `{starts_at, ends_at}` free slots.

Cached per `date` for 60s. Invalidated on any booking write for that date.

### 9e. WhatsApp integration

**Meta WhatsApp Business Cloud API** (free tier: 1,000 service conversations/mo) is the right pick — direct from Meta, no Twilio markup, official webhooks for CANCEL / RESCHEDULE replies.

Flow:

1. Register a Meta Business account + WhatsApp Business number.
2. Register approved message templates ("booking_confirmation", "booking_reminder", "booking_cancelled") in Meta's dashboard — templates need approval, takes 24h first time.
3. Store `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` in `.env`.
4. `/api/whatsapp/send.php` wraps outbound sends.
5. `/api/whatsapp/webhook.php` receives inbound replies (CANCEL / RESCHEDULE / anything else → forward to admin as a message in `/admin/messages`).
6. Daily cron (3h before each next-day booking) sends reminder messages.

**Admin panel integration**: `/admin/bookings` shows a WhatsApp send-log column per booking (sent / delivered / read / failed) pulled from the webhook status callbacks.

### 9f. Site map (visual)

```
                            ┌────────────────┐
                            │   index.php    │  (SPA shell + nav + footer)
                            └────────┬───────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
     ┌────▼─────┐              ┌─────▼──────┐             ┌─────▼──────┐
     │  Public  │              │   /admin   │             │  /api/*    │
     ├──────────┤              ├────────────┤             ├────────────┤
     │   /      │              │ dashboard  │             │ contact    │
     │ services │              │ bookings   │◄───────────►│ services   │
     │ barbers  │              │ services   │             │ barbers    │
     │ gallery  │              │ barbers    │             │ availability│
     │  /book  ─┼──────┐       │ customers  │             │ booking    │
     │ reviews  │      │       │ gallery    │             │ whatsapp/  │
     │ about    │      │       │ reviews    │             │   send     │
     │ contact ─┼─┐    │       │ content    │             │   webhook  │
     │ faq      │ │    │       │ settings   │             │ admin/*    │
     │ privacy  │ │    │       │ messages   │             │   auth     │
     │ terms    │ │    │       └─────┬──────┘             │   bookings │
     │ 404      │ │    │             │                    └─────┬──────┘
     └──────────┘ │    │             │                          │
                  │    │             │                          │
                  │    │             ▼                          ▼
                  │    │        ┌────────────┐           ┌──────────────┐
                  │    └───────►│  MySQL DB  │◄──────────┤  mailer.php  │
                  │             │ (schema 9c)│           │  (PHPMailer) │
                  │             └─────┬──────┘           └──────────────┘
                  │                   │
                  │                   ▼
                  │          ┌─────────────────┐
                  └─────────►│ WhatsApp Cloud  │  (Meta API)
                             │      API        │
                             └─────────────────┘
```

---

## 10. Additional Items Locked In

Trimmed to what you accepted. The dropped items (Google My Business, payments/deposits, loyalty, SMS fallback, multi-location, analytics, Sentry, PWA) stay out of scope — not forgotten, just not v1.

1. **Timezone handling** — all times stored UTC in DB, converted to shop's local timezone (`APP_TIMEZONE` in `.env`) for display. **Needed from you**: shop's timezone (I'll default to `Africa/Lagos` if you don't say otherwise).

2. **Backups** — DB backup cron (daily `mysqldump` to `/backups/`, 30-day rotation, offsite copy). I'll scaffold the script; you pick the offsite destination (Backblaze B2 is cheapest at ~$0.005/GB/mo).

3. **Monitoring** — UptimeRobot free tier pinging `/api/health.php` every 5 min + a daily cron that counts yesterday's bookings and alerts if `0` (silence usually means something's broken).

4. **Image pipeline** — gallery photos uploaded by admin get: server-side resize to 3 sizes (thumb/card/full), AVIF + WebP + JPEG output, watermark, served via `<picture>` with `loading="lazy"`. Built once in `services/image_processor.php` and reused everywhere.

5. **Accessibility baseline — WCAG 2.2 AA** — real focus states, keyboard-navigable booking widget, ARIA labels on all icon-only buttons, 4.5:1 contrast everywhere. Non-negotiable, built in from day one.

---

## Locked Decisions (as of 2026-10-04)

| Area | Decision |
|---|---|
| Fonts | **Cal Sans** (headings) + **Switzer** (body/UI), both self-hosted woff2, with Phosphor icon font |
| Auth tier | **No `/account`** — guest booking only, phone is the identifier |
| Payments | **Pay-at-shop** — no deposit, no online payment integration in v1 |
| Anti-cloning | Right-click, F12/Ctrl+Shift+I/Ctrl+U/Ctrl+S blocked on production + devtools detection + server-side protections — approved |
| Scope | **Single-operator shop** — schema simplified (no `barbers` / `barber_services` / `barber_schedules` tables; one global `schedule` + `time_off`) |
| WhatsApp | Scoped later when we build the booking platform — placeholder env vars reserved now |
| Shop details | **Pending from you** — business name as displayed, phone, address, hours, timezone, Instagram, Google Maps link |
| Production domain | **Pending** — not yet decided; `APP_URL` wired to read from `.env` so it's a one-line change |

## Blockers Before Feature Code

Only two things stop me starting the scaffolding work (fonts, vhost, SEO baseline, DB migrations, admin login shell):

1. **Shop details + social media handles** — needed for `LocalBusiness` JSON-LD, footer, contact page, meta tags.
2. **Production domain** — can be deferred; I'll use `clippercartel.test` locally and leave `APP_URL` as a placeholder until you register one.

Everything else is unblocked.
