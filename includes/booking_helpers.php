<?php
/**
 * booking_helpers.php — shared helpers for the booking endpoint.
 *
 *   - normalisePhone()   : strip non-digits, keep leading '+'
 *   - confirmationCode() : 8-char A-Z0-9 (no 0/O/1/I to avoid confusion)
 *   - ipHash()           : SHA-256 of the client IP (we never store raw IPs)
 */

function normalisePhone(string $raw): string {
    $raw = trim($raw);
    $hasPlus = str_starts_with($raw, '+');
    $digits = preg_replace('/\D+/', '', $raw) ?? '';
    return ($hasPlus ? '+' : '') . $digits;
}

function confirmationCode(int $len = 8): string {
    $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    $out = '';
    $max = strlen($alphabet) - 1;
    for ($i = 0; $i < $len; $i++) {
        $out .= $alphabet[random_int(0, $max)];
    }
    return $out;
}

function ipHash(?string $ip): ?string {
    if (!$ip) return null;
    return hash('sha256', $ip);
}
