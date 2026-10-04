<?php
/**
 * Project: clippercartel
 * Author:  wayne
 * Created: 2026-10-04
 */

require_once '../config/constants.php';
require_once '../config/responses.php';
require_once '../includes/headers.php';
require_once '../includes/helpers.php';
require_once '../includes/rate_limit.php';
require_once '../includes/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') jsonError('Method not allowed', 405);

rateLimit('contact_form', 5, 60);

$input   = json_decode(file_get_contents('php://input'), true);
$name    = sanitize($input['name']    ?? '');
$email   = trim($input['email']       ?? '');
$subject = sanitize($input['subject'] ?? 'Contact Form');
$message = sanitize($input['message'] ?? '');

if (!$name || !validateEmail($email) || !$message) {
    jsonError('Name, valid email, and message are required');
}


try {
    $mail = createMailer();
    $mail->addAddress(getenv('SMTP_USER'));
    $mail->addReplyTo($email, $name);
    $mail->isHTML(true);
    $mail->Subject = $subject . ' - Contact Form';
    $mail->Body    = "<p><strong>From:</strong> $name ($email)</p>"
                   . "<p><strong>Message:</strong><br>" . nl2br($message) . "</p>";
    $mail->send();
    jsonSuccess([], 200);
} catch (Exception $e) {
    jsonError('Failed to send message', 500);
}
