# Skill System SYSTEM-Side Handoff for Opus 4.7

Date: 2026-05-28

Authoring context: Codex worked from `/Users/jacobbalslev/Development` and treated this as Skill Graph SYSTEM work. The task explicitly excluded individual skill/content work.

## Executive Summary

The Skill Graph SYSTEM side has been aligned around the v8 contract: `scope` is required, `subject` is required, `deployment_target` is required, and prior v7 contract shapes now belong in git history instead of the live schema. The protocol docs, schema checks, lint messaging, fixture skills, manifest schema, generated field reference, marketplace export rules, and targeted verification scripts were updated to match that contract.

The SYSTEM surface is now internally coherent in the places touched. System-focused gates pass. Full `npm run verify` is still red because it intentionally runs corpus/content gates against `/Users/jacobbalslev/Development/skills/skills/**/SKILL.md`, and that canonical skill corpus is not fully migrated to required v8 fields. That red state should not be fixed by ad-hoc edits in a SYSTEM commit. It must be drained through the Skill Audit Loop CONTENT path, or the project needs an explicit SYSTEM-only verification command so SYSTEM work can go green while CONTENT work is paused.

The user's follow-up decision is binding: `scope` should be required. Do not relax that requirement to make verification pass.

## Mode Boundary

This handoff is for SYSTEM work: protocol, schemas, docs, scripts, generated reports, examples, export rules, and verification commands.

Do not include individual skill edits under `/Users/jacobbalslev/Development/skills/skills/**/SKILL.md` in this SYSTEM work unless the user explicitly changes the mode. CONTENT work flows through `/audit:audit`, `/audit:improve`, `/audit:evaluate`, or `/audit:evolve`, one skill at a time.

Important observed boundary risk: the sibling `/Users/jacobbalslev/Development/skills` repo is dirty and includes individual `SKILL.md` changes. Treat those as CONTENT-side or pre-existing state until proven otherwise. Do not commit them together with the Skill Graph SYSTEM-side changes.

## Current Contract

The live Skill Metadata Protocol contract is v8 only.

Required per-skill frontmatter fields:

- `schema_version`
- `name`
- `description`
- `subject`
- `deployment_target`
- `scope`

`scope` is required and free-text. It is not an enum. It describes the deployment scope and target environment in a PRD-style sentence.

`subject` is the closed browse shelf enum:

- `code-engineering`
- `quality-assurance`
- `frontend-ui`
- `design-craft`
- `agent-ops`
- `product-domain`
- `knowledge-organization`
- `meta-methods`
- `data-analytics`

`deployment_target` is the closed deployment enum:

- `portable`
- `project`

Prior v7 values and prior schema shapes should be consulted through git history, not kept as parallel live contract shapes.

## Mission, Vision, and Goal Alignment

The SYSTEM-side direction now matches the project's stated model:

- The Skill Metadata Protocol is the binding per-skill contract.
- The Skill Graph is the compiled and routed library-level projection.
- The Skill Audit Loop is the maintenance discipline that upgrades individual skills through evidence, not label changes.
- Version labels are earned. The schema now rejects v7 live conformance claims instead of accepting stale contract shapes.
- The marketplace export surface excludes project-specific skills rather than publishing internal or repo-coupled skills.

Remaining alignment issue for user evaluation:

The goal "all scripts work end to end" conflicts with "do not do individual skill work" while the full `verify` script includes corpus lint and manifest validation. Either CONTENT migration must resume through `/audit:*`, or the SYSTEM side needs a dedicated verification command that excludes CONTENT gates. Do not solve this by making `scope` optional.

## SYSTEM Work Completed

The following areas were updated.

Schemas:

- `schemas/SKILL_METADATA_PROTOCOL_schema.json` now treats v8 as the only live schema version and requires `scope`.
- `schemas/manifest.schema.json` now requires `scope` on per-skill manifest entries and rejects v7 skill entries.

Script and lint behavior:

- `scripts/check-schema-constants.js` checks the v8-only contract, required `subject`, required `deployment_target`, required `scope`, free-text `scope`, and Health Block constants.
- `scripts/skill-lint.js` reports missing `scope` as a v8 classification error.
- `scripts/__tests__/test-v8-schema-compat.js` verifies required `scope` and v7 rejection.
- `scripts/__tests__/test-structural-verdict-export-block.js` uses a v8-conformant fixture.
- `scripts/generate-manifest.js` comments were updated to v8 terminology while preserving the manifest root schema version.
- `scripts/lib/audit-prompt-builder.js` relation-shape commentary was corrected.
- `scripts/export-marketplace-skills.js` excludes `deployment_target: project`, legacy internal scope values, and internal grounding modes from the marketplace export.

Docs and generated docs:

- Root Skill System guidance was updated in `/Users/jacobbalslev/Development/AGENTS.md` and `/Users/jacobbalslev/Development/SKILL-SYSTEM-CHEAT-SHEET.md`.
- Skill Graph docs were updated to make v8 and required `scope` clear.
- Generated field/status docs were regenerated.
- Marketplace and publishing docs now describe the current export boundary.

Fixtures and examples:

- Fixture skills now include required `scope`.
- Relation fixtures now use schema-valid relation shapes.
- `examples/skills.manifest.sample.json` was regenerated to v8 entries with `scope`.

Marketplace:

- Marketplace export was regenerated.
- Public export count is now 153 skills because `graph-audit` and `skill-router` are excluded as project/repo-specific skills.

Package script:

- `lint:template` now checks only `examples/skill-metadata-template.md`; the old `--include-template` behavior also linted the corpus, which made template verification fail for CONTENT reasons.

## Full Skill Graph File List Touched

- `AGENTS.md`
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `README.md`
- `SKILL_AUDIT_LOOP.md`
- `SKILL_GRAPH.md`
- `SKILL_METADATA_PROTOCOL.md`
- `docs/AUTHORING-QUICKSTART.md`
- `docs/CONFORMANCE.md`
- `docs/QUICKSTART-30MIN.md`
- `docs/SKILL_METADATA_PROTOCOL_PRIMER.md`
- `docs/SKILL_METADATA_PROTOCOL_field-decision-guide.md`
- `docs/SKILL_METADATA_PROTOCOL_field-reference.generated.md`
- `docs/SKILL_METADATA_PROTOCOL_field-reference.md`
- `docs/concept-map.md`
- `docs/field-rationale.md`
- `docs/integrations/github-actions.md`
- `docs/manifest-field-mapping.md`
- `docs/marketplace-syndication.md`
- `docs/plans/scripts-roadmap.md`
- `docs/publish-workflow.md`
- `docs/quality-doctrine.md`
- `docs/research/skill-graph-mission-vision-rules-goals-2026-05-28.md`
- `docs/research/skill-system-system-side-handoff-opus-2026-05-28.md`
- `docs/skill-metadata-protocol.md`
- `docs/status.generated.md`
- `examples/fixture-skills/README.md`
- `examples/fixture-skills/comprehension-full/SKILL.md`
- `examples/fixture-skills/minimal-capability/SKILL.md`
- `examples/fixture-skills/with-grounding/SKILL.md`
- `examples/fixture-skills/with-relations/SKILL.md`
- `examples/skills.manifest.sample.json`
- `marketplace/skills/debugging/SKILL.md`
- `marketplace/skills/lint-overlay/SKILL.md`
- `marketplace/skills/refactor/SKILL.md`
- `marketplace/skills/task-path-optimization/SKILL.md`
- `marketplace/skills/testing-strategy/SKILL.md`
- `package.json`
- `schemas/SKILL_METADATA_PROTOCOL_schema.json`
- `schemas/manifest.schema.json`
- `scripts/__tests__/test-structural-verdict-export-block.js`
- `scripts/__tests__/test-v8-schema-compat.js`
- `scripts/check-schema-constants.js`
- `scripts/export-marketplace-skills.js`
- `scripts/generate-manifest.js`
- `scripts/lib/audit-prompt-builder.js`
- `scripts/skill-lint.js`

Root workspace files also touched:

- `/Users/jacobbalslev/Development/AGENTS.md`
- `/Users/jacobbalslev/Development/SKILL-SYSTEM-CHEAT-SHEET.md`

## Verification Results

Passed:

- `node scripts/check-schema-constants.js` - 17/17 checks passed.
- `node scripts/check-protocol-consistency.js` - passed.
- `node scripts/check-markdown-links.js` - passed; 763 files checked.
- `git diff --check` - passed.
- `node scripts/skill-lint.js --path examples/fixture-skills --no-color` - 0 errors, 4 warnings about field-purpose comments.
- `node scripts/skill-lint.js examples/skill-metadata-template.md --no-color` - 0 errors, 1 warning about field-purpose comments.
- `npm run lint:template` - 0 errors, 1 warning.
- `npm run marketplace:verify` - 153 exports passed.
- `npm run status:check` - passed.
- `npm run docs:drift` - passed; 55 active docs scanned against schema v8.
- `npm run mirror:freeze` - passed; 20 files scanned across 2 mirrors.
- `npm run charter:parity` - exit 0 with one warning for an archived mirror.
- `npm run stability:check` - exit 0 with 3 warnings.
- `npm run export:verify-skill-md` - 155 exports passed.
- `npm run overlap` - exit 0 with 31 shared-keyword warnings.
- `npm run test:unit` - passed.
- `npm run test:migrate` - exit 0; legacy migration CLIs skipped because not present.

Failed or still red:

- `npm run verify` - fails at `npm run lint` because the canonical skill corpus is not fully v8-conformant.
- `node bin/skill-graph.js doctor` - fails on lint and manifest for the same corpus/content reason.
- `npm run audit-manifest:check` - fails because some per-skill audit verdicts claim graded comprehension without the corresponding eval artifact.

Large warning set not fully captured in this handoff:

- `node scripts/check-doc-drift.js --include-warn` exited 0 with 359 warnings, described during the run as mostly historical/version-token warnings. This was not a failing gate. If Opus needs to act on those warnings, rerun the command and triage all rows; do not treat this report as a complete line-by-line inventory for that command.

## All Known Warnings and Failures Captured in This Session

`npm run charter:parity` warning:

- `skill-audit-loop/AGENTS.md` is an archived mirror and diverges from canonical. The command says this is expected for frozen mirrors and warning-only.

`npm run stability:check` warnings:

- `../skills/skills/meta-methods/blue-ocean-strategy/SKILL.md`: stable criterion 1 failed because `eval_state` is `unverified`.
- `../skills/skills/meta-methods/blue-ocean-strategy/SKILL.md`: stable criterion 2 failed because `eval_score` is undefined and expected `>= 4`.
- `../skills/skills/meta-methods/blue-ocean-strategy/SKILL.md`: stable criterion 3 failed because `routing_eval` is `absent` and expected `present`.

`npm run overlap` shared-keyword warnings:

- `audit my skills` in `skill-infrastructure`, `graph-audit`
- `authentication` in `owasp-security`, `security-fundamentals`
- `authorization` in `owasp-security`, `security-fundamentals`
- `compound components` in `component-architecture`, `design-module-composition`
- `conceptual model` in `conceptual-modeling`, `mental-models`
- `context window` in `context-engineering`, `compression`
- `Core Web Vitals` in `performance-budgets`, `performance-engineering`, `best-practice`
- `entity relationship` in `data-modeling`, `entity-relationship-modeling`
- `error boundary with Suspense` in `error-boundary`, `suspense-patterns`
- `foreign key` in `data-modeling`, `entity-relationship-modeling`
- `idempotency` in `merge-queue`, `api-design`
- `JSON Schema` in `generative-ui`, `tool-call-flow`
- `mockist` in `test-doubles-design`, `test-driven-development`
- `NextRequest NextResponse` in `middleware-patterns`, `route-handler-design`
- `normalization` in `data-modeling-fundamentals`, `data-modeling`, `entity-relationship-modeling`
- `OWASP` in `best-practice`, `owasp-security`
- `parallel tool calls` in `tool-call-flow`, `tool-call-strategy`
- `performance budget` in `performance-budgets`, `performance-engineering`
- `primary key` in `data-modeling`, `entity-relationship-modeling`
- `prompt injection` in `prompt-craft`, `prompt-injection-defense`
- `React Server Components` in `client-server-boundary`, `rendering-models`, `server-components-design`
- `RSC` in `rendering-models`, `server-components-design`
- `schema design` in `data-modeling`, `entity-relationship-modeling`
- `semantic naming` in `linguistics`, `semantics`
- `server actions` in `client-server-boundary`, `server-actions-design`
- `server-sent events` in `streaming-architecture`, `real-time-updates`
- `SSE` in `streaming-architecture`, `real-time-updates`
- `structured output` in `generative-ui`, `prompt-craft`
- `task decomposition` in `task-path-optimization`, `spec-driven-development`
- `WebSocket` in `streaming-architecture`, `real-time-updates`
- `zero-downtime migration` in `database-migration`, `schema-evolution`

The overlap script explicitly says shared keywords are recall signals, not duplicate errors. The expected action is to add or confirm relation edges when needed, not delete keywords to shrink the count.

`npm run audit-manifest:check` failures:

- `agent-infrastructure/2026-05-23T2040--audit--codex--44c5b5`: `comprehension=PROVISIONAL`, missing `skills/agent-infrastructure/evals/comprehension.json`
- `backend/2026-05-23T1704--audit--codex--bdd034`: `comprehension=PROVISIONAL`, missing `skills/backend/evals/comprehension.json`
- `chrome-devtools-mcp/2026-05-23T2045--audit--codex--e95079`: `comprehension=PROVISIONAL`, missing `skills/chrome-devtools-mcp/evals/comprehension.json`
- `credential-encryption/2026-05-23T1654--audit--codex--ba321c`: `comprehension=PROVISIONAL`, missing `skills/credential-encryption/evals/comprehension.json`
- `docs-development/2026-05-23T2053--audit--codex--a04166`: `comprehension=PROVISIONAL`, missing `skills/docs-development/evals/comprehension.json`
- `ecosystem-modeling/2026-05-25T0711--audit--codex--d84f5c`: `comprehension=PROVISIONAL`, missing `skills/ecosystem-modeling/evals/comprehension.json`
- `growth-metrics-frameworks/2026-05-23T1928--audit--codex--dbdc84`: `comprehension=PROVISIONAL`, missing `skills/growth-metrics-frameworks/evals/comprehension.json`
- `human-in-the-loop/2026-05-23T1443--audit--gpt55--fa518c`: `comprehension=PROVISIONAL`, missing `skills/human-in-the-loop/evals/comprehension.json`
- `knowledge-graph/2026-05-24T2026--audit--codex--17de27`: `comprehension=PROVISIONAL`, missing `skills/knowledge-graph/evals/comprehension.json`
- `mcp-builder/2026-05-23T1710--audit--codex--6b1b39`: `comprehension=PROVISIONAL`, missing `skills/mcp-builder/evals/comprehension.json`
- `skill-graph-glossary/2026-05-23T1717--audit--codex--c5eeaf`: `comprehension=PROVISIONAL`, missing `skills/skill-graph-glossary/evals/comprehension.json`
- `task-lifecycle/2026-05-23T2033--audit--codex--c8b2e0`: `comprehension=PROVISIONAL`, missing `skills/task-lifecycle/evals/comprehension.json`
- `task-lifecycle/2026-05-23T1723--audit--codex--493d87`: `comprehension=PROVISIONAL`, missing `skills/task-lifecycle/evals/comprehension.json`
- `token-cost-estimation/2026-05-23T1919--audit--codex--11f35d`: `comprehension=PROVISIONAL`, missing `skills/token-cost-estimation/evals/comprehension.json`

## Dirty Worktree Notes

Skill Graph repo dirty state after the SYSTEM pass:

- 46 modified tracked files in `/Users/jacobbalslev/Development/skill-graph`.
- No staging or commit was performed.

Root `/Users/jacobbalslev/Development` dirty state includes many unrelated changes, including `.claude`, `.opencode`, research logs, generated graph files, root `skills.manifest.json`, and deleted root `scripts/skill/*` files. Those were not part of this SYSTEM pass and should not be swept into the Skill Graph commit without a separate review.

Sibling `/Users/jacobbalslev/Development/skills` dirty state observed:

- Deleted root scaffold files:
  - `skill-graph-ontology/SKILL.md`
  - `skill-graph-semantics/SKILL.md`
  - `skill-graph-taxonomy/SKILL.md`
- Modified individual skills:
  - `skills/agent-ops/task-path-optimization/SKILL.md`
  - `skills/code-engineering/debugging/SKILL.md`
  - `skills/code-engineering/refactor/SKILL.md`
  - `skills/quality-assurance/graph-audit/SKILL.md`
  - `skills/quality-assurance/lint-overlay/SKILL.md`
  - `skills/quality-assurance/testing-strategy/SKILL.md`

Those sibling skill repo changes are CONTENT-side or at least content-adjacent. Keep them out of a SYSTEM commit unless the user explicitly authorizes mode mixing.

## Recommended Next Steps for Opus 4.7

1. Start from `/Users/jacobbalslev/Development`, read `CLAUDE.md`, `AGENTS.md`, `SKILL-SYSTEM-CHEAT-SHEET.md`, and `skill-graph/AGENTS.md`.
2. Confirm the work mode remains SYSTEM before editing.
3. Review `git status --short --untracked-files=no` in:
   - `/Users/jacobbalslev/Development`
   - `/Users/jacobbalslev/Development/skill-graph`
   - `/Users/jacobbalslev/Development/skills`
4. Preserve `scope` as required. Do not relax schema or manifest schema.
5. Decide with the user whether SYSTEM work should add a dedicated SYSTEM-only verification command. A reasonable command would run schema constants, protocol consistency, docs links, docs drift, mirror freeze, charter parity, template lint, fixture lint, marketplace verification, status check, overlap, and unit tests, while excluding corpus lint and manifest validation until CONTENT migration resumes.
6. If the user wants full `npm run verify` green, switch explicitly to CONTENT mode and drain the corpus through `/audit:*`. Add `scope` and v8 conformance one skill at a time with Audit Status evidence.
7. Re-run `npm run audit-manifest:check` before acting on audit artifact failures. The failures are per-skill audit artifacts, so they should be CONTENT-mode unless the checker itself is wrong.
8. Before any commit, isolate only the SYSTEM files from `/Users/jacobbalslev/Development/skill-graph` and the two root docs. Do not stage sibling `/Users/jacobbalslev/Development/skills/skills/**/SKILL.md` files in the same commit.

## Ready-to-Use Prompt for Opus 4.7

Use this prompt if handing the work to Opus:

```text
You are continuing Skill Graph SYSTEM-side work from /Users/jacobbalslev/Development.

Read CLAUDE.md, AGENTS.md, SKILL-SYSTEM-CHEAT-SHEET.md, skill-graph/AGENTS.md, skill-graph/SKILL_METADATA_PROTOCOL.md, skill-graph/SKILL_GRAPH.md, and skill-graph/SKILL_AUDIT_LOOP.md.

Mode is SYSTEM. Do not edit individual skills under /Users/jacobbalslev/Development/skills/skills/**/SKILL.md. CONTENT work only happens through /audit:*.

The user has explicitly decided that scope is required. Preserve that. Do not make scope optional to get tests green.

Review docs/research/skill-system-system-side-handoff-opus-2026-05-28.md, then inspect the current diff and verification state. The SYSTEM contract has been aligned to v8; system-focused gates pass. Full npm run verify is still red because corpus/content skills are not fully v8-conformant and audit manifests have missing per-skill eval artifacts.

Your job is to finish or review the SYSTEM side without crossing into CONTENT. If full project verify must go green, ask the user whether to switch to CONTENT mode for one-skill-at-a-time audit-loop migration, or whether to add a SYSTEM-only verify command that excludes corpus gates until CONTENT migration resumes.
```
