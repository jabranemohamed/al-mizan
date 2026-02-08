// ============================================
// Al-Mizan K6 — Scénario : Auth
// Register + Login flow
// ============================================

import { sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';
import { BASE_URL, THRESHOLDS, PROFILES } from '../lib/config.js';
import { registerUser, loginUser } from '../lib/helpers.js';

// ---- Custom metrics ----
const registerDuration = new Trend('mizan_register_duration', true);
const loginDuration = new Trend('mizan_login_duration', true);
const authErrors = new Counter('mizan_auth_errors');

// ---- Profile selection via env ----
const profile = __ENV.PROFILE || 'load';

export const options = {
  scenarios: {
    auth: PROFILES[profile],
  },
  thresholds: {
    ...THRESHOLDS,
    mizan_register_duration: ['p(95)<600'],
    mizan_login_duration: ['p(95)<400'],
  },
};

export default function () {
  // ---- 1. Register ----
  const startReg = Date.now();
  const authData = registerUser(__VU, __ITER);
  registerDuration.add(Date.now() - startReg);

  if (!authData) {
    authErrors.add(1);
    sleep(1);
    return;
  }

  sleep(0.5);

  // ---- 2. Login with same credentials ----
  const startLogin = Date.now();
  const loginData = loginUser(authData.username, 'K6test_2025!');
  loginDuration.add(Date.now() - startLogin);

  if (!loginData) {
    authErrors.add(1);
    sleep(1);
    return;
  }

  sleep(0.5);
}
