---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: comprehension-full
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use as the v8-conformant fixture exercising the full Understanding surface — the five flat top-level fields (mental_model, purpose, concept_boundary, analogy, misconception) in SKILL.md frontmatter, paired with comprehension_state: present in the audit-state.json sidecar. Activate this skill when verifying that the cross-file lint accepts the flat Understanding fields when the sidecar declares comprehension_state: present. Do NOT use as a production skill (use a real capability skill from the canonical library)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: knowledge-organization
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Hermetic v8 fixture for validating the cross-file comprehension_state contract (ADR-0019): sidecar comprehension_state: present requires the five flat Understanding fields in frontmatter. Out: production skill guidance."

# === Understanding fields (when comprehension_state: present) ===
# mental_model: the primitives of the concept and how they relate. One paragraph.
mental_model: "Understanding fields are the comprehension grader's reading surface. The grader expects five primitives — mental_model, purpose, concept_boundary, analogy, misconception — each with its own grading dimension and weight. They are authored as flat top-level frontmatter fields; the sidecar's comprehension_state: present flag declares they are present. The cross-file lint check ties the two files together: when the sidecar flag is present, the five frontmatter fields must be populated."
# purpose: the problem this concept solves and why the field exists. One paragraph.
purpose: "Comprehension grading checks whether an agent given the SKILL.md can answer realistic scenarios. The Understanding fields anchor that grading by declaring what the skill claims to teach. Before they were flat top-level fields, these primitives lived first as bold-label body sections parsers had to scrape, then in a nested concept block; the protocol now promotes them to flat top-level frontmatter fields so consumers no longer walk a sub-object, while the comprehension_state bookkeeping flag lives in the audit-state sidecar."
# concept_boundary: what this concept is NOT. Distinguishes from adjacent skills by naming
# the MECHANISM that differs, not just the label. Canonical replacement for top-level `boundary`.
concept_boundary: "Comprehension grading is NOT routing-eval (which tests whether the router picks the right skill) and NOT lint (which tests schema conformance). The flat top-level concept_boundary field (concept-layer) is also distinct from relations.suppresses (routing-layer exclusion; legacy alias: relations.boundary): one declares what the skill is NOT conceptually; the other declares which sibling skill is suppressed from co-routing when this skill owns the query."
# analogy: one-sentence metaphor preserving the core mechanism.
analogy: "Like the difference between a book's table of contents and its index. Both let a reader find content, but they answer different questions. The flat Understanding fields are the index — direct, addressable, no nesting; the sidecar comprehension_state flag is the library catalog card that records the index exists."
# misconception: the wrong mental model people bring; corrected explicitly.
misconception: "Believing that comprehension_state: present means the skill ships a passing comprehension eval. It does not. comprehension_state: present means the skill carries the Understanding fields the grader reads against; eval_state: passing is a separate, independent claim that the eval has been run and succeeded."
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: Apache-2.0
---

# Comprehension-Full Fixture

This fixture exercises the full Understanding surface in the canonical
v8 post-sidecar shape: the five flat top-level fields (`mental_model`,
`purpose`, `boundary`, `analogy`, `misconception`) live in `SKILL.md`
frontmatter, and `comprehension_state: present` lives in the
`audit-state.json` sidecar. The cross-file lint check (per ADR-0019)
must accept this pairing — when the sidecar declares
`comprehension_state: present`, the five frontmatter fields are required.

## Concept of the skill

**What it is:** The Understanding surface is the set of five flat frontmatter fields the comprehension grader reads, declared present by the sidecar's `comprehension_state` flag.
**Mental model:** Two files, one contract — frontmatter holds the teaching prose, the sidecar holds the bookkeeping flag, and a cross-file lint binds them.
**Why it exists:** To prove the post-sidecar split (ADR-0019) keeps the comprehension contract enforceable without the retired nested `concept` block.
**What it is NOT:** It is not a passing comprehension eval (`eval_state`) and not routing (`routing_eval`); presence of the fields is not a quality verdict.
**Adjacent concepts:** the comprehension grader, `comprehension_state`, the legacy nested `concept` block.
**One-line analogy:** The flat fields are a book's index; the sidecar flag is the catalog card recording the index exists.
**Common misconception:** That `comprehension_state: present` means the eval passed — it only means the reading surface exists.

## Coverage

The five flat Understanding fields in frontmatter plus
`comprehension_state: present` in the audit-state sidecar, proving the
cross-file comprehension contract. No grounding (ambient — no
`project[]`, `public: true`), no relations.

## Philosophy of the skill

Per [ADR-0019](../../../docs/adr/0019-audit-state-sidecar-separation.md),
agent-facing fields (including the flat Understanding prose) live in
frontmatter, while audit/eval bookkeeping (including `comprehension_state`)
lives in the sidecar. The legacy nested `concept` block was retired in the
clean cut. This fixture is the smallest configuration that proves the
cross-file lint binds the sidecar flag to the frontmatter Understanding
fields without re-introducing the nested block.

## Verification

```bash
node scripts/skill-lint.js --path examples/fixture-skills/comprehension-full
# expected: 0 errors
node scripts/skill-lint.js --path examples/fixture-skills
# expected: 0 errors across all four fixtures
```

The cross-file lint must accept the split shape: `comprehension_state:
present` in `audit-state.json` satisfied by the five flat top-level
Understanding fields in `SKILL.md` frontmatter. That contract is
documented in `SKILL_METADATA_PROTOCOL.md` § Understanding.

## Do NOT Use When

- You need to test the bare-minimum frontmatter — use `minimal-capability`.
- You need to test codebase grounding — use `with-grounding`.
- You need to test typed relations — use `with-relations`.
- You need to test frontmatter with no comprehension surface at all — author a separate fixture or use a real capability skill with `comprehension_state` absent.
