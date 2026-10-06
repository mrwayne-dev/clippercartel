<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();
$tz  = new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC');
$now = new DateTime('now', $tz);
$startOfToday = (clone $now)->setTime(0, 0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
$endOfToday   = (clone $now)->setTime(23, 59, 59)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');

$pending = $pdo->prepare(
    "SELECT b.*, c.phone, c.name AS customer_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
      WHERE b.status = 'pending'
      ORDER BY b.starts_at ASC"
);
$pending->execute();
$pending = $pending->fetchAll();

$today = $pdo->prepare(
    "SELECT b.*, c.phone, c.name AS customer_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
      WHERE b.starts_at BETWEEN :s AND :e
        AND b.status IN ('confirmed','completed','no_show','pending')
      ORDER BY b.starts_at ASC"
);
$today->execute(['s' => $startOfToday, 'e' => $endOfToday]);
$today = $today->fetchAll();

$unread = (int) $pdo->query('SELECT COUNT(*) FROM messages WHERE is_read = 0')->fetchColumn();
$counts = $pdo->query("
    SELECT
      SUM(status='pending')   AS pending_total,
      SUM(status='confirmed') AS confirmed_total,
      SUM(starts_at >= CURDATE() AND starts_at < CURDATE() + INTERVAL 7 DAY) AS week_total
    FROM bookings
")->fetch();

/* Avatar initials from a name (max 2 chars). */
$initials = static function (string $name): string {
    $parts = preg_split('/\s+/', trim($name));
    $first = mb_substr($parts[0] ?? '', 0, 1);
    $last  = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';
    return strtoupper($first . $last) ?: '•';
};

/* Format absolute datetime as two lines (date on top, time below). */
$fmtWhen = static function (string $dt): array {
    $tz = new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC');
    $d  = (new DateTime($dt, new DateTimeZone('UTC')))->setTimezone($tz);
    return [$d->format('D j M'), $d->format('H:i')];
};

admin_header('Overview', 'index');
?>
<header class="admin-head">
  <p class="admin-head__eyebrow">Overview</p>
  <h1 class="admin-h1">Hi, <?= htmlspecialchars(explode(' ', $admin['name'])[0] ?: $admin['email']) ?>.</h1>
  <p class="admin-sub"><?= $now->format('l, j F Y · H:i') ?> · <?= htmlspecialchars(getenv('APP_TIMEZONE') ?: 'UTC') ?></p>
</header>

<section class="admin-stats">
  <a class="stat stat--warn" href="/admin/bookings?status=pending">
    <div class="stat__top">
      <span class="stat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
      </span>
      <span class="stat__trail">needs you →</span>
    </div>
    <span class="stat__label">Pending</span>
    <span class="stat__value"><?= (int) $counts['pending_total'] ?></span>
  </a>

  <a class="stat stat--ok" href="/admin/bookings?status=confirmed">
    <div class="stat__top">
      <span class="stat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </span>
    </div>
    <span class="stat__label">Confirmed</span>
    <span class="stat__value"><?= (int) $counts['confirmed_total'] ?></span>
  </a>

  <a class="stat" href="/admin/bookings">
    <div class="stat__top">
      <span class="stat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
      </span>
    </div>
    <span class="stat__label">Next 7 days</span>
    <span class="stat__value"><?= (int) $counts['week_total'] ?></span>
  </a>

  <a class="stat <?= $unread > 0 ? 'stat--warn' : '' ?>" href="/admin/messages">
    <div class="stat__top">
      <span class="stat__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
      </span>
    </div>
    <span class="stat__label">Unread messages</span>
    <span class="stat__value"><?= $unread ?></span>
  </a>
</section>

<section class="admin-section">
  <header class="admin-section__head">
    <div class="admin-section__title">
      <h2 class="admin-h2">Pending bookings</h2>
      <?php if ($pending): ?><span class="admin-count"><?= count($pending) ?></span><?php endif; ?>
    </div>
    <?php if ($pending): ?>
      <a class="admin-section__link" href="/admin/bookings?status=pending">See all →</a>
    <?php endif; ?>
  </header>

  <?php if (!$pending): ?>
    <div class="admin-empty">
      All caught up. Nothing waiting on you.
    </div>
  <?php else: ?>
    <ul class="booking-list">
      <?php foreach ($pending as $b):
        [$whenDate, $whenTime] = $fmtWhen($b['starts_at']);
      ?>
        <li class="booking-row">
          <a class="booking-row__main" href="/admin/booking?id=<?= (int) $b['id'] ?>">
            <span class="avatar" aria-hidden="true"><?= htmlspecialchars($initials($b['customer_name'])) ?></span>
            <div class="booking-row__when">
              <strong><?= htmlspecialchars($whenTime) ?></strong>
              <small><?= htmlspecialchars($whenDate) ?></small>
            </div>
            <div class="booking-row__who">
              <strong><?= htmlspecialchars($b['customer_name']) ?></strong>
              <span class="booking-row__phone"><?= htmlspecialchars($b['phone']) ?></span>
            </div>
            <div class="booking-row__svc"><?= htmlspecialchars($b['service_name']) ?></div>
            <div class="booking-row__code">#<?= htmlspecialchars($b['confirmation_code']) ?></div>
          </a>
          <form action="/admin/actions" method="post" class="booking-row__quick">
            <?= csrfField() ?>
            <input type="hidden" name="booking_id" value="<?= (int) $b['id'] ?>">
            <input type="hidden" name="action"     value="confirm">
            <button type="submit" class="btn btn--ok btn--sm">Confirm</button>
          </form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</section>

<section class="admin-section">
  <header class="admin-section__head">
    <div class="admin-section__title">
      <h2 class="admin-h2">Today</h2>
      <?php if ($today): ?><span class="admin-count"><?= count($today) ?></span><?php endif; ?>
    </div>
  </header>

  <?php if (!$today): ?>
    <div class="admin-empty">No chairs booked for today.</div>
  <?php else: ?>
    <ul class="booking-list">
      <?php foreach ($today as $b):
        [$whenDate, $whenTime] = $fmtWhen($b['starts_at']);
      ?>
        <li class="booking-row">
          <a class="booking-row__main" href="/admin/booking?id=<?= (int) $b['id'] ?>">
            <span class="avatar" aria-hidden="true"><?= htmlspecialchars($initials($b['customer_name'])) ?></span>
            <div class="booking-row__when">
              <strong><?= htmlspecialchars($whenTime) ?></strong>
              <small><?= htmlspecialchars($whenDate) ?></small>
            </div>
            <div class="booking-row__who">
              <strong><?= htmlspecialchars($b['customer_name']) ?></strong>
              <span class="booking-row__phone"><?= htmlspecialchars($b['phone']) ?></span>
            </div>
            <div class="booking-row__svc"><?= htmlspecialchars($b['service_name']) ?></div>
            <div class="booking-row__code"><?= admin_status_pill($b['status']) ?></div>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</section>

<?php admin_footer();
