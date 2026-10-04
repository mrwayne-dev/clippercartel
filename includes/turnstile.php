<?php
/**
 * turnstile.php — Cloudflare Turnstile verification.
 *
 * Verifies a cf-turnstile-response token against the Cloudflare siteverify
 * endpoint. Fail-open in development (no secret configured); fail-closed
 * everywhere else so a missing/bad secret can't silently disable protection.
 */

function verifyTurnstile(?string $token, ?string $remoteIp = null): bool {
    $secret = getenv('TURNSTILE_SECRET') ?: '';
    $env    = getenv('APP_ENV') ?: 'production';

    // Dev convenience: skip when nothing is configured yet.
    if ($secret === '' && $env === 'development') return true;
    if ($secret === '') return false;
    if (!$token)        return false;

    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 5,
        CURLOPT_POSTFIELDS     => http_build_query(array_filter([
            'secret'   => $secret,
            'response' => $token,
            'remoteip' => $remoteIp,
        ])),
    ]);
    $body = curl_exec($ch);
    curl_close($ch);

    if ($body === false) return false;
    $json = json_decode($body, true);
    return isset($json['success']) && $json['success'] === true;
}
