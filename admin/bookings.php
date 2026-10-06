<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();

$allowed = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
$status  = $_GET['status'] ?? 'all';
if (!in_array($status, $allowed, true)) $status = 'all';

$where  = [];
$params = [];
if ($status !== 'all') {
    $where[]      = 'b.status = :st';
    $params['st'] = $status;
}
if (!empty($_GET['q'])) {
    $where[]     = '(c.name LIKE :q OR c.phone LIKE :q OR b.confirmation_code LIKE :q)';
    $params['q'] = '%' . $_GET['q'] . '%';
}
$whereSql = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

$stmt = $pdo->prepare(
    "SELECT b.*, c.name AS customer_name, c.phone
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       {$whereSql}
      ORDER BY b.starts_at DESC
      LIMIT 200"
);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$initials = static function (string $name): string {
    $parts = preg_split('/\s+/', trim($name));
    $first = mb_substr($parts[0] ?? '', 0, 1);
    $last  = count($parts) > 1 ? mb_substr(end($parts), 0, 1) : '';
    return strtoupper($first . $last) ?: '•';
};
$fmtWhen = static function (string $dt): array {
    $tz = new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC');
    $d  = (new DateTime($dt, new DateTimeZone('UTC')))->setTimezone($tz);
    return [$d->format('D j M'), $d->format('H:i')];
};

admin_header('Bookings', 'bookings');
?>
<header class="admin-head">
  <p class="admin-head__eyebrow">Bookings</p>
  <h1 class="admin-h1">All chairs, past and future.</h1>
</header>

<form class="admin-filters" method="get" action="/admin/bookings">
  <label class="field field--inline">
    <span>Status</span>
    <select name="status">
      <?php foreach ($allowed as $s): ?>
        <option value="<?= $s ?>" <?= $status === $s ? 'selected' : '' ?>><?= ucfirst(str_replace('_', ' ', $s)) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <label class="field field--grow">
    <span>Search</span>
    <input type="search" name="q" placeholder="name, phone or code" value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
  </label>
  <button type="submit" class="btn btn--primary btn--sm">Apply</button>
</form>

<?php if (!$rows): ?>
  <div class="admin-empty">No bookings match this filter.</div>
<?php else: ?>
  <ul class="booking-list">
    <?php foreach ($rows as $b):
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
          <div class="booking-row__code">
            <span>#<?= htmlspecialchars($b['confirmation_code']) ?></span>
            <?= admin_status_pill($b['status']) ?>
          </div>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>

<?php admin_footer();
