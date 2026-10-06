<?php
/**
 * database.php — single PDO connection, memoised per request.
 *
 * Pulls DB_HOST / DB_NAME / DB_USER / DB_PASS from .env (already
 * loaded by env.php). Errors surface as exceptions. Fetch mode is
 * assoc arrays. UTF-8 end-to-end, no emulated prepares (so
 * placeholders stay typed).
 */

require_once __DIR__ . '/env.php';

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $host = getenv('DB_HOST') ?: 'localhost';
    $name = getenv('DB_NAME') ?: 'clippercartel';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $dsn  = "mysql:host={$host};dbname={$name};charset=utf8mb4";

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_PERSISTENT         => false,
    ]);
    $pdo->exec("SET time_zone = '+00:00'");
    return $pdo;
}
