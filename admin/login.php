<?php
$skipAuth = true;
require_once __DIR__ . '/_boot.php';

$next = $_GET['next'] ?? '/admin';
$safeNext = (is_string($next) && str_starts_with($next, '/admin')) ? $next : '/admin';

$wantsJson = str_contains(strtolower($_SERVER['HTTP_ACCEPT'] ?? ''), 'application/json');

$respondJson = function (bool $ok, string $message = '', string $redirectTo = '', int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(array_filter([
        'ok'      => $ok,
        'message' => $message ?: null,
        'next'    => $redirectTo ?: null,
    ], static fn($v) => $v !== null));
    exit;
};

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrfCheck();
    rateLimit('admin_login', 10, 300);

    $raw = $wantsJson ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;
    $email = trim((string)($raw['email'] ?? ''));
    $pass  = (string)($raw['password'] ?? '');

    if (adminLogin($email, $pass)) {
        if ($wantsJson) $respondJson(true, 'Welcome back.', $safeNext);
        header("Location: {$safeNext}");
        exit;
    }

    if ($wantsJson) $respondJson(false, 'Wrong email or password.', '', 401);
    flash('error', 'Wrong email or password.');
}

if ($admin) { header('Location: /admin'); exit; }

$appName = getenv('APP_NAME') ?: 'ClipperCartel';

admin_header('Sign in', '', 'admin--auth');
?>
<div class="auth-wrap">
  <div class="auth-card">
    <a class="auth-card__brand" href="/">
      <?= htmlspecialchars($appName) ?>
    </a>

    <header class="auth-card__head">
      <h1>Sign in</h1>
      <p>Welcome back. Enter your details to continue.</p>
    </header>

    <form class="admin-form auth-card__form"
          method="post"
          action="/admin/login<?= isset($_GET['next']) ? '?next=' . htmlspecialchars($_GET['next']) : '' ?>"
          data-ajax-form
          autocomplete="on"
          novalidate>
      <?= csrfField() ?>

      <label class="field">
        <span>Email</span>
        <input type="email"
               name="email"
               autocomplete="username"
               required
               autofocus
               placeholder="you@example.com">
      </label>

      <label class="field">
        <span>Password</span>
        <div class="password-toggle" data-password-toggle>
          <input type="password"
                 name="password"
                 autocomplete="current-password"
                 required
                 placeholder="••••••••"
                 minlength="4">
        </div>
      </label>

      <button type="submit" class="btn btn--primary btn--block btn--lg">Sign in</button>
    </form>

    <footer class="auth-card__footer">
      Private admin area · <?= htmlspecialchars($appName) ?>
    </footer>
  </div>
</div>
<?php admin_footer(false);
