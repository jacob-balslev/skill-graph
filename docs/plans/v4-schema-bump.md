# v4 Schema Bump — Planned Breaking Changes

> **Status:** Planned. Not shipped. All items below require coordinated implementation, a codemod (`scripts/migrate-skill-v3-to-v4.js`), pinned schema copies (`schema.v4.schema.json`, `manifest.v4.schema.json`), migration notes in `docs/manifest-contract.md`, and a full library sweep of the 8 shipped skills + template.
>
> **Why a plan doc, not direct changes:** v3 shipped 2026-04-18. A second breaking bump within the same release window burns consumer trust — each bump costs re-tooling downstream. Ship these as a bundle under v4 after v3 settles.

## Scope

Five breaking changes that came out of the Opus + Gemini 3.1 Pro + GPT-5.4 v1 + GPT-5.4 v2 audit (see `.artifacts/` in this repo for the full audit artifacts):

### 1. `name` pattern → kebab-case only

**Current (v3):** `^[a-z0-9][a-z0-9-/:]*$` — allows `/` and `:` for hierarchical/namespace-style names (e.g., `codex:codex-rescue`).

**v4:** `^[a-z0-9][a-z0-9-]*$` — strict kebab-case. No `/`, no `:`.

**Rationale:** `skills/naming-conventions/SKILL.md:85-95` says *"Every identifier falls into exactly one casing bucket"* and skill directories are kebab-case matching `name:`. Allowing `/` and `:` violates the repo's own naming doctrine and breaks the parent-directory-matches-name invariant that lint already enforces. Portability transforms already normalize to kebab-case on export, so the lenient authored pattern serves no real use case.

**Migration:** All 8 shipped starters already comply. Any downstream consumer using `name: some/thing` or `name: foo:bar` must rename. Codemod emits WARN and suggests a `s/[/:]/-/g` rewrite; manual review recommended for semantic integrity.

---

### 2. `grounding.truth_sources` → object array `{path, start_line?, end_line?}`

**Current (v3):** `string[]` — file paths only.

**v4:**

```yaml
grounding:
  truth_sources:
    - path: src/integrations/shopify/client.ts
      start_line: 45
      end_line: 120
    - path: docs/metadata-contract.md   # whole-file grounding still valid (omit line range)
```

Schema:
```json
"truth_sources": {
  "type": "array",
  "items": {
    "type": "object",
    "additionalProperties": false,
    "required": ["path"],
    "properties": {
      "path": { "type": "string", "minLength": 1 },
      "start_line": { "type": "integer", "minimum": 1 },
      "end_line": { "type": "integer", "minimum": 1 }
    }
  }
}
```

**Rationale:** Two independent findings converge:
- GPT-5.4 v2 doctrine audit: `skills/skill-scaffold/SKILL.md:609-610` requires code-grounded skills to list `## Key Files` with line ranges. Skill Graph's `truth_sources` is the frontmatter equivalent but lacks ranges.
- Opus + DeepDocs research: whole-file SHA-256 hashes in `drift_check.truth_source_hashes` are too coarse. A 1-line edit to an unrelated function invalidates the hash. Symbol/line-range granularity fixes the noise-to-signal ratio.

**Migration:** Codemod rewrites each bare string `"file"` → `{"path": "file"}`. Authors manually add `start_line`/`end_line` after the mechanical rewrite, based on what each skill actually depends on. `drift_check.truth_source_hashes` then hashes only the referenced range (computed from start_line/end_line), dramatically reducing drift noise.

**Impact on `scripts/skill-graph-drift.js`:** rewrites hash computation to slice the file content by line range before hashing. Line-range keys become `"path#L<start>-<end>"` in `truth_source_hashes`.

---

### 3. `extends` bidirectional enforcement → via schema, not just lint

**Current (v3):** Schema enforces `type: overlay → extends required`. The reverse (non-overlay → no `extends`) is enforced by `scripts/skill-lint.js` (v0.5.0, this session) via an allOf `not` clause. Works, but schema-level + lint-level both belt-and-suspenders is cleaner if the schema itself guarantees the invariant.

**v4:** Keep the allOf rule from v0.5.0 in the v4 schema file explicitly, and remove the lint-level duplicate to reduce drift risk.

**Rationale:** Belt-and-suspenders is correct for v0.5.0 (lint catches the case even if a consumer uses a validator that mis-handles `allOf` + `not`). v4 is the point to consolidate to schema-only enforcement since v4 consumers are expected to use Ajv or equivalent.

---

### 4. `paths` all-negation rejection → schema-level

**Current (v3):** Lint rejects lists of only-negation patterns (v0.5.0 addition). Schema allows it.

**v4:** Schema-level rejection via a JSON Schema pattern-list constraint:

```json
"paths": {
  "type": "array",
  "minItems": 1,
  "items": { "type": "string", "minLength": 1 },
  "not": {
    "items": { "pattern": "^!" }
  }
}
```

The `not` clause rejects arrays where EVERY item starts with `!`.

**Rationale:** Same as #3 — v4 is the consolidation point where lint-only rules move into the schema for tighter consumer contracts.

---

### 5. `activation.paths` gitignore negation → actually implemented in the router

**Current (v3):** `docs/field-reference.md:562-581` and `schemas/skill.schema.json:138-145` describe gitignore-style negation (`!pattern`). `scripts/skill-graph-route.js:121-128` (v3) explicitly states mixed positive/negative lists are NOT implemented.

**v4:** Implement the documented behavior in the router. A path list `["src/**", "!src/generated/**"]` should include everything under `src/` EXCEPT `src/generated/**`. Add test cases in a dedicated `examples/tests/paths-negation.json` that the router consumes as golden fixtures.

**Rationale:** This is not a schema change — the schema already allows it. But it IS a contract change: v3 documented a feature that v3 didn't ship. v4 delivers what v3 promised.

---

## Sequence for the v4 bump (when it ships)

1. Copy current `skill.schema.json` + `manifest.schema.json` to `skill.v3.schema.json` + `manifest.v3.schema.json` (already done in this session as part of v3 pinning).
2. Apply changes 1–5 above to the unversioned schemas.
3. Ship pinned `skill.v4.schema.json` + `manifest.v4.schema.json` (content-identical to unversioned).
4. Write `scripts/migrate-skill-v3-to-v4.js`:
   - Normalize `name` to kebab-case, WARN on any `/` or `:` replacement so authors review.
   - Rewrite `grounding.truth_sources` from `string[]` → object-array with `{path}` only; authors add line ranges manually.
   - Leave `paths` untouched; lint already rejects all-negation in v0.5.0.
5. Update `docs/manifest-contract.md` with a new § "Migration Note — v3 → v4" containing the transformations above.
6. Update `docs/field-reference.md` for the changed fields.
7. Update `docs/single-skill-audit-checklist.md` schema_version check.
8. Bump `CHANGELOG.md` root `schema_version` reference to `4`.
9. Run migrate on all 8 starters + template. Regenerate manifest. Re-run drift sentinel with new hash key scheme.
10. Run full lint + manifest validation + audit sweep.

## Out of scope for v4 (deferred further)

- `utterances[]` / `examples[]` (v0.5.0 additive, shipped this session).
- `superseded_by` (v0.5.0 additive, shipped this session).
- Typed audit artifact schemas (`findings.schema.json`, `verdict.schema.json`, `scorecard.schema.json`) — design doc at `docs/plans/audit-artifact-schemas.md` (to be written).
- `activation.must_activate_for[]` / `must_not_activate_for[]` as hard routing assertions — subsumed by `examples`/`anti_examples` in v0.5.0. Reconsider if routing evaluation shows gaps.
- `instructions` vs `description` split — rejected after Gemini + GPT-5.4 v2 both disagreed; body H2 sections already serve the instructions role.
- Symbol-level drift (`truth_source_symbols`) — v4 line-range approach on `truth_sources` subsumes the motivation.

## Related artifacts in this repo

- `.artifacts/gpt54-audit.md` — v1 audit (schema/lint bugs)
- `.artifacts/gemini-audit.md` — Gemini 3.1 Pro audit (additional semantics gaps)
- `.artifacts/gpt54-audit-v2.md` — doctrine-grounded audit (canon fork, process gaps)
- `.artifacts/audit-brief.md` — the brief used for all three external audits
