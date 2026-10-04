<?php
/**
 * contact.php — contact form submission.
 *
 * Pipeline:
 *   method guard → origin headers → rate limit → honeypot → turnstile →
 *   validate → mail (shop + auto-reply) → jsonSuccess
 */

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/responses.php';
require_once __DIR__ . '/../includes/headers.php';
require_once __DIR__ . '/../includes/helpers.php';
require_once __DIR__ . '/../includes/rate_limit.php';
require_once __DIR__ . '/../includes/honeypot.php';
require_once __DIR__ . '/../includes/turnstile.php';
require_once __DIR__ . '/../includes/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

rateLimit('contact_form', 5, 60);

$input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

// Honeypot: pretend success so bots don't learn, but drop the message.
if (honeypotTripped($input)) jsonSuccess([], 200);

$remoteIp = $_SERVER['REMOTE_ADDR'] ?? null;
if (!verifyTurnstile($input['cf-turnstile-response'] ?? null, $remoteIp)) {
    jsonError('Verification failed, please retry.', 400);
}

$name    = sanitize((string)($input['name']    ?? ''));
$email   = trim((string)($input['email']       ?? ''));
$subject = sanitize((string)($input['subject'] ?? 'Contact Form'));
$message = sanitize((string)($input['message'] ?? ''));

if (!$name || !validateEmail($email) || !$message) {
    jsonError('Name, valid email, and message are required.');
}

try {
    // 1. notify shop
    $mail = createMailer();
    $mail->addAddress(getenv('CONTACT_TO') ?: getenv('SMTP_USER'));
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = '[ClipperCartel] ' . $subject;
    $mail->Body    = '<p><strong>From:</strong> ' . htmlspecialchars("$name <$email>") . '</p>'
                   . '<p><strong>Message:</strong><br>' . nl2br($message) . '</p>';
    $mail->send();

    // 2. auto-reply to customer
    $reply = createMailer();
    $reply->addAddress($email, $name);
    $reply->isHTML(true);
    $reply->Subject = 'We got your message — ClipperCartel';
    $reply->Body    = '<p>Hi ' . htmlspecialchars($name) . ',</p>'
                    . '<p>Thanks for reaching out. We\'ll reply shortly.</p>'
                    . '<p>— ClipperCartel</p>';
    $reply->send();

    jsonSuccess([], 200);
} catch (Exception $e) {
    error_log('[contact] mail failed: ' . $e->getMessage());
    jsonError('Could not send message, please try again.', 500);
}
