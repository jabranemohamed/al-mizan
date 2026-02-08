# Al-Mizan — Project Context

## Overview
Full-stack Islamic deeds tracker (balance of good/bad deeds). Angular 19 frontend + Spring Boot 3.4 backend + PostgreSQL.

## Architecture
- **Frontend**: `al-mizan-frontend/` — Angular 19, standalone components, signals, i18n (FR/EN/AR)
- **Backend**: `al-mizan-backend/` — Spring Boot 3.4, Java 21, JPA/Hibernate, Flyway, JWT auth, H2 (dev) / PostgreSQL (prod)
- **K6 Tests**: `k6/` — Performance tests (smoke, load, stress, spike, endurance, auth, breakpoint, scenario)
- **Observability**: `observability/` — Prometheus + Grafana config

## Key Components (Frontend)
- `balance.component.ts` — Main page: header, scores, arc actions + scale
- `scale.component.ts` — SVG balance beam with tilt animation (pivot at y=50, pillar y=62-220)
- `arc-actions.component.ts` — Actions on semicircular arc (centerX=450, centerY=420, radius=380)
- Services: `ActionService`, `BalanceService`, `LanguageService`

## Backend Endpoints
- `POST /api/auth/register` / `POST /api/auth/login` — JWT auth
- `GET /api/actions` / `GET /api/actions/today` — List actions
- `GET /api/balance/today` / `GET /api/balance/recent` — Daily balance
- `POST /api/balance/toggle` — Toggle action (check/uncheck)
- `GET /api/advice/today` — AI advice (OpenAI)
- `GET /actuator/health` / `/actuator/prometheus` — Health & metrics

## Database Seed
- Good actions: IDs 1–15 (prayers, Quran, charity, dhikr, etc.)
- Bad actions: IDs 16–28 (missing prayer, lying, backbiting, etc.)

## Running Locally
- **Frontend**: `cd al-mizan-frontend && npx ng serve --open` (port 4200)
- **Backend**: `cd al-mizan-backend && mvn spring-boot:run` (port 8080, H2 in-memory)
- **Full stack (Docker)**: `docker compose up -d`
- **Observability**: `docker compose up -d prometheus grafana` (Prometheus :9090, Grafana :3000)

## K6 Performance Tests
- Run via Makefile: `cd k6 && make smoke|load|stress|spike|...`
- With Grafana export: `make grafana-load` or `make grafana-stress`
- Config: `k6/lib/config.js` — profiles, thresholds, action IDs
- Helpers: `k6/lib/helpers.js` — setupUsers, pickRandomUser, authHeaders

## Conventions
- Commits: imperative mood, short description, prefixed (fix:, feat:, etc.)
- Language: user communicates in French
- No mvnw wrapper — use `mvn` directly