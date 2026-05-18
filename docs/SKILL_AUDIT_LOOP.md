# Skill Audit Loop

A skill is a contract about a subject. The contract is only true while the things it was written against still hold — the codebase drifts, the subject drifts, and the audit fingerprint in the skill's own frontmatter drifts with them. The Skill Audit Loop re-grounds a skill against current truth and records the result on the skill itself.

This loop has one shape:

```
read  →  fix  →  test  →  next
```

That's it. One field at a time, keep or revert based on a single measurable signal, then move on. The discipline comes from Karpathy's auto-improvement loop: one editable asset, one scalar metric, one time box. The "read before changing" framing comes from Design Thinking. The structure here is the cheapest expression of both.

## The Four Operations

Every action in this loop falls into one of four operations. Each writes to a specific set of flat fields in the Skill Metadata Protocol v6 (see `skill-metadata-protocol/schemas/skill.v6.schema.json`).

| Operation | What it does | Mutates skill? | Writes which fields |
|---|---|---|---|
| **audit** | Read every field, check freshness and validity against repo truth, score the seven graded dimensions when `--graded`. | No | `last_audited`, `audit_verdict`, `lint_verdict`, `drift_status` |
| **improve** | Edit one field. One commit. Time-boxed. | Yes | the chosen field + `last_changed` |
| **evaluate** | Run the eval suite (deterministic + comprehension grader) against the skill. | No | `eval_score`, `eval_failed_ids`, `freshness` |
| **evolve** | Loop over the corpus: `audit → improve → evaluate`, prioritised by skill-graph centrality + staleness. | Yes (per skill) | all of the above, per skill |

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

Schema v6 adds seven flat Health fields to every SKILL.md frontmatter:

```yaml
last_audited: 2026-05-17       # date `audit` last ran
last_changed: 2026-05-15       # date the skill body or frontmatter was last edited
audit_verdict: PASS_WITH_FIXES # aggregate of lint + drift + graded dimensions
eval_score: 4.2                # 0.0–5.0 from the eval runner
eval_failed_ids: []            # empty when clean
lint_verdict: PASS             # deterministic-lint result
drift_status: OK               # OK | DRIFT | BROKEN | STALE | NO_BASELINE | EXTERNAL_UNHASHED | UNKNOWN
```

Before v6, this state was scattered across `eval-history.jsonl`, `routing-misses.jsonl`, `.opencode/progress/skill-audit-*`, `health-ledger.jsonl`, and `findings/*.md`. To know one skill's audit status you grepped five places. v6 collapses that to one frontmatter block. The loop reads it; the operations write it back.

The same skill's body still gets `audits/<skill-name>/findings.md` and `verdict.md` when an audit produces longer-form output, but those files are evidence, not state. The state of truth is the Health Block.

## The Inner Pipeline of `audit`

The previous five-phase shape (Deterministic → Graded → Aggregate → Fix-or-defer → Re-verify) survives, but it lives entirely inside the `audit` operation as its internal pipeline. Users no longer see five phases — they see one `audit` command. Internally:

1. **Deterministic** (always) — `skill-lint.js` runs schema validation, relation-target existence, eval coherence, archetype section presence, routing quality. Writes `lint_verdict`.
2. **Graded** (only under `--graded`) — fans out seven per-dimension prompts (metadata, activation, relation, grounding, content, eval, portability) to the grader CLI.
3. **Aggregate** — combines the dimension verdicts. Any `FAIL` dominates; otherwise any `PASS_WITH_FIXES` dominates; otherwise `PASS`. Writes `audit_verdict`.
4. **Drift check** — `skill-graph-drift.js` against declared `grounding.truth_sources`. Writes `drift_status`.
5. **Stamp** — writes `last_audited` to today's ISO date.

This is deterministic plumbing. The user runs `audit <skill>`; the internal pipeline does its work; the frontmatter records the result.

## The Inner Pipeline of `evaluate`

`evaluate` runs the eval suite the skill declares (typically `evals/<skill>.json` plus the optional `evals/comprehension.json`). It writes:

- `eval_score` — aggregate 0.0–5.0 across all evals run
- `eval_failed_ids` — list of failed case IDs, empty when clean
- `freshness` — today's ISO date

When `evals/comprehension.json` exists, the comprehension grader runs against the five flat Understanding fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) — or against the legacy `concept.*` block for v5 skills not yet migrated.

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
for skill in priority_order(skill-graph centrality + staleness):
  audit(skill)
  if audit_verdict in {FAIL, PASS_WITH_FIXES} and understanding_field_targetable:
    improve(skill, field=understanding_field)   # one v6 Understanding field
  evaluate(skill)
  write Health Block fields back
```

`understanding_field` is selected by `understandingField()` in
`scripts/skill/skill-evolution-loop.js` — empty/missing field wins
outright, otherwise shortest populated value among `description`,
`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`. The
stalest Health date field stays in the trace as a staleness signal
but is not what gets passed to the improver's HARD SCOPE.

Priority is read directly from the Health Block — `last_audited` ascending tells the loop which skill to pick next. No telemetry crawl, no log aggregation.

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
# Audit a single skill
node src/skill-audit.js <skill-name>

# Audit with graded dimensions
node src/skill-audit.js <skill-name> --graded

# Improve one field (auto-tests + keeps or reverts)
node src/skill-improve.js <skill-name> --field mental_model

# Evaluate a skill (writes eval_score and eval_failed_ids)
node src/evaluate-skill.js <skill-name>

# Evolve the corpus — audit, improve, evaluate each in priority order
node src/skill-evolve.js --top 10

# Show the Health Block for a skill at a glance
node src/skill-status.js <skill-name>
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

- `skill-metadata-protocol/docs/skill-metadata-protocol.md` — the canonical field list including the v6 Health Block and flat Understanding fields
- `skill-metadata-protocol/schemas/skill.v6.schema.json` — the machine-validated contract
- `skill-metadata-protocol/docs/migrations/v5-to-v6.md` — concept block flattening + Health Block introduction
- `SKILL_AUDIT_CHECKLIST.md` — the per-skill checklist used during `audit`
