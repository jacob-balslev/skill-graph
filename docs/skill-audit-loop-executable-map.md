# Skill Audit Loop, Executable Map

> Type: Reference
> Purpose: connect the Skill Audit Loop doctrine to the actual scripts, files, verdict writers, skip rules, and known silent-failure gaps.
> Source of truth: [`../skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md) (doctrine), [`../../docs/reference/skill-audit-pipeline.md`](../../docs/reference/skill-audit-pipeline.md) (workspace execution reference), [`field-state-matrix.md`](./field-state-matrix.md) (field ownership).

## The loop in one sentence

The **Skill Audit Loop** is the umbrella lifecycle:

```text
Read → Verify → Evaluate → Research → Improve → Use → Evaluate → Grade
```

The lowercase `audit` operation is only the report-only **Verify** command inside that lifecycle. It stamps Integrity-Gate state, not behavior verdicts. The Karpathy-inspired part is the constrained keep-or-revert discipline: candidate changes are measured before canonical write-back, applied only on keep, and reverted only on genuine regression.

## The eight lifecycle steps

| Step | What happens | Main executable surface | Writes |
|---|---|---|---|
| **Read** | Load the skill, sidecar, evals, related skills, truth sources, prior audit receipts. | Human/agent reads; `source-truth-catalog.js` in workspace drains. | Run-dir evidence only. |
| **Verify** | Check structural validity, drift, grounding, routing boundaries, privacy, and upstream displacement. | `node bin/skill-graph.js audit <skill> [--graded]`; implementation `lib/audit/skill-audit.js`. | `audit-state.json`: `last_audited`, `lint_verdict`, `drift_status`, `structural_verdict`, `truth_verdict`; run-dir `findings.md` / `verdict.md` / `scorecard.md`. |
| **Evaluate** | Establish current behavior/baseline when eval artifacts exist. | `node bin/skill-graph.js evaluate --mode comprehension|application ...`; implementation `lib/audit/evaluate-skill.js`. | `eval_score`, `eval_failed_ids`, `freshness`, `comprehension_verdict` or `application_verdict`, `eval_last_run`. |
| **Research** | Gather repo and official/web evidence for the strongest current teaching. | Per-model prompts in `prompts/skill-audit-loop-improve-pass.md`; panel deps in `lib/audit/skill-audit-loop-live-deps.js`. | Proposal artifacts and novelty memos, not canonical `SKILL.md`. |
| **Improve** | Produce one candidate enrichment/fix, preserving useful knowledge. | `lib/audit/run-skill-audit-loop-lite.js` or `lib/audit/run-skill-audit-loop.js`; `skill-graph improve` for single-field edits. | Candidate `proposed-SKILL.md` / merged temp skill; canonical `SKILL.md` only later at Grade on keep. |
| **Use** | Load/apply the candidate skill in the same task/eval shape the skill claims to improve. | `lib/audit/run-bidirectional-eval.js` and application eval runner. | Eval receipt artifacts. |
| **Evaluate** | Measure candidate behavior under the same contract; invalid/capped/missing evals are inconclusive. | `runBidirectionalEval()` / `evaluate-skill.js`. | Eval receipts and, after keep, sidecar behavior verdicts. |
| **Grade** | Keep/apply, revert, or defer; stamp only what the evidence earned. | `decideKeepOrRevert()` plus `applyMerge()`; full-loop recording in `recordFullLoop()`. | On keep: canonical `SKILL.md`, `last_changed`, eligible behavior verdict receipts. On revert: no canonical body write and no candidate behavior stamp. |

## The four operations

| Operation | What it does | Edits the body? | Writes which fields |
|---|---|---|---|
| **audit** | Report-only Integrity pass: lint, drift, truth/source verification, optional qualitative scorecard. | No | `last_audited`, `lint_verdict`, `drift_status`, `structural_verdict`, `truth_verdict`. It does **not** stamp behavior verdicts. |
| **improve** | Edit one field or candidate, time-boxed, then evaluate. | Yes | The chosen field or candidate; `last_changed` only on accepted keep. |
| **evaluate** | Run comprehension/application eval suites. | No | `eval_score`, `eval_failed_ids`, `freshness`, `comprehension_verdict`, `application_verdict`, `eval_last_run` when the relevant grader runs. |
| **evolve** | Corpus walker: analyze, triage, execute, verify, checkpoint. | Yes, through `improve` | The same `SKILL.md` and `audit-state.json` writes as the operations/actions it composes. |

## `audit` inner pipeline

| # | Phase | Script | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|
| 1 | Structural lint | `lib/audit/skill-audit.js` invoking canonical lint routines | `audit-state.json` | `lint_verdict` -> `structural_verdict` | Always runs. Only external-format/canonical-source violations fail structural verdicts; internal style is advisory. |
| 2 | Truth / drift | `skill-graph-drift.js` through `skill-audit.js` | `audit-state.json`; run-dir evidence | `drift_status` -> `truth_verdict` | Always runs. Missing hashable truth sources produce explicit uncertainty, not a behavior verdict. |
| 3 | Qualitative scorecard (`--graded`) | `lib/audit/skill-audit.js` grader path | `findings.md`, `verdict.md`, `scorecard.md` | none beyond Integrity fields | Runs only with `--graded`; grades scorecard dimensions, not eval suites. |
| 4 | Stamp | `writeSidecarFields()` via `skill-audit.js` | `audit-state.json` | `last_audited`, structural/truth fields | Always runs on successful audit write-back. |

## `evaluate` inner pipeline

| # | Phase | Script | Files written | Verdict field | Skip condition |
|---|---|---|---|---|---|
| 1 | Comprehension grader | `node bin/skill-graph.js evaluate --mode comprehension <eval-file>` -> `lib/audit/evaluate-skill.js` | sidecar + eval receipt | `comprehension_verdict`, `eval_score`, `eval_failed_ids`, `freshness` | Requires `evals/comprehension.json`. Missing artifact is explicit `UNVERIFIED`, not success. |
| 2 | Application grader | `node bin/skill-graph.js evaluate --mode application --application <skill-dir> <eval-file>` -> `lib/audit/evaluate-skill.js` | sidecar + eval receipt | `application_verdict`, `eval_last_run`, `eval_score`, `eval_failed_ids`, `freshness` | Requires `evals/application.json`. `APPLICABLE` requires certifying cross-family evidence; otherwise positive results cap lower. |
| 3 | Write-back guard | `stampComprehensionVerdict()` / `stampApplicationVerdict()` | `audit-state.json` | relevant behavior verdict | Dry runs, unresolved skill paths, or all-errored runs do not stamp. |

## `improve` / panel pipeline

| # | Phase | Script | Files written | Keep/revert rule |
|---|---|---|---|---|
| 1 | Research + propose | `prompts/skill-audit-loop-improve-pass.md` through live deps | per-model proposal + novelty memo | Proposal only; no canonical mutation. |
| 2 | Cross-review / revise (panel) | `prompts/skill-audit-loop-cross-review-pass.md`, `prompts/skill-audit-loop-revise-pass.md` | revised proposals + review JSON | Mandatory frontier quorum and convergence required. |
| 3 | Curate | `curate()` in live deps; anti-loss validators in `run-skill-audit-loop-lite.js` / `run-skill-audit-loop.js` | merged candidate + merge ledger | Every contribution is kept or dropped with a wrong/redundant/harmful reason. |
| 4 | Use + evaluate candidate | `run-bidirectional-eval.js` | eval receipt | Missing/invalid/capped evals are inconclusive and do not cause revert. |
| 5 | Grade | `decideKeepOrRevert()` | on keep, canonical `SKILL.md`; on revert, no body write | Revert only `HARMFUL`, `FALSE_POSITIVE`, or a certifying-clean verdict measurably worse than the prior verdict. Flat/non-lift/UNVERIFIED is not a regression. A canonical active skill already stamped `HARMFUL` must be removed from the active corpus or replaced by a newly evaluated non-HARMFUL version. |
| 6 | Record full loop | `recordFullLoop()` in `run-skill-audit-loop.js` | Integrity sidecar fields and `model_run_coverage` always; behavior sidecar fields only after keep + receipt | Revert records an explicit finding and does not stamp candidate behavior onto unchanged canonical skill. Model coverage records participation/failure evidence, not quality certification. |

## `evolve` pipeline

`evolve` is not a literal `audit(); improve(); evaluate()` triple. The canonical engine is `lib/audit/skill-evolution-loop.js`:

```text
ANALYZE -> TRIAGE -> EXECUTE -> VERIFY -> CHECKPOINT
```

EXECUTE delegates to `improve` and `evaluate` where appropriate. Priority reads `application_verdict` first, then centrality and Audit Status staleness. The workspace fork of the old loop remains a compatibility surface until the documented fork-collapse work completes.

## Silent failure modes to watch

| Gap | Why it matters | Expected behavior |
|---|---|---|
| `audit --graded` overread as Behavior-Gate certification | The command writes qualitative scorecard artifacts, not `comprehension_verdict` / `application_verdict`. | Use `evaluate --mode comprehension|application` for behavior verdicts. |
| Self-assessment stamped as behavior verdict | A diagnostic audit can make a useful judgment, but it is not an eval receipt. | Put self-assessment in `verdict.md`; keep sidecar behavior `UNVERIFIED` unless `evaluate` ran. |
| Candidate applied before eval | Canonical source can inherit ungraded changes. | Panel/lite runners eval the candidate copy before `applyMerge()`. |
| Revert after non-lift | Delta-stripping removes useful curation because the eval was too narrow. | Revert only genuine regression. |
| Revert stamps candidate verdict | Sidecar would describe a body that was never applied. | On revert, record failed candidate artifact; do not stamp behavior verdicts. |
| Missing eval artifact treated as pass | The behavior gate silently disappears. | Record `UNVERIFIED` plus finding; absence is inconclusive, not certification. |
| Invalid/capped eval used for revert | Confidence cap becomes a false regression signal. | Invalid/capped runs defer or keep; never revert. |
| Advisory panel finding ignored by silence | Width is collected but not dispositioned. | Merge ledger must disposition every relied-on or surfaced contribution. |
| Detached/background panel run | A hung or killed runner can look successful. | Use foreground + heartbeat viewer + terminal marker; `--fail-on-stall` on monitor paths. |
| Baseline corpus lint hides new errors | Existing noise can mask the audited skill's regression. | Capture baseline; require focused skill clean and no baseline increase. |

## Artifact family

Per `lib/audit/run-layout.js` plus workspace claim helpers:

```text
skill-graph/skill-audit-loop/progress/skill-audits/
  _ledger.jsonl
  <skill>/
    runs/
      <YYYY-MM-DD>T<HHMM>--<op>--<model>--<run-id>/
        catalog.json
        research.md
        findings.md
        verdict.md
        scorecard.md
        merge-ledger.md
        novelty-memo.md
    history.jsonl
    latest -> runs/<newest-run-dir>
```

Completion is ledger-derived, not file-presence-derived. A run directory without a release record is evidence, not completion.

## Quick commands

```bash
# Report-only Integrity audit
node bin/skill-graph.js audit <skill-name>
node bin/skill-graph.js audit <skill-name> --graded --grader-cli "<command>"

# Behavior evaluation
node bin/skill-graph.js evaluate --mode comprehension skills/<skill-name>/evals/comprehension.json
node bin/skill-graph.js evaluate --mode application --application skills/<skill-name> skills/<skill-name>/evals/application.json

# Panel loop candidate improvement
node lib/audit/run-skill-audit-loop.js --skill <slug> --skill-dir ../skills/skills/<subject>/<slug> --cwd .

# Evolve corpus
node bin/skill-graph.js evolve --workspace-root <workspace> --skills-dir <workspace>/skills --top 10

# Show Audit Status for a skill
node lib/audit/skill-status.js <skill-name>
```

## Cadence

| Cadence | Action |
|---|---|
| Every change | Deterministic `audit` / lint as part of CI |
| Daily | `evolve --top 5` walks the stalest/highest-priority skills |
| Weekly | `audit --graded` for high-centrality skills with stale `last_audited`; `evaluate` only where eval artifacts exist |
| Before release | `evolve --workspace-root <workspace> --skills-dir <workspace>/skills --top <N>` plus focused behavior evals for release-critical skills |

## Related

- [`../skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md), binding doctrine and runbook
- [`../../docs/reference/skill-audit-pipeline.md`](../../docs/reference/skill-audit-pipeline.md), workspace execution reference
- [`field-state-matrix.md`](./field-state-matrix.md), which fields each operation owns
- [`verdict-semantics.md`](./verdict-semantics.md), behavior verdict semantics and confidence tiers
- [`skill-audit-multimodel-merge-v2.md`](./skill-audit-multimodel-merge-v2.md), multi-model union-merge protocol
