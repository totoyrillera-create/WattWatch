<?php
/**
 * includes/functions.php
 * Small shared helpers used across pages and API endpoints.
 */

function e(?string $value): string {
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): void {
    header('Location: ' . BASE_URL . $path);
    exit;
}

/** Records an entry in activity_logs. Call after any create/update/delete/auth action. */
function logActivity(?int $userId, string $action, string $details = ''): void {
    try {
        $pdo = getDB();
        $stmt = $pdo->prepare(
            "INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([$userId, $action, $details, $_SERVER['REMOTE_ADDR'] ?? null]);
    } catch (Exception $e) {
        error_log('logActivity failed: ' . $e->getMessage());
    }
}

function formatWatts(float $w): string {
    return number_format($w, 0) . ' W';
}

function formatKwh(float $k): string {
    return number_format($k, 2) . ' kWh';
}

function timeAgo(string $datetime): string {
    $diff = time() - strtotime($datetime);
    if ($diff < 60) return 'just now';
    if ($diff < 3600) return floor($diff / 60) . 'm ago';
    if ($diff < 86400) return floor($diff / 3600) . 'h ago';
    return floor($diff / 86400) . 'd ago';
}

/** CSRF token helpers — call csrfField() inside every state-changing <form>. */
function csrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function csrfField(): string {
    return '<input type="hidden" name="csrf_token" value="' . e(csrfToken()) . '">';
}

function verifyCsrf(): void {
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(400);
        die('Invalid or expired form submission. Please go back and try again.');
    }
}
