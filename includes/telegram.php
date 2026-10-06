<?php
/**
 * telegram.php — notify the shop owner via our own Telegram bot.
 *
 * sendTelegram($message, $chatId = null)
 *   - If TELEGRAM_BOT_TOKEN + a chat id (arg or TELEGRAM_OWNER_CHAT_ID
 *     from env) are set, POSTs to api.telegram.org/bot<token>/sendMessage.
 *   - Otherwise logs the payload to error_log so dev can trace what
 *     would ship. Never throws — a notify failure must not take down
 *     the booking/contact write itself.
 *
 * Message format: HTML parse mode. Values coming from user input are
 * already escaped by sanitize() upstream, so dropping them into HTML
 * is safe. If you call this with raw strings, run htmlspecialchars()
 * on the user-supplied parts yourself.
 *
 * Returns true if the API accepted the message (or the dev-log path ran),
 * false on any API error.
 */

function sendTelegram(string $message, ?string $chatId = null): bool {
    $token = getenv('TELEGRAM_BOT_TOKEN') ?: '';
    $chat  = $chatId ?? (getenv('TELEGRAM_OWNER_CHAT_ID') ?: '');

    // Dev stub — nothing configured, log so we can see what would ship.
    if ($token === '' || $chat === '') {
        error_log("[telegram dev-stub → chat {$chat}]\n" . $message);
        return true;
    }

    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $payload = json_encode([
        'chat_id'                  => $chat,
        'text'                     => $message,
        'parse_mode'               => 'HTML',
        'disable_web_page_preview' => true,
    ]);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS     => $payload,
    ]);
    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        error_log('[telegram] curl error: ' . $err);
        return false;
    }
    if ($code < 200 || $code >= 300) {
        error_log("[telegram] HTTP {$code}: {$body}");
        return false;
    }
    return true;
}
