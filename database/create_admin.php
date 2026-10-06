<?php
/**
 * create_admin.php — CLI helper to add or reset an admin user.
 *
 * Usage:
 *   php database/create_admin.php <email> <name> [<password>]
 *
 * If password is omitted, generates a random one and prints it ONCE.
 * Running the script again with the same email resets the password.
 */

require_once __DIR__ . '/../config/database.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Run this from the shell, not the browser.\n");
    exit(1);
}

$email = $argv[1] ?? '';
$name  = $argv[2] ?? '';
$pass  = $argv[3] ?? '';

if (!$email || !$name) {
    fwrite(STDERR, "Usage: php database/create_admin.php <email> <name> [<password>]\n");
    exit(1);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "✗ '{$email}' is not a valid email address.\n");
    exit(1);
}

$generated = false;
if ($pass === '') {
    // 16-char URL-safe random — easy to copy once, hard to guess.
    $pass = rtrim(strtr(base64_encode(random_bytes(12)), '+/', '-_'), '=');
    $generated = true;
}

$cost = (int) (getenv('PASSWORD_HASH_COST') ?: 12);
$hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => $cost]);

$pdo = db();
$pdo->prepare(
    'INSERT INTO admins (email, password_hash, name)
     VALUES (:e, :h, :n)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name)'
)->execute([
    'e' => strtolower($email),
    'h' => $hash,
    'n' => $name,
]);

echo "✓ Admin saved: {$email} ({$name})\n";
if ($generated) {
    echo "\n  password (copy now, won't show again):\n";
    echo "    {$pass}\n\n";
    echo "  Reset by re-running this script with the same email.\n";
}
