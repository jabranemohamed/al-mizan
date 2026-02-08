// ============================================
// Al-Mizan K6 — Stress + Spike combined runner
// Runs both auth and balance scenarios in parallel
// ============================================

import { sleep, group } from 'k6';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { BASE_URL, THRESHOLDS_STRESS } from '../lib/config.js';
import { registerUser, authHeaders, today, randomInt } from '../lib/helpers.js';

// ---- Custom metrics ----
const iterDuration = new Trend('mizan_iteration_duration', true);
const iterSuccess = new Rate('mizan_iteration_success');

export const options = {
  scenarios: {
    // Scenario A: Ramp up to 100 VUs (stress)
    stress_balance: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '3m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'balanceScenario',
    },
    // Scenario B: Constant auth pressure
    constant_auth: {
      executor: 'constant-arrival-rate',
      rate: 5,
      timeUnit: '1s',
      duration: '10m',
      preAllocatedVUs: 30,
      maxVUs: 60,
      exec: 'authScenario',
    },
  },
  thresholds: {
    ...THRESHOLDS_STRESS,
    mizan_iteration_success: ['rate>0.85'],
  },
};

// ---- Scenario A: Balance operations ----
export function balanceScenario() {
  const start = Date.now();
  let success = true;
  const todayStr = today();

  // Register unique user
  const auth = registerUser(__VU, __ITER);
  if (!auth) {
    iterSuccess.add(0);
    iterDuration.add(Date.now() - start);
    sleep(0.5);
    return;
  }

  const opts = authHeaders(auth.token);

  // Fetch actions
  const actionsRes = http.get(`${BASE_URL}/api/actions`, {
    ...opts,
    tags: { name: 'GET /api/actions' },
  });

  let actionIds = [];
  try {
    actionIds = JSON.parse(actionsRes.body).map((a) => a.id);
  } catch {
    success = false;
  }

  // Toggle 3-6 random actions
  const count = randomInt(3, 7);
  for (let i = 0; i < count && i < actionIds.length; i++) {
    const idx = randomInt(0, actionIds.length);
    const payload = JSON.stringify({
      actionId: actionIds[idx],
      date: todayStr,
      checked: Math.random() > 0.3, // 70% check, 30% uncheck
    });

    const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
      ...opts,
      tags: { name: 'POST /api/balance/toggle' },
    });

    if (res.status !== 200) success = false;
    sleep(0.05);
  }

  // Consult balance
  const balRes = http.get(`${BASE_URL}/api/balance/today`, {
    ...opts,
    tags: { name: 'GET /api/balance/today' },
  });
  if (balRes.status !== 200) success = false;

  iterDuration.add(Date.now() - start);
  iterSuccess.add(success ? 1 : 0);
  sleep(0.3);
}

// ---- Scenario B: Auth pressure ----
export function authScenario() {
  const auth = registerUser(__VU, __ITER);
  if (auth) {
    // Immediately login
    const payload = JSON.stringify({
      username: auth.username,
      password: 'K6test_2025!',
    });
    const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'POST /api/auth/login' },
    });
    check(res, { 'login: 200': (r) => r.status === 200 });
  }
  sleep(0.1);
}

// ---- Custom summary output ----
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
    'results/stress-summary.json': JSON.stringify(data, null, 2),
  };
}
