# ☪ Al-Mizan — الميزان

> Balance of Deeds — Pèse tes actions du jour

Application full-stack pour suivre ses bonnes et mauvaises actions quotidiennes selon l'Islam, avec une balance visuelle interactive et des conseils IA personnalisés.

## 🏗️ Architecture

| Composant | Technologie |
|---|---|
| **Backend** | Spring Boot 3.4 + Java 21 |
| **Frontend** | Angular 21 |
| **Base de données** | PostgreSQL 16 |
| **IA** | OpenAI GPT-4o-mini (Spring AI) |
| **Auth** | JWT (stateless) |
| **Observabilité** | Actuator + Micrometer + Prometheus + Grafana |
| **Tests de charge** | K6 |
| **CI/CD** | GitHub Actions |
| **Conteneurisation** | Docker + Docker Compose |

## 🚀 Démarrage rapide

### Prérequis
- Java 21+
- Maven 3.9+
- Docker & Docker Compose
- Node.js 20+ (pour le frontend)

### Lancement local (H2 en mémoire)
```bash
cd al-mizan-backend
mvn spring-boot:run
```
L'API est disponible sur `http://localhost:8080`

### Lancement avec Docker Compose
```bash
# Créer un fichier .env avec votre clé OpenAI
echo "OPENAI_API_KEY=sk-votre-cle" > .env

docker-compose up -d
```

| Service | URL |
|---|---|
| Backend API | http://localhost:8080 |
| H2 Console (dev) | http://localhost:8080/h2-console |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 (admin/admin) |

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` — Inscription
- `POST /api/auth/login` — Connexion

### Actions
- `GET /api/actions` — Liste toutes les actions
- `GET /api/actions/today` — Actions du jour (avec statut coché)
- `GET /api/actions/type/{GOOD|BAD}` — Filtrer par type

### Balance
- `POST /api/balance/toggle` — Cocher/décocher une action
- `GET /api/balance/today` — Balance du jour
- `GET /api/balance/recent` — Historique récent

### IA
- `GET /api/advice/today` — Conseil IA basé sur la balance du jour

### Observabilité
- `GET /actuator/health` — Health check
- `GET /actuator/prometheus` — Métriques Prometheus
