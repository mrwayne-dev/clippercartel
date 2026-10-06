<?php
/**
 * whatsapp.php — notify the shop owner via WhatsApp Cloud API.
 *
 * sendWhatsApp($message)
 *   - If WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID + SHOP_WHATSAPP
 *     are all set, POSTs a text message to Meta's Graph API.
 *   - Otherwise logs to error_log so dev can trace the payload that would
 *     have shipped. Never throws — a notify failure must not take down
 *     the booking/contact write itself.
 *
 * Returns true if the API accepted the message (or the dev-log path ran),
 * false on any API error.
 *
 * Templating note: Meta only allows free-form text to numbers that have
 * messaged the business inside the 24-hour window. For first-touch
 * owner notifications, this is fine — the owner's own number is the
 * recipient and will typically have an active session with their own
 * business account. If you hit "re-engagement window" errors, switch
 * to a pre-approved template via the `template` message type.
 */

function sendWhatsApp(string $message): bool {
    $token   = getenv('WHATSAPP_ACCESS_TOKEN') ?: '';
    $phoneId = getenv('WHATSAPP_PHONE_NUMBER_ID') ?: '';
    $toRaw   = getenv('SHOP_WHATSAPP') ?: '';
    $to      = preg_replace('/\D+/', '', $toRaw);

    // Dev stub — nothing configured, log so we can see what would ship.
    if ($token === '' || $phoneId === '' || $to === '') {
        error_log("[whatsapp dev-stub → {$to}]\n" . $message);
        return true;
    }

    $url = "https://graph.facebook.com/v21.0/{$phoneId}/messages";
    $payload = json_encode([
        'messaging_product' => 'whatsapp',
        'to'                => $to,
        'type'              => 'text',
        'text'              => [
            'preview_url' => false,
            'body'        => $message,
        ],
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
        ],
        CURLOPT_POSTFIELDS     => $payload,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        error_log('[whatsapp] curl error: ' . $err);
        return false;
    }
    if ($code < 200 || $code >= 300) {
        error_log("[whatsapp] HTTP {$code}: {$body}");
        return false;
    }
    return true;
}
