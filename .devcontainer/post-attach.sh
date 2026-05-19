#!/usr/bin/env bash
# Skill Graph devcontainer — post-attach
#
# Runs EVERY time a user attaches to the container (terminal open, VS Code
# reload, Codespace resume). Goal: surface the "try this first" entry points
# so a new visitor doesn't have to grep the README to find out what to type.

cat <<'EOF'

  ╭──────────────────────────────────────────────────────────────────────╮
  │                                                                      │
  │   Skill Graph Codespace — ready                                      │
  │                                                                      │
  │   Try first:                                                         │
  │     skill-graph doctor              # run every deterministic check  │
  │     skill-graph lint examples/fixture-skills/minimal-capability      │
  │     skill-graph route "audit my skills for schema conformance"       │
  │                                                                      │
  │   Author your first skill in 30 minutes:                             │
  │     docs/QUICKSTART-30MIN.md                                         │
  │                                                                      │
  │   Understand the model first:                                        │
  │     docs/PRIMER.md                                                   │
  │                                                                      │
  │   Where Skill Graph fits in the agent-skills ecosystem:              │
  │     docs/positioning.md                                              │
  │                                                                      │
  ╰──────────────────────────────────────────────────────────────────────╯

EOF
