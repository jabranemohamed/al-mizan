// ============================================
// Al-Mizan K6 — Soak / Endurance Test
// 15 VUs sustained for 30 minutes
// Detects memory leaks, connection pool exhaustion, DB growth issues
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { BASE_URL, THRESHOLDS } from '../lib/config.js';
import { registerUser, authHeaders, today, randomInt } from '../lib/helpers.js';

const soakIterDuration = new Trend('mizan_soak_iter_duration', true);
const soakSuccess = new Rate('mizan_soak_success');
const totalToggles = new Counter('mizan_soak_total_toggles');

export const options = {
  scenarios: {
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 15 },    // ramp-up
        { duration: '30m', target: 15 },    // sustained load
        { duration: '2m', target: 0 },      // ramp-down
      ],
    },
  },
  thresholds: {
    ...THRESHOLDS,
    mizan_soak_success: ['rate>0.95'],
    mizan_soak_iter_duration: ['p(95)<3000'],
  },
};

export default function () {
  const start = Date.now();
  let ok = true;
  const todayStr = today();

  // Register unique user each iteration
  const auth = registerUser(__VU, __ITER);
  if (!auth) {
    soakSuccess.add(0);
    soakIterDuration.add(Date.now() - start);
    sleep(1);
    return;
  }

  const opts = authHeaders(auth.token);

  // 1. List actions
  const actionsRes = http.get(`${BASE_URL}/api/actions/today`, {
    ...opts,
    tags: { name: 'GET /api/actions/today' },
  });
  if (actionsRes.status !== 200) ok = false;

  let actions = [];
  try { actions = JSON.parse(actionsRes.body); }
  catch { ok = false; }

  sleep(0.3);

  // 2. Toggle 4-7 random actions
  const count = randomInt(4, 8);
  for (let i = 0; i < count && i < actions.length; i++) {
    const payload = JSON.stringify({
      actionId: actions[randomInt(0, actions.length)].id,
      date: todayStr,
      checked: true,
    });

    const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
      ...opts,
      tags: { name: 'POST /api/balance/toggle' },
    });

    if (res.status !== 200) ok = false;
    totalToggles.add(1);
    sleep(0.1);
  }

  sleep(0.3);

  // 3. Get balance
  const balRes = http.get(`${BASE_URL}/api/balance/today`, {
    ...opts,
    tags: { name: 'GET /api/balance/today' },
  });
  if (balRes.status !== 200) ok = false;

  sleep(0.3);

  // 4. Get history (every other iteration)
  if (__ITER % 2 === 0) {
    const histRes = http.get(`${BASE_URL}/api/balance/recent`, {
      ...opts,
      tags: { name: 'GET /api/balance/recent' },
    });
    if (histRes.status !== 200) ok = false;
  }

  soakIterDuration.add(Date.now() - start);
  soakSuccess.add(ok ? 1 : 0);
  sleep(1);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
    'results/soak-summary.json': JSON.stringify(data, null, 2),
  };
}
