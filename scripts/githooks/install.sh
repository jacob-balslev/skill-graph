#!/usr/bin/env bash
#
# install.sh — Point this repo's git hooks at the tracked scripts/githooks/ directory.
#
# Activates the skill-graph repo work-mode separation warning for every CLI that commits in
# this repo (git enforces hooks, so Claude Code / OpenCode / Codex / plain `git` all honor it).
#
# Safe to run repeatedly. To uninstall:  git config --unset core.hooksPath

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
HOOKS_DIR="$REPO_ROOT/scripts/githooks"

chmod +x "$HOOKS_DIR/pre-commit"
git -C "$REPO_ROOT" config core.hooksPath scripts/githooks

echo "Installed: core.hooksPath -> scripts/githooks"
echo "Active hooks:"
ls -1 "$HOOKS_DIR" | grep -v -E '\.(sh|md)$' | sed 's/^/  /'
echo ""
echo "The skill-graph work-mode separation warning is now active for all CLIs committing in this repo."
echo "Uninstall with: git config --unset core.hooksPath"
