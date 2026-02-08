// ============================================
// Al-Mizan K6 — Helpers
// ============================================

import http from 'k6/http';
import { check, fail } from 'k6';
import { BASE_URL } from './config.js';

// ---- Auth helpers ----

/**
 * Registers a new user. Returns { token, username, email }.
 * Username is suffixed with VU id + iteration for uniqueness.
 */
export function registerUser(vuId, iter) {
  const username = `k6user_${vuId}_${iter}_${Date.now()}`;
  const payload = JSON.stringify({
    username,
    email: `${username}@k6test.com`,
    password: 'K6test_2025!',
  });

  const res = http.post(`${BASE_URL}/api/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /api/auth/register' },
  });

  const ok = check(res, {
    'register: status 200': (r) => r.status === 200,
    'register: has token': (r) => {
      try { return JSON.parse(r.body).token !== undefined; }
      catch { return false; }
    },
  });

  if (!ok) {
    console.error(`Register failed: ${res.status} — ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
}

/**
 * Logs in with given credentials. Returns { token, username, email }.
 */
export function loginUser(username, password) {
  const payload = JSON.stringify({ username, password });

  const res = http.post(`${BASE_URL}/api/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { name: 'POST /api/auth/login' },
  });

  const ok = check(res, {
    'login: status 200': (r) => r.status === 200,
    'login: has token': (r) => {
      try { return JSON.parse(r.body).token !== undefined; }
      catch { return false; }
    },
  });

  if (!ok) {
    console.error(`Login failed: ${res.status} — ${res.body}`);
    return null;
  }

  return JSON.parse(res.body);
}

// ---- HTTP helpers ----

/**
 * Returns headers with Bearer token.
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * Returns today's date as YYYY-MM-DD.
 */
export function today() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

/**
 * Returns a date N days ago as YYYY-MM-DD.
 */
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

/**
 * Random int between min (inclusive) and max (exclusive).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Pick random element from array.
 */
export function randomItem(arr) {
  return arr[randomInt(0, arr.length)];
}
