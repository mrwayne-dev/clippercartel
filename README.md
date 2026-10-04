# clippercartel

> Created by **wayne** on 2026-10-04 using [create-php-starter](https://www.npmjs.com/package/create-php-starter)

_One-line description of what this project does._

---

## Tech Stack

- PHP >=7.4
- Vanilla JavaScript (SPA pattern)
- CSS Custom Properties
- PHPMailer (Composer)
- Phosphor Icons

---

## Folder Structure

```
project-name/
|-- index.php                  <- SPA shell (SEO, OG meta, CSS, app.js)
|-- assets/
|   |-- css/
|   |   |-- main.css           <- CSS custom properties + reset
|   |   |-- layout.css         <- grid, flex, structural layout
|   |   |-- components.css     <- buttons, cards, forms
|   |   +-- animations.css     <- keyframes + motion utilities
|   |-- js/
|   |   |-- app.js             <- SPA entry point + bootstrapper
|   |   |-- router.js          <- client-side route definitions
|   |   |-- pages/
|   |   |   |-- public/        <- public page modules (home, about, contact)
|   |   |   |-- user/          <- authenticated user page modules
|   |   |   +-- admin/         <- admin page modules
|   |   |-- components/        <- reusable UI (nav, modals, etc.)
|   |   +-- utils/             <- helpers: dom.js, api.js, transitions.js
|   |   |-- services/        <- fetch abstraction / API wrappers
|   |   +-- lib/             <- third-party adapters
|   |-- fonts/
|   |-- images/
|   +-- favicon/
|-- api/
|   |-- contact.php           <- contact form handler
|   +-- admin/                <- admin-only API endpoints
|   +-- v1/                   <- versioned API (reserved)
|-- config/
|   |-- constants.php          <- app constants + error config
|   |-- env.php                <- .env loader
|   +-- responses.php          <- jsonSuccess() / jsonError()
|-- includes/
|   |-- headers.php            <- CORS + Content-Type
|   +-- helpers.php            <- sanitize() + validateEmail()
|   +-- rate_limit.php        <- session-based rate limiter
|   +-- mailer.php            <- PHPMailer wrapper
|-- .env                         <- local credentials (gitignored)
|-- .env.example                 <- credentials template
|-- .htaccess
|-- .gitignore
+-- uploads/                     <- user uploads (gitignored)
```

---

## Pages Architecture

This project separates pages into three tiers — mirrored in both the PHP layer and the JS layer:

| Tier | PHP (server-rendered) | JS (SPA modules) |
|------|-----------------------|------------------|
| Public | `pages/public/` | `assets/js/pages/public/` |
| User | `pages/user/` | `assets/js/pages/user/` |
| Admin | `pages/admin/` | `assets/js/pages/admin/` |

- **public/** — no authentication required (login, register, password reset)
- **user/** — requires `requireAuth()` — logged-in users only
- **admin/** — requires `requireAdmin()` — admin role only

---

## Getting Started

```bash
edit .env   # fill in DB and SMTP credentials
composer install
php -S localhost:8000
```

---

## Architecture Notes

- `assets/js/app.js` bootstraps the app on `DOMContentLoaded`
- `assets/js/router.js` maps URL paths to page modules
- `assets/js/pages/` contains page-level view modules (split public/user/admin)
- `assets/js/components/` contains reusable UI pieces
- `assets/js/utils/` contains helpers (DOM, API calls, transitions)
- `.htaccess` rewrites unknown paths to `index.php` to enable SPA navigation

---

## Features

- Framework: **vanilla** | Type: **business** | Complexity: **medium**
- Admin panel (`/pages/admin/dashboard.php`)
- Contact form with rate limiting
- PHPMailer (SMTP email via Composer)
- Phosphor Icons (via CDN — added to index.php)
