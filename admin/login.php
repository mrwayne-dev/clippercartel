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

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrfCheck();
    rateLimit('admin_login', 10, 300);

    // Allow JSON body (ajax form) in addition to form-encoded POST.
    $raw = $wantsJson ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;
    $email = trim((string)($raw['email'] ?? ''));
    $pass  = (string)($raw['password'] ?? '');

    if (adminLogin($email, $pass)) {
        if ($wantsJson) $respondJson(true, 'Welcome back.', $safeNext);
        header("Location: {$safeNext}");
        exit;
    }

    if ($wantsJson) $respondJson(false, 'Wrong email or password.', '', 401);
    $errors[] = 'Wrong email or password.';
}

// Already logged in → straight to dashboard.
if ($admin) { header('Location: /admin'); exit; }

// Push server-side errors into the toast queue so JS surfaces them.
if ($errors) {
    foreach ($errors as $e) flash('error', $e);
}

admin_header('Sign in', '', 'admin--auth');
?>
<div class="auth-shell">
  <aside class="auth-brand" aria-hidden="true">
    <div class="auth-brand__mark">
      <?= htmlspecialchars(getenv('APP_NAME') ?: 'ClipperCartel') ?>
    </div>
    <div>
      <p class="auth-brand__eyebrow">Private · Admin</p>
      <h1 class="auth-brand__h1">The <em>chair</em>, run from one place.</h1>
    </div>
    <div class="auth-brand__meta">
      <span><span class="auth-brand__dot"></span> System live</span>
      <span>Port Harcourt</span>
    </div>
  </aside>

  <section class="auth-form-side">
    <div class="auth-card">
      <header class="auth-card__head">
        <h1>Sign in</h1>
        <p>Welcome back. Enter your credentials to continue.</p>
      </header>

      <form class="admin-form"
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

        <button type="submit" class="btn btn--primary">Sign in</button>
      </form>

      <p class="auth-card__helper">
        Lost access? Reset the password from the shell:<br>
        <code>php database/create_admin.php &lt;email&gt; &lt;name&gt;</code>
      </p>
    </div>
  </section>
</div>
<?php admin_footer(false);
