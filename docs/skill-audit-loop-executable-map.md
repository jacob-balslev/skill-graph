# Skill Audit Loop, Executable Map

> Type: Reference
> Purpose: connect each doctrine step in the Skill Audit Loop to the actual script that runs it, the files it touches, the verdict fields it writes, and the conditions under which it can be skipped. Surfaces ADR 0009 canonical-source drift visually.
> Source of truth: [../SKILL_AUDIT_LOOP.md](../SKILL_AUDIT_LOOP.md) (doctrine), [skill-audit-pipeline.md](../../docs/reference/skill-audit-pipeline.md) (pipeline reference), [field-state-matrix.md](./field-state-matrix.md) (which fields are loop-written).

## The loop in one sentence

The Skill Audit Loop is **Karpathy's auto-improvement loop** (one editable asset, one scalar metric, one time box, keep-or-revert based on a single measurable signal) applied to skill files, using **Design Thinking**'s "read before changing" framing as the prelude. It is NOT a migration system; the keep-or-revert metric gate is the load-bearing distinction. See [../SKILL_AUDIT_LOOP.md:11](../SKILL_AUDIT_LOOP.md).

## The four operations (outer layer)

| Operation | What it does | Edits the body? | Writes which fields |
|---|---|---|---|
| **audit** | Read every field, check freshness and validity against repo truth, score graded gates when `--graded`. | No (Health Block only) | `last_audited`, `structural_verdict`, `truth_verdict`, `comprehension_verdict` (`--graded`), `application_verdict` (`--graded`) |
| **improve** | Edit one field. One commit. Time-boxed. | Yes | The chosen field + `last_changed` |
| **evaluate** | Run the eval suite (deterministic + comprehension/application graders). | No (eval/Health Block only) | `eval_score`, `eval_failed_ids`, `freshness`; `comprehension_verdict` / `application_verdict` when those graders run |
| **evolve** | For-loop over the corpus: `audit → improve → evaluate`, prioritised by `application_verdict` then graph centrality + staleness. | Yes (per skill) | All of the above, per skill |

The Karpathy keep-or-revert gate applies in `improve`: if `eval_score` does not improve (or regresses below threshold), the commit is reverted automatically. The loop records the failed attempt and moves to the next field. See [../SKILL_AUDIT_LOOP.md:120-137](../SKILL_AUDIT_LOOP.md).

## The audit pipeline (inner layer of `audit`)

Five phases. Each writes a layer-scoped verdict instead of one aggregate (post-ADR 0011).

| # | Phase | Classification | Script (canonical) | Script (root, legacy) | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|---|---|
| 1 | Structural lint | form / external-mandate | `skill-graph/scripts/skill-lint.js` (245 lines, strict schema gate) | `scripts/skill/skill-lint.js` (560 lines, legacy v6, accepts compatibility values) | Stamps `lint_verdict` on SKILL.md frontmatter | `lint_verdict` → rolled up into `structural_verdict` | Always runs. Only external-mandate violations (Anthropic Agent Skills marketplace shape, required fields, valid YAML) produce `FAIL`. Internal style preferences are warnings only. |
| 2 | Truth / drift | infrastructure | `skill-graph/scripts/skill-graph-drift.js` | `scripts/skill/skill-evolution-loop.js:281-320` (drift logic) | Stamps `drift_status` on SKILL.md; updates `drift_check.truth_source_hashes` when `--record --apply` is passed | `drift_status` → rolled up into `truth_verdict` | Always runs. Skips per-skill check when `grounding.truth_sources` is absent (the skill has nothing to drift). |
| 3 | Comprehension grader (gate 8) | recitation | `skill-graph/lib/audit/evaluate-skill.js --mode comprehension` | `scripts/skill/evaluate-skill.js --mode comprehension` (still owns the body per ADR 0009 incomplete deprecation) | Run artifacts under `.opencode/progress/skill-audits/<skill>/runs/<run-dir>/scorecard.md` | `comprehension_verdict` | Runs only under `--graded` AND when `evals/comprehension.json` exists. Demoted in v7: never alone certifies a skill. `SKIPPED_BASELINE_HIGH` is the expected verdict for concepts the foundation model already knows. |
| 4 | Application grader (gate 9) | behavior | `skill-graph/lib/audit/evaluate-skill.js --mode application` (entry point only; `--application` body still delegates to root per SH-6198) | `scripts/skill/evaluate-skill.js --application` (still owns the body) | Run artifacts under `.opencode/progress/skill-audits/<skill>/runs/<run-dir>/scorecard.md` | `application_verdict` (the primary quality signal) | Runs only under `--graded` AND when `evals/application.json` exists. Currently 1 of 481 skills in the corpus has an application.json (`_archived/financial-domain-fundamentals`), so this gate effectively never runs in v7 yet. |
| 5 | Stamp | infrastructure | `scripts/skill/skill-audit-claim.js release` (writes terminal ledger line + verdicts) | n/a | Appends to `.opencode/progress/skill-audits/_ledger.jsonl`, updates `latest` symlink, stamps `last_audited` on SKILL.md | `last_audited` | Always runs at the end of a non-aborted audit. |

## ADR 0009 drift visible

Both columns "Script (canonical)" and "Script (root, legacy)" should converge to one column. Currently they don't.

- Per ADR 0009 (sibling-repo deprecation), `skill-graph/` is the canonical implementation post-2026-05-18.
- The root copies under `scripts/skill/` are legacy; SH-6198 tracks their deletion or delegation.
- The `--application` entry point was canonicalized in commit `342a67f`, but the body still delegates to root. See `skill-graph/audits/prompts/skill-audit-loop-single-model.md` Step 6 notes.
- When the audit pipeline writes to a Health Block field, **verify which script wrote it** (root vs skill-graph): the legacy root script can still produce non-canonical verdicts.

This duplication is a canonical/version-control issue, not a naming or teachability problem. The intervention is finishing ADR 0009, not renaming.

## The improve pipeline (inner layer of `improve`)

The only operation that mutates the skill body. Karpathy keep-or-revert discipline applies absolutely.

| # | Phase | Classification | Script | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|---|
| 1 | Pick one field | infrastructure | `scripts/skill/skill-evolution-loop.js::understandingField()` selects the empty/missing field; otherwise shortest populated value among `description`, `mental_model`, `purpose`, `boundary`, `analogy`, `misconception` | n/a (in-memory selection) | n/a | Time-boxed: default 20 minutes per field. Beyond that, abort and re-queue. |
| 2 | Edit the field | behavior | Manual edit OR `--mode <adapter>` (prompt-evolution / design-candidate-discovery / perf / docs) OR `--lens <other-skill>` (apply another skill as audit lens) | SKILL.md (the chosen field only) | `last_changed` | One field, one commit. Larger changes decomposed into a sequence of field-sized improves. |
| 3 | Auto-test | behavior | `scripts/skill/evaluate-skill.js` (legacy) / `skill-graph/lib/audit/evaluate-skill.js` (canonical entry) | Eval run artifacts under `.opencode/progress/skill-audits/<skill>/runs/<run-dir>/` | `eval_score`, `eval_failed_ids` | Always runs after edit. |
| 4 | Keep or revert | behavior | `scripts/skill/skill-evolution-loop.js:568-596` | git revert when `eval_score` regresses | n/a | Always evaluated. Failure recorded in run history; loop moves to next field. |
| 5 | Stamp | infrastructure | n/a (stamped on edit) | SKILL.md | `last_changed` | Always runs. |

## The evaluate pipeline (inner layer of `evaluate`)

Runs the eval suite declared by the skill. Does NOT mutate body content.

| # | Phase | Classification | Script | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|---|
| 1 | Deterministic evals | recitation | `evaluate-skill.js` runs `evals/<skill>.json` cases | Eval scorecard under run dir | `eval_score` (aggregate 0.0-5.0), `eval_failed_ids` | Runs when `evals/<skill>.json` exists. Skipped silently when absent. |
| 2 | Comprehension grader | recitation | `evaluate-skill.js --mode comprehension` against `evals/comprehension.json` | Comprehension scorecard | `comprehension_verdict` | Runs when `evals/comprehension.json` exists AND `--graded` is set. |
| 3 | Application grader | behavior | `evaluate-skill.js --mode application` against `evals/application.json` | Application scorecard | `application_verdict` | Runs when `evals/application.json` exists AND `--graded` is set. |
| 4 | Stamp | infrastructure | n/a | SKILL.md | `freshness` (today's ISO date) | Always runs at end of evaluate. |

## The evolve pipeline (inner layer of `evolve`)

A thin for-loop over the four operations, priority-ordered by `application_verdict` first, then skill-graph centrality + staleness.

```
for skill in priority_order(application_verdict first, then graph centrality + last_audited):
  audit(skill)
  if structural_verdict in {FAIL, PASS_WITH_FIXES}
     or truth_verdict in {DRIFT, BROKEN}
     or application_verdict in {UNVERIFIED, REDUNDANT, HARMFUL, MIXED}:
    if understanding_field_targetable:
      improve(skill, field=understanding_field)
  evaluate(skill)
  write Health Block fields back
```

Source: [../SKILL_AUDIT_LOOP.md:138-162](../SKILL_AUDIT_LOOP.md).

**Documented vs implemented divergence (open):** the documented evolve pseudocode branches on structural / truth / comprehension / application failures, but the root impl at `scripts/skill/skill-evolution-loop.js:495-512` only calls `improve` for structural failures or `PASS_WITH_FIXES`. Truth / comprehension / application failures are routed to separate repair paths and not auto-fixed in `evolve`. This is a doctrine-vs-impl gap to track.

## The artifact family (where things land)

Per `scripts/skill/skill-audit-paths.js` (the single source of truth for run-dir layout).

```
.opencode/progress/skill-audits/
  _ledger.jsonl                          ← append-only global run record
  _orphaned/<skill>/                      ← quarantined when skill no longer exists
  <skill>/
    runs/
      <YYYY-MM-DD>T<HHMM>--<op>--<model>--<run-id>/
        catalog.json     ← source-truth catalog (gate 2 input)
        research.md      ← repo + external research notes
        findings.md      ← human-readable narrative of issues found
        verdict.md       ← short rationale and fix/defer record
        scorecard.md     ← per-dimension scores when --graded ran
        _source.json     ← provenance (migrated runs only)
    history.jsonl                         ← append-only per-skill run record
    latest -> runs/<newest-run-dir>       ← symlink to most recent run
```

Completion is **ledger-derived, not file-presence-derived.** `build-skill-audit-worklist.js` reads `_ledger.jsonl` (via `skill-audit-ledger.js::summarizeAll()`) to compute each skill's status. The legacy "scorecard.md exists → completed" heuristic is retained only as a fallback for un-migrated artifacts.

## Lanes (partitioned, attributable dispatch)

From `audits/lanes.json` (schema: `schemas/skill-audit-lanes.schema.json`) — project-canonical per [ADR-0016](adr/0016-operational-data-ownership.md); migrated from the legacy workspace `.opencode/skill-audit-lanes.json` path.

| Lane | Bands | Op | minTier | Max concurrency |
|---|---|---|---|---|
| `critical-audit` | critical | audit (graded) | high (opus / gpt-5.5 / gemini-3.1-pro) | 2 |
| `high-audit` | high | audit (graded) | mid (sonnet / gpt-5.4) | 3 |
| `bulk-audit` | medium, low | audit | cheap (haiku / gemini-flash / minimax / nemotron) | 4 |
| `improve` | critical, high | improve | mid | 3 |
| `bulk-evaluate` | medium, low | evaluate | cheap | 4 |
| `merge` | all | merge | high | 1 |

The `claim` helper enforces `tierRank(MODEL) >= minTier` and refuses past `maxConcurrency`. Every run is attributable to **actual-model + agent + lane + date**. Stale claims are auto-reaped past their model TTL on `next` / `claim`.

## The version-earned gate

`scripts/skill/check-version-earned.js` mechanically enforces `.claude/rules/version-schema-contract.md`.

| Phase | Classification | Script | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|
| Detect version bump | infrastructure | `check-version-earned.js:201-214` | n/a (read-only) | n/a | Fires only when target `schema_version` or `skill_graph_protocol` > previous. |
| Verify v6 content present | form | `check-version-earned.js:139-154` | n/a | n/a | Skipped when not bumping to v6+. |
| Verify v7 content present | form | `check-version-earned.js:178-185` | n/a | n/a | Skipped when not bumping to v7. v7 inherits v6 requirements. |
| Block commit on miss | external-mandate | `check-version-earned.js:221-290` (nonzero exit) | n/a | n/a | Fail-open on infrastructure errors (gate intentionally errs on allowing commits when state cannot be inspected). |

Activate as a git pre-commit hook with `bash scripts/githooks/install.sh`. Failure mode: hand-bumping a label without the content present.

## Critical-band rule (multi-model required)

Skills in the **critical** importance band (worklist `importanceBand: critical`: high graph centrality, primary routing role, broad reuse) **must** go through the multi-model merge pass (≥2 model AUDIT proposals + Opus/GPT-5.4 curator MERGE per `.opencode/commands/skill-audit-merge-v1.md` and v2 at `skill-audit-multimodel-merge-v2.md`), not a single-model audit.

Empirical justification: the agent-control audit (2026-05-22) showed a single Opus pass certifying drift as "verified accurate" was wrong; only the multi-model union surfaced that the WARNING threshold emits no event (stderr only). One model's verification is one model's blind spot.

Single-model audits remain acceptable for low-centrality skills where a verification miss has limited blast radius.

## Silent failure modes (where the loop can pass while skipping a layer)

1. **A clean lint verdict can be mistaken for a useful skill.** Doctrine rejects this interpretation, but the root linter can still write a passing `lint_verdict` while internal findings remain non-fatal at `scripts/skill/skill-lint.js:33-40` and `scripts/skill/skill-lint.js:490-510`.
2. **A stub audit can complete without proving behavior.** `skill-graph/lib/audit/skill-audit.js:431-502` creates a verdict with Behavior Gate `UNVERIFIED` and human TODOs. Honest, but easy to overread as "audited."
3. **Behavior remains `UNVERIFIED` and still satisfies audit-complete** if it is explicit and evidenced. Doctrinally intentional at [../SKILL_AUDIT_LOOP.md:23-32](../SKILL_AUDIT_LOOP.md), but it is also a skip path if reviewers do not inspect the evidence.
4. **The version-earned gate fail-opens when repository inspection is unavailable** (`scripts/skill/check-version-earned.js:35-40`).
5. **Claim ownership checks fail open when git metadata is unavailable** (`scripts/skill/skill-audit-claim.js:158-159`, `:173-174`).
6. **Baseline corpus lint errors are allowed during single-skill preflight.** Per `skill-graph/audits/prompts/skill-audit-loop-single-model.md:51-72`, baseline failures should not stop the run. If the baseline is not captured, new failures can hide in old noise.
7. **Application certification depends on calibration**, but the code path can still stamp a verdict receipt. The grader says results are advisory until calibrated and should not stamp `APPLICABLE` without a receipt at `skill-graph/lib/audit/graders/application-comparative-grader-prompt.md:77-83`; the evaluator writes `application_verdict` and `eval_last_run` when a mode result is available at `skill-graph/lib/audit/evaluate-skill.js:1442-1508`.
8. **Completion is ledger-derived**, so artifacts without release can look like progress but not count.
9. **Export blocks only structural failure, not behavior uncertainty.** Marketplace export at `skill-graph/scripts/export-marketplace-skills.js:314-324` blocks `structural_verdict: FAIL`; behavior `UNVERIFIED` is a quality risk rather than a hard export blocker.
10. **Metadata is stripped during export.** Per [../SKILL_METADATA_PROTOCOL.md:47-48](../SKILL_METADATA_PROTOCOL.md), export-provenance fields are stripped; Health and Understanding fields are stripped per `skill-graph/scripts/export-skill.js:80-100`. Correct for distribution but exported artifacts cannot be treated as audit-preserving source.

## Quick commands

```bash
# Audit a single skill (stub or graded)
node bin/skill-graph.js audit <skill-name>
node bin/skill-graph.js audit <skill-name> --graded --grader-cli "<command>"

# Lint a skill (canonical, feeds structural_verdict)
node bin/skill-graph.js lint <skill-name>

# Drift sentinel (feeds truth_verdict)
node bin/skill-graph.js drift

# Evaluate a skill (writes eval_score + graded verdicts)
node lib/audit/evaluate-skill.js --mode comprehension skills/<skill-name>/evals/comprehension.json
node lib/audit/evaluate-skill.js --mode application --application skills/<skill-name> skills/<skill-name>/evals/application.json

# Evolve corpus (audit → improve → evaluate in priority order)
node bin/skill-graph.js evolve --workspace-root <workspace> --skills-dir <workspace>/skills --top 10

# Show Health Block for a skill at a glance
node lib/audit/skill-status.js <skill-name>
```

## Cadence

| Cadence | Action |
|---|---|
| Every change | Deterministic `audit` runs in lint as part of CI |
| Daily | `evolve --top 5` walks the five stalest skills |
| Weekly | `audit --graded` for skills with `last_audited` older than 7 days and `category` in the high-centrality set |
| Before release | `evolve --workspace-root <workspace> --skills-dir <workspace>/skills --top <N>` |

## Related

- [../SKILL_AUDIT_LOOP.md](../SKILL_AUDIT_LOOP.md), the doctrine (the why)
- [../../docs/reference/skill-audit-pipeline.md](../../docs/reference/skill-audit-pipeline.md), the pipeline reference (the what at corpus level)
- [field-state-matrix.md](./field-state-matrix.md), which fields each script writes
- [AUTHORING-QUICKSTART.md](./AUTHORING-QUICKSTART.md), the author's view
- [adr/0009-sibling-repo-deprecation.md](./adr/0009-sibling-repo-deprecation.md), why `skill-graph/` is canonical
- [adr/0011-split-audit-verdict-into-four-verdicts.md](./adr/0011-split-audit-verdict-into-four-verdicts.md), why four verdicts instead of one
- [adr/0014-canonical-only-schema-files.md](./adr/0014-canonical-only-schema-files.md), why prior schema versions live in git history only
- `skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`, the active per-skill execution contract (project-owned per ADR 0015; moved 2026-05-25)
- `.opencode/commands/skill-audit-loop.md`, the queue wrapper
- `skill-graph/audits/prompts/skill-audit-loop-single-model.md`, the cross-CLI per-skill prompt (v3)
- `skill-audit-multimodel-merge-v2.md`, the multi-model union-merge protocol
