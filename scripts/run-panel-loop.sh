#!/usr/bin/env bash
# run-panel-loop.sh — supervised BATCH/DRAIN driver for the multi-agent panel enrich loop.
#
# Per skill: runs the official panel enrich loop (lib/audit/run-skill-audit-loop.js — Opus 4.8 +
# GPT-5.5 MANDATORY + free advisory by default), and commits each KEPT SKILL.md path-limited
# (CONTENT, AUDIT_LOOP=1) in ~/Development/skills. The runner writes a per-skill heartbeat
# status.json; the canonical viewer is `scripts/watch-panel.js <status-file>` (collected multi-agent
# block — the main-area surface, never the statusline). The per-skill statusline bridge below is an
# OPTIONAL complement for this unattended terminal/Ghostty drain (where there is no Claude Code
# main conversation area) — it is NOT the panel surface. Per the panel-visibility rule
# (SKILL_AUDIT_LOOP.md § "Canonical way to run the PANEL loop VISIBLY"), the panel belongs in the
# main conversation area; the statusline is only a cheap complement. Either way the run is never a
# blind background task — a viewer (watch-panel.js or the bridge) is always attached to the heartbeat.
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
#                     [--max-rounds N] [--max-skills N] [--no-advisory] [--timeout S]
#                     [--work-root D] [--dry-run] [--fail-fast-budget] [--degrade-on-budget]
#
#   --max-skills N    Stop cleanly (exit 0) after N skills have been processed this run.
#                     0 (default) = uncapped. Added 2026-06-10T for scheduler-bounded wakes
#                     (e.g. the nightly Codex automation: target 3 / hard cap 5 per wake) so
#                     a bounded run exits cleanly instead of dying mid-list.
#
#   --fail-fast-budget  When all mandatory frontiers are exhausted, or one is exhausted and
#                     --degrade-on-budget is absent, STOP cleanly and emit a recoverable
#                     BUDGET-PAUSED marker (exit 0) instead of busy-waiting in 300s sleeps.
#                     Default (flag absent) keeps the legacy sleep-wait behavior for
#                     interactive runs that want to block until budget frees.
#
#   --degrade-on-budget  If at least one mandatory frontier is available while another has an
#                     active exhausted-lock, continue in the explicit single-available-frontier
#                     mode. The runner caps the eval verdict at PROVISIONAL and records that a
#                     full two-frontier re-grade is required. If every frontier is exhausted,
#                     the normal fail-fast/sleep behavior still applies. Added for SKI-386.
#
#   ENV  PANEL_POOL=<name>  Names the drain pool (default: auto-detected from runtime env —
#                     opencode/codex/claude, else "default"). DISTINCT pools run in PARALLEL on
#                     DIFFERENT skills (the shared per-skill claim store dedups them); the SAME pool
#                     is single-instance. Each runtime supervisor passes its own PANEL_POOL so the
#                     two supervisors stop mutually excluding. PANEL_LOCK_DIR (full path) still
#                     overrides everything. Two parallel pools double Opus+GPT MAX rate pressure —
#                     run both with --fail-fast-budget --degrade-on-budget to absorb it gracefully.
#
# Exit-code contract of run-skill-audit-loop.js (consumed below):
#   0 = enrichment KEPT/applied  ->  commit SKILL.md (+ audit-state.json); release status=completed
#   2 = eval guardrail REVERTED  ->  nothing committed;                    release status=reverted
#   1 = crash / 143|137 = watchdog-killed -> logged, continue;             release status=aborted
set -uo pipefail

DEV=/Users/jacobbalslev/Development
SG="$DEV/skill-graph"
SKILLS_REPO="$DEV/skills"
ENRICH="$SG/lib/audit/run-skill-audit-loop.js"
BRIDGE="$DEV/scripts/agent/panel-heartbeat-to-agent-state.js"
CLAIM="$DEV/scripts/skill/skill-audit-claim.js"
BUILD_LIST="$DEV/scripts/skill/build-skill-list.js"
BUDGET="$DEV/scripts/model/budget-monitor.js"
CHECKPOINT="$DEV/scripts/loop/loop-checkpoint.js"
STEERING="$DEV/scripts/loop/loop-steering.js"
LOOP_ID="skill-skill-audit-loop"          # distinct from the OpenCode "skill-audit" loop checkpoint

SKILLS_FILE=""
WORKLIST=0
LANE=""
MAX_ROUNDS=2
MAX_SKILLS=0                           # --max-skills: 0 = uncapped; N = clean stop after N processed
FAIL_FAST_BUDGET=0                     # --fail-fast-budget: 1 = clean BUDGET-PAUSED stop vs legacy sleep-wait (SKI-372)
DEGRADE_ON_BUDGET=0                    # --degrade-on-budget: 1 = single-available-frontier PROVISIONAL-capped mode (SKI-386)
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
    --max-skills)  MAX_SKILLS="$2"; shift 2 ;;
    --fail-fast-budget) FAIL_FAST_BUDGET=1; shift ;;
    --degrade-on-budget) DEGRADE_ON_BUDGET=1; shift ;;
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

# ── Single-instance lock (silent-failure root cause; SKI-346) ───────────────────────────────
# Concurrent panel drains contend for the SAME Opus+GPT MAX quota AND the same machine memory:
# 2 drains x 8 agents = up to 16 live frontier calls -> agents hang, or the OS OOM-kills the
# node tree. Those kills are then mislabeled "watchdog timeout" by the 143|137 branch below, so
# the real cause is invisible — the "fails silently" symptom. One drain at a time. The lock is
# an atomic mkdir (portable; macOS has no flock), owner pid recorded inside; a stale lock whose
# owner pid is dead is reclaimed. Set PANEL_LOCK_DIR to run an intentionally separate pool.
# SKI-374: the DEFAULT lives in workspace scratch (gitignored, INSIDE the writable workspace) so
# the lock works under the Codex workspace-write sandbox out of the box — the old default
# $HOME/.claude/agents/panel-drain.lock is OUTSIDE the sandbox's writable roots (workspace+temp),
# so its mkdir failed and the run aborted as if another drain held the lock (openai/codex#15310,
# automations always start workspace-write). Both supervisors used to override PANEL_LOCK_DIR to
# exactly this path; that override is now unnecessary (the default IS the path) — PANEL_LOCK_DIR
# remains the knob for an intentionally separate pool.
# PANEL_POOL names the drain pool. Distinct pools run in PARALLEL on DIFFERENT skills (the shared
# per-skill claim store dedups them — a skill one pool lead-claims is skipped by the other). Same
# pool = single-instance (the atomic mkdir lock below refuses a second drain). Each runtime supervisor
# passes its own PANEL_POOL (claude / opencode / codex) so the two supervisors no longer mutually
# exclude; auto-detect from runtime env is the fallback when PANEL_POOL is unset. An explicit
# PANEL_LOCK_DIR (full path) still overrides everything (intentionally separate pool / custom path).
detect_pool() {
  if [ -n "${PANEL_POOL:-}" ]; then echo "$PANEL_POOL"; return; fi
  if [ -n "${OPENCODE_SESSION_ID:-}${OPENCODE:-}" ]; then echo "opencode"; return; fi
  if [ -n "${CODEX_THREAD_ID:-}${CODEX_SANDBOX:-}" ]; then echo "codex"; return; fi
  if [ -n "${CLAUDE_SESSION_ID:-}${CLAUDECODE:-}${CLAUDE_CODE:-}" ]; then echo "claude"; return; fi
  echo "default"
}
POOL="$(detect_pool)"
LOCK_DIR="${PANEL_LOCK_DIR:-$SG/skill-audit-loop/progress/panel-drain-${POOL}.lock}"
mkdir -p "$(dirname "$LOCK_DIR")" 2>/dev/null || true   # ensure the gitignored scratch parent exists
_LOCK_HELD=""
release_lock() { [ -n "$_LOCK_HELD" ] && rm -rf "$LOCK_DIR" 2>/dev/null; return 0; }
# NO `ps` peer guard. The previous unconditional "refuse if any run-panel-loop.sh process exists"
# guard (a) BLOCKED legitimate parallel pools (Claude + OpenCode are both run-panel-loop.sh), and
# (b) is unreliable cross-runtime: a sandboxed peer's pid is invisible to this process's `ps`
# (no-ps-for-liveness). The per-pool atomic mkdir lock below is the correct primitive — it refuses a
# second SAME-pool drain and reclaims a stale lock by its OWNED pid, while letting DIFFERENT pools run.
if mkdir "$LOCK_DIR" 2>/dev/null; then
  _LOCK_HELD=1; echo "$$" > "$LOCK_DIR/pid"
else
  _owner=$(cat "$LOCK_DIR/pid" 2>/dev/null)
  if [ -n "$_owner" ] && kill -0 "$_owner" 2>/dev/null; then
    echo "run-panel-loop: REFUSING — another panel drain (pid $_owner) holds $LOCK_DIR." >&2
    exit 75
  fi
  echo "run-panel-loop: reclaiming stale lock (owner pid ${_owner:-?} not alive)" >&2
  rm -rf "$LOCK_DIR" 2>/dev/null
  if mkdir "$LOCK_DIR" 2>/dev/null; then _LOCK_HELD=1; echo "$$" > "$LOCK_DIR/pid"; fi
fi
trap release_lock EXIT INT TERM

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
  local pid="$1" timeout="$2" sentinel="$3"
  (
    local elapsed=0
    while [ "$elapsed" -lt "$timeout" ]; do
      sleep 10; elapsed=$((elapsed + 10))
      kill -0 "$pid" 2>/dev/null || exit 0   # enrich exited on its own — nothing to kill
    done
    # Mark that the WATCHDOG (not an external SIGKILL/OOM/contention kill) is doing this kill, so
    # the caller can tell a genuine timeout from an external one (SKI-346 — the unconditional
    # "watchdog timeout" label that made every kill, including OOM/quota kills, look benign).
    [ -n "$sentinel" ] && : > "$sentinel"
    if kill -0 "$pid" 2>/dev/null; then kill_tree "$pid"; sleep 5; kill -9 "$pid" 2>/dev/null || true; fi
  ) &
  WATCHDOG_PID=$!
}

# Best-effort budget gate for the mandatory frontier set. The Node helper is the source of truth
# for exhausted-lock aliases and current-day lock semantics; the shell only decides whether to
# stop, wait, or pass the explicit single-available-frontier degraded-mode flag to the runner.
ENRICH_FRONTIER_ARGS=()
frontier_budget_json() {
  node - "$SG" <<'NODE'
const sg = process.argv[2];
const { frontierAvailability } = require(`${sg}/lib/audit/panel-budget`);
const { FRONTIER_PAIR } = require(`${sg}/lib/audit-shared/model-provider`);
process.stdout.write(JSON.stringify(frontierAvailability({ models: FRONTIER_PAIR })));
NODE
}
json_available_csv() {
  node -e 'const j=JSON.parse(process.argv[1]); process.stdout.write((j.available||[]).join(","));' "$1"
}
json_exhausted_csv() {
  node -e 'const j=JSON.parse(process.argv[1]); process.stdout.write((j.exhausted||[]).map(e=>e.model).join(","));' "$1"
}
configure_frontier_budget() {
  ENRICH_FRONTIER_ARGS=()
  local j available exhausted
  j=$(frontier_budget_json 2>/dev/null) || { echo "run-panel-loop: warning: frontier budget check failed; continuing with default two-frontier runner" >&2; return 0; }
  available=$(json_available_csv "$j" 2>/dev/null || true)
  exhausted=$(json_exhausted_csv "$j" 2>/dev/null || true)
  if [ -z "$available" ]; then
    if [ "$FAIL_FAST_BUDGET" -eq 1 ]; then
      echo "run-panel-loop: BUDGET-PAUSED — all mandatory frontiers exhausted (${exhausted:-unknown}); clean stop (recoverable, not a failure)" >&2
      return 1
    fi
    while :; do
      echo "run-panel-loop: all mandatory frontiers exhausted (${exhausted:-unknown}) — sleeping 300s" >&2
      sleep 300
      j=$(frontier_budget_json 2>/dev/null) || return 0
      available=$(json_available_csv "$j" 2>/dev/null || true)
      exhausted=$(json_exhausted_csv "$j" 2>/dev/null || true)
      [ -n "$available" ] && break
    done
  fi
  if [ -n "$exhausted" ]; then
    if [ "$DEGRADE_ON_BUDGET" -eq 1 ]; then
      ENRICH_FRONTIER_ARGS=(--degrade-on-budget)
      echo "run-panel-loop: DEGRADED-FRONTIER — available=${available:-none} exhausted=$exhausted; PROVISIONAL-capped; full two-frontier re-grade required" >&2
      return 0
    fi
    if [ "$FAIL_FAST_BUDGET" -eq 1 ]; then
      echo "run-panel-loop: BUDGET-PAUSED — mandatory frontier exhausted ($exhausted); clean stop after current checkpoint; pass --degrade-on-budget to continue with ${available:-the available frontier} (PROVISIONAL-capped)" >&2
      return 1
    fi
    while [ -n "$exhausted" ]; do
      echo "run-panel-loop: mandatory frontier budget exhausted ($exhausted) — sleeping 300s" >&2
      sleep 300
      j=$(frontier_budget_json 2>/dev/null) || return 0
      exhausted=$(json_exhausted_csv "$j" 2>/dev/null || true)
    done
  fi
  return 0
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
  local WD_SENTINEL="$WORK_ROOT/$slug.watchdog-fired"
  rm -f "$STATUS" "$WD_SENTINEL"
  local T_START; T_START=$(date +%s)

  AUDIT_LOOP=1 node "$ENRICH" \
    --skill "$slug" --skill-dir "$dir" --cwd "$SG" \
    --max-rounds "$MAX_ROUNDS" $ADV_FLAG $DRY_FLAG "${ENRICH_FRONTIER_ARGS[@]}" \
    --status-file "$STATUS" --no-tui \
    >"$RESULT" 2>"$LOG" &
  local ENRICH_PID=$!
  start_watchdog "$ENRICH_PID" "$TIMEOUT" "$WD_SENTINEL"; local WD="$WATCHDOG_PID"

  # OPTIONAL statusline complement for this unattended terminal drain (NOT the panel surface — the
  # main-area viewer is watch-panel.js on $STATUS; see header). Kept as a cheap tab-title hint.
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
      local frontier_label; frontier_label=$(node -e 'try{const r=require(process.argv[1]);const m=(r.mandatory_models||[]).join(", ")||"n/a";if(r.degraded_frontier&&r.degraded_frontier.enabled){console.log(`single-available-frontier ${m} (PROVISIONAL-capped; re-grade required)`)}else{console.log(`multi-frontier panel ${m}`)}}catch(e){console.log("multi-frontier panel")}' "$RESULT" 2>/dev/null || echo "multi-frontier panel")
      {
        printf 'content(%s): skill-audit-loop — %s (eval-guarded keep)\n\n' "$slug" "$frontier_label"
        printf 'Enriched via the multi-agent panel loop (run-panel-loop drain).\n'
        printf 'Eval guardrail verdict: KEEP. Advisory alive: %s.\n\n' "$adv_alive"
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
      local T_ELAPSED=$(( $(date +%s) - T_START ))
      if [ -f "$WD_SENTINEL" ]; then
        echo "    $slug — KILLED by watchdog (ran ${T_ELAPSED}s, ceiling ${TIMEOUT}s)" >&2
        ledger "$slug" failed "watchdog timeout: ran ${T_ELAPSED}s of ${TIMEOUT}s"; failed=$((failed+1)); REL_STATUS="aborted"
      else
        echo "    $slug — KILLED by EXTERNAL signal (exit $CODE, ran ${T_ELAPSED}s < ${TIMEOUT}s — NOT a watchdog timeout; likely OOM / quota-contention / manual kill. Check for concurrent drains + memory; see $LOG)" >&2
        ledger "$slug" failed "external kill exit $CODE after ${T_ELAPSED}s (NOT watchdog — OOM/contention/manual)"; failed=$((failed+1)); REL_STATUS="aborted"
      fi
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
# `content(<slug>): skill-audit-loop` commit (resume-safe), claim for cross-process dedup, and
# refresh the worklist after each skill so a restart's snapshot excludes what just completed.
drain_worklist() {
  echo "run-panel-loop: WORKLIST drain · pool=$POOL · advisory=$([ -z "$ADV_FLAG" ] && echo full-panel || echo floor-only) · timeout=${TIMEOUT}s · agent=$AGENT_ID" >&2
  # Self-heal (startup): clear panel per-model SLOT lock FILES orphaned by a previously KILLED
  # run. Historically the panel claimed FIXED per-model owners, so a killed run's held slot
  # refused EVERY future skill's claim (verified 2026-06-06: an orphaned api-design slot failed
  # all 99 skills at phase 1a). SKI-230 now run-scopes the owners (curate-<model>-<runToken>), so
  # a stale lock no longer BLOCKS a new run — but clearing the stale lock FILES at startup is
  # still good hygiene (the drain is the sole panel runner; no panel slot is legitimately held
  # at startup). The trap + mid-loop reap below (SKI-234) cover orphans that arise DURING the run.
  for _m in opus codex-current gemini gemini-flash minimax big-pickle deepseek-flash mimo nemotron skill-audit-loop; do
    rm -f "$DEV"/.claude/agent-memory/skill-audit-*--"$_m" 2>/dev/null || true
  done
  # SKI-234: release THIS run's in-flight claim if the drain is interrupted (SIGINT/SIGTERM) or
  # exits mid-skill, so a killed drain never leaves its current slug claimed for the next wave to
  # trip over. Same AGENT_ID (exported above) so release matches the owner. On normal completion
  # CLAIMED_SLUG is "" (cleared after each release), so the EXIT trap is a no-op.
  CLAIMED_SLUG=""
  cleanup_in_flight_claim() {
    [ -n "$CLAIMED_SLUG" ] || return 0
    node "$CLAIM" release "$CLAIMED_SLUG" --model skill-audit-loop --status aborted >/dev/null 2>&1 || true
    CLAIMED_SLUG=""
  }
  trap 'cleanup_in_flight_claim; release_lock' EXIT INT TERM
  node "$BUILD_LIST" --write >/dev/null 2>&1 || true
  local LIST="$DEV/.opencode/progress/SKILL_LIST.json"
  mapfile -t SLUGS < <(node -e 'try{const j=require(process.argv[1]);for(const e of (j.worklist||j.skills||[])){if(e.repoScope&&e.repoScope!=="shared")continue;const st=e.status||"pending";if(st==="completed"||st==="done")continue;process.stdout.write(e.skill+"\n")}}catch(e){}' "$LIST" 2>/dev/null)
  local TOTAL=${#SLUGS[@]} nn=0 processed=0
  echo "run-panel-loop: $TOTAL eligible skill(s) in ranked order" >&2
  for slug in "${SLUGS[@]}"; do
    nn=$((nn+1))
    if [ "$MAX_SKILLS" -gt 0 ] && [ "$processed" -ge "$MAX_SKILLS" ]; then
      echo "run-panel-loop: max-skills reached ($processed/$MAX_SKILLS) — clean stop" >&2; break
    fi
    if steering_says_stop; then echo "run-panel-loop: steering pause/stop — exiting" >&2; break; fi
    if ! configure_frontier_budget; then
      echo "run-panel-loop: clean stop after ${processed} processed skill(s); resume next wake (recoverable, not a failure)" >&2
      break
    fi

    if git -C "$SKILLS_REPO" log -1 --grep="content(${slug}): skill-audit-loop" --format=%h 2>/dev/null | grep -q .; then
      echo "[$nn/$TOTAL] $slug — already skill-audit-looped (git), skipping" >&2; skipped=$((skipped+1)); continue
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
    # Claim the LEAD lock (--lead) so `next`/`list` — which consult the bare-slug lead key — see this
    # skill as in-flight and a parallel drain (other runtime) skips it. --ttl-min covers the watchdog
    # ceiling + 60m margin so the claim is NOT reaped mid-run (the old --model slot took the wrong key
    # AND defaulted to a 60m TTL < the ~68–90m run). --model is kept for honest ledger/run-dir attribution.
    if ! node "$CLAIM" claim "$slug" --lead --model skill-audit-loop --op audit --ttl-min "$(( TIMEOUT/60 + 60 ))" >/dev/null 2>&1; then
      echo "[$nn/$TOTAL] $slug — claim race (held by another agent), skipping" >&2; continue
    fi
    CLAIMED_SLUG="$slug"   # SKI-234: track the in-flight slug for the interrupt trap
    processed=$((processed+1))
    echo "[$nn/$TOTAL] $slug — enriching -> ${dir#$SKILLS_REPO/}" >&2
    checkpoint update --loop "$LOOP_ID" --item "$slug" --phase processing
    enrich_one_skill "$slug" "$dir"
    node "$CLAIM" release "$slug" --model skill-audit-loop --status "$REL_STATUS" >/dev/null 2>&1 || true
    CLAIMED_SLUG=""        # SKI-234: released cleanly — nothing in flight for the trap
    # SKI-234: periodic mid-loop orphan reap (every 10 processed) so a multi-day drain clears
    # stale/orphaned locks (e.g. from watchdog-killed panel sub-processes) DURING the run, not
    # only at startup. The claim system also TTL-reaps opportunistically; this is the explicit sweep.
    if [ $((processed % 10)) -eq 0 ]; then node "$CLAIM" reap >/dev/null 2>&1 || true; fi
    node "$BUILD_LIST" --write >/dev/null 2>&1 || true
    checkpoint update --loop "$LOOP_ID" --phase done
    echo "[$nn/$TOTAL] $slug — $REL_STATUS" >&2
  done
  echo "run-panel-loop DRAIN DONE: processed=$processed applied=$applied reverted=$reverted failed=$failed missing=$missing skipped=$skipped / eligible=$TOTAL" >&2
}

# ── FILE MODE — curated slug list (local-ledger resume; no shared claim) ──────────
drain_file() {
  mapfile -t SLUGS < <(grep -vE '^\s*(#|$)' "$SKILLS_FILE" | sed 's/[[:space:]]//g')
  local TOTAL=${#SLUGS[@]} i=0 processed=0
  echo "run-panel-loop: FILE mode · $TOTAL skill(s) · advisory=$([ -z "$ADV_FLAG" ] && echo full-panel || echo floor-only) · timeout=${TIMEOUT}s · work=$WORK_ROOT" >&2
  for slug in "${SLUGS[@]}"; do
    i=$((i+1))
    if [ "$MAX_SKILLS" -gt 0 ] && [ "$processed" -ge "$MAX_SKILLS" ]; then
      echo "run-panel-loop: max-skills reached ($processed/$MAX_SKILLS) — clean stop" >&2; break
    fi
    if ! configure_frontier_budget; then
      echo "run-panel-loop: clean stop after ${processed} processed skill(s); resume next wake (recoverable, not a failure)" >&2
      break
    fi
    if done_already "$slug"; then echo "[$i/$TOTAL] $slug — already done (local ledger), skipping" >&2; skipped=$((skipped+1)); continue; fi
    local dir; dir=$(resolve_dir "$slug")
    if [ -z "$dir" ] || [ ! -f "$dir/SKILL.md" ]; then
      echo "[$i/$TOTAL] $slug — NOT FOUND, skipping" >&2; ledger "$slug" missing "no SKILL.md"; missing=$((missing+1)); continue
    fi
    echo "[$i/$TOTAL] $slug — enriching -> ${dir#$SKILLS_REPO/}" >&2
    enrich_one_skill "$slug" "$dir"
    processed=$((processed+1))
  done
  echo "run-panel-loop FILE DONE: applied=$applied reverted=$reverted failed=$failed missing=$missing skipped=$skipped / total=$TOTAL" >&2
}

if [ "$WORKLIST" -eq 1 ]; then drain_worklist; else drain_file; fi
echo "run-panel-loop: per-skill results in $WORK_ROOT/<slug>.result.json · local ledger $LEDGER" >&2
