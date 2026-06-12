---
name: methodology
description: "Use when planning multi-step implementations, designing quality gates, establishing verification protocols, or building agent checklists calibrated to known failure modes. Covers methodology/method/process distinctions, Cleanroom, PSP/TSP, hypothesis-driven development, DMAIC, checklist design, V&V frameworks, EDDOps, quality gates, and PDCA. Do NOT use for code-review verdicts (use `code-review`), behavior-preserving implementation work (use `refactor`), or test strategy (use `testing-strategy`). Do NOT use for review this PR and decide whether to approve it. Do NOT use for refactor this file while preserving behavior. Do NOT use for decide unit vs integration vs e2e coverage for this feature. Do NOT use for write the eval cases and grader rubric for this router. Do NOT use for block this dangerous git command or secret-bearing tool call."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"testing-strategy\",\"guardrails\",\"best-practice\",\"agent-eval-design\",\"code-review\"],\"suppresses\":[\"refactor\"],\"verify_with\":[\"best-practice\",\"agent-eval-design\",\"okrs\"]}"
  subject: software-engineering-method
  scope: "Portable methodology design for rigorous agent work: planning multi-step implementations, designing quality gates, establishing verification protocols, and building checklists calibrated to known failure modes. Covers methodology/method/process distinctions, Cleanroom defect prevention, PSP/TSP measurement discipline, hypothesis-driven development, DMAIC/PDCA quality management, checklist design, V&V frameworks, EDDOps, and hard-stop quality gates. Excludes concrete PR review (code-review), behavior-preserving implementation changes (refactor), test-level selection (testing-strategy), eval-case/rubric authoring (agent-eval-design), and high-risk action blocking (guardrails)."
  public: "true"
  taxonomy_domain: quality/method
  stability: experimental
  keywords: "[\"methodology\",\"method\",\"process\",\"formal methods\",\"cleanroom\",\"PSP\",\"TSP\",\"hypothesis driven\",\"DMAIC\",\"PDCA\"]"
  triggers: "[\"methodology-skill\"]"
  examples: "[\"design a verification protocol for this multi-step agent workflow before implementation starts\",\"turn these recurring agent failure modes into a checklist and hard quality gate\",\"explain why this process step exists instead of just telling the agent to follow it\",\"choose whether this task needs PDCA, DMAIC, hypothesis-driven development, or V&V-style traceability\",\"build a methodology-backed plan for preventing defects earlier in this skill audit loop\",\"convert a vague done checklist into binary gates with evidence receipts\"]"
  anti_examples: "[\"review this PR and decide whether to approve it\",\"refactor this file while preserving behavior\",\"decide unit vs integration vs e2e coverage for this feature\",\"write the eval cases and grader rubric for this router\",\"block this dangerous git command or secret-bearing tool call\"]"
  grounding: "{\"subject_matter\":\"Reference methodology for rigorous agent work: methodology-method-process layering, defect prevention, PSP/TSP measurement, hypothesis-driven development, DMAIC/PDCA, checklist design, V&V, and evaluation-driven LLM agent operations\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://voljournals.utk.edu/utk_harlan/18/\",\"https://www.sei.cmu.edu/library/the-team-software-process-tsp/\",\"https://www.sei.cmu.edu/library/team-software-process-tsp-and-personal-software-process-psp-materials/\",\"https://asq.org/Quality-resources/Dmaic\",\"https://asq.org/quality-resources/pdca-cycle\",\"https://www.who.int/publications/i/item/9789241598590\",\"https://www.nasa.gov/ivv-overview/\",\"https://www.nasa.gov/reference/system-engineering-handbook-appendix/\",\"https://barryoreilly.com/explore/blog/how-to-implement-hypothesis-driven-development/\",\"https://arxiv.org/abs/2411.13768\"],\"failure_modes\":[\"process_steps_followed_without_underlying_methodology\",\"quality_gate_treated_as_advisory\",\"verification_claim_without_evidence_receipt\",\"checklist_not_calibrated_to_known_failure_modes\",\"exact_cost_or_success_claim_made_without_source_or_eval\",\"non_public_neighbor_skill_used_as_public_boundary\",\"eval_or_routing_state_inflated_without_run\"],\"evidence_priority\":\"equal\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/methodology/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Methodology

## Concept of the skill

Portable methodology design for rigorous agent work: planning multi-step implementations, designing quality gates, establishing verification protocols, and building checklists calibrated to known failure modes.

## Domain Context

**What is this skill?** Provides the philosophical framework (methodology), specific techniques (methods), and ordered execution sequences (processes) that govern rigorous agent work. Covers the methodology-method-process stack, Cleanroom defect prevention, PSP/TSP measurement discipline, hypothesis-driven development, DMAIC quality management, aviation checklist design (Gawande), V&V frameworks (NASA/IEEE-style independent verification and validation), EDDOps for LLM agents, quality gates as hard stops, and the PDCA cycle for standardizing successes. Use when planning multi-step implementations, designing quality gates, establishing verification protocols, building agent checklists calibrated to known failure modes, or when an agent needs to understand WHY a process step exists (not just THAT it exists). Do NOT use for concrete PR review (use `code-review`), behavior-preserving implementation changes (use `refactor`), test-level selection (use `testing-strategy`), eval-case design (use `agent-eval-design`), or high-risk tool-call blocking (use `guardrails`).

## Coverage

This skill covers the foundational frameworks that make rigorous agent work possible: the methodology-method-process three-layer stack (why these steps, not just which steps), Cleanroom defect prevention (quality built in, not inspected in), PSP/TSP measurement discipline (plan, review, post-mortem), hypothesis-driven development (define success criteria before the experiment), DMAIC/PDCA quality management (especially the skipped Control/Act phases), Gawande checklist design (calibrated to known failure modes, not generic), V&V frameworks from safety-critical industries (DO-178C bidirectional traceability, NASA verification standards), EDDOps for LLM agent evaluation (lifecycle coverage, slice-level validation, closed feedback loops), quality gates as hard stops (binary, blocking, measurable), and the 8 codifiable methodology patterns synthesized across all source disciplines.

## Philosophy of the skill
Agents default to executing process without methodology. They apply steps without understanding the principle that makes the steps necessary, which is exactly why they skip steps that feel low-value in the moment. A pilot who knows the B-17 crash story understands why the gust-lock check exists. A pilot who just has a checklist might skip it when running late.

The academic distinction is load-bearing: **Methodology** is the philosophical framework — WHY you approach work a certain way. **Method** is a specific technique within the methodology. **Process** is the ordered sequence of steps executing a method. One process can contain multiple methods; one method can serve many processes. But without methodology, the agent has no basis for deciding when to apply extra rigor, when to challenge a process that seems wasteful, or when a shortcut is genuinely safe vs. when it compromises the underlying principle.

This skill installs the WHY. Adjacent quality skills install the execution surface: `code-review` evaluates concrete diffs, `testing-strategy` chooses test levels, `agent-eval-design` authors eval cases and graders, `guardrails` blocks high-risk actions, and `best-practice` catches cross-cutting quality gaps. Together they prevent both "knows the steps but skips them" (ineptitude) and "follows steps mechanically without understanding when they matter" (cargo culting).

## Methodology Boundaries

Methodology provides the *frameworks and principles* behind rigorous execution. It does not own every downstream execution surface.

| Need | Use | Boundary |
|---|---|---|
| Design a rigorous process, checklist, or gate sequence | `methodology` | Owns why the gates exist and how they compose |
| Review an actual diff or PR | `code-review` | Owns findings, severity, comments, and merge verdicts |
| Decide what software behavior to test and at what level | `testing-strategy` | Owns test scope and level selection |
| Design agent eval tasks, rubrics, hard negatives, or graders | `agent-eval-design` | Owns eval content and scoring design |
| Block destructive, secret-bearing, or public side-effecting actions | `guardrails` | Owns action safety and escalation |
| Catch cross-domain quality misses after specialist work | `best-practice` | Owns broad quality enforcement, not methodology selection |

---

## 1. The Three-Layer Stack

| Layer | What It Is | Scope | Example |
|---|---|---|---|
| **Methodology** | The philosophical framework — WHY | Values, assumptions, epistemology | "Defect prevention is cheaper than defect removal" |
| **Method** | A specific technique — HOW | Technique, approach, rules | "Run a type-check before committing" |
| **Process** | An ordered sequence — WHEN | Steps, timing, handoffs | "1. Claim task → 2. Implement → 3. Verify → 4. Wrap" |

**Operational rule:** Before executing any multi-step task, the agent must be able to articulate:
1. What quality principle governs this work? (the methodology)
2. What specific technique is being applied? (the method)
3. In what order do the steps execute? (the process)

If the agent cannot state #1, it is executing process without methodology — which is how skipped steps and silent shortcuts happen.

---

## 2. Cleanroom: Defect Prevention Over Removal

Cleanroom software engineering (Harlan Mills, IBM) derives its name from semiconductor cleanrooms — environments designed to *prevent* contamination, not clean it up after.

### The Three Pillars

1. **Formal specification before implementation.** Behavior is specified before any code is written. Team reviews verify that design correctly implements specification — before implementation begins.
2. **Incremental implementation with quality gates.** Each increment is measured against pre-established standards. Failure to pass a gate triggers return to design. Work cannot advance past a failed gate.
3. **Statistical testing as experiment.** Testing is a designed experiment with defined coverage, not ad-hoc verification.

### The Defect-Cost Gradient

| Phase Found | Relative cost | Agent translation |
|---|---|
| During planning/design | Lowest | Clarify acceptance criteria, scope, and risk before implementation |
| During self-review or code review | Higher | Fix a concrete diff before it lands |
| During testing | Higher again | Debug implementation and test harness together |
| After release or publication | Highest | Repair user impact, trust, documentation, and follow-on work |

Exact multipliers vary by domain and evidence base. Do not quote universal defect-cost percentages from this skill. The methodology claim is ordinal: earlier prevention is cheaper and safer than late defect removal.

**Translation to agent work:** Every pre-implementation check (acceptance criteria declared, existing patterns audited, assumptions externalized) prevents a post-task revision cycle. The PRE-TASK gate is not optional even when the task feels simple — simple tasks fail most often on defects that a pre-task check would have caught, because the agent doesn't bother checking assumptions it believes are obvious.

---

## 3. PSP/TSP: Measurement at the Individual Level

The Personal Software Process (Watts Humphrey, SEI/CMU) applies capability maturity principles to individual engineers, while TSP extends process discipline to teams. SEI positions these materials around defined processes, personal/team measurement, quality control, and more precise cost/schedule commitments. Treat PSP/TSP as a measurement discipline, not as a guaranteed schedule-improvement number.

### PSP Phase Structure

| Phase | What Happens | Agent Equivalent |
|---|---|---|
| **Planning** | Estimate using historical data. Never begin without a plan. | Pre-task declaration: scope, steps, risks |
| **Design** | Specify the solution before implementing | Declare what tokens, states, components will be used |
| **Design Review** | Personal review of design before coding — using a personal checklist | Self-check: "Have I seen this pattern before? What was the failure mode?" |
| **Code** | Implement | Implement |
| **Code Review** | Personal review before compile — same checklist discipline | Post-implementation self-check: all states present? all tokens correct? |
| **Test** | Verify against planned acceptance criteria | Run verification against pre-declared criteria |
| **Post-mortem** | Record actuals, calculate defect metrics, update historical data | Wrap findings: document what was discovered, update checklists |

### The Defect Philosophy

"Errors are usually predictable, so PSP developers can personalize their checklists to target their own common errors." PSP treats defect types as learnable patterns, not random events.

**Agent application:** Agent checklists should include known agent failure modes:
- Missing `aria-label` on icon-only buttons
- Raw hex color instead of design token
- Missing empty/error/loading state
- Wrong heading level for component type
- `tabular-nums` missing on financial amounts
- Dark mode not verified
- Mobile breakpoints not verified
- Stale doc references after rename/delete

---

## 4. Hypothesis-Driven Development

Every implementation decision is a hypothesis. The structure:

```
We believe [doing this]
For [this system/component]
Will achieve [this outcome]
We will know we are right when [we observe this measurable signal]
```

**The critical discipline:** Define validation criteria BEFORE the experiment, not after observing results. This prevents confirmation bias — verifying against what you hoped to find rather than what is actually there.

**Anti-pattern this prevents:** The "fix-by-guessing" loop — making changes until the symptom disappears without understanding the cause. This is treating symptoms rather than diagnosing disease.

### Evidence-Based Decision Standard

A decision is evidence-based when:
1. The claim is stated explicitly before evidence is gathered
2. Evidence is gathered by a method independent of the claim-holder's preference
3. The evidence is compared against the pre-stated success criteria
4. The decision and evidence are recorded for future reference

"Looks good to me" is not evidence. "Should work" is not evidence. A screenshot, a test result, a command output — those are evidence.

---

## 5. DMAIC and Deming: Quality Management

### DMAIC Applied to Agent Tasks

| Phase | Agent Application |
|---|---|
| **Define** | State the problem, acceptance criteria, and scope. What does DONE look like? |
| **Measure** | Gather baseline: current state, existing coverage, current defect rate |
| **Analyze** | Root cause analysis: WHY does the defect exist? What structural pattern causes it? |
| **Improve** | Implement the fix, targeting the root cause identified in Analyze |
| **Control** | Regression test, checklist update, documentation — prevent recurrence |

**The Control phase is what agents skip.** Fixing a bug without adding a regression test is a DMAIC failure. The defect will recur.

### Deming's Most Transferable Points

**Point 3 — Cease dependence on inspection.** Quality must be designed in, not inspected in at the end. Post-task review is a last resort, not the primary quality mechanism. Methodology that only activates when a reviewer asks is compliance theater.

**Point 5 — Improve constantly every process.** Every completed task is a data point. Wrap findings that identify a recurring pattern must update the checklist or skill — not just document the finding.

**Point 10 — Eliminate slogans and exhortations.** "Be more careful" and "write better code" are not instructions. Methodology replaces vague exhortations with specific, verifiable steps. "Check all interactive elements have visible focus states by tabbing through the page" is an instruction. "Make it accessible" is not.

**Point 14 — Put everybody to work to accomplish the transformation.** Methodology is not a layer added by reviewers — it is internalized by every agent at every step.

### PDCA Cycle

```
PLAN  → Define the task, declare acceptance criteria, identify risks
DO    → Implement
CHECK → Verify against acceptance criteria (not against memory of what you built)
ACT   → If passing: standardize the pattern. If failing: return to PLAN.
```

**Critical insight:** The ACT phase applies to SUCCESSES as well as failures. Patterns that work should be standardized — added to checklists, documented in guides, encoded in skills. Wrap findings must document both what was fixed (failure learning) and what worked well (success learning).

---

## 6. Aviation Checklists (Gawande)

### The Origin

1935: Boeing B-17 prototype crashed on its maiden flight. The pilot forgot to disengage a gust lock. The plane was too complex for one person to manage from memory. The solution was not to hire better pilots. It was to create a checklist.

### Two Categories of Failure

1. **Ignorance** — we don't know what to do
2. **Ineptitude** — we know what to do but fail to apply it under pressure

Modern professional failures are almost entirely category 2. Agents skip `aria-label` not because they don't know it's required, but because attention is on the primary task when the icon button is written. Checklists prevent ineptitude failures by making minimum necessary steps explicit and resistant to skipping.

### Checklist Design Principles

- **Short.** Include only items where skipping causes serious consequences. Not every step.
- **Calibrated.** Items should target the specific failure modes of the person/agent using the checklist. Generic checklists catch nothing.
- **Two types:** Do-confirm (work from memory, then confirm) vs. Read-do (read each item, then do it). Read-do for novel/complex tasks. Do-confirm for familiar tasks.
- **Point of use.** The checklist must be present at execution time, not in a document somewhere else.

### Why "Being More Careful" Doesn't Work

Agents skip steps because:
- Attention is allocated to the primary task, not peripheral completeness requirements
- Context window pressure creates implicit priority on the immediately visible goal
- There is no external forcing function triggering a stop
- "Close enough" is locally indistinguishable from "correct"

Methodology — not effort — is the solution. Structured gates that must be explicitly cleared, in sequence, with evidence.

---

## 7. Verification and Validation (V&V)

### The Distinction

**Verification:** Are we building the product RIGHT? (Does implementation match specification?)
**Validation:** Are we building the RIGHT product? (Does it meet the user's actual need?)

A component can pass all token checks (verified) but solve the wrong UX problem (not validated). Both must pass.

### DO-178C and NASA V&V

**Bidirectional traceability.** Every requirement traced to code implementing it, test verifying it, and test results confirming it. No requirement is "done" without the complete trace.

In safety-critical and mission-critical work, V&V is a first-class engineering activity, not a final polish pass. NASA's IV&V framing emphasizes correctness and quality throughout the SDLC, and NASA's systems-engineering guidance expects planned verification/validation flow, methods, matrices, and results. Agents that treat verification as overhead are misallocating effort. Implementation is cheap; ensuring it is correct is expensive and unavoidable.

**Independent verification.** The implementer's mental model contaminates their verification — they verify against what they INTENDED, not what they BUILT. Independent verification catches the gap.

---

## 8. EDDOps: Evaluation-Driven Development for LLM Agents

### Six Quality Drivers (arXiv, 2024)

| Driver | Requirement |
|---|---|
| **Lifecycle coverage** | Evaluation before deployment AND after AND continuously |
| **Metric mix** | End-to-end scores AND step-level checks AND slice-aware checks |
| **System-level anchor** | Evaluate full orchestration, not isolated model behavior |
| **Adaptive evaluation** | Stable baselines + triggered probes when context changes |
| **Closed feedback loops** | Findings must link to recorded changes — no untracked fixes |
| **Human oversight** | Escalate ambiguous or high-impact cases to human judgment |

### The Core Insight

Evaluation is not a terminal checkpoint. It is a governing capability spanning the entire lifecycle. It is not "the last thing before shipping." It is the mechanism by which quality is maintained across every phase.

**Slice-level validation:** After a fix, verify on the same failing case, not pooled aggregates. An improvement in overall scores that masks a regression in the failing case is a methodology failure.

**Traceability mandate:** "All changes must be versioned and linked to originating evidence." For agents: every fix must be traceable to a specific finding. "Cleaned it up" is not a valid change record.

---

## 9. The 8 Codifiable Patterns

These patterns appear across all source disciplines and translate directly into skill rules:

| # | Pattern | Sources | Rule |
|---|---|---|---|
| 1 | **Declare Before Act** | Cleanroom + PSP + HDD + Gawande | Externalize intent before implementation; catches wrong assumptions |
| 2 | **Quality Gates Are Hard Stops** | Cleanroom + DMAIC + DO-178C | Binary, blocking, measurable; "mostly passes" does not exist |
| 3 | **Defect Prevention at Earliest Phase** | Cleanroom + shift-left | Earlier prevention is cheaper and safer than late defect removal |
| 4 | **Evidence Replaces Belief** | HDD + PSP + V&V + EDDOps | Four components: criterion, test, observed result, comparison |
| 5 | **Failure Modes Are Learnable** | PSP personalization + Gawande | Checklists calibrated to known failure modes, not generic |
| 6 | **Methodology Must Be Internalized** | Deming Points 3, 14 | Quality designed in, not inspected in; compliance theater is not methodology |
| 7 | **Independent Verification for High-Stakes** | V&V + EDDOps human oversight | Implementer's mental model contaminates self-verification |
| 8 | **PDCA Standardizes Successes Too** | Deming PDCA ACT phase | Wrap findings encode what worked, not just what failed |

---

## 10. Anti-Patterns This Skill Prohibits

| Anti-Pattern | Source Discipline | Why It Fails |
|---|---|---|
| "Looks good to me" as verification | PSP, V&V, HDD | Not a trace, not evidence, not reproducible |
| Proceeding past a failing gate | Cleanroom, DO-178C | Downstream work compounds the upstream error |
| Testing only the happy path | PSP, Cleanroom, DO-178C | Error states are where failures concentrate in production |
| Fixing symptoms without root cause | DMAIC Analyze, HDD | Defect will recur under slightly different conditions |
| Self-certifying without structured evidence | V&V independence, EDDOps | Mental model contamination |
| Skipping pre-task "because it's simple" | PSP planning, Gawande | Simple tasks fail on overlooked assumptions MORE often |
| Only learning from failures, not successes | PDCA ACT phase, PSP post-mortem | Success patterns are lost; only error avoidance is encoded |
| Treating verification as overhead | V&V, DMAIC Control | Verification IS the work, not an addition to it |
| Vague completion criteria | DMAIC Define, HDD, DO-178C | Unmeasurable criteria cannot be verified |

## Grounding and Evaluation State

This skill is grounded in public methodology references: Mills et al. on Cleanroom software engineering, SEI PSP/TSP materials, ASQ DMAIC and PDCA resources, WHO checklist implementation guidance, NASA IV&V and systems-engineering V&V guidance, Barry O'Reilly's hypothesis-driven development framing, and the EDDOps arXiv paper for evaluation-driven LLM agent operations. The body also names historically important books and standards as bibliography, but those are not drift-hashable public URLs in this release artifact.

The current eval metadata remains conservative: `eval_artifacts: planned`, `eval_state: unverified`, and `routing_eval: absent`. Do not mark this skill verified or routing-present until a real comprehension eval and routing eval include `methodology` and pass in the same change.

---

## Verification

After applying this skill, verify:
- [ ] Agent can articulate the methodology (WHY) behind each process step
- [ ] Quality gates are binary pass/fail with evidence, not "mostly okay"
- [ ] Pre-task declaration exists before implementation began
- [ ] Post-task verification uses evidence, not belief
- [ ] Checklists are calibrated to known agent failure modes
- [ ] PDCA ACT phase captures successes, not just failures
- [ ] Changes are traceable to originating findings (EDDOps traceability)

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Reviewing a concrete diff or PR | `code-review` | code-review owns findings, severity, and merge verdicts |
| Restructuring code while preserving behavior | `refactor` | refactor owns behavior-preserving implementation work |
| Choosing unit/integration/contract/e2e coverage | `testing-strategy` | testing-strategy owns test-scope and test-level decisions |
| Writing agent eval cases or grader rubrics | `agent-eval-design` | agent-eval-design owns eval task design and thresholds |
| Blocking destructive or secret-bearing tool calls | `guardrails` | guardrails owns execution-time safety tripwires |
| Cross-cutting quality enforcement after specialist work | `best-practice` | best-practice owns broad quality gates across domains |

## Key Sources

- Mills, H., Dyer, M., and Linger, R. (1987). [Cleanroom Software Engineering](https://voljournals.utk.edu/utk_harlan/18/). IEEE Software.
- Humphrey, W. (2000). [The Team Software Process (TSP)](https://www.sei.cmu.edu/library/the-team-software-process-tsp/). SEI/CMU.
- CMU SEI. [Team Software Process (TSP) and Personal Software Process (PSP) Materials](https://www.sei.cmu.edu/library/team-software-process-tsp-and-personal-software-process-psp-materials/).
- WHO. [Implementation manual: WHO surgical safety checklist](https://www.who.int/publications/i/item/9789241598590).
- Boyd, J. (1976). OODA Loop. USAF.
- Deming, W.E. (1986). Out of the Crisis. MIT Press.
- DO-178C. Software Considerations in Airborne Systems and Equipment Certification.
- IEEE 1012. Standard for System, Software, and Hardware Verification and Validation.
- NASA. [IV&V Overview](https://www.nasa.gov/ivv-overview/).
- NASA. [Systems Engineering Handbook Appendix: V&V Plan outline](https://www.nasa.gov/reference/system-engineering-handbook-appendix/).
- ASQ. [DMAIC Process](https://asq.org/Quality-resources/Dmaic).
- ASQ. [PDCA Cycle](https://asq.org/quality-resources/pdca-cycle).
- Barry O'Reilly. [How to Implement Hypothesis-Driven Development](https://barryoreilly.com/explore/blog/how-to-implement-hypothesis-driven-development/).
- Xia et al. [Evaluation-Driven Development and Operations of LLM Agents](https://arxiv.org/abs/2411.13768). arXiv:2411.13768.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Public: `true`
- Domain: `quality/method`
- Scope: Portable methodology design for rigorous agent work: planning multi-step implementations, designing quality gates, establishing verification protocols, and building checklists calibrated to known failure modes. Covers methodology/method/process distinctions, Cleanroom defect prevention, PSP/TSP measurement discipline, hypothesis-driven development, DMAIC/PDCA quality management, checklist design, V&V frameworks, EDDOps, and hard-stop quality gates. Excludes concrete PR review (code-review), behavior-preserving implementation changes (refactor), test-level selection (testing-strategy), eval-case/rubric authoring (agent-eval-design), and high-risk action blocking (guardrails).

**When to use**
- design a verification protocol for this multi-step agent workflow before implementation starts
- turn these recurring agent failure modes into a checklist and hard quality gate
- explain why this process step exists instead of just telling the agent to follow it
- choose whether this task needs PDCA, DMAIC, hypothesis-driven development, or V&V-style traceability
- build a methodology-backed plan for preventing defects earlier in this skill audit loop
- convert a vague done checklist into binary gates with evidence receipts
- Triggers: `methodology-skill`

**Not for**
- review this PR and decide whether to approve it
- refactor this file while preserving behavior
- decide unit vs integration vs e2e coverage for this feature
- write the eval cases and grader rubric for this router
- block this dangerous git command or secret-bearing tool call

**Related skills**
- Verify with: `best-practice`, `agent-eval-design`, `okrs`
- Related: `testing-strategy`, `guardrails`, `best-practice`, `agent-eval-design`, `code-review`

**Grounding**
- Mode: `universal`
- Truth sources: `https://voljournals.utk.edu/utk_harlan/18/`, `https://www.sei.cmu.edu/library/the-team-software-process-tsp/`, `https://www.sei.cmu.edu/library/team-software-process-tsp-and-personal-software-process-psp-materials/`, `https://asq.org/Quality-resources/Dmaic`, `https://asq.org/quality-resources/pdca-cycle`, `https://www.who.int/publications/i/item/9789241598590`, `https://www.nasa.gov/ivv-overview/`, `https://www.nasa.gov/reference/system-engineering-handbook-appendix/`, `https://barryoreilly.com/explore/blog/how-to-implement-hypothesis-driven-development/`, `https://arxiv.org/abs/2411.13768`

**Keywords**
- `methodology`, `method`, `process`, `formal methods`, `cleanroom`, `PSP`, `TSP`, `hypothesis driven`, `DMAIC`, `PDCA`

<!-- skill-graph-context:end -->
