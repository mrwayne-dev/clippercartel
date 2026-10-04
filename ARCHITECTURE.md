# Architecture — clippercartel

## Why This Structure

No framework overhead — vanilla PHP and JavaScript with clear ownership boundaries per file. Every folder has exactly one responsibility.

---

## The SPA Pattern

`index.php` is the single HTML shell. The browser loads it once.

1. `assets/js/app.js` — bootstraps on `DOMContentLoaded`, initialises router and global components
2. `assets/js/router.js` — route table mapping URL paths to page modules
3. `assets/js/pages/` — page modules split into `public/`, `user/`, `admin/`
4. `assets/js/components/` — reusable UI (nav, modals, cards)
5. `assets/js/utils/` — stateless helpers (DOM, fetch wrappers, transitions)

`.htaccess` rewrites non-file requests to `index.php` so the router handles navigation without server 404s.

---

## CSS Architecture

| File | Owns |
|------|------|
| `main.css` | Design tokens (`--color-*`, `--font-*`) + box-model reset + body defaults |
| `layout.css` | Page skeleton, containers, grid + flex structural rules |
| `components.css` | Reusable UI patterns: `.btn`, cards, form controls |
| `animations.css` | `@keyframes`, animation utilities, always wrapped in `prefers-reduced-motion` |

---

## JS Layers

| Folder | Responsibility |
|--------|----------------|
| `pages/public/` | Public page modules — accessible to all visitors |
| `pages/user/` | Authenticated page modules — logged-in users only |
| `pages/admin/` | Admin page modules — admin role required |
| `components/` | Reusable UI pieces imported by multiple pages |
| `utils/` | Stateless helpers: DOM queries, fetch wrappers, transitions |
| `services/` | Fetch abstraction layer — typed API call wrappers |
| `lib/` | Third-party adapters and initialisers |


---

## PHP Layer

`api/` contains endpoint files — one concern per file, always returns JSON via `jsonSuccess()` / `jsonError()`.

**config/** vs **includes/** distinction:
- **config/** — bootstrap files loaded once per entry point (`constants.php` loads `env.php`, optionally `database.php`)
- **includes/** — utility files required a-la-carte by specific endpoints

---


## Environment Setup

| Variable | Purpose |
|----------|---------|
| `APP_NAME` | Application name used in emails and titles |
| `APP_URL` | Full base URL — used for reset links and CORS |
| `APP_ENV` | `development` enables error display; `production` suppresses it |
| `DB_HOST / DB_NAME / DB_USER / DB_PASS` | MySQL connection |
| `SESSION_LIFETIME` | Session duration in seconds |
| `SMTP_*` | Email sending credentials (PHPMailer) |
