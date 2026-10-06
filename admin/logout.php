<?php
$skipAuth = true;
require_once __DIR__ . '/_boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /admin/login');
    exit;
}
csrfCheck();
adminLogout();
header('Location: /admin/login');
exit;
