# ADR-0022: Representative Generator Measured by Frontier Judges

> Status: Accepted (2026-06-13)
> Decision owner: Jacob (2026-06-08 SKI-306 board decision)
> Implements: SKI-306
> Supersedes: frontier-generator eval wording in pre-2026-06-13 audit-loop docs.

## Context

The Skill Audit Loop's behavior gate needs to answer: does loading this skill change agent behavior on realistic cases?

The prior certifying eval used frontier models as both generators and judges: one direction had Opus answer and GPT grade, and the other had GPT answer and Opus grade. That shape gave strong judges, but it also made the measured subject the frontier model itself. On many skills, the frontier baseline already knew the broad concept, so the eval produced no certified `APPLICABLE` results even when the skill could still help the agents that routinely consume skills.

That was a deployment-population mismatch. The behavior gate should measure a capable deployment-representative agent using the skill, while frontier models decide whether the measured behavior is better.

## Decision

Use the `representative-generator` role as the measured eval generator for normal certifying behavior evals. Today the role resolves to Sonnet through the model registry.

Use the mandatory frontier pair as judges:

- The **Claude** judge direction: `representative-generator` answers; Opus judges.
- The **Codex** judge direction: `representative-generator` answers; GPT judges.

Reconcile conservatively. `PASS` / `APPLICABLE` is reachable only when both frontier judge directions independently reach the certifying verdict under an identical execution profile and resolved model provenance.

Record new bidirectional receipts with:

- `measured_generator`: the generator role used for the measured subject.
- `generator_population`: `deployment-representative`.
- `applicable_for`: `representative` when both frontier judges certify; `neither` otherwise.

Keep accepting legacy `applicable_for: anthropic | openai | both | neither` values when reading old receipts, but do not write those values for new representative-generator certifying runs.

## Consequences

`no-lesser-models-for-quality` remains intact. Sonnet is not authoring quality and is not judging quality; it is the measured subject. Skill authorship, curation, merge decisions, and verdict decisions remain frontier-model work.

A single frontier judgment over representative-generator output is not enough to certify. It can record lower-confidence evidence, but certification requires both frontier judges to agree.

The enum name `EQUIVALENT_ON_FRONTIER` is retained for compatibility. In new prose it means there was measurement headroom but the skill produced no marginal lift for the measured generator on that case set.

This is a SYSTEM decision only. It does not restamp individual skills, edit `SKILL.md` files, or rewrite per-skill audit artifacts. Corpus re-grades happen later through the CONTENT audit loop, one skill at a time.

## References

- [`docs/verdict-semantics.md`](../verdict-semantics.md)
- [`docs/skill-audit-loop-philosophy.md`](../skill-audit-loop-philosophy.md)
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](../../skill-audit-loop/SKILL_AUDIT_LOOP.md)
- [`lib/audit/run-bidirectional-eval.js`](../../lib/audit/run-bidirectional-eval.js)
- [`lib/audit-shared/model-provider.js`](../../lib/audit-shared/model-provider.js)
- [`lib/audit-shared/certification.js`](../../lib/audit-shared/certification.js)
