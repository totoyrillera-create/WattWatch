<?php
require_once __DIR__ . '/../includes/auth.php';
requireLogin();

$pdo = getDB();
$user = currentUser();
$notice = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'update_profile') {
        $fullName = trim($_POST['full_name']);
        $email = trim($_POST['email']);
        try {
            $pdo->prepare("UPDATE users SET full_name = ?, email = ? WHERE user_id = ?")
                ->execute([$fullName, $email, $user['user_id']]);
            $_SESSION['full_name'] = $fullName;
            logActivity($user['user_id'], 'update_profile', 'Updated own profile');
            $notice = 'Profile updated.';
        } catch (PDOException $ex) {
            $error = 'That email is already in use.';
        }
    } elseif ($action === 'change_password') {
        $current = $_POST['current_password'];
        $new = $_POST['new_password'];
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE user_id = ?");
        $stmt->execute([$user['user_id']]);
        $hash = $stmt->fetchColumn();
        if (!password_verify($current, $hash)) {
            $error = 'Current password is incorrect.';
        } elseif (strlen($new) < 8) {
            $error = 'New password must be at least 8 characters.';
        } else {
            $pdo->prepare("UPDATE users SET password_hash = ? WHERE user_id = ?")
                ->execute([password_hash($new, PASSWORD_BCRYPT), $user['user_id']]);
            logActivity($user['user_id'], 'change_password', 'Changed own password');
            $notice = 'Password changed.';
        }
    }
}

$stmt = $pdo->prepare("SELECT full_name, email, username FROM users WHERE user_id = ?");
$stmt->execute([$user['user_id']]);
$profile = $stmt->fetch();

$pageTitle = 'Settings';
$pageSubtitle = 'Account and system preferences';
require __DIR__ . '/../includes/header.php';
?>

<?php if ($notice): ?><div class="alert alert-success"><?= e($notice) ?></div><?php endif; ?>
<?php if ($error): ?><div class="alert alert-error"><?= e($error) ?></div><?php endif; ?>

<div class="two-col">
  <div class="panel">
    <div class="panel-head"><h2>Profile</h2></div>
    <form method="post">
      <?= csrfField() ?>
      <input type="hidden" name="action" value="update_profile">
      <div class="form-group"><label>Username</label><input class="form-control" value="<?= e($profile['username']) ?>" disabled></div>
      <div class="form-group"><label>Full name</label><input class="form-control" name="full_name" value="<?= e($profile['full_name']) ?>" required></div>
      <div class="form-group"><label>Email</label><input class="form-control" type="email" name="email" value="<?= e($profile['email']) ?>" required></div>
      <button class="btn btn-primary" type="submit">Save Profile</button>
    </form>
  </div>

  <div class="panel">
    <div class="panel-head"><h2>Change Password</h2></div>
    <form method="post">
      <?= csrfField() ?>
      <input type="hidden" name="action" value="change_password">
      <div class="form-group"><label>Current password</label><input class="form-control" type="password" name="current_password" required></div>
      <div class="form-group"><label>New password</label><input class="form-control" type="password" name="new_password" required minlength="8"></div>
      <button class="btn btn-primary" type="submit">Change Password</button>
    </form>

    <?php if (can('manage_settings')): ?>
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border);">
      <p class="stat-sub" style="font-weight:600;color:var(--text);">Device API key</p>
      <p class="stat-sub">ESP32 devices authenticate to <code>api/sensor_data.php</code> using the key defined in <code>config/constants.php</code> (<code>DEVICE_API_KEY</code>). Change it there and redeploy your firmware if it's ever exposed.</p>
    </div>
    <?php endif; ?>
  </div>
</div>

<?php require __DIR__ . '/../includes/footer.php'; ?>
