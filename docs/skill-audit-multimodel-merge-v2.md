# Multi-Model Skill Audit, v2: Attribution + Diversity-Aware Merge

> Type: Reference (protocol)
> Status: v2 (2026-05-24). Additive extension of [v1 (2026-05-21)](./skill-audit-multimodel-merge.md). v1 callers keep working.
> Companion: [model-contribution-benchmarks.md](./model-contribution-benchmarks.md) (measurement spec).
> Source roundtable: `<workspace>/.roundtable/skill-audit-2026-05-24/` (brief + responses from GPT-5.5 and Gemini 3.1 Pro + retrospective on 05-19).

## Why v2 exists

v1 codified the union-curate anti-loss rule (every valuable contribution is preserved; nothing is rejected silently). That rule is correct and stays in v2. v1 nevertheless has three measured gaps:

1. **Representational collapse.** Empirical work on 3-agent panels (arXiv 2604.03809, 2026) shows cosine similarity 0.888 and effective rank 2.17 of 3.0. v1's 2026-05-19 session looked similar: only 1 of 10 load-bearing findings was uniquely surfaced by a single respondent (GPT-5.5's runner-drift catch), and Opus's research-derived contributions were invisible to the panel.
2. **Curator self-bias.** v1 mandates "Opus 4.7 or GPT-5.4" as curator. Self-preference and family bias are measurable (arXiv 2410.21819 v2, arXiv 2504.03846). Both 05-24 respondents (GPT-5.5 and Gemini 3.1 Pro) independently called for curator rotation.
3. **Attribution is prose, not data.** v1's merge ledger records "kept / rejected / reason" but cannot answer "did model M contribute distinct signal" without a human re-reading every entry.

v2 closes those three gaps without breaking v1.

## What changed from v1

| Aspect | v1 (2026-05-21) | v2 (2026-05-24) |
|---|---|---|
| Roles | Auditor + Curator | Auditor + Curator + **Dissenter** (new) |
| Curator eligibility | "Opus 4.7 or GPT-5.4" (fixed identity) | Capability floor + **rotation policy**; curator and dissenter must be from different model families on critical sessions |
| Auditor output | Single proposal (full SKILL.md + scorecard) | **Two-channel**: structured proposal (as v1) + unconstrained **novelty memo** (max 10 claims, each evidence-backed) |
| Dissent | Implicit ("disagreement is welcome") | **Required**: evidence-backed dissent or abstain with reason |
| Merge ledger fields | source / kept-merged-rejected / reason | + `finding_id`, `evidence_strength`, `claim_type`, `curator_action_latency`, `format_loss`, `absence_signal`, `reopen_trigger` (see §5) |
| Attribution | (none) | Impact × marginality score per finding per model (see §7) |
| Replication | One audit per model per skill | Two audits per model per skill on benchmark sessions (Rating Roulette, arXiv 2510.27106) |
| Trajectories | Not captured | Captured when the auditor CLI exposes them; mandatory for Agent System / Technical Capability skills (Gemini), optional for Design / UX |
| Inter-rater reliability | Not computed | Krippendorff's α reported per session (target ≥ 0.5 acceptable, ≥ 0.8 strong) |

All v1 fields and phases continue to work. v2 fields are additive.

## Roles

| Role | Eligibility | Does |
|---|---|---|
| **Auditor** | Any model, any CLI | Runs the v2.2 audit on one claimed skill. Writes structured proposal AND novelty memo. Does NOT commit to canonical SKILL.md. |
| **Convener** | Any frontier model. Rotates per session. | Writes the brief + source packet. Does NOT also curate the same session. |
| **Curator** | Frontier model with strong synthesis behavior. Rotates per session. Curator family MUST differ from convener family on critical sessions. | Reads current SKILL.md + all auditor proposals + dissenter notes. Produces union-merged upgrade. Records merge ledger. |
| **Dissenter** | Frontier model, different family from curator. Optional but recommended for critical sessions. | Reads curator's draft synthesis. Audits the rejected and downgraded items in the merge ledger. Files a one-page rebuttal or signs off. |

The "Curator: Opus 4.7 or GPT-5.4" line in v1 §Roles is **superseded**. Capability floor still applies; identity does not.

## Phases (v2)

```
claim
  → [per-model audit ×N → proposal + novelty memo]
  → union-curate merge (draft)
  → dissenter review (optional but recommended)
  → verify (keep-or-revert)
  → commit
  → advance
```

Two new substeps inside Phase B (curate):

**B.1 Two-channel intake.** The curator reads both channels per auditor:
- *Structured proposal* (same shape as v1: full SKILL.md + scorecard + comprehension JSON).
- *Novelty memo* (up to 10 claims, each with: claim text, evidence, "why this does not fit the structured rubric"). The memo is the channel where "your canonical runner is still delegating to a legacy body" can live without forcing it into a 5-point review-dimension score.

**B.2 Dissenter pass.** When the dissenter role is seated, after the curator publishes a draft synthesis but before commit, the dissenter reads the merge ledger and:
- Flags any rejected item where the dissenter judges the rejection-reason inadequate.
- Files a one-page rebuttal (writes to `<slug>.dissenter-rebuttal.md`).
- The curator either incorporates the rebuttal (updates merge ledger, re-emits synthesis) or records a counter-rationale.

Phase D (advance) adds: re-evaluate `reopen_trigger` rows on every advance and surface any whose trigger condition is now satisfied.

## Merge ledger schema v2

Each row in `<slug>.merge-ledger.md` carries the v1 fields plus seven new ones (from GPT-5.5's 2026-05-24 response, §Q2):

| Field | Type | Meaning |
|---|---|---|
| `finding_id` | string, stable | Synthesis-wide ID so the same claim across multiple proposals dedupes correctly. Format: `<session>.F<NNN>`. |
| `evidence_strength` | enum | `direct-file-line` / `command-output` / `external-source` / `inference` / `unsupported`. |
| `claim_type` | enum | `file` / `behavioral` / `relation` / `eval` / `displacement` (aligned with `docs/reference/skill-audit-pipeline.md` claim taxonomy). |
| `curator_action_latency` | enum | `immediate` / `after-rebuttal` / `after-external-verification`. |
| `format_loss` | bool | True if the model raised this as a novelty-memo item because it did not fit the structured rubric. Tracks the "too tight" failure mode. |
| `absence_signal` | array | List of model IDs that had a seat but did not surface this finding. (Subset of the panel minus `surfaced_by` and `corroborated_by`.) |
| `reopen_trigger` | object or null | `{ condition: <description>, revisit_after: <date> }` for rejected items that should be re-examined later. |

Plus the attribution fields from §7:
- `surfaced_by: <model_id>` (single model that first named the finding)
- `corroborated_by: [<model_id>...]` (models that named it independently)
- `accepted_by: [<model_id>...]` (models that accepted into synthesis without originating)
- `novelty_class`: `brief-divergent` / `brief-anchored` / `from-research`

## Two-channel output format

Each auditor emits:

```
.opencode/progress/skill-audits/<slug>.<model>.proposed-SKILL.md         # structured (as v1)
.opencode/progress/skill-audits/<slug>.<model>.proposed-comprehension.json
.opencode/progress/skill-audits/<slug>.<model>.scorecard.md
.opencode/progress/skill-audits/<slug>.<model>.novelty-memo.md           # NEW in v2
.opencode/progress/skill-audits/<slug>.<model>.trajectory.jsonl          # NEW in v2, optional
```

**Novelty memo template** (markdown):

```markdown
# Novelty memo, <model>, <skill>
> Max 10 claims. Each claim must be evidence-backed AND explain why it does not fit the structured rubric.

## Claim 1
- **Finding**: <one sentence>
- **Evidence**: <file:line / command output / external URL>
- **Why outside the rubric**: <one sentence>
- **Claim type**: file / behavioral / relation / eval / displacement
- **Evidence strength**: direct-file-line / command-output / external-source / inference / unsupported

(repeat up to 10)

## Brief-dissent block (REQUIRED unless abstain)
- **I disagree with the brief diagnosis on**: <specific claim from brief>
- **Reason**: <evidence-backed counter-argument>

If you cannot identify evidence-backed dissent: write "Abstain" and explain (e.g., "the brief diagnosis matched my own reasoning at every load-bearing point I checked"). Ceremonial dissent is worse than no dissent.
```

## Attribution methodology

Per GPT-5.5's 2026-05-24 §Q3, attribution is impact-weighted × marginality:

**Impact weights** (per finding):
- 3 points: protocol-breaking bug, schema change, rubric change
- 2 points: benchmark or workflow change
- 1 point: wording, docs, or prioritization improvement

**Marginality multiplier** (per model per finding):
- 1.0: first surfaced by this model (`surfaced_by`)
- 0.5: independently corroborated before synthesis (`corroborated_by`)
- 0.2: materially refined an existing finding (`accepted_by` with material change)
- 0.0: merely accepted or restated (`accepted_by` without material change)

**Per-model score** = Σ (impact × marginality) across all findings in the session.

**Per-model share** = score / sum-of-all-model-scores.

**Reported separately** (do not blend into the attribution share):
- Synthesis labor (curator time)
- Research labor (web search performed during synthesis, where the model was effectively a "researcher" role)
- Brief framing (the convener's pre-session diagnosis)

### Novelty hash (per Gemini's 2026-05-24 §Q3)

To prevent the convener's framing from defining novelty subjectively: a finding is `brief-divergent` only if its embedding distance from every chunk of the brief diagnosis exceeds threshold τ. Operationally:

- Chunk the brief diagnosis section into ~200-token windows.
- Embed the finding's claim text + evidence.
- If `min(cosine_distance(finding, brief_chunk)) > τ` for all chunks, classify as `brief-divergent`. Else `brief-anchored`.
- `τ` calibrated against the 05-19 oracle (see `model-contribution-benchmarks.md`). Target: `τ = 0.35` initial.

## Invariants

Preserved from v1:
- One skill per agent at a time (atomic claim).
- Auditors propose; only the curator commits the canonical skill.
- Every per-model proposal retained.
- Every non-merged contribution has a recorded reason.
- `next` never returns a Sales Hub / personal / customer-data skill.
- The merge always reads and preserves the current skill state as the baseline.

New in v2:
- Curator and convener of the same session must be different models.
- On critical sessions, curator and dissenter must be from different model families.
- Each auditor must emit a novelty memo with a brief-dissent block (or an abstain with reason).
- Curator action latency must be recorded per finding.
- Krippendorff's α reported in the session summary; α < 0.5 triggers an automatic dissenter pass even if the session was not flagged critical.

## Open questions for v3

1. **Trajectory schema.** When the auditor CLI is Codex or Gemini, tool-call trace formats differ. A normalized JSONL schema for trajectory capture should be standardized (defer to model-contribution-benchmarks.md §Trajectory schema).
2. **Per-finding self-consistency.** Should every finding be replicated by a second audit from the same model before counting as `surfaced_by`? Rating Roulette literature (arXiv 2510.27106) suggests yes; cost suggests selectively.
3. **Bias discount.** Gemini 3.1 Pro's 2026-05-24 §6 proposes that the curator applies a numerical discount to contributions from its own model family. v2 surfaces this as a measurement only; v3 may decide whether to enforce.
4. **Reopen cadence.** Default `revisit_after: +30 days`. Whether the walker (`scripts/skill/skill-evolution-loop.js`) auto-reopens or only flags is a v3 decision.

## Related

- v1 protocol: [skill-audit-multimodel-merge.md](./skill-audit-multimodel-merge.md)
- Benchmark spec: [model-contribution-benchmarks.md](./model-contribution-benchmarks.md)
- Sibling consensus protocol: `<workspace>/docs/consensus-review-protocol.md`
- Audit doctrine: [SKILL_AUDIT_LOOP.md](../SKILL_AUDIT_LOOP.md)
- Single-agent contract: `skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`
- Claim helper: `scripts/skill/skill-audit-claim.js`
- 2026-05-24 roundtable session: `<workspace>/.roundtable/skill-audit-2026-05-24/`
