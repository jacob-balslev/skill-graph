# Skill Graph Glossary

> Canonical definitions for every domain term used by Skill Metadata Protocol and Skill Graph. Field-reference doc links to these entries instead of redefining terms inline.

## Relation predicates

### `adjacent` *(deprecated alias of `related`)*

Legacy name for the symmetric associative relation. Tooling accepts it as an alias for existing skills; new skills author `relations.related`.

### `related`

*W3C mapping: `skos:related`*

Symmetric co-read relation. Use for skills that teach the same surface from different angles — reading one prompts a reader to want the other. Relation is symmetric in intent but the schema does not enforce reciprocity; lint-level reciprocity checking is a future feature. Max 5 entries recommended per skill to avoid hub-and-spoke clutter.

### `boundary`

Routing-layer anti-ownership edge. Use for skills this skill explicitly suppresses from co-routing when this skill wins a query. This relation is directional and Skill-Graph-specific; it is intentionally weaker than formal OWL disjointness. Item shape: bare string OR `{skill, reason}`. Reasons are strongly recommended because routing exclusions need an explicit ownership rule.

### `disjoint_with`

*W3C mapping: `owl:disjointWith`*

Formal class-disjointness assertion. Use only when the two skill concepts are genuinely disjoint in the ontology sense. This is rare in day-to-day routing; most wrong-skill prevention belongs in `boundary`. `disjoint_with` is symmetric in meaning even though the schema does not enforce reciprocal authoring.

### `broader`

*W3C mapping: `skos:broader`*

Cross-skill generalisation. Use when this skill is a *specialisation* of another, more general skill. Closes the gap where the flat `subject` / `taxonomy_domain` taxonomy cannot express skill-to-skill generalisation across branches.

Example: `react-best-practices` has `broader: [frontend]`.

### `narrower`

*W3C mapping: `skos:narrower`*

Cross-skill specialisation. The inverse of `broader` — this skill is more general than the targets. Tooling can infer `narrower` from other skills' `broader` edges, so explicit authoring is optional.

### `verify_with`

*W3C mapping: `prov:wasInformedBy`*

Skills that should be co-loaded for verification or that provide cross-checks. This is a provenance-style relation (PROV-O), not a classification relation — it captures "A's claims are informed by B's claims", not "A is-a B" or "A is-related-to B". Keep to 1-3 high-signal verifiers.

### `depends_on`

*W3C mapping: `dcterms:requires`*

Pragmatic prerequisite — this skill requires the target conceptually or operationally. Item shape: bare string OR `{skill, min_version}`. Use `min_version` when the depended-on skill's contract has versioned and this skill's claims depend on a specific version.

_(The `extends` field and the `capability` / `workflow` / `router` / `overlay` archetypes were removed in the v8 clean cut — see [`AGENTS.md § Major Version Is a Clean Cut`](../AGENTS.md). Body structure is now uniform; see [`skill-metadata-protocol/design-rationale.md § Body Structure`](../skill-metadata-protocol/design-rationale.md#body-structure).)

## Grounding modes

### `repo_specific`

Skill claims are grounded in a specific codebase. `deployment_target: project` skills use this mode or `hybrid`. `grounding.truth_sources` lists concrete file paths.

### `universal`

Skill claims are grounded in a language, framework, or specification that exists independently of any one codebase. `grounding.truth_sources` lists external specs or canonical docs.

### `hybrid`

Skill claims blend `repo_specific` and `universal` grounding. Use when a framework's general rules interact with repo-specific patterns.

## Evidence priority

### `repo_code_first`

When repo code and general knowledge disagree, trust the repo code. Default for `deployment_target: project` skills.

### `general_knowledge_first`

When repo code and general knowledge disagree, trust the general knowledge. Rare; use for skills where the repo is known to be behind the standard.

### `equal`

No presumption. The skill's `## Verification` section tells the reader how to resolve conflicts.

## Portability readiness

### `declared`

Portability is asserted in metadata only. The author claims the skill is portable; no export tooling has been run.

### `scripted`

Export tooling exists for at least one target. `scripts/export-skill.js` can transform this skill.

### `verified`

Export tooling exists AND the exported output has been checked against the target runtime. A receipt artifact (test run, import check) proves the exported skill works.

## Evaluation Status triple

### `eval_artifacts`

Does an eval file exist on disk? Values: `none` (no work started), `planned` (intended, not yet authored), `present` (file exists and is referenced).

### `eval_state`

Have the evals been run and passed? Values: `unverified` (no passing run recorded), `passing` (recent green run), `monitored` (continuously verified by a live toolchain).

### `routing_eval`

Is routing explicitly evaluated? Values: `absent`, `present`. `present` requires the harness at `scripts/skill-graph-routing-eval.js` to return PASS for the skill.

## Identity terms

### `urn`

*Optional persistent identifier. W3C mapping: `@id`.*

Globally-unique persistent identifier in the `urn:skill:<repo>:<skill-name>` form (RFC 8141). Unlocks FAIR Findability across repos. Consumers treat the URN as stable identity; `name` is display-layer.

## Classification terms

### `subject`

The primary browse shelf: one of the twelve values enforced by `schemas/SKILL_METADATA_PROTOCOL_schema.json`. It names the competency the skill teaches, not the project where it happens.

### `subjects[]`

Optional secondary browse shelves for skills that genuinely span more than one competency. Keep `subjects[0]` equal to `subject`; use at most two values.

### `deployment_target`

Where the skill is meant to run. `portable` skills can move across projects. `project` skills are tied to a specific project and require grounding.

### `scope`

Required free-text statement of what the skill applies to and what it excludes. This is not an enum.

### `taxonomy_domain`

Optional slash-delimited sub-path within `subject`. Use it to subdivide crowded shelves; do not use it as a second global taxonomy.

## Contract-version terms

### `schema_version`

Integer or string-of-integer identifying the Skill Metadata Protocol version. Currently `8` (the binding value lives in `schemas/SKILL_METADATA_PROTOCOL_schema.json`; the live contract state is in `SKILL_GRAPH.md § Current State`). Bumps on breaking changes to field semantics, shape, or required-ness. Additive additions (new optional fields, new enum values, new lint warnings) do not bump the version.

### `stability`

Lifecycle state of the skill: `experimental`, `stable`, `frozen`, `deprecated`. `deprecated` requires `superseded_by`.

### `superseded_by`

Name of the skill that replaces this one. Mandatory when `stability: deprecated`. W3C mapping: `prov:wasRevisionOf` (inverted).

## FAIR mapping

Each term below names the FAIR dimension(s) the Skill Graph field covers (Wilkinson et al. 2016):

- **Findable:** `name`, `urn`, `description`, `keywords`, `triggers`, `examples`, `subject`, `subjects[]`, `taxonomy_domain`, `project[]`
- **Accessible:** `paths`, `allowed-tools`, `compatibility`, `portability`
- **Interoperable:** `schema_version`, the JSON-LD `@context`, SPDX in `license`, all typed predicates
- **Reusable:** `license`, `compatibility`, `portability.targets`, `grounding.truth_sources`, `freshness`, `drift_check`, `lifecycle`, `grounding.evidence_priority`

## References

- SKOS Reference — https://www.w3.org/TR/skos-reference/
- PROV-O — https://www.w3.org/TR/prov-o/
- Dublin Core Metadata Terms — https://www.dublincore.org/specifications/dublin-core/dcmi-terms/
- OntoClean (Guarino & Welty 2002) — Communications of the ACM 45(2):61-65
- FAIR Principles (Wilkinson et al. 2016) — Scientific Data 3:160018. DOI:10.1038/sdata.2016.18
- RFC 8141 (URN Syntax) — https://datatracker.ietf.org/doc/html/rfc8141
- SPDX License List — https://spdx.org/licenses/
