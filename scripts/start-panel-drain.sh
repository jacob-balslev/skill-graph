#!/usr/bin/env bash
# start-panel-drain.sh — launch the unattended panel-enrich DRAIN in a visible Ghostty session.
#
# The chosen vehicle for "look through every skill automatically" (decided 2026-06-06): a visible,
# steerable Ghostty tab running run-panel-loop.sh --worklist (full panel, advisory pre-logged-in).
# This wrapper does the three things the bare loop should not assume:
#   1. refresh the ranked worklist (build-skill-list.js)
#   2. auth PREFLIGHT — hard-require the certifying frontier pair (claude + codex); for the advisory
#      tier (gemini + opencode) print the exact one-time login commands, since the full-panel choice
#      only holds if they're logged in (GEMINI_API_KEY is deliberately unset — subscriptions, not API).
#   3. spawn the loop in a visible Ghostty tab (so it's watchable + steerable via loop-steering.json).
#
# SYSTEM infrastructure (canonical-location). It launches the loop; the loop makes CONTENT commits.
#
# Usage:
#   start-panel-drain.sh [--lane <name>] [--no-advisory] [--timeout S] [--here] [--dry-run]
#     --here       run the drain in THIS terminal (foreground) instead of spawning a Ghostty tab
#     other flags  passed through to run-panel-loop.sh
set -uo pipefail

DEV=/Users/jacobbalslev/Development
SG="$DEV/skill-graph"
LOOP="$SG/scripts/run-panel-loop.sh"
SPAWN="$DEV/scripts/agent/spawn-ghostty-tab.sh"
BUILD_LIST="$DEV/scripts/skill/build-skill-list.js"

HERE=0
PASS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --here)        HERE=1; shift ;;
    --lane)        PASS+=(--lane "$2"); shift 2 ;;
    --timeout)     PASS+=(--timeout "$2"); shift 2 ;;
    --no-advisory) PASS+=(--no-advisory); ADVISORY_OFF=1; shift ;;
    --dry-run)     PASS+=(--dry-run); shift ;;
    *) echo "start-panel-drain: unknown arg '$1'" >&2; exit 64 ;;
  esac
done
ADVISORY_OFF="${ADVISORY_OFF:-0}"

echo "── panel-drain preflight ──────────────────────────────────────────" >&2

# 1. refresh ranked worklist (best-effort; the drain reads it via skill-audit-claim next)
if [ -f "$BUILD_LIST" ]; then
  echo "• refreshing worklist (build-skill-list.js --write)…" >&2
  node "$BUILD_LIST" --write >/dev/null 2>&1 && echo "  ✓ SKILL_LIST.json refreshed" >&2 || echo "  ! worklist refresh failed (continuing; drain still reads the existing list)" >&2
fi

# 2. auth preflight
preflight_fail=0
for cli in claude codex; do
  if command -v "$cli" >/dev/null 2>&1; then echo "• MANDATORY $cli — ✓ resolves" >&2
  else echo "• MANDATORY $cli — ✗ NOT FOUND on PATH (the certifying frontier pair is required)" >&2; preflight_fail=1; fi
done
if [ "$preflight_fail" -eq 1 ]; then
  echo "ABORT: the mandatory frontier pair (claude + codex) must be installed + authenticated." >&2
  exit 69
fi
if [ "$ADVISORY_OFF" -eq 0 ]; then
  echo "• ADVISORY tier (full panel): Gemini + OpenCode free models add breadth (never certify)." >&2
  command -v gemini   >/dev/null 2>&1 && echo "  - gemini CLI ✓ present  — if advisory gemini fails, run once:  gemini /auth" >&2 \
                                       || echo "  - gemini CLI ✗ absent   — advisory gemini will skip (non-blocking)" >&2
  command -v opencode >/dev/null 2>&1 && echo "  - opencode CLI ✓ present — if advisory opencode fails, run once: opencode auth login" >&2 \
                                       || echo "  - opencode CLI ✗ absent  — advisory opencode models will skip (non-blocking)" >&2
  echo "  (Advisory failures are recorded as advisory_failures and never block — the loop still" >&2
  echo "   certifies on Opus + GPT-5.5. Pre-login both for the full panel you chose.)" >&2
fi
echo "───────────────────────────────────────────────────────────────────" >&2

DRAIN_CMD="cd '$DEV' && AGENT_ID='panel-drain-corpus' bash '$LOOP' --worklist ${PASS[*]:-}"

if [ "$HERE" -eq 1 ]; then
  echo "• running drain HERE (foreground): $DRAIN_CMD" >&2
  exec bash -c "$DRAIN_CMD"
fi

# 3. spawn the visible Ghostty tab running the drain (raw-command 'shell' mode)
if [ -x "$SPAWN" ] || [ -f "$SPAWN" ]; then
  echo "• spawning visible Ghostty tab for the drain…" >&2
  bash "$SPAWN" --model shell --project "$DEV" --title "panel-drain" --purpose "$DRAIN_CMD" \
    || { echo "  ! Ghostty spawn failed. Run this in a visible terminal yourself:" >&2; echo "      $DRAIN_CMD" >&2; exit 70; }
  echo "  ✓ drain launched in a Ghostty tab. Watch it there; steer via loop-steering.json (pause_after_current)." >&2
else
  echo "• spawn-ghostty-tab.sh not found. Run this in a visible terminal:" >&2
  echo "    $DRAIN_CMD" >&2
fi
