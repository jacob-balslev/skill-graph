---
schema_version: 1
name: example-doc-quality
description: "Documentation-quality review for public technical repos: README status clarity, metadata contract consistency, schema strictness, and example artifact fidelity. Activate this skill whenever the task involves auditing whether an OSS repo is packaged truthfully, checking schema-doc alignment, or distinguishing shipped features from planned features. Do NOT use for runtime debugging (use debugging) or behavior-preserving refactors (use refactor)."
version: 1.0.0
type: capability
family: knowledge
scope: operational
owner: maintainer
freshness: "2026-04-15"
drift_check: "2026-04-15"
eval_status: evals
stability: experimental
license: MIT
compatibility: Markdown, Git, JSON Schema
allowed-tools: Read Grep Bash
# TEMPLATE NOTE: triggers is present because this skill is routable by explicit label.
# Remove this block if your skill activates only by keyword or path matching.
triggers:
  - example-doc-quality-skill
keywords:
  - documentation quality
  - metadata contract review
  - schema docs consistency
# TEMPLATE NOTE: paths is present because this skill is file-activated.
# Remove this block if your skill is purely conceptual and has no file surface.
paths:
  - README.md
  - docs/**
  - schemas/*.json
relations:
  adjacent:
    - documentation
    - testing-strategy
  boundary:
    - debugging
  verify_with:
    - documentation
# TEMPLATE NOTE: domain_frame is REQUIRED for grounded skills per skill-scaffold § 4.
# Remove this entire block if your skill has evaluation_mode: universal and makes no repo claims.
domain_frame:
  domain_object: Documentation-quality review behavior for a public skill-system repo
  evaluation_mode: repo_specific
  truth_sources:
    - README.md
    - docs/metadata-contract.md
    - schemas/skill.schema.json
  failure_modes:
    - stale_branding
    - planned_vs_implemented_blur
    - schema_doc_mismatch
  evidence_priority: repo_code_first
# TEMPLATE NOTE: portability declares which external agent runtimes this skill is known to work on.
# Remove this block if the skill is internal-only and not intended for export.
portability:
  level: high
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Example Skill Template

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a concrete specimen of a grounded capability skill, not a placeholder scaffold. Read it as a real end-state skill and adapt by removing what does not apply to your archetype (`capability`, `workflow`, `router`, or `overlay`) and by replacing remaining values with equally real, context-correct values. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content. See `skill-scaffold § 5` for the required-section contract per archetype.

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `extends` is valid only when `type: overlay`. `route_groups` only applies when route ownership is part of the skill contract. `triggers` and `paths` are shown because this example is routable and file-activated; not every skill needs both. Generated manifest health fields belong in `skills.manifest.json`, not authored `SKILL.md`.

## Coverage

- README truthfulness: what ships now vs what is planned vs non-goals, and whether public docs over-claim current tooling
- Metadata contract alignment: whether doc field semantics match schema enforcement (required vs optional, conditional requiredness, strictness rules)
- Schema strictness: `additionalProperties`, `$id` and `title` consistency, pattern constraints on versioned fields
- Example artifact fidelity: whether the example layer actually proves the contract shape rather than just describing it
- Audit artifact structure: whether findings, verdict, and scorecard outputs follow a canonical shape outsiders can reproduce
- Branding and naming consistency across README, docs, schemas, and examples

## Philosophy

Public packaging quality depends on truthfulness, not only polish. A repo should say what exists, what is planned, and what its examples really prove.

## Key Files

| File | Purpose |
|---|---|
| `README.md` | Proves whether the public repo status is described accurately |
| `docs/metadata-contract.md` | Proves whether field semantics and requiredness are explained clearly |
| `schemas/skill.schema.json` | Proves whether the contract is actually enforceable by tooling |

## Review Process

1. Read the README as an outsider
2. Compare docs against the schemas
3. Check whether examples prove the contract in practice
4. Record findings with evidence and explicit fixes

## References

- `examples/evals/comprehension.json`
- `examples/audits/example-doc-quality/findings.md`
- `examples/audits/example-doc-quality/verdict.md`
- `examples/audits/example-doc-quality/scorecard.md`

## Verification

- [ ] The README distinguishes current implementation from roadmap items
- [ ] The docs and schemas use the same naming and field semantics
- [ ] The example artifact set is concrete enough for an outsider to copy

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `example-doc-quality` | `debugging` | Debugging starts from broken behavior, not packaging clarity |
| `example-doc-quality` | `refactor` | Refactor preserves behavior in code; this skill audits public-facing documentation truthfulness |

> **TEMPLATE NOTE — AUTHORING GATE:** Before committing a skill adapted from this template, verify:
>
> - every retained field has a real reason to exist
> - every removed field was removed because of archetype or grounding mismatch, not laziness
> - body sections match the skill's declared archetype per `skill-scaffold § 5`
> - `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
> - `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
> - `eval_status` matches actual artifact presence (if `evals`, the `evals/` directory exists)
> - all `relations` entries point to skills that exist in the target repo
> - no placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
> - the no-placeholder rule documented in `AGENTS.md` and `docs/metadata-contract.md § Example Template Rule` is respected
