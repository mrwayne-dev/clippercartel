<?php
require_once __DIR__ . '/_boot.php';

$id = (int) ($_GET['id'] ?? 0);
if (!$id) { flash('error', 'Missing booking id.'); header('Location: /admin/bookings'); exit; }

$pdo = db();
$stmt = $pdo->prepare(
    'SELECT b.*, c.name AS customer_name, c.phone, c.email AS customer_email
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
      WHERE b.id = :id LIMIT 1'
);
$stmt->execute(['id' => $id]);
$b = $stmt->fetch();
if (!$b) { flash('error', 'Booking not found.'); header('Location: /admin/bookings'); exit; }

// Transitions allowed from each status.
$transitions = [
    'pending'   => ['confirm' => 'Confirm',   'cancel' => 'Decline'],
    'confirmed' => ['complete' => 'Mark done', 'no_show' => 'No-show', 'cancel' => 'Cancel'],
    'completed' => [],
    'cancelled' => ['confirm' => 'Re-open'],
    'no_show'   => ['confirm' => 'Re-open'],
];
$available = $transitions[$b['status']] ?? [];

// Pre-built WhatsApp message to the customer.
$waMessage = "Hi " . $b['customer_name'] . ", confirming your booking: "
           . $b['service_name'] . " · "
           . (new DateTime($b['starts_at'], new DateTimeZone('UTC')))
                 ->setTimezone(new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC'))
                 ->format('l j M · H:i')
           . ". Code " . $b['confirmation_code'] . ". — ClipperCartel";
$waPhone   = preg_replace('/\D+/', '', $b['phone']);
$waLink    = 'https://wa.me/' . $waPhone . '?text=' . rawurlencode($waMessage);

admin_header('Booking · ' . $b['confirmation_code'], 'bookings');
?>
<div class="admin-head admin-head--split">
  <div>
    <p class="admin-breadcrumb"><a href="/admin/bookings">← Bookings</a></p>
    <h1 class="admin-h1">#<?= htmlspecialchars($b['confirmation_code']) ?></h1>
    <p class="admin-sub"><?= admin_status_pill($b['status']) ?></p>
  </div>
</div>

<section class="admin-card">
  <h2 class="admin-h2">Appointment</h2>
  <dl class="kv">
    <dt>When</dt>      <dd><?= admin_fmt_datetime($b['starts_at']) ?> → <?= admin_fmt_datetime($b['ends_at']) ?></dd>
    <dt>Service</dt>   <dd><?= htmlspecialchars($b['service_name']) ?></dd>
    <?php if ($b['price_cents_at_booking']): ?>
      <dt>Price (snap)</dt><dd><?= number_format($b['price_cents_at_booking'] / 100, 2) ?></dd>
    <?php endif; ?>
    <dt>Status</dt>    <dd><?= admin_status_pill($b['status']) ?></dd>
    <dt>Created</dt>   <dd><?= admin_fmt_datetime($b['created_at']) ?></dd>
    <?php if ($b['notes']): ?>
      <dt>Notes</dt><dd class="pre"><?= nl2br(htmlspecialchars($b['notes'])) ?></dd>
    <?php endif; ?>
  </dl>
</section>

<section class="admin-card">
  <h2 class="admin-h2">Customer</h2>
  <dl class="kv">
    <dt>Name</dt>  <dd><?= htmlspecialchars($b['customer_name']) ?></dd>
    <dt>Phone</dt> <dd><a href="tel:<?= htmlspecialchars($b['phone']) ?>"><?= htmlspecialchars($b['phone']) ?></a></dd>
    <?php if ($b['customer_email']): ?>
      <dt>Email</dt><dd><a href="mailto:<?= htmlspecialchars($b['customer_email']) ?>"><?= htmlspecialchars($b['customer_email']) ?></a></dd>
    <?php endif; ?>
  </dl>
  <div class="admin-card__cta">
    <a href="<?= htmlspecialchars($waLink) ?>" target="_blank" rel="noopener" class="btn btn--primary">Message on WhatsApp</a>
  </div>
</section>

<?php if ($available): ?>
<section class="admin-card">
  <h2 class="admin-h2">Change status</h2>
  <div class="admin-actions">
    <?php foreach ($available as $act => $label):
          $tone = match($act) {
              'confirm'  => 'ok',
              'complete' => 'primary',
              'no_show'  => 'warn',
              'cancel'   => 'danger',
              default    => 'muted',
          };
    ?>
      <form action="/admin/actions" method="post" class="inline-form">
        <?= csrfField() ?>
        <input type="hidden" name="booking_id" value="<?= (int) $b['id'] ?>">
        <input type="hidden" name="action"     value="<?= $act ?>">
        <button type="submit" class="btn btn--<?= $tone ?>"><?= htmlspecialchars($label) ?></button>
      </form>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<?php admin_footer();
