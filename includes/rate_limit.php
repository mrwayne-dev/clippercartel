<?php
/**
 * Project: clippercartel
 * Author:  wayne
 * Created: 2026-10-04
 */

function rateLimit(string $key, int $maxAttempts = 5, int $windowSeconds = 60): void {
    if (session_status() === PHP_SESSION_NONE) session_start();
    $now        = time();
    $sessionKey = 'rate_limit_' . $key;
    if (!isset($_SESSION[$sessionKey])) {
        $_SESSION[$sessionKey] = ['count' => 0, 'reset_at' => $now + $windowSeconds];
    }
    if ($now > $_SESSION[$sessionKey]['reset_at']) {
        $_SESSION[$sessionKey] = ['count' => 0, 'reset_at' => $now + $windowSeconds];
    }
    $_SESSION[$sessionKey]['count']++;
    if ($_SESSION[$sessionKey]['count'] > $maxAttempts) {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Too many requests. Please try again later.']);
        exit;
    }
}
