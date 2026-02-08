// ============================================
// ⚡ SPIKE TEST — Pic soudain de charge
// Objectif : vérifier la résilience face à un
//            pic brutal (5 → 100 VU en 10s)
//            puis retour à la normale
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import {
  BASE_URL, LOAD_PROFILES,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

const spikeLatency  = new Trend('spike_request_latency', true);
const spikeErrors   = new Rate('spike_error_rate');
const recoveryCheck = new Rate('spike_recovery_success');

export const options = {
  stages: LOAD_PROFILES.spike.stages,
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    'spike_error_rate': ['rate<0.25'],           // Spike = 25% erreurs tolérées
    'spike_recovery_success': ['rate>0.90'],     // Après spike: 90% doivent réussir
  },
  tags: { testType: 'spike' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  // Mix de requêtes : 40% GET actions, 30% toggle, 30% GET balance
  const roll = Math.random();

  if (roll < 0.4) {
    // GET actions
    const res = http.get(`${BASE_URL}/api/actions/today`, {
      ...params,
      tags: { name: 'GET /api/actions/today' },
    });
    const ok = check(res, { 'actions OK': (r) => r.status === 200 });
    spikeLatency.add(res.timings.duration);
    spikeErrors.add(!ok);
    recoveryCheck.add(ok);

  } else if (roll < 0.7) {
    // Toggle
    const allIds = [...GOOD_ACTION_IDS, ...BAD_ACTION_IDS];
    const res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: randomItem(allIds), date: today, checked: true }),
      { ...params, tags: { name: 'POST /api/balance/toggle' } }
    );
    const ok = check(res, { 'toggle OK': (r) => r.status === 200 });
    spikeLatency.add(res.timings.duration);
    spikeErrors.add(!ok);
    recoveryCheck.add(ok);

  } else {
    // GET balance
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });
    const ok = check(res, { 'balance OK': (r) => r.status === 200 });
    spikeLatency.add(res.timings.duration);
    spikeErrors.add(!ok);
    recoveryCheck.add(ok);
  }

  sleep(0.3 + Math.random() * 0.5);
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/spike-test-summary.json': JSON.stringify(data, null, 2),
  };
}
