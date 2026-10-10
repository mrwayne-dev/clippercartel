<?php
/**
 * Project: clippercartel
 * Author:  wayne
 * Created: 2026-10-04
 */

require_once '../../includes/auth-check.php';
requireAdmin();
$user = getAuthUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin | clippercartel</title>
  <link rel="stylesheet" href="../../assets/css/main.css">
  <link rel="stylesheet" href="../../assets/css/components.css">
  <style>
    .admin-layout  { display: flex; min-height: 100vh; }
    .admin-sidebar { width: 240px; background: #1e293b; color: #fff; padding: 1.5rem; }
    .admin-sidebar h3 { margin-bottom: 1.5rem; font-size: .875rem; opacity:.7; text-transform: uppercase; letter-spacing:.08em; }
    .admin-sidebar a  { display: block; color: #cbd5e1; text-decoration: none; padding: .5rem 0; }
    .admin-sidebar a:hover { color: #fff; }
    .admin-main    { flex: 1; padding: 2rem; background: #f8fafc; }
    .stat-card     { background: #fff; border-radius: .75rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); display: inline-block; min-width: 180px; margin-right: 1rem; }
  </style>
</head>
<body>
<div class="admin-layout">
  <aside class="admin-sidebar">
    <h3>clippercartel</h3>
    <nav><a href="/pages/admin/dashboard.php">Dashboard</a></nav>
  </aside>
  <div class="admin-main">
    <header style="margin-bottom:2rem;display:flex;justify-content:space-between;align-items:center;">
      <h1>Admin Dashboard</h1>
      <span><?php echo htmlspecialchars($user['email']); ?></span>
    </header>
    <div id="stats"></div>
  </div>
</div>
<script>
fetch('/api/admin/dashboard.php')
  .then(r => r.json())
  .then(({ success, data }) => {
    if (!success) return;
    document.getElementById('stats').innerHTML =
      '<div class="stat-card"><p style="font-size:.75rem;color:#6b7280;">Total Users</p><h2>' + data.total_users + '</h2></div>' +
      '<div class="stat-card"><p style="font-size:.75rem;color:#6b7280;">New Today</p><h2>'   + data.new_today   + '</h2></div>';
  });
</script>
</body>
</html>
