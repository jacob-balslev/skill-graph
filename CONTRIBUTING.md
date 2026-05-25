# Contributing to Skill Graph

Skill Graph is a metadata contract and example pack for graph-aware AI skills. Contributions are welcome — the target audience is anyone extending, auditing, or adopting the contract for their own skill library.

Start with `README.md`, `SKILL_GRAPH.md`, `docs/skill-metadata-protocol.md`, and `docs/field-reference.md` before opening a pull request. `SKILL_GRAPH.md` explains the repo's five-tier organisation — every contribution should be classifiable into exactly one tier.

## What you can contribute

**Welcome:**

- Fixes to broken cross-references, stale examples, or drift between the schemas and the Tier 2 docs (`docs/skill-metadata-protocol.md`, `docs/field-reference.md`, `docs/manifest-field-mapping.md`)
- Additional starter skills that demonstrate contract features the current eight do not already cover (see `README.md § Quick tour → Tier 5` for what each existing starter demonstrates)
- Worked example artifacts under `examples/audits/` against a starter skill
- Improvements to `scripts/skill-lint.js` — additional rules, better error messages, clearer SKILL.md compatibility checks
- New Tier 4 reference consumers that demonstrate value the metadata enables (e.g., a coverage dashboard, a routing replay tool). See `scripts/skill-graph-route.js` and `scripts/skill-graph-drift.js` for what Tier 4 looks like today.
- Documentation improvements that make the contract easier to read for an outsider who has never seen the repo before
- Bug reports with a minimal reproducing `SKILL.md` snippet

**Out of scope:**

- Proprietary skill content tied to a specific company, product, or runtime
- Prompt-library entries or agent-framework wrappers — Skill Graph is a metadata contract, not a prompt repository
- Changes that add a full runtime implementation — the roadmap is intentionally narrow (see `docs/plans/scripts-roadmap.md`)
- Breaking schema changes without a bumped `schema_version` and a migration note

## Authoring a new skill

### 0. (Required for non-trivial additions) Write a spec and a plan first

For any new skill beyond a 10-line fix or a typo patch, follow the Spec-Driven-Development discipline: write a spec before the code, write a plan before the skill content.

1. **`spec.md`** — a short markdown file under `docs/plans/<skill-name>-spec.md` (or in a PR description) that answers: What decision or task does this skill support? What does it cover? What does it NOT cover (negative boundary)? Which existing skills does it border? What would prove it works (an eval idea)?
2. **`plan.md`** — a markdown file under `docs/plans/<skill-name>-plan.md` (or in the PR description) that lists the sections you will author, the `relations.*` targets you will declare, the `scope` you will use, and the eval artifacts you will ship. A plan is short — half a page at most.
3. **Wait for review on the plan** before writing the skill body. A 30-minute plan review saves 3 hours of rewriting a skill that went the wrong direction.

This step exists because authoring a skill without a plan is the most common cause of drift between a skill's description (routing contract) and its body (scope map). A plan forces the two layers apart before the skill content sets them in stone. See the doctrine at `skills/spec-driven-development/SKILL.md` in the parent repo if you're adopting Skill Graph into a monorepo.

### 1–7. Author the skill

1. **Start from the template.** Copy `examples/skill-metadata-template.md` to `skills/<your-skill-name>/SKILL.md`. The template is self-referential — its body teaches you what each section should contain. Read its blockquote notes before editing.
2. **Rewrite the identity.** Change `name:` to your skill's identifier (lowercase, hyphens, matches the parent directory). Rewrite `description:` as a routing contract: ≤ 3 sentences, pushy trigger phrases, explicit negative boundary. Rewrite every other field to match your subject.
3. **Pick an archetype and follow its section map.** `docs/skill-metadata-protocol.md § Archetype section map` lists the required H2 sections per archetype (`capability`, `workflow`, `router`, `overlay`). Do not remove required sections. Additional sections are allowed when they earn their line count — for example, `## Key Files` for skills that reference concrete repo files, or `## References` for skills that point at external reading. For field-level guidance, see `docs/field-reference.md`.
4. **Strip the teaching layer.** Remove every `> **TEMPLATE NOTE:**` blockquote and every `# TEMPLATE NOTE:` YAML comment before committing. They are authoring scaffolding, not skill content.
5. **Choose `scope` honestly.** Use `portable` for a skill with no repo-specific claims, `reference` for a documentation-style skill grounded in protocol documents, `codebase` for a skill grounded in a specific codebase. `scope: codebase` requires a populated `grounding` block — this is machine-enforced by the schema. For a decision table, see `docs/field-decision-guide.md § 1. Which scope do I use?`. (v1 values `generic` and `operational` were renamed to `portable` and `codebase` in schema_version 2 — SH-5784.)
6. **Point `relations.*` at real skills.** Every `adjacent`, `boundary`, `verify_with`, and `depends_on` target must be the `name` of another skill that exists in `skills/`. `scripts/skill-lint.js` will reject dangling targets.
7. **Match the 3 eval fields to reality.** `eval_artifacts: none | planned | present` (artifact state), `eval_state: unverified | passing | monitored` (runtime state), `routing_eval: absent | present` (routing coverage). The lint script verifies that `eval_artifacts: present` is backed by a real eval file under `examples/evals/`. See `docs/field-decision-guide.md § 3. What state do I choose for evals?` for the full decision table. (The single `eval_status` enum was split into these three orthogonal fields in schema_version 2 — SH-5784.)

## Before opening a pull request

Run the full validation pass:

```bash
# Lint every skill in the repo (11 checks per file)
node scripts/skill-lint.js --include-template

# Cross-artifact protocol consistency (7 checks)
node scripts/check-protocol-consistency.js

# Manifest validity (generator walks skills/, validates against manifest schema)
node scripts/generate-manifest.js --include-template --validate-only
```

All three must exit 0. If the lint script reports an error, fix the underlying file — do not silence the error or edit the lint output.

The lint output now prefixes each line with the source tier (see `SKILL_GRAPH.md`). Tier labels: `[T1↔T3]` for schema parity, `[T3↔T5]` for generator parity, `[T5 sample]` for the sample manifest, `[T5]` for skills and template. A failure at a particular tier tells you which file needs fixing first.

### Tier-specific coupling (fix matched tiers in the same commit)

| If you touched... | Also update... |
|---|---|
| `schemas/skill.schema.json` (Tier 1) | `docs/field-reference.md`, `docs/skill-metadata-protocol.md`, `docs/manifest-field-mapping.md` rename map, `examples/skill-metadata-template.md` if the change affects a required or strongly-recommended field. Per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md), pinned prior-version schemas are NOT mirrored on disk — prior versions live in git history. |
| `schemas/manifest.schema.json` (Tier 1) | `docs/manifest-field-mapping.md`, potentially `scripts/generate-manifest.js` projection logic. (No pinned `manifest.vN.schema.json` on disk per ADR-0014.) |
| `scripts/generate-manifest.js` (Tier 3) | Regenerate `examples/skills.manifest.sample.json` so generator parity passes |
| `scripts/skill-lint.js` (Tier 3) | Run against every starter + the template; update `examples/skills.manifest.sample.json` if the skill's `drift_check.truth_source_hashes` references the lint script |
| Any Tier 5 starter skill with `grounding.truth_sources` | Re-record baselines with `node scripts/skill-graph-drift.js --record --apply skills/<name>` and regenerate the sample manifest |

If you touched a Tier 2 doc (`docs/skill-metadata-protocol.md`, `docs/field-reference.md`, etc.), also update the other Tier 2 docs so they remain in lockstep. Skill Metadata Protocol is the overview; `docs/field-reference.md` is the per-field semantics authority; the schema is Tier 1 — source of truth for machine enforcement. Drift between them is a bug.

## Pull request expectations

- **One logical change per pull request.** A new starter skill is one PR; a contract revision is a separate PR.
- **Declare the tier** your change belongs to in the PR description. Pick exactly one from: `Tier 1 (schema)`, `Tier 2 (explanation)`, `Tier 3 (enforcement)`, `Tier 4 (consumer)`, `Tier 5 (specimen)`, or `Governance`. If you cannot pick exactly one, the PR probably needs splitting. See `SKILL_GRAPH.md` for the tier definitions.
- The PR description states what changed and why, references the relevant `docs/skill-metadata-protocol.md` or `docs/field-reference.md` sections, and includes the `node scripts/skill-lint.js` + `node scripts/check-protocol-consistency.js` output.
- Commits use a short imperative title (≤ 70 chars) and, when needed, a body explaining the motivation rather than restating the diff.
- Tests, validation, and documentation updates land in the same commit as the code they describe. Do not defer doc updates to a follow-up PR.

## Audit workflow

When auditing an existing skill, follow `SKILL_AUDIT_LOOP.md` for the 12-step process and `SKILL_AUDIT_LOOP.md` § Part 2 for the per-skill checklist. See `SKILL_AUDIT_LOOP.md § Recommended Artifact Layout` for the authoritative two-tier artifact root convention (`examples/audits/<skill-name>/` for shipped worked examples; `audits/<skill-name>/` for downstream consumer output). The `examples/audits/documentation/` directory is the canonical worked example.

To bootstrap an audit quickly, use the stub generator:

```bash
# Seed three artifact stubs from lint output (leaves qualitative judgment as TODOs)
node scripts/skill-audit.js <skill-name>

# Overwrite existing stubs (e.g. re-seed after updating a skill)
node scripts/skill-audit.js <skill-name> --force

# Write output to a custom root (for downstream consumer use)
node scripts/skill-audit.js <skill-name> --audit-root audits/
```

The command runs `scripts/skill-lint.js` under the hood, converts errors and
warnings into pre-populated `findings.md` entries (P1 for errors, P2 for
warnings), and leaves all qualitative dimensions as `TODO` placeholders.
Schema validity is auto-scored in `scorecard.md` from the lint result. A human
auditor must complete the TODO sections before the verdict is considered final.
See `SKILL_AUDIT_LOOP.md § Stub Generator` for the full reference.

## License

By contributing, you agree that your contributions are licensed under the MIT License (see `LICENSE`).
