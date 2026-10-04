<?php
/**
 * clippercartel — SPA shell.
 *
 * Single HTML document served for every public route. app.js + router.js
 * handle navigation client-side; .htaccess rewrites unknown paths here.
 *
 * Per-route <title>, meta description, OG tags, canonical and JSON-LD are
 * injected at runtime from the route table (assets/js/router.js). The values
 * below are defaults for the home route and first paint.
 */

require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/constants.php';

$appUrl   = rtrim(getenv('APP_URL') ?: 'https://clippercartel.test', '/');
$appName  = getenv('APP_NAME') ?: 'ClipperCartel';
$defaultDescription = 'ClipperCartel. Precision cuts, hot-towel shaves and beard sculpts in Port Harcourt. Book your chair.';

$shop = [
    'phone'    => getenv('SHOP_PHONE_E164') ?: '',
    'street'   => getenv('SHOP_ADDRESS_STREET') ?: '',
    'city'     => getenv('SHOP_ADDRESS_CITY')   ?: '',
    'region'   => getenv('SHOP_ADDRESS_REGION') ?: '',
    'country'  => getenv('SHOP_ADDRESS_COUNTRY') ?: '',
    'maps'     => getenv('SHOP_MAPS_URL') ?: '',
    'hours'    => getenv('SHOP_HOURS') ?: '',
];

// Build openingHoursSpecification for JSON-LD.
// All weekdays NOT in SHOP_HOURS_CLOSED_DAYS open [OPEN, CLOSE].
$weekdays   = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
$closedDays = array_filter(array_map('trim', explode(',', (string) getenv('SHOP_HOURS_CLOSED_DAYS'))));
$openDays   = array_values(array_diff($weekdays, $closedDays));
$openingSpec = $openDays ? [[
    '@type'     => 'OpeningHoursSpecification',
    'dayOfWeek' => $openDays,
    'opens'     => getenv('SHOP_HOURS_OPEN')  ?: '09:00',
    'closes'    => getenv('SHOP_HOURS_CLOSE') ?: '20:00',
]] : [];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="color-scheme" content="dark light">
  <meta name="theme-color" content="#ffffff">
  <meta name="format-detection" content="telephone=no">

  <title><?= htmlspecialchars($appName) ?></title>

  <!-- SEO: router overwrites these per route via /assets/js/utils/meta.js -->
  <meta name="description" content="<?= htmlspecialchars($defaultDescription) ?>">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="author" content="<?= htmlspecialchars($appName) ?>">
  <link rel="canonical" href="<?= htmlspecialchars($appUrl) ?>/">

  <!-- Open Graph -->
  <meta property="og:site_name"   content="<?= htmlspecialchars($appName) ?>">
  <meta property="og:type"        content="website">
  <meta property="og:title"       content="<?= htmlspecialchars($appName) ?>">
  <meta property="og:description" content="<?= htmlspecialchars($defaultDescription) ?>">
  <meta property="og:url"         content="<?= htmlspecialchars($appUrl) ?>/">
  <meta property="og:image"       content="<?= htmlspecialchars($appUrl) ?>/assets/images/og/og-default.jpg">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="<?= htmlspecialchars($appName) ?>">
  <meta name="twitter:description" content="<?= htmlspecialchars($defaultDescription) ?>">
  <meta name="twitter:image"       content="<?= htmlspecialchars($appUrl) ?>/assets/images/og/og-default.jpg">

  <!-- Favicon -->
  <link rel="icon" href="/assets/favicon/favicon.ico" sizes="any">
  <link rel="icon" href="/assets/favicon/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/favicon/apple-touch-icon.png">

  <!-- Font preloads — self-hosted, highest-priority payload -->
  <link rel="preload" href="/assets/fonts/kudryashev/KudryashevDisplay.woff2"                as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/instrument-serif/InstrumentSerif-Italic.woff2"     as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/Switzer-400.woff2"                                 as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/Switzer-500.woff2"                                 as="font" type="font/woff2" crossorigin>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/animations.css">
  <link rel="stylesheet" href="/assets/css/hero.css">
  <link rel="stylesheet" href="/assets/css/services-teaser.css">
  <link rel="stylesheet" href="/assets/css/signature-work.css">
  <link rel="stylesheet" href="/assets/css/about-teaser.css">
  <link rel="stylesheet" href="/assets/css/gallery-marquee.css">
  <link rel="stylesheet" href="/assets/css/reviews-teaser.css">

  <!-- JSON-LD: HairSalon LocalBusiness -->
  <script type="application/ld+json" id="ld-business">
  <?= json_encode(array_filter([
      '@context'    => 'https://schema.org',
      '@type'       => 'HairSalon',
      'name'        => $appName,
      'url'         => $appUrl,
      'image'       => $appUrl . '/assets/images/og/og-default.jpg',
      'telephone'   => $shop['phone'],
      'priceRange'  => '$$',
      'description' => $defaultDescription,
      'address'     => [
          '@type'           => 'PostalAddress',
          'streetAddress'   => $shop['street'],
          'addressLocality' => $shop['city'],
          'addressRegion'   => $shop['region'],
          'addressCountry'  => $shop['country'],
      ],
      'hasMap'      => $shop['maps'] ?: null,
      'areaServed'  => $shop['city'],
      'sameAs'      => array_values(array_filter([
          getenv('SHOP_INSTAGRAM') ?: null,
          getenv('SHOP_TIKTOK')    ?: null,
      ])),
      'openingHoursSpecification' => $openingSpec,
  ]), JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) ?>
  </script>

  <!-- Per-route JSON-LD injected here by meta.js -->
  <script type="application/ld+json" id="ld-route"></script>
</head>
<body
    data-shop-name="<?= htmlspecialchars($appName) ?>"
    data-shop-phone="<?= htmlspecialchars(getenv('SHOP_PHONE') ?: '') ?>"
    data-shop-phone-e164="<?= htmlspecialchars($shop['phone']) ?>"
    data-shop-whatsapp="<?= htmlspecialchars(getenv('SHOP_WHATSAPP') ?: '') ?>"
    data-shop-address="<?= htmlspecialchars(getenv('SHOP_ADDRESS') ?: '') ?>"
    data-shop-hours="<?= htmlspecialchars($shop['hours']) ?>"
    data-shop-instagram="<?= htmlspecialchars(getenv('SHOP_INSTAGRAM') ?: '') ?>"
    data-shop-tiktok="<?= htmlspecialchars(getenv('SHOP_TIKTOK') ?: '') ?>"
    data-shop-maps="<?= htmlspecialchars($shop['maps']) ?>">

  <a class="skip-link" href="#app">Skip to content</a>

  <nav    id="nav"         aria-label="Main navigation"></nav>
  <main   id="app"         role="main" tabindex="-1"></main>
  <footer id="site-footer" aria-label="Site footer"></footer>

  <!-- SPA entry -->
  <script type="module" src="/assets/js/app.js"></script>

  <!-- No-JS fallback -->
  <noscript>
    <div style="padding:2rem;max-width:60ch;margin:0 auto;font-family:sans-serif;">
      <h1><?= htmlspecialchars($appName) ?></h1>
      <p>This site requires JavaScript to view bookings and gallery.
      Please enable it, or call us to book directly.</p>
    </div>
  </noscript>
</body>
</html>
