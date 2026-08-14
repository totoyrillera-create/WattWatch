<?php
/**
 * config/constants.php
 * App-wide constants. Included once via includes/auth.php.
 */

define('APP_NAME', 'WattWatch');
define('APP_VERSION', '1.0');
define('BASE_URL', '/wattwatch');   // adjust to your XAMPP htdocs subfolder

// ESP32 devices authenticate to the ingestion API with this shared key
// (send as header X-API-KEY). Change this before deploying.
define('DEVICE_API_KEY', 'wattwatch-device-key-change-me');

// Session lifetime in seconds (30 minutes idle timeout)
define('SESSION_TIMEOUT', 1800);
