<?php
/**
 * includes/auth.php
 * Session bootstrap + role-based access control (RBAC) helpers.
 * Include this at the TOP of every protected page, before any output.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/functions.php';

/** Idle session timeout */
if (isset($_SESSION['user_id'])) {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > SESSION_TIMEOUT) {
        session_unset();
        session_destroy();
        header('Location: ' . BASE_URL . '/auth/login.php?timeout=1');
        exit;
    }
    $_SESSION['last_activity'] = time();
}

/** Redirect to login if not authenticated. Call at the top of every protected page. */
function requireLogin(): void {
    if (empty($_SESSION['user_id'])) {
        header('Location: ' . BASE_URL . '/auth/login.php');
        exit;
    }
}

/** Currently logged-in user's basic info (cached in session at login time). */
function currentUser(): ?array {
    if (empty($_SESSION['user_id'])) return null;
    return [
        'user_id'   => $_SESSION['user_id'],
        'username'  => $_SESSION['username'],
        'full_name' => $_SESSION['full_name'],
        'role_id'   => $_SESSION['role_id'],
        'role_name' => $_SESSION['role_name'],
    ];
}

/**
 * Loads the permission_key set for the logged-in user's role, once per
 * session, from role_permissions (so admins can regrant privileges by
 * editing DB rows only — no code changes needed).
 */
function userPermissions(): array {
    if (empty($_SESSION['user_id'])) return [];
    if (!isset($_SESSION['permissions'])) {
        $pdo = getDB();
        $stmt = $pdo->prepare(
            "SELECT p.permission_key FROM role_permissions rp
             JOIN permissions p ON p.permission_id = rp.permission_id
             WHERE rp.role_id = ?"
        );
        $stmt->execute([$_SESSION['role_id']]);
        $_SESSION['permissions'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    return $_SESSION['permissions'];
}

function can(string $permissionKey): bool {
    return in_array($permissionKey, userPermissions(), true);
}

/** Call at the top of a page that needs a specific privilege. */
function requirePermission(string $permissionKey): void {
    requireLogin();
    if (!can($permissionKey)) {
        http_response_code(403);
        require __DIR__ . '/../pages/403.php';
        exit;
    }
}
