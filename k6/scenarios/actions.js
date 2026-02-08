// ============================================
// Al-Mizan K6 — Scénario : Actions
// Liste des actions, par type, par date
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, THRESHOLDS, PROFILES } from '../lib/config.js';
import { registerUser, authHeaders, today, daysAgo } from '../lib/helpers.js';

// ---- Custom metrics ----
const listActionsDuration = new Trend('mizan_list_actions_duration', true);
const todayActionsDuration = new Trend('mizan_today_actions_duration', true);
const actionErrors = new Counter('mizan_action_errors');

const profile = __ENV.PROFILE || 'load';

export const options = {
  scenarios: {
    actions: PROFILES[profile],
  },
  thresholds: {
    ...THRESHOLDS,
    mizan_list_actions_duration: ['p(95)<400'],
    mizan_today_actions_duration: ['p(95)<500'],
  },
};

export function setup() {
  // Create a shared test user
  const auth = registerUser(0, 0);
  if (!auth) throw new Error('Setup: cannot register test user');
  return { token: auth.token };
}

export default function (data) {
  const opts = authHeaders(data.token);

  // ---- 1. GET /api/actions (all) ----
  const t1 = Date.now();
  const r1 = http.get(`${BASE_URL}/api/actions`, {
    ...opts,
    tags: { name: 'GET /api/actions' },
  });
  listActionsDuration.add(Date.now() - t1);

  const ok1 = check(r1, {
    'actions: status 200': (r) => r.status === 200,
    'actions: is array': (r) => {
      try { return Array.isArray(JSON.parse(r.body)); }
      catch { return false; }
    },
    'actions: count >= 28': (r) => {
      try { return JSON.parse(r.body).length >= 28; }
      catch { return false; }
    },
  });
  if (!ok1) actionErrors.add(1);

  sleep(0.3);

  // ---- 2. GET /api/actions/type/GOOD ----
  const r2 = http.get(`${BASE_URL}/api/actions/type/GOOD`, {
    ...opts,
    tags: { name: 'GET /api/actions/type/GOOD' },
  });

  check(r2, {
    'good actions: status 200': (r) => r.status === 200,
    'good actions: all are GOOD': (r) => {
      try {
        return JSON.parse(r.body).every((a) => a.type === 'GOOD');
      } catch { return false; }
    },
  });

  sleep(0.3);

  // ---- 3. GET /api/actions/type/BAD ----
  const r3 = http.get(`${BASE_URL}/api/actions/type/BAD`, {
    ...opts,
    tags: { name: 'GET /api/actions/type/BAD' },
  });

  check(r3, {
    'bad actions: status 200': (r) => r.status === 200,
  });

  sleep(0.3);

  // ---- 4. GET /api/actions/today ----
  const t4 = Date.now();
  const r4 = http.get(`${BASE_URL}/api/actions/today`, {
    ...opts,
    tags: { name: 'GET /api/actions/today' },
  });
  todayActionsDuration.add(Date.now() - t4);

  check(r4, {
    'today actions: status 200': (r) => r.status === 200,
    'today actions: has checked field': (r) => {
      try {
        const actions = JSON.parse(r.body);
        return actions.length > 0 && actions[0].checked !== undefined;
      } catch { return false; }
    },
  });

  sleep(0.3);

  // ---- 5. GET /api/actions/date/{past date} ----
  const pastDate = daysAgo(3);
  const r5 = http.get(`${BASE_URL}/api/actions/date/${pastDate}`, {
    ...opts,
    tags: { name: 'GET /api/actions/date/{date}' },
  });

  check(r5, {
    'date actions: status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}
