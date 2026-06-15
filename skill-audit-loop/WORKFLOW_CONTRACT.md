# Skill Audit Loop Workflow Contract

> Type: SYSTEM contract.
> Purpose: connect the human-readable Skill Audit Loop docs to the ADRs, BDD
> scenarios, prompts, skills, scripts, metrics, and display format agents must
> use before they claim, edit, evaluate, or delegate audit work.

This document is the orientation layer agents were missing. The Skill Audit
Loop already explains the desired workflow, and the scripts already enforce
parts of it. This contract tells an agent what each workflow is evaluating,
which metric applies, which evidence is sufficient, and where the executable
BDD scenarios live.

The machine-readable packet is
[`AGENT_CONTEXT.yaml`](./AGENT_CONTEXT.yaml). It wires the mission, vision,
goal, rules, required docs, BDD suites, and execution scripts into one bounded
manifest so scripts and delegators can validate the same context bundle agents
are expected to read.

## Connected Chain

Agents must not enter the Skill Audit Loop with only a prompt and scripts. The
correct chain is:

| Layer | Role |
|---|---|
| Prompt | Names the current task and stop conditions. |
| Agent context manifest | Binds mission, vision, goal, rules, docs, BDD suites, and scripts into one checked packet. |
| Skills | Teach the agent how to reason in the relevant domain. |
| ADRs | Explain decisions already made, tradeoffs, and what not to relitigate. |
| BDD scenarios | Show concrete Given/When/Then examples of expected gate behavior. |
| Scripts | Verify that the current filesystem matches the contract. |
| Artifacts | Preserve the evidence trail, scorecard, findings, receipts, and residual risk. |

When these layers disagree, precedence is: schema/scripts for deterministic
facts, ADRs for recorded architecture decisions, Skill Audit Loop docs for
workflow doctrine, prompts for the current execution envelope, and run artifacts
for what happened in this run.

## What Are We Evaluating?

Different audit surfaces need different measurements. Do not use one score for
everything.

| Surface | Question | Metric | Evidence | Display |
|---|---|---|---|---|
| Structural Integrity | Is the skill/protocol record valid enough to load, route, and export? | Binary pass/fail with diagnostics. | `skill-lint.js`, schema checks, relation target checks, export checks. | Error/warning count plus exact failing rule. |
| Truth | Are the skill's source claims still true? | `truth_verdict` roll-up: `PASS`, `DRIFT`, `BROKEN`, `UNVERIFIED` (canonical enum — `docs/verdict-semantics.md`); the per-script `drift_status` carries the finer `STALE` / `NO_BASELINE` / `EXTERNAL_UNHASHED` signals that roll up into it. | `skill-graph-drift.js`, source-truth catalog, direct file/source reads. | Claim table with source, status, evidence strength. |
| Routing | Does the right skill activate for the right prompt, and avoid wrong co-routing? | Recall/coverage for asserted examples and anti-examples; top-1/top-3 where available. | `skill-graph-routing-eval.js`, routing config checks. | Prompt, expected skill, actual skill, pass/fail. |
| Comprehension | Can an agent restate the concept and boundaries, and does the skill improve behavior on realistic tasks? | Rubric score and verdict over comprehension dimensions, backed by a comparative behavior verdict versus baseline. | `evals/comprehension.json` plus grader receipt; representative generator/frontier judge receipts. | Dimension score table; baseline-vs-with-skill result, verdict, ceiling reason, failed case IDs. |
| Workflow Integrity | Did the agent follow the correct entry sequence and state transitions? | BDD pass/fail over required context, claim/release, artifact shape, and receipt honesty. | `audits/workflow-conformance/spec.yaml` and its runner. | Scenario ID, rule, entrypoint, missing reference or passed assertion. |
| Artifact Honesty | Do verdicts claim only what artifacts prove? | Binary pass/fail over receipt existence and verdict eligibility. | `check-audit-manifest.js`, run-dir inspection. | Verdict field, claimed value, required artifact, actual artifact. |
| Merge Quality | Did the curator preserve valuable work from every contributor? | Ledger completeness: each contribution is kept, rejected, superseded, or deferred with evidence. | Merge ledger, proposal files, review files, anti-loss checks. | One row per contribution with disposition and evidence. |

## Lifecycle Step Contract

The Skill Audit Loop lifecycle has two `Evaluate` moments, so the BDD suite
names them separately as `Evaluate baseline` and `Evaluate candidate`. Agents
must be able to answer the row's question before moving to the next step.

| Step | BDD question | Metric | Required evidence | Forbidden claim or mutation |
|---|---|---|---|---|
| Read | Does the agent know what this skill currently claims before touching it? | Pass/fail over required source reads. | `SKILL.md`, `audit-state.json`, eval files when present, related skills, truth-source pointers. | No mutation, no finding, no status change without cited source evidence. |
| Verify | Are current claims true and structurally valid? | Deterministic pass/fail plus truth status. | `skill-lint.js`, schema validation, `skill-graph-drift.js`, `source-truth-catalog.js`, direct repo/source reads. | No instructional edits; no behavior verdict stamped from structural checks. |
| Evaluate baseline | What behavior evidence already exists before changing the skill? | Receipt-backed baseline or explicit `UNVERIFIED`. | Prior sidecar verdict, `evals/comprehension.json`, evaluator receipt/history when present. | No positive behavior verdict without an evaluator receipt. |
| Research | What should the skill teach now? | Evidence strength and source coverage. | Official sources for drift-prone claims, repo reads, related-skill comparison, `research.md`. | No unverified web claim, no deletion from displacement analysis alone. |
| Improve | What candidate change is worth testing? | Candidate diff scoped to one chosen field or proposal. | Candidate `SKILL.md`/proposal, finding link, rationale, `last_changed` only when recorded by the loop. | No broad rewrite without evidence; no changing canonical content as final before Grade. |
| Use | Can the candidate be applied to the intended task shape? | Eval-path execution or documented guardrail use. | Candidate skill loaded in the evaluator path, task transcript or fixture, scorecard row. | No "works" claim from merely reading the candidate. |
| Evaluate candidate | Did the candidate help, regress, prove redundant, or remain inconclusive? | Same metric as baseline: comparative receipt and failure IDs. | Baseline-vs-candidate scores, failed case IDs, ceiling reason, grader receipt. | No treating missing, invalid, or capped evals as a regression or proof of improvement. |
| Grade | What durable state is allowed now? | Keep/revert/defer decision plus verdict eligibility. | Verdict/scorecard, merge ledger when applicable, eval receipts, path-limited diff, manifest/status readback. | No verdict beyond receipts; no dropped findings; no apply-on-revert. |

## Metric Selection Rules

Use deterministic pass/fail metrics for facts the filesystem can prove:
schema shape, sidecar shape, relation target existence, prompt pointer
discipline, artifact existence, run-dir shape, and public export parity.

Use status enums for state that can be true in several ways:
truth-source drift, sidecar verdicts, stale review windows, and behavior states
that must remain explicitly unverified until a receipt exists.

Use rubric scores only for judged behavior or qualitative review:
comprehension, teaching efficacy, and final completion
evaluation.

Use comparative metrics for behavior claims:
baseline versus with-skill, previous candidate versus improved candidate,
frontier judge agreement, and no-lift ceiling reasons. Do not stamp a positive
behavior certification from self-assessment, a same-family single-model run, a
missing eval artifact, or an inconclusive run.

## BDD Locations

| BDD suite | Purpose | Runner |
|---|---|---|
| `audits/gate-conformance/spec.yaml` | Per-skill protocol and gate behavior: schema, sidecar, drift, comprehension-eval shape, verdict/artifact honesty. | `scripts/__tests__/test-gate-conformance.js` |
| `audits/workflow-conformance/spec.yaml` | Agent entrypoint behavior: required context chain, lifecycle step contracts, metric definitions, ADR/BDD integration, workflow command orientation. | `scripts/__tests__/test-workflow-conformance.js` |

BDD is not a replacement for the Behavior Gate. It is the executable examples
that keep agents from misunderstanding which gate they are in and what evidence
that gate is allowed to claim.

## Workflow Context Matrix

| Workflow | Required ADRs | Required BDD | Required skills | Required scripts |
|---|---|---|---|---|
| `/audit` report-only Integrity Gate | ADR-0011, ADR-0019 | Gate conformance; workflow conformance | `skill-infrastructure`, `evaluation`, `testing-strategy` | `skill-lint.js`, `skill-graph-drift.js`, `source-truth-catalog.js`, `check-audit-manifest.js` |
| `/evaluate` behavior grading | ADR-0011, ADR-0019, ADR-0022 | Gate conformance comprehension-eval scenarios; workflow conformance | `evaluation`, `testing-strategy`, `skill-infrastructure` | `check-audit-manifest.js`, evaluator runner |
| `/improve` keep-or-revert loop | ADR-0011, ADR-0021 | Workflow conformance; gate conformance verdict honesty | `evaluation`, `testing-strategy`, `skill-infrastructure` | `skill-lint.js --skill`, `check-version-earned.js`, evaluator runner |
| `/merge` multi-model union curate | ADR-0021, ADR-0022 | Workflow conformance merge context; gate conformance verdict honesty | `evaluation`, `skill-infrastructure`, `epistemic-grounding` | `skill-audit-claim.js contributions`, merge ledger checks, evaluator runner |
| `/discover` skill admission | ADR-0017, ADR-0020, ADR-0019 | Workflow conformance discovery context; gate conformance structural scenarios | `taxonomy-design`, `skill-scaffold`, `skill-infrastructure`, `testing-strategy` | `skill-keyword-matrix.js`, `skill-discovery-loop.js`, `skill-auto-create.js`, `skill-lint.js` |
| Panel supervisor | ADR-0021, ADR-0022 | Workflow conformance panel context; gate conformance verdict honesty | `evaluation`, `skill-infrastructure`, `epistemic-grounding` | `run-panel-loop.sh`, panel preflight/progress tests, evaluator runner |

Read only the row relevant to the workflow. Do not load every ADR or every BDD
scenario for every task.

## Display Standard

Every audit report, scorecard, or final workflow summary should show the
measurement surface explicitly:

| Dimension | Metric | Threshold or enum | Evidence | Decision | Residual risk |
|---|---|---|---|---|---|

Use this shape because it prevents the common failure: tests pass, but nobody
knows what the tests measured. For Skill Audit Loop work, always preserve all
findings. Ordering by severity is allowed; hiding findings is not.

## Agent Start Rule

Before claiming or mutating work, an agent must:

1. Read the prompt for the current entrypoint.
2. Read `skill-audit-loop/AGENT_CONTEXT.yaml`.
3. Read this workflow contract.
4. Read the ADRs named by the workflow context matrix row.
5. Inspect the BDD suites named by that row.
6. Load the relevant skills named by that row.
7. Run the scripts named by the prompt and row.

If the agent cannot identify the metric and evidence for the workflow it is
about to run, it must stop before editing. That is a workflow comprehension
failure, not a skill-content finding.
