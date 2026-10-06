<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();

$allowed = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'];
$status  = $_GET['status'] ?? 'all';
if (!in_array($status, $allowed, true)) $status = 'all';

$where  = [];
$params = [];
if ($status !== 'all') {
    $where[]           = 'b.status = :st';
    $params['st']      = $status;
}
if (!empty($_GET['q'])) {
    $where[]           = '(c.name LIKE :q OR c.phone LIKE :q OR b.confirmation_code LIKE :q)';
    $params['q']       = '%' . $_GET['q'] . '%';
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

admin_header('Bookings', 'bookings');
?>
<div class="admin-head">
  <h1 class="admin-h1">Bookings</h1>
</div>

<form class="admin-filters" method="get" action="/admin/bookings">
  <label class="field field--inline">
    <span>Status</span>
    <select name="status">
      <?php foreach ($allowed as $s): ?>
        <option value="<?= $s ?>" <?= $status === $s ? 'selected' : '' ?>><?= ucfirst(str_replace('_',' ', $s)) ?></option>
      <?php endforeach; ?>
    </select>
  </label>
  <label class="field field--inline">
    <span>Search</span>
    <input type="search" name="q" placeholder="name, phone, code" value="<?= htmlspecialchars($_GET['q'] ?? '') ?>">
  </label>
  <button type="submit" class="btn btn--primary btn--sm">Filter</button>
</form>

<?php if (!$rows): ?>
  <p class="admin-empty">No bookings match that filter.</p>
<?php else: ?>
  <ul class="booking-list">
    <?php foreach ($rows as $b): ?>
      <li class="booking-row">
        <a class="booking-row__main" href="/admin/booking?id=<?= (int) $b['id'] ?>">
          <div class="booking-row__when"><?= admin_fmt_datetime($b['starts_at']) ?></div>
          <div class="booking-row__who">
            <?= htmlspecialchars($b['customer_name']) ?>
            <small class="booking-row__phone"><?= htmlspecialchars($b['phone']) ?></small>
          </div>
          <div class="booking-row__svc"><?= htmlspecialchars($b['service_name']) ?></div>
          <div class="booking-row__code">
            #<?= htmlspecialchars($b['confirmation_code']) ?>
            <?= admin_status_pill($b['status']) ?>
          </div>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>

<?php admin_footer();
