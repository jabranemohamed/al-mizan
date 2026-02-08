// ============================================
// Al-Mizan K6 — Spike Test
// Sudden burst from 5 → 300 VUs → back to 5
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { BASE_URL, THRESHOLDS_STRESS } from '../lib/config.js';
import { registerUser, authHeaders, today, randomInt } from '../lib/helpers.js';

const spikeDuration = new Trend('mizan_spike_iter_duration', true);
const spikeSuccess = new Rate('mizan_spike_success');

export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },    // warm-up
        { duration: '10s', target: 300 },   // SPIKE 🚀
        { duration: '1m', target: 300 },    // hold peak
        { duration: '10s', target: 5 },     // crash back
        { duration: '1m', target: 5 },      // recovery
        { duration: '20s', target: 0 },     // ramp-down
      ],
    },
  },
  thresholds: {
    ...THRESHOLDS_STRESS,
    mizan_spike_success: ['rate>0.70'],
  },
};

export default function () {
  const start = Date.now();
  let ok = true;
  const todayStr = today();

  // Fast path: register + toggle + balance
  const auth = registerUser(__VU, __ITER);
  if (!auth) {
    spikeSuccess.add(0);
    spikeDuration.add(Date.now() - start);
    sleep(0.2);
    return;
  }

  const opts = authHeaders(auth.token);

  // Toggle 2 random actions (fast)
  for (let i = 1; i <= 2; i++) {
    const res = http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: randomInt(1, 29), date: todayStr, checked: true }),
      { ...opts, tags: { name: 'POST /api/balance/toggle' } }
    );
    if (res.status !== 200) ok = false;
  }

  // Get balance
  const balRes = http.get(`${BASE_URL}/api/balance/today`, {
    ...opts,
    tags: { name: 'GET /api/balance/today' },
  });
  if (balRes.status !== 200) ok = false;

  spikeDuration.add(Date.now() - start);
  spikeSuccess.add(ok ? 1 : 0);
  sleep(0.2);
}

export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
    'results/spike-summary.json': JSON.stringify(data, null, 2),
  };
}
