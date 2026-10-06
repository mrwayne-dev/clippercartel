<?php
/**
 * booking.php — booking request endpoint.
 *
 * Pipeline:
 *   method guard → rate limit → honeypot → turnstile → validate
 *   → upsert customer by phone → insert booking (status='pending')
 *   → WhatsApp-notify owner → optional email → flip notify flags
 *   → return confirmation code
 *
 * Booking status starts as 'pending'. The owner confirms the slot
 * over WhatsApp (and flips status via admin later) — this endpoint
 * does NOT auto-confirm or check calendar availability yet. That
 * check belongs in the admin flow once the admin UI is built.
 */

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/responses.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/headers.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/booking_helpers.php';
require_once __DIR__ . '/../includes/rate_limit.php';
require_once __DIR__ . '/../includes/honeypot.php';
require_once __DIR__ . '/../includes/turnstile.php';
require_once __DIR__ . '/../includes/telegram.php';
require_once __DIR__ . '/../includes/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

rateLimit('booking_form', 5, 60);

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (honeypotTripped($input)) jsonSuccess(['code' => 'OK------'], 200);

$remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
if (!verifyTurnstile($input['cf-turnstile-response'] ?? null, $remoteIp)) {
    jsonError('Verification failed, please retry.', 400);
}

/* --- validate --------------------------------------------------- */
$name    = sanitize((string)($input['name']    ?? ''));
$phone   = normalisePhone((string)($input['phone']   ?? ''));
$service = sanitize((string)($input['service'] ?? ''));
$date    = trim((string)($input['date']    ?? ''));
$time    = trim((string)($input['time']    ?? ''));
$notes   = sanitize((string)($input['notes']   ?? ''));

if (!$name || !$phone || !$service || !$date || !$time) {
    jsonError('Name, phone, service, date and time are required.');
}

// Phone sanity: must have at least 7 digits once normalised
if (preg_match_all('/\d/', $phone) < 7) {
    jsonError('Please enter a valid phone number.');
}

// Date + time parse — must be well-formed and not in the past
$startsAt = DateTime::createFromFormat('Y-m-d H:i', "{$date} {$time}");
if (!$startsAt) jsonError('Date and time are invalid.');
$now = new DateTime();
if ($startsAt < $now) jsonError('That time is already in the past.');

/* --- resolve service to id + duration (if known) --------------- */
$pdo = db();
$svc = null;
try {
    $svc = $pdo->prepare('SELECT id, duration_min, price_cents FROM services WHERE name = :n LIMIT 1');
    $svc->execute(['n' => $service]);
    $svc = $svc->fetch();
} catch (Throwable $e) {
    error_log('[booking] service lookup failed: ' . $e->getMessage());
}
$durationMin = $svc['duration_min'] ?? 30;
$serviceId   = $svc['id']           ?? null;
$priceCents  = $svc['price_cents']  ?? null;
$endsAt      = (clone $startsAt)->modify("+{$durationMin} minutes");

/* --- upsert customer by phone --------------------------------- */
try {
    $email = isset($input['email']) ? trim((string)$input['email']) : null;
    if ($email && !validateEmail($email)) $email = null;

    $pdo->prepare(
        'INSERT INTO customers (name, phone, email)
         VALUES (:name, :phone, :email)
         ON DUPLICATE KEY UPDATE
           name  = VALUES(name),
           email = COALESCE(VALUES(email), email),
           updated_at = CURRENT_TIMESTAMP'
    )->execute([
        'name'  => $name,
        'phone' => $phone,
        'email' => $email,
    ]);

    $cust = $pdo->prepare('SELECT id FROM customers WHERE phone = :p LIMIT 1');
    $cust->execute(['p' => $phone]);
    $customerId = (int) $cust->fetchColumn();
    if (!$customerId) throw new RuntimeException('customer upsert returned no id');
} catch (Throwable $e) {
    error_log('[booking] customer upsert failed: ' . $e->getMessage());
    jsonError('Could not save your details, please try again.', 500);
}

/* --- insert booking (retry on confirmation-code collision) ---- */
$bookingId = null;
$code      = null;
try {
    $stmt = $pdo->prepare(
        'INSERT INTO bookings
           (confirmation_code, customer_id, service_id, service_name,
            starts_at, ends_at, status, price_cents_at_booking, notes,
            ip_hash, user_agent)
         VALUES
           (:code, :cust, :svc_id, :svc_name,
            :starts, :ends, "pending", :price, :notes,
            :ip, :ua)'
    );
    for ($i = 0; $i < 5; $i++) {
        $code = confirmationCode();
        try {
            $stmt->execute([
                'code'     => $code,
                'cust'     => $customerId,
                'svc_id'   => $serviceId,
                'svc_name' => $service,
                'starts'   => $startsAt->format('Y-m-d H:i:s'),
                'ends'     => $endsAt->format('Y-m-d H:i:s'),
                'price'    => $priceCents,
                'notes'    => $notes ?: null,
                'ip'       => ipHash($remoteIp),
                'ua'       => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
            ]);
            $bookingId = (int) $pdo->lastInsertId();
            break;
        } catch (PDOException $e) {
            // 23000 = integrity constraint; try a new code once or twice.
            if ($e->getCode() !== '23000') throw $e;
        }
    }
    if (!$bookingId) throw new RuntimeException('could not generate unique confirmation code');
} catch (Throwable $e) {
    error_log('[booking] insert failed: ' . $e->getMessage());
    jsonError('Could not save your booking, please try again.', 500);
}

/* --- notify owner (best effort) ------------------------------- */
// Note: $name, $service, $notes are already htmlspecialchars'd by
// sanitize(); $phone is digits + '+', also safe. $code is A-Z/2-9.
$startHuman = $startsAt->format('l j F Y · H:i');
$tgBody = "<b>✂️ New booking · {$code}</b>\n"
        . "\n"
        . "<b>Name:</b> {$name}\n"
        . "<b>Phone:</b> {$phone}\n"
        . "<b>Service:</b> {$service}\n"
        . "<b>When:</b> {$startHuman}\n"
        . ($notes ? "\n<b>Notes:</b>\n{$notes}\n" : '')
        . "\n<i>Status: pending. Reply to the customer to confirm.</i>";
$tgOk = sendTelegram($tgBody);

$mailOk = false;
try {
    $to = getenv('CONTACT_TO') ?: getenv('OWNER_EMAIL') ?: getenv('SMTP_USER');
    if ($to && getenv('SMTP_USER') && getenv('SMTP_PASS') && getenv('SMTP_PASS') !== 'your-app-password') {
        $mail = createMailer();
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = "[ClipperCartel] New booking · {$code}";
        $mail->Body    = '<p><strong>' . htmlspecialchars($name) . '</strong> (' . htmlspecialchars($phone) . ')</p>'
                       . '<p><strong>Service:</strong> ' . htmlspecialchars($service) . '<br>'
                       . '<strong>When:</strong> ' . htmlspecialchars($startHuman) . '</p>'
                       . ($notes ? '<p><strong>Notes:</strong><br>' . nl2br(htmlspecialchars($notes)) . '</p>' : '')
                       . '<p>Status: <strong>pending</strong>. Reply via WhatsApp to confirm.</p>';
        $mail->send();
        $mailOk = true;
    }
} catch (Throwable $e) {
    error_log('[booking] mail failed: ' . $e->getMessage());
}

/* --- flip notify flags --------------------------------------- */
// `notified_whatsapp` column repurposed as the "chat notify" flag — Telegram
// is the sender now; same column, same semantics.
try {
    $pdo->prepare(
        'UPDATE bookings SET notified_whatsapp = :wa, notified_email = :em WHERE id = :id'
    )->execute([
        'wa' => $tgOk  ? 1 : 0,
        'em' => $mailOk ? 1 : 0,
        'id' => $bookingId,
    ]);
} catch (Throwable $e) {
    error_log('[booking] flag update failed: ' . $e->getMessage());
}

jsonSuccess([
    'id'                => $bookingId,
    'confirmation_code' => $code,
    'status'            => 'pending',
], 200);
