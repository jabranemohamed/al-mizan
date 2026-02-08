#!/usr/bin/env bash
# ============================================
# Al-Mizan — K6 Test Runner
# Usage: ./run.sh <test> [BASE_URL]
# ============================================

set -euo pipefail

BASE_URL="${2:-http://localhost:8080}"
RESULTS="results"
mkdir -p "$RESULTS"

GREEN='\033[0;32m'
GOLD='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${GOLD}⚖️  Al-Mizan — K6 Performance Tests${NC}"
  echo "──────────────────────────────────────"
  echo -e "  Target: ${GREEN}${BASE_URL}${NC}"
  echo ""
}

run_test() {
  local name="$1"
  local script="$2"
  local emoji="$3"
  echo -e "${GOLD}${emoji} Running ${name} test...${NC}"
  k6 run -e BASE_URL="$BASE_URL" "$script"
  echo -e "${GREEN}✅ ${name} terminé${NC}"
  echo ""
}

case "${1:-help}" in
  smoke)      run_test "SMOKE"      "scripts/01-smoke.js"      "🔥" ;;
  load)       run_test "LOAD"       "scripts/02-load.js"       "⚖️"  ;;
  stress)     run_test "STRESS"     "scripts/03-stress.js"     "💥" ;;
  spike)      run_test "SPIKE"      "scripts/04-spike.js"      "⚡" ;;
  endurance)  run_test "ENDURANCE"  "scripts/05-endurance.js"  "🏋️"  ;;
  ai)         run_test "AI ADVICE"  "scripts/06-ai-advice.js"  "🤖" ;;
  breakpoint) run_test "BREAKPOINT" "scripts/07-breakpoint.js" "🎯" ;;
  auth)       run_test "AUTH"       "scripts/08-auth.js"       "🔐" ;;
  scenario)   run_test "SCENARIO"   "scripts/09-scenario.js"   "🕌" ;;

  all)
    banner
    run_test "SMOKE"  "scripts/01-smoke.js"  "🔥"
    run_test "LOAD"   "scripts/02-load.js"   "⚖️"
    run_test "STRESS" "scripts/03-stress.js" "💥"
    run_test "SPIKE"  "scripts/04-spike.js"  "⚡"
    echo -e "${GREEN}🚀 Suite rapide terminée${NC}"
    ;;

  full)
    banner
    for test in smoke load stress spike endurance auth breakpoint scenario; do
      ./run.sh "$test" "$BASE_URL"
    done
    echo -e "${GREEN}🏆 Suite complète terminée${NC}"
    ;;

  help|*)
    banner
    echo "Usage: ./run.sh <test> [BASE_URL]"
    echo ""
    echo "Tests disponibles:"
    echo "  smoke       🔥 Vérification de base (1 VU, 30s)"
    echo "  load        ⚖️  Charge normale (10 VU, 5 min)"
    echo "  stress      💥 Montée en charge (10→100 VU)"
    echo "  spike       ⚡ Pic soudain (5→100→5 VU)"
    echo "  endurance   🏋️  Soak test (20 VU, 30 min)"
    echo "  ai          🤖 Latence OpenAI (2-5 VU)"
    echo "  breakpoint  🎯 Trouver la limite (0→300 VU)"
    echo "  auth        🔐 Stress authentification (5→40 VU)"
    echo "  scenario    🕌 Multi-personas réaliste"
    echo "  all         🚀 Suite rapide (smoke→spike)"
    echo "  full        🏆 Tous les tests"
    echo ""
    echo "Exemples:"
    echo "  ./run.sh smoke"
    echo "  ./run.sh load http://staging.mizan.app:8080"
    echo ""
    ;;
esac
