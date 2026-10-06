<?php
$skipAuth = true;
require_once __DIR__ . '/_boot.php';

$next   = $_GET['next'] ?? '/admin';
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrfCheck();
    rateLimit('admin_login', 10, 300);  // 10 attempts per 5 min per session
    $email = trim((string)($_POST['email'] ?? ''));
    $pass  = (string)($_POST['password'] ?? '');
    if (adminLogin($email, $pass)) {
        $safeNext = (is_string($next) && str_starts_with($next, '/admin')) ? $next : '/admin';
        header("Location: {$safeNext}");
        exit;
    }
    $errors[] = 'Wrong email or password.';
}

// If already logged in, bounce to dashboard.
if ($admin) { header('Location: /admin'); exit; }

admin_header('Sign in');
?>
<div class="admin-centre">
  <div class="admin-card admin-card--narrow">
    <h1 class="admin-h1">Sign in</h1>
    <p class="admin-sub">Admin area for <?= htmlspecialchars(getenv('APP_NAME') ?: 'ClipperCartel') ?>.</p>

    <?php foreach ($errors as $e): ?>
      <div class="admin-flash admin-flash--error"><?= htmlspecialchars($e) ?></div>
    <?php endforeach; ?>

    <form method="post" action="/admin/login<?= isset($_GET['next']) ? '?next=' . htmlspecialchars($_GET['next']) : '' ?>" class="admin-form">
      <?= csrfField() ?>
      <label class="field">
        <span>Email</span>
        <input type="email" name="email" autocomplete="username" required autofocus>
      </label>
      <label class="field">
        <span>Password</span>
        <input type="password" name="password" autocomplete="current-password" required>
      </label>
      <button type="submit" class="btn btn--primary">Sign in</button>
    </form>
  </div>
</div>
<?php admin_footer();
