# Findings

## Skill

`principled-negotiation`

## Audit Date

2026-05-31

## Verdict Summary

Integrity Gate: PASS. Behavior Gate: comprehension eval completed with `SKIPPED_BASELINE_HIGH`; application verdict remains `UNVERIFIED` because no certifying application grader run was executed.

## Findings

ID: F1
Severity: P4
Surface: activation
Category: Activation quality - routing coverage
Problem: No required fix.
Evidence: The description, keywords, triggers, examples, and anti-examples name principled negotiation, BATNA, reservation value, ZOPA, objective criteria, interest-based bargaining, mutual gain, legal-advice boundaries, and adjacent strategy/decision skills. A fresh route run for "prepare a BATNA negotiation brief and find the ZOPA" selected `principled-negotiation` first with BATNA/ZOPA evidence.
Required action: None.

ID: F2
Severity: P4
Surface: relations
Category: Relation quality - graph correctness
Problem: No required fix.
Evidence: `relations.boundary` excludes `expected-value`, `playing-to-win`, `positioning`, `radical-candor`, and `methodology` with ownership reasons matching the skill body. `related` and `verify_with` connect to decision quality and epistemic checks without claiming project-specific dependencies.
Required action: None.

ID: F3
Severity: P4
Surface: grounding
Category: Grounding quality - claims vs truth sources
Problem: No required fix; external-source hashing remains intentionally unresolved.
Evidence: Local reference files are hashed in `drift_check.truth_source_hashes`. The skill cites Harvard Program on Negotiation pages for principled negotiation and BATNA and records a 2026-05-31 upstream displacement check. Because web sources are not hash-locked by the Skill Graph drift checker, `drift_status` is `EXTERNAL_UNHASHED` and `truth_verdict` remains `UNVERIFIED`.
Required action: None for this creation run. A later audit may add archived source snapshots if the corpus adopts external-source hash storage.

ID: F4
Severity: P4
Surface: content
Category: Content quality - completeness and density
Problem: No required fix.
Evidence: The skill includes Concept of the skill, Domain Context, Coverage, Philosophy of the skill, fit decision table, relationship/substance table, interests table, option-package table, objective-criteria table, BATNA/reservation/ZOPA table, negotiation-brief template, hard-bargaining response table, Verification checklist, and Do NOT Use When table. Negative bounds cover persuasion copy, legal advice, crisis negotiation, broad strategy, positioning, management feedback, and one-party expected-value analysis.
Required action: None.

ID: F5
Severity: P4
Surface: evals
Category: Eval quality - coverage and realism
Problem: No required fix; application certification is still pending.
Evidence: `evals/comprehension.json` contains seven comprehension evals covering definition, mental model, purpose, boundary, taxonomy, analogy, and application. `evals/evals.json` contains seven application-style evals covering vendor renewals, salary negotiation, acquisition-offer boundary routing, relationship/accommodation anti-patterns, BATNA mistakes, hard bargaining, and legal-advice safety boundaries. The comprehension runner produced `eval_score: 4.38`, `eval_failed_ids: []`, and `comprehension_verdict: SKIPPED_BASELINE_HIGH`.
Required action: None for comprehension. Run a certifying application grader before changing `application_verdict` from `UNVERIFIED`.

ID: F6
Severity: P4
Surface: portability
Category: Portability quality - external skill runtime readiness
Problem: No required fix.
Evidence: The skill is `deployment_target: portable`, uses only `Read` and `Grep`, keeps examples synthetic, declares GDPR/confidentiality limits, and stores all local supporting artifacts under the skill directory.
Required action: None.

## Required Fixes

None.
