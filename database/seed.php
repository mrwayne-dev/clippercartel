<?php
/**
 * seed.php — first-run seed.
 *
 *   - Weekly schedule (Mon-Sat 09:00-20:00, Sunday closed)
 *     from SHOP_HOURS_OPEN / SHOP_HOURS_CLOSE / SHOP_HOURS_CLOSED_DAYS
 *     in .env, so one source of truth.
 *   - Six placeholder services (same list the public /services page
 *     renders). Admin can edit later.
 *
 * Idempotent: uses INSERT … ON DUPLICATE KEY UPDATE / INSERT IGNORE
 * so re-running does not duplicate rows.
 *
 * Usage:
 *   php database/seed.php
 */

require_once __DIR__ . '/../config/database.php';

$pdo = db();

/* ---------- schedule ------------------------------------- */

$weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
$open     = getenv('SHOP_HOURS_OPEN')  ?: '09:00';
$close    = getenv('SHOP_HOURS_CLOSE') ?: '20:00';
$closedCsv = (string) (getenv('SHOP_HOURS_CLOSED_DAYS') ?: 'Sunday');
$closedDays = array_filter(array_map('trim', explode(',', $closedCsv)));

$st = $pdo->prepare(
    'INSERT INTO schedule (day_of_week, start_time, end_time, is_working)
     VALUES (:dow, :start, :end, :open)
     ON DUPLICATE KEY UPDATE
       start_time = VALUES(start_time),
       end_time   = VALUES(end_time),
       is_working = VALUES(is_working)'
);
foreach ($weekdays as $i => $name) {
    $working = in_array($name, $closedDays, true) ? 0 : 1;
    $st->execute([
        'dow'   => $i,
        'start' => $open,
        'end'   => $close,
        'open'  => $working,
    ]);
    echo "  ✓ schedule row {$i} ({$name}) " . ($working ? "{$open}-{$close}" : 'closed') . "\n";
}

/* ---------- services (placeholders, admin can edit) ------- */

$services = [
    ['Low Cut',      'low-cut',      'A clean, close finish. The everyday standard.',          null, 30, 1],
    ['Fade',         'fade',         'Taper, mid or skin. Sharp line to close.',               null, 40, 2],
    ['Design',       'design',       'Custom shapes cut sharp. Bring the idea, I match it.',   null, 45, 3],
    ['Colour',       'colour',       'Dye, tips, highlights. Bold or subtle, your call.',      null, 60, 4],
    ['Beard Sculpt', 'beard-sculpt', 'Shape, trim, define. Face framed right.',                null, 20, 5],
    ['Kids',         'kids',         'All ages. Patient hands, calm chair.',                   null, 25, 6],
];

$st = $pdo->prepare(
    'INSERT IGNORE INTO services (name, slug, description, price_cents, duration_min, display_order, is_active)
     VALUES (:name, :slug, :desc, :price, :dur, :order, 1)'
);
foreach ($services as [$name, $slug, $desc, $price, $dur, $order]) {
    $st->execute([
        'name'  => $name,
        'slug'  => $slug,
        'desc'  => $desc,
        'price' => $price,
        'dur'   => $dur,
        'order' => $order,
    ]);
    echo "  ✓ service {$slug}\n";
}

echo "\n✓ Seed complete.\n";
