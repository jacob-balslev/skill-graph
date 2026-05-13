# Agent Instructions for Skill Graph

> Type: Repository guide
> Scope: Applies to this `skill-graph` repository.

This repo defines the Skill Metadata Protocol and the Skill Graph reference toolchain. Treat it as a protocol/schema/tooling project, not as an agent runtime, hosted marketplace, persistent memory system, or prompt library.

## Start Here

Read these files before changing behavior or docs:

1. `README.md` - project purpose, public positioning, quick start, repository map.
2. `SKILL_GRAPH.md` - authority tiers and how schemas, docs, scripts, examples, and skills relate.
3. `SKILL_METADATA_PROTOCOL.md` - top-level normative protocol contract.
4. `docs/skill-metadata-protocol.md` - deeper rationale, archetypes, migration policy.
5. `docs/field-reference.md` and `docs/field-decision-guide.md` - field-level semantics and decision tables.
6. `docs/manifest-field-mapping.md` - authored-to-generated manifest projection rules.
7. `CONTRIBUTING.md` - contribution boundaries, skill authoring workflow, PR expectations.
8. `docs/quality-doctrine.md` - quality bar for scope preservation, readable names, compression, verification, and organization-over-trimming.

For audit work, also read `SKILL_AUDIT_LOOP.md` and `SKILL_AUDIT_CHECKLIST.md`.

## Project Shape

- Runtime: Node.js >= 20.
- Package: `@skill-graph/cli`.
- Package manager recorded in `package.json`: `pnpm@9.15.0`.
- The scripts use only Node built-ins today; there are no package dependencies.
- Public CLI entrypoint: `bin/skill-graph.js`.
- Current public release checkpoint in docs: `0.5.0` on `2026-05-13`.
- Current skill contract: `schema_version: 3`.
- The repo currently contains a larger starter skill library under `skills/`, plus specimen projects and evals under `examples/`.

## Authority Tiers

Follow the tier model in `SKILL_GRAPH.md`.

1. Tier 1 schema files in `schemas/` are the binding machine contract.
2. Tier 2 docs explain Tier 1; if docs disagree with schema, fix the docs or intentionally change the schema with matching migration notes.
3. Tier 3 scripts enforce, compile, migrate, or export the contract.
4. Tier 4 consumer tools route, check drift, and inspect the graph; they consume the contract but do not redefine it.
5. Tier 5 examples and starter skills are specimens; if they fail the contract, the specimen is wrong.

Governance files such as `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `.github/`, `LICENSE`, and `NOTICE` govern the repo, not the protocol shape.

## Quality Doctrine

Quality means the artifact becomes more correct, complete, understandable, verifiable, and maintainable. It does not mean shorter. It does not mean fewer skills, fewer examples, fewer fields, shorter names, thinner descriptions, or smaller bodies.

Do not reduce the project to save space, complexity, launch effort, review burden, or agent context. Preserve the full intended breadth of the skill library, examples, docs, evals, and tool surfaces unless the user explicitly asks to remove something. Prioritization means ordering work; it is not permission to drop coverage. A short demo, example set, or entry point is a front door only, never a cap on the project.

Handle scale by organizing it: manifests, routing groups, tags, categories, indexes, generated views, phased execution order, evals, overlap checks, and clear navigation. If something feels too large, first add structure, references, tables, anchors, generated artifacts, or retrieval paths. Do not trim meaning to reduce token count.

Do not "optimize" titles, descriptions, bodies, field names, metadata keys, or identifiers by making them shorter at the cost of meaning. Keep names readable, searchable, and self-explanatory. Prefer explicit names such as `skill_graph_protocol`, `skill_graph_source_repo`, and `skill_graph_canonical_skill` over compressed aliases such as `sg_protocol`, `src`, or `canon`, unless a binding external schema, protocol limit, or explicit user request requires the shorter form.

Compression is allowed only when it preserves meaning and evidence. A valid compression preserves intent, outcome, constraints, names, boundaries, and evidence paths. Invalid compression removes examples, weakens titles/descriptions, hides findings, shortens readable identifiers into opaque abbreviations, or collapses distinct concepts into one vague bucket.

When an external format imposes a hard limit, satisfy the limit in a generated/export-specific artifact and preserve the canonical Skill Metadata Protocol source. Document the constraint and point back to the full source instead of weakening the source artifact.

Before changing agent behavior instructions, quality rules, marketplace positioning, or skill-library structure, load the relevant local skills from this repo and from the sibling Development skill library when available. At minimum, check the relevant Skill Graph skills (`semantics`, `information-architecture`, `context-engineering`, `skill-scaffold`, `skill-infrastructure`, `graph-audit`) and the broader Development skills that govern quality (`quality-doctrine`, `no-cutting-corners`, `compression`, `token-efficiency`) when the task touches those concerns.

Claims of quality require verification. If a change says links work, routing works, exports validate, descriptions fit a limit, or all findings are preserved, run the relevant command and report the result. If verification was not run, say so.

## Editing Rules

- Keep one logical change per commit or PR.
- Preserve the current narrow scope: protocol, schemas, deterministic tooling, examples, docs, evals, audit artifacts, and portable `SKILL.md` export.
- Do not add proprietary company-specific skills, hosted service assumptions, prompt-library content, or agent runtime layers.
- Do not make breaking schema changes without a `schema_version` bump, migration notes, pinned schema copies, and migration tooling.
- Do not hand-edit generated artifacts unless the owning script says to. `docs/field-reference.generated.md` is generated by `scripts/build-field-reference.js`.
- Do not hide findings during audits. If a check or audit emits N findings, preserve all N, then recommend prioritization separately.
- Do not commit local-only agent state or research output unless explicitly intended and scrubbed. `.artifacts/`, `.claude/`, `.research/`, `.roundtable/`, `audits/_state/`, and `audits/sweep-ledger.jsonl` are ignored for a reason.
- Never commit secrets, PII, private filesystem telemetry, credentials, tokens, or public-endpoint logs containing sensitive data.

## Coupled Changes

When touching one artifact, update the matching tier artifacts in the same change.

- If you change `schemas/skill.schema.json`, also update `schemas/skill.v3.schema.json` when the current contract remains v3, plus `docs/field-reference.md`, `docs/skill-metadata-protocol.md`, `SKILL_METADATA_PROTOCOL.md` when relevant, `docs/manifest-field-mapping.md`, and `examples/skill-metadata-template.md` when affected.
- If you change `schemas/manifest.schema.json`, also update `schemas/manifest.v3.schema.json`, `docs/manifest-field-mapping.md`, and `scripts/generate-manifest.js` if projection logic changes.
- If you change `scripts/generate-manifest.js`, regenerate `examples/skills.manifest.sample.json`.
- If you change `scripts/skill-lint.js`, run it against every skill and the template. Update sample manifest or drift baselines when lint-affecting sources are part of `drift_check.truth_source_hashes`.
- If you change a Tier 2 protocol doc, check sibling Tier 2 docs for drift. The overview, field reference, decision guide, and manifest mapping must tell one story.
- If you change any grounded starter skill with `grounding.truth_sources`, re-record drift baselines with `node scripts/skill-graph-drift.js --record --apply skills/<name>` when the truth source hash is intentionally changing.

## Skill Authoring

For non-trivial new skills, write a short spec and plan first as described in `CONTRIBUTING.md`.

- Start from `examples/skill-metadata-template.md`.
- Put each skill in `skills/<skill-name>/SKILL.md`.
- Keep `name:` lowercase and aligned with the parent directory.
- Write `description:` as a routing contract: clear positive trigger plus explicit negative boundary.
- Pick `type` honestly: `capability`, `workflow`, `router`, or `overlay`.
- Pick `scope` honestly: `portable`, `reference`, or `codebase`.
- Add `grounding` for `scope: codebase`.
- Point every `relations.*` target at an existing sibling skill.
- Keep `eval_artifacts`, `eval_state`, and `routing_eval` truthful.
- Remove template teaching comments before committing a derived skill.

## Validation Commands

Use the full repo verification before handing off substantive changes:

```bash
npm run verify
```

Useful focused checks:

```bash
node scripts/skill-lint.js --include-template
node scripts/check-protocol-consistency.js
node scripts/check-markdown-links.js
node scripts/generate-manifest.js --include-template --validate-only
node scripts/skill-graph-routing-eval.js --manifest examples/skills.manifest.sample.json --only-asserted
node scripts/verify-skill-md-export.js
node scripts/skill-overlap.js
node scripts/skill-graph-drift.js
node bin/skill-graph.js --help
```

For routing diagnostics:

```bash
node scripts/skill-graph-route.js "audit my skills for schema conformance"
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix
```

For audit scaffolding:

```bash
node scripts/skill-audit.js <skill-name>
node scripts/skill-audit.js <skill-name> --graded --grader-cli "codex exec"
```

## GitHub Actions

Keep `.github/workflows/skill-graph-lint.yml` aligned with `package.json` scripts and this repo's actual file names. The protocol consistency script is `scripts/check-protocol-consistency.js`.

CI should cover lint, protocol consistency, manifest generation or validation, routing evals, export verification, markdown links, overlap, and the unit smoke tests.

## Public Release Hygiene

Before publishing to npm, tagging a release, pushing, or otherwise making code public:

- Run `npm run verify`.
- Confirm ignored local artifacts are not staged.
- Check that docs mention the correct release version, schema version, and current command names.
- Check that `LICENSE`, `NOTICE`, `package.json`, `README.md`, `CHANGELOG.md`, and generated/sample artifacts are consistent.
- Review for secrets, PII, private paths, and local agent telemetry.

## When Unsure

Verify from source files and scripts before claiming behavior. If an API, command, file path, version, schema rule, or validation result has not been checked in this repo, say so and inspect it first.
