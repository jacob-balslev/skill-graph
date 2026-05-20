# Skill Audit Loop

A skill is a contract about a subject. The contract is only true while the things it was written against still hold — the codebase drifts, the subject drifts, and the audit fingerprint in the skill's own frontmatter drifts with them. The Skill Audit Loop re-grounds a skill against current truth and records the result on the skill itself.

This loop has one shape:

```
read  →  fix  →  test  →  next
```

That's it. One field at a time, keep or revert based on a single measurable signal, then move on. The discipline comes from Karpathy's auto-improvement loop: one editable asset, one scalar metric, one time box. The "read before changing" framing comes from Design Thinking. The structure here is the cheapest expression of both.

## Audit Doctrine — Intent and Teaching, Not Arbitrary Lint

The loop exists to answer one question about each skill: **does it still teach an agent to do the thing it claims to teach?** Every operation and verdict below serves that question. We evaluate each skill on two axes:

1. **Intent fidelity** — does the skill's content deliver what its `description` / `scope` / routing contract promises? A skill whose body has drifted from its own stated purpose fails here, even if every path it cites still resolves.
2. **Teaching efficacy** — does the skill actually change and improve an agent's behavior on the topic? This is the real quality signal. A skill that is structurally perfect but teaches nothing — or teaches it badly — is a weak skill. Under the four-verdict Health Block (schema v7, [ADR 0011](docs/adr/0011-split-audit-verdict-into-four-verdicts.md)), `application_verdict` is where this is certified against real artifacts.

The audit is **not a lint-test factory.** We do not invent arbitrary internal structural checks to manufacture findings, and an empty findings report on a genuinely good skill is a **PASS** — not a failure to find work. `lint_verdict` / `structural_verdict` cover form, schema validity, and external marketplace mandates only — a **floor the skill must clear**, never the target it aims at. Passing lint says the skill is well-formed; it says nothing about whether the skill teaches well.

### Two Gates, One Quality Claim

The loop has two gates. They must not be blended into one PASS/FAIL label:

| Gate | What it proves | Evidence | Health fields |
|---|---|---|---|
| **Integrity Gate** | The skill is structurally valid, grounded, routable, and export-safe. | Deterministic CI-safe checks: schema/frontmatter, manifest, links, export shape, relation targets, routing assertions, overlap, and drift. | `structural_verdict`, `truth_verdict`, `lint_verdict`, `drift_status` |
| **Behavior Gate** | The skill changes agent behavior in the way it claims. | Behavioral evals against realistic positives, hard negatives, prior failures, and boundary cases. | `comprehension_verdict`, `application_verdict`, `eval_score`, `eval_failed_ids` |

The Integrity Gate is required before release because broken metadata poisons the graph. It never certifies skill usefulness. The Behavior Gate is what certifies teaching efficacy; a skill with `application_verdict: UNVERIFIED` is honest, but it is not yet proven useful. A skill is audit-complete only when the Integrity Gate passes and the Behavior Gate is either passed or explicitly left `UNVERIFIED` / `NA` with evidence explaining why behavioral certification was not run.

## The Four Operations

Every action in this loop falls into one of four operations. Each writes to a specific set of flat fields in the Skill Metadata Protocol v7 (see `schemas/skill.v7.schema.json`).

| Operation | What it does | Mutates skill? | Writes which fields |
|---|---|---|---|
| **audit** | Read every field, check freshness and validity against repo truth, score the graded gates when `--graded`. | No | `last_audited`, `structural_verdict`, `truth_verdict`, `comprehension_verdict` (`--graded`), `application_verdict` (`--graded`); retains the per-script `lint_verdict` + `drift_status` they roll up from |
| **improve** | Edit one field. One commit. Time-boxed. | Yes | the chosen field + `last_changed` |
| **evaluate** | Run the eval suite (deterministic + comprehension/application graders) against the skill. | No | `eval_score`, `eval_failed_ids`, `freshness`; `comprehension_verdict` / `application_verdict` when those graders run |
| **evolve** | Loop over the corpus: `audit → improve → evaluate`, prioritised by `application_verdict` then skill-graph centrality + staleness. | Yes (per skill) | all of the above, per skill |

This replaces the previous 13-command surface. The mapping:

| Old command | New |
|---|---|
| `audit:audit-skill` | `audit` |
| `audit:domain-audit` | `audit --source-first` |
| `audit:bidirectional-audit` | `audit --fix-code-too` |
| `audit:deep-repo-audit` | `audit --scope repo` |
| `audit:workspace-audit` | `audit --scope workspace` |
| `audit:improve-skill` | `improve` |
| `audit:auto-improve` | `improve --mode <adapter>` |
| `audit:skill-fix` | `improve --lens <skill>` |
| `audit:evaluate-skill` | `evaluate` |
| `audit:improve-eval` | DELETED (was byte-equivalent duplicate of `evaluate-skill`) |
| `audit:skill-evolution` | `evolve` |
| `audit:skill-discovery` | retained — creates new skills, separate concern |
| `audit:feedback` | moved to `design:feedback` — visual loop, not skill audit |

## The Health Block — state lives on the skill

Schema v7 carries the Health fields on every SKILL.md frontmatter. v7 removed the single v6 `audit_verdict` and replaced it with **four discrete verdicts**, one per audit layer, because the aggregate masqueraded as a quality signal while conflating form, truth, comprehension, and behavior (see [ADR 0011](docs/adr/0011-split-audit-verdict-into-four-verdicts.md) and [`docs/migrations/v6-to-v7.md`](docs/migrations/v6-to-v7.md)):

```yaml
schema_version: 7
last_audited: 2026-05-17       # date `audit` last ran
last_changed: 2026-05-15       # date the skill body or frontmatter was last edited
structural_verdict: PASS       # PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED — form/export shape (external mandates only)
truth_verdict: PASS            # PASS | DRIFT | BROKEN | UNVERIFIED — truth sources vs declared hashes
comprehension_verdict: UNVERIFIED # PASS | SHALLOW | REDUNDANT | UNVERIFIED | SKIPPED_BASELINE_HIGH | NA (gate 8, demoted)
application_verdict: UNVERIFIED # APPLICABLE | REDUNDANT | HARMFUL | MIXED | FALSE_POSITIVE | UNVERIFIED (gate 9 — the quality signal)
eval_score: 4.2                # 0.0–5.0 from the eval runner
eval_failed_ids: []            # empty when clean
lint_verdict: PASS             # retained per-script signal; rolls up into structural_verdict
drift_status: OK               # retained per-script signal; rolls up into truth_verdict — OK | DRIFT | BROKEN | STALE | NO_BASELINE | EXTERNAL_UNHASHED | UNKNOWN
```

`application_verdict == APPLICABLE` is the only verdict that certifies a skill is **useful**; the other three are necessary infrastructure (the skill loads, exports cleanly, and the model has the concept) but do not certify usefulness. The honest default across the migrated corpus is `application_verdict: UNVERIFIED` until a gate-9 application eval has actually run.

Before v6, this state was scattered across `eval-history.jsonl`, `routing-misses.jsonl`, `.opencode/progress/skill-audit-*`, `health-ledger.jsonl`, and `findings/*.md`. To know one skill's audit status you grepped five places. The Health Block collapses that to one frontmatter block. The loop reads it; the operations write it back.

The same skill's body still gets `audits/<skill-name>/findings.md` and `verdict.md` when an audit produces longer-form output, but those files are evidence, not state. The state of truth is the Health Block.

## The Inner Pipeline of `audit`

The five-phase shape survives, but it lives entirely inside the `audit` operation as its internal pipeline, and each phase now writes a layer-scoped verdict instead of one aggregate. Users see one `audit` command. Internally:

1. **Integrity Gate — structural** (always) — `skill-lint.js` runs canonical-source validation and related deterministic checks. Writes `lint_verdict`, which rolls up into `structural_verdict`. Only external-format or canonical-source violations set `structural_verdict: FAIL`; internal style preferences are warnings only and never fail the verdict.
2. **Integrity Gate — truth** (always) — `skill-graph-drift.js` checks declared `grounding.truth_sources`. Writes `drift_status`, which rolls up into `truth_verdict` (`OK → PASS`, `DRIFT → DRIFT`, `BROKEN → BROKEN`, else `UNVERIFIED`).
3. **Behavior Gate — comprehension** (only under `--graded`, gate 8, demoted) — runs the comprehension grader. Writes `comprehension_verdict`. `SKIPPED_BASELINE_HIGH` is the expected verdict for a concept the foundation model already knows.
4. **Behavior Gate — application** (only under `--graded` and when an application eval exists, gate 9) — checks whether loading the skill changes agent behavior on real artifacts. Writes `application_verdict` — the real quality signal.
5. **Stamp** — writes `last_audited` to today's ISO date.

This is deterministic plumbing. The user runs `audit <skill>`; the internal pipeline does its work; the four verdicts plus the retained `lint_verdict`/`drift_status` signals record the result in the frontmatter.

## The Inner Pipeline of `evaluate`

`evaluate` runs the eval suite the skill declares (typically `evals/<skill>.json` plus the optional `evals/comprehension.json`). It writes:

- `eval_score` — aggregate 0.0–5.0 across all evals run
- `eval_failed_ids` — list of failed case IDs, empty when clean
- `freshness` — today's ISO date

When `evals/comprehension.json` exists, the comprehension grader (`evaluate-skill.js --mode comprehension`) runs against the five flat Understanding fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) — or against the legacy `concept.*` block for v5 skills not yet migrated — and writes `comprehension_verdict`. When an `evals/application.json` exists, the application grader (`evaluate-skill.js --mode application`) checks behavior change on real artifacts and writes `application_verdict`, the loop's primary quality signal.

## The Inner Pipeline of `improve`

`improve` is the only operation that mutates the skill. Karpathy discipline applies absolutely:

1. **One field, one commit.** The operator (or the loop) chooses one stale or failing field. `improve --field mental_model <skill>` edits exactly that field.
2. **Time-boxed.** Default 20 minutes per field. Beyond that, abort and re-queue.
3. **Auto-test after.** `improve` immediately calls `evaluate` and checks the metric for the targeted field.
4. **Keep or revert.** If `eval_score` did not improve (or regressed below an allowed threshold), the commit is reverted automatically. The loop records the failed attempt and moves to the next field.
5. **Stamp** — writes `last_changed` to today's ISO date.

`improve` has three modes:

| Mode | What it does | When to use |
|---|---|---|
| (default) | Edit a field of this skill's own SKILL.md | The most common case |
| `--mode <adapter>` | Run an auto-improve adapter (prompt-evolution, design-candidate-discovery, perf, docs) against this skill | When the change pattern is well-known |
| `--lens <other-skill>` | Apply another skill as an audit lens against this skill and fix the violations | Cross-skill consistency work — formerly `audit:skill-fix` |

## The Inner Pipeline of `evolve`

`evolve` is a thin for-loop over the four operations:

```
for skill in priority_order(application_verdict first, then skill-graph centrality + staleness):
  audit(skill)
  if structural_verdict in {FAIL, PASS_WITH_FIXES}
     or truth_verdict in {DRIFT, BROKEN}
     or application_verdict in {UNVERIFIED, REDUNDANT, HARMFUL, MIXED}:
    if understanding_field_targetable:
      improve(skill, field=understanding_field)   # one v7 Understanding field
  evaluate(skill)
  write Health Block fields back
```

`understanding_field` is selected by `understandingField()` in
`scripts/skill/skill-evolution-loop.js` (monorepo runner; the skill-graph
copy is `lib/audit/skill-evolution-loop.js`) — empty/missing field wins
outright, otherwise shortest populated value among `description`,
`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`. The
stalest Health date field stays in the trace as a staleness signal
but is not what gets passed to the improver's HARD SCOPE.

Priority reads the Health Block directly: the walker looks at `application_verdict` first — skills with `application_verdict: UNVERIFIED` and high routing centrality get priority for application-eval authoring — then falls back to `last_audited` ascending for ties. No telemetry crawl, no log aggregation.

## Loop Principles

1. **One skill, one field, one metric at a time.** Karpathy keep-or-revert pressure makes the loop tractable.
2. **State lives in the artifact.** The Health Block is the source of truth; logs are append-only evidence.
3. **Read before changing.** `audit` must run before `improve` is allowed to write.
4. **Deterministic checks first; graded checks second.** Lint and drift are mechanical and trustworthy; graded scores are subject to model variance.
5. **Fixes are tiny by default.** A field-sized change is the unit of work. Larger changes are decomposed into a sequence of field-sized improves.

## Loop Inputs

1. `SKILL.md` (frontmatter is read; Health Block is read first)
2. `evals/<skill>.json` and optional `evals/comprehension.json`
3. The truth sources declared in `grounding.truth_sources`
4. `skills.manifest.json` (generated by `skill-graph`)
5. Skill-graph priority order from `skill-graph-builder.js`

## Loop Outputs

Two kinds. The Health Block (state) and the audit artifacts (evidence):

**Health Block** — written back into the skill's own frontmatter. This is the state.

**Audit artifacts** — under `audits/<skill-name>/`:

```text
audits/<skill-name>/
    findings.md     ← human-readable narrative of issues found
    verdict.md      ← short rationale and fix/defer record
    scorecard.md    ← per-dimension scores when --graded ran
```

These remain append-only evidence files for any audit run that needs long-form output. The skill's Health Block lets a reader skip them entirely if all they need is the verdict.

## Quick start

```bash
# Audit a single skill (seed/run, stub or graded mode)
node bin/skill-graph.js audit <skill-name>

# Audit with graded dimensions (requires a grader CLI)
node bin/skill-graph.js audit <skill-name> --graded --grader-cli "<command>"

# Lint a skill (deterministic phase that feeds structural_verdict)
node bin/skill-graph.js lint <skill-name>

# Drift sentinel — check or record truth-source hashes (feeds truth_verdict)
node bin/skill-graph.js drift

# Evaluate a skill (writes eval_score, eval_failed_ids, and the graded verdicts)
node lib/audit/evaluate-skill.js --mode comprehension skills/<skill-name>/evals/comprehension.json
node lib/audit/evaluate-skill.js --mode application --application skills/<skill-name>

# Evolve the corpus — audit, improve, evaluate in priority order
# (PREVIEW · monorepo-only; depends on parent-repo scripts — see SH-6138)
node bin/skill-graph.js evolve --top 10

# Show the Health Block for a skill at a glance
node lib/audit/skill-status.js <skill-name>
```

## Cadence

| Cadence | Action |
|---|---|
| Every change | Deterministic `audit` runs in lint as part of CI |
| Daily | `evolve --top 5` walks the five stalest skills |
| Weekly | `audit --graded` for skills with `last_audited` older than 7 days and `category` in the high-centrality set |
| Before release | `evolve --scope all` |

## Non-Goals

The loop does not require a separate issue tracker, dashboard, control plane, or proprietary quality rubric. Markdown reader + JSON Schema validator + the four operations is the full stack. Adopters can layer monitoring or queue management on top, but the loop itself stays minimal.

## Related Specs

- `docs/skill-metadata-protocol.md` — the canonical field list including the v7 Health Block and flat Understanding fields
- `schemas/skill.v7.schema.json` — the machine-validated current contract (`schemas/skill.v6.schema.json` and earlier are pinned prior versions)
- `docs/migrations/v6-to-v7.md` — the `audit_verdict` → four-verdict split; `docs/migrations/v5-to-v6.md` — concept block flattening + Health Block introduction
- `SKILL_AUDIT_CHECKLIST.md` — the per-skill checklist used during `audit`
- `docs/adr/0011-split-audit-verdict-into-four-verdicts.md` — rationale for the four-verdict model
