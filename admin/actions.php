<?php
/**
 * admin/actions.php — single POST handler for admin state changes.
 *
 * Branches on the `action` field:
 *   - confirm   : pending → confirmed    (or any → confirmed as "re-open")
 *   - complete  : confirmed → completed
 *   - cancel    : * → cancelled
 *   - no_show   : * → no_show
 *   - mark_read : messages.is_read = 1
 *   - delete_message : messages row removed
 *
 * Status changes get a Telegram ping to the owner noting what was flipped
 * (useful for the owner's audit trail in his own chat with the bot).
 */

require_once __DIR__ . '/_boot.php';
require_once __DIR__ . '/../includes/telegram.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /admin'); exit;
}
csrfCheck();

$pdo    = db();
$action = (string)($_POST['action'] ?? '');
$back   = $_SERVER['HTTP_REFERER'] ?? '/admin';
if (!str_starts_with($back, '/admin') && !str_contains($back, (getenv('APP_URL') ?: ''))) {
    $back = '/admin';
}

/* ---------- booking status changes ---------- */
if (in_array($action, ['confirm','complete','cancel','no_show'], true)) {
    $id = (int)($_POST['booking_id'] ?? 0);
    if (!$id) { flash('error', 'Missing booking id.'); header("Location: {$back}"); exit; }

    $stmt = $pdo->prepare(
        'SELECT b.*, c.name AS customer_name, c.phone
           FROM bookings b JOIN customers c ON c.id = b.customer_id
          WHERE b.id = :id LIMIT 1'
    );
    $stmt->execute(['id' => $id]);
    $b = $stmt->fetch();
    if (!$b) { flash('error', 'Booking not found.'); header("Location: {$back}"); exit; }

    $new = match($action) {
        'confirm'  => 'confirmed',
        'complete' => 'completed',
        'cancel'   => 'cancelled',
        'no_show'  => 'no_show',
    };

    $pdo->prepare('UPDATE bookings SET status = :s WHERE id = :id')
        ->execute(['s' => $new, 'id' => $id]);

    if ($action === 'no_show') {
        $pdo->prepare('UPDATE customers SET no_show_count = no_show_count + 1 WHERE id = :id')
            ->execute(['id' => $b['customer_id']]);
    }

    // Audit ping (owner's own chat with the bot).
    $when = (new DateTime($b['starts_at'], new DateTimeZone('UTC')))
            ->setTimezone(new DateTimeZone(getenv('APP_TIMEZONE') ?: 'UTC'))
            ->format('D j M · H:i');
    sendTelegram(
        "<i>Status change · #{$b['confirmation_code']}</i>\n"
      . "{$b['customer_name']} · {$b['service_name']} · {$when}\n"
      . "→ <b>" . ucfirst(str_replace('_', ' ', $new)) . "</b>"
    );

    flash('ok', "Booking #{$b['confirmation_code']} → " . ucfirst(str_replace('_',' ',$new)) . '.');
    header("Location: {$back}");
    exit;
}

/* ---------- message inbox actions ---------- */
if ($action === 'mark_read' || $action === 'mark_unread') {
    $id = (int)($_POST['message_id'] ?? 0);
    if (!$id) { flash('error', 'Missing message id.'); header("Location: {$back}"); exit; }
    $pdo->prepare('UPDATE messages SET is_read = :r WHERE id = :id')
        ->execute(['r' => $action === 'mark_read' ? 1 : 0, 'id' => $id]);
    flash('ok', $action === 'mark_read' ? 'Marked read.' : 'Marked unread.');
    header("Location: {$back}"); exit;
}

if ($action === 'delete_message') {
    $id = (int)($_POST['message_id'] ?? 0);
    if (!$id) { flash('error', 'Missing message id.'); header("Location: {$back}"); exit; }
    $pdo->prepare('DELETE FROM messages WHERE id = :id')->execute(['id' => $id]);
    flash('ok', 'Message deleted.');
    header('Location: /admin/messages'); exit;
}

/* ---------- schedule save ---------- */
if ($action === 'save_schedule') {
    $open = $_POST['start'] ?? [];
    $close = $_POST['end'] ?? [];
    $working = $_POST['working'] ?? [];
    $stmt = $pdo->prepare(
        'UPDATE schedule SET start_time = :s, end_time = :e, is_working = :w WHERE day_of_week = :d'
    );
    foreach (range(0, 6) as $d) {
        $s = $open[$d]  ?? '09:00';
        $e = $close[$d] ?? '20:00';
        $w = isset($working[$d]) ? 1 : 0;
        // Light validation — HTML time inputs give HH:MM already.
        if (!preg_match('/^\d{2}:\d{2}$/', $s)) $s = '09:00';
        if (!preg_match('/^\d{2}:\d{2}$/', $e)) $e = '20:00';
        $stmt->execute(['d' => $d, 's' => $s . ':00', 'e' => $e . ':00', 'w' => $w]);
    }
    flash('ok', 'Hours saved.');
    header('Location: /admin/schedule'); exit;
}

/* ---------- time off ---------- */
if ($action === 'add_time_off') {
    $start = (string)($_POST['starts_at'] ?? '');
    $end   = (string)($_POST['ends_at']   ?? '');
    $reason = trim((string)($_POST['reason'] ?? ''));
    $s = DateTime::createFromFormat('Y-m-d\TH:i', $start) ?: DateTime::createFromFormat('Y-m-d H:i', $start);
    $e = DateTime::createFromFormat('Y-m-d\TH:i', $end)   ?: DateTime::createFromFormat('Y-m-d H:i', $end);
    if (!$s || !$e || $e <= $s) {
        flash('error', 'Pick a valid start and end (end must be after start).');
        header('Location: /admin/schedule'); exit;
    }
    $pdo->prepare('INSERT INTO time_off (starts_at, ends_at, reason) VALUES (:s, :e, :r)')
        ->execute(['s' => $s->format('Y-m-d H:i:s'), 'e' => $e->format('Y-m-d H:i:s'), 'r' => $reason ?: null]);
    flash('ok', 'Time off added.');
    header('Location: /admin/schedule'); exit;
}

if ($action === 'delete_time_off') {
    $id = (int)($_POST['time_off_id'] ?? 0);
    if (!$id) { flash('error', 'Missing id.'); header("Location: {$back}"); exit; }
    $pdo->prepare('DELETE FROM time_off WHERE id = :id')->execute(['id' => $id]);
    flash('ok', 'Time off removed.');
    header('Location: /admin/schedule'); exit;
}

flash('error', 'Unknown action.');
header("Location: {$back}");
exit;
