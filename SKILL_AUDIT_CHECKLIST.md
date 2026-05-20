# Skill Audit Checklist

This is the canonical checklist for auditing a single skill in Skill Graph.

## Purpose

Use this checklist to answer 3 questions:

1. Is the skill structurally valid?
2. Is the skill semantically correct?
3. Is the skill useful enough to keep loading?

## Audit Outputs

A complete audit should produce:

1. pass/fail verdict
2. findings list
3. required fixes
4. updated metadata or content when drift is confirmed

## Standard Artifact Names

Use this exact artifact shape when writing audit output:

```text
audits/<skill-name>/
  findings.md
  verdict.md
  scorecard.md
```

`scorecard.md` is optional for lightweight audits, but `findings.md` and `verdict.md` are always required.

## Standard Artifact Structure

### `findings.md`

Required sections:

1. `# Findings`
2. `## Skill`
3. `## Verdict Summary`
4. `## Findings`
5. `## Required Fixes`

Each finding must use:

- `ID:`
- `Severity:`
- `Surface:`
- `Problem:`
- `Evidence:`
- `Required action:`

### `verdict.md`

Required sections:

1. `# Verdict`
2. `## Skill`
3. `## Final Verdict`
4. `## Rationale`
5. `## Follow-up State`

`Final Verdict` must be exactly one of: `PASS`, `PASS WITH FIXES`, `PARTIAL`, `FAIL`.

### `scorecard.md`

Required sections when present:

1. `# Scorecard`
2. `## Skill`
3. `## Dimensions`

Required dimension rows:

- Metadata validity
- Activation quality
- Relation quality
- Grounding fidelity
- Content quality
- Eval quality
- Portability quality

## Canonical Checklist

### 1. Frontmatter validity

- [ ] `schema_version` exists and equals `7` (integer; the string `"7"` is tolerated for hand-rolled YAML for back-compat — see `schemas/skill.v7.schema.json`)
- [ ] `name` exists and matches the intended skill identifier
- [ ] `description` exists and is specific enough to route from
- [ ] `version` exists
- [ ] `type` is one of `capability`, `workflow`, `router`, `overlay`
- [ ] `category` is one of the closed v5 enum: `foundations` / `engineering` / `design` / `quality` / `agent` / `product` (v5 — closed enum framed as browse facet; previously open-string in v3/v4; `family` in v2)
- [ ] `scope` is one of `codebase`, `reference`, `portable`
- [ ] `owner` exists
- [ ] `freshness` exists
- [ ] `drift_check` exists as an object with `last_verified` (v3+ — was scalar date in v2)
- [ ] `eval_artifacts`, `eval_state`, `routing_eval` all exist (orthogonal triple — shipped in schema_version 2 under SH-5784, retained through v5)
- [ ] `extends` exists when `type: overlay`
- [ ] `extends` is absent when `type` is not `overlay`

### 2. Activation quality

- [ ] `description` names real trigger scenarios
- [ ] `keywords` are not empty for routable skills
- [ ] `triggers` are present when label-based routing is intended
- [ ] `paths` are present when file-based activation is useful
- [ ] activation terms are specific, not generic filler
- [ ] description does not under-trigger obvious user language

### 3. Relation quality

- [ ] `relations.adjacent` points to real neighboring skills
- [ ] `relations.boundary` clearly prevents misuse
- [ ] `relations.verify_with` names valid verification partners
- [ ] `relations.depends_on` is only used where a real dependency exists
- [ ] relation semantics are not vague or ornamental

### 4. Grounding quality

Run this section when the skill is repo-grounded or implementation-aware.

- [ ] `grounding` exists when the skill makes concrete implementation claims
- [ ] `domain_object` clearly states what the skill governs
- [ ] `truth_sources` point to real files or docs
- [ ] `failure_modes` are concrete and testable
- [ ] `evidence_priority` is explicit
- [ ] claims in the body match the truth sources

### 5. Content quality

- [ ] the skill has a clear `Coverage` section
- [ ] the skill has a clear `Philosophy` section
- [ ] the skill has a clear `Verification` section (recommended for `capability` and `workflow` archetypes per `docs/skill-metadata-protocol.md § Archetype Section Map`; not lint-enforced — body section structure is author judgment per the 2026-05-19 audit-doctrine cleanup)
- [ ] the skill has at least one concrete decision table, checklist, or routing rule
- [ ] the skill contains negative bounds (`Do NOT Use When` or equivalent)
- [ ] the skill does not contain generic model-native filler
- [ ] the skill does not claim behavior it cannot verify

### 6. Eval quality

- [ ] eval files exist if the skill is expected to be graded
- [ ] eval coverage is adequate for the skill's complexity
- [ ] evals test realistic prompts, not trivia
- [ ] evals cover boundaries and failure cases, not just happy path
- [ ] repo-grounded skills include repo-grounded eval evidence

### 7. Portability quality

- [ ] `portability.readiness` is declared when relevant
- [ ] export targets are realistic
- [ ] no private or local-only assumptions leak into the public skill
- [ ] the skill can survive export without losing its main meaning

### 8. Drift and safety

- [ ] no personal names or private identifiers remain
- [ ] no local filesystem paths remain unless explicitly part of an example
- [ ] no project-secret doctrine is embedded in public text
- [ ] no stale references to non-existent files or tools remain
- [ ] no contradictory instructions exist relative to neighboring skills

## Severity Model

Use this when reporting findings.

| Severity | Meaning |
|---|---|
| P0 | dangerous, misleading, or security-sensitive |
| P1 | materially wrong or broken |
| P2 | incomplete, ambiguous, or structurally weak |
| P3 | polish or clarity issue |
| P4 | informational only |

## Minimal Finding Format

```text
F1
Severity: P1
Surface: frontmatter
Problem: `type` uses a deprecated value
Evidence: `type: doctrine`
Required action: replace with one of the canonical archetype values
```

## Completion Rule

A skill audit is complete when:

1. every checklist section was reviewed
2. every finding has severity and evidence
3. confirmed drift was fixed or explicitly deferred
4. the Health Block verdicts are populated or explicitly left `UNVERIFIED` with evidence:
   - `structural_verdict`
   - `truth_verdict`
   - `comprehension_verdict`
   - `application_verdict`
