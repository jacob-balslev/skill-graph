# Skill Graph Architecture

> **Read this if:** you want to understand how the ~70 files in this repo relate to each other, which file is authoritative when two files disagree, and why the contract doesn't silently drift.

Skill Graph is a contract-first project. The repo is organised in five authority tiers — each tier derives from the one above it, and tooling enforces the derivation automatically. When any two files appear to contradict each other, the tier with higher authority wins; the lower-tier file is a bug.

---

## The five tiers at a glance

| Tier | Role | When it's truth | What enforces the derivation |
|---|---|---|---|
| **1. Contract** | `schemas/*.json` | Always. These are the law. | — |
| **2. Explanation** | `docs/*.md` describing the schema | Until the schema disagrees. | `check-contract-consistency.js` C1, C2 |
| **3. Enforcement** | `scripts/*.js` that police + compile + transform | Run-time only; their output must match Tier 1 | `skill-lint.js` checks 6, 7, 8 |
| **4. Consumer** | `skill-graph-route`, `skill-graph-drift` | They USE Tier 1 to make decisions; they don't redefine anything | — |
| **5. Specimens** | `examples/` + `skills/` starters | Illustrative only. If they break the schema, they're wrong. | `skill-lint.js` checks 1–4 |

A sixth set of files — `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `.github/` — is **governance**, not a tier. These govern *the repo*, not the contract.

---

## Tier 1 — Contract (binding, machine-enforceable)

**If Tier 1 disagrees with anything below it, Tier 1 wins. Always.**

| File | Role |
|---|---|
| `schemas/skill.schema.json` | The frontmatter contract. Unversioned — tracks latest (v3 today). |
| `schemas/manifest.schema.json` | The compiled-manifest contract. Unversioned — tracks latest (v3 today). |
| `schemas/skill.v3.schema.json` | Pinned v3 copy. Consumers that want stability across a future v4 bump validate against this file. |
| `schemas/manifest.v3.schema.json` | Pinned v3 copy. Same rationale. |
| `schemas/skill.v2.schema.json` | **Frozen.** Retained for consumers still on v2. Never updated. |
| `schemas/manifest.v2.schema.json` | **Frozen.** Same rationale. |

Two rules govern this tier:

1. **Pinned copies must match the unversioned file modulo `$id` and `title`.** Enforced by C6 in `check-contract-consistency.js`. Drift is a CI failure.
2. **Frozen prior-version schemas must exist** but are not parity-checked. Freezing is the whole point of pinning.

---

## Tier 2 — Explanation (human-readable reflection of Tier 1)

Documents that describe the schemas in prose. If a Tier 2 file disagrees with Tier 1, Tier 2 is the bug — fix the doc, not the schema.

| File | Role |
|---|---|
| `docs/metadata-contract.md` | Authoritative overview: archetype section map, requiredness groups, strictness rules, schema versioning policy. |
| `docs/field-reference.md` | One section per authored field. All 29 v3 fields with purpose, rules, allowed values, examples. |
| `docs/field-decision-guide.md` | Decision tables for the hard choices: `scope`, `relations.*`, eval-health triple, `portability`, `project_tags`, and the "tag vs. category vs. routing_groups" question. |
| `docs/manifest-contract.md` | The authored → generated bridge: rename map, loss policy, per-version migration notes, worked example. |

Three rules govern this tier:

1. **Section headers in `field-reference.md` must exactly match the top-level properties of `skill.schema.json`.** Enforced by C1. A missing section or an orphan one is a CI failure.
2. **Every authored field must be covered in `manifest-contract.md`** (either in the rename map or the dropped-field list). Enforced by C2.
3. **The v2→v3 migration note in `manifest-contract.md`** must be accurate enough that an author running `migrate-skill-v2-to-v3.js` gets the same result the doc describes. Checked at release time via the worked example.

---

## Tier 3 — Enforcement and transformation tooling

Scripts that police Tier 1 (lint, consistency) or compile Tier 1's output (manifest, exports). These are Tier 1's automated watchdogs; their own output must agree with Tier 1.

### Authoring-time enforcement (runs per skill)

| File | Role |
|---|---|
| `scripts/skill-lint.js` | Eleven-check per-skill validator. Schema validation, parent-directory check, relation-target existence, eval coherence, archetype sections, routing quality, cross-schema parity, sample manifest conformance, generator parity, migration warnings. |
| `scripts/lint/check-archetype-sections.js` | Archetype-aware H2 section validator. Errors on missing required sections per archetype. |
| `scripts/lint/check-routing-quality.js` | Routing quality heuristics. R1: keywords required for codebase-scope or routing_groups skills. R2: description must not be duplicated verbatim in `## Coverage`. |
| `scripts/lint/format-code-frame.js` | Babel/Rust-style diagnostic formatter. |
| `scripts/lib/parse-frontmatter.js` | Minimal YAML parser. Handles quoted keys, block sequences, nested objects, block sequences of objects (v3 `boundary` / `depends_on` shape). |

### Cross-artifact enforcement (runs once per commit)

| File | Role |
|---|---|
| `scripts/check-contract-consistency.js` | Six checks (C1–C6): field-set parity, authored-to-generated parity, artifact-root convention, sample manifest correctness, example truth invariants, versioned schema parity. |

### Compilation and transformation

| File | Role |
|---|---|
| `scripts/generate-manifest.js` | Authored → compiled manifest compiler. Multi-root workspace aware via `.skill-graph/config.json`. Computes SHA-256 on truth sources for drift detection. |
| `scripts/export-skill.js` | Agent Skills export transform. Flattens the v3 `compatibility` object to a single 500-char string for the base standard. |
| `scripts/migrate-skill-v2-to-v3.js` | v2 → v3 codemod. Line-based — preserves author YAML style (comments, quoting, indentation). |

### Audit (hybrid enforcement/consumption)

| File | Role |
|---|---|
| `scripts/skill-audit.js` | Two-mode audit runner: stub mode (lint-seeded TODO findings) and `--graded` mode (external model CLI for per-dimension verdicts). |
| `scripts/lib/audit-prompt-builder.js` | Seven-dimension prompt composer for graded mode. |
| `scripts/lib/mock-grader.js` | Deterministic stand-in grader for CI smoke-tests without an API key. |

---

## Tier 4 — Reference consumer tooling

**This is the tentpole tier.** Every other skill format in the ecosystem stops at Tier 3 — they define a contract and ship a linter. Skill Graph is the only format that also ships tools that *use* the metadata to make visible decisions. These two files are the argument for why the extra metadata pays rent.

| File | Role |
|---|---|
| `scripts/skill-graph-route.js` | Graph-aware selector. Uses every unique Skill Graph field: `relations.depends_on` transitive closure, `relations.verify_with` co-loading, `relations.boundary` anti-ownership exclusion, `eval_state` quality gate, `lifecycle.stale_after_days` staleness annotation, `project_tags` filtering with workspace semantic-tag expansion. Emits per-skill reasons. |
| `scripts/skill-graph-drift.js` | Drift sentinel. Hashes every `grounding.truth_sources` entry with SHA-256; compares against the recorded `drift_check.truth_source_hashes` baseline; reports DRIFT / BROKEN / STALE / NO_BASELINE. `--record --apply` updates the SKILL.md in place with fresh hashes. |

These tools are the *proof* that Tier 1's schema earns its complexity. If you ever doubt whether `boundary` or `grounding.truth_sources` or `lifecycle` is worth the field count, run these scripts against a real skill library and watch them change routing decisions.

---

## Tier 5 — Specimens (worked examples that illustrate)

Concrete artifacts that show adopters what "good" looks like. Every specimen is derivable from the tiers above — but without them, the tiers above are abstract.

### Canonical specimen

| File | Role |
|---|---|
| `examples/skill-template.md` | Self-referential authoring template. Its subject is skill authoring itself. Demonstrates every v3 field including object-shaped `drift_check`, `compatibility`, `boundary[{skill, reason}]`, and `lifecycle`. |
| `examples/skills.manifest.sample.json` | Generator-produced sample. Drift-checked against live generator output by `skill-lint.js` check 8. |

### Starter skills

Eight starters, chosen to cover every archetype × scope combination that the schema permits:

| Skill | `type` | `scope` | Unique thing it demonstrates |
|---|---|---|---|
| `skills/a11y` | capability | portable | Minimal routable capability, eval artifact present |
| `skills/debugging` | workflow | portable | `## Workflow` section with numbered steps |
| `skills/documentation` | capability | portable | Eval artifact + worked audit both shipped |
| `skills/refactor` | workflow | portable | `relations.depends_on: [testing-strategy]` |
| `skills/testing-strategy` | capability | portable | `routing_groups: [quality]` |
| `skills/skill-router` | router | portable | Router archetype with `## Routing Rules` |
| `skills/lint-overlay` | overlay | portable | Overlay archetype with `extends` + `## Overlay Rules` |
| `skills/graph-audit` | capability | codebase | **The only starter with a full `grounding` block and recorded `truth_source_hashes`.** |

### Supporting artifacts

| Directory | Role |
|---|---|
| `examples/audits/` | Worked audit outputs (findings/verdict/scorecard) for `a11y`, `debugging`, `documentation`. |
| `examples/evals/` | Nine eval fixtures — one per starter + `comprehension.json`. |
| `examples/exports/` | Five round-trip Agent Skills exports demonstrating Tier 3's `export-skill.js` transform. |

---

## Governance (not a tier — sits outside the authority hierarchy)

| File | Role |
|---|---|
| `README.md` | Entry point; status; tiered tour (this document). |
| `CHANGELOG.md` | Keep-a-Changelog release history. |
| `CONTRIBUTING.md` | How to contribute. The tier a new file belongs to goes in the PR description. |
| `LICENSE` | MIT. |
| `.github/workflows/skill-graph-lint.yml` | CI: runs Tier 3 enforcement on every PR. |
| `docs/integrations/github-actions.md` | Copy-paste CI snippet for adopters. |
| `docs/single-skill-audit-checklist.md` | Checklist accompanying Tier 3 audit runner. |
| `docs/library-audit-workflow.md` | Repeated audit loop for a whole library. |
| `docs/plans/multi-root-workspace.md` | Shipped v0.4.0 design doc. |
| `docs/plans/scripts-roadmap.md` | Forward-looking script plan. |

---

## The invariants this structure guards

Because the tiers are ordered, a tiny set of invariants holds the whole repo together:

- **Tier 1 → Tier 2:** Every top-level property in `skill.schema.json` has a matching section in `field-reference.md`. (`check-contract-consistency.js` C1.)
- **Tier 1 → Tier 1 (pinned):** The current pinned schema is byte-identical to the unversioned schema modulo `$id` and `title`. (C6.)
- **Tier 1 → Tier 3 (generator):** Every authored field has a documented projection into the manifest — copied, grouped, or dropped. No silent drops. (C2.)
- **Tier 1 ↔ Tier 5 (sample manifest):** The committed sample manifest matches live generator output. (`skill-lint.js` check 8.)
- **Tier 5 → Tier 1:** Every starter skill validates against the schema; every relation target exists; every eval_artifact declaration is backed by a real file. (`skill-lint.js` checks 1–5.)

Break any one of these invariants and CI fails. That's why the tiering works: the enforcement tier (Tier 3) is literally the set of scripts that prove the upper and lower tiers agree.

---

## Adding something new — which tier does it go in?

| You want to add | Tier | Also touch |
|---|---|---|
| A new required field | 1 (schema) | 2 (field-reference.md, metadata-contract.md, manifest-contract.md rename map), 3 (generator if grouped; lint deprecation warning if renaming), 5 (template + at least one starter) |
| A new optional field | 1 (schema) | 2 (field-reference.md entry), 3 (generator flow-through), 5 (template if it demonstrates the new field) |
| A new lint rule | 3 (skill-lint.js or scripts/lint/) | — |
| A new tool that uses the manifest | 4 | README Reference consumer section |
| A new starter skill | 5 | Regenerate sample manifest |
| A new worked audit | 5 | — |
| A new integration guide | Governance | — |

When in doubt: if the file *defines* a constraint, it's Tier 1. If it *describes* a constraint, it's Tier 2. If it *enforces* a constraint, it's Tier 3. If it *uses* a constraint to make a decision, it's Tier 4. If it *illustrates* a constraint, it's Tier 5. If none of those fit, it's Governance.

---

## Further reading

- [`README.md`](../README.md) — the project overview; now structured by these same tiers.
- [`docs/metadata-contract.md`](metadata-contract.md) — the authoritative field-semantics doc.
- [`docs/manifest-contract.md`](manifest-contract.md) — the authored → generated bridge.
- [`docs/field-decision-guide.md`](field-decision-guide.md) — decision tables for hard field choices.
- [`CHANGELOG.md`](../CHANGELOG.md) — what shipped in each version.
