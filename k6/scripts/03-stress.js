// ============================================
// 💥 STRESS TEST — Montée en charge progressive
// Objectif : trouver le point de rupture
//            10 → 30 → 50 → 80 → 100 VU
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import {
  BASE_URL, LOAD_PROFILES,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

// ---- Custom metrics pour détecter la dégradation ----
const toggleLatency  = new Trend('stress_toggle_latency', true);
const actionsLatency = new Trend('stress_actions_latency', true);
const balanceLatency = new Trend('stress_balance_latency', true);
const errorRate      = new Rate('stress_error_rate');
const requestCount   = new Counter('stress_total_requests');

export const options = {
  stages: LOAD_PROFILES.stress.stages,
  thresholds: {
    // Seuils plus souples pour le stress
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.15'],             // 15% toléré en stress
    'stress_toggle_latency': ['p(95)<3000'],
    'stress_error_rate': ['rate<0.20'],
  },
  tags: { testType: 'stress' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  // ── GET actions ──
  group('Actions list', () => {
    const res = http.get(`${BASE_URL}/api/actions/today`, {
      ...params,
      tags: { name: 'GET /api/actions/today' },
    });

    const ok = check(res, { 'actions OK': (r) => r.status === 200 });
    actionsLatency.add(res.timings.duration);
    errorRate.add(!ok);
    requestCount.add(1);
  });

  sleep(0.2);

  // ── Toggle random action ──
  group('Toggle action', () => {
    const allIds = [...GOOD_ACTION_IDS, ...BAD_ACTION_IDS];
    const actionId = randomItem(allIds);
    const checked = Math.random() > 0.3; // 70% check, 30% uncheck

    const res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId, date: today, checked }),
      { ...params, tags: { name: 'POST /api/balance/toggle' } }
    );

    const ok = check(res, { 'toggle OK': (r) => r.status === 200 });
    toggleLatency.add(res.timings.duration);
    errorRate.add(!ok);
    requestCount.add(1);
  });

  sleep(0.2);

  // ── GET balance ──
  group('Balance check', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });

    const ok = check(res, { 'balance OK': (r) => r.status === 200 });
    balanceLatency.add(res.timings.duration);
    errorRate.add(!ok);
    requestCount.add(1);
  });

  // Think time réduit en stress pour maximiser la charge
  sleep(0.5 + Math.random());
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/stress-test-summary.json': JSON.stringify(data, null, 2),
  };
}
