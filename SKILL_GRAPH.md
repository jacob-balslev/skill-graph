# Skill Graph

> **Read this if:** you want to understand the library-level Skill Graph system: the tools, generated artifacts, authority tiers, and maintenance loops that operate on Skill Metadata Protocol records.

Skill Graph is the library-level system around the [Skill Metadata Protocol](skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md). The protocol defines what one `SKILL.md` must declare; Skill Graph supplies the manifest compiler, validator, router, drift sentinel, and export pipeline that make those declarations useful across many skills. The repo is organised in five authority tiers: each tier derives from the one above it, and tooling enforces the derivation automatically. When any two files appear to contradict each other, the tier with higher authority wins; the lower-tier file is a bug.

The three layers divide the work cleanly. The [Skill Metadata Protocol](skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) declares what each skill is grounded against — its `truth_sources`, `grounding_mode`, and `failure_modes`. Skill Graph operates across the whole library of those declarations, compiling, routing, clustering, and checking them. The [Skill Audit Loop](skill-audit-loop/SKILL_AUDIT_LOOP.md) is the maintenance discipline — now consolidated into this repo (per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md)) — that re-grounds each skill against its declared sources on a cadence, so the declarations the protocol captured stay true to the reality they point at.

---

## Charter — Rules & Goal

**Mission & Vision** are shared across all three layers (Skill Metadata Protocol, Skill Audit Loop, Skill Graph); the canonical statement is [`AGENTS.md § Mission and Vision`](AGENTS.md#mission-and-vision). This section records the **Library layer's** own Rules and Goal.

### Rules

1. **Skill Graph is build-time / authoring-time tooling** — not an agent runtime, a hosted marketplace, or a memory system. Consumers read from the graph; they do not redefine it.
2. **Five authority tiers** — schema, explanation docs, enforcement/transformation tooling, consumer tooling, specimens. When two files contradict, the higher tier wins and the lower-tier file is the bug.
3. **Doc ownership:** `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` owns normative protocol language; `SKILL_GRAPH.md` owns library-level architecture and the live Current State facts; `skill-audit-loop/SKILL_AUDIT_LOOP.md` owns audit procedure and quality gates.
4. **Generated files are never hand-edited when a generator owns them.** Source skills live in the canonical library; `marketplace/skills/` is generated staging output, not a source of truth.
5. **Routing reads the current fields:** `subject`, `deployment_target`, `taxonomy_domain`, `project[]` / `repo[]`, the activation fields, `relations`, `grounding`, and eval status.
6. **Public release output excludes project-private, repo-specific, secret-bearing, or GDPR-sensitive content** (the publication gate in `export-marketplace-skills.js`).
7. **Refactors preserve useful domain intelligence;** compress only when nothing behaviorally important is dropped.
8. **Documentation routes a concept to its owning file** rather than duplicating a stale summary — link to the Current State block below, never restate its numbers.

### Goal

Make a large AI-agent skill library coherent, project-aware, auditable, and exportable — so an agent or human can answer which skill applies, why, what grounds it, which skills relate, which must not co-route, and whether it has been proven useful. Near-term: keep docs, examples, tests, and schema-constant checks aligned with the v8 clean cut; keep `SKILL_GRAPH.md`, `AGENTS.md`, `README.md`, and the onboarding docs stating the same facts; and keep the router, manifest compiler, export pipeline, drift sentinel, and audit loop focused on the current fields.

---

## Current State — single source of truth

> This block is the canonical "what version / how many" reference. Other docs (`AGENTS.md`, `README.md`) should link here rather than restate these numbers, to avoid the drift that recurs when each doc carries its own copy.

| Fact | Value | Source of truth |
|---|---|---|
| **Schema version enforced** | **v8**. The schema's global `required` array mandates `subject` + `deployment_target` + `scope` (`scope` is required free text, not an enum). The prior contract (v7) lives in git history; retrieve via `git show schema-v7:schemas/SKILL_METADATA_PROTOCOL_schema.json`; it is not accepted by the live schema. | `schemas/SKILL_METADATA_PROTOCOL_schema.json` + [ADR-0017](docs/adr/0017-five-axis-classification-model.md) |
| Manifest schema file | tracks the v8 contract; v7 fields are not declared | `schemas/manifest.schema.json` |
| Emitted manifest `schema_version` | **4** (root manifest contract; orthogonal to per-skill `schema_version`) | `scripts/generate-manifest.js`; `schemas/manifest.schema.json` `schema_version.const` |
| Manifest summary facets | `by_subject`, `by_deployment_target`, `by_schema_version`, `by_stability`, `by_project` | `scripts/generate-manifest.js::computeSummary` |
| Per-skill `schema_version` in manifest | **present** (top-level field on every skill entry — added 2026-05-25 per F4 finding) | `scripts/generate-manifest.js::buildSkillEntry` |
| Canonical skill count | **160** SKILL.md in the canonical library; **161** when the protocol template is included. Verified 2026-05-31 by `find` (SH-6650: last 2 flat-layout stragglers resolved — `code-review` v7 dup deleted, `skill-evolution` migrated to `meta-methods`). | live: `find ~/Development/skills/skills -name SKILL.md \| wc -l` (160) and `node scripts/generate-manifest.js --include-template --validate-only` (161). |
| Marketplace export count | **153** SKILL.md in `marketplace/skills/` (verified 2026-05-28); the publication gate excludes repo-specific/internal skills (`deployment_target: project`, plus internal grounding modes). Currently `graph-audit` (`deployment_target: project`, `grounding_mode: repo_specific`) is the one gated exclusion; any further canonical−marketplace delta is export staleness pending the next `marketplace:export` run. | live: `find skill-graph/marketplace/skills -name SKILL.md \| wc -l` |
| Canonical library location | sibling repo `jacob-balslev/skills` at `~/Development/skills/` | `.skill-graph/config.json` → `skill_roots: ["../skills/skills"]` |
| This repo's role | tooling + protocol + schemas + docs (no `skills/` tree) | [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) |
| Audit Loop maturity | Integrity Gate ≈ MLOps L1 (write-back wired into `skill-graph audit` as of 2026-05-25 per SH-6481 F14); **Behavior Gate data remains sparse** — application verdicts stay `UNVERIFIED` until `evals/application.json` artifacts are authored and graders run. | [`skill-audit-loop/SKILL_AUDIT_LOOP.md:45-52`](skill-audit-loop/SKILL_AUDIT_LOOP.md) |
| **Audit-ledger consistency** (separate red gate, not in `npm run verify`) | **`npm run audit-manifest:check` currently FAILS** — 15 historical graded-comprehension verdicts in `.opencode/progress/skill-audits/<skill>/runs/<run-id>/verdict.md` claim `PROVISIONAL`/`PASS` without a backing `evals/comprehension.json` artifact. Downgrading the SKILL.md Audit Status to `comprehension_verdict: UNVERIFIED` resolves each (the gate respects honest downgrade per `scripts/check-audit-manifest.js:177-180`). Tracked as CONTENT follow-up at SH-6548. | `node scripts/check-audit-manifest.js` |

## Source vs Marketplace — why there are two `skills/` trees

A common point of confusion: the canonical library and the in-repo `marketplace/skills/` look like duplicates (same count, similar frontmatter). They are not — they are the two ends of a publishing pipeline AND the source library is one repo wearing two hats:

```
                                ┌── HAT 1: canonical authoring source
                                │        (read by skill-graph tooling
                                │         via .skill-graph/config.json
                                │         → skill_roots: ["../skills/skills"])
                                │
   ~/Development/skills/  ──────┤
   (one physical repo)          │
                                └── HAT 2: public Agent-Skills release
                                         (published to github.com/jacob-balslev/skills,
                                          indexed at skills.sh/jacob-balslev/skills)

   ~/Development/skills/skills/<category>/<name>/SKILL.md   AUTHORING SOURCE (nested, hand-edited)
           │  scripts/export-marketplace-skills.js  (reads source, normalizes, applies publication gate)
           ▼
   skill-graph/marketplace/skills/<name>/SKILL.md          GENERATED EXPORT (staging, never hand-edited; flat)
           │  two-step sync: copy marketplace/skills/* into ~/Development/skills/skills/, commit, push
           ▼
   github.com/jacob-balslev/skills  →  skills.sh           PUBLIC, installable
```

**The two-hat insight:** the AUTHORING SOURCE and the PUBLIC RELEASE are the **same physical repo**. The pipeline above pushes the staging buffer (`skill-graph/marketplace/skills/`) into that repo, so writing to skill-graph and pushing the canonical library both eventually update `github.com/jacob-balslev/skills`. The `marketplace/` directory is the transform buffer between this tooling repo and the library repo, not a separate publication target.

The export is **not** a copy. It (1) applies the **publication gate** — excludes `deployment_target: project` (plus legacy `scope: codebase|operational|project`) and `grounding_mode: repo_specific|repo_internal` skills and fails on private paths, so internal skills never publish; (2) **normalizes** the frontmatter (flattens the `compatibility` object, etc.); (3) historically **flattened** the directory layout; and (4) **projects** the meaningful protocol fields (classification, relations, Understanding fields, grounding, lifecycle, audit status) into a readable `## Skill Graph context` body section — see `docs/marketplace-syndication.md § Export-Time Body Projection` — so vendor auto-loaders that read the body on activation but never the `metadata:` map still see the graph as prose. Because the source library (`~/Development/skills/`) is *also* the public release repo (`jacob-balslev/skills`), source and release are the same repo; `marketplace/skills/` is the transform/staging buffer between this tooling repo and that one. See `AGENTS.md § Public Distribution` for the two-step sync protocol.

> **Layout note (re-verified 2026-05-28):** the export is self-consistent after a regenerate — `node scripts/export-marketplace-skills.js --check` verifies the generated surface, and `npm run verify` includes `marketplace:verify`. `marketplace/skills/` uses a **flat** `<name>/` layout (the plain Agent Skills publish shape) while the authoring/release library is **nested** `<subject>/<name>/`. These layouts intentionally differ — authoring organization vs publish shape — so the flat export is current, not stale. Pre-release checks should compare recursive `SKILL.md` counts rather than top-level directory counts.

> **Export-label note (2026-05-26):** `scripts/export-marketplace-skills.js` no longer emits `skill_graph_protocol` on exported skills — the previous hardcoded `Skill Metadata Protocol v7` constant conflated "exported by v7 tooling" with "content verified at v7" and was removed. Per-skill `schema_version` is the honest source contract signal. See `AGENTS.md § Version Labels Are Earned, Not Bumped`.

---

## System Model — how the pieces fit together

> **The question this diagram answers:** "What are the moving parts of Skill Graph, and who talks to whom?"

Before drilling into the five authority tiers, orient yourself on the five runtime entities you will actually interact with as an author or adopter. Every other diagram in the docs zooms into one of these boxes.

```mermaid
flowchart LR
  Skill["<b>SKILL.md</b><br/>authored file<br/>frontmatter + body + Audit Status"]
  Linter["<b>skill-lint.js</b><br/>deterministic validator"]
  Drift["<b>skill-graph-drift.js</b><br/>truth-source sentinel"]
  Manifest["<b>skills.manifest.json</b><br/>compiled artifact"]
  Auditor["<b>skill-audit.js</b><br/>runs lint + drift inline · stub · graded"]
  Artifacts["<b>audits/&lt;skill&gt;/</b><br/>findings · verdict · scorecard"]

  Skill -->|validated by| Linter
  Skill -->|hashes checked by| Drift
  Skill -->|compiled into| Manifest
  Linter -->|seeds findings for| Auditor
  Drift -->|seeds truth_verdict for| Auditor
  Auditor -->|emits| Artifacts
  Auditor -->|stamps Audit Status| Skill

  classDef author fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef tool fill:#ecfdf5,stroke:#047857,color:#064e3b
  classDef artifact fill:#fef3c7,stroke:#d97706,color:#78350f
  class Skill author
  class Linter,Drift,Auditor,Manifest tool
  class Artifacts artifact
```

<!-- Rendered copy for non-Mermaid viewers. Regenerate via: npx @mermaid-js/mermaid-cli -i <source> -o docs/images/system-model.png -->
<img src="docs/images/system-model.png" alt="System model — SKILL.md is validated by skill-lint.js, drift-checked by skill-graph-drift.js, compiled into skills.manifest.json, and audited by skill-audit.js which emits findings/verdict/scorecard artifacts AND stamps the Audit Status back onto SKILL.md" width="900" />

**Legend.** Blue = authored input. Green = tooling. Yellow = output artifact. Solid arrows are the data flow. The `stamps Audit Status` arrow (added 2026-05-25 per SH-6481 F14) closes the loop — the Auditor's verdicts land on the skill itself (`last_audited`, `lint_verdict`, `structural_verdict`, `truth_verdict`), so the state-of-truth lives in the skill, not in a side artifact. Every entity in this diagram has its own deep-dive diagram: [§ Anatomy](skill-metadata-protocol/design-rationale.md#anatomy) for `SKILL.md`, [§ The Four Operations](skill-audit-loop/SKILL_AUDIT_LOOP.md#the-four-operations) for `skill-audit.js`, [§ Manifest Field Mapping](docs/manifest-field-mapping.md) for `skills.manifest.json`.

---

## The five tiers at a glance

| Tier | Role | When it's truth | What enforces the derivation |
|---|---|---|---|
| **1. Schema** | `schemas/*.json` | Always. These are the machine-enforced rules. | — |
| **2. Explanation** | Root `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` / `skill-audit-loop/SKILL_AUDIT_LOOP.md` / `skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2 + `docs/*.md` describing the schema | Until the schema disagrees. | `check-protocol-consistency.js` C1, C2 |
| **3. Enforcement** | `scripts/*.js` that police + compile + transform | Run-time only; their output must match Tier 1 | `skill-lint.js` checks 6, 7, 8 |
| **4. Consumer** | `skill-graph-route`, `skill-graph-drift` | They USE Tier 1 to make decisions; they don't redefine anything | — |
| **5. Specimens** | `examples/` + `skills/` starters | Illustrative only. If they break the schema, they're wrong. | `skill-lint.js` checks 1–4 |

A sixth set of files — `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `.github/` — is **governance**, not a tier. These govern *the repo*, not the protocol shape.

---

## Tier 1 — Schema (binding, machine-enforceable)

**If Tier 1 disagrees with anything below it, Tier 1 wins. Always.**

| File | Role |
|---|---|
| `schemas/SKILL_METADATA_PROTOCOL_schema.json` | The frontmatter schema — canonical-only per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md). Current contract is v8. The file's `$id` (`https://skillgraph.dev/schemas/skill.schema.json`) is the stable identifier. |
| `schemas/manifest.schema.json` | The compiled-manifest schema — canonical-only. Tracks the current contract (carries the four Audit Status verdicts). |
| `schemas/audits-manifest.schema.json` | The Skill Audit Loop manifest schema — binds the shape of `audits/manifest.json` (protocols, runners, required artifacts, runtime aliases). Authored 2026-05-25; closes the manifest version-discipline gap (Opus novelty memo #1). |
| `schemas/comprehension.schema.json` | The comprehension-eval schema — binds the shape of `skills/<name>/evals/comprehension.json`, the artifact the gate-8 grader evaluates against. Authored 2026-05-25 to close the highest-priority canonicalization gap (Opus G2#3 CRITICAL). |

One rule governs this tier:

1. **Canonical-only schemas.** Per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md), prior contract versions (v2-v6) live in git history; they are NOT mirrored on disk. The C6 "Versioned schema parity" check is retired. An external consumer that needs to pin against a historical version resolves via `git show <commit>:schemas/SKILL_METADATA_PROTOCOL_schema.json` or a `git tag schema-vN` if one exists — never a duplicate file in `main`.

---

## Tier 2 — Explanation (human-readable reflection of Tier 1)

Public docs that define or explain the protocol in prose. If a Tier 2 file disagrees with Tier 1, Tier 2 is the bug — fix the doc, not the schema.

| File | Role |
|---|---|
| [`skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) *(repo root)* | Normative spec: required fields, semantic rules, authored vs generated fields, migration notes. |
| `skill-metadata-protocol/design-rationale.md` | Rationale and deep explanation: body structure, requiredness groups, strictness rules, schema versioning policy, design tradeoffs. |
| `skill-metadata-protocol/field-reference.md` | One section per authored field. All current v8 top-level fields with purpose, rules, allowed values, examples. |
| `skill-metadata-protocol/field-decision-guide.md` | Decision tables for the hard choices: `deployment_target`, `relations.*`, Evaluation Status, `portability`, `project[]` / `repo[]`, and the "taxonomy_domain vs. subject vs. routing_bundles" question. |
| `docs/manifest-field-mapping.md` | The authored → generated bridge: rename map, loss policy, per-version migration notes, worked example. |

Three rules govern this tier:

1. **Section headers in `SKILL_METADATA_PROTOCOL_field-reference.md` must exactly match the top-level properties of `SKILL_METADATA_PROTOCOL_schema.json`.** Enforced by C1. A missing section or an orphan one is a CI failure.
2. **Every authored field must be covered in `manifest-field-mapping.md`** (either in the rename map or the dropped-field list). Enforced by C2.
3. **The v2→v3 migration note in `manifest-field-mapping.md`** must be accurate enough that an author running `migrate-skill-v2-to-v3.js` gets the same result the doc describes. Checked at release time via the worked example.

---

## Tier 3 — Enforcement and transformation tooling

Scripts that police Tier 1 (lint, consistency) or compile Tier 1's output (manifest, exports). These are Tier 1's automated watchdogs; their own output must agree with Tier 1.

### Authoring-time enforcement (runs per skill)

| File | Role |
|---|---|
| `scripts/skill-lint.js` | Four-check canonical-source validator: YAML parse, `name` field using Skill Metadata Protocol identifier syntax, non-empty `description`, and parent directory matching the final `name` segment. Reduced from the previous broad lint pipeline in commit `2bd8e64` (2026-05-19) per the audit-doctrine cleanup — project-internal checks (relation targets, eval coherence, schema parity, archetype sections, routing quality, stability promotion, etc.) moved out of lint. |
| `scripts/lint/format-code-frame.js` | Babel/Rust-style diagnostic formatter. |
| `scripts/lib/parse-frontmatter.js` | Minimal YAML parser. Handles quoted keys, block sequences, nested objects, block sequences of objects (v3 `boundary` / `depends_on` shape). |

### Cross-artifact enforcement (runs once per commit)

| File | Role |
|---|---|
| `scripts/check-protocol-consistency.js` | Seven checks (C1, C2, C3, C4, C5, C7, C8): field-set parity, authored-to-generated parity, artifact-root convention, sample manifest correctness, example truth invariants, generated field-reference parity, JSON-LD context coverage. (C6 versioned-schema-parity retired per ADR-0014; no pinned-copy file exists on disk any longer.) |

### Compilation and transformation

| File | Role |
|---|---|
| `scripts/generate-manifest.js` | Authored -> compiled manifest compiler. Multi-root workspace aware via `.skill-graph/config.json`. Computes SHA-256 on normalized truth-source keys for drift detection. |
| `scripts/export-skill.js` | Plain `SKILL.md` export transform. Flattens the v3 `compatibility` object to a single string for the portable export shape. |
| `scripts/migrate-skill-v2-to-v3.js` | v2 → v3 codemod. Line-based — preserves author YAML style (comments, quoting, indentation). |

#### Pipeline — how a SKILL.md becomes a manifest entry

> **The question this diagram answers:** "How does `generate-manifest.js` project authored frontmatter into `skills.manifest.json`?"

```mermaid
flowchart LR
  Skills["<b>skills/&#42;/SKILL.md</b><br/>+ examples/skill-metadata-template.md<br/>authored frontmatter"]
  Config[".skill-graph/config.json<br/>workspace roots + projects<br/><i>optional — falls back to skills/</i>"]
  Parse["<b>parse-frontmatter.js</b><br/>YAML → object"]
  Rename["<b>generate-manifest.js</b><br/>apply rename map<br/>group under activation / health"]
  Hash["<b>SHA-256</b><br/>hash each grounding.truth_sources<br/>compute health.drift_detected"]
  Validate{{"<b>ajv + manifest.schema.json</b><br/>additionalProperties: false"}}
  Manifest["<b>skills.manifest.json</b><br/>compiled artifact"]

  Skills --> Parse
  Config -.-> Rename
  Parse --> Rename --> Hash --> Validate
  Validate -->|pass| Manifest
  Validate -->|fail| Error((("exit 1")))

  classDef input fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef tool fill:#ecfdf5,stroke:#047857,color:#064e3b
  classDef gate fill:#fce7f3,stroke:#db2777,color:#831843
  classDef artifact fill:#fef3c7,stroke:#d97706,color:#78350f
  classDef err fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d
  class Skills,Config input
  class Parse,Rename,Hash tool
  class Validate gate
  class Manifest artifact
  class Error err
```

<!-- Rendered copy for non-Mermaid viewers. Source: docs/diagrams/manifest-pipeline.mmd. Regenerate via: npx @mermaid-js/mermaid-cli -i docs/diagrams/manifest-pipeline.mmd -o docs/images/manifest-pipeline.png -b white --width 1600 -->
<img src="docs/images/manifest-pipeline.png" alt="Manifest pipeline — authored SKILL.md files plus optional workspace config flow through parse-frontmatter, rename/group, SHA-256 hashing, and ajv validation against manifest.schema.json before becoming skills.manifest.json" width="960" />

**Legend.** Blue = authored input. Green = tooling step. Pink = validation gate (hard-fail on additionalProperties). Yellow = the compiled artifact. Red = exit-1 on schema mismatch. The rename map this pipeline applies is the one documented in [`docs/manifest-field-mapping.md § Rename Map`](docs/manifest-field-mapping.md#rename-map) — the diagram shows the topology, the manifest field mapping shows the field-level fates.

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
| `scripts/skill-graph-route.js` | Graph-aware selector. Uses every unique Skill Graph field: `relations.depends_on` transitive closure, `relations.verify_with` co-loading, `relations.boundary` anti-ownership exclusion, `eval_state` quality gate, `lifecycle.stale_after_days` staleness annotation, and `project[]` / `deployment_target` project-fit filtering. Emits per-skill reasons. |
| `scripts/skill-graph-drift.js` | Drift sentinel. Hashes every `grounding.truth_sources` entry with SHA-256, including line-range and anchor object entries; compares against the recorded `drift_check.truth_source_hashes` baseline; reports DRIFT / BROKEN / STALE / NO_BASELINE. `--record --apply` updates the SKILL.md in place with fresh hashes. |

These tools are the *proof* that Tier 1's schema earns its complexity. If you ever doubt whether `boundary` or `grounding.truth_sources` or `lifecycle` is worth the field count, run these scripts against a real skill library and watch them change routing decisions.

### Drift sentinel — state machine

> **The question this diagram answers:** "What state can `skill-graph-drift.js` put a skill in, and what transitions it?"

This is the single highest-leverage argument for the v3 `drift_check.truth_source_hashes` + `lifecycle.stale_after_days` fields. Without them the sentinel has nothing to compare against and nothing to time-box. With them every grounded skill sits in one of five states with explicit transitions.

```mermaid
stateDiagram-v2
  direction LR
  [*] --> NO_BASELINE: skill declares<br/>grounding.truth_sources<br/>but truth_source_hashes absent
  NO_BASELINE --> OK: --record --apply<br/>writes SHA-256 hashes
  OK --> STALE: today − last_verified<br/>> lifecycle.stale_after_days
  OK --> DRIFT: any live SHA-256<br/>≠ recorded hash
  OK --> BROKEN: truth_source file<br/>missing on disk
  STALE --> OK: author re-verifies<br/>bumps last_verified
  STALE --> DRIFT: detected during re-verify
  DRIFT --> OK: content re-verified<br/>--record --apply rewrites hashes
  BROKEN --> OK: truth source restored<br/>--record --apply rewrites hashes
  DRIFT --> BROKEN: truth source deleted<br/>before re-verify

  note right of OK
    Hashes match
    within lifecycle window
  end note
  note right of NO_BASELINE
    schema-valid but
    unverifiable — fix first
  end note
```

<!-- Rendered copy for non-Mermaid viewers. Source: docs/diagrams/drift-states.mmd. Regenerate via: npx @mermaid-js/mermaid-cli -i docs/diagrams/drift-states.mmd -o docs/images/drift-states.png -b white --width 1400 -->
<img src="docs/images/drift-states.png" alt="Drift sentinel state machine — NO_BASELINE, OK, STALE, DRIFT, BROKEN states with transitions driven by --record --apply, lifecycle.stale_after_days, live SHA-256 comparison, and truth-source file availability" width="900" />

**Legend.** Five states; arrows are transitions with the trigger printed on them. `OK` is the only green state — every other state signals something the author must act on. `--record --apply` is the only author action that can write hashes back into the skill's frontmatter; every other transition is observed, not commanded. The `DRIFT → BROKEN` edge is the one nobody wants — a drifted claim silently outlives the file it was grounded in.

### Routing harness — per-skill decision path

> **The question this diagram answers:** "How does `skill-graph-routing-eval.js` decide whether a skill's `routing_eval: present` claim holds?"

This is the rent-proof for the v0.5.0 `examples`, `anti_examples`, and `relations.boundary.{skill, reason}` fields. Without this harness those fields sit unverified in every SKILL.md — the router's retrieval behavior against them is asserted but never checked. With this harness every authored positive prompt and every authored negative prompt produces a concrete routing decision that the manifest can be graded against. `scripts/skill-graph-routing-eval.js` is now the canonical gate for `routing_eval: present`; the earlier per-file lint wrapper was removed with the non-mandatory lint checks.

```mermaid
flowchart LR
  Start(["For each skill S<br/>in manifest"])
  HasCases{{"S has examples[]<br/>or anti_examples[]?"}}
  Skip(["SKIP<br/>no cases"])
  Pos["Positive cases<br/>S.examples[]"]
  Neg["Negative cases<br/>S.anti_examples[]"]
  Route1["skill-graph-route<br/>top-1 winner"]
  Route2["skill-graph-route<br/>top-1 winner"]
  WinEq{{"winner === S?"}}
  WinBound{{"winner === S?<br/>winner &isin; S.boundary?<br/>winner === null?"}}
  PosPass(["PASS<br/>positive"])
  PosFail(["FAIL<br/>positive"])
  NegPass(["PASS<br/>negative"])
  NegFail(["FAIL<br/>negative"])
  Gap(["COVERAGE_GAP<br/>informational"])

  Start --> HasCases
  HasCases -->|no| Skip
  HasCases -->|yes| Pos
  HasCases -->|yes| Neg
  Pos --> Route1 --> WinEq
  Neg --> Route2 --> WinBound
  WinEq -->|yes| PosPass
  WinEq -->|no| PosFail
  WinBound -->|winner === S| NegFail
  WinBound -->|winner &isin; boundary| NegPass
  WinBound -->|winner === null| Gap
  WinBound -->|winner &notin; boundary<br/>and non-null| NegFail

  classDef start fill:#ecfdf5,stroke:#047857,color:#064e3b
  classDef gate fill:#fce7f3,stroke:#db2777,color:#831843
  classDef work fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef pass fill:#ecfdf5,stroke:#047857,color:#064e3b,font-weight:bold
  classDef fail fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d,font-weight:bold
  classDef skip fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95,stroke-dasharray:4 2
  class Start,Skip start
  class HasCases,WinEq,WinBound gate
  class Pos,Neg,Route1,Route2 work
  class PosPass,NegPass pass
  class PosFail,NegFail fail
  class Gap skip
```

<!-- Rendered copy for non-Mermaid viewers. Source: docs/diagrams/routing-harness.mmd. Regenerate via: npx @mermaid-js/mermaid-cli -i docs/diagrams/routing-harness.mmd -o docs/images/routing-harness.png -b white --width 1600 -->
<img src="docs/images/routing-harness.png" alt="Routing harness decision path — per skill, positive examples must route to the skill itself; negative anti-examples must route elsewhere (ideally to a skill named in relations.boundary[]) or nowhere (COVERAGE_GAP, informational)" width="960" />

**Legend.** Green = pass state or loop endpoint. Red = FAIL state — the verdict that keeps `routing_eval: absent`. Pink = decision gate. Blue = work node. Purple-dashed = `COVERAGE_GAP` (not a FAIL — the anti-example correctly avoids the skill but no other skill absorbs it; surfaces a `relations.boundary` gap worth tightening in the next pass). The asymmetry between the positive and negative gates is the whole point: positive cases must uniquely identify the skill (tight gate); negative cases must only avoid the skill (loose gate with boundary confirmation as the quality signal). Lint check 12 refuses `routing_eval: present` when any red terminal is reached; a skill with only green + purple terminals earns `present`.

---

## Tier 5 — Specimens (worked examples that illustrate)

Concrete artifacts that show adopters what "good" looks like. Every specimen is derivable from the tiers above — but without them, the tiers above are abstract.

### Canonical specimen

| File | Role |
|---|---|
| `examples/skill-metadata-template.md` | Self-referential authoring template. Its subject is skill authoring itself. **Demonstrates the v8 classification (`subject` / `scope`) and the inline field-purpose comment convention** (every authored field carries a comment block above it; strippable `# TEMPLATE NOTE:` lines are clearly distinguished from field-purpose comments that stay in derived skills — see `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`). Also demonstrates object-shaped `drift_check` / `compatibility` / `lifecycle`, `boundary[{skill, reason}]`, the five flat Understanding fields, and the four-verdict Audit Status. |
| `examples/fixture-skills/` | Four in-repo specimen skills covering distinct shapes: `minimal-capability`, `with-grounding` (full `grounding` block + recorded `truth_source_hashes`), `with-relations`, and `comprehension-full` (populated Understanding fields). |
| `examples/skills.manifest.sample.json` | Generator-produced sample. Drift-checked against live generator output by `skill-lint.js` check 8. |

### Starter skills

> **Location note (post-ADR-0009 consolidation):** this repo no longer ships a `skills/` tree. The canonical skill library lives in the sibling repo at `~/Development/skills/` (nested `<subject>/[<taxonomy_domain>/]<name>/SKILL.md`, closed 9-subject enum), with a plain-Agent-Skills export mirror under `marketplace/skills/`. In-repo specimens live in `examples/fixture-skills/`. The table below is a **historical archetype-coverage reference** describing the original eight-starter specimen set chosen to cover every archetype × scope combination the schema permits; `skills/<name>` paths are illustrative of that set, not current in-repo paths. Entries marked _(archive)_ are no longer in the in-repo specimen set — their archetype coverage moved to `examples/fixture-skills/`. The relations diagram further below has been reauthored against the four in-repo `examples/fixture-skills/` (see § The fixture graph).

> **Historical archetype labelling.** The `type` column below is the v7 archetype label (`capability` / `workflow` / `router` / `overlay`). Both the v7 `type` axis and the briefly-introduced v8 `operation` axis were **removed in v8** (ADR-0017 + its 2026-05-27 amendment) — v8 skills classify by `subject` + `deployment_target` with no archetype/operation axis. This table is retained only as a historical archetype-coverage reference.

| Skill | Archetype (v7 `type` — retired in v8) | `deployment_target` | Unique thing it demonstrates |
|---|---|---|---|
| `a11y` | capability | portable | Minimal routable capability, eval artifact present |
| `debugging` | workflow | portable | `## Workflow` section with numbered steps |
| `documentation` _(archive)_ | capability | portable | Eval artifact + worked audit both shipped — archetype coverage now in `examples/fixture-skills/` |
| `refactor` | workflow | portable | `relations.depends_on: [testing-strategy]` |
| `testing-strategy` | capability | portable | `routing_bundles: [quality]` |
| `skill-router` _(archive)_ | router | portable | Router archetype with `## Routing Rules` — archetype coverage now in `examples/fixture-skills/` |
| `lint-overlay` | overlay | portable | Overlay archetype with `extends` + `## Overlay Rules` |
| `graph-audit` _(archive)_ | capability | project | Full `grounding` block + recorded `truth_source_hashes` (this shape now demonstrated by `examples/fixture-skills/with-grounding`). |

### Supporting artifacts

| Directory | Role |
|---|---|
| `audits/` | Current per-skill audit outputs (`findings.md`, `verdict.md`, `scorecard.md`) emitted by `skill-graph audit`. |
| `examples/audits/` | Historical worked audit outputs retained as examples only. New audit runs should not write here. |
| `examples/evals/` | Eval fixtures for starter skills plus expanded routing and content-verification surfaces. |
| `examples/exports/` | Five plain `SKILL.md` exports demonstrating Tier 3's `export-skill.js` transform. |

---

## The fixture graph — how the four hermetic fixtures relate

> **The question this diagram answers:** "How do `relations.*` edges resolve, and why does a dangling target fail confidently?"

The relations graph cuts across all five tiers — declared in Tier 5 SKILL.md frontmatter, validated by Tier 3 lint, and consumed by Tier 4 routing. Its worst failure mode is silent drift: the router fails *confidently* because a dangling target looks like a valid one. The in-repo `examples/fixture-skills/` set is a **closed reference graph** — `with-relations` exercises four representative relation edge types (`depends_on`, `verify_with`, `related`, and `boundary`) against the other three fixtures, so lint resolves every target from this directory alone, with no dependency on the sibling `../skills/skills/` canonical library. The full schema also supports `broader`, `narrower`, and `disjoint_with`; tooling accepts `adjacent` only as the deprecated alias of `related`. The diagram reads the authoritative edges from each fixture's frontmatter; it does not duplicate them.

> These four are **v6-pinned hermetic test fixtures** (see `examples/fixture-skills/README.md`), not v7 style exemplars — their job is to exercise the schema's conditional-requiredness rules and the `{skill, reason}` relation shape, not to model a realistic skill domain. The full, realistic relations graph lives in the sibling canonical library (`~/Development/skills/`) and is what `scripts/skill-graph-route.js` traverses at request time.

```mermaid
flowchart LR
  MIN["minimal-capability<br/><i>code-engineering · portable</i>"]
  GR["with-grounding<br/><i>knowledge-organization · project</i>"]
  REL["with-relations<br/><i>knowledge-organization · portable</i>"]
  COMP["comprehension-full<br/><i>knowledge-organization · portable</i>"]

  %% depends_on — thick solid, load-bearing
  REL ==>|depends_on| MIN

  %% verify_with — dashed, co-load for confidence
  REL -.->|verify_with| COMP

  %% related — thin, suggested co-reading
  REL ---|related| MIN

  %% boundary — red, anti-ownership
  REL -. boundary .-x GR

  classDef capability fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
  classDef project stroke-width:3px
  class MIN,GR,REL,COMP capability
  class GR project
```

**Legend.** All four fixtures are hermetic v8 fixtures; node fill is blue. A thick node stroke marks `deployment_target: project` — only `with-grounding` carries the `grounding` block and recorded `truth_source_hashes`. Edge styles, all declared by `with-relations`: `==>` thick solid = `depends_on` (load-bearing — assumes `minimal-capability` lints clean); `-.->` dashed = `verify_with` (co-load `comprehension-full` for its Understanding fields); `---` thin = `related` (symmetric co-read with `minimal-capability`); `-. boundary .-x` red = `boundary` (anti-ownership — excludes grounding/project-target cases from co-routing when `with-relations` wins).

Every edge is verifiable. `node bin/skill-graph.js lint examples/fixture-skills/with-relations` rejects dangling targets; `node scripts/skill-graph-route.js` uses these edges at request time to decide which skill wins, which co-loads via `verify_with` or `depends_on`, and which is excluded via `boundary`.

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
| [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](skill-audit-loop/SKILL_AUDIT_LOOP.md) + `skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2 — Per-Skill Audit Checklist | The audit discipline — four operations (`audit` / `improve` / `evaluate` / `evolve`); the older five-phase flow is now the inner pipeline of `audit`. Consolidated into this repo per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md); the standalone `skill-audit-loop` repo is an archived deprecation mirror. |
| `docs/plans/multi-root-workspace.md` | Shipped v0.4.0 design doc. |
| `docs/plans/scripts-roadmap.md` | Forward-looking script plan. |

---

## The invariants this structure guards

Because the tiers are ordered, a tiny set of invariants holds the whole repo together:

- **Tier 1 → Tier 2:** Every top-level property in `SKILL_METADATA_PROTOCOL_schema.json` has a matching section in `SKILL_METADATA_PROTOCOL_field-reference.md`. (`check-protocol-consistency.js` C1.)
- **Tier 1 canonical-only:** Per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md), `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `schemas/manifest.schema.json` are the only schema files on disk; prior contract versions live in git history. The C6 "Versioned schema parity" invariant is retired (there is no second pinned file to drift against).
- **Tier 1 → Tier 3 (generator):** Every authored field has a documented projection into the manifest — copied, grouped, or dropped. No silent drops. (C2.)
- **Tier 1 ↔ Tier 5 (sample manifest):** The committed sample manifest matches live generator output. Enforced by `npm run manifest:validate`, not by `skill-lint.js`. (2026-05-27 H12 — the prior "skill-lint.js check 8" claim referred to a check removed in the 2026-05-19 lint reduction.)
- **Tier 5 → Tier 1:** Every starter skill validates against the schema; every relation target exists; every eval_artifact declaration is backed by a real file. `skill-lint.js` enforces schema, name, description, parent-dir, and subjects-primary (checks 1–5 per its in-file inventory) plus the new advisory field-purpose-comment check (check 6); relation-target existence is enforced by the manifest compiler; eval_artifact backing is enforced by `eval-staleness-checker.js`.

Break any one of these invariants and CI fails. That's why the tiering works: the enforcement tier (Tier 3) is literally the set of scripts that prove the upper and lower tiers agree.

---

## Adding something new — which tier does it go in?

| You want to add | Tier | Also touch |
|---|---|---|
| A new required field | 1 (schema) | 2 (SKILL_METADATA_PROTOCOL_field-reference.md, skill-metadata-protocol.md, manifest-field-mapping.md rename map), 3 (generator if grouped; lint deprecation warning if renaming), 5 (template + at least one starter) |
| A new optional field | 1 (schema) | 2 (SKILL_METADATA_PROTOCOL_field-reference.md entry), 3 (generator flow-through), 5 (template if it demonstrates the new field) |
| A new lint rule | 3 (skill-lint.js or scripts/lint/) | — |
| A new tool that uses the manifest | 4 | README Reference consumer section |
| A new starter skill | 5 | Regenerate sample manifest |
| A new worked audit | 5 | — |
| A new integration guide | Governance | — |

When in doubt: if the file *defines* a constraint, it's Tier 1. If it *describes* a constraint, it's Tier 2. If it *enforces* a constraint, it's Tier 3. If it *uses* a constraint to make a decision, it's Tier 4. If it *illustrates* a constraint, it's Tier 5. If none of those fit, it's Governance.

---

## Further reading

- [`README.md`](README.md) — the project overview; now structured by these same tiers.
- [`skill-metadata-protocol/design-rationale.md`](skill-metadata-protocol/design-rationale.md) — the authoritative field-semantics doc; § Anatomy carries the Mermaid diagram of the SKILL.md three-layer composition (frontmatter × body × teaching layer).
- [`docs/manifest-field-mapping.md`](docs/manifest-field-mapping.md) — the authored → generated bridge.
- [`skill-metadata-protocol/field-decision-guide.md`](skill-metadata-protocol/field-decision-guide.md) — decision tables for hard field choices.
- [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](skill-audit-loop/SKILL_AUDIT_LOOP.md) *(repo root)* — the repeatable audit loop; carries the Mermaid diagram of the five-phase flow (deterministic → graded → aggregate → fix → re-verify).
- [§ Tier 3 — Pipeline](#pipeline--how-a-skillmd-becomes-a-manifest-entry) — how `generate-manifest.js` projects authored frontmatter into the compiled manifest.
- [§ Tier 4 — Drift sentinel state machine](#drift-sentinel--state-machine) — the five states a grounded skill sits in and what transitions them.
- [§ Tier 4 — Routing harness](#routing-harness--per-skill-decision-path) — per-skill decision path that turns `routing_eval: present` from self-assertion into a lint-enforced claim.
- [§ The fixture graph](#the-fixture-graph--how-the-four-hermetic-fixtures-relate) — the four in-repo hermetic fixtures and their `relations.*` edges, indexed visually.
- [`CHANGELOG.md`](CHANGELOG.md) — what shipped in each version.
