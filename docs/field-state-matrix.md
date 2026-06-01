# Field-State Matrix

> Type: Reference
> Purpose: every protocol field tagged by ownership state, so authors, reviewers, and the audit loop never confuse "who writes this" with "what this means."
> Source of truth: [../SKILL_METADATA_PROTOCOL.md](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) (semantics), [../schemas/SKILL_METADATA_PROTOCOL_schema.json](../schemas/SKILL_METADATA_PROTOCOL_schema.json) (enforcement), [SKILL_METADATA_PROTOCOL_field-reference.md](../skill-metadata-protocol/field-reference.md) (per-field detail).

## The six states

| State | Meaning | Who writes it | When |
|---|---|---|---|
| **human-authored** | The author writes this in `SKILL.md` and is responsible for keeping it current. | The author. | At authoring time + on content updates. |
| **loop-written** | The Skill Audit Loop stamps this on the skill's own frontmatter. Hand-edits are overwritten on the next `audit` run. | `audit` / `improve` / `evaluate` and the graders. | On every audit/eval run that touches the skill. |
| **earned-with-receipt** | Author writes the value, but the protocol expects it to be backed by a runnable artifact (eval, drift hash, routing eval). Setting it without the receipt is dishonest attestation. | The author, after the receipt exists. | When the supporting artifact is created and verified. |
| **generated** | Lives in `skills.manifest.json` (NOT in `SKILL.md`). Computed from authored fields by `generate-manifest.js`. Authors never edit. | `scripts/generate-manifest.js`. | On every manifest rebuild. |
| **deprecated** | Was part of an older schema version. Still accepted for back-compat; should not be added to new skills. | n/a (legacy). | Phased out per the schema migration plan. |
| **compatibility-alias** | An alternative name or value the normalizer maps to the canonical shape. Accepted on read; new skills should use the canonical form. | n/a (legacy / workspace convention). | Normalized at parse time. |

## Required (12 fields, v8 schema gate)

All twelve are **human-authored**. The schema lint gate (`skill-lint.js` against `schemas/SKILL_METADATA_PROTOCOL_schema.json`) fails the skill if any are missing or malformed. Three of them are also **earned-with-receipt**: setting the attested state without the supporting artifact is dishonest.

| Field | Type | State | Receipt expected when |
|---|---|---|---|
| `schema_version` | int | human-authored | n/a (canonical value is `8`) |
| `name` | string | human-authored | n/a |
| `description` | string ≥ 20 | human-authored | n/a |
| `version` | semver | human-authored | n/a (author bumps on content change) |
| `subject` | closed 9-enum | human-authored | n/a |
| `deployment_target` | closed 2-enum | human-authored | n/a |
| `owner` | string | human-authored | n/a |
| `freshness` | ISO date | human-authored | n/a (authored review date, not computed) |
| `drift_check.last_verified` | ISO date | human-authored | n/a |
| `drift_check.truth_source_hashes` | object | **earned-with-receipt** | `node scripts/skill-graph-drift.js --record --apply <skill-dir>` produced the hashes |
| `eval_artifacts` | enum | human-authored, **earned-with-receipt when `present`** | `present` requires a real eval file under the skill's `evals/` dir |
| `eval_state` | enum | human-authored, **earned-with-receipt when `passing` or `monitored`** | `passing` requires a real grader run; `monitored` requires CI integration |
| `routing_eval` | enum | human-authored, **earned-with-receipt when `present`** | `present` requires populated `examples` + `anti_examples` AND a passing `node scripts/skill-graph-routing-eval.js --skill <name>` run |

## Conditionally required (3 fields, allOf-enforced)

Required only when the gating condition applies. All **human-authored**.

| Field | Required when | Enforced by |
|---|---|---|
| `grounding` | `deployment_target: project` | schema `allOf` |
| `superseded_by` | `stability: deprecated` | schema `allOf` |
| `keywords` | `deployment_target: project` OR `routing_bundles` is set | routing review / routing evals (not schema-enforced) |

## Optional, strongly recommended (5 fields)

All **human-authored**. Not schema-required but materially improve discoverability and trust.

| Field | Type | Why |
|---|---|---|
| `stability` | enum | `experimental` (default) / `stable` / `frozen` / `deprecated`. Promotion to `stable` is gated by `check-stability-promotion.js`. |
| `license` | string | SPDX identifier. Strongly recommended for any skill intended for distribution. |
| `keywords` | string[] | Semantic phrases for fuzzy/embedding-based routing. |
| `triggers` | string[] | Exact match strings for label-routable skills. |
| `relations` | object | Typed edges to sibling skills. Lint enforces target existence. |

## Optional, enrichment (varies)

All **human-authored** unless tagged otherwise.

### Activation and routing

| Field | Type | State | Notes |
|---|---|---|---|
| `paths` | glob[] | human-authored | Gitignore-style negations allowed; all-negation lists are rejected by lint. |
| `examples` | string[] | human-authored | Positive activation examples in user voice. 2-5 recommended. |
| `anti_examples` | string[] | human-authored | Negative class. Prompts that look related but a different skill should handle. |
| `project` | `{handle, role}[]` | human-authored | Belonging-entity references for `deployment_target: project` skills. Absent = ambient skill (applies across all projects). Replaces old `workspace_tags`. |
| `repo` | `{handle, url}[]` | human-authored | Repo-level belonging-entity references. Complements `project[]`. |
| `routing_bundles` | string[] | human-authored | Routing group memberships. |
| `taxonomy_domain` | string | human-authored | Slash-delimited hierarchical sub-path within a `subject` (e.g. `engineering/api-design`). Complements `subject`. Renamed from `domain`. |

### Classification (taxonomy)

`subject` and `deployment_target` are the required classification axes (see the Required table); `taxonomy_domain` (above) subdivides an over-subscribed subject. The one optional classification field:

| Field | Type | State | Notes |
|---|---|---|---|
| `subjects` | enum[] | human-authored | Polyhierarchy for skills that genuinely span two browse shelves. Max 2, primary first; the primary entry MUST equal `subject`. Same closed 9-enum as `subject`. |

### Understanding fields (v6+, flat)

All **human-authored**. Required as a group when `comprehension_state: present`.

| Field | Type | State | Notes |
|---|---|---|---|
| `comprehension_state` | enum | human-authored | `absent` (default) or `present`. When `present`, the five Understanding fields below are required. |
| `mental_model` | string | human-authored | Primitives + relationships. Graded by comprehension grader's `mental_model` dimension (weight 1.5). |
| `purpose` | string | human-authored | Problem + prior alternative. Comprehension dimension (weight 1.0). |
| `boundary` | string | human-authored | Things commonly confused with the concept. Comprehension dimension (weight 1.5). **Note:** field name shared with `relations.boundary`; disambiguated by nesting depth. |
| `analogy` | string | human-authored | One-sentence analogy preserving the core mechanism. Comprehension dimension (weight 0.5). |
| `misconception` | string | human-authored | The wrong mental model people bring. Complements `boundary`; not directly graded. |
| `concept` | object | **deprecated** | v5 nested teaching block. Accepted for v5/v6 back-compat. Lint warns when populated alongside missing flat fields. |

### Grounding (required when deployment_target: project)

| Field | Type | State | Notes |
|---|---|---|---|
| `grounding.subject_matter` | string | human-authored | Free-text label naming what the skill is grounded in (e.g., `Shopify order sync`). Renamed from `domain_object`. |
| `grounding.grounding_mode` | enum | human-authored | `repo_specific` / `universal` / `hybrid`. |
| `grounding.truth_sources` | array | human-authored | Object entries with `path`, optional `line_range`, optional `anchor`, optional `note` are preferred. |
| `grounding.failure_modes` | string[] | human-authored | What goes wrong when applied incorrectly. |
| `grounding.evidence_priority` | enum | human-authored | `repo_code_first` / `general_knowledge_first` / `equal`. |

### Portability and standards

| Field | Type | State | Notes |
|---|---|---|---|
| `portability.readiness` | enum | human-authored | `declared` / `scripted` / `verified`. `verified` requires an export receipt. |
| `portability.targets` | enum[] | human-authored | Only `skill-md` is valid today. |
| `urn` | string | human-authored | Format: `urn:skill:<repo-slug>:<skill-name>`. The skill-name segment must equal `name`. |
| `compatibility` | object | human-authored | `{ runtimes?, node?, notes? }`. Plain string accepted in Agent-Skills-compatible encoding. |
| `allowed-tools` | string | human-authored | Space-separated tool allowlist. |

### Lifecycle and telemetry

| Field | Type | State | Notes |
|---|---|---|---|
| `lifecycle.stale_after_days` | int | human-authored | When the drift sentinel flags the skill `STALE` after `drift_check.last_verified`. |
| `lifecycle.review_cadence` | enum | human-authored | `per-commit` / `weekly` / `quarterly` / `on-truth-source-change`. |
| `runtime_telemetry` | object | human-authored | Points at a JSONL feed of run receipts. Optional. |
| `eval_last_run` | object | human-authored | Receipt for the most recent eval run. Supports `eval_state: passing` / `monitored` with a real receipt. |

## Audit Status (v7+, loop-written)

The Skill Audit Loop owns these. **Do not hand-author.** Hand-edits are overwritten on the next `audit` run.

| Field | Enum | Written by | What it records |
|---|---|---|---|
| `last_audited` | ISO date | `audit` | Date the audit ran. Loop priority uses this. |
| `last_changed` | ISO date | `improve` | Date the body or frontmatter was edited. |
| `structural_verdict` | `PASS` / `PASS_WITH_FIXES` / `FAIL` / `UNVERIFIED` | `audit` | Form-layer (gates 1-2, 7). Rolled up from `lint_verdict`. Only external-mandate violations produce `FAIL`. |
| `truth_verdict` | `PASS` / `DRIFT` / `BROKEN` / `UNVERIFIED` | `audit` | Truth-layer (gates 3-6). Rolled up from hashable drift evidence plus audit judgment; absent hash coverage requires explicit human/graded truth evidence before `PASS`. |
| `comprehension_verdict` | `PASS` / `SHALLOW` / `REDUNDANT` / `UNVERIFIED` / `PROVISIONAL` / `SKIPPED_BASELINE_HIGH` / `NA` | comprehension grader | Demoted in v7 to cheap smoke test. Never alone certifies a skill. |
| `application_verdict` | `APPLICABLE` / `REDUNDANT` / `HARMFUL` / `MIXED` / `FALSE_POSITIVE` / `UNVERIFIED` / `PROVISIONAL` | application grader | **The primary quality signal.** A skill is behaviorally certified only when this is `APPLICABLE`. |
| `eval_score` | 0.0-5.0 | `evaluate` | Latest aggregate grade. |
| `eval_failed_ids` | string[] | `evaluate` | Failed eval IDs. Empty when clean. |
| `lint_verdict` | `PASS` / `FAIL` / `UNKNOWN` | `skill-lint.js` | Per-script signal. Rolls up into `structural_verdict`. |
| `drift_status` | `OK` / `DRIFT` / `BROKEN` / `STALE` / `NO_BASELINE` / `EXTERNAL_UNHASHED` / `UNKNOWN` | `skill-graph-drift.js` | Per-script signal. Hashable states can support `truth_verdict`; `UNGROUNDED` is a script report, not a schema-valid state to stamp. |

**Confidence ladder (highest → lowest):**

| Tier | What it means | When the loop writes it |
|---|---|---|
| `APPLICABLE` (application) / `PASS` (other axes) | Certified by the independent dual-run grader. | Grader produced a receipt. |
| `PROVISIONAL` | Single-model audit assessed the skill; lower confidence. To be confirmed or overturned. | A single-model audit ran and produced a real lower-confidence result. **Not a vacuum** (do not default to UNVERIFIED when a single audit actually ran). |
| `UNVERIFIED` / `NA` | Not assessed at all. | Default state; means nobody has assessed this axis. |

## Generated (in `skills.manifest.json`, not in `SKILL.md`)

`scripts/generate-manifest.js` reads frontmatter from every skill and emits these. Authors never write them in `SKILL.md`.

| Field | Source |
|---|---|
| `id` | Derived from the skill's path relative to `skills/` (e.g. `task-execution`). |
| `path` | Relative path to the `SKILL.md` file. |
| `summary` | Aggregate counts (`total_skills`, `by_subject`, `by_deployment_target`, `by_schema_version`, `by_stability`, `by_project`). |
| `generated_at` | ISO timestamp of when the manifest was generated. |
| `activation` | Compiled block merging `triggers`, `keywords`, `paths`, `examples`, `anti_examples`. |
| `health` | Compiled block merging `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `eval_last_run`, `freshness`, `drift_check`. |

For the complete authored-to-generated field rename map and loss policy see [manifest-field-mapping.md](./manifest-field-mapping.md).

## Deprecated (do not add to new skills)

| Field | Replaced by | Notes |
|---|---|---|
| `concept` (nested block) | The five flat Understanding fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) | v5 legacy. Still accepted for back-compat. Lint warns when populated alongside missing flat fields. |
| `audit_verdict` (single aggregate) | The four discrete v7 verdicts (`structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`) | Pre-v7 aggregate. v6→v7 codemod (`scripts/migrate-skill-v6-to-v7.js`) strips it. See [ADR 0011](./adr/0011-split-audit-verdict-into-four-verdicts.md). |
| `relations.adjacent` | `relations.related` | Deprecated alias from v3.0. Tooling still accepts it. New authoring should use `related`. |
| `eval_status` | The orthogonal triplet `eval_artifacts` + `eval_state` + `routing_eval` | Legacy single field replaced by the orthogonal triplet. |

## Compatibility-alias (normalized at parse time)

The only alias normalization still performed is the two-physical-encoding reconciliation below. The v7 field/value aliases (`primaryCategory`; `scope: operational|overlay|generic`; `type: doctrine|domain|framework|feedback`) are NOT normalized under the v8 clean cut — those fields and values are not declared in the live schema, so a skill still carrying them fails lint (CONTENT-mode migration work for `/audit:*`, not an auto-fixed alias).

| Alias | Canonical form | Normalized by |
|---|---|---|
| Agent-Skills-compatible encoding (nested `metadata:`, JSON-string-encoded structured fields) | Protocol-native (top-level YAML keys, native objects/arrays) | `parse-frontmatter.js::normalizeFrontmatter()` lifts `metadata.*` to top level and `JSON.parse`s stringified values |

**Stripped during normalization (not part of the contract, authors never write these):** `skill_graph_source_repo`, `skill_graph_protocol`, `skill_graph_project`, `skill_graph_canonical_skill`, description-length book-keeping keys.

## Resolution rules when two states conflict

1. **Top-level wins over `metadata.*`.** When the same field appears in both, the top-level entry is the canonical signal. (Author overrode the nested default deliberately.)
2. **Flat Understanding fields win over `concept` block.** When both are present, the comprehension grader reads the flat fields and ignores the nested block.
3. **`structural_verdict` from canonical lint wins over root lint.** The root `scripts/skill/skill-lint.js` writes legacy `lint_verdict`; the canonical `skill-graph/scripts/skill-lint.js` writes the Audit-Status-aligned signal. Per ADR 0009 the canonical version is authoritative; see SH-6198 for the in-progress deprecation of the root copy.
4. **Loop-written fields are not authored.** Hand-edits to Audit Status fields are silently overwritten on the next `audit` run. If you need a different verdict, run the audit; do not edit the frontmatter.

## Related

- [../SKILL_METADATA_PROTOCOL.md](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md), normative spec
- [SKILL_METADATA_PROTOCOL_field-reference.md](../skill-metadata-protocol/field-reference.md), per-field semantics with examples
- [SKILL_METADATA_PROTOCOL_field-decision-guide.md](../skill-metadata-protocol/field-decision-guide.md), when to choose which value
- [AUTHORING-QUICKSTART.md](./AUTHORING-QUICKSTART.md), shortest path to a valid SKILL.md
- [skill-audit-loop-executable-map.md](./skill-audit-loop-executable-map.md), which scripts write which fields
- [manifest-field-mapping.md](./manifest-field-mapping.md), authored-to-generated mapping
- [adr/0011-split-audit-verdict-into-four-verdicts.md](./adr/0011-split-audit-verdict-into-four-verdicts.md), why the four-verdict split
- [adr/0009-sibling-repo-deprecation.md](./adr/0009-sibling-repo-deprecation.md), the canonical-source policy
