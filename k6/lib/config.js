// ============================================
// Al-Mizan K6 — Configuration
// ============================================

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// ---- Action IDs (from seed data) ----
// Good actions: IDs 1–15, Bad actions: IDs 16–28
export const GOOD_ACTION_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
export const BAD_ACTION_IDS  = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

// ---- Helpers (re-exported for scripts that import from config) ----

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ---- Thresholds communs ----
export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'],
  http_req_failed: ['rate<0.05'],
};

export const DEFAULT_THRESHOLDS = THRESHOLDS;

// ---- Thresholds stricts (smoke) ----
export const THRESHOLDS_SMOKE = {
  http_req_duration: ['p(95)<300', 'p(99)<800'],
  http_req_failed: ['rate<0.01'],
};

// ---- Thresholds relaches (stress / spike) ----
export const THRESHOLDS_STRESS = {
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  http_req_failed: ['rate<0.15'],
};

// ---- Thresholds IA (latence OpenAI elevee) ----
export const AI_THRESHOLDS = {
  http_req_duration: ['p(95)<10000', 'p(99)<15000'],
  http_req_failed: ['rate<0.20'],
};

// ---- Profils de charge ----
export const PROFILES = {
  smoke: {
    stages: [
      { duration: '30s', target: 1 },
    ],
  },
  load: {
    stages: [
      { duration: '1m', target: 10 },
      { duration: '3m', target: 10 },
      { duration: '1m', target: 20 },
      { duration: '3m', target: 20 },
      { duration: '1m', target: 0 },
    ],
  },
  stress: {
    stages: [
      { duration: '2m', target: 20 },
      { duration: '3m', target: 50 },
      { duration: '3m', target: 100 },
      { duration: '2m', target: 150 },
      { duration: '3m', target: 150 },
      { duration: '2m', target: 0 },
    ],
  },
  spike: {
    stages: [
      { duration: '30s', target: 5 },
      { duration: '10s', target: 200 },
      { duration: '1m', target: 200 },
      { duration: '10s', target: 5 },
      { duration: '1m', target: 5 },
      { duration: '30s', target: 0 },
    ],
  },
  soak: {
    stages: [
      { duration: '2m', target: 15 },
      { duration: '30m', target: 15 },
      { duration: '2m', target: 0 },
    ],
  },
};

export const LOAD_PROFILES = PROFILES;