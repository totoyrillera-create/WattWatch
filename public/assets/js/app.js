/* ============================================================
   WattWatch — app.js
   SPA controller: routing, API calls, page renders
   ============================================================ */

'use strict';

// ── API helper ────────────────────────────────────────────────
// Resolve to api.php relative to wherever index.php/index.html lives.
// Works for: /WattWatch/public/, http://localhost/WattWatch/public/, etc.
const API_URL = (function () {
    const base = window.location.pathname.replace(/\/[^/]*$/, ''); // strip filename
    return base + '/api.php';
})();

async function api(action, data = null, method = 'GET') {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    let url = `${API_URL}?action=${action}`;
    if (method === 'GET' && data) {
        Object.entries(data).forEach(([k, v]) => url += `&${k}=${encodeURIComponent(v)}`);
    } else if (data) {
        opts.body = JSON.stringify(data);
    }
    const res  = await fetch(url, opts);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(json.message || 'API error');
    return json.data ?? json;
}

// ── Icons (inline SVG strings) ─────────────────────────────────
const ICONS = {
    bolt:       `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3L4 14h7v7l9-11h-7V3z"/></svg>`,
    dashboard:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
    monitor:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    alert:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    report:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    users:      `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
    settings:   `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    logs:       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
    threshold:  `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    room:       `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
    profile:    `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    bell:       `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
    logout:     `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    plus:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    check:      `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>`,
    download:   `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    shield:     `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    edit:       `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
    lock:       `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
    eye:        `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeoff:     `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    trend:      `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>`,
    calendar:   `<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};

const icon = (name, size = 18) => {
    const s = ICONS[name] || '';
    return s.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`);
};

// ── Colours per role ────────────────────────────────────────────
const ROLE_STYLE = {
    admin:            { label: 'Administrator',    cls: 'badge-admin',   avatarBg: '#fef2f2', avatarColor: '#dc2626' },
    facility_manager: { label: 'Facility Manager', cls: 'badge-manager', avatarBg: '#eff6ff', avatarColor: '#2563eb' },
    technician:       { label: 'Technician',       cls: 'badge-tech',    avatarBg: '#fffbeb', avatarColor: '#d97706' },
    viewer:           { label: 'Viewer',           cls: 'badge-viewer',  avatarBg: '#f9fafb', avatarColor: '#6b7280' },
};

const ROOM_ICON = { ac: '❄️', light: '💡', projector: '📽️', fan: '🌀', hvac: '🏭', fridge: '🧊', computer: '🖥️', other: '⚡' };

// ── State ───────────────────────────────────────────────────────
let state = {
    user:         null,
    page:         'dashboard',
    rooms:        [],
    anomalies:    [],
    users:        [],
    logs:         [],
    settings:     {},
    chartData:    { labels: [], values: [] },
    refreshTimer: null,
};

// ── DOM refs ────────────────────────────────────────────────────
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Alerts ─────────────────────────────────────────────────────
function showAlert(id, msg, type = 'success') {
    const el = $(id);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3000);
}

// ── Chart renderer ──────────────────────────────────────────────
function renderChart(labels, values, containerId, height = 180) {
    const wrap = $(containerId);
    if (!wrap) return;
    const max   = Math.max(...values, 1);
    const min   = 0;
    const range = max - min;
    const W = 860, H = height;

    const pts = values.map((v, i) =>
        `${(i / (values.length - 1)) * W},${H - ((v - min) / range) * (H - 10) - 5}`
    ).join(' ');

    const step = Math.ceil(labels.length / 8);
    const xLabels = labels.filter((_, i) => i % step === 0)
        .map(l => `<span>${l}</span>`).join('');

    wrap.innerHTML = `
        <div class="chart-container">
          <div class="chart-y-labels">
            ${[max, Math.round(max*0.75), Math.round(max*0.5), Math.round(max*0.25), 0]
               .map(v => `<span>${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}</span>`).join('')}
          </div>
          <div class="chart-inner">
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:${height}px;display:block">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#22c55e" stop-opacity=".2"/>
                  <stop offset="100%" stop-color="#22c55e" stop-opacity=".01"/>
                </linearGradient>
              </defs>
              <polygon points="0,${H} ${pts} ${W},${H}" fill="url(#cg)"/>
              <polyline points="${pts}" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linejoin="round"/>
            </svg>
            <div class="chart-labels">${xLabels}</div>
          </div>
        </div>`;
}

// Demo chart fallback when no DB data
function demoChart() {
    const hours = ['12AM','3AM','6AM','9AM','12PM','3PM','6PM','9PM'];
    const vals  = [800, 660, 720, 3800, 5200, 4400, 2800, 1100];
    return { labels: hours, values: vals };
}

// ── Progress bar ────────────────────────────────────────────────
function progressBar(pct, cls) {
    return `<div class="progress-wrap"><div class="progress-bar ${cls}" style="width:${pct}%"></div></div>`;
}

// ── Badge helper ────────────────────────────────────────────────
function badge(text, cls) { return `<span class="badge badge-${cls}">${text}</span>`; }

// ── Navigation ──────────────────────────────────────────────────
function navigate(page) {
    state.page = page;
    $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
    renderPage(page);
}

// ── Page router ──────────────────────────────────────────────────
function renderPage(page) {
    const content = $('page-content');
    content.innerHTML = `<div class="spinner-wrap"><div class="spinner"></div></div>`;

    const renders = {
        dashboard:  renderDashboard,
        rooms:      renderRooms,
        monitoring: renderMonitoring,
        anomalies:  renderAnomalies,
        reports:    renderReports,
        thresholds: renderThresholds,
        users:      renderUsers,
        logs:       renderLogs,
        settings:   renderSettings,
        profile:    renderProfile,
    };
    (renders[page] || renderDashboard)();
}

// ════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════
async function renderDashboard() {
    const content = $('page-content');
    let stats;
    try { stats = await api('dashboard_stats'); } catch { stats = null; }

    const rooms      = stats?.rooms      || [];
    const totalPower = rooms.reduce((s, r) => s + parseFloat(r.power_watts || 0), 0);
    const todayE     = parseFloat(stats?.today_energy  || 45.67).toFixed(2);
    const monthE     = parseFloat(stats?.month_energy  || 1256.34).toFixed(2);
    const activeAnom = parseInt(stats?.active_anomalies || 2);

    const cd = demoChart();

    content.innerHTML = `
        <div class="page-header"><h1>Dashboard</h1><p>Welcome back, ${state.user.full_name}!</p></div>

        <div class="stats-grid">
          <div class="card card-body stat-card">
            <div class="stat-icon" style="background:#f0fdf4">${icon('bolt', 22)}</div>
            <div><label>Total Power (Now)</label><h2 class="text-green">${totalPower.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,',')} W</h2><small>Updated: ${new Date().toLocaleTimeString()}</small></div>
          </div>
          <div class="card card-body stat-card">
            <div class="stat-icon" style="background:#eff6ff">${icon('trend', 22)}</div>
            <div><label>Total Energy (Today)</label><h2 class="text-blue">${todayE} kWh</h2><small>From 12:00 AM</small></div>
          </div>
          <div class="card card-body stat-card">
            <div class="stat-icon" style="background:#fffbeb">${icon('calendar', 22)}</div>
            <div><label>Total Energy (This Month)</label><h2 class="text-yellow">${monthE} kWh</h2><small>${new Date().toLocaleString('default',{month:'long'})} 1 – ${new Date().getDate()}</small></div>
          </div>
          <div class="card card-body stat-card">
            <div class="stat-icon" style="background:#fef2f2">${icon('alert', 22)}</div>
            <div><label>Active Anomalies</label><h2 class="text-red">${activeAnom}</h2><small>Requires attention</small></div>
          </div>
        </div>

        <div class="grid-2-1">
          <div class="card card-body">
            <div class="flex-between mb-14">
              <span class="card-title mt-0" style="margin-bottom:0">Power Consumption Over Time</span>
              <span style="font-size:12px;color:var(--green);font-weight:600;background:var(--green-bg);padding:4px 10px;border-radius:20px">● Live</span>
            </div>
            <div id="main-chart"></div>
          </div>

          <div class="card card-body">
            <div class="flex-between mb-14">
              <span class="card-title mt-0" style="margin-bottom:0">Recent Anomalies</span>
              <a href="#" style="font-size:12px;color:var(--green);font-weight:600" onclick="navigate('anomalies');return false">View all</a>
            </div>
            <div id="recent-anomalies-list"></div>
          </div>
        </div>

        <div class="card card-body">
          <div class="flex-between mb-14">
            <span class="card-title mt-0" style="margin-bottom:0">Current Power by Room / Equipment</span>
            <a href="#" style="font-size:12px;color:var(--green);font-weight:600" onclick="navigate('monitoring');return false">View all</a>
          </div>
          <div class="room-cards-grid" id="room-cards"></div>
        </div>

        <p class="page-footer">WattWatch v1.0 · Readings are updated in real-time · User Role: ${ROLE_STYLE[state.user.role_key]?.label}</p>`;

    // Render chart
    renderChart(cd.labels, cd.values, 'main-chart', 180);

    // Render room cards
    const rcEl = $('room-cards');
    rcEl.innerHTML = rooms.length
        ? rooms.map(r => {
            const isAnom = r.status === 'anomaly';
            return `<div class="room-card ${isAnom ? 'anomaly' : ''}">
              <div class="room-card-icon">${ROOM_ICON[r.icon_key] || '⚡'}</div>
              <h4>${r.room_name}</h4><p>${r.equipment_label}</p>
              <div class="power ${isAnom ? 'bad' : 'ok'}">${parseFloat(r.power_watts || 0).toFixed(0)} W</div>
              ${badge(isAnom ? 'Anomaly' : 'Normal', isAnom ? 'anomaly' : 'normal')}
            </div>`;
          }).join('')
        : '<p class="text-muted" style="font-size:13px">No room data yet. Rooms will appear once the ESP32 sends readings.</p>';

    // Recent anomalies
    loadRecentAnomalies();
}

async function loadRecentAnomalies() {
    const el = $('recent-anomalies-list');
    if (!el) return;
    try {
        const list = await api('get_anomalies', { status: 'active' });
        el.innerHTML = list.length
            ? list.slice(0, 3).map(a => `
                <div class="recent-anomaly">
                  <div class="recent-anomaly-icon">${icon('alert', 18)}</div>
                  <div>
                    <div class="flex-between gap-8" style="flex-wrap:wrap">
                      <h5>${a.room_name} – ${a.equipment_label}</h5>
                      ${badge(a.type_label, 'high')}
                    </div>
                    <p>Current: ${parseFloat(a.power_at_event).toLocaleString()} W · Threshold: ${parseFloat(a.threshold_used).toLocaleString()} W</p>
                    <small>${a.detected_at}</small>
                  </div>
                </div>`).join('')
            : '<p class="text-muted" style="font-size:13px;padding:20px 0">No active anomalies.</p>';
    } catch { el.innerHTML = '<p class="text-muted" style="font-size:13px">Could not load anomalies.</p>'; }
}

// ════════════════════════════════════════════════════════════════
// ROOMS
// ════════════════════════════════════════════════════════════════
async function renderRooms() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header-row">
          <div><h1>Rooms &amp; Equipment</h1><p class="text-muted">Manage monitored rooms and devices</p></div>
          <button class="btn btn-primary" onclick="showRoomForm()">${icon('plus')} Add Room</button>
        </div>

        <div id="room-form-wrap"></div>
        <div id="room-alert" class="alert hidden"></div>

        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Room</th><th>Equipment</th><th>Location</th><th>Type</th>
              <th>Threshold (W)</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody id="rooms-tbody"><tr><td colspan="7" style="text-align:center;padding:30px"><div class="spinner" style="margin:0 auto"></div></td></tr></tbody>
          </table>
        </div>`;

    loadRoomsTable();
}

async function loadRoomsTable() {
    try {
        const rooms = await api('get_rooms');
        state.rooms = rooms;
        const tbody = $('rooms-tbody');
        tbody.innerHTML = rooms.map((r, i) => `
            <tr style="background:${i%2?'var(--slate-50)':'#fff'}">
              <td class="fw-700">${r.room_name}</td>
              <td>${r.equipment_label}</td>
              <td class="text-muted">${r.building_name}</td>
              <td>${r.type_name}</td>
              <td>${parseFloat(r.threshold_watts).toLocaleString()}</td>
              <td>${badge(r.status==='anomaly'?'Anomaly':'Normal', r.status==='anomaly'?'anomaly':'normal')}</td>
              <td>
                <div class="flex gap-8">
                  <button class="btn btn-blue btn-sm" onclick="showRoomForm(${r.room_id})">${icon('edit')} Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteRoom(${r.room_id})">${icon('trash')} Delete</button>
                </div>
              </td>
            </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--slate-400)">No rooms found.</td></tr>';
    } catch { $('rooms-tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--red);padding:20px">Failed to load rooms.</td></tr>'; }
}

function showRoomForm(roomId = null) {
    const room = roomId ? state.rooms.find(r => r.room_id == roomId) : null;
    $('room-form-wrap').innerHTML = `
        <div class="form-panel">
          <h3>${room ? 'Edit Room' : 'Add New Room'}</h3>
          <div class="form-grid">
            <div class="form-group"><label>Room Name</label><input id="rf-name" class="form-control" placeholder="e.g. Room 204" value="${room?.room_name || ''}"></div>
            <div class="form-group"><label>Equipment Label</label><input id="rf-equip" class="form-control" placeholder="e.g. Air Conditioner" value="${room?.equipment_label || ''}"></div>
            <div class="form-group"><label>Location / Building</label><input id="rf-bldg" class="form-control" placeholder="e.g. Building A" value="${room?.building_name || ''}"></div>
            <div class="form-group"><label>Power Threshold (W)</label><input id="rf-thresh" type="number" class="form-control" placeholder="e.g. 3000" value="${room?.threshold_watts || ''}"></div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="saveRoom(${roomId || 'null'})">${icon('check')} Save</button>
            <button class="btn btn-secondary" onclick="$('room-form-wrap').innerHTML=''">Cancel</button>
          </div>
        </div>`;
}

async function saveRoom(roomId) {
    const data = {
        room_name: $('rf-name').value.trim(),
        equipment_label: $('rf-equip').value.trim(),
        building_name: $('rf-bldg').value.trim() || 'Building A',
        threshold_watts: parseFloat($('rf-thresh').value) || 1000,
        type_id: 8,
    };
    if (!data.room_name || !data.equipment_label) return showAlert('room-alert','Please fill in all required fields.','error');
    try {
        if (roomId) { data.room_id = roomId; await api('update_room', data, 'POST'); }
        else { await api('add_room', data, 'POST'); }
        $('room-form-wrap').innerHTML = '';
        showAlert('room-alert', roomId ? 'Room updated!' : 'Room added!');
        loadRoomsTable();
    } catch (e) { showAlert('room-alert', e.message, 'error'); }
}

async function deleteRoom(roomId) {
    if (!confirm('Remove this room from monitoring?')) return;
    try { await api('delete_room', { room_id: roomId }, 'POST'); loadRoomsTable(); }
    catch (e) { alert(e.message); }
}

// ════════════════════════════════════════════════════════════════
// MONITORING
// ════════════════════════════════════════════════════════════════
async function renderMonitoring() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header"><h1>Real-time Monitoring</h1><p>Live electricity readings from all monitored locations</p></div>
        <div class="grid-monitor">
          <div class="card" id="monitor-list-card" style="height:fit-content">
            <div style="padding:12px 16px;border-bottom:1px solid var(--slate-100);background:var(--slate-50)">
              <p style="font-size:11px;font-weight:600;color:var(--slate-500);text-transform:uppercase;letter-spacing:.5px">Select Monitor</p>
            </div>
            <div id="monitor-list"></div>
          </div>
          <div id="monitor-detail"><div class="spinner-wrap"><div class="spinner"></div></div></div>
        </div>`;

    try {
        const stats = await api('dashboard_stats');
        state.rooms = stats.rooms || [];
        const list = $('monitor-list');
        list.innerHTML = state.rooms.map(r => `
            <button class="monitor-list-item" data-rid="${r.room_id}" onclick="selectMonitor(${r.room_id})">
              <div class="monitor-list-dot" style="background:${r.status==='anomaly'?'var(--red)':'var(--green)'}"></div>
              <div><h5>${r.room_name}</h5><span>${r.equipment_label}</span></div>
              <span class="monitor-list-power" style="color:${r.status==='anomaly'?'var(--red)':'var(--slate-700)'}">${parseFloat(r.power_watts||0).toFixed(0)} W</span>
            </button>`).join('');

        if (state.rooms.length) selectMonitor(state.rooms[0].room_id);
        else $('monitor-detail').innerHTML = '<div class="card card-body"><p class="text-muted">No rooms configured yet.</p></div>';
    } catch { $('monitor-detail').innerHTML = '<div class="card card-body"><p class="text-muted">Could not load rooms.</p></div>'; }
}

async function selectMonitor(roomId) {
    $$('.monitor-list-item').forEach(el => el.classList.toggle('active', el.dataset.rid == roomId));
    const room = state.rooms.find(r => r.room_id == roomId);
    if (!room) return;

    const isAnom = room.status === 'anomaly';
    $('monitor-detail').innerHTML = `
        <div class="card card-body mb-18">
          <div class="flex-between mb-18">
            <div><h2 style="font-size:18px;font-weight:800">${room.room_name} — ${room.equipment_label}</h2>
            <p class="text-muted" style="font-size:12px;margin-top:3px">${room.building_name} · Updated live</p></div>
            ${badge(isAnom ? 'Anomaly Detected' : 'Normal', isAnom ? 'anomaly' : 'normal')}
          </div>
          <div class="grid-readings">
            ${[
              ['Voltage',  `${parseFloat(room.voltage||220).toFixed(1)} V`,    '#3b82f6', '#eff6ff'],
              ['Current',  `${parseFloat(room.current_amp||0).toFixed(3)} A`,  '#f59e0b', '#fffbeb'],
              ['Power',    `${parseFloat(room.power_watts||0).toFixed(1)} W`,  isAnom?'#ef4444':'#22c55e', isAnom?'#fef2f2':'#f0fdf4'],
              ['Energy',   `${parseFloat(room.energy_kwh||0).toFixed(4)} kWh`, '#8b5cf6', '#f5f3ff'],
            ].map(([label, val, col, bg]) => `
              <div class="metric-box" style="background:${bg}">
                <label style="color:${col}">${label}</label>
                <div class="val" style="color:${col}">${val}</div>
              </div>`).join('')}
          </div>
        </div>
        <div class="card card-body">
          <div class="flex-between mb-14">
            <span class="card-title mt-0" style="margin-bottom:0">Power Trend (Today)</span>
            <span style="font-size:12px;color:var(--slate-500)">Threshold: ${parseFloat(room.threshold_watts).toLocaleString()} W</span>
          </div>
          <div id="detail-chart"></div>
        </div>`;

    // Load chart
    try {
        const chartData = await api('get_chart', { room_id: roomId, period: 'today' });
        if (chartData.length) {
            renderChart(chartData.map(d => d.label), chartData.map(d => parseFloat(d.value)), 'detail-chart', 160);
        } else {
            const cd = demoChart();
            renderChart(cd.labels, cd.values.map(v => v * (parseFloat(room.power_watts||1000) / 5432)), 'detail-chart', 160);
        }
    } catch {
        const cd = demoChart();
        renderChart(cd.labels, cd.values, 'detail-chart', 160);
    }
}

// ════════════════════════════════════════════════════════════════
// ANOMALIES
// ════════════════════════════════════════════════════════════════
async function renderAnomalies() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header"><h1>Anomalies</h1><p>Detected power anomalies and threshold violations</p></div>
        <div class="filter-tabs">
          <button class="filter-tab active" data-filter="all"   onclick="filterAnomalies('all',this)">All</button>
          <button class="filter-tab"        data-filter="active" onclick="filterAnomalies('active',this)">Active</button>
          <button class="filter-tab"        data-filter="resolved" onclick="filterAnomalies('resolved',this)">Resolved</button>
        </div>
        <div id="anomalies-list"><div class="spinner-wrap"><div class="spinner"></div></div></div>`;

    loadAnomaliesList('all');
}

async function loadAnomaliesList(filter) {
    const el = $('anomalies-list');
    try {
        const list = await api('get_anomalies', { status: filter });
        el.innerHTML = list.length
            ? list.map(a => {
                const isActive = a.status === 'active';
                const canResolve = state.user.role_key === 'admin' || state.user.role_key === 'facility_manager';
                const pct = ((parseFloat(a.power_at_event) - parseFloat(a.threshold_used)) / parseFloat(a.threshold_used) * 100).toFixed(1);
                return `<div class="anomaly-card ${isActive ? 'active-card' : ''}">
                  <div class="anomaly-icon" style="background:${isActive?'var(--red-bg)':'var(--green-bg)'}">
                    ${isActive ? icon('alert', 20) : icon('check', 20)}
                  </div>
                  <div style="flex:1">
                    <div class="flex gap-8" style="align-items:center;flex-wrap:wrap;margin-bottom:4px">
                      <strong style="font-size:14px">${a.room_name} — ${a.equipment_label}</strong>
                      ${badge(a.type_label, 'high')}
                      ${badge(a.status, isActive ? 'active' : 'resolved')}
                    </div>
                    <p style="font-size:13px;color:var(--slate-600)">Current: <strong style="color:var(--red)">${parseFloat(a.power_at_event).toLocaleString()} W</strong>
                       · Threshold: ${parseFloat(a.threshold_used).toLocaleString()} W · Exceeded by ${pct}%</p>
                    <p style="font-size:12px;color:var(--slate-400);margin-top:4px">Detected: ${a.detected_at}${a.resolved_by_name ? ' · Resolved by: ' + a.resolved_by_name : ''}</p>
                  </div>
                  ${isActive && canResolve ? `<button class="btn btn-secondary btn-sm" onclick="resolveAnomaly(${a.anomaly_id})">${icon('check')} Mark Resolved</button>` : ''}
                </div>`;
              }).join('')
            : '<div class="empty-state">' + icon('check', 40) + '<p>No anomalies found.</p></div>';
    } catch { el.innerHTML = '<div class="empty-state"><p class="text-red">Failed to load anomalies.</p></div>'; }
}

function filterAnomalies(filter, btn) {
    $$('.filter-tab').forEach(el => el.classList.remove('active'));
    btn.classList.add('active');
    loadAnomaliesList(filter);
}

async function resolveAnomaly(id) {
    try { await api('resolve_anomaly', { anomaly_id: id }, 'POST'); loadAnomaliesList('all'); } catch (e) { alert(e.message); }
}

// ════════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════════
async function renderReports() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header-row">
          <div><h1>Reports</h1><p class="text-muted">Consumption analysis and summaries</p></div>
          <button class="btn btn-primary" onclick="window.print()">${icon('download')} Export / Print</button>
        </div>
        <div class="filter-tabs">
          <button class="filter-tab active" onclick="loadReport('daily',this)">Daily</button>
          <button class="filter-tab"        onclick="loadReport('weekly',this)">Weekly</button>
          <button class="filter-tab"        onclick="loadReport('monthly',this)">Monthly</button>
        </div>
        <div id="report-content"><div class="spinner-wrap"><div class="spinner"></div></div></div>`;

    loadReport('daily', $$('.filter-tab')[0]);
}

async function loadReport(period, btn) {
    if (btn) { $$('.filter-tab').forEach(el => el.classList.remove('active')); btn.classList.add('active'); }
    const el = $('report-content');
    try {
        const data = await api('get_report', { period });
        const s    = data.summary;
        const cd   = demoChart();

        el.innerHTML = `
            <div class="stats-grid mb-18">
              ${[
                ['Total Energy', (parseFloat(s.total_energy)||45.67).toFixed(2) + ' kWh', 'blue',   'var(--blue-bg)'],
                ['Peak Power',   (parseFloat(s.peak_power)||5432).toLocaleString() + ' W', 'yellow', 'var(--yellow-bg)'],
                ['Anomalies',    data.anomaly_count,                                        'red',    'var(--red-bg)'],
                ['Rooms',        s.rooms_monitored || 7,                                    'green',  'var(--green-bg)'],
              ].map(([l,v,c,bg]) => `
                <div class="card card-body" style="background:${bg}">
                  <label style="font-size:12px;font-weight:600;color:var(--${c})">${l}</label>
                  <div style="font-size:22px;font-weight:800;color:var(--${c});margin-top:4px">${v}</div>
                </div>`).join('')}
            </div>
            <div class="card card-body mb-18">
              <div class="card-title">Consumption Chart</div>
              <div id="report-chart"></div>
            </div>
            <div class="card card-body">
              <div class="card-title">Consumption by Room</div>
              ${(data.by_room || []).map(r => {
                const pct = Math.min(100, Math.round((parseFloat(r.avg_power||0) / 6000) * 100));
                const cls = pct > 80 ? 'over' : pct > 60 ? 'warn' : 'ok';
                return `<div class="report-row">
                  <div class="report-row-label"><strong>${r.room_name}</strong><br><span class="text-muted" style="font-size:11px">${r.equipment_label}</span></div>
                  <div class="report-row-bar">${progressBar(pct, cls)}</div>
                  <div class="report-row-power">${parseFloat(r.avg_power||0).toFixed(0)} W avg</div>
                </div>`;
              }).join('') || '<p class="text-muted" style="font-size:13px">No data available for this period.</p>'}
            </div>`;

        renderChart(cd.labels, cd.values, 'report-chart', 180);
    } catch { el.innerHTML = '<div class="card card-body"><p class="text-red">Failed to load report.</p></div>'; }
}

// ════════════════════════════════════════════════════════════════
// THRESHOLDS
// ════════════════════════════════════════════════════════════════
async function renderThresholds() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header"><h1>Thresholds</h1><p>Set power limits for anomaly detection</p></div>
        <div id="thresh-alert" class="alert hidden"></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Room</th><th>Equipment</th><th>Power (W)</th><th>Threshold (W)</th><th>Usage</th><th>Action</th></tr></thead>
            <tbody id="thresh-tbody"><tr><td colspan="6" style="text-align:center;padding:30px"><div class="spinner" style="margin:0 auto"></div></td></tr></tbody>
          </table>
        </div>`;

    loadThresholdsTable();
}

async function loadThresholdsTable() {
    try {
        const rooms = await api('get_rooms');
        state.rooms = rooms;
        $('thresh-tbody').innerHTML = rooms.map((r, i) => {
            const pw  = parseFloat(r.power_watts || 0);
            const th  = parseFloat(r.threshold_watts);
            const pct = Math.min(100, Math.round((pw / th) * 100));
            const cls = pw > th ? 'over' : pct > 80 ? 'warn' : 'ok';
            return `<tr style="background:${i%2?'var(--slate-50)':'#fff'}">
              <td class="fw-700">${r.room_name}</td>
              <td>${r.equipment_label}</td>
              <td style="font-weight:700;color:${pw>th?'var(--red)':'var(--slate-900)'}">${pw.toFixed(0)}</td>
              <td id="td-thresh-${r.room_id}">
                <span class="fw-700">${th.toLocaleString()} W</span>
                <button class="btn btn-blue btn-sm" style="margin-left:8px" onclick="editThreshold(${r.room_id},${th})">Set</button>
              </td>
              <td style="min-width:160px">
                ${progressBar(pct, cls)}
                <p style="font-size:11px;color:${pw>th?'var(--red)':'var(--slate-500)'};margin-top:4px">${pct}% of limit</p>
              </td>
              <td></td>
            </tr>`;
        }).join('');
    } catch { $('thresh-tbody').innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--red);padding:20px">Failed to load.</td></tr>'; }
}

function editThreshold(roomId, current) {
    const td = $(`td-thresh-${roomId}`);
    td.innerHTML = `
        <div class="flex gap-8">
          <input id="th-input-${roomId}" type="number" class="form-control" value="${current}" style="width:90px;padding:6px 8px">
          <button class="btn btn-primary btn-sm" onclick="saveThreshold(${roomId})">${icon('check')}</button>
          <button class="btn btn-secondary btn-sm" onclick="loadThresholdsTable()">✗</button>
        </div>`;
}

async function saveThreshold(roomId) {
    const val = parseFloat($(`th-input-${roomId}`)?.value);
    if (!val || val <= 0) return showAlert('thresh-alert', 'Enter a valid threshold.', 'error');
    try {
        await api('set_threshold', { room_id: roomId, threshold_watts: val }, 'POST');
        showAlert('thresh-alert', 'Threshold updated!');
        loadThresholdsTable();
    } catch (e) { showAlert('thresh-alert', e.message, 'error'); }
}

// ════════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════════
async function renderUsers() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header-row">
          <div><h1>User Management</h1><p class="text-muted">Manage system users and privileges</p></div>
          <button class="btn btn-primary" onclick="showUserForm()">${icon('plus')} Add User</button>
        </div>
        <div id="user-alert" class="alert hidden"></div>
        <div id="user-form-wrap"></div>
        <div id="users-list"><div class="spinner-wrap"><div class="spinner"></div></div></div>`;

    loadUsersList();
}

async function loadUsersList() {
    try {
        const users = await api('get_users');
        state.users = users;
        const el = $('users-list');
        el.innerHTML = users.map(u => {
            const rs  = ROLE_STYLE[u.role_key] || ROLE_STYLE.viewer;
            const isMe = u.user_id == state.user.user_id;
            const PERMS = { admin: ['dashboard','rooms','monitoring','anomalies','reports','thresholds','users','logs','settings'], facility_manager: ['dashboard','monitoring','anomalies','reports','profile'], technician: ['dashboard','monitoring','anomalies','profile'], viewer: ['dashboard','profile'] };
            return `<div class="user-card">
              <div class="user-card-avatar" style="background:${rs.avatarBg};color:${rs.avatarColor}">${u.avatar}</div>
              <div class="user-card-info">
                <h4>${u.full_name} ${isMe ? '<span style="font-size:11px;background:var(--green-bg);color:var(--green-dark);padding:2px 7px;border-radius:20px;font-weight:600">You</span>' : ''}</h4>
                <p>${u.email}${u.department ? ' · ' + u.department : ''}</p>
                <small>Last login: ${u.last_login || 'Never'}</small>
              </div>
              <div class="user-card-actions">
                <div class="user-card-badges">
                  ${badge(rs.label, u.role_key === 'admin' ? 'admin' : u.role_key === 'facility_manager' ? 'manager' : u.role_key === 'technician' ? 'tech' : 'viewer')}
                  ${badge(u.status, u.status === 'active' ? 'normal' : 'inactive')}
                </div>
                <div class="user-card-btns">
                  <button class="btn btn-blue btn-sm" onclick="showUserForm(${u.user_id})">${icon('edit')} Edit</button>
                  ${!isMe ? `
                  <button class="btn btn-secondary btn-sm" onclick="toggleUser(${u.user_id})">${u.status==='active'?'Deactivate':'Activate'}</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.user_id})">${icon('trash')}</button>` : ''}
                </div>
              </div>
            </div>`;
        }).join('');
    } catch { $('users-list').innerHTML = '<p class="text-red" style="padding:20px">Failed to load users.</p>'; }
}

function showUserForm(userId = null) {
    const u    = userId ? state.users.find(x => x.user_id == userId) : null;
    const PERMS = { admin: ['dashboard','rooms','monitoring','anomalies','reports','thresholds','users','logs','settings'], facility_manager: ['dashboard','monitoring','anomalies','reports','profile'], technician: ['dashboard','monitoring','anomalies','profile'], viewer: ['dashboard','profile'] };

    $('user-form-wrap').innerHTML = `
        <div class="form-panel">
          <h3>${u ? 'Edit User' : 'Add New User'}</h3>
          <div class="form-grid">
            <div class="form-group"><label>Full Name</label><input id="uf-name" class="form-control" value="${u?.full_name||''}"></div>
            <div class="form-group"><label>Email</label><input id="uf-email" type="email" class="form-control" value="${u?.email||''}"></div>
            ${!u ? `<div class="form-group"><label>Password</label><input id="uf-pw" type="password" class="form-control" placeholder="••••••••"></div>` : ''}
            <div class="form-group"><label>Department</label><input id="uf-dept" class="form-control" value="${u?.department||''}"></div>
            <div class="form-group"><label>Role</label>
              <select id="uf-role" class="form-control" onchange="updatePermPreview()">
                ${Object.entries(ROLE_STYLE).map(([k,v]) => `<option value="${k}" ${u?.role_key===k?'selected':''}>${v.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="margin-top:12px;padding:14px;background:var(--slate-50);border-radius:10px">
            <p style="font-size:12px;font-weight:600;color:var(--slate-500);margin-bottom:8px">Permissions for selected role:</p>
            <div id="perm-preview" class="perm-tags">${(PERMS[u?.role_key||'viewer']||[]).map(p=>`<span class="perm-tag">${p}</span>`).join('')}</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="saveUser(${userId||'null'})">${icon('check')} Save</button>
            <button class="btn btn-secondary" onclick="$('user-form-wrap').innerHTML=''">Cancel</button>
          </div>
        </div>`;
}

function updatePermPreview() {
    const PERMS = { admin: ['dashboard','rooms','monitoring','anomalies','reports','thresholds','users','logs','settings'], facility_manager: ['dashboard','monitoring','anomalies','reports','profile'], technician: ['dashboard','monitoring','anomalies','profile'], viewer: ['dashboard','profile'] };
    const role = $('uf-role')?.value || 'viewer';
    $('perm-preview').innerHTML = (PERMS[role]||[]).map(p=>`<span class="perm-tag">${p}</span>`).join('');
}

async function saveUser(userId) {
    const data = { full_name: $('uf-name').value.trim(), email: $('uf-email').value.trim(), role_key: $('uf-role').value, department: $('uf-dept').value.trim() };
    if (!data.full_name || !data.email) return showAlert('user-alert','Name and email are required.','error');
    if (!userId) data.password = $('uf-pw')?.value || 'password';
    try {
        if (userId) { data.user_id = userId; await api('update_user', data, 'POST'); }
        else { await api('add_user', data, 'POST'); }
        $('user-form-wrap').innerHTML = '';
        showAlert('user-alert', userId ? 'User updated!' : 'User added!');
        loadUsersList();
    } catch (e) { showAlert('user-alert', e.message, 'error'); }
}

async function toggleUser(id) {
    try { await api('toggle_user', { user_id: id }, 'POST'); loadUsersList(); } catch (e) { alert(e.message); }
}
async function deleteUser(id) {
    if (!confirm('Delete this user?')) return;
    try { await api('delete_user', { user_id: id }, 'POST'); loadUsersList(); } catch (e) { alert(e.message); }
}

// ════════════════════════════════════════════════════════════════
// LOGS
// ════════════════════════════════════════════════════════════════
async function renderLogs() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header"><h1>System Logs</h1><p>Complete activity and audit trail</p></div>
        <div class="table-wrap">
          <div id="logs-list"><div class="spinner-wrap"><div class="spinner"></div></div></div>
        </div>`;

    try {
        const logs  = await api('get_logs');
        const TCOL  = { auth:'#3b82f6;background:#eff6ff', anomaly:'#dc2626;background:#fef2f2', settings:'#d97706;background:#fffbeb', room:'#16a34a;background:#f0fdf4', report:'#7c3aed;background:#f5f3ff', system:'#64748b;background:#f9fafb' };
        $('logs-list').innerHTML = logs.map((l, i) => {
            const tc = TCOL[l.log_type] || TCOL.system;
            return `<div class="log-row" style="background:${i%2?'var(--slate-50)':'#fff'}">
              <span class="log-type-tag" style="color:${tc.split(';')[0]};${tc.split(';')[1]}">${l.log_type}</span>
              <div style="flex:1"><strong>${l.full_name||'System'}</strong> — ${l.action}</div>
              <span style="font-size:11px;color:var(--slate-400);flex-shrink:0">${l.logged_at}</span>
            </div>`;
        }).join('') || '<div class="empty-state"><p>No logs found.</p></div>';
    } catch { $('logs-list').innerHTML = '<div class="empty-state"><p class="text-red">Failed to load logs.</p></div>'; }
}

// ════════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════════
async function renderSettings() {
    const content = $('page-content');
    content.innerHTML = `
        <div class="page-header"><h1>System Settings</h1><p>Configure WattWatch parameters</p></div>
        <div id="settings-alert" class="alert hidden"></div>
        <div class="grid-2">
          <div class="card card-body">
            <h3 class="card-title">General</h3>
            <div class="form-group"><label>System Name</label><input id="s-name" class="form-control" value="WattWatch"></div>
            <div class="form-group"><label>Timezone</label><input id="s-tz" class="form-control" value="Asia/Manila"></div>
            <div class="form-group"><label>Data Refresh Rate (seconds)</label><input id="s-refresh" type="number" class="form-control" value="5"></div>
            <div class="form-group"><label>Data Retention (days)</label><input id="s-retain" type="number" class="form-control" value="90"></div>
          </div>
          <div class="card card-body">
            <h3 class="card-title">Alert Notifications</h3>
            ${[['alert_email','Email Alerts','Send anomaly alerts via email'],['alert_dashboard','Dashboard Alerts','Show popup alerts on dashboard'],['alert_buzzer','Buzzer / LED Alert','Trigger hardware buzzer on ESP32']].map(([k,l,d]) => `
            <div class="settings-row">
              <div><h5>${l}</h5><p>${d}</p></div>
              <div class="toggle-wrap">
                <input type="checkbox" id="tog-${k}" class="toggle-input" checked>
                <label for="tog-${k}" class="toggle-label"></label>
              </div>
            </div>`).join('')}
          </div>
        </div>
        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="saveSettings()">${icon('check')} Save Settings</button>
        </div>`;

    // Load real settings
    try {
        const s = await api('get_settings');
        if ($('s-name')) $('s-name').value = s.system_name || 'WattWatch';
        if ($('s-tz'))   $('s-tz').value   = s.timezone || 'Asia/Manila';
        if ($('s-refresh')) $('s-refresh').value = s.refresh_rate || '5';
        if ($('s-retain'))  $('s-retain').value  = s.data_retention || '90';
        ['alert_email','alert_dashboard','alert_buzzer'].forEach(k => {
            const el = $('tog-' + k);
            if (el) el.checked = s[k] !== '0';
        });
    } catch { /* use defaults */ }
}

async function saveSettings() {
    const data = {
        system_name:    $('s-name')?.value    || 'WattWatch',
        timezone:       $('s-tz')?.value      || 'Asia/Manila',
        refresh_rate:   $('s-refresh')?.value || '5',
        data_retention: $('s-retain')?.value  || '90',
        alert_email:    $('tog-alert_email')?.checked    ? '1' : '0',
        alert_dashboard:$('tog-alert_dashboard')?.checked? '1' : '0',
        alert_buzzer:   $('tog-alert_buzzer')?.checked   ? '1' : '0',
    };
    try { await api('save_settings', data, 'POST'); showAlert('settings-alert', 'Settings saved!'); } catch (e) { showAlert('settings-alert', e.message, 'error'); }
}

// ════════════════════════════════════════════════════════════════
// PROFILE
// ════════════════════════════════════════════════════════════════
async function renderProfile() {
    const u   = state.user;
    const rs  = ROLE_STYLE[u.role_key] || ROLE_STYLE.viewer;
    const PERMS = { admin: ['dashboard','rooms','monitoring','anomalies','reports','thresholds','users','logs','settings'], facility_manager: ['dashboard','monitoring','anomalies','reports','profile'], technician: ['dashboard','monitoring','anomalies','profile'], viewer: ['dashboard','profile'] };
    const perms = PERMS[u.role_key] || [];
    const content = $('page-content');

    content.innerHTML = `
        <div class="page-header"><h1>My Profile</h1><p>Manage your account information</p></div>
        <div class="grid-2">
          <div class="card card-body">
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px">
              <div class="user-card-avatar" style="width:56px;height:56px;border-radius:16px;font-size:20px;background:${rs.avatarBg};color:${rs.avatarColor}">${u.avatar}</div>
              <div><h3 style="font-size:18px;font-weight:800;margin:0">${u.full_name}</h3>${badge(rs.label, u.role_key==='admin'?'admin':u.role_key==='facility_manager'?'manager':u.role_key==='technician'?'tech':'viewer')}</div>
            </div>
            <h4 style="font-size:13px;font-weight:700;color:var(--slate-500);margin-bottom:14px">Personal Information</h4>
            <div id="profile-alert" class="alert hidden"></div>
            <div class="form-group"><label>Full Name</label><input id="p-name" class="form-control" value="${u.full_name}"></div>
            <div class="form-group"><label>Email</label><input id="p-email" type="email" class="form-control" value="${u.email}"></div>
            <div class="form-group"><label>Department</label><input id="p-dept" class="form-control" value="${u.department||''}"></div>
            <button class="btn btn-primary" style="width:100%;margin-top:4px" onclick="saveProfile()">${icon('check')} Save Changes</button>
          </div>

          <div style="display:flex;flex-direction:column;gap:18px">
            <div class="card card-body">
              <h4 class="card-title">${icon('lock')} Change Password</h4>
              <div id="pw-alert" class="alert hidden"></div>
              <div class="form-group"><label>Current Password</label><input id="p-curpw" type="password" class="form-control" placeholder="••••••••"></div>
              <div class="form-group"><label>New Password</label><input id="p-newpw" type="password" class="form-control" placeholder="••••••••"></div>
              <div class="form-group"><label>Confirm Password</label><input id="p-confpw" type="password" class="form-control" placeholder="••••••••"></div>
              <button class="btn btn-secondary" style="width:100%" onclick="changePassword()">${icon('lock')} Update Password</button>
            </div>

            <div class="card card-body">
              <h4 class="card-title">${icon('shield')} Your Permissions</h4>
              <div class="perm-tags">${perms.map(p=>`<span class="perm-tag">${p.replace('_',' ')}</span>`).join('')}</div>
            </div>
          </div>
        </div>`;
}

async function saveProfile() {
    const data = { full_name: $('p-name').value.trim(), email: $('p-email').value.trim(), department: $('p-dept').value.trim() };
    try {
        await api('update_profile', data, 'POST');
        state.user.full_name  = data.full_name;
        state.user.email      = data.email;
        $('topbar-username').textContent = data.full_name;
        showAlert('profile-alert', 'Profile updated!');
    } catch (e) { showAlert('profile-alert', e.message, 'error'); }
}

async function changePassword() {
    const data = { current_password: $('p-curpw').value, new_password: $('p-newpw').value, confirm_password: $('p-confpw').value };
    if (!data.current_password || !data.new_password) return showAlert('pw-alert','Fill all password fields.','error');
    try {
        await api('change_password', data, 'POST');
        showAlert('pw-alert', 'Password updated!');
        $('p-curpw').value = $('p-newpw').value = $('p-confpw').value = '';
    } catch (e) { showAlert('pw-alert', e.message, 'error'); }
}

// ════════════════════════════════════════════════════════════════
// SHELL — Sidebar + Topbar
// ════════════════════════════════════════════════════════════════
const ROLE_PERMISSIONS = {
    admin:            ['dashboard','rooms','monitoring','anomalies','reports','thresholds','users','logs','settings'],
    facility_manager: ['dashboard','monitoring','anomalies','reports','profile'],
    technician:       ['dashboard','monitoring','anomalies','profile'],
    viewer:           ['dashboard','profile'],
};

const NAV_ITEMS = [
    { id: 'dashboard',  label: 'Dashboard',             icon: 'dashboard', roles: ['admin','facility_manager','technician','viewer'] },
    { id: 'rooms',      label: 'Rooms / Equipment',     icon: 'room',      roles: ['admin'] },
    { id: 'monitoring', label: 'Real-time Monitoring',  icon: 'monitor',   roles: ['admin','facility_manager','technician'] },
    { id: 'anomalies',  label: 'Anomalies',             icon: 'alert',     roles: ['admin','facility_manager','technician'], badge: true },
    { id: 'reports',    label: 'Reports',               icon: 'report',    roles: ['admin','facility_manager'] },
    { id: 'thresholds', label: 'Thresholds',            icon: 'threshold', roles: ['admin'] },
    { id: 'users',      label: 'Users',                 icon: 'users',     roles: ['admin'] },
    { id: 'logs',       label: 'Logs',                  icon: 'logs',      roles: ['admin'] },
    { id: 'settings',   label: 'Settings',              icon: 'settings',  roles: ['admin'] },
    { id: 'profile',    label: 'My Profile',            icon: 'profile',   roles: ['admin','facility_manager','technician','viewer'] },
];

function buildShell(user) {
    const rs   = ROLE_STYLE[user.role_key] || ROLE_STYLE.viewer;
    const perms = ROLE_PERMISSIONS[user.role_key] || [];
    const navHTML = NAV_ITEMS.filter(n => n.roles.includes(user.role_key))
        .map(n => `
            <button class="nav-item ${n.id==='dashboard'?'active':''}" data-page="${n.id}" onclick="navigate('${n.id}')">
              <span class="icon">${icon(n.icon, 18)}</span>
              ${n.label}
              ${n.badge ? '<span class="badge" id="nav-anom-badge" style="display:none">0</span>' : ''}
            </button>`).join('');

    document.body.innerHTML = `
        <div class="app-shell">
          <nav class="sidebar">
            <div class="sidebar-logo">
              <div class="logo-icon">${icon('bolt', 22)}</div>
              <div class="logo-text"><h1>WattWatch</h1><span>Smart Energy Monitoring</span></div>
            </div>
            <div class="sidebar-nav">${navHTML}</div>
            <div class="sidebar-status">
              <div><span class="status-dot"></span><strong style="font-size:12px;color:var(--slate-400)">System Status</strong></div>
              <strong style="font-size:13px;color:var(--green)">Online</strong>
              <p>All systems operational</p>
            </div>
            <div class="sidebar-logout">
              <button class="btn-logout" onclick="logout()">${icon('logout')} Sign Out</button>
            </div>
          </nav>

          <div class="main-area">
            <div class="topbar">
              <div class="topbar-left"><span id="topbar-time"></span></div>
              <div class="topbar-right">
                <button class="btn-bell" id="bell-btn">
                  ${icon('bell', 20)}
                  <span class="bell-badge hidden" id="bell-badge">0</span>
                </button>
                <div class="relative">
                  <button class="user-btn" onclick="toggleDropdown()">
                    <div class="user-avatar" style="background:${rs.avatarBg};color:${rs.avatarColor}">${user.avatar}</div>
                    <div class="user-info"><p id="topbar-username">${user.full_name}</p><span>${rs.label}</span></div>
                    <span class="user-caret">▼</span>
                  </button>
                  <div class="user-dropdown hidden" id="user-dropdown">
                    <div class="dropdown-header">
                      <p>${user.full_name}</p><span>${user.email}</span><br>
                      <span class="badge badge-${user.role_key==='admin'?'admin':user.role_key==='facility_manager'?'manager':user.role_key==='technician'?'tech':'viewer'}" style="margin-top:5px">${rs.label}</span>
                    </div>
                    <button class="dropdown-item" onclick="navigate('profile');toggleDropdown()">My Profile</button>
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item danger" onclick="logout()">${icon('logout')} Sign Out</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="page-content" id="page-content">
              <div class="spinner-wrap"><div class="spinner"></div></div>
            </div>
          </div>
        </div>`;

    // Clock
    const updateClock = () => {
        const el = $('topbar-time');
        if (el) el.textContent = new Date().toLocaleString('en-PH', { dateStyle:'medium', timeStyle:'short' });
    };
    updateClock();
    setInterval(updateClock, 30000);

    // Anomaly badge poll
    const pollBadge = async () => {
        try {
            const list = await api('get_anomalies', { status: 'active' });
            const n    = list.length;
            const bb   = $('bell-badge');
            const nb   = $('nav-anom-badge');
            if (bb) { bb.textContent = n; bb.classList.toggle('hidden', n === 0); }
            if (nb) { nb.textContent = n; nb.style.display = n > 0 ? '' : 'none'; }
        } catch {}
    };
    pollBadge();
    setInterval(pollBadge, 30000);

    // Navigate to dashboard
    navigate('dashboard');
}

function toggleDropdown() {
    const dd = $('user-dropdown');
    if (dd) dd.classList.toggle('hidden');
}

document.addEventListener('click', e => {
    const dd = $('user-dropdown');
    if (dd && !dd.classList.contains('hidden') && !e.target.closest('.relative')) dd.classList.add('hidden');
});

// ════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ════════════════════════════════════════════════════════════════
function buildLogin() {
    document.body.innerHTML = `
        <div class="login-page">
          <div class="login-card">
            <div class="login-logo">
              <div class="logo-row">
                <div class="logo-icon">${icon('bolt', 26)}</div>
                <h1>WattWatch</h1>
              </div>
              <p>IoT-Based Electricity Monitoring System</p>
            </div>

            <div id="login-alert" class="alert hidden"></div>

            <div class="form-group">
              <label>Email Address</label>
              <input id="l-email" type="email" class="form-control" placeholder="you@wattwatch.com" onkeydown="if(event.key==='Enter')doLogin()">
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="pw-wrap">
                <input id="l-pw" type="password" class="form-control" placeholder="••••••••" onkeydown="if(event.key==='Enter')doLogin()">
                <button class="pw-toggle" id="pw-toggle-btn" onclick="togglePw()" type="button">${icon('eye', 18)}</button>
              </div>
            </div>

            <button class="btn btn-primary" id="login-btn" style="width:100%;justify-content:center;padding:12px" onclick="doLogin()">Sign In</button>

            <div class="login-demo">
              <p>Demo Accounts</p>
              ${[
                ['Administrator',     'admin@wattwatch.com',  'admin123'],
                ['Facility Manager',  'juan@wattwatch.com',   'juan123'],
                ['Technician',        'maria@wattwatch.com',  'maria123'],
                ['Viewer',            'carlos@wattwatch.com', 'carlos123'],
              ].map(([l,e,p]) => `<button class="demo-btn" onclick="fillDemo('${e}','${p}')"><strong>${l}</strong> — ${e}</button>`).join('')}
            </div>

            <p style="font-size:11px;color:var(--slate-400);text-align:center;margin-top:18px">WattWatch v1.0 · Isabela State University</p>
          </div>
        </div>`;
}

function fillDemo(email, pw) { $('l-email').value = email; $('l-pw').value = pw; }

let pwVisible = false;
function togglePw() {
    pwVisible = !pwVisible;
    const inp = $('l-pw');
    const btn = $('pw-toggle-btn');
    if (inp) inp.type = pwVisible ? 'text' : 'password';
    if (btn) btn.innerHTML = icon(pwVisible ? 'eyeoff' : 'eye', 18);
}

async function doLogin() {
    const email = $('l-email')?.value.trim();
    const pw    = $('l-pw')?.value;
    if (!email || !pw) return showAlert('login-alert', 'Enter your email and password.', 'error');
    const btn = $('login-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
    try {
        const user   = await api('login', { email, password: pw }, 'POST');
        state.user   = user;
        buildShell(user);
    } catch (e) {
        showAlert('login-alert', e.message, 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
    }
}

async function logout() {
    try { await api('logout', null, 'POST'); } catch {}
    state.user = null;
    buildLogin();
}

// ── Boot ────────────────────────────────────────────────────────
(async function boot() {
    // If PHP injected a session user (via index.php), use it directly
    if (window.__WW_USER__) {
        state.user = window.__WW_USER__;
        buildShell(state.user);
        return;
    }
    // Otherwise check session via API
    try {
        const me = await api('me');
        if (me && me.user_id) {
            state.user = me;
            buildShell(me);
            return;
        }
    } catch { /* not logged in */ }
    buildLogin();
})();
