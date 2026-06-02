# Quality Doctrine

> **Applied to the audit loop:** [`docs/audit-loop-enrich-philosophy.md`](audit-loop-enrich-philosophy.md) is this doctrine's enforcement on the Skill Audit Loop — *improve = enrich, never strip to a delta; the eval is a guardrail, not the optimizer.*

> **Audience.** Agents and maintainers changing Skill Graph docs, skills, schemas, exports, marketplace positioning, or repository instructions.
>
> **Status.** Governance reference. Keep aligned with `AGENTS.MD`.
>
> **Last updated.** 2026-05-13.

Quality in this repository means an artifact becomes more correct, complete, understandable, verifiable, and maintainable. It does not mean shorter by default. Brevity can be useful, but only when it preserves meaning, names, boundaries, examples, evidence, and full coverage.

The governing rule:

> Improve by enriching quality dimensions and organizing scale. Do not improve by trimming meaning away.

This doctrine applies to `AGENTS.MD`, `README.md`, protocol docs, marketplace copy, generated exports, skill bodies, metadata keys, examples, evals, and audit outputs.

## Loaded Skill Basis

This doctrine is synthesized from the relevant local skill guidance loaded for this work:

- `skills/semantics/SKILL.md` - names must encode meaning; abbreviations create ambiguity.
- `skills/information-architecture/SKILL.md` - findability comes from structure, labels, hierarchy, and wayfinding.
- `skills/context-engineering/SKILL.md` - context quality depends on right information, not blindly smaller information.
- `skills/intent-recognition/SKILL.md` - actions and claims need explicit classification and verification.
- `skills/skill-scaffold/SKILL.md` - skill quality depends on routing contract, boundaries, sections, eval truth, and portability.
- Broader local quality skills: `quality-doctrine`, `no-cutting-corners`, `compression`, and `token-efficiency`.

The common thread is consistent: organize, verify, and clarify. Do not hide, shorten, or delete value to appear efficient.

## What Quality Means

| Dimension | Quality looks like | Poor substitute |
|---|---|---|
| Completeness | All intended skills, findings, examples, docs, evals, and tool surfaces are preserved and visible. | A curated subset presented as if it were the whole. |
| Semantics | Names and labels are readable, searchable, and self-explanatory. | Opaque abbreviations, vague aliases, generic names, or compressed keys. |
| Organization | Large surfaces have indexes, categories, routing groups, manifests, generated views, and clear entry points. | Deleting sections because the surface feels large. |
| Verification | Claims are backed by commands, checks, links, or source evidence. | "Should work", "probably", or unverified confidence. |
| Portability | Export-specific constraints are handled in generated artifacts while preserving the canonical source. | Weakening the source artifact to satisfy a registry limit. |
| Cold-start usefulness | A future agent can read the artifact and act correctly without tribal knowledge. | Context that assumes the original conversation is still available. |

## Scope Preservation

Do not reduce project breadth to save space, launch effort, review burden, or context. Preserve the full intended library and use structure to make it navigable.

| Pressure | Wrong response | Quality response |
|---|---|---|
| "There are many skills." | Publish only a few. | Publish/export all eligible skills; feature examples only as entry points. |
| "This doc is getting long." | Delete sections. | Add an index, table, anchors, or split detailed reference into a linked doc. |
| "The agent may not need all findings." | Show only key findings. | Show all findings, then separately recommend priority. |
| "A marketplace needs short copy." | Replace canonical descriptions with thin summaries. | Generate marketplace-specific copy and link to the full source. |
| "Metadata keys are long." | Rename to `sg_*`, `src`, or `canon`. | Use explicit keys such as `skill_graph_source_repo`. |

Prioritization is ordering, not deletion. A demo is a front door, not a cap.

## Readable Names

Names are part of the system's interface. They must carry meaning without requiring the reader to reverse-engineer an abbreviation.

Rules:

- Use full project and protocol names in identifiers when space allows.
- Use domain language over implementation shorthand.
- Avoid abbreviations except universal terms such as `id`, `url`, `api`, and established SPDX or protocol names.
- Prefer `skill_graph_protocol` over `sg_protocol`.
- Prefer `skill_graph_canonical_skill` over `canon`.
- Prefer `truth_source_hashes` over `hashes` when the hash target matters.
- Do not compress a readable name unless a binding external schema or explicit user request requires it.

If an external limit forces a shorter name, document the limit near the mapping and keep the canonical source explicit.

## Compression Rules

Compression is valid when it increases information density without losing meaning. It is invalid when it removes quality dimensions.

A valid compression preserves:

- Intent: what the artifact is for.
- Outcome: what decision or action it supports.
- Constraints: boundaries, exceptions, limits, and negative cases.
- Names: readable identifiers and canonical terms.
- Evidence paths: file paths, links, commands, checks, or receipts.
- Coverage: the complete set of findings, skills, examples, or requirements.

Invalid compression:

- Removes examples because "the model knows this".
- Collapses distinct concerns into a vague bucket.
- Replaces descriptive identifiers with short aliases.
- Hides low-priority findings instead of preserving them with priority labels.
- Weakens titles or descriptions until routing quality suffers.
- Deletes edge cases, negative examples, or boundary explanations.

When content is too large for always-on context, use progressive disclosure: keep the rule, index, or routing contract in the always-on file, and move dense details to a linked reference.

## External Limits

External systems may impose real limits: description length, field shape, allowed key names, package layout, or registry validation. Treat those as export constraints, not as reasons to degrade the canonical source.

Process:

1. Identify the exact external constraint.
2. Preserve the full Skill Metadata Protocol source.
3. Generate an export-specific adaptation.
4. Store provenance that points back to the canonical source.
5. Verify the generated artifact against the external constraint.
6. Document any lossy projection.

Example: if a plain `SKILL.md` marketplace caps `description`, generate a shorter export description while preserving the richer Skill Metadata Protocol routing contract in `skills/<name>/SKILL.md`.

## Version Labels Are Earned, Not Bumped

A version number asserts substantive conformance, not just a schema shape. Advancing `schema_version`, `skill_graph_protocol`, or any `vN` label is honest only after the content migration that version represents is actually done — v6 added the five flat Understanding fields + `comprehension_state`; v7 added the four-verdict Audit Status. A codemod can bump `schema_version` (mechanical shape) corpus-wide, but it cannot author that content.

- A label mismatch (e.g. `schema_version: 8` with `skill_graph_protocol: v5`) is **honest record-keeping**, not drift: the schema bump ran, the content migration did not. Resolve it by doing the migration, then advancing the label — never by editing the label alone.
- A bulk `sed`/find-replace of `vN` → `vM` with no content change is **prohibited**. A backlog of skills on an older content label is migration work to schedule, not a string to replace.
- Bumping a label without the work is fake-conformance — the same defect class as `eval_state: passing` without an `eval_last_run` receipt, or `application_verdict: APPLICABLE` without a gate-9 eval. The binding statement of this rule lives in `AGENTS.md § Version Labels Are Earned, Not Bumped`.

## Verification

Do not claim quality without evidence. Before saying a change is complete, run the smallest meaningful check that proves the claim.

| Claim | Evidence |
|---|---|
| Markdown links work. | `node scripts/check-markdown-links.js` |
| Skill metadata is valid. | `node scripts/skill-lint.js <skill-or-root>` |
| The shipped template is valid. | `node scripts/skill-lint.js examples/skill-metadata-template.md` |
| Protocol docs and schemas agree. | `node scripts/check-protocol-consistency.js` |
| Manifest generation still works. | `node scripts/generate-manifest.js --include-template --validate-only` |
| Routing examples still hold. | `node scripts/skill-graph-routing-eval.js --manifest examples/skills.manifest.sample.json --only-asserted` |
| Exports are plain `SKILL.md` compatible. | `node scripts/verify-skill-md-export.js` |
| Skill ownership does not create obvious ambiguity. | `node scripts/skill-overlap.js` |

If a check is relevant and not run, say that it was not run. Do not imply success from intent.

### Reading `skill-overlap.js` output — shared keywords are recall, not defects

Keyword overlap between related skills is **expected and desirable**. It is the recall substrate of the graph: a query about "foreign key" *should* reach both `data-modeling` and `entity-relationship-modeling`, and the router disambiguates by score plus the typed relation edges (`relations.boundary` / `related` / `verify_with`) between them. The overlap report prints shared keywords as **INFO**, not warnings, because shared vocabulary is normal graph density.

A reported shared keyword requires no action by itself. If real routing ambiguity appears, confirm the co-activating skills declare an explicit relation edge. It is **not** a defect count to drive to zero.

- **Correct response:** add or verify a `relations.boundary` ("use that skill instead, because…") or `relations.related` edge between the listed skills, or accept it as legitimate shared vocabulary.
- **Forbidden response:** deleting a keyword from one skill to shrink the count. That strips routing recall and makes the product worse. Only change a keyword when it is genuinely *mis-assigned* to a skill, never to satisfy the report. Duplicate `triggers` are the only hard error here; shared `keywords` and `paths` are review signals.

## Improvement Checklist

Before handing off any change that claims to improve quality:

- [ ] Full intended scope is preserved.
- [ ] Any prioritization is explicitly ordering, not removal.
- [ ] Names and metadata keys are readable and self-explanatory.
- [ ] Long content is organized with indexes, references, or generated views instead of trimmed.
- [ ] External limits are handled in generated/export-specific artifacts.
- [ ] Examples, anti-examples, boundaries, and edge cases are preserved or improved.
- [ ] Claims of validity are backed by verification commands.
- [ ] The canonical source remains richer than any syndication/export copy.
- [ ] Version labels (`schema_version` / `skill_graph_protocol` / any `vN`) were advanced only alongside the matching content migration — never bumped alone.
