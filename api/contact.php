<?php
/**
 * contact.php — contact form submission.
 *
 * Pipeline:
 *   method guard → rate limit → honeypot → turnstile → validate
 *   → INSERT into messages → WhatsApp-notify owner → email (best-effort)
 *   → flip notify flags → jsonSuccess
 *
 * Email is best-effort: it ships through PHPMailer if SMTP is wired,
 * otherwise its exception is logged and we still return success. The
 * canonical record of the submission is the `messages` row.
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
require_once __DIR__ . '/../includes/whatsapp.php';
require_once __DIR__ . '/../includes/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

rateLimit('contact_form', 5, 60);

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

if (honeypotTripped($input)) jsonSuccess([], 200);

$remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
if (!verifyTurnstile($input['cf-turnstile-response'] ?? null, $remoteIp)) {
    jsonError('Verification failed, please retry.', 400);
}

/* --- validate --------------------------------------------------- */
$name    = sanitize((string)($input['name']    ?? ''));
$email   = trim((string)($input['email']       ?? ''));
$subject = sanitize((string)($input['subject'] ?? 'Contact Form'));
$message = sanitize((string)($input['message'] ?? ''));

if (!$name || !validateEmail($email) || !$message) {
    jsonError('Name, valid email, and message are required.');
}

/* --- persist (authoritative) ----------------------------------- */
try {
    $pdo = db();
    $stmt = $pdo->prepare(
        'INSERT INTO messages (name, email, subject, body, ip_hash, user_agent)
         VALUES (:name, :email, :subject, :body, :ip, :ua)'
    );
    $stmt->execute([
        'name'    => $name,
        'email'   => $email,
        'subject' => $subject,
        'body'    => $message,
        'ip'      => ipHash($remoteIp),
        'ua'      => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    ]);
    $messageId = (int) $pdo->lastInsertId();
} catch (Throwable $e) {
    error_log('[contact] db insert failed: ' . $e->getMessage());
    jsonError('Could not save your message, please try again.', 500);
}

/* --- notify (best effort) -------------------------------------- */
$waBody  = "New contact form submission\n"
         . "---------------------------\n"
         . "Name: {$name}\n"
         . "Email: {$email}\n"
         . "Subject: {$subject}\n"
         . "\n"
         . $message;
$waOk    = sendWhatsApp($waBody);

$mailOk  = false;
try {
    $to = getenv('CONTACT_TO') ?: getenv('OWNER_EMAIL') ?: getenv('SMTP_USER');
    if ($to && getenv('SMTP_USER') && getenv('SMTP_PASS') && getenv('SMTP_PASS') !== 'your-app-password') {
        $mail = createMailer();
        $mail->addAddress($to);
        $mail->addReplyTo($email, $name);
        $mail->isHTML(true);
        $mail->Subject = '[ClipperCartel] ' . $subject;
        $mail->Body    = '<p><strong>From:</strong> ' . htmlspecialchars("$name <$email>") . '</p>'
                       . '<p><strong>Message:</strong><br>' . nl2br(htmlspecialchars($message)) . '</p>';
        $mail->send();
        $mailOk = true;

        // Auto-reply (best effort, don't let it break the flow)
        try {
            $reply = createMailer();
            $reply->addAddress($email, $name);
            $reply->isHTML(true);
            $reply->Subject = "I got your message — ClipperCartel";
            $reply->Body    = '<p>Hi ' . htmlspecialchars($name) . ',</p>'
                            . "<p>Thanks for reaching out. I'll reply shortly.</p>"
                            . '<p>— ClipperCartel</p>';
            $reply->send();
        } catch (Throwable $e) {
            error_log('[contact] auto-reply failed: ' . $e->getMessage());
        }
    }
} catch (Throwable $e) {
    error_log('[contact] mail failed: ' . $e->getMessage());
}

/* --- update notify flags --------------------------------------- */
try {
    $pdo->prepare(
        'UPDATE messages SET notified_whatsapp = :wa, notified_email = :em WHERE id = :id'
    )->execute([
        'wa' => $waOk  ? 1 : 0,
        'em' => $mailOk ? 1 : 0,
        'id' => $messageId,
    ]);
} catch (Throwable $e) {
    error_log('[contact] flag update failed: ' . $e->getMessage());
}

jsonSuccess(['id' => $messageId], 200);
