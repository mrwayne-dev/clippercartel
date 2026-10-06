<?php
require_once __DIR__ . '/_boot.php';

$pdo = db();
$show = $_GET['show'] ?? 'all';
$where = $show === 'unread' ? 'WHERE is_read = 0' : '';

$rows = $pdo->query(
    "SELECT * FROM messages {$where} ORDER BY received_at DESC LIMIT 200"
)->fetchAll();

admin_header('Messages', 'messages');
?>
<div class="admin-head">
  <h1 class="admin-h1">Messages</h1>
  <p class="admin-sub">Contact-form inbox.</p>
</div>

<nav class="admin-tabs">
  <a href="/admin/messages"           class="admin-tabs__link<?= $show !== 'unread' ? ' is-active' : '' ?>">All</a>
  <a href="/admin/messages?show=unread" class="admin-tabs__link<?= $show === 'unread' ? ' is-active' : '' ?>">Unread</a>
</nav>

<?php if (!$rows): ?>
  <p class="admin-empty">Inbox is clear.</p>
<?php else: ?>
  <ul class="message-list">
    <?php foreach ($rows as $m): ?>
      <li class="message-row<?= $m['is_read'] ? '' : ' is-unread' ?>">
        <div class="message-row__head">
          <div class="message-row__from">
            <strong><?= htmlspecialchars($m['name']) ?></strong>
            <small><a href="mailto:<?= htmlspecialchars($m['email']) ?>"><?= htmlspecialchars($m['email']) ?></a></small>
          </div>
          <div class="message-row__meta">
            <time><?= admin_fmt_datetime($m['received_at']) ?></time>
            <?php if (!$m['is_read']): ?><span class="pill pill--warn">New</span><?php endif; ?>
          </div>
        </div>
        <?php if ($m['subject']): ?><p class="message-row__subject"><?= htmlspecialchars($m['subject']) ?></p><?php endif; ?>
        <p class="message-row__body"><?= nl2br(htmlspecialchars($m['body'])) ?></p>
        <div class="message-row__actions">
          <a href="mailto:<?= htmlspecialchars($m['email']) ?>?subject=Re: <?= htmlspecialchars($m['subject'] ?: 'your message') ?>" class="btn btn--primary btn--sm">Reply by email</a>
          <?php if ($m['is_read']): ?>
            <form action="/admin/actions" method="post" class="inline-form">
              <?= csrfField() ?>
              <input type="hidden" name="action"     value="mark_unread">
              <input type="hidden" name="message_id" value="<?= (int) $m['id'] ?>">
              <button type="submit" class="btn btn--muted btn--sm">Mark unread</button>
            </form>
          <?php else: ?>
            <form action="/admin/actions" method="post" class="inline-form">
              <?= csrfField() ?>
              <input type="hidden" name="action"     value="mark_read">
              <input type="hidden" name="message_id" value="<?= (int) $m['id'] ?>">
              <button type="submit" class="btn btn--ok btn--sm">Mark read</button>
            </form>
          <?php endif; ?>
          <form action="/admin/actions" method="post" class="inline-form" onsubmit="return confirm('Delete this message? Cannot be undone.');">
            <?= csrfField() ?>
            <input type="hidden" name="action"     value="delete_message">
            <input type="hidden" name="message_id" value="<?= (int) $m['id'] ?>">
            <button type="submit" class="btn btn--danger btn--sm">Delete</button>
          </form>
        </div>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>

<?php admin_footer();
