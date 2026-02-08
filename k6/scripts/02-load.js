// ============================================
// ⚖️ LOAD TEST — Scénario principal
// Objectif : simuler un usage normal
//            10 VU pendant 3 min
//            Mix: consulter actions + toggle + balance
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';
import {
  BASE_URL, LOAD_PROFILES, DEFAULT_THRESHOLDS,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

// ---- Custom Metrics ----
const toggleDuration = new Trend('mizan_toggle_duration', true);
const toggleErrors   = new Rate('mizan_toggle_error_rate');
const actionsChecked = new Counter('mizan_actions_checked');

export const options = {
  stages: LOAD_PROFILES.load.stages,
  thresholds: {
    ...DEFAULT_THRESHOLDS,
    'mizan_toggle_duration': ['p(95)<600'],
    'mizan_toggle_error_rate': ['rate<0.05'],
  },
  tags: { testType: 'load' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  // ── Étape 1: Consulter les actions du jour ──
  group('01 - Charger les actions', () => {
    const res = http.get(`${BASE_URL}/api/actions/today`, {
      ...params,
      tags: { name: 'GET /api/actions/today' },
    });
    check(res, { 'actions loaded': (r) => r.status === 200 });
    sleep(0.5);
  });

  // ── Étape 2: Consulter la balance du jour ──
  group('02 - Charger la balance', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });
    check(res, { 'balance loaded': (r) => r.status === 200 });
    sleep(0.3);
  });

  // ── Étape 3: Cocher 3 bonnes actions aléatoires ──
  group('03 - Cocher bonnes actions', () => {
    for (let i = 0; i < 3; i++) {
      const actionId = randomItem(GOOD_ACTION_IDS);
      const payload = JSON.stringify({
        actionId: actionId,
        date: today,
        checked: true,
      });

      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...params,
        tags: { name: 'POST /api/balance/toggle (good)' },
      });

      const success = check(res, {
        'toggle good 200': (r) => r.status === 200,
        'verdict exists': (r) => JSON.parse(r.body).verdict !== undefined,
      });

      toggleDuration.add(res.timings.duration);
      toggleErrors.add(!success);
      if (success) actionsChecked.add(1);

      sleep(0.5 + Math.random() * 1); // Pause naturelle entre chaque coche
    }
  });

  // ── Étape 4: Cocher 1-2 mauvaises actions ──
  group('04 - Cocher mauvaises actions', () => {
    const count = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const actionId = randomItem(BAD_ACTION_IDS);
      const payload = JSON.stringify({
        actionId: actionId,
        date: today,
        checked: true,
      });

      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...params,
        tags: { name: 'POST /api/balance/toggle (bad)' },
      });

      const success = check(res, {
        'toggle bad 200': (r) => r.status === 200,
      });

      toggleDuration.add(res.timings.duration);
      toggleErrors.add(!success);
      if (success) actionsChecked.add(1);

      sleep(0.5 + Math.random() * 0.5);
    }
  });

  // ── Étape 5: Vérifier la balance mise à jour ──
  group('05 - Vérifier balance finale', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...params,
      tags: { name: 'GET /api/balance/today' },
    });

    check(res, {
      'final balance 200': (r) => r.status === 200,
      'good > 0': (r) => JSON.parse(r.body).goodCount > 0,
    });

    sleep(0.5);
  });

  // ── Étape 6: Consulter l'historique ──
  group('06 - Historique récent', () => {
    const res = http.get(`${BASE_URL}/api/balance/recent`, {
      ...params,
      tags: { name: 'GET /api/balance/recent' },
    });
    check(res, { 'history loaded': (r) => r.status === 200 });
  });

  // Think time entre les itérations (simule l'utilisateur qui réfléchit)
  sleep(2 + Math.random() * 3);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/load-test-summary.json': JSON.stringify(data, null, 2),
  };
}

// K6 built-in
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
