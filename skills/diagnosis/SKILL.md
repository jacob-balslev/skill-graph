---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: diagnosis
description: "Use when facing an unknown software failure, when symptoms point to different root causes, or when an initial debugging attempt has not converged. Provides a triage-first diagnostic routing framework: classify the failure, collect the right evidence, choose a technique, track confidence, and escalate when stuck. Do NOT use for executing scientific debugging after triage (use `debugging`), code-quality review (use `code-review`), or proactive observability setup."
version: 1.0.0
type: capability
browse_category: knowledge
category: engineering/debugging
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Language- and stack-agnostic. The classification taxonomy, evidence protocol, and confidence ladder apply to any software failure investigation; specific technique names (git bisect, EXPLAIN plans, HMAC verification) are illustrative — substitute the equivalents of your stack."
allowed-tools: Read Grep
keywords:
  - diagnostic triage software failure
  - symptom classification taxonomy
  - what kind of bug is this
  - which debugging approach
  - diagnostic routing framework
  - evidence collection before hypothesis
  - confidence ladder debugging
  - escalation criteria debugging
  - cascade vs coincidence failure
  - environment ghost
  - failure not converging
  - misclassified symptom debugging
  - stuck at level 1 diagnosis
  - debug technique selection matrix
  - configuration vs code error
  - timing vs logic error
  - integration boundary failure
  - data integrity vs logic error
examples:
  - "the agent has been chasing this bug for 30 minutes — what's the structural fix?"
  - "the symptoms span data integrity and UI rendering — which is the root cause?"
  - "the build fails locally but passes in CI — how do I diagnose that class first?"
  - "I have a stack trace and an unhandled exception — what's the cheapest technique?"
  - "intermittent failure that doesn't reproduce on retry — which class is this?"
  - "we ran profiling, instrumentation, and bisect — none converge. What did we misclassify?"
  - "two engineers disagree on whether this is a config issue or a logic error — what evidence settles it?"
anti_examples:
  - "actually execute scientific-method debugging on this stack trace" # → debugging
  - "review this AI-generated PR for correctness" # → code-review
  - "scan this repo for OWASP top 10 vulnerabilities" # → owasp-security
  - "design observability instrumentation for this service" # → an observability skill
  - "decide which agent should pick up this ticket" # → skill-router
  - "what's the right test pyramid for this feature" # → testing-strategy
relations:
  boundary:
    - skill: debugging
      reason: "debugging is the *execution* phase (run a chosen technique against an already-classified failure); diagnosis is the *triage* phase before debugging — classify first, then debug"
    - skill: code-review
      reason: "code-review evaluates code for quality / correctness in advance; diagnosis investigates an already-broken behavior"
    - skill: owasp-security
      reason: "owasp-security is a domain-specific scan against a known threat list; diagnosis is the cross-domain triage that routes to security investigation only when symptoms point there"
    - skill: testing-strategy
      reason: "testing-strategy decides what to test proactively; diagnosis decides how to investigate after a test (or production) has revealed a failure"
  related:
    - debugging
    - error-tracking
    - code-review
  verify_with:
    - debugging
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Diagnosis

## Coverage

The triage-first framework that classifies a software failure into a _problem class_ and routes it to the right diagnostic technique before root-cause investigation begins. Names nine symptom classes — Logic Error, Runtime Crash, Data Integrity, Timing / Race, Performance, Configuration, Security, Integration, Tooling / Build / Script-path — and provides a classification decision tree that walks from "is there a stack trace?" to a single class. Specifies a universal evidence-collection protocol (exact error message, reproduction steps, last-known-good state, environment facts) and class-specific evidence checklists. Lays out the technique-selection matrix — stack-trace reading, data-flow tracing, git bisect, differential comparison, instrumentation, MRE isolation, profiling, boundary probing — with each technique's time cost, best-case class, and evidence prerequisite. Defines the diagnostic confidence ladder (level 0 Symptom → 1 Classified → 2 Localized → 3 Root Cause → 4 Verified Fix) with explicit "you can say / you cannot say" boundaries at each level and stuck-state checkpoints (5-min, 10-min, 15-min, oscillation). Names escalation criteria for switching approach, switching class, or escalating to a human. Covers three cross-domain patterns where multiple classes apply simultaneously: the Cascade (one root cause, many symptoms), the Coincidence (two unrelated bugs that look like one), the Environment Ghost (works in one environment, fails in another). Catalogues diagnostic anti-patterns and ships a structured diagnostic-session template.

## Philosophy

Debugging fails most often not because the engineer lacks skill, but because the wrong methodology is applied to the problem class. A timing bug needs different tools than a data-integrity bug. A multi-tenant leak needs different thinking than a rendering glitch. The most expensive debugging mistake is spending 30 minutes applying scientific-method debugging to what is actually a configuration error discoverable in 2 minutes.

This skill is the triage _nurse_, not the surgeon. A nurse does not treat the patient — they take vital signs, route to cardiology or neurology, and escalate to the attending physician when criteria are met. Software diagnosis works the same way: collect evidence, classify the symptom, route to the right specialist technique, and pivot when convergence stalls. The 2–5 minute cost of triage is always smaller than the 30-minute cost of misdiagnosis. Skipping triage because "the cause is obvious" fails roughly 60% of the time on non-trivial bugs (confirmation bias) — even seasoned engineers benefit from making the classification step explicit.

## 1. The Diagnostic Triage Protocol

Before debugging, diagnose which _kind_ of problem you have. The class determines the technique and the technique determines the time-to-fix.

```
1. Collect baseline evidence (Section 3)
2. Classify the symptom            (Section 2)
3. Select the diagnostic technique (Section 4)
4. Execute using the routed technique
5. If not converging after 3 attempts, escalate (Section 6)
```

**Rule:** never start fixing before completing steps 1–3. The cost of misclassification exceeds the cost of five minutes of triage every time.

## 2. Symptom-Classification Taxonomy

Every failure falls into one of nine classes. Each class has a primary diagnostic technique.

| Class                             | Symptoms                                                                              | Primary technique                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Logic Error**                   | Wrong output, wrong calculation, wrong state transition                               | Trace data flow; compare expected vs actual at each stage                                                       |
| **Runtime Crash**                 | Unhandled exception, process exit, 500 error                                          | Read stack trace; find the throwing line; check preconditions                                                   |
| **Data Integrity**                | Missing records, wrong totals, duplicate entries, cross-tenant leak                   | Compare source data to derived data at each transform stage                                                     |
| **Timing / Race**                 | Intermittent failure, works on retry, order-dependent                                 | Add timestamps to logs; look for concurrent mutations; check locks                                              |
| **Performance**                   | Slow response, timeout, memory growth, CPU spike                                      | Profile _first_ (measure before hypothesizing); find the hot path                                               |
| **Configuration**                 | Works locally but not in staging / prod, env-dependent                                | Diff environments — env vars, versions, feature flags, DNS, SSL                                                 |
| **Security**                      | Auth bypass, data exposure, HMAC failure, injection                                   | Follow data flow from untrusted input to sensitive operation                                                    |
| **Integration**                   | Webhook not arriving, API returning unexpected shape, sync drift                      | Check both sides of the boundary independently, then compare                                                    |
| **Tooling / Build / Script-path** | `Cannot find module`, wrong cwd, stale script paths, `read EIO`, `ENOENT` on a script | Verify path resolution; check cwd; verify dependency install; compare referenced path vs actual filesystem path |

### Classification decision tree

```
Is there a stack trace or error message?
  YES → Does it point to a specific line?
          YES → Runtime Crash (read the line; check preconditions)
          NO  → Is it a timeout or OOM?
                  YES → Performance
                  NO  → Logic Error (the error is a symptom of wrong state)
  NO  → Is the output wrong but no error thrown?
          YES → Is the wrongness in calculated numbers or records?
                  YES → Data Integrity
                  NO  → Logic Error
          NO  → Is it intermittent?
                  YES → Timing / Race
                  NO  → Does it depend on environment?
                          YES → Configuration
                          NO  → Does the error message contain a file/module path?
                                  YES → Tooling / Build / Script-path
                                  NO  → Does it involve external services?
                                          YES → Integration
                                          NO  → Are there security signals
                                                (auth failure, permission error,
                                                unexpected data exposure, HMAC failure,
                                                access-control bypass)?
                                                  YES → Security
                                                  NO  → Unknown / Unclassified
                                                          → restart evidence collection;
                                                            run a fresh investigative sweep
```

## 3. Evidence-Collection Protocol

Before forming any hypothesis, collect baseline evidence. The class determines the additional evidence needed beyond the universal set.

### Universal evidence (always collect)

| Evidence                            | How to collect                                               | Why                                      |
| ----------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Exact error message or wrong output | Copy from logs, terminal, or UI                              | Prevents paraphrasing errors             |
| Reproduction steps                  | The minimal sequence that triggers the failure               | Proves the bug exists and is testable    |
| Last-known-good state               | `git log --oneline -10`, recent deploys, recent data changes | Brackets the introduction window         |
| Environment facts                   | Runtime version, env vars, database state, running services  | Eliminates the Configuration class early |

### Class-specific evidence

| Class                         | Additional evidence to collect                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Logic Error                   | Input data, expected output, actual output, intermediate values at key transform points                                             |
| Runtime Crash                 | Full stack trace, request payload, database state at crash time                                                                     |
| Data Integrity                | Source record count vs derived count, sample rows from each stage, tenant / scope identifiers                                       |
| Timing / Race                 | Timestamps of concurrent operations, lock state, retry behaviour, whether it reproduces under load                                  |
| Performance                   | Response-time baseline, CPU / memory profile, query plans (EXPLAIN), N+1 query check                                                |
| Configuration                 | Env-var diff (local vs staging vs prod), package-version diff, feature-flag state                                                   |
| Security                      | Auth state, session-token contents, role / permission, request headers, HMAC comparison                                             |
| Integration                   | Request / response pair from both sides, delivery logs, timestamp alignment                                                         |
| Tooling / Build / Script-path | Module-resolution output, current working directory at failure, dependency-install verification, referenced path vs filesystem path |

**Rule:** if you cannot fill the universal evidence table, you are not ready to hypothesize. Collect first, think second.

## 4. Technique-Selection Matrix

Once the symptom is classified, pick the cheapest technique that could resolve the class.

| Technique                        | Best for                                     | Time cost      | Evidence required                       |
| -------------------------------- | -------------------------------------------- | -------------- | --------------------------------------- |
| **Stack-trace reading**          | Runtime crashes, unhandled exceptions        | 1–2 min        | Stack trace                             |
| **Data-flow tracing**            | Logic errors, data integrity                 | 5–15 min       | Input + output at each stage            |
| **Binary search (`git bisect`)** | Regressions with known-good state            | 3–10 min       | Known-good commit + reproducible test   |
| **Differential comparison**      | Configuration, environment-dependent failure | 2–5 min        | Two environments to compare             |
| **Instrumentation (logging)**    | Timing / race, intermittent failures         | 5–10 min setup | Hypothesis about where to instrument    |
| **Isolation (MRE)**              | Complex failures with many variables         | 10–20 min      | Reproducible failure                    |
| **Profiling**                    | Performance, memory, CPU                     | 5–15 min       | Running system under load               |
| **Boundary probing**             | Integration failures                         | 5–10 min       | Access to both sides of the integration |

### Technique-ordering principle

Always start with the cheapest technique that could resolve the class:

1. **Read the error** (~30 s) — solves ~40% of runtime crashes
2. **Check the environment** (~1 min) — solves ~30% of configuration issues
3. **Trace the data flow** (~5 min) — solves ~50% of logic / data errors
4. **Isolate with MRE** (~10 min) — solves most of what remains
5. **Instrument and observe** (~10+ min) — last resort for timing / intermittent failures

## 5. The Diagnostic Confidence Ladder

As evidence accumulates, confidence in the diagnosis should increase _monotonically_. If it doesn't, the symptom has been misclassified.

| Level            | Confidence | You can say                                             | You cannot say           |
| ---------------- | ---------- | ------------------------------------------------------- | ------------------------ |
| 0 — Symptom      | 0%         | "Something is wrong"                                    | Anything about the cause |
| 1 — Classified   | 20%        | "This is a [class] problem"                             | Where specifically       |
| 2 — Localized    | 50%        | "The failure is in [module / file / function]"          | What exactly is wrong    |
| 3 — Root cause   | 80%        | "The cause is [specific condition]"                     | That the fix will work   |
| 4 — Verified fix | 95%        | "This fix resolves the root cause and does not regress" | Nothing — ship it        |

### Stuck-state checkpoints

- **Stuck at level 0 for > 5 min** → you need more evidence; restart Section 3
- **Stuck at level 1 for > 10 min** → likely misclassification; re-run the classification tree
- **Stuck at level 2 for > 15 min** → the problem may be cross-domain; check whether multiple classes apply
- **Oscillating between levels** → stop. Write down what you _know_ vs what you're _assuming_. The assumption is wrong.

## 6. Escalation Criteria

### Switch diagnostic approach when

| Signal                                           | Action                                              |
| ------------------------------------------------ | --------------------------------------------------- |
| Three hypotheses tested, none confirmed          | Re-classify the symptom from scratch                |
| Fix works locally but not in target env          | Switch to Configuration-class techniques            |
| Multiple symptoms that don't share a root cause  | You may have 2+ bugs; triage each independently     |
| Evidence contradicts the classification          | Trust the evidence; re-classify                     |
| Confidence has _decreased_ over the last 3 steps | Stop. You're making it worse. Fresh context needed. |

### Escalate to human when

| Signal                                                                | Why a human is needed           |
| --------------------------------------------------------------------- | ------------------------------- |
| Requires access you don't have (production DB, third-party dashboard) | Authorization boundary          |
| Business-logic ambiguity ("should this return 0 or null?")            | Product decision, not technical |
| Fix requires a breaking change to a public API                        | Stakeholder alignment needed    |
| Reproduction requires real user data you cannot access                | Privacy / compliance boundary   |
| 30 minutes of investigation with no progress                          | Fresh perspective needed        |

## 7. Cross-Domain Patterns

Some failures span multiple classes simultaneously. These compound failures are the hardest to diagnose.

### Pattern: the Cascade

A single root cause triggers symptoms across multiple classes.

```
Root cause: missing null-check in a data transform
  → Data Integrity symptom: wrong totals
  → Logic Error symptom:    UI shows negative values
  → Integration symptom:    webhook payload rejected by partner
```

**Diagnostic approach:** find the _earliest_ symptom in the data flow. That's closest to the root cause.

### Pattern: the Coincidence

Two unrelated bugs appear simultaneously, creating a misleading compound symptom.

```
Bug A: CSS regression from a recent deploy        (Logic Error)
Bug B: slow API from an unrelated query change    (Performance)
Combined symptom: "the page is broken and slow"
```

**Diagnostic approach:** separate the symptoms. Test each independently. If fixing one doesn't affect the other, they're independent bugs.

### Pattern: the Environment Ghost

Works in one environment, fails in another, with no code difference.

```
Local:    works   (runtime 20.11, .env.local, fresh DB)
Staging:  fails   (runtime 20.9,  CI env vars, migrated DB)
```

**Diagnostic approach:** diff _everything_ — runtime versions, env vars, DB state, feature flags, DNS, SSL, headers. The first difference you find is usually the cause.

## 8. Anti-Patterns

| Anti-pattern                               | Why it fails                                            | Correct                                          |
| ------------------------------------------ | ------------------------------------------------------- | ------------------------------------------------ |
| Fixing before diagnosing                   | Treats the symptom; root cause persists                 | Complete the triage protocol first               |
| Hypothesis without evidence                | Confirmation bias drives you toward your guess          | Collect universal evidence before any hypothesis |
| Changing multiple variables at once        | Cannot determine which change had the effect            | One variable at a time                           |
| Assuming the obvious cause                 | The obvious cause is wrong ~60% of the time             | Verify with evidence even when "obvious"         |
| Debugging by `printf` without a hypothesis | Random instrumentation wastes time                      | Instrument to test a _specific_ hypothesis       |
| Applying the wrong class's technique       | Performance profiling won't find a logic error          | Re-classify if the technique isn't converging    |
| Escalating too early                       | Hasn't gathered enough evidence for a useful escalation | Fill the evidence table before escalating        |
| Escalating too late                        | Spent 45 minutes on what a human could resolve in 5     | Follow the time-based escalation triggers        |

## 9. Diagnostic-Session Template

Use this template to structure a diagnostic session. It prevents skipping steps.

```markdown
## Diagnostic Session: [Brief description]

### 1. Symptom

- What: [exact error or wrong behavior]
- Where: [route / component / job]
- When: [always / intermittent / environment-specific]
- Since: [commit / deploy / data change]

### 2. Classification

- Primary class: [from taxonomy]
- Confidence: [0–4 level]
- Technique: [from technique matrix]

### 3. Evidence Collected

- [ ] Error message / wrong output (exact)
- [ ] Reproduction steps (minimal)
- [ ] Last-known-good state
- [ ] Environment facts
- [ ] Class-specific evidence: [list]

### 4. Hypotheses Tested

| #   | Hypothesis | Test | Result | Confidence after |
| --- | ---------- | ---- | ------ | ---------------- |
| 1   |            |      |        |                  |

### 5. Resolution

- Root cause: [one sentence]
- Fix: [what was changed]
- Prevention: [test / guard / doc added]
```

## Verification

- [ ] The symptom was classified before any debugging technique was chosen
- [ ] Baseline evidence was collected before any hypothesis was formed
- [ ] The cheapest technique that could resolve this class was tried first
- [ ] Confidence increased monotonically — or the symptom was re-classified the moment it didn't
- [ ] If the approach was changed, the reason was documented (which signal triggered the switch)
- [ ] The time-based stuck-state checkpoints were respected (5-min / 10-min / 15-min triggers)
- [ ] If the failure spanned multiple classes, the cross-domain pattern (Cascade / Coincidence / Environment Ghost) was named explicitly

## Do NOT Use When

| Use instead        | When                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debugging`        | Actually executing scientific-method debugging on a failure that has _already_ been classified — this skill routes to debugging; it does not replace it |
| `code-review`      | Reviewing code for quality / correctness _before_ a failure exists — diagnosis is downstream                                                            |
| `owasp-security`   | A focused security audit against a known threat list — diagnosis only routes here when symptoms point at security                                       |
| `testing-strategy` | Deciding what to test proactively — diagnosis is for _reactive_ investigation after a failure                                                           |
| `error-tracking`   | Setting up the production-error-capture / sampling / alerting stack — diagnosis investigates a _specific_ failure already in front of you               |
| `skill-router`     | Choosing which agent skill activates for an arbitrary query — that's cross-skill dispatch, not failure triage                                           |
