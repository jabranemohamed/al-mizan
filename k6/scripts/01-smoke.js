// ============================================
// 🔥 SMOKE TEST — Vérification de base
// Objectif : s'assurer que l'API répond
//            avec 1 seul VU pendant 30s
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, LOAD_PROFILES, DEFAULT_THRESHOLDS } from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

export const options = {
  stages: LOAD_PROFILES.smoke.stages,
  thresholds: DEFAULT_THRESHOLDS,
  tags: { testType: 'smoke' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/actuator/health`, {
    tags: { name: 'GET /actuator/health' },
  });
  check(healthRes, {
    'health status 200': (r) => r.status === 200,
    'health is UP': (r) => JSON.parse(r.body).status === 'UP',
  });

  sleep(1);

  // 2. Lister les actions
  const actionsRes = http.get(`${BASE_URL}/api/actions`, {
    ...params,
    tags: { name: 'GET /api/actions' },
  });
  check(actionsRes, {
    'actions status 200': (r) => r.status === 200,
    'actions is array': (r) => JSON.parse(r.body).length > 0,
  });

  sleep(1);

  // 3. Balance du jour
  const balanceRes = http.get(`${BASE_URL}/api/balance/today`, {
    ...params,
    tags: { name: 'GET /api/balance/today' },
  });
  check(balanceRes, {
    'balance status 200': (r) => r.status === 200,
    'balance has verdict': (r) => JSON.parse(r.body).verdict !== undefined,
  });

  sleep(1);

  // 4. Actions du jour
  const todayRes = http.get(`${BASE_URL}/api/actions/today`, {
    ...params,
    tags: { name: 'GET /api/actions/today' },
  });
  check(todayRes, {
    'today actions status 200': (r) => r.status === 200,
  });

  sleep(1);
}
