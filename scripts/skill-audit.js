#!/usr/bin/env node
/**
 * Skill Audit Runner — thin shim.
 *
 * The canonical implementation lives at `lib/audit/skill-audit.js`, where the
 * audit runtime is bundled with `@skill-graph/cli` and called by
 * `bin/skill-graph.js audit`. This script preserves the `node scripts/skill-audit.js`
 * entrypoint historically referenced by `AGENTS.md`, `CONTRIBUTING.md`,
 * `README.md`, `CHANGELOG.md`, `audits/`, ADR-0007, and the marketplace
 * eval-grading notes — and delegates to the canonical module so the two
 * surfaces cannot drift apart.
 *
 * Drift incident (2026-05-25): the two copies had diverged across 28 lines
 * (lint-script lookup, `--dry-run` flag, default grader CLI, workspace-root
 * naming, shim-relative requires). This shim removes the dual-source-of-truth
 * by making the canonical the only source. See the 2026-05-25 multi-model
 * restructure-review F5 finding and AGENTS.md § Internal `lib/` layout.
 */

'use strict';

require('../lib/audit/skill-audit.js');
