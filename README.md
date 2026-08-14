# WattWatch

IoT-based electricity consumption monitoring & anomaly detection system.
ESP32 + PZEM-004T → Wi-Fi → PHP/MySQL web app → dashboard.

## Folder structure

```
wattwatch/
├── config/            # DB connection, constants — nothing else touches the DSN directly
│   ├── db.php
│   └── constants.php
├── includes/          # shared server-side code, included by every page
│   ├── auth.php       # session bootstrap, requireLogin(), RBAC (can()/requirePermission())
│   ├── functions.php  # e(), logActivity(), CSRF helpers, formatters
│   ├── header.php     # <head> + topbar (opens the layout)
│   ├── sidebar.php     # left nav, permission-aware
│   └── footer.php     # closes the layout
├── auth/
│   ├── login.php
│   └── logout.php
├── pages/             # one file per screen, each starts with requireLogin()/requirePermission()
│   ├── dashboard.php
│   ├── rooms.php       # rooms + equipment CRUD
│   ├── monitoring.php  # per-equipment live chart
│   ├── anomalies.php
│   ├── thresholds.php
│   ├── users.php       # account + role management
│   ├── logs.php
│   ├── reports.php     # date-range summaries + CSV export
│   ├── settings.php
│   └── 403.php
├── api/
│   ├── sensor_data.php    # POST from ESP32 firmware (API-key auth)
│   └── get_live_data.php  # AJAX poll used by the dashboard (session auth)
├── assets/
│   ├── css/style.css
│   ├── js/dashboard.js
│   └── images/
├── database/
│   ├── wattwatch.sql             # schema + seed data
│   └── least_privilege_user.sql  # dedicated MySQL app account
└── index.php           # redirects to /pages/dashboard.php or /auth/login.php
```

## Setup (XAMPP)

1. Copy this `wattwatch/` folder into `htdocs/`.
2. In phpMyAdmin (or the mysql CLI), run `database/wattwatch.sql`, then
   `database/least_privilege_user.sql`.
3. Edit `config/db.php` — set `DB_PASS` to match the password you used
   in `least_privilege_user.sql`.
4. Edit `config/constants.php` — set `BASE_URL` to your subfolder (e.g.
   `/wattwatch`) and change `DEVICE_API_KEY` to something private.
5. Visit `http://localhost/wattwatch/` and log in with the seed admin
   account: **admin / admin123** — change this password immediately
   under Settings.

## Database design

Normalized to 3NF — no repeating groups, every non-key column depends
only on its table's primary key:

- **roles / permissions / role_permissions** — many-to-many junction so
  privileges can be regranted by editing rows, no code changes needed.
- **users** references `roles` (one role per user).
- **rooms → equipment → readings** — one-to-many chain; `readings` is
  kept separate from `equipment` because it's high-volume time-series
  data, not equipment metadata.
- **thresholds** is one-to-one with `equipment` (kept separate from
  `equipment` itself so it can carry its own `updated_by`/`updated_at`
  audit trail without bloating the equipment row).
- **anomalies** references both `equipment` and the specific `reading`
  that triggered it.
- **activity_logs** is an append-only audit trail referencing `users`.

## User privilege levels (RBAC)

Seeded roles and what they can do (see `role_permissions` in the SQL,
enforced in code via `includes/auth.php`'s `can()` / `requirePermission()`):

| Permission | Administrator | Technician | Viewer |
|---|---|---|---|
| View dashboard / monitoring | ✅ | ✅ | ✅ |
| Manage rooms & equipment | ✅ | ✅ | — |
| Manage thresholds | ✅ | ✅ | — |
| Resolve anomalies | ✅ | ✅ | — |
| View / export reports | ✅ | ✅ | ✅ |
| Manage users | ✅ | — | — |
| View logs | ✅ | — | — |
| Manage settings | ✅ | — | — |

To add a role or change what one can do, edit the `roles` /
`role_permissions` tables — the sidebar and every page automatically
follow the new privileges since they check `can('permission_key')`
rather than hardcoding role names.

## Security notes

- Passwords hashed with bcrypt (`password_hash`/`password_verify`).
- All queries use PDO prepared statements (no string-built SQL).
- CSRF token required on every state-changing form (`csrfField()` / `verifyCsrf()`).
- Session-based auth for the web UI; a separate shared-secret API key
  for the ESP32 ingestion endpoint (devices can't hold user sessions).
- Idle session timeout (30 min, `SESSION_TIMEOUT` in `constants.php`).
- Basic login throttling (5 attempts / 60s).
- Every create/update/delete/login/export writes to `activity_logs`.
- The app connects as `wattwatch_app`, a MySQL user with only
  SELECT/INSERT/UPDATE/DELETE — never as root.

## ESP32 firmware contract

`POST /api/sensor_data.php`
Header: `X-API-KEY: <DEVICE_API_KEY>`
Body:
```json
{ "device_uid": "ESP32-R204-AC01", "voltage": 230.1, "current": 21.78, "power": 5012.0, "energy": 3.42 }
```
`device_uid` must already exist in the `equipment` table (add it under
Rooms/Equipment first). The endpoint stores the reading and — if a
threshold row exists for that equipment — flags an anomaly the moment
`power` falls outside `[min_power, max_power]`, exactly like the
proposal's threshold-based detection logic. Wire the buzzer/LED trigger
into the firmware based on the `"anomaly": true` field in the response.
