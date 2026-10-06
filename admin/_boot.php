<?php
/**
 * admin/_boot.php — shared bootstrap for every admin page.
 *
 * Loads env + db + auth, starts the session, and (unless $skipAuth
 * is set before this file is required) redirects to /admin/login if
 * no admin is logged in.
 *
 * Keep this at the very top of every admin/*.php page:
 *   require_once __DIR__ . '/_boot.php';
 */

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/_layout.php';

adminSessionStart();

/** Set $skipAuth = true BEFORE requiring this file to allow unauthenticated access. */
$skipAuth = $skipAuth ?? false;
$admin    = $skipAuth ? currentAdmin() : requireAdmin();
