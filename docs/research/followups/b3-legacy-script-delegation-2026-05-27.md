# Audit B3 / H3 / M13 — Legacy script delegation closure

Date: 2026-05-27
Status: Cross-repo follow-up — workspace edit required, not landable in this skill-graph branch.

## Why this is here and not landed

The audit at `docs/audits/system-audit-2026-05-27.md` finding **B3** (with **H3**, **M13** as companions) requires editing files in the workspace tree at `~/Development/scripts/skill/`:

- `~/Development/scripts/skill/evaluate-skill.js` (2,254 lines) — runs independent pre-v7/v8 logic; needs to become a delegator on canonical `~/Development/skill-graph/lib/audit/evaluate-skill.js`.
- `~/Development/scripts/skill/skill-lint.js` (656 lines) — retains 14 deprecated check functions removed from canonical (572 lines); needs to delegate to `~/Development/skill-graph/scripts/skill-lint.js`.
- `~/Development/scripts/skill/evaluate-skill.js:30-42` — hardcoded monorepo log paths (`agent-orchestration/logs/comprehension-history.jsonl`, `eval-history.jsonl`); needs to defer to `lib/audit/log-paths.js` env-var override (M13).

The audit-remediation-2026-05-27 branch is scoped to the `skill-graph` repository. Edits to `~/Development/scripts/skill/**` live in a different git repository (the workspace at `~/Development/`, on `master`) which had ~20 unrelated dirty files at audit time. Mixing those edits into this branch would (a) reach across repos and (b) co-mingle with WIP that was not coordinated with the audit work.

## The closure work, ready to apply on workspace master

Apply these on the workspace `master` branch in `~/Development/`.

### 1. `~/Development/scripts/skill/evaluate-skill.js` → delegator

Replace the 2,254-line body with:

```js
#!/usr/bin/env node
'use strict';

// Workspace-side delegator. Canonical lives at
// ~/Development/skill-graph/lib/audit/evaluate-skill.js.
//
// Closure of ADR 0009 + audit B3 / M13 (2026-05-27). The previous body
// was 2,254 lines of pre-v7/v8 evaluator logic that bypassed verdict
// write-back and hardcoded monorepo log paths. Replaced with a thin
// pass-through so workspace callers and the canonical CLI converge.
//
// To delete the delegator entirely on the next minor:
//   - Update every workspace reference to call
//     `node skill-graph/lib/audit/evaluate-skill.js` directly.
//   - Delete this file. Git history preserves the legacy body.

const path = require('path');
const canonical = path.resolve(
  __dirname,
  '..', '..', 'skill-graph', 'lib', 'audit', 'evaluate-skill.js'
);

// Ensure log paths resolve to the workspace agent-orchestration tree by
// default. The canonical lib/audit/log-paths.js honors these env vars.
process.env.SKILL_GRAPH_EVAL_HISTORY_LOG ||= path.resolve(
  __dirname, '..', '..', 'agent-orchestration', 'logs', 'eval-history.jsonl'
);
process.env.SKILL_GRAPH_COMPREHENSION_HISTORY_LOG ||= path.resolve(
  __dirname, '..', '..', 'agent-orchestration', 'logs', 'comprehension-history.jsonl'
);

require(canonical);
```

### 2. `~/Development/scripts/skill/skill-lint.js` → delegator

Replace the 656-line body with:

```js
#!/usr/bin/env node
'use strict';

// Workspace-side delegator. Canonical lives at
// ~/Development/skill-graph/scripts/skill-lint.js.
//
// Closure of ADR 0009 + audit H3 (2026-05-27). The previous body
// included 14 deprecated check functions that were removed from
// canonical (~1,250 lines retired in the "reduce skill-lint to
// external-mandate-only" cleanup). This delegator keeps every
// workspace caller (slash commands, hooks, ad-hoc invocations)
// converging on the canonical 5-check enforcement.
//
// To delete this delegator on the next minor: re-point every workspace
// caller at `node skill-graph/scripts/skill-lint.js` and remove this file.

const path = require('path');
const canonical = path.resolve(
  __dirname, '..', '..', 'skill-graph', 'scripts', 'skill-lint.js'
);
require(canonical);
```

### 3. Verification after applying

```bash
# Canonical paths still pass (no regression):
cd ~/Development/skill-graph
node scripts/skill-lint.js --include-template
node lib/audit/evaluate-skill.js --help 2>&1 | head -3

# Legacy paths now delegate (same behavior):
cd ~/Development
node scripts/skill/skill-lint.js --include-template
node scripts/skill/evaluate-skill.js --help 2>&1 | head -3

# Check log paths flow:
node -e "process.env.SKILL_GRAPH_EVAL_HISTORY_LOG=''; require('./scripts/skill/evaluate-skill.js')" 2>&1 | head -3
```

The legacy paths must produce **byte-for-byte identical** output for any read-only invocation (`--help`, `--validate`, `--lint`), and any write invocation must land in the same target file the canonical script would have written.

### 4. Workspace commit guidance

Two clean commits per AGENTS.md "one logical change per commit":

```
chore(scripts/skill): convert evaluate-skill.js to delegator (ADR 0009 closure)
chore(scripts/skill): convert skill-lint.js to delegator (ADR 0009 closure)
```

Stage by name, not `-A`, to avoid sweeping the unrelated WIP files in the dirty workspace tree.

## Why split this from the in-skill-graph fixes

The audit-remediation-2026-05-27 branch in `~/Development/skill-graph` carries every fix that lives inside the skill-graph repository (commits per finding). B3 / H3 / M13 are the only audit P0/P1 items that legitimately need a cross-repo coordinated edit, and the audit explicitly classifies the legacy tree as the "deeper half" of the ADR 0009 closure that remained unfinished after the root-level wrapper was canonicalized in commit 342a67f.
