<?php
/**
 * api/sensor_data.php
 * POST endpoint the ESP32 + PZEM-004T firmware calls to submit a reading.
 *
 * Auth: header  X-API-KEY: <DEVICE_API_KEY>   (see config/constants.php)
 *
 * Expected JSON body:
 * {
 *   "device_uid": "ESP32-R204-AC01",
 *   "voltage": 230.1,
 *   "current": 21.78,
 *   "power": 5012.0,
 *   "energy": 3.42          // cumulative kWh counter from the meter
 * }
 *
 * Response: { "status": "ok", "anomaly": true|false }
 */

require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

$apiKey = $_SERVER['HTTP_X_API_KEY'] ?? '';
if (!hash_equals(DEVICE_API_KEY, $apiKey)) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Invalid API key']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);
if (!$payload || empty($payload['device_uid']) || !isset($payload['power'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Malformed payload']);
    exit;
}

$pdo = getDB();

$stmt = $pdo->prepare("SELECT equipment_id, status FROM equipment WHERE device_uid = ?");
$stmt->execute([$payload['device_uid']]);
$equipment = $stmt->fetch();

if (!$equipment) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Unknown device_uid — register this equipment first']);
    exit;
}
$equipmentId = $equipment['equipment_id'];

// Store the reading
$stmt = $pdo->prepare(
    "INSERT INTO readings (equipment_id, voltage, current_amp, power_watts, energy_kwh, recorded_at)
     VALUES (?,?,?,?,?,NOW())"
);
$stmt->execute([
    $equipmentId,
    $payload['voltage'] ?? null,
    $payload['current'] ?? null,
    (float) $payload['power'],
    $payload['energy'] ?? null,
]);
$readingId = $pdo->lastInsertId();

// Threshold-based anomaly detection
$stmt = $pdo->prepare("SELECT min_power, max_power FROM thresholds WHERE equipment_id = ?");
$stmt->execute([$equipmentId]);
$threshold = $stmt->fetch();

$isAnomaly = false;
if ($threshold) {
    $power = (float) $payload['power'];
    if ($power > (float) $threshold['max_power']) {
        $isAnomaly = true;
        $pdo->prepare(
            "INSERT INTO anomalies (equipment_id, reading_id, anomaly_type, reading_value, threshold_value, status)
             VALUES (?,?, 'high_power', ?, ?, 'open')"
        )->execute([$equipmentId, $readingId, $power, $threshold['max_power']]);
    } elseif ($power < (float) $threshold['min_power']) {
        $isAnomaly = true;
        $pdo->prepare(
            "INSERT INTO anomalies (equipment_id, reading_id, anomaly_type, reading_value, threshold_value, status)
             VALUES (?,?, 'low_power', ?, ?, 'open')"
        )->execute([$equipmentId, $readingId, $power, $threshold['min_power']]);
    }
}

logActivity(null, 'sensor_reading', "Reading from {$payload['device_uid']}: {$payload['power']} W" . ($isAnomaly ? ' (ANOMALY)' : ''));

echo json_encode(['status' => 'ok', 'anomaly' => $isAnomaly, 'reading_id' => $readingId]);
