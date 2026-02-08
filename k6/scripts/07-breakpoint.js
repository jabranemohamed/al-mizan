// ============================================
// 🎯 BREAKPOINT TEST — Trouver la limite
// Objectif : monter progressivement jusqu'à la
//            rupture. Le test échoue = on a le seuil.
//            Ramping de 0 → 300 VU en 15 min
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import {
  BASE_URL,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

const bpLatency  = new Trend('bp_latency', true);
const bpErrors   = new Rate('bp_error_rate');
const bpRequests = new Counter('bp_total_requests');

export const options = {
  executor: 'ramping-arrival-rate',
  stages: [
    { duration: '2m',  target: 20  },   // warm-up
    { duration: '3m',  target: 50  },
    { duration: '3m',  target: 100 },
    { duration: '3m',  target: 200 },
    { duration: '2m',  target: 300 },   // limite théorique
    { duration: '2m',  target: 300 },   // plateau au max
  ],
  preAllocatedVUs: 50,
  maxVUs: 400,
  thresholds: {
    // On laisse le test aller loin — les seuils sont là pour "scorer"
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.30'],       // 30% = on a clairement cassé
    'bp_error_rate': ['rate<0.30'],
  },
  tags: { testType: 'breakpoint' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  // Mix 50/25/25 : GET actions / toggle / GET balance
  const roll = Math.random();
  let res;

  if (roll < 0.50) {
    res = http.get(`${BASE_URL}/api/actions/today`, {
      ...params,
      tags: { name: 'GET /api/actions/today' },
    });
  } else if (roll < 0.75) {
    const allIds = [...GOOD_ACTION_IDS, ...BAD_ACTION_IDS];
    res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: randomItem(allIds), date: today, checked: Math.random() > 0.3 }),
      { ...params, tags: { name: 'POST /api/balance/toggle' } }
    );
  } else {
    res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });
  }

  const ok = check(res, { 'status OK': (r) => r.status === 200 });
  bpLatency.add(res.timings.duration);
  bpErrors.add(!ok);
  bpRequests.add(1);

  // Pas de sleep — on veut maximiser le débit
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/breakpoint-test-summary.json': JSON.stringify(data, null, 2),
  };
}
