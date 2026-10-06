<?php
/**
 * bootstrap_telegram_chat.php — one-time helper to find the owner's chat_id.
 *
 * How to use:
 *   1. Create the bot via @BotFather on Telegram, drop the token into
 *      .env as TELEGRAM_BOT_TOKEN.
 *   2. On the owner's phone, open the bot's chat and tap Start (or
 *      send any message — "hi" is enough).
 *   3. Run: php database/bootstrap_telegram_chat.php
 *   4. Copy the chat_id it prints into .env as TELEGRAM_OWNER_CHAT_ID.
 *   5. Done. Future bookings and contact messages will land in that chat.
 *
 * This calls Telegram's getUpdates endpoint, which returns messages
 * delivered to the bot in the last ~24 hours.
 */

require_once __DIR__ . '/../config/env.php';

$token = getenv('TELEGRAM_BOT_TOKEN') ?: '';
if ($token === '') {
    fwrite(STDERR, "✗ TELEGRAM_BOT_TOKEN is not set in .env — add it before running this.\n");
    exit(1);
}

$url  = "https://api.telegram.org/bot{$token}/getUpdates";
$body = @file_get_contents($url);
if ($body === false) {
    fwrite(STDERR, "✗ Could not reach api.telegram.org — check your network.\n");
    exit(1);
}

$json = json_decode($body, true);
if (!$json || empty($json['ok'])) {
    fwrite(STDERR, "✗ Telegram returned an error:\n{$body}\n");
    exit(1);
}

$updates = $json['result'] ?? [];
if (!$updates) {
    echo "No messages seen yet.\n";
    echo "On the owner's phone: open the bot's chat, tap Start, send any message,\n";
    echo "then re-run this script.\n";
    exit(0);
}

echo "Recent chats the bot has seen:\n";
echo "--------------------------------\n";
$seen = [];
foreach ($updates as $u) {
    $msg = $u['message'] ?? $u['edited_message'] ?? $u['channel_post'] ?? null;
    if (!$msg) continue;
    $chat = $msg['chat'] ?? [];
    $id   = $chat['id'] ?? null;
    if (!$id || isset($seen[$id])) continue;
    $seen[$id] = true;
    $name  = trim(($chat['first_name'] ?? '') . ' ' . ($chat['last_name'] ?? ''));
    $uname = $chat['username'] ?? '';
    $type  = $chat['type'] ?? 'private';
    $label = $name ?: ($chat['title'] ?? '(no name)');
    echo "  chat_id = {$id}  ·  {$label}";
    if ($uname) echo "  (@{$uname})";
    echo "  [{$type}]\n";
}
echo "\nCopy the owner's chat_id into .env as TELEGRAM_OWNER_CHAT_ID.\n";
