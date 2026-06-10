# Skill Graph, Skill Metadata Protocol, and Skill Audit Loop Findings

Date: 2026-06-10T14:27:01+0200
Mode: SYSTEM
Scope: Skill Graph project documentation, Skill Metadata Protocol documentation and enforcement surfaces, Skill Audit Loop documentation and runner surfaces, deprecated mirrors, and cross-workspace routing notes that affect this project.

This report documents the result of reading the project instructions and applying the relevant skills against the Skill Graph Project, the Skill Metadata Protocol, and the Skill Audit Loop. No CONTENT-mode skill bodies, per-skill sidecars, or per-skill audit artifacts were edited.

## Instruction Sources Read

- Workspace `CLAUDE.md`
- Workspace `AGENTS.md`
- `SKILL-SYSTEM-CHEAT-SHEET.md`
- `skill-graph/CLAUDE.md`
- `skill-graph/AGENTS.md`
- `skill-graph/README.md`
- `skill-graph/SKILL_GRAPH.md`
- `skill-graph/skill-metadata-protocol/README.md`
- `skill-graph/skill-metadata-protocol/PRIMER.md`
- `skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`
- `skill-graph/skill-metadata-protocol/field-reference.md`
- `skill-graph/skill-metadata-protocol/field-decision-guide.md`
- `skill-graph/skill-metadata-protocol/design-rationale.md`
- `skill-graph/skill-metadata-protocol/field-reference.generated.md`
- `skill-graph/skill-audit-loop/README.md`
- `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md`
- `skill-graph/docs/verdict-semantics.md`
- `skill-graph/docs/quality-doctrine.md`
- `skill-graph/docs/manifest-field-mapping.md`
- `skill-graph/docs/status.generated.md`
- `skill-graph/docs/conformance.generated.md`
- Deprecated mirror files under `skill-metadata-protocol/`
- Deprecated mirror files under `skill-audit-loop/`

## Skills Applied

- `best-practice`: checked whether documented behavior matches operational reality.
- `doc-updater`: checked documentation ownership, drift, and where findings should be filed.
- `epistemic-grounding`: separated verified evidence from inferred impact.
- `semantic-relations`: checked relationship field meaning and inverse/exclusion semantics.
- `taxonomy-design`: checked v8 classification terms and retired taxonomy terms.
- `system-interface-contracts`: checked schema, generated docs, prompts, scripts, and docs as one contract surface.
- `skill-infrastructure`: checked graph-health and relation-target guarantees.
- `graph-audit`: checked graph-edge validation and drift between graph claims and tooling.
- `skill-router`: checked routing-facing relationship semantics.
- `skill-evolution`: checked whether system changes preserve audit-loop evolution discipline.
- `agent-eval-design`: checked evaluator and audit-loop grading surfaces for stale inputs.
- `guardrails`: checked instruction boundaries and failure modes in audit-loop prompts and docs.
- `prompt-craft`: checked prompt surfaces for dated model naming and ambiguous execution instructions.
- `prompt-injection-defense`: checked instruction/data boundary risks in audit-loop prompt surfaces.
- `context-graph`: checked co-routing and relation semantics used by routing context.
- `context-engineering`: checked whether the docs lead future agents to load the right context.
- `agent-engineering`: checked multi-agent audit-loop instructions and supervisor prompts.
- `autonomous-loop-patterns`: checked loop stop conditions, artifact updates, and self-correction surfaces.
- `state-machine-modeling`: checked audit verdict and promotion-state consistency.
- `type-safety`: checked generated schema/doc parity and validation surfaces.
- `testing-strategy`: checked verification coverage against claims.
- `test-coverage-strategy`: checked which claims have deterministic gates and which are only documented.
- `canonical-repo-structure`: checked canonical files versus deprecated mirrors.
- `version-control`: checked that only task-owned documentation should be staged and committed.
- `architecture-decision-records`: checked whether protocol changes and migration statements match current docs.
- `research-synthesis`: organized all findings without dropping low-severity items.

## Verification Results

- `npm run verify:system`: FAIL. The failure is in `protocol:check`, check C7. `skill-metadata-protocol/field-reference.generated.md` is out of step with the current schema description strings.
- `node scripts/build-field-reference.js --check`: FAIL with the same generated field-reference parity error.
- `npm run models:check`: FAIL. `prompts/skill-audit-loop-codex-panel-supervisor-v1.md:201` mentions `GPT-5.5`. That file was already modified before this report and was not edited here.
- `npm run docs:links`: PASS.
- `npm run docs:drift`: PASS.
- `npm run counts:check`: PASS.
- `npm run routing-config:check`: PASS.
- `npm run mirror:freeze`: PASS.
- `npm run charter:parity`: PASS with an expected warning that archived `skill-audit-loop/AGENTS.md` diverges from the canonical charter.
- `npm run stability:check`: PASS.
- `npm run lint:template`: PASS.
- `node scripts/skill-lint.js --path examples/fixture-skills`: PASS.
- `npm run application-evals:check`: PASS.
- `npm run overlap`: PASS.
- `npm run test:unit`: PASS.

Additional relation-target validation proof:

```json
{
  "relation": {
    "suppresses": ["definitely-missing-skill"]
  },
  "validation_error_count": 0,
  "validation_errors": []
}
```

That proof used the manifest generator and manifest schema validation in memory. It shows that a missing relation target is currently allowed through manifest generation and manifest schema validation.

## Findings

### Finding 01 - The protocol overstates relation-target enforcement

Evidence:

- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:590-592` says schema validation and manifest generation catch broken relation targets and that the manifest compiler refuses to emit non-existent relation targets.
- `scripts/generate-manifest.js:378-399` copies relation entries through without resolving whether targets exist.
- `scripts/skill-lint.js:563-656` checks some relation-shape and reason-text concerns, but missing targets are skipped when a target subject is unavailable.
- The in-memory proof above created `relations.suppresses: ["definitely-missing-skill"]` and received zero manifest-schema validation errors.

Impact:

Future agents and maintainers can believe dangling graph edges are already deterministically blocked when they are not. That is a graph-health risk because relation targets behave like foreign keys in the routing and audit context, but no current deterministic gate enforces that guarantee.

Concrete change:

Either implement deterministic relation-target validation in the manifest generator or lint tooling, or revise the protocol language so it says relation targets are expected and documented but not currently enforced.

Verification to close:

Add or update a test that fails when any relation target cannot be resolved, then rerun `npm run verify:system` and the relevant manifest/lint command.

### Finding 02 - The 30-minute quickstart teaches a broken dangling-target lint demo

Evidence:

- `docs/QUICKSTART-30MIN.md:15-16` says graph relations enforce `depends_on` targets and lint catches broken relations.
- `docs/QUICKSTART-30MIN.md:198-224` instructs readers to edit a relation to `missing-skill-id`, expects a lint failure, and says lint walks every relation predicate to verify target existence.
- The current tooling proof in Finding 01 shows that missing relation targets are not rejected by manifest schema validation.

Impact:

The quickstart gives new maintainers a false confidence check. A reader can follow the exercise and either fail to reproduce the documented behavior or assume their local environment is wrong.

Concrete change:

Update the exercise to test a currently enforced invariant, or add the missing relation-target validation and keep the exercise.

Verification to close:

Run the quickstart command sequence from a clean checkout and confirm the documented failure mode occurs exactly as written.

### Finding 03 - The design rationale repeats the missing-target enforcement claim

Evidence:

- `skill-metadata-protocol/design-rationale.md:42` says lint catches `relations.depends_on` that reference missing targets.
- The current manifest generator and lint code do not enforce target existence for all relation targets.

Impact:

The rationale document records an architectural guarantee that is not implemented. That makes it harder to decide whether the right fix is a code change, a documentation correction, or both.

Concrete change:

Revise the design rationale to distinguish the intended graph-health property from current enforcement, or implement the enforcement and cite the exact command that proves it.

Verification to close:

Run the same missing-target fixture through the documented lint command and include the failure output in the rationale or associated test.

### Finding 04 - `SKILL_GRAPH.md` says a fixture proves dangling-target rejection, but that proof is not current

Evidence:

- `SKILL_GRAPH.md:426` says `node bin/skill-graph.js lint examples/fixture-skills/with-relations` rejects dangling targets.
- The current package commands use scripts under `scripts/`, and the verified current tooling did not reject a missing relation target in manifest validation.

Impact:

The top-level graph reference points readers at an outdated proof path and overstates the current edge-integrity guarantee.

Concrete change:

Replace the fixture proof with a current command and expected output, or implement the missing rejection and update the command path.

Verification to close:

Run the exact command shown in `SKILL_GRAPH.md` or replace it with the exact current command that demonstrates the intended behavior.

### Finding 05 - The active README still presents `relations.boundary` as the relationship field instead of canonical `relations.suppresses`

Evidence:

- `skill-graph/README.md:121` lists `relations.boundary` in the protocol-field table and does not list `relations.suppresses`.
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:614-620` says `relations.suppresses` is canonical and `boundary` is a deprecated alias that new skills must not author.
- `skill-metadata-protocol/README.md:68-70` also says new skills should use `suppresses`, not legacy `boundary`.

Impact:

The first project README can steer future authors toward a deprecated relation name even though the canonical protocol has already moved to `relations.suppresses`.

Concrete change:

Update the README protocol-field table to list `relations.suppresses`, and mention `boundary` only as a deprecated alias if needed.

Verification to close:

Search active docs for `relations.boundary` and confirm each remaining occurrence is explicitly historical or alias-only.

### Finding 06 - `SKILL_GRAPH.md` active routing sections still use `boundary` as current authored terminology

Evidence:

- `SKILL_GRAPH.md:254` says the router uses `relations.boundary` as the anti-ownership exclusion edge.
- `SKILL_GRAPH.md:257` says to use `boundary` when unsure.
- `SKILL_GRAPH.md:298` names `relations.boundary.{skill, reason}`.
- `SKILL_GRAPH.md:345` has image alt text naming `relations.boundary[]`.
- `SKILL_GRAPH.md:347` calls out a `relations.boundary` gap.
- `SKILL_GRAPH.md:359` demonstrates `boundary[{skill, reason}]`.
- `SKILL_GRAPH.md:395` says a fixture exercises `boundary`.
- `SKILL_GRAPH.md:415-426` labels the exclusion edge as `boundary`.
- Current fixtures and templates use canonical `suppresses`, including `examples/fixture-skills/with-relations/SKILL.md:24-35` and `examples/skill-metadata-template.md:132-141`.

Impact:

The graph reference is internally inconsistent: examples and templates demonstrate canonical `suppresses`, while active explanatory text still teaches `boundary`.

Concrete change:

Revise the active routing sections to say `relations.suppresses` for the canonical exclusion edge, and reserve `boundary` for historical migration notes only.

Verification to close:

Run a search across active docs and confirm that canonical examples, router docs, and graph diagrams use the same field name.

### Finding 07 - The design rationale JSON-LD mapping omits canonical `relations.suppresses`

Evidence:

- `skill-metadata-protocol/design-rationale.md:48` lists relationship predicates and names `boundary`, not `suppresses`.
- `skill-metadata-protocol/design-rationale.md:324-331` maps `relations.boundary` and discusses boundary versus disjoint semantics.
- The canonical protocol now says `relations.suppresses` is the field authors should use.

Impact:

The rationale for the semantic model lags behind the current protocol field name. This weakens the semantic-relations guidance for graph consumers and future schema changes.

Concrete change:

Update the JSON-LD mapping and relationship discussion to map `relations.suppresses` as canonical and `boundary` as deprecated compatibility input.

Verification to close:

Run `npm run docs:drift` and any schema/protocol consistency checks after the wording change.

### Finding 08 - The skill-improvement loop still uses `boundary` as an Understanding field instead of `concept_boundary`

Evidence:

- `skill-audit-loop/SKILL_AUDIT_LOOP.md:332` lists `boundary` in `understanding_field` candidates.
- `lib/audit/run-skill-improvement-loop.js:122-134` defines `UNDERSTANDING_FIELDS` with `boundary`, not `concept_boundary`, and comments that these are v6 Understanding fields.
- `lib/audit/run-skill-improvement-loop.js:210-220` uses those fields in the hard-scope prompt block.
- Current surfaces use `concept_boundary`, including `scripts/skill-audit-preflight.js:61-67`, `lib/audit/evaluate-skill.js:231-244`, and `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:616`.

Impact:

Audit-loop improvement guidance can ask a model to operate on a stale field name. That risks repairs being written to the wrong conceptual slot or being described with retired terminology.

Concrete change:

Change the improvement-loop field list and runbook text from `boundary` to `concept_boundary`, unless compatibility handling requires both names with explicit migration wording.

Verification to close:

Run the relevant unit tests for `run-skill-improvement-loop.js`, then run `npm run test:unit`.

### Finding 09 - The audit-loop cadence still uses the retired `category` axis

Evidence:

- `skill-audit-loop/SKILL_AUDIT_LOOP.md:496` says the weekly cadence should sample the high-centrality set and every `category`.
- The v8 classification model uses `subject`, optional `subjects[]`, `taxonomy_domain`, `deployment_target`, and `scope`, not `category`.

Impact:

Audit planning instructions can cause maintainers to sample or report against a taxonomy axis that no longer belongs to the current protocol.

Concrete change:

Replace `category` with the current v8 axis or axes that the cadence should cover, most likely `subject` and centrality.

Verification to close:

Run docs drift checks and confirm no active audit-loop instructions require `category` as a protocol field.

### Finding 10 - The Skill Audit Loop runbook points to a missing flat Shopify skill path

Evidence:

- `skill-audit-loop/SKILL_AUDIT_LOOP.md:950` references `skills/shopify/SKILL.md` lines 92-106.
- No file exists at `skills/shopify/SKILL.md` under the current workspace skill tree.
- The current Shopify skill exists at `skills/skills/product-domain/shopify/SKILL.md`.

Impact:

The runbook sends readers to a path that does not exist in the current workspace layout. That is especially costly in audit-loop work because examples are used as teaching artifacts.

Concrete change:

Update the example path to the current nested path, or replace it with a resolver-neutral instruction that uses the skill index.

Verification to close:

Run a file-existence check for every example skill path in the runbook.

### Finding 11 - Deprecated Skill Metadata Protocol mirror pointers target missing canonical paths

Evidence:

- `skill-metadata-protocol/AGENTS.md:13-15` points to `../skill-graph/SKILL_METADATA_PROTOCOL.md`, `../skill-graph/docs/field-reference.md`, and `../skill-graph/docs/skill-metadata-protocol.md`.
- `skill-metadata-protocol/README.md:3,11-13` repeats those missing paths.
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md:3,11-13` repeats those missing paths.
- The current canonical paths are under `skill-graph/skill-metadata-protocol/`, including `SKILL_METADATA_PROTOCOL.md`, `field-reference.md`, and `design-rationale.md`.

Impact:

The deprecated mirror is supposed to redirect readers safely, but its redirect instructions can land them on missing files.

Concrete change:

Update the mirror pointer files to the current canonical paths under `skill-graph/skill-metadata-protocol/`.

Verification to close:

Run a link/path check that includes deprecated sibling mirrors, not only active docs inside `skill-graph/`.

### Finding 12 - Deprecated Skill Audit Loop mirror pointers target missing canonical paths and a removed checklist file

Evidence:

- `skill-audit-loop/README.md:58-61` and `skill-audit-loop/README.md:71-72` point readers at `skill-graph/SKILL_AUDIT_LOOP.md`, `skill-graph/SKILL_AUDIT_CHECKLIST.md`, `skill-graph/SKILL_METADATA_PROTOCOL.md`, and `skill-graph/docs/field-reference.md`.
- `skill-audit-loop/SKILL_AUDIT_LOOP.md:3`, `skill-audit-loop/SKILL_AUDIT_CHECKLIST.md:3`, and `skill-audit-loop/CONTRIBUTING.md:11-13` repeat missing canonical paths.
- The current canonical audit-loop path is `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md`.
- No current `skill-graph/SKILL_AUDIT_CHECKLIST.md` file exists; the canonical Skill Audit Loop README says the per-skill checklist lives inside `SKILL_AUDIT_LOOP.md` Part 2.

Impact:

The deprecated mirror gives readers broken redirection paths at the exact moment they are trying to leave the deprecated copy.

Concrete change:

Update mirror pointers to the current canonical audit-loop and protocol paths, and replace checklist references with the current section inside `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md`.

Verification to close:

Run a path-existence check across deprecated mirror pointer files.

### Finding 13 - `skill-audit-loop/USAGE.md` contains unrelated AI usage tracker content

Evidence:

- `skill-audit-loop/USAGE.md` is located inside the deprecated Skill Audit Loop mirror.
- Its heading and body describe an "AI Usage Tracker - May 2026" rather than Skill Audit Loop usage or deprecation routing.

Impact:

A reader browsing the deprecated Skill Audit Loop mirror can open a file named `USAGE.md` and receive unrelated usage-tracking content. That weakens the mirror's ability to redirect safely.

Concrete change:

Replace the file with a deprecation pointer, move it to the owning usage-tracking location, or delete it if no longer needed.

Verification to close:

Run `rg -n "AI Usage Tracker|Usage Tracker" skill-audit-loop` and confirm the deprecated audit-loop mirror contains only audit-loop routing material.

### Finding 14 - Generated field-reference parity is currently broken

Evidence:

- `npm run verify:system` fails in `protocol:check`, check C7.
- `node scripts/build-field-reference.js --check` reports that `skill-metadata-protocol/field-reference.generated.md` is out of step with current schema description strings.

Impact:

The generated field reference is part of the protocol contract surface. If it is stale, readers can receive field descriptions that do not match the schema.

Concrete change:

Regenerate `skill-metadata-protocol/field-reference.generated.md` using `node scripts/build-field-reference.js`, then review and commit the generated delta with the schema/doc change that caused it.

Verification to close:

Rerun `node scripts/build-field-reference.js --check` and `npm run verify:system`.

### Finding 15 - Model-name validation is failing on an already-dirty audit-loop supervisor prompt

Evidence:

- `npm run models:check` fails at `prompts/skill-audit-loop-codex-panel-supervisor-v1.md:201`.
- The failure text identifies `GPT-5.5` in that prompt.
- The prompt file was already modified before this report and was not changed here.

Impact:

The prompt surface currently fails the model-name policy check. Because the file is already dirty, this report records the finding without editing or staging it.

Concrete change:

Update the prompt wording to use the allowed current-model convention required by `models:check`, then rerun the check.

Verification to close:

Rerun `npm run models:check`.

### Finding 16 - The workspace cheat sheet still says the `suppresses` rename is pending

Evidence:

- Workspace `SKILL-SYSTEM-CHEAT-SHEET.md:35` and `SKILL-SYSTEM-CHEAT-SHEET.md:40` describe relationship edges in terms of `boundary` and say renaming to `suppresses` is pending in v8.1.
- The canonical protocol already states that `relations.suppresses` is the authored field and `boundary` is a deprecated alias.

Impact:

This is outside the `skill-graph` repo commit scope, but it affects agents before they enter the repo. It can cause future agents to treat completed protocol migration work as still pending.

Concrete change:

Update the workspace cheat sheet to say `relations.suppresses` is canonical and `boundary` is deprecated compatibility input.

Verification to close:

Search workspace-level routing docs for `boundary` and confirm active guidance matches the canonical protocol.

## Verified Non-Findings And Scope Notes

- Corpus migration backlog is not a Skill Graph product-design defect. Individual skills or sidecars still migrating toward the latest schema are CONTENT-mode backlog unless a SYSTEM surface makes a false claim about them.
- The `npm run charter:parity` warning about archived `skill-audit-loop/AGENTS.md` divergence is expected by that command and is not counted as a defect here.
- Historical stale wording inside frozen deprecated mirrors is not itself a current doctrine defect when the file clearly says it is frozen. Broken redirect pointers and unrelated content inside mirrors are findings because they affect navigation today.
- No CONTENT-mode files were changed or recommended for direct ad-hoc editing in this report. CONTENT issues should flow through the audit-loop operations.

## Recommended Order Of Work

1. Fix or correct the relation-target enforcement claim, because it appears in multiple high-authority docs and affects graph integrity.
2. Regenerate `field-reference.generated.md`, because `verify:system` currently fails on it.
3. Fix the prompt model-name validation failure in the already-dirty supervisor prompt.
4. Replace active `relations.boundary` guidance with canonical `relations.suppresses` guidance in active Skill Graph and protocol docs.
5. Update Skill Audit Loop stale field names and retired taxonomy terms.
6. Repair deprecated mirror pointers so readers can reliably find the canonical docs.
7. Update the workspace cheat sheet in a separate workspace-level commit.
