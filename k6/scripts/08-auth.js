// ============================================
// 🔐 AUTH TEST — Stress sur l'authentification
// Objectif : tester register + login massivement
//            Vérifier le hashing bcrypt sous charge
//            (bcrypt est CPU-intensive)
// ============================================

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL } from '../lib/config.js';

const registerLatency = new Trend('auth_register_latency', true);
const loginLatency    = new Trend('auth_login_latency', true);
const authErrors      = new Rate('auth_error_rate');
const registrations   = new Counter('auth_registrations');
const logins          = new Counter('auth_logins');

export const options = {
  stages: [
    { duration: '30s', target: 5  },
    { duration: '2m',  target: 20 },
    { duration: '1m',  target: 40 },
    { duration: '1m',  target: 0  },
  ],
  thresholds: {
    // bcrypt est lent par design — seuils adaptés
    'auth_register_latency': ['p(95)<2000', 'p(99)<4000'],
    'auth_login_latency': ['p(95)<1500', 'p(99)<3000'],
    'auth_error_rate': ['rate<0.10'],
    http_req_failed: ['rate<0.10'],
  },
  tags: { testType: 'auth' },
};

export default function () {
  const uid = `k6user_${__VU}_${__ITER}_${Date.now()}`;
  const password = 'K6Test2024!';
  const json = { headers: { 'Content-Type': 'application/json' } };

  // ── Register ──
  const regRes = http.post(
    `${BASE_URL}/api/auth/register`,
    JSON.stringify({
      username: uid,
      email: `${uid}@k6test.app`,
      password: password,
    }),
    { ...json, tags: { name: 'POST /api/auth/register' } }
  );

  const regOk = check(regRes, {
    'register 200': (r) => r.status === 200,
    'register has token': (r) => {
      try { return JSON.parse(r.body).token !== undefined; }
      catch { return false; }
    },
  });

  registerLatency.add(regRes.timings.duration);
  authErrors.add(!regOk);
  if (regOk) registrations.add(1);

  sleep(0.5);

  // ── Login avec le même user ──
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ username: uid, password: password }),
    { ...json, tags: { name: 'POST /api/auth/login' } }
  );

  const loginOk = check(loginRes, {
    'login 200': (r) => r.status === 200,
    'login has token': (r) => {
      try { return JSON.parse(r.body).token !== undefined; }
      catch { return false; }
    },
    'login token valid': (r) => {
      try { return JSON.parse(r.body).token.length > 50; }
      catch { return false; }
    },
  });

  loginLatency.add(loginRes.timings.duration);
  authErrors.add(!loginOk);
  if (loginOk) logins.add(1);

  sleep(0.5);

  // ── Login avec mauvais password (test 401) ──
  const badRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ username: uid, password: 'wrongpassword' }),
    { ...json, tags: { name: 'POST /api/auth/login (bad)' } }
  );

  check(badRes, {
    'bad login rejected': (r) => r.status === 401 || r.status === 400,
  });

  sleep(1 + Math.random());
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/auth-test-summary.json': JSON.stringify(data, null, 2),
  };
}
