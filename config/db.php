<?php
/**
 * config/db.php
 * Central PDO database connection.
 * Every other file includes THIS file, never opens its own connection.
 */

define('DB_HOST', 'localhost');
define('DB_NAME', 'wattwatch_db');
define('DB_USER', 'wattwatch_app');   // create a least-privilege MySQL user, don't use root
define('DB_PASS', 'CHANGE_ME');
define('DB_CHARSET', 'utf8mb4');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log('DB connection failed: ' . $e->getMessage());
            die('Database connection failed. Please check config/db.php and try again.');
        }
    }
    return $pdo;
}
