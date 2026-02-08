// ============================================
// 🤖 AI ADVICE TEST — Latence OpenAI
// Objectif : mesurer les temps de réponse de
//            l'endpoint IA qui appelle OpenAI
//            Charge faible (le bottleneck est l'API externe)
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { BASE_URL, AI_THRESHOLDS } from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

// Custom metrics IA
const aiLatency      = new Trend('ai_response_time', true);
const aiErrorRate    = new Rate('ai_error_rate');
const aiTimeoutRate  = new Rate('ai_timeout_rate');
const aiSuccessCount = new Counter('ai_success_count');

export const options = {
  stages: [
    { duration: '30s', target: 2 },    // Faible charge car OpenAI rate-limited
    { duration: '2m',  target: 5 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    ...AI_THRESHOLDS,
    'ai_response_time': ['p(50)<3000', 'p(95)<8000'],
    'ai_error_rate': ['rate<0.15'],
    'ai_timeout_rate': ['rate<0.10'],
  },
  tags: { testType: 'ai-advice' },
};

export function setup() {
  return setupUsers();
}

export default function (usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);

  // ── D'abord, on s'assure qu'il y a des actions cochées ──
  group('Setup - toggle actions', () => {
    http.post(
      `${BASE_URL}/api/balance/toggle`,
      JSON.stringify({ actionId: 1, date: new Date().toISOString().split('T')[0], checked: true }),
      { ...params, tags: { name: 'POST /api/balance/toggle (setup)' } }
    );
    sleep(0.3);
  });

  // ── Appel à l'endpoint IA ──
  group('AI Advice call', () => {
    const startTime = Date.now();

    const res = http.get(`${BASE_URL}/api/advice/today`, {
      ...params,
      tags: { name: 'GET /api/advice/today' },
      timeout: '15s',  // timeout élevé pour OpenAI
    });

    const duration = Date.now() - startTime;
    aiLatency.add(duration);

    const isTimeout = duration > 10000;
    aiTimeoutRate.add(isTimeout);

    const success = check(res, {
      'ai status 200': (r) => r.status === 200,
      'ai has advice': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.advice !== undefined && body.advice.length > 0;
        } catch {
          return false;
        }
      },
      'ai response < 10s': () => duration < 10000,
    });

    aiErrorRate.add(!success);
    if (success) aiSuccessCount.add(1);

    // Log pour debug
    if (!success) {
      console.warn(`AI advice failed: status=${res.status} duration=${duration}ms`);
    }
  });

  // Pause longue entre les appels IA (respecter rate limits OpenAI)
  sleep(5 + Math.random() * 5);
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/ai-test-summary.json': JSON.stringify(data, null, 2),
  };
}
