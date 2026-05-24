# ADR 0014 — Canonical-only schema files (retire pinned-version mirrors)

> Status: Accepted
> Date: 2026-05-24
> Supersedes: implicit "pin current version" pattern previously enforced by `check-protocol-consistency.js` C6 and documented across `SKILL_METADATA_PROTOCOL.md`, `SKILL_GRAPH.md`, and `AGENTS.md`.
> Related: ADR 0011 (four-verdict Health Block — referenced the now-retired `skill.v7.schema.json` filename), ADR 0013 (scope field vs overlay-of — same).

## Context

Until 2026-05-24 the schemas directory carried two parallel sources of truth for each artifact:

- `schemas/skill.schema.json` (the "canonical" file edited directly)
- `schemas/skill.v7.schema.json` (a pinned mirror of the current contract version, byte-identical modulo `$id`/`title`)

Plus pinned copies of every prior contract version: `skill.v2.schema.json` through `skill.v6.schema.json`. Same arrangement for the manifest schema. The C6 protocol-consistency check enforced byte-equivalence between the canonical and the current-version pin.

The original intent of the pinned-current-version file was:

1. Provide a stable URL for downstream consumers pinned to `v7` specifically (e.g., a federated registry, a generator, a runtime).
2. Serve as documentation: "this is what v7 looked like at the moment of authoring."
3. Enable a content-equality check between the editable canonical and the pinned mirror.

Three problems with that arrangement surfaced during the 2026-05-24 schema-canonicalization sweep:

1. **No external consumer pins to `skill.v7.schema.json`.** All in-repo tooling (`skill-lint.js`, `generate-manifest.js`, `skill-audit.js`, `bin/skill-graph.js`, `check-protocol-consistency.js`) loads `skill.schema.json` (the canonical). The `marketplace/skills/<name>/SKILL.md` template `yaml-language-server` annotation points at the canonical. The Agent-Skills export pipeline reshapes frontmatter; it does not consume the protocol schema directly.
2. **Drift is built in, not prevented.** Because the v7 pin is a copy maintained by sync, every protocol edit requires updating two files. C6 caught only equality drift, not stylistic drift (key ordering, JSON formatting). When a single session edited only one file, C6 fired; when both files were edited in parallel by different sessions with slightly different additions, the merge was non-trivial. The 2026-05-24 incident (manifest enum-tightening on `manifest.v7` plus categories/PROVISIONAL additions on `skill.v7` while `skill.schema.json` was untouched) is the canonical example.
3. **Version is already declared inside the document.** Every SKILL.md carries `schema_version: 7` in its frontmatter, validated by the canonical schema's `oneOf` clause on `schema_version`. Per JSON Schema convention and across openapi/asyncapi/json-schema-org practice, the version declaration belongs inside the document, not in the filename of the schema that validates it. The pinned `skill.v7.schema.json` was a second declaration of the same fact — redundant with `schema_version: 7` inside every skill.

The external industry practice (verified 2026-05-24 against the JSON Schema specification, OpenAPI, AsyncAPI, the json-schema-org website's schema-versioning issue tracker, and the Couchbase / Liquid Technologies / json-everything tutorials):

- "The published 2020-12 draft is the right default unless your validator or platform is pinned to an older draft."
- "Storing the schema version within the document is a best practice that provides a mechanism to migrate and upgrade models as they change over time."
- "Put a `schemaVersion` field in every config and validate each version explicitly, using a root-level `schemaVersion` field for the document format."
- Incremental migrations live in code (codemods); they do not require the prior schemas to remain on disk to function. The codemods themselves can be retired once the corpus has migrated.

## Decision

Adopt the **canonical-only schema model**:

1. `schemas/skill.schema.json` and `schemas/manifest.schema.json` are the only schema files on disk. Editing them is editing the contract.
2. Prior contract versions (v2 through v6) live in git history. The codemods that walked the corpus through each migration (`migrate-skill-v2-to-v3.js`, …, `migrate-skill-v6-to-v7.js`) have already run their course and are retired alongside the pinned schemas they targeted.
3. The current contract version is declared inside every SKILL.md via `schema_version: <N>` and enforced by the canonical schema's `oneOf` on `schema_version`. The schema's `$id` (`https://skillgraph.dev/schemas/skill.schema.json`) is the stable identifier, not the filename.
4. The C6 ("Versioned schema parity") protocol-consistency check is retired. There is no second file to drift against.
5. Per-version migration narrative (e.g., `docs/migrations/v6-to-v7.md`) is not on disk. The migration story for any historical version is `git log -- schemas/skill.schema.json` plus the commit that introduced that version's `schema_version` constant.

## Consequences

**Wins**

- One file to edit per artifact. No drift between canonical and pinned.
- No C6 false positives or sync rituals.
- One less hop for any agent or human looking up "what does the schema require right now."
- Aligned with external JSON Schema convention.

**Trade-offs**

- A future external consumer that needs to pin against "the v7 contract specifically" has to derive it from git history (`git show <commit>:schemas/skill.schema.json`) rather than read a pinned file. We accept this because no such consumer currently exists; if one appears, the right answer is a `git tag schema-v7` plus a `$ref` URL that resolves against the tag, not a duplicate file in `main`.
- ADRs 0011 and 0013 reference `skill.v7.schema.json` by filename in their body text. Per ADR convention (broken-link-fix exception), the references have been updated in-place to `skill.schema.json`. The substantive decisions in those ADRs are unchanged; only the file reference was repointed.
- The corpus migration backlog (~147 workspace skills with various levels of v7 conformance, tracked in SG-03/04/05/06/20) is unaffected by this ADR — those skills declared `schema_version: 7` based on the integer in their frontmatter, not based on which pinned file existed.

**Backout**

If a downstream consumer materializes that genuinely needs the pinned mirror, the backout is mechanical: re-run `cp schemas/skill.schema.json schemas/skill.v7.schema.json` plus a `sed` to set the `$id`/`title` back to the v-prefixed form, and reinstate the C6 check. Two lines of code. We do not pre-pay for that contingency.

## Implementation

Implemented in commits:

- `7cd460d` — synced v7 content into canonical schema; removed C6 logic from `check-protocol-consistency.js` and its help string in `bin/skill-graph.js`; pointed `skill-lint.js`'s `SCHEMA_PATH` at the canonical file.
- `337fe22` — deleted `schemas/skill.v{2-7}.schema.json`, `schemas/manifest.v{2-7}.schema.json`, `scripts/migrate-skill-v{N}-to-v{M}.js`, and `docs/migrations/v{4-5,5-6,6-7}.md`. Stripped the migration-notes section + v4/v5/v6 back-compat parenthetical from `SKILL_METADATA_PROTOCOL.md`. Mass-renamed `skill.v7.schema.json` → `skill.schema.json` across all docs and ADRs (broken-link fix).
- `d5c38d9` — added `PROVISIONAL` to `comprehension_verdict` enum for consistency with the existing `application_verdict` PROVISIONAL value and the rule in `.claude/rules/version-schema-contract.md` § 5.

After the canonicalization commits, parallel-session work resurrected `schemas/skill.v7.schema.json`, `schemas/manifest.v7.schema.json`, and `docs/migrations/v6-to-v7.md` (commits `365a9d8`, `b465ca3`). This ADR is written to formalize the decision so the resurrection can be reverted with documented backing rather than competing-session reflex. The corresponding cleanup commit follows this ADR.

## Verification

After applying this ADR + the cleanup commit:

- `node scripts/check-protocol-consistency.js` → PASS 7/7.
- `node scripts/skill-lint.js` → still validates against `schemas/skill.schema.json`.
- `ls schemas/` → contains exactly: `manifest.schema.json`, `skill.schema.json`, `skill.context.jsonld`, `vocabulary/`.
- `grep -rn "skill\.v[0-9]\.schema\|manifest\.v[0-9]\.schema" .` → zero hits in tracked files (modulo this ADR's own change log).
