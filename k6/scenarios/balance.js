// ============================================
// Al-Mizan K6 — Scénario : Balance
// Toggle actions + consult balance + history
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { BASE_URL, THRESHOLDS, PROFILES } from '../lib/config.js';
import { registerUser, authHeaders, today, daysAgo, randomInt } from '../lib/helpers.js';

// ---- Custom metrics ----
const toggleDuration = new Trend('mizan_toggle_duration', true);
const balanceDuration = new Trend('mizan_balance_duration', true);
const historyDuration = new Trend('mizan_history_duration', true);
const toggleSuccessRate = new Rate('mizan_toggle_success');
const balanceErrors = new Counter('mizan_balance_errors');

const profile = __ENV.PROFILE || 'load';

export const options = {
  scenarios: {
    balance: PROFILES[profile],
  },
  thresholds: {
    ...THRESHOLDS,
    mizan_toggle_duration: ['p(95)<600', 'p(99)<1200'],
    mizan_balance_duration: ['p(95)<400'],
    mizan_history_duration: ['p(95)<800'],
    mizan_toggle_success: ['rate>0.95'],
  },
};

export function setup() {
  // Create user + fetch action IDs
  const auth = registerUser(0, 0);
  if (!auth) throw new Error('Setup: cannot register test user');

  const opts = authHeaders(auth.token);
  const actionsRes = http.get(`${BASE_URL}/api/actions`, opts);
  const actions = JSON.parse(actionsRes.body);

  return {
    token: auth.token,
    goodIds: actions.filter((a) => a.type === 'GOOD').map((a) => a.id),
    badIds: actions.filter((a) => a.type === 'BAD').map((a) => a.id),
  };
}

export default function (data) {
  const opts = authHeaders(data.token);
  const todayStr = today();

  // ==== GROUP 1: Toggle actions ====
  group('Toggle actions', () => {
    // Toggle 3-5 random good actions
    const numGood = randomInt(3, 6);
    for (let i = 0; i < numGood; i++) {
      const actionId = data.goodIds[randomInt(0, data.goodIds.length)];
      const payload = JSON.stringify({
        actionId,
        date: todayStr,
        checked: true,
      });

      const t = Date.now();
      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...opts,
        tags: { name: 'POST /api/balance/toggle (good)' },
      });
      toggleDuration.add(Date.now() - t);

      const ok = check(res, {
        'toggle good: status 200': (r) => r.status === 200,
        'toggle good: has verdict': (r) => {
          try { return JSON.parse(r.body).verdict !== undefined; }
          catch { return false; }
        },
      });
      toggleSuccessRate.add(ok ? 1 : 0);
      if (!ok) balanceErrors.add(1);

      sleep(0.1);
    }

    // Toggle 1-3 random bad actions
    const numBad = randomInt(1, 4);
    for (let i = 0; i < numBad; i++) {
      const actionId = data.badIds[randomInt(0, data.badIds.length)];
      const payload = JSON.stringify({
        actionId,
        date: todayStr,
        checked: true,
      });

      const t = Date.now();
      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...opts,
        tags: { name: 'POST /api/balance/toggle (bad)' },
      });
      toggleDuration.add(Date.now() - t);

      const ok = check(res, {
        'toggle bad: status 200': (r) => r.status === 200,
      });
      toggleSuccessRate.add(ok ? 1 : 0);

      sleep(0.1);
    }
  });

  sleep(0.3);

  // ==== GROUP 2: Consult balance ====
  group('Consult balance', () => {
    // Today
    const t1 = Date.now();
    const r1 = http.get(`${BASE_URL}/api/balance/today`, {
      ...opts,
      tags: { name: 'GET /api/balance/today' },
    });
    balanceDuration.add(Date.now() - t1);

    check(r1, {
      'balance today: status 200': (r) => r.status === 200,
      'balance today: goodCount >= 0': (r) => {
        try { return JSON.parse(r.body).goodCount >= 0; }
        catch { return false; }
      },
      'balance today: verdict present': (r) => {
        try {
          const v = JSON.parse(r.body).verdict;
          return ['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(v);
        } catch { return false; }
      },
    });

    sleep(0.2);

    // By specific date
    const pastDate = daysAgo(1);
    const r2 = http.get(`${BASE_URL}/api/balance/date/${pastDate}`, {
      ...opts,
      tags: { name: 'GET /api/balance/date/{date}' },
    });

    check(r2, {
      'balance date: status 200': (r) => r.status === 200,
    });
  });

  sleep(0.3);

  // ==== GROUP 3: History ====
  group('History', () => {
    // Recent history
    const t3 = Date.now();
    const r3 = http.get(`${BASE_URL}/api/balance/recent`, {
      ...opts,
      tags: { name: 'GET /api/balance/recent' },
    });
    historyDuration.add(Date.now() - t3);

    check(r3, {
      'recent: status 200': (r) => r.status === 200,
      'recent: is array': (r) => {
        try { return Array.isArray(JSON.parse(r.body)); }
        catch { return false; }
      },
    });

    sleep(0.2);

    // History with date range
    const start = daysAgo(30);
    const end = todayStr;
    const r4 = http.get(
      `${BASE_URL}/api/balance/history?startDate=${start}&endDate=${end}`,
      { ...opts, tags: { name: 'GET /api/balance/history' } }
    );

    check(r4, {
      'history range: status 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  // ==== GROUP 4: Uncheck some actions (toggle off) ====
  group('Uncheck actions', () => {
    const actionId = data.goodIds[0];
    const payload = JSON.stringify({
      actionId,
      date: todayStr,
      checked: false,
    });

    const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
      ...opts,
      tags: { name: 'POST /api/balance/toggle (uncheck)' },
    });

    check(res, {
      'uncheck: status 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);
}
