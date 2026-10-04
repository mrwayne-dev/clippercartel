<?php
/**
 * Project: clippercartel
 * Author:  wayne
 * Created: 2026-10-04
 */

require_once '../../config/database.php';
require_once '../../config/responses.php';
require_once '../../includes/headers.php';
require_once '../../includes/auth-check.php';
requireAdmin();

try {
    $db         = Database::getInstance()->getConnection();
    $totalUsers = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $newToday   = $db->query("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()")->fetchColumn();
    jsonSuccess(['total_users' => (int) $totalUsers, 'new_today' => (int) $newToday]);
} catch (PDOException $e) {
    jsonError('Server error', 500);
}
