<?php
/**
 * includes/header.php
 * Expects $pageTitle to be set by the including page.
 * Opens <div class="app-shell"> and <main class="content"> — closed in footer.php.
 */
$user = currentUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= e($pageTitle ?? 'Dashboard') ?> · WattWatch</title>
<link rel="stylesheet" href="<?= BASE_URL ?>/assets/css/style.css">
<link rel="icon" href="data:,">
</head>
<body>
<div class="app-shell">
  <?php include __DIR__ . '/sidebar.php'; ?>
  <main class="content">
    <div class="topbar">
      <div>
        <h1 class="page-title"><?= e($pageTitle ?? '') ?></h1>
        <?php if (!empty($pageSubtitle)): ?>
          <p class="page-subtitle"><?= e($pageSubtitle) ?></p>
        <?php endif; ?>
      </div>
      <div class="topbar-right">
        <span class="topbar-date"><?= date('M j, Y · g:i A') ?></span>
        <div class="user-chip">
          <div class="avatar"><?= e(strtoupper(substr($user['full_name'] ?? '?', 0, 1))) ?></div>
          <div class="user-chip-text">
            <strong><?= e($user['full_name'] ?? '') ?></strong>
            <span><?= e($user['role_name'] ?? '') ?></span>
          </div>
          <a href="<?= BASE_URL ?>/auth/logout.php" class="logout-link" title="Log out">⏻</a>
        </div>
      </div>
    </div>
    <div class="content-body">
