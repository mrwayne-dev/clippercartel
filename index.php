<?php
require_once __DIR__ . '/config/env.php';
require_once __DIR__ . '/config/constants.php';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>clippercartel</title>

  <!-- SEO -->
  <meta name="description" content="<!-- Add your site description here -->">
  <meta name="robots" content="index, follow">

  <!-- Open Graph -->
  <meta property="og:title"       content="clippercartel">
  <meta property="og:description" content="<!-- Add your site description here -->">
  <meta property="og:image"       content="/assets/images/og/og-image.jpg">
  <meta property="og:url"         content="https://yourdomain.com">
  <meta property="og:type"        content="website">
  <meta property="og:site_name"   content="clippercartel">

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="clippercartel">
  <meta name="twitter:description" content="<!-- Add your site description here -->">
  <meta name="twitter:image"       content="/assets/images/og/og-image.jpg">

  <!-- Theme -->
  <meta name="theme-color" content="#ffffff">

  <!-- Canonical -->
  <link rel="canonical" href="https://yourdomain.com">

  <!-- Font Preloads — update paths once you add your fonts to assets/fonts/ -->
  <!--
  <link rel="preload" href="/assets/fonts/YourFont-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/YourFont-Bold.woff2"    as="font" type="font/woff2" crossorigin>
  -->

  <!-- Google Fonts — uncomment and replace with your chosen font -->
  <!--
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  -->

  <!-- CSS -->
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/layout.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/animations.css">

  <!-- Phosphor Icons -->
  <script src="https://unpkg.com/@phosphor-icons/web" defer></script>

</head>
<body>

  <nav    id="nav"          aria-label="Main navigation"></nav>
  <main   id="app"          role="main"></main>
  <footer id="site-footer"  aria-label="Site footer"></footer>

  <!-- App Entry Point -->
  <script type="module" src="/assets/js/app.js"></script>

</body>
</html>
