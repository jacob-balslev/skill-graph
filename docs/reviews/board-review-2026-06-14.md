# Board Review — Skill Graph

**Model:** big-pickle (OpenCode)
**Date:** 2026-06-14
**Type:** board
**Workshop mode:** system-improvements
**Analysis-only (no edits):** This report edits no schema, script, SKILL.md, or per-skill artifact.

---

## 1. Overall Assessment — Grade B+ | Score 78/100

The Skill Graph project has built a remarkably coherent protocol and toolchain foundation. 181 skills, all lint-clean, 5/5 system checks green, 7/7 gate-conformance scenarios passing, 22 ADRs covering every major architectural decision, a clean v8 schema that the project explicitly frames as "the product" while treating corpus migration as honest backlog — these are not small achievements. The SYSTEM layer (schemas, scripts, docs, CI gates) is mature for a v0.5 project.

The weakness is on the CONTENT side. 0 APPLICABLE out of 181, 167 UNVERIFIED on the application verdict, 154 unanswered comprehension verdicts, only 2 dual-run-graded skills. The philosophy is correct (eval as guardrail, not optimizer) but the guardrail has barely been staffed. 100 skills not even admitted (structural or truth gate red). 2 skills in DRIFT. The 17% upstream-displacement coverage is thin. The gap between SYSTEM maturity and CONTENT maturity is the defining feature — and the owner is aware of this, explicitly calling corpus state "backlog, not a design finding." That framing is honest, but backlogs this large are also risks.

The model-identity discipline is best-in-class: registry-driven alias resolution, display-name pinning, the `representative-generator` distinction, the `no-lesser-models-for-quality` doctrine. Edge cases like `latest-alias-unresolved` sentinel handling are documented and enforced. This is a differentiator vs. any other skill library.

What drops the score from A-/B+ boundary: the field-reference has no machine-readable purpose taxonomy (Q2); the BDD surface is narrow (7 scenarios, gate-conformance only); code has some monolithic files (evaluate-skill.js at 2996 lines, application-eval.js at 1725); `product-domain` at 3 skills is below the 5-floor and growth path is unproven; 2 skills have no audit-state.json at all (malformed or missed in migration).

---

## 2. Structured Pass

### Protocol Coherence — A- (90/100)
Schema is authoritative (Tier 1), docs match schema, field-reference explains every field. The `schema_version`/`skill_graph_protocol` distinction is principled. The `SKILL_METADATA_PROTOCOL.md` is the binding contract and the field-reference is the prose companion — clean separation. **BUT:** field-reference has **no machine-readable axis tagging** (see Q2). The generated `.generated.md` mirror is drift-free. 5/5 protocol consistency checks pass.

### Tier-Invariant Integrity — A (92/100)
Five-tier authority model is correctly followed. Schema wins over prose; when docs disagree, the lower tier is the bug. `verify:system` green. `verify` (full gate) green includes the audit-evidence consistency gate (formerly excluded, now wired). The major-version-is-a-clean-cut doctrine is adhered to — no v7 legacy in the live tree, no deprecated field definitions in the schema, no "sunset window" prose. The schema has actually been cleaned. This is unusual discipline for a v0.5 project.

### Audit-Loop Maturity — C (65/100)
The loop is well-designed on paper (philosophy doc is strong, verdict semantics are clear, the `representative-generator` shaping is correct). The tooling exists: `run-bidirectional-eval.js`, `skill-audit-loop-lite.js`, `evaluate-skill.js`, graders, eval-staleness-checker. But execution is early:
- 0 APPLICABLE, 167 UNVERIFIED
- 73 admitted but awaiting gate 9
- 100 not admitted (structural/truth gate failing — but 181 pass structural, so the block is truth gate at 98 UNVERIFIED)
- 2 dual-run graded, 6 single-model PROVISIONAL
- The multi-agent panel (`run-skill-audit-loop.js`) is the newest path and has barely been exercised

**Agree with chair** that the Behavior Gate is under-deployed. **Disagree** that this makes the gate worthless (Q1) — it makes it unstaffed.

### Corpus Health — B (75/100)
181 skills, v8, 100% lint-clean. 177 public / 4 private. 21 polyhierarchy. **BUT:** reasoning-strategy at 31 is over the 25 cap (owner says not a priority, but it violates the ADR-0020 shelf rule). product-domain at 3 is under the 5 floor. 2 skills lack sidecars entirely. 2 DRIFT. 17% displacement coverage. The corpus is well-structured at the SYSTEM level but evidence of per-skill quality is missing.

### Verdict Distribution — D (45/100)
This is the weakest dimension by design. The owner explicitly says corpus state is backlog, not design failure — and that framing is valid per project doctrine. But as a board reviewer evaluating the project's current state:
- 0% certifying (APPLICABLE)
- 92% UNVERIFIED on application
- 85% UNVERIFIED on comprehension
- 54% UNVERIFIED on truth
- 100% PASS on structural (form is perfect, behavior is unproven)

The HARMFUL skills that were found and removed prove the gate has some value. But the needle has barely moved.

### Model-Identity Discipline — A+ (95/100)
Best-in-class. Registry-driven aliases (`strongest-reasoning-grader`, `representative-generator`, `codex-current`), display-name pins, `FRONTIER_PAIR` for bidirectional grading, `ADVISORY_MODELS` for breadth, the `latest-alias-unresolved` sentinel handling, `npm run models:check` enforcement, resolved model capture from codex exec output. The `no-lesser-models-for-quality` rule is honored (frontier judges, representative generator as measured subject). Cross-family judging addresses self-preference bias.

### SYSTEM/CONTENT Hygiene — A (88/100)
The two-mode system is well-defined, enforced via check-work-mode-separation.js, and supported by the sequencing principle. The analysis-only carve-out correctly handles this report. The allowlist is clear. Pre-commit warnings are soft (exit 0) which is pragmatic. The major gap: **the CONTENT backlog (167 UNVERIFIED) cannot drain until SYSTEM is "as the user wants it"** (sequencing principle). This creates a tension — if SYSTEM keeps iterating, CONTENT never catches up.

### Public-Release Readiness — B (72/100)
Release pipeline exists (two-step sync, marketplace export, publication gate). `npm run release:ready` and `release:check` exist. The export verifies privacy patterns and description budgets. The canonical URL contract is documented. **BUT:** the stale skills.sh rows (3 old repos still serving content) remain unresolved. Security scan is advisory-only by default (exit 0). No CI against the release repo's freshness. The marketplace counts can stale between syncs. The `npm` publish is behind (`0.5.8` on npm vs `0.5.10` in repo).

---

## 3. Agenda Answers

### Q1 — Reshape behavior evidence grading?

**Evidence:**
- 0 positive application verdicts / 181. 167 unverified. 9 provisional.
- What the gate has actually PRODUCED: HARMFUL skills removed (`git log` evidence: "fail active harmful skills", "drop harmful skill exports", "remove harmful skills from inventory"). REDUNDANT (3) and MIXED (2) verdicts also exist.
- Cost: wall-clock per skill is non-trivial (bidirectional eval on two model CLIs, ~$20-50/skill in API costs), but the infra is already built.
- The philosophy doc says "eval is a guardrail, not the optimizer" — anti-loss, keep-or-revert regressions only.

**Analysis:** 0 positive application verdicts is NOT evidence the gate is worthless. It is evidence the gate has barely been run. The HARMFUL catches prove the gate can detect downstream damage when exercised. The cost argument conflates marginal run cost with the gate's structural value.

**Verdict: RESHAPE.** Keep the Behavior Gate infrastructure: the grading pipeline, the eval contracts, and the verdict semantics. Drop aspirational positive-certification framing for current operations because it creates a perverse incentive to avoid running the gate when the corpus has not accumulated enough receipts yet. Instead:
- Use a simple PASS/FAIL/REGRESSION signal for current behavior safety
- Make HARMFUL detection the primary value proposition ("does this skill make agents worse?")
- Run the gate on contamination evidence, prior-task failures, and HARMFUL probes before trying to certify every skill
- Keep the full `application_verdict` enum for mature corpus certification, but don't block corpus drain on positive behavior certification

This preserves the safety check the owner intuitively values (HARMFUL detection) while removing the aspirational target that makes the gate look unsuccessful.

**Owner's framing challenged:** "eval tests don't prove anything besides being expensive." This is false — they proved HARMFUL skills exist in the corpus and were correctly removed. That is not nothing. And "remove the gate to save tokens" would save the token cost of running it, but would remove the only safety net against HARMFUL, FALSE_POSITIVE, or REDUNDANT regressions. The right call is narrower scope, not removal.

### Q2 — Flag metadata fields by purpose?

**Evidence:** Field-reference.md + field-reference.generated.md have NO machine-readable axis tagging. Fields are grouped by authored order, not purpose. The owner's frustration is empirically supported: the field-reference's 1777 lines describe each field in prose but never tag it as "routing" vs "understanding" vs "provenance." An agent reading the field-reference has to infer purpose from context.

**Recommendation: YES — add field-purpose taxonomy.** The cleanest design:

```yaml
# Schema annotation approach (in $comment or a non-binding metadata field)
field_purpose: routing | understanding | grounding | provenance | lifecycle | activation | certification
```

- **Where it lives:** as a `$comment` annotation in `schemas/SKILL_METADATA_PROTOCOL_schema.json` per property. This is non-normative (JSON Schema `$comment` is ignored by validators) and doesn't change the contract. Then `scripts/build-field-reference.js` reads these annotations and populates a new "Purpose" column in `field-reference.generated.md`. The hand-authored `field-reference.md` adds the same column.
- **The 7 values:**
  - `routing` — fields the router reads to decide which skill activates (subject, keywords, triggers, paths, relations.suppresses, etc.)
  - `understanding` — fields that teach a concept rather than route it (the five Understanding fields, mental_model, purpose, concept_boundary, analogy, misconception)
  - `grounding` — fields that tie the skill to a source of truth (grounding.*, truth_sources, drift_check)
  - `provenance` — fields about where/when the skill came from and what version (schema_version, skill_graph_protocol, urn, version)
  - `lifecycle` — fields about the skill's lifecycle (stability, freshness, eval_state, lifecycle.*)
  - `activation` — fields that help an agent decide when to invoke the skill (examples, anti_examples, applicable_tasks, environment, internal_tools)
  - `certification` — audit/eval verdict fields (the four verdicts, eval_score, eval_failed_ids)
- **Will it change agent behavior?** Partially. If the field-reference table is the doc agents read, adding a Purpose column makes the distinction visible. If the schema annotation is machine-readable, a sophisticated router could weight fields by purpose. But the real value is in documentation clarity — the owner's frustration ("agents dismiss understanding fields") is a documentation problem, not a schema problem.
- **SYSTEM work:** edits to schema annotations + build-field-reference.js + field-reference.generated.md + field-reference.md. CONTENT work: none.

### Q3 — Harden the architecture. BDD? ADR? YAML? Code optimization?

**(a) BDD sufficiency:** The gate-conformance spec.yaml (7 scenarios) is narrowly scoped to structural + truth gates — correct per its README. It explicitly does NOT cover routing, eval, manifest, or export gates. **Expand is warranted** — at minimum add:
- A `manifest` gate scenario (given a skill, manifest round-trips without drift)
- A `comprehension` gate scenario (given comprehension.json, grader produces expected verdict)
- An `application` gate scenario (given application.json, grader produces expected verdict)
- A `routing` gate scenario (given query, router activates expected skill)

These are currently unit-tested in separate test files but have no unified spec.yaml scenario. The gate-conformance spec should be the single declarative contract. **Estimated effort:** 4-8 new scenarios, 4-8 fixtures. SYSTEM work.

**(b) ADR usage:** 22 ADRs covering 0001-0022 is solid. Gaps I see: no ADR for the naming convention decision (head-noun-glossary), no ADR for the `delete-dont-archive` rule, no ADR for the decision to NOT use a package manager beyond Node built-ins. These are minor — 22 ADRs for a v0.5 project is above average.

**(c) YAML:** Already used for spec.yaml. The `audits/lanes.json` and other config files use JSON, which is fine. YAML brings comment-support benefits for config files but adds a parser dependency. The current "no dependencies" policy makes JSON the right call for config. Keep JSON; only YAML the BDD spec (already done).

**(d) Code optimization — specific files:**

| File | Lines | Problem | Recommendation |
|---|---|---|---|
| `lib/audit/evaluate-skill.js` | 2996 | Single-file eval pipeline, monolith | Split: eval runner (~800), model dispatch (~600), grader orchestration (~700), result synthesis (~500), helpers (~400). P1 |
| `lib/audit/application-eval.js` | 1725 | Application grader logic | Split case grading from aggregation. P2 |
| `lib/audit/skill-evolution-loop.js` | 1584 | Corpus walker loop | Extract priority-queue triage to separate module. P3 |
| `scripts/skill-lint.js` | 1117 | All skill lint rules in one file | Extract per-rule checks into `lib/lint/rules/` directory. P2 |
| `scripts/skill-graph-route.js` | 1100 | Router monolith | Extract scoring from route resolution. P2 |
| `scripts/export-marketplace-skills.js` | 1060 | Export pipeline | Split: frontmatter transform (~300), publication gate (~250), body projection (~250), I/O (~260). P3 |
| `scripts/check-protocol-consistency.js` | 942 | All C1-C10 checks in one file | Extract per-check modules. P3 |

Total scripts/lib code: ~53,600 JS lines across 157 files. No dependencies (Node built-ins only). The monolith risk is real — several 1000+ line files with no module decomposition.

### Q4 — Your response to the evaluations OF THE SKILLS (per-skill)?

The per-skill eval results say: **the corpus is under-evaluated, not mis-evaluated.** The evidence:

- 2 skills with dual-run graded results (whatever their verdicts) — the system works when run.
- 6 skills with PROVISIONAL comprehension — single-model assessment exists, awaiting confirmation.
- 154 skills with NO comprehension evaluation — not "failed," not "unfit," just never run.
- 9 skills with PROVISIONAL application, 3 REDUNDANT, 2 MIXED — the gate has found real signal.
- 0 APPLICABLE — consistent with the fact that the certifying path (representative-generator + dual frontier judges + parity-lockstep) has barely been exercised.

**Fastest credible path to lift Behavior Gate coverage:**
1. **Run the structural+truth gate on the 98 UNVERIFIED-truth skills** — that moves them from "not admitted" to "admitted but unassessed." This is cheap (drift-sentinel, not model calls).
2. **Run PROVISIONAL comprehension on the 154 unassessed comprehension skills** — single-model (Sonnet, $). Not certifying, but gives signal. Prioritize the 73 already-admitted skills.
3. **Run the application gate on the highest-traffic skills** — the 31 reasoning-strategy skills (largest shelf, presumably most used), not randomly. Single-model PROVISIONAL first.
4. **Target 5-10% coverage lift per week** — 9 PROVISIONAL today → target 25 in 2 weeks, then 50 in 4 weeks. At that point the first dual-run certification candidates emerge.

The current bottleneck is NOT the gate's quality. It is **staffing** — running the eval costs model tokens and requires operator attention. That's a resource constraint, not an architecture problem.

### Q5 — Your response to the evaluations IN GENERAL — what the numbers say?

**Honest state of the system:**

| Dimension | Verdict | Evidence |
|---|---|---|
| Protocol design | Strong | Schema is correct, docs match, 5/5 checks, 22 ADRs |
| Library tooling | Strong | Lint 100%, manifest generation, routing, drift, export all work |
| Corpus structure | Good | 181 skills, all lint-clean, v8, organized in 12 shelves |
| Quality assurance | Early | 0% certified, 92% unevaluated, 54% truth-unverified |
| Public readiness | Mixed | Pipeline exists but stale rows persist, npm is behind |
| Maintenance hygiene | Good | HARMFUL removal, displacement checks, model discipline |

**The single biggest gap between vision and reality:** The vision says "route, audit, maintain, and scale." "Route" and "maintain" are working (routing works, drift checks work, lint works). "Scale" works for the SYSTEM (schema, 181 skills, all lint-clean). But "audit" — the loop that keeps skills honest — has only Integrity Gate coverage (structural + truth on ~45% of skills). The Behavior Gate (comprehension + application) has near-zero coverage.

The gap is not in the design. The gap is in **execution bandwidth.** The owner is aware of this and has explicitly sequenced SYSTEM-first, CONTENT-second. In a resource-constrained project, this is the right call — you build the machine before you feed it. But a board reviewer must note: 0% certified with 0% quarter-over-quarter improvement trajectory means the "audit" pillar of the vision is not yet operational.

### Q6 — Skill CATEGORIES and GAPS

**Current categories (12 shelves):**
reasoning-strategy (31), quality-assurance (25), design (22), agent-ops (20), software-engineering-method (16), frontend-engineering (16), backend-engineering (11), software-architecture (10), data-engineering (9), ai-engineering (9), knowledge-organization (9), product-domain (3).

**Gaps vs. skills.sh and skillsmp.com ecosystem (1.7M+ skills):**

| Missing category | Ecosystem evidence (skills.sh/skillsmp) | Gap severity |
|---|---|---|
| **DevOps / CI/CD** | 135K skills in DevOps category. Azure alone has 5.8M installs. | CRITICAL — zero coverage in a core domain |
| **Cloud infrastructure** | Azure, AWS, GCP skills dominate the top-100 on skills.sh | CRITICAL — zero coverage |
| **Security / penetration testing** | 179K skills in Testing & Security. OWASP exists but no compliance/authz depth | HIGH — thin coverage |
| **Mobile development** | Swift, Flutter, React Native skills on skills.sh | HIGH — only mobile-responsive-ux exists |
| **Data science / ML models** | 157K skills in Data & AI. No ML framework skills (PyTorch, TensorFlow, sklearn) | HIGH — data-engineering exists but no ML |
| **Business / finance** | 313K business skills, 180K finance occupations on skillsmp | MEDIUM — no coverage |
| **Documentation / writing** | 116K documentation skills. We have writing-humanizer only | MEDIUM — thin |
| **Content creation / media** | 105K content/media skills. Video, image generation are massive | MEDIUM — no coverage |
| **Legal / compliance** | 23K legal skills on skillsmp | LOW — but plausible recruiting target |
| **Education / instructional design** | 19K education skills on skillsmp | LOW — but aligns with "teaching skills" mission |

**Recruiting priorities (owner steer: coverage gaps, not rebalancing):**
1. **DevOps + Cloud** — the single biggest gap. Even 5-8 foundational skills (Docker, k8s, CI/CD, IAM, serverless, Terraform) would fill a void that currently has nothing.
2. **Security depth** — OWASP and security-fundamentals exist. Add: `supply-chain-security`, `secret-management`, `compliance-automation`, `network-security`.
3. **Mobile** — Flutter, React Native, and SwiftUI are major agent-work domains with zero skill coverage.
4. **ML/AI model skills** — PyTorch, HuggingFace, model-serving, fine-tuning. The `ai-engineering` shelf has only 9 skills and none cover model training/deployment.
5. **Business/analytics** — SQL analytics, BI tools, financial modeling. These are among the most downloaded skills on skills.sh.

The owner's steer is correct: shelf-count cap violations (31/25 reasoning-strategy) are not the priority. The priority is missing competencies. DevOps zero-coverage is a bigger problem than reasoning-strategy being 6 skills over cap.

---

## 4. Recommendations

| # | Priority | Recommendation | Rationale (evidence) | Mode |
|---|---|---|---|---|
| R1 | P1 | **RESHAPE the Behavior Gate**: drop APPLICABLE certification as near-term goal, refocus on HARMFUL/regression detection | 0 APPLICABLE/181, but HARMFUL catches proved value. Cost-vs-return improves with narrower scope. | SYSTEM |
| R2 | P1 | **Add field-purpose taxonomy** as `$comment` annotations in schema + Purpose column in field-reference | Owner frustration confirmed: no machine-readable purpose axis in 1777-line field-reference. 7-value enum is minimal surface. | SYSTEM |
| R3 | P1 | **Expand gate-conformance spec.yaml** to cover manifest, comprehension, application, routing gates | Currently 7 scenarios covering only structural+truth. Other gates have unit tests but no unified spec. | SYSTEM |
| R4 | P2 | **Split evaluate-skill.js (2996 lines)** into modules | Single largest file, contains eval pipeline + model dispatch + grader orchestration + synthesis. P1 risk if modified. | SYSTEM |
| R5 | P2 | **Establish BI-weekly Behavior Gate run cadence** targeting admitted skills | 73 admitted-but-unassessed are gate-ready. Running 5-6/week clears the backlog in ~12 weeks. | CONTENT |
| R6 | P2 | **Resolve skills.sh stale rows** — escalate to `@quuu` on Vercel forum | 3 stale rows (34+27 skills) still serving content. No API self-service exists. Manual removal is the only lever. | SYSTEM |
| R7 | P2 | **Push npm publish to v0.5.10** | npm `latest` is 0.5.8. 0.5.9/0.5.10 contain substantive changes (ADR-0019, 0020, 0021, 0022). | SYSTEM |
| R8 | P3 | **Recruit 5+ DevOps/Cloud skills** | Zero coverage in a domain with 135K+ competitors. Single biggest coverage gap in the corpus. | CONTENT |
| R9 | P3 | **Fix 2 skills missing audit-state.json** | 2/183 skills lack sidecars entirely. These will break the audit-manifest consistency gate. | CONTENT |
| R10 | P3 | **Split skill-lint.js and skill-graph-route.js** | Both >1000 lines. Per-rule extraction is standard refactoring. | SYSTEM |
| R11 | P3 | **Run truth gate on 98 UNVERIFIED-truth skills** | Move them to "admitted" status. Cheap (drift-sentinel only, no model calls). | CONTENT |
| R12 | P4 | **Consider ML/AI model skills, Mobile, Business categories for recruitment** | Ecosystem evidence shows strong demand. 2-3 skills per category as pilot. | CONTENT |

**Top 3 by (Maturity-Lift × Invariant-Risk-Reduced / Effort):**
1. **R1 (RESHAPE Behavior Gate)** — High lift (reduces aspirational pressure), high risk-reduction (keeps HARMFUL safety net). Low effort (doc + config changes only).
2. **R2 (field-purpose taxonomy)** — High lift (solves documented owner frustration), zero invariant risk (non-normative schema annotation). Medium effort (schema comments + build-field-reference.js update + doc update).
3. **R4 (split evaluate-skill.js)** — Medium lift (easier maintenance), high risk-reduction (monolith at 3K lines is a bug magnet). Medium effort.

---

## 5. Risk Flags

1. **CONTENT drain is stalled by design.** The sequencing principle says "until SYSTEM is as the user wants it, CONTENT is paused." If SYSTEM keeps evolving (new ADRs, schema refinements), CONTENT never catches up. This is a governance risk, not a code risk, but it's real. **Mitigation:** set a SYSTEM freeze milestone after which only bug-fix SYSTEM changes are allowed, and CONTENT drain becomes the priority.

2. **The 98 truth-UNVERIFIED skills are a silent corpus-quality risk.** Structural (lint) is 100% PASS, so the library looks green. But 98 skills have never had their truth sources verified. A skill can point to a deleted file, renamed doc, or broken URL and `npm run verify` still passes. The truth gate is the canary; 54% of canaries are silent.

3. **Marketplace stale-row exposure.** 3 stale skills.sh rows (skill-graph old repo + 2 split repos, 34+27 skills each) still serve content from deleted GitHub repos. `git push` to the canonical source does NOT de-index stale rows. If someone installs from a stale row, they get an unmaintained skill pointing at a 404 source. This is a brand risk and a user-safety risk.

4. **No dependency policy is a scaling ceiling.** "Node built-ins only" is principled but creates a ceiling on what the tooling can do. If the project needs robust YAML parsing, HTTP calls, or structured logging, the no-dependency policy will have to relax. Plan the relaxation before it's forced by a bug.

5. **Security scan is advisory-only.** `npm run security:scan` exits 0 on findings by default. A skill with `curl | bash` as an example (legitimate anti-example pattern in teaching skills) would pass. This is a conscious design choice (teaching skills show harmful patterns as anti-examples), but it means the public release has no automated safety gate. The privacy gate (`export-marketplace-skills.js`) is the only hard block.

---

## 6. Novelty Memo

Off-agenda observations surfaced during research:

| # | Claim | Evidence strength | Why off-agenda | Format loss? |
|---|---|---|---|---|
| N1 | The `product-domain` shelf (3 skills) is below the 5-skill floor and hasn't grown since ADR-0020. The ADR-0020 prognosis of "recruit or fold" is now 11 days old with zero new product-domain skills. | HIGH — telemetry | Owner steer said coverage gaps not rebalancing, but 3 is fundamentally below the MECE viability threshold. | No — fits Q6 |
| N2 | The `backfill-field-purpose-comments.js` script (466 lines) exists in `scripts/` suggesting someone already anticipated field-purpose metadata. | MEDIUM — file exists | The file may be a pre-existing draft or dead code. Wasn't on the agenda to verify. | Partial — relevant to Q2 design |
| N3 | The `scripts/eval-discriminability-report.js` (721 lines) suggests a tool for measuring if evals are discriminating — but 0 APPLICABLE means there's nothing to discriminate yet. Cart-before-horse risk. | MEDIUM — exists | Owner asked Q1 (about the gate), not about eval quality tooling that can't be used yet. | Partial — relevant to Q1 |
| N4 | The Skill Graph has NO Gherkin `.feature` files despite being a BDD-aware project. The gate-conformance spec.yaml is a lightweight alternative. This is fine — Gherkin adds parser dependency and the human-readable YAML + Node runner works. | HIGH — file search | Not on the agenda, but the chair might have expected Gherkin. The answer is: no, keep the lightweight YAML approach. | Yes — anticipating a chair question |
| N5 | `verify:system` is green without any eval artifacts. A SYSTEM change ships with 0 evidence that the overall library is useful. This is correct per doctrine ("design is the schema, not corpus state") but creates a perceptual risk for external evaluators. | HIGH — same evidence as Q1 | Off-agenda because it follows from Q1/Q5 analysis rather than being a separate question. | No |
| N6 | The library's 181 skills are ~0.01% of the 1.7M skills on SkillsMP. This is not a problem (quality vs quantity), but the public narrative should frame it explicitly: "curated, not collected." | MEDIUM — inference | Owner's strategy call, not on the agenda. | Yes — but valuable framing |
| N7 | The `isolated-checkout.js` + `public-content-fence.js` + `sandbox-exec` fence is a three-layer defense-in-depth for private content boundaries. This is unusually strong for an open-source project. | HIGH — read the code | Engineering excellence observation, not an agenda item. | Yes — praise |
| N8 | The "clean cut at major version" doctrine means the BACKWARD compatibility layer lives entirely in the exporter. If a skills.sh marketplace consumer points at a v7 feature, the exporter absorbs it. But npm-published `@skill-graph/cli 0.5.8` is behind the in-repo 0.5.10, which means the npm consumer may have incompatible behavior. | MEDIUM — npm evidence | Follows from "release readiness" scoring but not explicitly on Q6. | Partial |
| N9 | The `subject` enum is closed at 12 values with an ADR+5-skill gate for a 13th. This is appropriate for Miller's 7±2 browseability but creates a governance bottleneck if the library grows to 500+ skills. At that scale, 12 shelves each holding 40+ skills will need subdivision via `taxonomy_domain`. The mechanism exists. It just hasn't been needed yet. | MEDIUM — inference from ADR-0020 | Not on the agenda; the owner already knows this. | Yes |
| N10 | Two skills have no `audit-state.json` at all. The status report says 181 skills, but the verdict tally found 183 directories with skills. 2 are malformed/missing sidecars. | HIGH — telemetry | Owner should know. Minor issue but fixes should land before the next npm push. | No |

---

## 7. Dissent or Abstain

**I disagree with the owner's framing on Q1 in one specific way.** The owner argues "the eval tests don't prove anything besides being expensive" and "0 APPLICABLE proves the gate is worthless." The evidence says otherwise:

- The gate produced **HARMFUL** detections that led to `git rm` of dangerous skills. That is not "nothing" — it is safety-critical signal. The fact that no skill has earned APPLICABLE yet is a staffing-deployment issue, not a gate-design issue. An unevaluated corpus is NOT a useless corpus; it's an unevaluated one.

- The owner's statement conflates "APPLICABLE is 0" with "the gate produces no useful signal." The HARMFUL, REDUNDANT, and MIXED verdicts ARE useful signal — they prove the gate discriminates between skill qualities. If the gate were truly worthless (no discrimination), all evaluated skills would land on one verdict. They don't: 9 PROVISIONAL, 3 REDUNDANT, 2 MIXED, 0 APPLICABLE. That spread shows the gate differentiates.

- The philosophy doc says "eval is a guardrail, not the optimizer." The guardrail stops HARMFUL content from being published. That's working. The optimizer (driving skills toward APPLICABLE) hasn't been started. The guardrail-only mode is already net-positive.

**Abstain on Q6 shelf-count caps.** The owner says shelf imbalance (31 reasoning-strategy vs 3 product-domain) is not a priority. I accept this steer for shelf-count balance. But I note that `product-domain` at 3 is below the ADR-0020 floor of 5, and the ADR itself says "recruit to ≥5 or fold via follow-up ADR." 11 days post-ADR with 3 skills is not a violation, but the floor exists for a reason (a shelf with <5 skills is not browseable). This is a watch item, not an action item.

---

## 8. Completeness Claim

Examined 8 evaluation dimensions (protocol coherence, tier-invariant integrity, audit-loop maturity, corpus health, verdict distribution, model-identity discipline, SYSTEM/CONTENT hygiene, public-release readiness) + 6 agenda questions + 10 novelty observations. Reported all. Items excluded: none.
