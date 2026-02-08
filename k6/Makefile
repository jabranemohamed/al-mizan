# ============================================
# Al-Mizan — K6 Test Runner
# ============================================
# Usage:
#   make smoke                → Smoke test (1 VU, 30s)
#   make load                 → Load test (10 VU, 5 min)
#   make stress               → Stress test (10→100 VU)
#   make spike                → Spike test (5→100→5 VU)
#   make endurance            → Endurance test (20 VU, 30 min)
#   make ai                   → AI advice test (2-5 VU)
#   make breakpoint           → Breakpoint test (0→300 VU)
#   make auth                 → Auth test (register/login)
#   make scenario             → Multi-persona scenario
#   make all                  → Smoke → Load → Stress → Spike
#   make full                 → Tous les tests
#   make BASE_URL=http://... load  → URL custom
# ============================================

BASE_URL ?= http://localhost:8080
K6       ?= k6
K6_OPTS  ?=
RESULTS  := results

# Prometheus Remote Write (optionnel, pour Grafana)
# Ajouter: make load K6_OPTS="--out experimental-prometheus-rw"
# Avec:    K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write

.PHONY: help smoke load stress spike endurance ai breakpoint auth scenario all full clean

help: ## Affiche cette aide
	@echo ""
	@echo "⚖️  Al-Mizan — K6 Performance Tests"
	@echo "──────────────────────────────────────"
	@echo "  BASE_URL = $(BASE_URL)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

smoke: ## 🔥 Smoke test — vérification de base (1 VU, 30s)
	@echo "🔥 Running SMOKE test..."
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/01-smoke.js

load: ## ⚖️ Load test — charge normale (10 VU, 5 min)
	@echo "⚖️ Running LOAD test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/02-load.js

stress: ## 💥 Stress test — montée en charge (10→100 VU)
	@echo "💥 Running STRESS test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/03-stress.js

spike: ## ⚡ Spike test — pic soudain (5→100→5 VU)
	@echo "⚡ Running SPIKE test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/04-spike.js

endurance: ## 🏋️ Endurance test — soak (20 VU, 30 min)
	@echo "🏋️ Running ENDURANCE test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/05-endurance.js

ai: ## 🤖 AI advice test — latence OpenAI (2-5 VU)
	@echo "🤖 Running AI ADVICE test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/06-ai-advice.js

breakpoint: ## 🎯 Breakpoint test — trouver la limite (0→300 VU)
	@echo "🎯 Running BREAKPOINT test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/07-breakpoint.js

auth: ## 🔐 Auth test — register/login sous charge (5→40 VU)
	@echo "🔐 Running AUTH test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/08-auth.js

scenario: ## 🕌 Scenario test — multi-personas réaliste
	@echo "🕌 Running SCENARIO test..."
	@mkdir -p $(RESULTS)
	$(K6) run $(K6_OPTS) -e BASE_URL=$(BASE_URL) scripts/09-scenario.js

all: smoke load stress spike ## 🚀 Suite complète rapide (smoke→load→stress→spike)
	@echo "✅ Suite rapide terminée — résultats dans $(RESULTS)/"

full: smoke load stress spike endurance auth breakpoint scenario ## 🏆 Suite complète (tous les tests)
	@echo "✅ Suite complète terminée — résultats dans $(RESULTS)/"

# ---- Grafana + Prometheus ----
grafana-load: ## ⚖️ Load test avec export Prometheus → Grafana
	@echo "⚖️ Running LOAD test → Prometheus..."
	$(K6) run \
		--out experimental-prometheus-rw \
		-e BASE_URL=$(BASE_URL) \
		-e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
		scripts/02-load.js

grafana-stress: ## 💥 Stress test avec export Prometheus → Grafana
	@echo "💥 Running STRESS test → Prometheus..."
	$(K6) run \
		--out experimental-prometheus-rw \
		-e BASE_URL=$(BASE_URL) \
		-e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write \
		scripts/03-stress.js

clean: ## 🧹 Nettoyer les résultats
	rm -rf $(RESULTS)/*.json
	@echo "🧹 Résultats nettoyés"
