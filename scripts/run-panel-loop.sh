#!/usr/bin/env bash
# run-panel-loop.sh — bridge-wired BATCH driver for the multi-agent panel enrich loop.
#
# Walks a list of skill slugs and, for each, runs the official panel enrich loop
# (lib/audit/run-panel-enrich.js — Opus 4.8 + GPT-5.5 MANDATORY + free advisory by default),
# then commits each KEPT SKILL.md path-limited (CONTENT, AUDIT_LOOP=1) in ~/Development/skills.
# A per-skill statusline bridge paints the multi-agent panel ABOVE the session statusline so the
# batch is never a blind background task. Resumable via an append-only ledger.
#
# This script is SYSTEM infrastructure (canonical-location rule: Skill-Graph code lives in
# skill-graph/). It NEVER mixes its own (SYSTEM) commit with the CONTENT commits it makes for
# enriched skills — those land in the separate ~/Development/skills repo under AUDIT_LOOP=1.
#
# Usage:
#   run-panel-loop.sh --skills-file <path> [--max-rounds N] [--no-advisory]
#                     [--work-root <dir>] [--max-rounds N]
#
#   --skills-file  Newline-delimited skill slugs (blank lines and #comments ignored). REQUIRED.
#   --no-advisory  Run the certifying floor only (Opus 4.8 + GPT-5.5); skip the free advisory tier.
#                  Default: full panel (advisory ON).
#   --max-rounds N Cross-review convergence budget per skill (default 2).
#   --work-root D  Scratch dir for per-skill status/result/log files (default /tmp/enrich-loop).
#
# Exit-code contract of run-panel-enrich.js (consumed below):
#   0 = enrichment KEPT/applied  ->  commit SKILL.md (+ audit-state.json) path-limited
#   2 = eval guardrail REVERTED  ->  nothing committed (enrichment discarded)
#   1 = crash                    ->  logged, batch continues to next skill
set -uo pipefail

DEV=/Users/jacobbalslev/Development
SG="$DEV/skill-graph"
SKILLS_REPO="$DEV/skills"
ENRICH="$SG/lib/audit/run-panel-enrich.js"
BRIDGE="$DEV/scripts/agent/panel-heartbeat-to-agent-state.js"

SKILLS_FILE=""
MAX_ROUNDS=2
ADV_FLAG=""                       # empty => full advisory panel (the chosen default)
WORK_ROOT="${WORK_ROOT:-/tmp/enrich-loop}"
DRY_FLAG=""                       # --dry-run: pass through to enrich AND skip the CONTENT commit

while [ $# -gt 0 ]; do
  case "$1" in
    --skills-file) SKILLS_FILE="$2"; shift 2 ;;
    --max-rounds)  MAX_ROUNDS="$2";  shift 2 ;;
    --no-advisory) ADV_FLAG="--no-advisory"; shift ;;
    --dry-run)     DRY_FLAG="--dry-run"; shift ;;
    --work-root)   WORK_ROOT="$2";   shift 2 ;;
    *) echo "run-panel-loop: unknown arg '$1'" >&2; exit 64 ;;
  esac
done

[ -n "$SKILLS_FILE" ] || { echo "run-panel-loop: --skills-file is required" >&2; exit 64; }
[ -f "$SKILLS_FILE" ] || { echo "run-panel-loop: skills file not found: $SKILLS_FILE" >&2; exit 66; }
[ -f "$ENRICH" ]      || { echo "run-panel-loop: enrich runner not found: $ENRICH" >&2; exit 69; }

mkdir -p "$WORK_ROOT"
LEDGER="$WORK_ROOT/batch-ledger.jsonl"
touch "$LEDGER"

# ISO-8601 UTC with time-of-day (version-controlled timestamps carry time, per skill-graph AGENTS.md).
now() { date -u "+%Y-%m-%dT%H:%M:%SZ"; }
ledger() { # slug status [detail]
  printf '{"ts":"%s","skill":"%s","status":"%s","detail":"%s"}\n' \
    "$(now)" "$1" "$2" "${3:-}" >> "$LEDGER"
}
done_already() { # slug -> 0 if a terminal-success line already exists (resume support)
  grep -q "\"skill\":\"$1\",\"status\":\"\(applied\|reverted\|missing\|noop\)\"" "$LEDGER"
}

mapfile -t SLUGS < <(grep -vE '^\s*(#|$)' "$SKILLS_FILE" | sed 's/[[:space:]]//g')
TOTAL=${#SLUGS[@]}
echo "run-panel-loop: $TOTAL skill(s) · advisory=$([ -z "$ADV_FLAG" ] && echo full-panel || echo floor-only) · max-rounds=$MAX_ROUNDS · work=$WORK_ROOT" >&2
echo "run-panel-loop: ledger=$LEDGER" >&2

i=0; applied=0; reverted=0; failed=0; missing=0; skipped=0
for slug in "${SLUGS[@]}"; do
  i=$((i+1))
  if done_already "$slug"; then
    echo "[$i/$TOTAL] $slug — already done this batch, skipping" >&2
    skipped=$((skipped+1)); continue
  fi

  dir="$(find "$SKILLS_REPO/skills" -type d -name "$slug" -not -path '*/node_modules/*' 2>/dev/null | head -1)"
  if [ -z "$dir" ] || [ ! -f "$dir/SKILL.md" ]; then
    echo "[$i/$TOTAL] $slug — NOT FOUND (no dir or no SKILL.md), skipping" >&2
    ledger "$slug" missing "no SKILL.md under $SKILLS_REPO/skills"; missing=$((missing+1)); continue
  fi

  STATUS="$WORK_ROOT/$slug.status.json"
  RESULT="$WORK_ROOT/$slug.result.json"
  LOG="$WORK_ROOT/$slug.log"
  rm -f "$STATUS"
  echo "[$i/$TOTAL] $slug — enriching (panel) -> ${dir#$SKILLS_REPO/}" >&2

  # Launch the enrich runner (full result JSON -> RESULT on stdout; live log -> LOG on stderr).
  AUDIT_LOOP=1 node "$ENRICH" \
    --skill "$slug" --skill-dir "$dir" --cwd "$SG" \
    --max-rounds "$MAX_ROUNDS" $ADV_FLAG $DRY_FLAG \
    --status-file "$STATUS" --no-tui \
    >"$RESULT" 2>"$LOG" &
  ENRICH_PID=$!

  # Per-skill statusline bridge = the attached viewer. It paints the panel above the statusline
  # and self-exits when THIS skill's heartbeat reports complete; we relaunch it for the next skill.
  BRIDGE_PID=""
  if [ -f "$BRIDGE" ]; then
    # give the runner a moment to write the first heartbeat
    for _ in 1 2 3 4 5 6 7 8; do [ -f "$STATUS" ] && break; sleep 1; done
    node "$BRIDGE" "$STATUS" --poll 4 --stale 2700 >"$WORK_ROOT/$slug.bridge.log" 2>&1 &
    BRIDGE_PID=$!
  fi

  wait "$ENRICH_PID"; CODE=$?
  # Liveness by OWNED pid (never ps/pgrep): stop the bridge if it hasn't already self-exited.
  if [ -n "$BRIDGE_PID" ] && kill -0 "$BRIDGE_PID" 2>/dev/null; then
    kill "$BRIDGE_PID" 2>/dev/null; wait "$BRIDGE_PID" 2>/dev/null
  fi

  case "$CODE" in
    0)
      # KEPT — Phase 5 already wrote the canonical SKILL.md. Commit path-limited (CONTENT).
      kept="$(node -e 'try{console.log(require(process.argv[1]).applied?1:0)}catch(e){console.log(0)}' "$RESULT" 2>/dev/null || echo 0)"
      if [ "$kept" != "1" ]; then
        echo "[$i/$TOTAL] $slug — exit 0 but applied=false (no change), no commit" >&2
        ledger "$slug" noop "exit 0, applied=false"; applied=$((applied+0)); continue
      fi
      if [ -n "$DRY_FLAG" ]; then
        echo "[$i/$TOTAL] $slug — DRY-RUN: would commit (applied=1), no write" >&2
        ledger "$slug" applied "dry-run"; applied=$((applied+1)); continue
      fi
      paths=()
      [ -f "$dir/SKILL.md" ]        && paths+=("$dir/SKILL.md")
      [ -f "$dir/audit-state.json" ] && paths+=("$dir/audit-state.json")
      MSG="$WORK_ROOT/$slug.commit-msg.txt"
      adv_alive="$(node -e 'try{console.log((require(process.argv[1]).advisory_models_alive||[]).join(", ")||"none")}catch(e){console.log("n/a")}' "$RESULT" 2>/dev/null || echo n/a)"
      {
        printf 'content(%s): panel-enrich — Opus 4.8 + GPT-5.5 + advisory (eval-guarded keep)\n\n' "$slug"
        printf 'Enriched via the multi-agent panel loop (/skill-audit-loop batch).\n'
        printf 'Eval guardrail verdict: KEEP. Advisory alive: %s.\n\n' "$adv_alive"
        printf 'Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n'
      } > "$MSG"
      git -C "$SKILLS_REPO" add -- "${paths[@]}" 2>/dev/null
      if AUDIT_LOOP=1 git -C "$SKILLS_REPO" commit --only -F "$MSG" -- "${paths[@]}" >>"$LOG" 2>&1; then
        sha="$(git -C "$SKILLS_REPO" rev-parse --short HEAD)"
        echo "[$i/$TOTAL] $slug — KEPT + committed ($sha)" >&2
        ledger "$slug" applied "$sha"; applied=$((applied+1))
      else
        echo "[$i/$TOTAL] $slug — KEPT but commit was a no-op/failed (see $LOG)" >&2
        ledger "$slug" noop "commit no-op"
      fi
      ;;
    2)
      echo "[$i/$TOTAL] $slug — REVERTED by eval guardrail (not committed)" >&2
      ledger "$slug" reverted "eval guardrail"; reverted=$((reverted+1))
      ;;
    *)
      echo "[$i/$TOTAL] $slug — FAILED (exit $CODE, see $LOG)" >&2
      ledger "$slug" failed "exit $CODE"; failed=$((failed+1))
      ;;
  esac
done

echo "run-panel-loop DONE: applied=$applied reverted=$reverted failed=$failed missing=$missing skipped=$skipped / total=$TOTAL" >&2
echo "run-panel-loop: per-skill results in $WORK_ROOT/<slug>.result.json · ledger $LEDGER" >&2
