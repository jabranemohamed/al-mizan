// ============================================
// 🏋️ ENDURANCE TEST (SOAK) — Tenue dans la durée
// Objectif : détecter les fuites mémoire,
//            dégradation progressive, leaks DB
//            20 VU pendant 30 minutes
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter, Gauge } from 'k6/metrics';
import {
  BASE_URL, LOAD_PROFILES,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

// Metrics pour tracer la dégradation dans le temps
const enduranceLatency = new Trend('endurance_latency', true);
const enduranceErrors  = new Rate('endurance_error_rate');
const iterationCount   = new Counter('endurance_iterations');

export const options = {
  stages: LOAD_PROFILES.endurance.stages,
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<2000'],
    http_req_failed: ['rate<0.05'],
    'endurance_error_rate': ['rate<0.05'],
  },
  tags: { testType: 'endurance' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  // ── Scénario utilisateur typique complet ──

  // 1. Charger les actions
  group('Load actions', () => {
    const res = http.get(`${BASE_URL}/api/actions/today`, {
      ...params,
      tags: { name: 'GET /api/actions/today' },
    });
    const ok = check(res, { 'OK': (r) => r.status === 200 });
    enduranceLatency.add(res.timings.duration);
    enduranceErrors.add(!ok);
  });

  sleep(1);

  // 2. Toggle 2 bonnes actions
  for (let i = 0; i < 2; i++) {
    const res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: randomItem(GOOD_ACTION_IDS), date: today, checked: true }),
      { ...params, tags: { name: 'POST /api/balance/toggle' } }
    );
    const ok = check(res, { 'toggle OK': (r) => r.status === 200 });
    enduranceLatency.add(res.timings.duration);
    enduranceErrors.add(!ok);
    sleep(0.5);
  }

  // 3. Toggle 1 mauvaise action
  const badRes = http.post(
    `${BASE_URL}/api/balance/toggle`,
    JSON.stringify({ actionId: randomItem(BAD_ACTION_IDS), date: today, checked: true }),
    { ...params, tags: { name: 'POST /api/balance/toggle' } }
  );
  enduranceLatency.add(badRes.timings.duration);
  enduranceErrors.add(badRes.status !== 200);

  sleep(1);

  // 4. Vérifier balance
  group('Check balance', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });
    enduranceLatency.add(res.timings.duration);
    enduranceErrors.add(res.status !== 200);
  });

  sleep(1);

  // 5. Consulter historique (1 fois sur 3)
  if (Math.random() < 0.33) {
    group('Check history', () => {
      const res = http.get(`${BASE_URL}/api/balance/recent`, {
        ...params,
        tags: { name: 'GET /api/balance/recent' },
      });
      enduranceLatency.add(res.timings.duration);
      enduranceErrors.add(res.status !== 200);
    });
  }

  // 6. Décocher une action aléatoire (1 fois sur 4)
  if (Math.random() < 0.25) {
    const allIds = [...GOOD_ACTION_IDS, ...BAD_ACTION_IDS];
    const res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: randomItem(allIds), date: today, checked: false }),
      { ...params, tags: { name: 'POST /api/balance/toggle (uncheck)' } }
    );
    enduranceLatency.add(res.timings.duration);
    enduranceErrors.add(res.status !== 200);
  }

  iterationCount.add(1);

  // Think time réaliste
  sleep(3 + Math.random() * 5);
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/endurance-test-summary.json': JSON.stringify(data, null, 2),
  };
}
