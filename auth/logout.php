<?php
require_once __DIR__ . '/../includes/auth.php';
if (!empty($_SESSION['user_id'])) {
    logActivity($_SESSION['user_id'], 'logout', 'User logged out');
}
session_unset();
session_destroy();
redirect('/auth/login.php');
