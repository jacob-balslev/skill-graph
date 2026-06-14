#!/usr/bin/env bash
# panel-drain-resume-supervisor.sh — single-lane panel drain that survives Claude MAX session limits.
#
# WHY: the multi-model panel eval fires ~140 frontier grader calls per skill, so a sustained drain
# exhausts the Claude MAX *session* limit. The per-model budget-monitor does NOT track that ceiling,
# so the drain cannot preempt it; instead run-panel-loop.sh now detects a MANDATORY-frontier
# rate-limit, writes a `.rate-limit-paused` sentinel in its work-root, and STOPS cleanly (BUDGET-PAUSED)
# leaving the skill eligible. This supervisor wraps that: it runs ONE lane, and when the lane pauses on
# the MAX limit it waits out the reset window and relaunches. Resume is durable — completed skills
# carry a `content(<slug>): skill-audit-loop` git commit and are auto-skipped — so each relaunch picks
# up exactly where it left off. Runs until 0 skills remain eligible.
#
# This is SYSTEM orchestration infra (skill-graph/scripts/). It launches the lane; the lane makes the
# CONTENT commits in ~/Development/skills under AUDIT_LOOP=1. Single lane by design (full eval rigor,
# one frontier-call stream) per the 2026-06-14 decision "1 lane, full rigor, auto-resume".
#
# Usage: panel-drain-resume-supervisor.sh   (env: LANE_POOL, WORK_ROOT, SUP_LOG, RETRY_SLEEP, MAX_ROUNDS)
set -uo pipefail

DEV=/Users/jacobbalslev/Development
SG="$DEV/skill-graph"
LANE_POOL="${LANE_POOL:-solo}"
WORK_ROOT="${WORK_ROOT:-/tmp/skill-audit-loop/$LANE_POOL}"
LANE_LOG="${LANE_LOG:-/tmp/skill-audit-loop/$LANE_POOL.lane.log}"
SUP_LOG="${SUP_LOG:-/tmp/skill-audit-loop/$LANE_POOL.supervisor.log}"
RETRY_SLEEP="${RETRY_SLEEP:-1800}"   # wait between resume attempts while still rate-limited (s) — 30m poll
MAX_ROUNDS="${MAX_ROUNDS:-400}"      # hard backstop against a structural hot-loop
SENTINEL="$WORK_ROOT/.rate-limit-paused"

mkdir -p "$WORK_ROOT"
now(){ date -u "+%Y-%m-%dT%H:%M:%SZ"; }
say(){ echo "[$(now)] supervisor: $*" | tee -a "$SUP_LOG" >&2; }

eligible_count(){
  node "$DEV/scripts/skill/build-skill-list.js" --write >/dev/null 2>&1
  node -e 'try{const j=require(process.argv[1]);const w=j.worklist||[];console.log(w.filter(e=>(e.repoScope==="shared"||!e.repoScope)&&!(["completed","done"].includes(e.status))).length)}catch(e){console.log(-1)}' \
    "$DEV/.opencode/progress/SKILL_LIST.json" 2>/dev/null || echo -1
}

say "START · pool=$LANE_POOL · work=$WORK_ROOT · retry_sleep=${RETRY_SLEEP}s · lane_log=$LANE_LOG"
round=0
while [ "$round" -lt "$MAX_ROUNDS" ]; do
  remaining=$(eligible_count)
  if [ "$remaining" -eq 0 ]; then say "0 eligible skills remaining — DRAIN COMPLETE"; break; fi
  if [ "$remaining" -lt 0 ]; then say "WARN: could not read eligible count; sleeping 120s and retrying"; sleep 120; continue; fi
  round=$((round+1))
  say "round $round · $remaining eligible · launching single lane (timeout 180m, full rigor)…"
  rm -f "$SENTINEL"
  PANEL_POOL="$LANE_POOL" AGENT_ID="panel-drain-$LANE_POOL" \
    bash "$SG/scripts/run-panel-loop.sh" --worklist --degrade-on-budget --timeout 10800 --work-root "$WORK_ROOT" \
    >> "$LANE_LOG" 2>&1
  rc=$?
  if [ -f "$SENTINEL" ]; then
    reset=$(grep -oiE "resets [0-9: ]+ ?(am|pm)" "$LANE_LOG" 2>/dev/null | tail -1)
    say "lane PAUSED on Claude MAX rate limit (${reset:-no reset string in log}); waiting ${RETRY_SLEEP}s before resume"
    sleep "$RETRY_SLEEP"
    continue
  fi
  # No pause sentinel: the lane finished a full pass (DRAIN DONE) or exited for another reason.
  say "lane exited rc=$rc with no rate-limit pause; re-checking eligibility (guard sleep 60s)"
  sleep 60
done
[ "$round" -ge "$MAX_ROUNDS" ] && say "STOP: hit MAX_ROUNDS=$MAX_ROUNDS backstop"
say "DONE (final eligible=$(eligible_count))"
