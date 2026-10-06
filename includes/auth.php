<?php
/**
 * auth.php — admin session + CSRF helpers.
 *
 * Single-operator shop, so there's no roles system — being logged in is
 * all the authorisation you need. Session cookie is HttpOnly, SameSite=Strict,
 * and Secure (set by PHP from the APP_URL scheme). Login attempts are
 * rate-limited by the shared rate_limit helper.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/rate_limit.php';

function adminSessionStart(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = str_starts_with(getenv('APP_URL') ?: '', 'https://');
    session_set_cookie_params([
        'lifetime' => (int) (getenv('SESSION_LIFETIME') ?: 3600),
        'path'     => '/',
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_name('cc_admin');
    session_start();
}

function adminLogin(string $email, string $password): bool {
    adminSessionStart();
    $email = strtolower(trim($email));
    $stmt = db()->prepare('SELECT id, email, password_hash, name FROM admins WHERE email = :e LIMIT 1');
    $stmt->execute(['e' => $email]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($password, $row['password_hash'])) {
        return false;
    }

    // Rotate session id on login (prevents fixation).
    session_regenerate_id(true);
    $_SESSION['admin_id']    = (int) $row['id'];
    $_SESSION['admin_email'] = $row['email'];
    $_SESSION['admin_name']  = $row['name'];
    $_SESSION['logged_in_at'] = time();

    db()->prepare('UPDATE admins SET last_login_at = NOW() WHERE id = :id')
        ->execute(['id' => $row['id']]);

    return true;
}

function adminLogout(): void {
    adminSessionStart();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

function currentAdmin(): ?array {
    adminSessionStart();
    if (empty($_SESSION['admin_id'])) return null;
    return [
        'id'    => (int) $_SESSION['admin_id'],
        'email' => $_SESSION['admin_email'] ?? '',
        'name'  => $_SESSION['admin_name']  ?? '',
    ];
}

function requireAdmin(): array {
    $admin = currentAdmin();
    if (!$admin) {
        $to = '/admin/login';
        if (!empty($_SERVER['REQUEST_URI']) && $_SERVER['REQUEST_URI'] !== '/admin/'
            && !str_contains($_SERVER['REQUEST_URI'], '/admin/login')) {
            $to .= '?next=' . urlencode($_SERVER['REQUEST_URI']);
        }
        header("Location: {$to}");
        exit;
    }
    return $admin;
}

/* ---------- CSRF ---------- */

function csrfToken(): string {
    adminSessionStart();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrfField(): string {
    return '<input type="hidden" name="_csrf" value="' . htmlspecialchars(csrfToken()) . '">';
}

function csrfCheck(): void {
    adminSessionStart();
    $sent = $_POST['_csrf'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    // JSON body (ajax forms serialise all fields including _csrf into JSON).
    if (!$sent && str_contains(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) {
        static $jsonCache = null;
        if ($jsonCache === null) {
            $jsonCache = json_decode(file_get_contents('php://input') ?: '[]', true) ?: [];
        }
        $sent = $jsonCache['_csrf'] ?? '';
    }
    $expected = $_SESSION['csrf'] ?? '';
    if (!$sent || !$expected || !hash_equals($expected, $sent)) {
        http_response_code(419);
        header('Content-Type: application/json');
        echo json_encode(['ok' => false, 'message' => 'Session expired. Reload the page and retry.']);
        exit;
    }
}

/* ---------- Flash messages (session-based, one-shot) ---------- */

function flash(string $type, string $message): void {
    adminSessionStart();
    $_SESSION['flash'][] = ['type' => $type, 'message' => $message];
}

function flashPull(): array {
    adminSessionStart();
    $out = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $out;
}
