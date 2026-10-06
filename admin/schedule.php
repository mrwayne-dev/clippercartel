<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();
$rows = $pdo->query('SELECT * FROM schedule ORDER BY day_of_week ASC')->fetchAll();
// Index by day_of_week for easy lookup.
$byDay = [];
foreach ($rows as $r) $byDay[(int) $r['day_of_week']] = $r;

$days = [0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday', 3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday'];

$timeOff = $pdo->query(
    'SELECT * FROM time_off WHERE ends_at >= NOW() OR ends_at IS NULL ORDER BY starts_at ASC'
)->fetchAll();

admin_header('Hours & time off', 'schedule');
?>
<div class="admin-head">
  <h1 class="admin-h1">Hours & time off</h1>
  <p class="admin-sub">Weekly working window. Time off blocks override it.</p>
</div>

<form action="/admin/actions" method="post" class="admin-card">
  <?= csrfField() ?>
  <input type="hidden" name="action" value="save_schedule">
  <h2 class="admin-h2">Weekly hours</h2>
  <div class="schedule-grid">
    <?php foreach ($days as $d => $label):
      $row = $byDay[$d] ?? ['start_time' => '09:00:00', 'end_time' => '20:00:00', 'is_working' => 1];
      $start = substr($row['start_time'], 0, 5);
      $end   = substr($row['end_time'],   0, 5);
      $isWorking = (int) $row['is_working'];
    ?>
      <div class="schedule-row<?= $isWorking ? '' : ' is-closed' ?>">
        <label class="schedule-row__day">
          <input type="checkbox" name="working[<?= $d ?>]" value="1" <?= $isWorking ? 'checked' : '' ?>>
          <span><?= $label ?></span>
        </label>
        <div class="schedule-row__hours">
          <input type="time" name="start[<?= $d ?>]" value="<?= htmlspecialchars($start) ?>">
          <span class="muted">to</span>
          <input type="time" name="end[<?= $d ?>]"   value="<?= htmlspecialchars($end) ?>">
        </div>
      </div>
    <?php endforeach; ?>
  </div>
  <div class="admin-card__cta">
    <button type="submit" class="btn btn--primary">Save hours</button>
  </div>
</form>

<section class="admin-card">
  <h2 class="admin-h2">Time off</h2>
  <?php if (!$timeOff): ?>
    <p class="admin-empty">Nothing scheduled.</p>
  <?php else: ?>
    <ul class="timeoff-list">
      <?php foreach ($timeOff as $t): ?>
        <li class="timeoff-row">
          <div>
            <strong><?= admin_fmt_datetime($t['starts_at']) ?></strong>
            <span class="muted">→</span>
            <strong><?= admin_fmt_datetime($t['ends_at']) ?></strong>
            <?php if ($t['reason']): ?>
              <small>· <?= htmlspecialchars($t['reason']) ?></small>
            <?php endif; ?>
          </div>
          <form action="/admin/actions" method="post" class="inline-form" onsubmit="return confirm('Remove this time-off block?');">
            <?= csrfField() ?>
            <input type="hidden" name="action"      value="delete_time_off">
            <input type="hidden" name="time_off_id" value="<?= (int) $t['id'] ?>">
            <button type="submit" class="btn btn--danger btn--sm">Remove</button>
          </form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>

  <form action="/admin/actions" method="post" class="admin-form admin-form--row">
    <?= csrfField() ?>
    <input type="hidden" name="action" value="add_time_off">
    <label class="field">
      <span>From</span>
      <input type="datetime-local" name="starts_at" required>
    </label>
    <label class="field">
      <span>Until</span>
      <input type="datetime-local" name="ends_at" required>
    </label>
    <label class="field field--grow">
      <span>Reason <small class="muted">(optional)</small></span>
      <input type="text" name="reason" placeholder="Holiday, training, personal day">
    </label>
    <button type="submit" class="btn btn--primary">Add block</button>
  </form>
</section>

<?php admin_footer();
