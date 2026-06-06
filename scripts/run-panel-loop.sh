#!/usr/bin/env bash
# run-panel-loop.sh — supervised BATCH/DRAIN driver for the multi-agent panel enrich loop.
#
# Per skill: runs the official panel enrich loop (lib/audit/run-panel-enrich.js — Opus 4.8 +
# GPT-5.5 MANDATORY + free advisory by default), and commits each KEPT SKILL.md path-limited
# (CONTENT, AUDIT_LOOP=1) in ~/Development/skills. A per-skill statusline bridge paints the
# multi-agent panel ABOVE the session statusline so the run is never a blind background task.
#
# Two source modes:
#   --worklist        Drain EVERY eligible skill via the shared claim/ledger system
#                     (scripts/skill/skill-audit-claim.js `next`→`claim`→`release`): ranked,
#                     public-safe, atomically claimed (cannot double-process with the OpenCode
#                     skill-audit loop), and ledger-completed skills are auto-skipped. Resumable
#                     corpus-wide. This is the unattended default for "look through every skill".
#   --skills-file P   Walk a newline-delimited slug file (curated sets); resume via the local ledger.
#
# Resilience: a per-skill WATCHDOG (--timeout, default 5400s/90m) kills a hung enrich (whole
# process tree) and the loop continues. Best-effort budget gate (exhausted-lock fast path),
# loop-checkpoint writes (so loop-supervisor.js can monitor), and loop-steering honoring
# (pause_after_current) when those helpers are present.
#
# This script is SYSTEM infrastructure (canonical-location rule: Skill-Graph code lives in
# skill-graph/). It NEVER mixes its own (SYSTEM) commit with the CONTENT commits it makes for
# enriched skills — those land in the separate ~/Development/skills repo under AUDIT_LOOP=1.
#
# Usage:
#   run-panel-loop.sh (--worklist [--lane <name>] | --skills-file <path>)
#                     [--max-rounds N] [--no-advisory] [--timeout S] [--work-root D] [--dry-run]
#
# Exit-code contract of run-panel-enrich.js (consumed below):
#   0 = enrichment KEPT/applied  ->  commit SKILL.md (+ audit-state.json); release status=completed
#   2 = eval guardrail REVERTED  ->  nothing committed;                    release status=reverted
#   1 = crash / 143|137 = watchdog-killed -> logged, continue;             release status=aborted
set -uo pipefail

DEV=/Users/jacobbalslev/Development
SG="$DEV/skill-graph"
SKILLS_REPO="$DEV/skills"
ENRICH="$SG/lib/audit/run-panel-enrich.js"
BRIDGE="$DEV/scripts/agent/panel-heartbeat-to-agent-state.js"
CLAIM="$DEV/scripts/skill/skill-audit-claim.js"
BUILD_LIST="$DEV/scripts/skill/build-skill-list.js"
BUDGET="$DEV/scripts/model/budget-monitor.js"
CHECKPOINT="$DEV/scripts/loop/loop-checkpoint.js"
STEERING="$DEV/scripts/loop/loop-steering.js"
LOOP_ID="skill-panel-enrich"          # distinct from the OpenCode "skill-audit" loop checkpoint

SKILLS_FILE=""
WORKLIST=0
LANE=""
MAX_ROUNDS=2
ADV_FLAG=""                            # empty => full advisory panel (the chosen default)
DRY_FLAG=""                            # --dry-run: pass through to enrich AND skip the CONTENT commit
TIMEOUT=5400                           # per-skill watchdog ceiling (s); ~90m, generous over ~68m observed
WORK_ROOT="${WORK_ROOT:-/tmp/enrich-loop}"

while [ $# -gt 0 ]; do
  case "$1" in
    --worklist)    WORKLIST=1; shift ;;
    --lane)        LANE="$2"; shift 2 ;;
    --skills-file) SKILLS_FILE="$2"; shift 2 ;;
    --max-rounds)  MAX_ROUNDS="$2";  shift 2 ;;
    --no-advisory) ADV_FLAG="--no-advisory"; shift ;;
    --timeout)     TIMEOUT="$2"; shift 2 ;;
    --dry-run)     DRY_FLAG="--dry-run"; shift ;;
    --work-root)   WORK_ROOT="$2";   shift 2 ;;
    --supervised)  shift ;;            # accepted for launcher symmetry; checkpoint writes are always on
    *) echo "run-panel-loop: unknown arg '$1'" >&2; exit 64 ;;
  esac
done

if [ "$WORKLIST" -eq 0 ] && [ -z "$SKILLS_FILE" ]; then
  echo "run-panel-loop: one of --worklist or --skills-file <path> is required" >&2; exit 64
fi
[ "$WORKLIST" -eq 1 ] || [ -f "$SKILLS_FILE" ] || { echo "run-panel-loop: skills file not found: $SKILLS_FILE" >&2; exit 66; }
[ -f "$ENRICH" ] || { echo "run-panel-loop: enrich runner not found: $ENRICH" >&2; exit 69; }
[ "$WORKLIST" -eq 0 ] || [ -f "$CLAIM" ] || { echo "run-panel-loop: claim system not found: $CLAIM" >&2; exit 69; }

# Session-stable identity so claim + release pair correctly (memory: claim lock is pid-bound;
# both subprocesses must see the same AGENT_ID). One id per drain process.
export AGENT_ID="${AGENT_ID:-panel-drain-$(date -u +%Y%m%dT%H%M%SZ)-$$}"

mkdir -p "$WORK_ROOT"
LEDGER="$WORK_ROOT/batch-ledger.jsonl"
touch "$LEDGER"

now() { date -u "+%Y-%m-%dT%H:%M:%SZ"; }
ledger() { # slug status [detail] — local mirror (the canonical ledger is written by claim/release)
  printf '{"ts":"%s","skill":"%s","status":"%s","detail":"%s"}\n' "$(now)" "$1" "$2" "${3:-}" >> "$LEDGER"
}
done_already() { # slug -> 0 if a terminal line already exists in the LOCAL ledger (skills-file resume)
  grep -q "\"skill\":\"$1\",\"status\":\"\(applied\|reverted\|missing\|noop\)\"" "$LEDGER"
}

# Recursively kill a PID and all its descendants (enumerating children of a KNOWN pid is a
# kill-target list, not a name-scan liveness inference — see no-ps-for-liveness).
kill_tree() {
  local p="$1" c
  for c in $(pgrep -P "$p" 2>/dev/null); do kill_tree "$c"; done
  kill "$p" 2>/dev/null || true
}

# Per-skill watchdog: hard-kill the enrich tree if it outruns $TIMEOUT. Liveness via OWNED pid.
WATCHDOG_PID=""
start_watchdog() {
  local pid="$1" timeout="$2"
  (
    local elapsed=0
    while [ "$elapsed" -lt "$timeout" ]; do
      sleep 10; elapsed=$((elapsed + 10))
      kill -0 "$pid" 2>/dev/null || exit 0   # enrich exited on its own — nothing to kill
    done
    if kill -0 "$pid" 2>/dev/null; then kill_tree "$pid"; sleep 5; kill -9 "$pid" 2>/dev/null || true; fi
  ) &
  WATCHDOG_PID=$!
}

# Best-effort budget gate: only the exhausted-lock fast path for the mandatory frontier (opus).
# Avoids false pauses (Opus on MAX has high limits); a real daily-exhaustion lock pauses the drain.
budget_blocked() {
  local lock="$HOME/.claude/agents/exhausted-opus.lock"
  [ -f "$lock" ] || return 1
  local d; d=$(node -e 'try{process.stdout.write((require(process.argv[1]).date)||"")}catch(e){}' "$lock" 2>/dev/null)
  [ "$d" = "$(date -u +%Y-%m-%d)" ]
}

# Best-effort steering: pause_after_current / stop honored when loop-steering is present.
steering_says_stop() {
  [ -f "$STEERING" ] || return 1
  local out; out=$(node "$STEERING" read --json 2>/dev/null) || return 1
  printf '%s' "$out" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const j=JSON.parse(s);process.exit((j.pause_after_current||j.stop||j.pause)?0:1)}catch(e){process.exit(1)}})' 2>/dev/null
}

checkpoint() { node "$CHECKPOINT" "$@" >/dev/null 2>&1 || true; }   # best-effort

# counters (globals, mutated inside enrich_one_skill)
applied=0; reverted=0; failed=0; missing=0; skipped=0
CODE=0; REL_STATUS="aborted"

# Run ONE skill through the panel enrich loop. Sets globals CODE + REL_STATUS; commits on keep.
enrich_one_skill() { # $1=slug $2=dir
  local slug="$1" dir="$2"
  local STATUS="$WORK_ROOT/$slug.status.json" RESULT="$WORK_ROOT/$slug.result.json" LOG="$WORK_ROOT/$slug.log"
  rm -f "$STATUS"

  AUDIT_LOOP=1 node "$ENRICH" \
    --skill "$slug" --skill-dir "$dir" --cwd "$SG" \
    --max-rounds "$MAX_ROUNDS" $ADV_FLAG $DRY_FLAG \
    --status-file "$STATUS" --no-tui \
    >"$RESULT" 2>"$LOG" &
  local ENRICH_PID=$!
  start_watchdog "$ENRICH_PID" "$TIMEOUT"; local WD="$WATCHDOG_PID"

  local BRIDGE_PID=""
  if [ -f "$BRIDGE" ]; then
    for _ in 1 2 3 4 5 6 7 8; do [ -f "$STATUS" ] && break; sleep 1; done
    node "$BRIDGE" "$STATUS" --poll 4 --stale 2700 >"$WORK_ROOT/$slug.bridge.log" 2>&1 & BRIDGE_PID=$!
  fi

  wait "$ENRICH_PID"; CODE=$?
  [ -n "$WD" ] && kill -0 "$WD" 2>/dev/null && { kill "$WD" 2>/dev/null; wait "$WD" 2>/dev/null; }
  [ -n "$BRIDGE_PID" ] && kill -0 "$BRIDGE_PID" 2>/dev/null && { kill "$BRIDGE_PID" 2>/dev/null; wait "$BRIDGE_PID" 2>/dev/null; }

  case "$CODE" in
    0)
      local kept; kept=$(node -e 'try{console.log(require(process.argv[1]).applied?1:0)}catch(e){console.log(0)}' "$RESULT" 2>/dev/null || echo 0)
      if [ "$kept" != "1" ]; then
        echo "    $slug — exit 0 but applied=false (no change)" >&2
        ledger "$slug" noop "applied=false"; REL_STATUS="aborted"; return
      fi
      if [ -n "$DRY_FLAG" ]; then
        echo "    $slug — DRY-RUN: would commit (applied=1)" >&2
        ledger "$slug" applied "dry-run"; applied=$((applied+1)); REL_STATUS="completed"; return
      fi
      local paths=()
      [ -f "$dir/SKILL.md" ]         && paths+=("$dir/SKILL.md")
      [ -f "$dir/audit-state.json" ] && paths+=("$dir/audit-state.json")
      local MSG="$WORK_ROOT/$slug.commit-msg.txt"
      local adv_alive; adv_alive=$(node -e 'try{console.log((require(process.argv[1]).advisory_models_alive||[]).join(", ")||"none")}catch(e){console.log("n/a")}' "$RESULT" 2>/dev/null || echo n/a)
      {
        printf 'content(%s): panel-enrich — Opus 4.8 + GPT-5.5 + advisory (eval-guarded keep)\n\n' "$slug"
        printf 'Enriched via the multi-agent panel loop (run-panel-loop drain).\n'
        printf 'Eval guardrail verdict: KEEP. Advisory alive: %s.\n\n' "$adv_alive"
        printf 'Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>\n'
      } > "$MSG"
      git -C "$SKILLS_REPO" add -- "${paths[@]}" 2>/dev/null
      if AUDIT_LOOP=1 git -C "$SKILLS_REPO" commit --only -F "$MSG" -- "${paths[@]}" >>"$LOG" 2>&1; then
        local sha; sha=$(git -C "$SKILLS_REPO" rev-parse --short HEAD)
        echo "    $slug — KEPT + committed ($sha)" >&2
        ledger "$slug" applied "$sha"; applied=$((applied+1)); REL_STATUS="completed"
      else
        echo "    $slug — KEPT but commit was a no-op/failed (see $LOG)" >&2
        ledger "$slug" noop "commit no-op"; REL_STATUS="aborted"
      fi
      ;;
    2)
      echo "    $slug — REVERTED by eval guardrail (not committed)" >&2
      ledger "$slug" reverted "eval guardrail"; reverted=$((reverted+1)); REL_STATUS="reverted"
      ;;
    143|137)
      echo "    $slug — KILLED by watchdog (>${TIMEOUT}s)" >&2
      ledger "$slug" failed "watchdog timeout ${TIMEOUT}s"; failed=$((failed+1)); REL_STATUS="aborted"
      ;;
    *)
      echo "    $slug — FAILED (exit $CODE, see $LOG)" >&2
      ledger "$slug" failed "exit $CODE"; failed=$((failed+1)); REL_STATUS="aborted"
      ;;
  esac
}

resolve_dir() { find "$SKILLS_REPO/skills" -type d -name "$1" -not -path '*/node_modules/*' 2>/dev/null | head -1; }

# ── DRAIN MODE — ranked-ARRAY walk over EVERY eligible skill (refresh-after-each) ──
# WHY array, not a `next`-loop: `next` filters on the worklist's STATIC `status`, which a
# ledger completion does NOT refresh — so looping on `next` re-returns the just-completed
# top skill forever and NEVER advances (verified bug 2026-06-06: api-design re-enriched on
# loop). We snapshot the ranked, public-safe, not-yet-completed slugs ONCE, iterate each
# exactly once (so a revert/fail moves on instead of looping), skip any already carrying a
# `content(<slug>): panel-enrich` commit (resume-safe), claim for cross-process dedup, and
# refresh the worklist after each skill so a restart's snapshot excludes what just completed.
drain_worklist() {
  echo "run-panel-loop: WORKLIST drain · advisory=$([ -z "$ADV_FLAG" ] && echo full-panel || echo floor-only) · timeout=${TIMEOUT}s · agent=$AGENT_ID" >&2
  node "$BUILD_LIST" --write >/dev/null 2>&1 || true
  local LIST="$DEV/.opencode/progress/SKILL_LIST.json"
  mapfile -t SLUGS < <(node -e 'try{const j=require(process.argv[1]);for(const e of (j.worklist||j.skills||[])){if(e.repoScope&&e.repoScope!=="shared")continue;const st=e.status||"pending";if(st==="completed"||st==="done")continue;process.stdout.write(e.skill+"\n")}}catch(e){}' "$LIST" 2>/dev/null)
  local TOTAL=${#SLUGS[@]} nn=0 processed=0
  echo "run-panel-loop: $TOTAL eligible skill(s) in ranked order" >&2
  for slug in "${SLUGS[@]}"; do
    nn=$((nn+1))
    if steering_says_stop; then echo "run-panel-loop: steering pause/stop — exiting" >&2; break; fi
    while budget_blocked; do echo "run-panel-loop: opus daily budget exhausted — sleeping 300s" >&2; sleep 300; done

    if git -C "$SKILLS_REPO" log -1 --grep="content(${slug}): panel-enrich" --format=%h 2>/dev/null | grep -q .; then
      echo "[$nn/$TOTAL] $slug — already panel-enriched (git), skipping" >&2; skipped=$((skipped+1)); continue
    fi
    local dir; dir=$(resolve_dir "$slug")
    if [ -z "$dir" ] || [ ! -f "$dir/SKILL.md" ]; then
      echo "[$nn/$TOTAL] $slug — NOT FOUND, skipping" >&2; ledger "$slug" missing "no SKILL.md"; missing=$((missing+1)); continue
    fi
    if [ -n "$DRY_FLAG" ]; then
      echo "[$nn/$TOTAL] $slug — DRY preview (offline enrich; no claim/release/commit)" >&2
      enrich_one_skill "$slug" "$dir"
      echo "run-panel-loop: DRY preview complete (1 skill)" >&2; return
    fi
    if ! node "$CLAIM" claim "$slug" --model panel-enrich --op audit >/dev/null 2>&1; then
      echo "[$nn/$TOTAL] $slug — claim race (held by another agent), skipping" >&2; continue
    fi
    processed=$((processed+1))
    echo "[$nn/$TOTAL] $slug — enriching -> ${dir#$SKILLS_REPO/}" >&2
    checkpoint update --loop "$LOOP_ID" --item "$slug" --phase processing
    enrich_one_skill "$slug" "$dir"
    node "$CLAIM" release "$slug" --model panel-enrich --status "$REL_STATUS" >/dev/null 2>&1 || true
    node "$BUILD_LIST" --write >/dev/null 2>&1 || true
    checkpoint update --loop "$LOOP_ID" --phase done
    echo "[$nn/$TOTAL] $slug — $REL_STATUS" >&2
  done
  echo "run-panel-loop DRAIN DONE: processed=$processed applied=$applied reverted=$reverted failed=$failed missing=$missing skipped=$skipped / eligible=$TOTAL" >&2
}

# ── FILE MODE — curated slug list (local-ledger resume; no shared claim) ──────────
drain_file() {
  mapfile -t SLUGS < <(grep -vE '^\s*(#|$)' "$SKILLS_FILE" | sed 's/[[:space:]]//g')
  local TOTAL=${#SLUGS[@]} i=0
  echo "run-panel-loop: FILE mode · $TOTAL skill(s) · advisory=$([ -z "$ADV_FLAG" ] && echo full-panel || echo floor-only) · timeout=${TIMEOUT}s · work=$WORK_ROOT" >&2
  for slug in "${SLUGS[@]}"; do
    i=$((i+1))
    if done_already "$slug"; then echo "[$i/$TOTAL] $slug — already done (local ledger), skipping" >&2; skipped=$((skipped+1)); continue; fi
    local dir; dir=$(resolve_dir "$slug")
    if [ -z "$dir" ] || [ ! -f "$dir/SKILL.md" ]; then
      echo "[$i/$TOTAL] $slug — NOT FOUND, skipping" >&2; ledger "$slug" missing "no SKILL.md"; missing=$((missing+1)); continue
    fi
    echo "[$i/$TOTAL] $slug — enriching -> ${dir#$SKILLS_REPO/}" >&2
    enrich_one_skill "$slug" "$dir"
  done
  echo "run-panel-loop FILE DONE: applied=$applied reverted=$reverted failed=$failed missing=$missing skipped=$skipped / total=$TOTAL" >&2
}

if [ "$WORKLIST" -eq 1 ]; then drain_worklist; else drain_file; fi
echo "run-panel-loop: per-skill results in $WORK_ROOT/<slug>.result.json · local ledger $LEDGER" >&2
