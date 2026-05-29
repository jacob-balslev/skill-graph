#!/usr/bin/env bash
# watch-audit-batch.sh — active listener for long-running Skill Audit Loop batches.
#
# WHY: a blind background task is silent through a crash or a hang, which looks
# identical to "still running." This watcher pairs with a batch runner that emits
# a heartbeat status.json and surfaces progress / hang / stale-heartbeat / done as
# discrete events — covering every terminal state so silence never means success.
# Stream it via the Claude Code `Monitor` tool (one stdout line == one chat event).
#
# HEARTBEAT CONTRACT — the batch runner MUST write <status-file> on every unit
# start/finish AND on a periodic tick (<= 15s), with this shape:
#   {
#     "ts": "<ISO-8601>", "pid": <int>,
#     "total": <int>, "done": <int>, "failed": <int>,
#     "running": [ { "cell": "<unit-id>", "elapsed_s": <int> }, ... ],
#     "complete": <bool>
#   }
# Reference producer: skill-graph/lib/audit/evaluate-skill.js batch drivers
# (see the A/B experiment driver dist/ab/comprehension-ab-driver.js for a worked example).
#
# EVENTS (each is one Monitor notification):
#   PROGRESS  done count advanced
#   HANG      a running unit exceeded --cell-stall (likely stuck)
#   STALE     heartbeat not updated within --hb-stale (runner hung/died mid-tick)
#   COMPLETE  status.complete==true OR the runner process is gone (terminal; exit 0)
#
# Usage:
#   bash scripts/watch-audit-batch.sh <status-file> \
#        [--proc <pgrep-f-pattern>] [--cell-stall SECS] [--hb-stale SECS] [--poll SECS]
#
# Then arm via the Monitor tool with this command and a timeout >= the batch ETA
# (persistent:true for multi-hour batches).
set -uo pipefail

STATUS="${1:?path to heartbeat status.json required}"; shift || true
PROC=""              # optional pgrep -f pattern to confirm runner liveness
CELL_STALL=2100      # 35m on a single unit = likely hung
HB_STALE=120         # heartbeat older than 2m = runner not ticking
POLL=20
while [ "$#" -gt 0 ]; do
  case "$1" in
    --proc) PROC="$2"; shift 2;;
    --cell-stall) CELL_STALL="$2"; shift 2;;
    --hb-stale) HB_STALE="$2"; shift 2;;
    --poll) POLL="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 2;;
  esac
done

file_mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0; }
proc_alive() { if [ -z "$PROC" ]; then echo 1; return; fi; pgrep -f "$PROC" >/dev/null 2>&1 && echo 1 || echo 0; }

prev_done=-1
declare -A hang_warned

echo "WATCH armed on $STATUS (cell_stall=${CELL_STALL}s hb_stale=${HB_STALE}s poll=${POLL}s)"
while true; do
  now=$(date +%s)

  if [ ! -f "$STATUS" ]; then
    if [ "$(proc_alive)" -eq 0 ]; then echo "COMPLETE no heartbeat file and no runner process"; exit 0; fi
    sleep "$POLL"; continue
  fi

  read -r done total failed complete < <(node -e '
    try{const s=require(process.argv[1]);console.log((s.done||0)+" "+(s.total||0)+" "+(s.failed||0)+" "+(s.complete?1:0));}catch(e){console.log("0 0 0 0");}
  ' "$STATUS" 2>/dev/null)

  if [ "${done:-0}" != "$prev_done" ]; then
    echo "PROGRESS ${done}/${total} done | failed=${failed}"
    prev_done="${done:-0}"
  fi

  while IFS=$'\t' read -r cell elapsed; do
    [ -z "${cell:-}" ] && continue
    if [ "${elapsed:-0}" -ge "$CELL_STALL" ] && [ -z "${hang_warned[$cell]:-}" ]; then
      echo "HANG ${cell} running ${elapsed}s (>= ${CELL_STALL}s) — likely stuck; check logs"
      hang_warned[$cell]=1
    fi
  done < <(node -e '
    try{const s=require(process.argv[1]);(s.running||[]).forEach(r=>console.log((r.cell||"?")+"\t"+Math.round(r.elapsed_s||0)));}catch(e){}
  ' "$STATUS" 2>/dev/null)

  if [ "${complete:-0}" = "1" ]; then echo "COMPLETE ${done}/${total} done, failed=${failed}"; exit 0; fi
  if [ "$(proc_alive)" -eq 0 ]; then echo "COMPLETE runner process gone — ${done}/${total} done, failed=${failed}"; exit 0; fi

  age=$(( now - $(file_mtime "$STATUS") ))
  if [ "$age" -ge "$HB_STALE" ]; then echo "STALE heartbeat ${age}s old (>= ${HB_STALE}s) — runner not ticking; check logs"; fi

  sleep "$POLL"
done
