<?php
/**
 * migrate.php — idempotent schema runner.
 *
 * Reads database/schema.sql and executes it. Every CREATE uses
 * IF NOT EXISTS so re-running is safe.
 *
 * Usage:
 *   php database/migrate.php
 */

require_once __DIR__ . '/../config/database.php';

$sqlPath = __DIR__ . '/schema.sql';
if (!is_readable($sqlPath)) {
    fwrite(STDERR, "✗ Cannot read {$sqlPath}\n");
    exit(1);
}
$sql = file_get_contents($sqlPath);

try {
    $pdo = db();
    // Strip single-line SQL comments first so they don't swallow
    // the real statements that follow them when we split on ';'.
    $stripped = preg_replace('/^\s*--[^\n]*\n/m', '', $sql);
    $stmts = array_filter(
        array_map('trim', preg_split('/;\s*(\n|$)/', $stripped)),
        fn($s) => $s !== ''
    );

    echo "Running " . count($stmts) . " statements against " . (getenv('DB_NAME') ?: 'clippercartel') . "\n";
    $i = 0;
    foreach ($stmts as $stmt) {
        $i++;
        try {
            $pdo->exec($stmt);
            // Pull the object name for a readable line
            if (preg_match('/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?/i', $stmt, $m)) {
                echo "  ✓ table {$m[1]}\n";
            } elseif (preg_match('/^SET\s+/i', $stmt)) {
                echo "  ✓ set directive\n";
            } else {
                echo "  ✓ stmt #{$i}\n";
            }
        } catch (PDOException $e) {
            fwrite(STDERR, "✗ stmt #{$i} failed: " . $e->getMessage() . "\n");
            fwrite(STDERR, "  SQL: " . substr($stmt, 0, 200) . "...\n");
            exit(1);
        }
    }
    echo "\n✓ Migration complete.\n";
} catch (Throwable $e) {
    fwrite(STDERR, "✗ Fatal: " . $e->getMessage() . "\n");
    exit(1);
}
