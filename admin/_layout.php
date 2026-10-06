<?php
/**
 * admin/_layout.php — admin_header() + admin_footer() render helpers.
 *
 * Keep the chrome tight: a top bar with the shop name, a few nav links,
 * logout. No GSAP, no fonts to preload — admin is a utility, not a
 * showroom. One stylesheet, one small JS block for the mobile menu.
 */

function admin_header(string $title = 'Admin', string $active = '', string $bodyClass = ''): void {
    $admin = currentAdmin();
    $flashes = flashPull();
    $appName = getenv('APP_NAME') ?: 'ClipperCartel';
    $nav = [
        'index'    => ['href' => '/admin',           'label' => 'Overview'],
        'bookings' => ['href' => '/admin/bookings',  'label' => 'Bookings'],
        'messages' => ['href' => '/admin/messages',  'label' => 'Messages'],
        'schedule' => ['href' => '/admin/schedule',  'label' => 'Hours'],
    ];
    ?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <meta name="color-scheme" content="light">
  <title><?= htmlspecialchars($title) ?> · <?= htmlspecialchars($appName) ?></title>
  <link rel="icon" href="/assets/favicon/icon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/admin.css">
</head>
<body class="admin<?= $bodyClass ? ' ' . htmlspecialchars($bodyClass) : '' ?>">
  <?php if ($admin): ?>
  <header class="admin-topbar">
    <a class="admin-brand" href="/admin">
      <span class="admin-brand__name"><?= htmlspecialchars($appName) ?></span>
      <span class="admin-brand__tag">admin</span>
    </a>
    <button class="admin-menu-btn" aria-expanded="false" aria-controls="admin-nav" aria-label="Toggle navigation">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="4" y1="7"  x2="20" y2="7"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="17" x2="20" y2="17"/>
      </svg>
    </button>
    <nav id="admin-nav" class="admin-nav" aria-label="Admin sections">
      <?php foreach ($nav as $key => $item): ?>
        <a href="<?= $item['href'] ?>" class="admin-nav__link<?= $active === $key ? ' is-active' : '' ?>"><?= htmlspecialchars($item['label']) ?></a>
      <?php endforeach; ?>
      <form action="/admin/logout" method="post" class="admin-nav__logout">
        <?= csrfField() ?>
        <button type="submit" class="admin-nav__link admin-nav__link--logout">Log out</button>
      </form>
    </nav>
  </header>
  <?php endif; ?>

  <?php if ($flashes): ?>
    <ul class="flash-queue" hidden>
      <?php foreach ($flashes as $f): ?>
        <li data-type="<?= htmlspecialchars($f['type']) ?>"><?= htmlspecialchars($f['message']) ?></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <?php if ($admin): ?>
  <main class="admin-main">
  <?php endif;
}

function admin_footer(bool $hasMain = true): void {
    if ($hasMain) echo '</main>';
    ?>
  <script src="/assets/js/admin.js" defer></script>
</body>
</html>
    <?php
}

/** Format a datetime string from the DB in the shop's local tz. */
function admin_fmt_datetime(string $dt): string {
    try {
        $d = new DateTime($dt, new DateTimeZone('UTC'));
        $d->setTimezone(new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC'));
        return $d->format('D j M · H:i');
    } catch (Throwable $e) {
        return $dt;
    }
}

/** Short status pill. */
function admin_status_pill(string $status): string {
    $map = [
        'pending'   => ['Pending',   'warn'],
        'confirmed' => ['Confirmed', 'ok'],
        'completed' => ['Completed', 'muted'],
        'cancelled' => ['Cancelled', 'danger'],
        'no_show'   => ['No-show',   'danger'],
    ];
    [$label, $tone] = $map[$status] ?? [ucfirst($status), 'muted'];
    return '<span class="pill pill--' . $tone . '">' . htmlspecialchars($label) . '</span>';
}
