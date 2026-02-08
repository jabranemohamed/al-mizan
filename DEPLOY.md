# 🚀 Guide de Déploiement Gratuit — Al-Mizan

Déploiement **100% gratuit** avec :
- **Render.com** → Backend Spring Boot + PostgreSQL
- **Vercel** → Frontend Angular

---

## Prérequis

- Un compte [GitHub](https://github.com) (le repo doit être public ou connecté à Render/Vercel)
- Un compte [Render](https://render.com) (gratuit, inscription avec GitHub)
- Un compte [Vercel](https://vercel.com) (gratuit, inscription avec GitHub)
- *(Optionnel)* Une clé API OpenAI pour le conseil IA

---

## Étape 1 : Pousser sur GitHub

```bash
cd /Users/ONSHENI/Desktop/MCP_SERVER

# Init Git si pas déjà fait
git init
git add .
git commit -m "feat: Al-Mizan — full-stack Islamic deeds tracker"

# Créer le repo sur GitHub puis :
git remote add origin https://github.com/TON_USERNAME/al-mizan.git
git branch -M main
git push -u origin main
```

---

## Étape 2 : Déployer le Backend sur Render

### Option A — Blueprint (automatique) ✨

1. Va sur **https://render.com** → Dashboard
2. Clique **New** → **Blueprint**
3. Connecte ton repo GitHub `al-mizan`
4. Render détecte le `render.yaml` et crée automatiquement :
   - ✅ PostgreSQL `mizan-db` (free)
   - ✅ Web Service `al-mizan-api` (free, Docker)
5. **Configure manuellement** dans le dashboard Render :
   - `OPENAI_API_KEY` → ta clé OpenAI (ou `none` pour désactiver)
   - `APP_CORS_ALLOWED_ORIGINS` → `https://al-mizan-TON_VERCEL_PROJECT.vercel.app`

### Option B — Manuel

#### 2.1 Créer la base PostgreSQL

1. Render Dashboard → **New** → **PostgreSQL**
2. Paramètres :
   - Name: `mizan-db`
   - Database: `mizan`
   - User: `mizan_user`
   - Region: **Frankfurt** (ou le plus proche de toi)
   - Plan: **Free**
3. Clique **Create Database**
4. **Copie** l'URL de connexion interne (`Internal Database URL`)

#### 2.2 Créer le Web Service

1. Render Dashboard → **New** → **Web Service**
2. Connecte ton repo GitHub
3. Paramètres :
   - Name: `al-mizan-api`
   - Region: **Frankfurt** (même que la DB)
   - Runtime: **Docker**
   - Docker file path: `./al-mizan-backend/Dockerfile`
   - Docker context: `./al-mizan-backend`
   - Plan: **Free**
4. **Variables d'environnement** :

| Variable | Valeur |
|----------|--------|
| `SPRING_PROFILES_ACTIVE` | `render` |
| `DATABASE_URL` | *(colle l'Internal Database URL de l'étape 2.1)* |
| `JWT_SECRET` | *(génère une chaîne aléatoire de 64 chars)* |
| `OPENAI_API_KEY` | *(ta clé OpenAI ou `none`)* |
| `JAVA_TOOL_OPTIONS` | `-Xmx384m -Xms128m` |
| `APP_CORS_ALLOWED_ORIGINS` | `https://ton-projet.vercel.app` |

5. Clique **Create Web Service**
6. Attends le build (~3-5 min) puis vérifie :
   ```
   https://al-mizan-api.onrender.com/actuator/health
   ```
   → Doit retourner `{"status":"UP"}`

> ⚠️ **Render Free Tier** : Le service s'endort après 15 min d'inactivité.
> Le premier appel prend ~30-60s (cold start Java). C'est normal.

---

## Étape 3 : Déployer le Frontend sur Vercel

1. Va sur **https://vercel.com** → Dashboard
2. Clique **Add New** → **Project**
3. Importe ton repo GitHub `al-mizan`
4. Paramètres :
   - **Framework Preset** : Angular
   - **Root Directory** : `al-mizan-frontend`
   - **Build Command** : `npm run build -- --configuration production`
   - **Output Directory** : `dist/al-mizan-frontend/browser`
5. Clique **Deploy**

### 3.1 Mettre à jour le proxy API

Après le premier déploiement, note l'URL de ton backend Render (ex: `https://al-mizan-api.onrender.com`).

Édite `al-mizan-frontend/vercel.json` et remplace la destination du rewrite :

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://al-mizan-api.onrender.com/api/$1"
    },
    ...
  ]
}
```

Puis pousse sur GitHub — Vercel redéploie automatiquement.

### 3.2 Mettre à jour le CORS backend

Retourne dans le dashboard Render et mets à jour `APP_CORS_ALLOWED_ORIGINS` :
```
https://al-mizan-TON_PROJET.vercel.app
```

---

## Étape 4 : Vérification

| Composant | URL | Check |
|-----------|-----|-------|
| Backend Health | `https://al-mizan-api.onrender.com/actuator/health` | `{"status":"UP"}` |
| Register | POST `https://al-mizan-api.onrender.com/api/auth/register` | Token JWT |
| Frontend | `https://al-mizan.vercel.app` | Page de login |

### Test rapide avec cURL :

```bash
# 1. Register
curl -X POST https://al-mizan-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"Test123!"}'

# 2. Login
TOKEN=$(curl -s -X POST https://al-mizan-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}' | jq -r '.token')

# 3. List actions
curl -H "Authorization: Bearer $TOKEN" \
  https://al-mizan-api.onrender.com/api/actions

# 4. Toggle an action
curl -X POST https://al-mizan-api.onrender.com/api/balance/toggle \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"actionId":1,"date":"2026-02-08","checked":true}'
```

---

## Architecture déployée

```
┌──────────────────────────────────────────────────┐
│                  Utilisateur                      │
└───────────────────┬──────────────────────────────┘
                    │
           ┌────────▼────────┐
           │   Vercel CDN    │  ← Angular SPA (SSG)
           │   (gratuit)     │     al-mizan.vercel.app
           └────────┬────────┘
                    │ /api/* rewrite
           ┌────────▼────────┐
           │ Render.com      │  ← Spring Boot (Docker)
           │ Web Service     │     al-mizan-api.onrender.com
           │ (gratuit)       │
           └────────┬────────┘
                    │ JDBC
           ┌────────▼────────┐
           │ Render.com      │  ← PostgreSQL 16
           │ PostgreSQL      │     Internal network
           │ (gratuit)       │
           └─────────────────┘
```

---

## Limites du Free Tier

| Service | Limite | Impact |
|---------|--------|--------|
| **Render Web** | 750h/mois, sleep après 15min | Cold start ~30-60s |
| **Render PostgreSQL** | 256MB stockage, expire après 90 jours | Recréer la DB tous les 90j |
| **Vercel** | 100GB bandwidth/mois | Largement suffisant |
| **OpenAI** | Selon ton plan | Penser à mettre un rate limit |

### Tips pour le free tier :

1. **Garder le backend éveillé** : Utilise [UptimeRobot](https://uptimerobot.com) (gratuit) pour pinger `/actuator/health` toutes les 14 minutes
2. **DB qui expire** : Note de recréer la DB Render tous les ~80 jours
3. **JVM optimisée** : Le Dockerfile utilise `-XX:+UseSerialGC` et `-XX:MaxRAMPercentage=75` pour le free tier

---

## Commandes utiles

```bash
# Voir les logs backend (Render)
# → Dashboard Render → al-mizan-api → Logs

# Rebuild manuel
# → Dashboard Render → Manual Deploy → Deploy latest commit

# Redéployer le frontend
git add . && git commit -m "fix: ..." && git push
# Vercel redéploie automatiquement

# Test local avec profil render
cd al-mizan-backend
mvn spring-boot:run -Dspring-boot.run.profiles=render
```

---

## Upgrade futur (si besoin de perf)

| Besoin | Solution | Coût |
|--------|----------|------|
| Pas de cold start | Render Starter ($7/mois) | $7 |
| DB persistante | Render Starter DB ($7/mois) | $7 |
| Custom domain | Vercel Pro ou Cloudflare | Gratuit-$20 |
| CI/CD | GitHub Actions (déjà gratuit) | $0 |
