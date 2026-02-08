// ============================================
// Al-Mizan K6 — Smoke Test
// Validates basic functionality (1 VU, 30s)
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { BASE_URL, THRESHOLDS_SMOKE } from '../lib/config.js';
import { registerUser, authHeaders, today, randomInt } from '../lib/helpers.js';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: THRESHOLDS_SMOKE,
};

export default function () {
  const todayStr = today();

  // 1. Register
  group('Register', () => {
    const auth = registerUser(__VU, __ITER);
    if (!auth) return;

    const opts = authHeaders(auth.token);

    // 2. List actions
    group('List actions', () => {
      const res = http.get(`${BASE_URL}/api/actions`, {
        ...opts,
        tags: { name: 'GET /api/actions' },
      });
      check(res, {
        'actions: 200': (r) => r.status === 200,
        'actions: >= 28': (r) => {
          try { return JSON.parse(r.body).length >= 28; }
          catch { return false; }
        },
      });
    });

    sleep(0.3);

    // 3. Toggle one action
    group('Toggle', () => {
      const payload = JSON.stringify({
        actionId: 1,
        date: todayStr,
        checked: true,
      });
      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...opts,
        tags: { name: 'POST /api/balance/toggle' },
      });
      check(res, {
        'toggle: 200': (r) => r.status === 200,
        'toggle: verdict': (r) => {
          try { return JSON.parse(r.body).verdict !== undefined; }
          catch { return false; }
        },
      });
    });

    sleep(0.3);

    // 4. Get balance
    group('Balance', () => {
      const res = http.get(`${BASE_URL}/api/balance/today`, {
        ...opts,
        tags: { name: 'GET /api/balance/today' },
      });
      check(res, {
        'balance: 200': (r) => r.status === 200,
        'balance: goodCount=1': (r) => {
          try { return JSON.parse(r.body).goodCount >= 1; }
          catch { return false; }
        },
      });
    });

    sleep(0.3);

    // 5. Recent history
    group('History', () => {
      const res = http.get(`${BASE_URL}/api/balance/recent`, {
        ...opts,
        tags: { name: 'GET /api/balance/recent' },
      });
      check(res, { 'history: 200': (r) => r.status === 200 });
    });
  });

  sleep(1);
}
