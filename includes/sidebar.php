<?php
$current = basename($_SERVER['SCRIPT_NAME']);
function navClass(string $file, string $current): string {
    return $file === $current ? 'nav-item active' : 'nav-item';
}
$openAnomalies = 0;
try {
    $openAnomalies = (int) getDB()->query("SELECT COUNT(*) FROM anomalies WHERE status='open'")->fetchColumn();
} catch (Exception $e) { /* ignore on pages without a live DB yet */ }
?>
<aside class="sidebar">
  <div class="brand">
    <span class="brand-icon">⚡</span>
    <span class="brand-name">WattWatch</span>
  </div>
  <nav class="nav">
    <a href="<?= BASE_URL ?>/pages/dashboard.php" class="<?= navClass('dashboard.php', $current) ?>">🏠 Dashboard</a>
    <?php if (can('manage_rooms') || can('manage_equipment')): ?>
    <a href="<?= BASE_URL ?>/pages/rooms.php" class="<?= navClass('rooms.php', $current) ?>">🏢 Rooms / Equipment</a>
    <?php endif; ?>
    <a href="<?= BASE_URL ?>/pages/monitoring.php" class="<?= navClass('monitoring.php', $current) ?>">📈 Real-time Monitoring</a>
    <a href="<?= BASE_URL ?>/pages/anomalies.php" class="<?= navClass('anomalies.php', $current) ?>">
      ⚠ Anomalies
      <?php if ($openAnomalies > 0): ?><span class="nav-badge"><?= $openAnomalies ?></span><?php endif; ?>
    </a>
    <?php if (can('view_reports')): ?>
    <a href="<?= BASE_URL ?>/pages/reports.php" class="<?= navClass('reports.php', $current) ?>">📄 Reports</a>
    <?php endif; ?>
    <?php if (can('manage_thresholds')): ?>
    <a href="<?= BASE_URL ?>/pages/thresholds.php" class="<?= navClass('thresholds.php', $current) ?>">🎚 Thresholds</a>
    <?php endif; ?>
    <?php if (can('manage_users')): ?>
    <a href="<?= BASE_URL ?>/pages/users.php" class="<?= navClass('users.php', $current) ?>">👤 Users</a>
    <?php endif; ?>
    <?php if (can('view_logs')): ?>
    <a href="<?= BASE_URL ?>/pages/logs.php" class="<?= navClass('logs.php', $current) ?>">🗒 Logs</a>
    <?php endif; ?>
    <?php if (can('manage_settings')): ?>
    <a href="<?= BASE_URL ?>/pages/settings.php" class="<?= navClass('settings.php', $current) ?>">⚙ Settings</a>
    <?php endif; ?>
  </nav>
  <div class="sidebar-status">
    <span class="status-dot"></span>
    <div>
      <strong>System Status</strong>
      <p>Online — all systems operational</p>
    </div>
  </div>
  <div class="sidebar-footer">WattWatch v<?= APP_VERSION ?><br>© <?= date('Y') ?> All rights reserved.</div>
</aside>
