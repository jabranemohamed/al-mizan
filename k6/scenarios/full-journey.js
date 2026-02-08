// ============================================
// Al-Mizan K6 — Scénario : Full User Journey
// Register → Login → Browse actions → Toggle → Balance → History → Advice
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { BASE_URL, THRESHOLDS, PROFILES } from '../lib/config.js';
import { registerUser, loginUser, authHeaders, today, daysAgo, randomInt } from '../lib/helpers.js';

// ---- Custom metrics ----
const journeyDuration = new Trend('mizan_full_journey_duration', true);
const journeySuccess = new Rate('mizan_journey_success');
const adviceDuration = new Trend('mizan_advice_duration', true);

const profile = __ENV.PROFILE || 'load';

export const options = {
  scenarios: {
    full_journey: PROFILES[profile],
  },
  thresholds: {
    ...THRESHOLDS,
    mizan_full_journey_duration: ['p(95)<8000'],
    mizan_journey_success: ['rate>0.90'],
    mizan_advice_duration: ['p(95)<5000'], // AI can be slow
  },
};

export default function () {
  const journeyStart = Date.now();
  let success = true;
  const todayStr = today();

  // ========== STEP 1: Register ==========
  let token;
  group('01 — Register', () => {
    const auth = registerUser(__VU, __ITER);
    if (!auth) {
      success = false;
      return;
    }
    token = auth.token;
  });

  if (!token) {
    journeySuccess.add(0);
    journeyDuration.add(Date.now() - journeyStart);
    sleep(1);
    return;
  }

  sleep(0.5);

  const opts = authHeaders(token);

  // ========== STEP 2: Browse actions ==========
  let actions = [];
  group('02 — Browse actions', () => {
    const res = http.get(`${BASE_URL}/api/actions/today`, {
      ...opts,
      tags: { name: 'GET /api/actions/today' },
    });

    const ok = check(res, {
      'browse: status 200': (r) => r.status === 200,
    });

    if (ok) {
      try { actions = JSON.parse(res.body); }
      catch { success = false; }
    } else {
      success = false;
    }
  });

  sleep(0.5);

  // ========== STEP 3: Check good actions (5-8 random) ==========
  group('03 — Check good actions', () => {
    const goodActions = actions.filter((a) => a.type === 'GOOD');
    const count = Math.min(randomInt(5, 9), goodActions.length);

    for (let i = 0; i < count; i++) {
      const payload = JSON.stringify({
        actionId: goodActions[i].id,
        date: todayStr,
        checked: true,
      });

      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...opts,
        tags: { name: 'POST /api/balance/toggle' },
      });

      check(res, { 'toggle good: 200': (r) => r.status === 200 });
      sleep(0.15); // User think time between clicks
    }
  });

  sleep(0.3);

  // ========== STEP 4: Check bad actions (1-3 random) ==========
  group('04 — Check bad actions', () => {
    const badActions = actions.filter((a) => a.type === 'BAD');
    const count = Math.min(randomInt(1, 4), badActions.length);

    for (let i = 0; i < count; i++) {
      const payload = JSON.stringify({
        actionId: badActions[i].id,
        date: todayStr,
        checked: true,
      });

      const res = http.post(`${BASE_URL}/api/balance/toggle`, payload, {
        ...opts,
        tags: { name: 'POST /api/balance/toggle' },
      });

      check(res, { 'toggle bad: 200': (r) => r.status === 200 });
      sleep(0.15);
    }
  });

  sleep(0.5);

  // ========== STEP 5: Consult balance ==========
  group('05 — Check balance', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, {
      ...opts,
      tags: { name: 'GET /api/balance/today' },
    });

    const ok = check(res, {
      'balance: status 200': (r) => r.status === 200,
      'balance: good > bad (most likely)': (r) => {
        try {
          const b = JSON.parse(r.body);
          return b.goodWeight >= 0 && b.badWeight >= 0;
        } catch { return false; }
      },
    });

    if (!ok) success = false;
  });

  sleep(0.5);

  // ========== STEP 6: View history ==========
  group('06 — View history', () => {
    const res = http.get(`${BASE_URL}/api/balance/recent`, {
      ...opts,
      tags: { name: 'GET /api/balance/recent' },
    });

    check(res, {
      'history: status 200': (r) => r.status === 200,
    });
  });

  sleep(0.5);

  // ========== STEP 7: Get AI advice ==========
  group('07 — AI advice', () => {
    const t = Date.now();
    const res = http.get(`${BASE_URL}/api/advice/today`, {
      ...opts,
      tags: { name: 'GET /api/advice/today' },
      timeout: '30s', // AI responses can be slow
    });
    adviceDuration.add(Date.now() - t);

    check(res, {
      'advice: status 200': (r) => r.status === 200,
      'advice: has content': (r) => {
        try { return JSON.parse(r.body).advice !== undefined; }
        catch { return false; }
      },
    });
  });

  // ---- Record journey ----
  journeyDuration.add(Date.now() - journeyStart);
  journeySuccess.add(success ? 1 : 0);

  sleep(1); // Think time before next iteration
}
