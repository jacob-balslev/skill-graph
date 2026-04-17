# Contributing to Skill Graph

Skill Graph is a metadata contract and example pack for graph-aware AI skills. Contributions are welcome — the target audience is anyone extending, auditing, or adopting the contract for their own skill library.

Start with `README.md`, `docs/metadata-contract.md`, and `docs/field-reference.md` before opening a pull request.

## What you can contribute

**Welcome:**

- Fixes to broken cross-references, stale examples, or drift between the schemas and `docs/metadata-contract.md`
- Additional starter skills that demonstrate contract features the current five do not already cover (see `README.md § Starter skill pack` for what each existing starter demonstrates)
- Worked example artifacts under `examples/audits/` against a starter skill
- Improvements to `scripts/skill-lint.js` — additional rules, better error messages, stricter Agent Skills compatibility mode
- Documentation improvements that make the contract easier to read for an outsider who has never seen the repo before
- Bug reports with a minimal reproducing `SKILL.md` snippet

**Out of scope:**

- Proprietary skill content tied to a specific company, product, or runtime
- Prompt-library entries or agent-framework wrappers — Skill Graph is a metadata contract, not a prompt repository
- Changes that add a full runtime implementation — the roadmap is intentionally narrow (see `docs/plans/scripts-roadmap.md`)
- Breaking schema changes without a bumped `schema_version` and a migration note

## Authoring a new skill

1. **Start from the template.** Copy `examples/skill-template.md` to `skills/<your-skill-name>/SKILL.md`. The template is self-referential — its body teaches you what each section should contain. Read its blockquote notes before editing.
2. **Rewrite the identity.** Change `name:` to your skill's identifier (lowercase, hyphens, matches the parent directory). Rewrite `description:` as a routing contract: ≤ 3 sentences, pushy trigger phrases, explicit negative boundary. Rewrite every other field to match your subject.
3. **Pick an archetype and follow its section map.** `docs/metadata-contract.md § Archetype section map` lists the required H2 sections per archetype (`capability`, `workflow`, `router`, `overlay`). Do not remove required sections. Additional sections are allowed when they earn their line count — for example, `## Key Files` for skills that reference concrete repo files, or `## References` for skills that point at external reading. For field-level guidance, see `docs/field-reference.md`.
4. **Strip the teaching layer.** Remove every `> **TEMPLATE NOTE:**` blockquote and every `# TEMPLATE NOTE:` YAML comment before committing. They are authoring scaffolding, not skill content.
5. **Choose `scope` honestly.** Use `portable` for a skill with no repo-specific claims, `reference` for a documentation-style skill grounded in contract documents, `codebase` for a skill grounded in a specific codebase. `scope: codebase` requires a populated `grounding` block — this is machine-enforced by the schema. For a decision table, see `docs/field-decision-guide.md § 1. Which scope do I use?`. (v1 values `generic` and `operational` were renamed to `portable` and `codebase` in schema_version 2 — SH-5784.)
6. **Point `relations.*` at real skills.** Every `adjacent`, `boundary`, `verify_with`, and `depends_on` target must be the `name` of another skill that exists in `skills/`. `scripts/skill-lint.js` will reject dangling targets.
7. **Match the 3 eval fields to reality.** `eval_artifacts: none | planned | present` (artifact state), `eval_state: unverified | passing | monitored` (runtime state), `routing_eval: absent | present` (routing coverage). The lint script verifies that `eval_artifacts: present` is backed by a real eval file under `examples/evals/`. See `docs/field-decision-guide.md § 3. What state do I choose for evals?` for the full decision table. (The single `eval_status` enum was split into these three orthogonal fields in schema_version 2 — SH-5784.)

## Before opening a pull request

Run the full validation pass:

```bash
# Lint every skill in the repo
node scripts/skill-lint.js --include-template

# Verify the sample manifest still passes structural integrity checks
# (schema_version correct, total_skills count matches the skills array)
node -e "
  const m = require('./examples/skills.manifest.sample.json');
  if (m.schema_version !== 1) { console.error('bad schema_version'); process.exit(1); }
  if (m.summary.total_skills !== m.skills.length) { console.error('total_skills mismatch'); process.exit(1); }
  console.log('manifest sample ok');
"
```

Both must exit 0. If the lint script reports an error, fix the underlying skill — do not silence the error or edit the lint output.

If you touched `docs/metadata-contract.md`, `docs/field-reference.md`, or `schemas/skill.schema.json`, also update the other sides so they remain in lockstep. The metadata contract is the overview; `docs/field-reference.md` is the per-field semantics authority; the schema is the source of truth for machine enforcement. Drift between them is a bug.

If you touched `scripts/skill-lint.js`, run it against every starter skill plus the template and confirm the expected pass count.

## Pull request expectations

- One logical change per pull request. A new starter skill is one PR; a contract revision is a separate PR.
- The PR description states what changed and why, references the relevant `docs/metadata-contract.md` sections, and includes the `node scripts/skill-lint.js` output.
- Commits use a short imperative title (≤ 70 chars) and, when needed, a body explaining the motivation rather than restating the diff.
- Tests, validation, and documentation updates land in the same commit as the code they describe. Do not defer doc updates to a follow-up PR.

## Audit workflow

When auditing an existing skill, follow `docs/skill-audit-loop.md` for the 12-step process and `docs/skill-audit-checklist.md` for the per-skill checklist. See `docs/skill-audit-loop.md § Recommended Artifact Layout` for the authoritative two-tier artifact root convention (`examples/audits/<skill-name>/` for shipped worked examples; `audits/<skill-name>/` for downstream consumer output). The `examples/audits/documentation/` directory is the canonical worked example.

## License

By contributing, you agree that your contributions are licensed under the MIT License (see `LICENSE`).
