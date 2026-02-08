// ============================================
// Al-Mizan K6 — Configuration
// ============================================

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// ---- Thresholds communs ----
export const THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1500'],
  http_req_failed: ['rate<0.05'],
  http_reqs: ['rate>10'],
};

// ---- Thresholds stricts (smoke) ----
export const THRESHOLDS_SMOKE = {
  http_req_duration: ['p(95)<300', 'p(99)<800'],
  http_req_failed: ['rate<0.01'],
};

// ---- Thresholds relâchés (stress / spike) ----
export const THRESHOLDS_STRESS = {
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  http_req_failed: ['rate<0.15'],
};

// ---- Profils de charge ----
export const PROFILES = {
  smoke: {
    executor: 'constant-vus',
    vus: 1,
    duration: '30s',
  },
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '1m', target: 10 },   // ramp-up
      { duration: '3m', target: 10 },   // plateau
      { duration: '1m', target: 20 },   // augmentation
      { duration: '3m', target: 20 },   // plateau
      { duration: '1m', target: 0 },    // ramp-down
    ],
  },
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
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
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 5 },
      { duration: '10s', target: 200 },  // spike !
      { duration: '1m', target: 200 },
      { duration: '10s', target: 5 },    // retour
      { duration: '1m', target: 5 },
      { duration: '30s', target: 0 },
    ],
  },
  soak: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '2m', target: 15 },
      { duration: '30m', target: 15 },   // endurance
      { duration: '2m', target: 0 },
    ],
  },
};
