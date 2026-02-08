// ============================================
// 🕌 SCENARIO TEST — Parcours utilisateur réaliste
// Objectif : simuler une journée type d'un musulman
//            qui utilise Al-Mizan matin, midi, soir
//            avec des profils de comportement variés
// ============================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import {
  BASE_URL,
  GOOD_ACTION_IDS, BAD_ACTION_IDS, randomItem, todayISO
} from '../lib/config.js';
import { setupUsers, pickRandomUser, authHeaders } from '../lib/helpers.js';

const scenarioLatency = new Trend('scenario_latency', true);
const scenarioErrors  = new Rate('scenario_error_rate');

export const options = {
  scenarios: {
    // Persona 1 : Utilisateur assidu — coche tout matin et soir
    assidu: {
      executor: 'constant-vus',
      vus: 5,
      duration: '3m',
      tags: { persona: 'assidu' },
      exec: 'assidu',
    },
    // Persona 2 : Utilisateur occasionnel — quelques actions par jour
    occasionnel: {
      executor: 'constant-vus',
      vus: 8,
      duration: '3m',
      tags: { persona: 'occasionnel' },
      exec: 'occasionnel',
    },
    // Persona 3 : Consulteur — regarde l'historique et demande un conseil IA
    consulteur: {
      executor: 'constant-vus',
      vus: 3,
      duration: '3m',
      tags: { persona: 'consulteur' },
      exec: 'consulteur',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    'scenario_error_rate': ['rate<0.05'],
    'http_req_duration{persona:assidu}': ['p(95)<800'],
    'http_req_duration{persona:occasionnel}': ['p(95)<800'],
    'http_req_duration{persona:consulteur}': ['p(95)<2000'],
  },
  tags: { testType: 'scenario' },
};

export function setup() {
  return setupUsers();
}

// ── PERSONA 1 : Assidu (coche 6-8 bonnes, 1-2 mauvaises) ──
export function assidu(usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  group('Assidu — Charger page', () => {
    const r1 = http.get(`${BASE_URL}/api/actions/today`, { ...params, tags: { name: 'GET /api/actions/today' } });
    const r2 = http.get(`${BASE_URL}/api/balance/today`, { ...params, tags: { name: 'GET /api/balance/today' } });
    track(r1); track(r2);
    sleep(1);
  });

  group('Assidu — Cocher bonnes actions', () => {
    const count = 6 + Math.floor(Math.random() * 3); // 6-8
    const shuffled = shuffle([...GOOD_ACTION_IDS]).slice(0, count);
    for (const id of shuffled) {
      const res = http.post(
        `${BASE_URL}/api/balance/toggle`,
        JSON.stringify({ actionId: id, date: today, checked: true }),
        { ...params, tags: { name: 'POST /api/balance/toggle' } }
      );
      track(res);
      sleep(0.3 + Math.random() * 0.5);
    }
  });

  group('Assidu — Cocher mauvaises', () => {
    const count = Math.random() > 0.5 ? 2 : 1;
    const shuffled = shuffle([...BAD_ACTION_IDS]).slice(0, count);
    for (const id of shuffled) {
      const res = http.post(
        `${BASE_URL}/api/balance/toggle`,
        JSON.stringify({ actionId: id, date: today, checked: true }),
        { ...params, tags: { name: 'POST /api/balance/toggle' } }
      );
      track(res);
      sleep(0.3);
    }
  });

  group('Assidu — Vérifier balance', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, { ...params, tags: { name: 'GET /api/balance/today' } });
    check(res, {
      'balance positive': (r) => {
        try { return JSON.parse(r.body).verdict === 'POSITIVE'; }
        catch { return false; }
      },
    });
    track(res);
  });

  sleep(5 + Math.random() * 5);
}

// ── PERSONA 2 : Occasionnel (2-3 bonnes, 2-3 mauvaises) ──
export function occasionnel(usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);
  const today = todayISO();

  group('Occasionnel — Page', () => {
    const res = http.get(`${BASE_URL}/api/actions/today`, { ...params, tags: { name: 'GET /api/actions/today' } });
    track(res);
    sleep(2);
  });

  group('Occasionnel — Quelques actions', () => {
    const goodCount = 2 + Math.floor(Math.random() * 2);
    const badCount = 2 + Math.floor(Math.random() * 2);

    for (let i = 0; i < goodCount; i++) {
      const res = http.post(
        `${BASE_URL}/api/balance/toggle`,
        JSON.stringify({ actionId: randomItem(GOOD_ACTION_IDS), date: today, checked: true }),
        { ...params, tags: { name: 'POST /api/balance/toggle' } }
      );
      track(res);
      sleep(1 + Math.random() * 2); // Plus lent — hésite
    }

    for (let i = 0; i < badCount; i++) {
      const res = http.post(
        `${BASE_URL}/api/balance/toggle`,
        JSON.stringify({ actionId: randomItem(BAD_ACTION_IDS), date: today, checked: true }),
        { ...params, tags: { name: 'POST /api/balance/toggle' } }
      );
      track(res);
      sleep(0.5 + Math.random());
    }
  });

  group('Occasionnel — Balance', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, { ...params, tags: { name: 'GET /api/balance/today' } });
    track(res);
  });

  sleep(3 + Math.random() * 5);
}

// ── PERSONA 3 : Consulteur (historique + conseil IA) ──
export function consulteur(usersPool) {
  const user = pickRandomUser(usersPool);
  const params = authHeaders(user.token);

  group('Consulteur — Balance courante', () => {
    const res = http.get(`${BASE_URL}/api/balance/today`, { ...params, tags: { name: 'GET /api/balance/today' } });
    track(res);
    sleep(1);
  });

  group('Consulteur — Historique', () => {
    const res = http.get(`${BASE_URL}/api/balance/recent`, { ...params, tags: { name: 'GET /api/balance/recent' } });
    check(res, { 'history is array': (r) => { try { return Array.isArray(JSON.parse(r.body)); } catch { return false; } } });
    track(res);
    sleep(3); // Lit les résultats
  });

  group('Consulteur — Conseil IA', () => {
    const res = http.get(`${BASE_URL}/api/advice/today`, {
      ...params,
      tags: { name: 'GET /api/advice/today' },
      timeout: '15s',
    });
    check(res, { 'ai advice received': (r) => r.status === 200 });
    scenarioLatency.add(res.timings.duration);
    scenarioErrors.add(res.status !== 200);
    sleep(5); // Lit le conseil
  });

  sleep(8 + Math.random() * 10);
}

// ── Helpers ──
function track(res) {
  scenarioLatency.add(res.timings.duration);
  scenarioErrors.add(res.status !== 200);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'results/scenario-test-summary.json': JSON.stringify(data, null, 2),
  };
}
