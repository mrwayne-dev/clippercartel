<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();
$tz  = new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC');
$now = new DateTime('now', $tz);
$startOfToday = (clone $now)->setTime(0, 0, 0)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
$endOfToday   = (clone $now)->setTime(23, 59, 59)->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');

/* Pending (needs owner's attention) — ordered by soonest. */
$pending = $pdo->prepare(
    "SELECT b.*, c.phone, c.name AS customer_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
      WHERE b.status = 'pending'
      ORDER BY b.starts_at ASC"
);
$pending->execute();
$pending = $pending->fetchAll();

/* Today's lineup — any confirmed booking happening today. */
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

/* Unread messages — contact-form inbox. */
$unread = (int) $pdo->query('SELECT COUNT(*) FROM messages WHERE is_read = 0')->fetchColumn();

/* Headline counters. */
$counts = $pdo->query("
    SELECT
      SUM(status='pending')   AS pending_total,
      SUM(status='confirmed') AS confirmed_total,
      SUM(starts_at >= CURDATE() AND starts_at < CURDATE() + INTERVAL 7 DAY) AS week_total
    FROM bookings
")->fetch();

admin_header('Overview', 'index');
?>
<div class="admin-head">
  <h1 class="admin-h1">Hi, <?= htmlspecialchars(explode(' ', $admin['name'])[0] ?: $admin['email']) ?>.</h1>
  <p class="admin-sub"><?= $now->format('l, j F Y · H:i') ?></p>
</div>

<section class="admin-stats">
  <a class="stat" href="/admin/bookings?status=pending">
    <span class="stat__label">Pending</span>
    <span class="stat__value"><?= (int) $counts['pending_total'] ?></span>
  </a>
  <a class="stat" href="/admin/bookings?status=confirmed">
    <span class="stat__label">Confirmed</span>
    <span class="stat__value"><?= (int) $counts['confirmed_total'] ?></span>
  </a>
  <a class="stat" href="/admin/bookings">
    <span class="stat__label">Next 7 days</span>
    <span class="stat__value"><?= (int) $counts['week_total'] ?></span>
  </a>
  <a class="stat" href="/admin/messages">
    <span class="stat__label">Unread msgs</span>
    <span class="stat__value"><?= $unread ?></span>
  </a>
</section>

<section class="admin-section">
  <div class="admin-section__head">
    <h2 class="admin-h2">Pending bookings</h2>
    <?php if ($pending): ?><span class="admin-count"><?= count($pending) ?></span><?php endif; ?>
  </div>
  <?php if (!$pending): ?>
    <p class="admin-empty">Nothing waiting. All caught up.</p>
  <?php else: ?>
    <ul class="booking-list">
      <?php foreach ($pending as $b): ?>
        <li class="booking-row">
          <a class="booking-row__main" href="/admin/booking?id=<?= (int) $b['id'] ?>">
            <div class="booking-row__when"><?= admin_fmt_datetime($b['starts_at']) ?></div>
            <div class="booking-row__who"><?= htmlspecialchars($b['customer_name']) ?></div>
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
  <div class="admin-section__head">
    <h2 class="admin-h2">Today</h2>
    <?php if ($today): ?><span class="admin-count"><?= count($today) ?></span><?php endif; ?>
  </div>
  <?php if (!$today): ?>
    <p class="admin-empty">No chairs booked for today.</p>
  <?php else: ?>
    <ul class="booking-list">
      <?php foreach ($today as $b): ?>
        <li class="booking-row">
          <a class="booking-row__main" href="/admin/booking?id=<?= (int) $b['id'] ?>">
            <div class="booking-row__when"><?= admin_fmt_datetime($b['starts_at']) ?></div>
            <div class="booking-row__who"><?= htmlspecialchars($b['customer_name']) ?></div>
            <div class="booking-row__svc"><?= htmlspecialchars($b['service_name']) ?></div>
            <div class="booking-row__code"><?= admin_status_pill($b['status']) ?></div>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
</section>

<?php admin_footer();
