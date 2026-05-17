---
name: methodology
description: "Use when planning multi-step implementations, designing quality gates, establishing verification protocols, or building agent checklists calibrated to known failure modes. Covers methodology/method/process distinctions, Cleanroom, PSP/TSP, hypothesis-driven development, DMAIC, checklist design, V&V frameworks, EDDOps, quality gates, and PDCA. Do NOT use for code-review verdicts (use `code-review`), behavior-preserving implementation work (use `refactor`), or test strategy (use `testing-strategy`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  metadata: "{\"schema_version\":6,\"version\":\"1.0.0\",\"type\":\"capability\",\"category\":\"quality\",\"domain\":\"quality/method\",\"scope\":\"reference\",\"owner\":\"skill-graph-maintainer\",\"freshness\":\"2026-04-01\",\"drift_check\":\"{\\\\\\\"last_verified\\\\\\\":\\\\\\\"2026-04-01\\\\\\\"}\",\"eval_artifacts\":\"planned\",\"eval_state\":\"unverified\",\"routing_eval\":\"absent\",\"stability\":\"experimental\",\"keywords\":\"[\\\\\\\"methodology\\\\\\\",\\\\\\\"method\\\\\\\",\\\\\\\"process\\\\\\\",\\\\\\\"formal methods\\\\\\\",\\\\\\\"cleanroom\\\\\\\",\\\\\\\"PSP\\\\\\\",\\\\\\\"TSP\\\\\\\",\\\\\\\"hypothesis driven\\\\\\\",\\\\\\\"DMAIC\\\\\\\",\\\\\\\"PDCA\\\\\\\",\\\\\\\"Deming\\\\\\\",\\\\\\\"quality gates\\\\\\\",\\\\\\\"checklist manifesto\\\\\\\",\\\\\\\"verification validation\\\\\\\",\\\\\\\"DO-178C\\\\\\\",\\\\\\\"V&V\\\\\\\",\\\\\\\"EDDOps\\\\\\\",\\\\\\\"defect prevention\\\\\\\",\\\\\\\"shift left\\\\\\\",\\\\\\\"evidence based\\\\\\\"]\",\"triggers\":\"[\\\\\\\"methodology-skill\\\\\\\"]\",\"portability\":\"{\\\\\\\"readiness\\\\\\\":\\\\\\\"scripted\\\\\\\",\\\\\\\"targets\\\\\\\":[\\\\\\\"skill-md\\\\\\\"]}\",\"lifecycle\":\"{\\\\\\\"stale_after_days\\\\\\\":90,\\\\\\\"review_cadence\\\\\\\":\\\\\\\"quarterly\\\\\\\"}\",\"skill_graph_source_repo\":\"https://github.com/jacob-balslev/skill-graph\",\"skill_graph_protocol\":\"Skill Metadata Protocol v5\",\"skill_graph_project\":\"Skill Graph\",\"skill_graph_canonical_skill\":\"skills/methodology/SKILL.md\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/methodology/SKILL.md
---
# Methodology

## Domain Context

**What is this skill?** Provides the philosophical framework (methodology), specific techniques (methods), and ordered execution sequences (processes) that govern rigorous agent work. Covers the methodology-method-process stack, Cleanroom defect prevention, PSP/TSP measurement discipline, hypothesis-driven development, DMAIC quality management, aviation checklist design (Gawande), V&V frameworks (DO-178C/NASA), EDDOps for LLM agents, quality gates as hard stops, and the PDCA cycle for standardizing successes. Use when planning multi-step implementations, designing quality gates, establishing verification protocols, building agent checklists calibrated to known failure modes, or when an agent needs to understand WHY a process step exists (not just THAT it exists). Do NOT use for the specific behavioral rules of completeness and honesty (use methodical), quality definitions per artifact (use quality-doctrine), or generate-critique-revise loop mechanics (use self-review-pattern).

## Coverage

This skill covers the foundational frameworks that make rigorous agent work possible: the methodology-method-process three-layer stack (why these steps, not just which steps), Cleanroom defect prevention (quality built in, not inspected in), PSP/TSP measurement discipline (plan, review, post-mortem), hypothesis-driven development (define success criteria before the experiment), DMAIC/PDCA quality management (especially the skipped Control/Act phases), Gawande checklist design (calibrated to known failure modes, not generic), V&V frameworks from safety-critical industries (DO-178C bidirectional traceability, NASA verification standards), EDDOps for LLM agent evaluation (lifecycle coverage, slice-level validation, closed feedback loops), quality gates as hard stops (binary, blocking, measurable), and the 8 codifiable methodology patterns synthesized across all source disciplines.

## Philosophy

Agents default to executing process without methodology. They apply steps without understanding the principle that makes the steps necessary, which is exactly why they skip steps that feel low-value in the moment. A pilot who knows the B-17 crash story understands why the gust-lock check exists. A pilot who just has a checklist might skip it when running late.

The academic distinction is load-bearing: **Methodology** is the philosophical framework — WHY you approach work a certain way. **Method** is a specific technique within the methodology. **Process** is the ordered sequence of steps executing a method. One process can contain multiple methods; one method can serve many processes. But without methodology, the agent has no basis for deciding when to apply extra rigor, when to challenge a process that seems wasteful, or when a shortcut is genuinely safe vs. when it compromises the underlying principle.

This skill installs the WHY. The `methodical` skill installs the behavioral rules. Together they prevent both "knows the steps but skips them" (ineptitude) and "follows steps mechanically without understanding when they matter" (cargo culting).

## Trio Boundaries

methodology provides the *frameworks and principles* behind rigorous execution. It does NOT provide the specific behavioral rules for completeness and honesty — use `methodical` for that. It does NOT define what quality means per artifact type — use `quality-doctrine` for that. It does NOT provide the generate-critique-revise loop mechanics — use `self-review-pattern` for that.

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

### The Defect Cost Theorem

| Phase Detected | Cost Multiplier |
|---|---|
| During design | 1x |
| During code review | 6-10x |
| During testing | 25-100x |
| In production | 100x+ |

Source: IBM Systems Sciences Institute, widely cited.

**Translation to agent work:** Every pre-implementation check (acceptance criteria declared, existing patterns audited, assumptions externalized) prevents a post-task revision cycle. The PRE-TASK gate is not optional even when the task feels simple — simple tasks fail most often on defects that a pre-task check would have caught, because the agent doesn't bother checking assumptions it believes are obvious.

---

## 3. PSP/TSP: Measurement at the Individual Level

The Personal Software Process (Watts Humphrey, SEI/CMU) applies capability maturity principles to individual engineers. TSP teams missed target schedules by an average of only 6%, versus a one-third failure rate for unaided projects.

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

**V&V accounts for 70% of total development effort** in safety-critical industries. This is not waste — it is the work. Agents that treat verification as overhead are misallocating effort. Implementation is cheap; ensuring it is correct is expensive and unavoidable.

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
| 3 | **Defect Prevention at Earliest Phase** | Cleanroom cost theorem + shift-left | Upstream checks cost 1x; downstream costs cascade to 100x |
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
| Treating verification as overhead | V&V (70% of effort), DMAIC Control | Verification IS the work, not an addition to it |
| Vague completion criteria | DMAIC Define, HDD, DO-178C | Unmeasurable criteria cannot be verified |

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
| Enforcing completeness and honesty rules | `methodical` | methodical has the 10 rules and anti-pattern catalog |
| Defining what "better" means per artifact | `quality-doctrine` | quality-doctrine owns quality definitions |
| Implementing generate-critique-revise loops | `self-review-pattern` | self-review-pattern owns the loop mechanics |
| Sequencing task phases | `task-execution` | task-execution owns the workflow |
| Designing agent governance policies | `agent-governance` | agent-governance owns policy and authority boundaries |

## Key Sources

- Mills, H. (1987). Cleanroom Software Engineering. IEEE Software.
- Humphrey, W. (1995). A Discipline for Software Engineering (PSP). Addison-Wesley.
- Humphrey, W. (2000). Introduction to the Team Software Process. SEI/CMU.
- Gawande, A. (2009). The Checklist Manifesto. Metropolitan Books.
- Boyd, J. (1976). OODA Loop. USAF.
- Deming, W.E. (1986). Out of the Crisis. MIT Press.
- DO-178C. Software Considerations in Airborne Systems and Equipment Certification.
- IEEE 1012. Standard for System, Software, and Hardware Verification and Validation.
- NASA (2014). Verification and Validation. Technical Reports Server.
- EDDOps (2024). Evaluation-Driven Development of LLM Agents. arXiv:2411.13768.
- Barry O'Reilly. Hypothesis-Driven Development.
- Thoughtworks. How to Implement Hypothesis-Driven Development.
