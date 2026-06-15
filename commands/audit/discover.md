---
version: 1.0.0
since: 2026-03-23
status: active
superseded_by: null
last_changed: 2026-06-14
---

# /discover — Auto-Create Skills from Keyword Matrix

> Builds a keyword coverage matrix, discovers uncovered domains, and auto-creates new skills grounded in real code.
>
> Renamed from `/skill-discovery` to `/discover` (SH-6554, 2026-05-26) per the user-facing-commands rule: the active resolver is `discover.md`, the short form is `/discover`. Legacy `skill-discovery` name retained only in the migration table at the bottom of this file.

## Workflow context

Before running discovery through an agent, read
[`skill-audit-loop/WORKFLOW_CONTRACT.md`](../../../skill-graph/skill-audit-loop/WORKFLOW_CONTRACT.md)
and inspect both
[`audits/gate-conformance/spec.yaml`](../../../skill-graph/audits/gate-conformance/spec.yaml)
and
[`audits/workflow-conformance/spec.yaml`](../../../skill-graph/audits/workflow-conformance/spec.yaml).
Skill admission is evaluated by coverage metrics plus structural gate evidence:
a candidate is not ready just because the keyword matrix found a gap.

## Command surface

The `scripts/skill/*` snippets below are workspace-orchestration helpers. Run
them from `~/Development`, where those scripts exist. Standalone npm consumers
should use the bundled CLI surface for package-local work and skip the workspace
discovery helpers unless they have cloned the full Development workspace.

## Discovery Arguments

$ARGUMENTS — Optional flags: `--matrix-only`, `--discover-only`, `--max-creates N`, `--domain shared|sales-hub`, `--skip-eval`, `--auto`

## Protocol

### Phase 1: Keyword Matrix

Run the deterministic matrix builder:

```bash
node scripts/skill/skill-keyword-matrix.js --json --out scripts/discovery/keyword-matrix.json
```

This scans 4 sources:
1. **Routing config** — the existing keyword-to-skill mappings
2. **SKILL.md metadata** — keywords/triggers from the corpus
3. **Codebase domains** — lib/, components/, app/(main)/ directories, SQL views
4. **Linear issues** — task titles, labels (with `--include-linear`)

Present the summary:
- Total terms, covered/partial/uncovered counts
- Coverage percentage
- Multi-term uncovered clusters

If `--matrix-only`, stop here.

### Phase 2: Discover Candidates

Analyze uncovered clusters for viable skill candidates:

1. Filter to multi-term clusters with code evidence
2. Check rejection log (skip recently rejected candidates)
3. Classify each candidate as `create_new` or `extend_existing` based on the strongest non-generic nearby skill match, plus any curated extension-target overrides in `scripts/skill/skill-discovery-loop.js`
4. Score by: `terms.length * 2 + code_evidence.length`
5. Rank and display top candidates

Present candidates to the user. For each show:
- Name, keywords, code evidence, closest existing skills
- Whether it should be a new skill or extend an existing one, plus the target skill when extending

If `--discover-only`, stop here.

### Phase 3: Auto-Create

For each approved `create_new` candidate (max `--max-creates`, default 3):

```bash
node scripts/skill/skill-auto-create.js --candidate <name> --domain <domain>
```

The auto-create pipeline:
1. **Scaffold** — Create directory structure (deterministic)
2. **Populate** — Dispatch Sonnet to generate SKILL.md + evals grounded in real code
3. **Validate** — Check frontmatter, line count, eval count, path refs
4. **Evaluate** — A/B eval with GPT-5.4 grader (unless `--skip-eval`)
5. **Register** — Update routing config + commit

Unless `--auto`, ask for approval before each creation.

### Phase 4: Report

Record coverage metrics to `scripts/discovery/coverage-history.jsonl`.
Show coverage trend if history exists.

## Standalone Scripts

```bash
# Just the matrix
node scripts/skill/skill-keyword-matrix.js --summary

# Clusters only
node scripts/skill/skill-keyword-matrix.js --clusters

# Dry-run a candidate
node scripts/skill/skill-auto-create.js --candidate fx-rates --domain sales-hub --dry-run

# Full discovery loop
node scripts/skill/skill-discovery-loop.js --max-creates 3 --domain sales-hub

# Coverage report
node scripts/skill/skill-discovery-loop.js --report
```

## Key Files

| File | Purpose |
|------|---------|
| `scripts/skill/skill-keyword-matrix.js` | Keyword coverage matrix (zero AI) |
| `scripts/skill/skill-auto-create.js` | Auto-creation pipeline |
| `scripts/skill/skill-discovery-loop.js` | Continuous discovery loop |
| `scripts/discovery/keyword-matrix.json` | Latest matrix output |
| `scripts/discovery/creation-log.jsonl` | Creation/rejection history |
| `scripts/discovery/coverage-history.jsonl` | Coverage trend data |
