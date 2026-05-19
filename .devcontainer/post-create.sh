#!/usr/bin/env bash
# Skill Graph devcontainer — post-create
#
# Runs ONCE the first time the Codespace / container is created.
# Goal: bring the workspace to "skill-graph commands work without setup."

set -euo pipefail

echo "[skill-graph devcontainer] post-create starting"

# Sanity: we expect Node 20+ from the base image. Fail loud if not.
node_major=$(node -p 'process.versions.node.split(".")[0]')
if [ "${node_major}" -lt 20 ]; then
  echo "[skill-graph devcontainer] FATAL: Node ${node_major} detected; this repo requires Node >=20."
  echo "                          The base image should provide it — check .devcontainer/devcontainer.json."
  exit 1
fi
echo "[skill-graph devcontainer] Node $(node --version) — OK (>=20)"

# The repo has zero npm dependencies (verified by checking package.json), but
# running `npm install` is still useful: it materialises package-lock.json
# semantics, prints any engine warnings up front, and pre-warms the cache for
# any later `npm install -g` commands.
echo "[skill-graph devcontainer] npm install (no dependencies expected)"
npm install --no-audit --no-fund

# Link the CLI globally so `skill-graph` resolves anywhere in the container.
# This makes the demo experience match the installed-from-npm experience:
#   skill-graph doctor
#   skill-graph lint examples/fixture-skills/minimal-capability
#   skill-graph route "audit my skills for schema conformance"
echo "[skill-graph devcontainer] npm link (exposes 'skill-graph' globally)"
npm link

# Verify the link took.
if ! command -v skill-graph >/dev/null 2>&1; then
  echo "[skill-graph devcontainer] WARN: 'skill-graph' is not on PATH after npm link."
  echo "                          Fall back to: node bin/skill-graph.js <subcommand>"
else
  echo "[skill-graph devcontainer] skill-graph is available globally — try: skill-graph doctor"
fi

# Smoke-check the toolchain by running the doctor subcommand. Non-fatal: we
# never want post-create to fail the Codespace start just because one check
# reports a pre-existing canonical-library issue.
echo "[skill-graph devcontainer] smoke-test: skill-graph doctor"
node bin/skill-graph.js doctor || echo "[skill-graph devcontainer] doctor reported issue(s) — see output above. Codespace still ready."

echo "[skill-graph devcontainer] post-create complete"
