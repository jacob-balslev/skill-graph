## A. Verification

| Prior ID | Status | Evidence |
|---|---|---|
| S1-B1 | CONFIRMED | `operation` is absent from `schemas/skill.schema.json`; global required is `subject` + `scope`, not `operation` at `schemas/skill.schema.json:7-20`; exact `rg '"operation"' schemas/skill.schema.json` returned no hits. [direct-file-line + command-output] |
| S1-B2 | CONFIRMED | Six stale `category.const` branches are present at `schemas/skill.schema.json:962-1106`. Inclusive count is 145 lines, so the prior report’s “144 lines” is only an off-by-one/counting-style issue. [direct-file-line] |
| S1-B3 | CONFIRMED | `primaryCategory` still accepts lowercase plus title-case values at `schemas/skill.schema.json:162-178`. [direct-file-line] |
| S1-B4 | CONFIRMED | Schema description now says `description` is about-statement only at `schemas/skill.schema.json:45-48`; protocol prose still says routing contract at `SKILL_METADATA_PROTOCOL.md:262-267`. [direct-file-line] |
| S1-INFO-1 | CONFIRMED | `schema_version` accepts integer `7|8` and string `"7"|"8"` at `schemas/skill.schema.json:22-33`. [direct-file-line] |
| S2a-B5 | CONFIRMED | `SKILL_METADATA_PROTOCOL.md` still requires/describes `operation` at `SKILL_METADATA_PROTOCOL.md:154-164`, `276-321`, and `761-775`. [direct-file-line] |
| S2a-B6 | CONFIRMED | Retired description framing remains at `SKILL_METADATA_PROTOCOL.md:262-267`; schema contradicts it at `schemas/skill.schema.json:45-48`. [direct-file-line] |
| S2a-B7 | CONFIRMED | Bad TOC anchor is at `SKILL_METADATA_PROTOCOL.md:33`; `npm run docs:links` reports missing `#Evaluation Status`. [direct-file-line + command-output] |
| S2a-B8 | CONFIRMED | Broken Health Block anchor is at `SKILL_METADATA_PROTOCOL.md:244`; `npm run docs:links` reports the missing anchor. [direct-file-line + command-output] |
| S2b-B9 | CONFIRMED | Audit checklist still asks for `operation` at `SKILL_AUDIT_LOOP.md:423-427`. [direct-file-line] |
| S2b-INFO-2 | CONFIRMED | Audience/runtime warning exists at `SKILL_AUDIT_LOOP.md:540-545`. [direct-file-line] |
| S2c-B10 | CONFIRMED | Current State still claims `subject + operation + scope` at `SKILL_GRAPH.md:17`. [direct-file-line] |
| S2d-B11 | CONFIRMED | ADR-0017 Decision row 2 still makes `operation` required at `docs/adr/0017-five-axis-classification-model.md:26-32`; landing strategy and consequences still depend on it at `:46-57` and `:61-73`. [direct-file-line] |
| S2d-INFO-3 | CONFIRMED | ADR-0009 has amendment precedent at `docs/adr/0009-sibling-repo-deprecation.md:25-32`. [direct-file-line] |
| S2d-INFO-4 | CONFIRMED | ADR-0016 is now Accepted and describes residual sequencing at `docs/adr/0016-operational-data-ownership.md:3-10`. [direct-file-line] |
| S2e-B12 | CONFIRMED | C7 fails generated parity; field-reference links to `#operation` at `docs/field-reference.md:153`, `:186`, `:323`, while the actual removed-field heading is `#operation-removed` from `docs/field-reference.md:426-428`. [direct-file-line + command-output] |
| S2f-B13 | CONFIRMED | CHANGELOG still says required `subject + operation + scope` at `CHANGELOG.md:13-18`. [direct-file-line] |
| S2f-B14 | CONFIRMED | `npm run status:check` fails because `docs/status.generated.md` is stale and three checks are red. [command-output] |
| S3-B15 | CONFIRMED | Codemod still documents and inserts `operation` at `scripts/migrate-skill-v7-to-v8.js:193-200`, `242-248`, `363-372`. [direct-file-line] |
| S3-B16 | CONFIRMED | Category checker requires `fm.category` at `scripts/lint/check-category-enum.js:21-22` and `:76-78`; live gate fails on `expected-value`. [direct-file-line + command-output] |
| S3-B17 | CONFIRMED | Manifest schema still requires `type` and `category` at `schemas/manifest.schema.json:138-148`; live `manifest:validate` fails on both undefined. [direct-file-line + command-output] |
| S3-B18 | DISPUTED | Marketplace drift is real, but the current truncation/skipped-warning count is far larger than “4 descriptions.” Live `marketplace:verify` shows many projection truncations/skips plus stale/missing files. [command-output] |
| S3-INFO-5 | CONFIRMED | `npm run docs:drift` passes: 54 active docs scanned. [command-output] |
| S4-B19 | DISPUTED | Direct `node scripts/__tests__/test-lib-audit-smoke.js` passes 14/14. Also not all four named files define `REPO_ROOT = path.resolve(__dirname, '../..')`: `skill-status.js` uses `findRepoRoot()` at `lib/audit/skill-status.js:72-82`; `eval-staleness-checker.js` uses `ROOT_DIR = workspaceRoot()` at `lib/audit/eval-staleness-checker.js:20-24`. Workspace path debt exists, but the prior finding overstates the failing test and exact mechanism. [direct-file-line + command-output] |
| S4-INFO-6 | PARTIAL | Grader prompts are present in `lib/audit/graders/`; I did not verify workspace shim thinness. [command-output] |
| S5-B20 | CONFIRMED | Template carries `operation: know` at `examples/skill-metadata-template.md:79-84`; `lint:template` fails on it. [direct-file-line + command-output] |
| S6-INFO-7 | CONFIRMED | `schemas/routing-config.schema.json` exists. [command-output] |
| S7-B21 | CONFIRMED | `npm run verify` is red, stopping at `lint`; individual gates confirm red `lint`, `lint:template`, `category:check`, `protocol:check`, `docs:links`, `manifest:validate`, `routing-eval`, `marketplace:verify`, `status:check`, and `test:unit`. Some live causes differ because this run is read-only and write attempts fail with `EPERM`. [command-output] |
| S7-INFO-8 | CONFIRMED | CI path filter includes dead `skills/**` entries at `.github/workflows/skill-graph-lint.yml:6-13` and `:20-27`; local `skills/` dir is absent. [direct-file-line + command-output] |
| S8-INFO-9 | CONFIRMED | `dependencies` and `devDependencies` are empty at `package.json:84-85`. [direct-file-line] |

## B. Disagreements

**S3-B18 - marketplace truncation count is undersold.**  
The stale/missing export finding is valid, but the prior report’s “4 truncations” is not current. Live `npm run marketplace:verify` reported dozens of `PROJECTION TRUNCATED` / `PROJECTION SKIPPED` warnings, then failed on stale `marketplace/README.md`, stale `cognitive-load-theory`, missing `expected-value`, stale `skill-scaffold`, and expected 153 vs found 152 exported skills. [command-output]

**S4-B19 - smoke test failure and exact file claim are wrong.**  
The standalone boundary concern is directionally plausible, but the direct smoke test passes. The exact mechanism is also overstated: only `batch-eval.js` and `skill-improvement-helpers.js` define the cited `REPO_ROOT` constant at `lib/audit/batch-eval.js:36-44` and `lib/audit/skill-improvement-helpers.js:613-727`; `skill-status.js` and `eval-staleness-checker.js` use different root mechanisms at `lib/audit/skill-status.js:72-82` and `lib/audit/eval-staleness-checker.js:20-24`. [direct-file-line + command-output]

## C. New Findings

| ID | Severity | Surface | Problem | Evidence | Recommended action |
|---|---|---|---|---|---|
| G1 | HIGH | Tier 1 schema | The schema’s own descriptions/comments still teach the retired 5-axis/operation contract. | `schemas/skill.schema.json:33`, `:139`, `:1211` [direct-file-line] | Update schema descriptions/comments so generated docs stop inheriting false doctrine. |
| G2 | HIGH | Tier 1 JSON-LD / CI | `schemas/skill.context.jsonld` still maps `operation`, and C8 only checks missing schema fields, not extra stale context terms. | `schemas/skill.context.jsonld:83-85`; C8 only computes `missing` at `scripts/check-protocol-consistency.js:748-756` [direct-file-line] | Remove `operation` from context or add a C8 extra-key check. |
| G3 | HIGH | Tier 1 manifest schema | Manifest schema still exposes `summary.by_operation` and `skills[].operation`, while generator no longer emits operation. | `schemas/manifest.schema.json:86-92`, `:248-252`; generator projects `subject/subjects` only at `scripts/generate-manifest.js:292-302` [direct-file-line] | Drop or explicitly mark these as legacy optional fields. |
| G4 | MEDIUM | Tier 2 README | README quick example authors invalid `operation`. | `README.md:121-124` [direct-file-line] | Replace with the post-retire classification shape. |
| G5 | HIGH | Tier 2 adoption docs | Adoption guide says the template is valid and requires `operation`; template and lint prove otherwise. | `docs/ADOPTION.md:60-61`; `examples/skill-metadata-template.md:79-84`; `lint:template` output [direct-file-line + command-output] | Update adoption text and template together. |
| G6 | HIGH | Tier 2 quickstart | 30-minute quickstart says the template lints clean and lists `operation` as required; examples duplicate invalid axes. | `docs/QUICKSTART-30MIN.md:62-68`, `:78-85`, `:166-173` [direct-file-line] | Rewrite quickstart examples against the current schema. |
| G7 | MEDIUM | Tier 2 authoring quickstart | Authoring quickstart examples still include `operation`. | `docs/AUTHORING-QUICKSTART.md:79-87`, `:129-134` [direct-file-line] | Remove `operation` from both physical encoding examples. |
| G8 | MEDIUM | Tier 2 primer | PRIMER example includes invalid `operation`; it also shows `eval_state: passing` without the M5-required `eval_artifacts: present` in the same snippet. | `docs/PRIMER.md:280-286`; M5 rule at `schemas/skill.schema.json:1226-1239` [direct-file-line] | Make the primer example schema-valid or label it as intentionally abridged and non-valid. |
| G9 | MEDIUM | Tier 2 rationale doc | Deeper rationale doc still states current v8 is five axes and `operation` required. | `docs/skill-metadata-protocol.md:9-12` [direct-file-line] | Align rationale with normative spec after the schema decision. |
| G10 | MEDIUM | Tier 2 field reference | Field reference is internally contradictory: old sections say type/category are required/replaced by operation, while later section says operation is removed. | `docs/field-reference.md:153`, `:242-244`, `:426-428` [direct-file-line] | Sweep field-level semantics, not just generated anchors. |
| G11 | MEDIUM | Tier 2 decision guide | Decision guide still says `category` is always present and required by schema/checker. | `docs/field-decision-guide.md:315` [direct-file-line] | Update to v8 subject-only authoring and deprecate the checker. |
| G12 | MEDIUM | Governance docs | CONTRIBUTING still instructs routing-contract descriptions and v7 scope values. | `CONTRIBUTING.md:40-45` [direct-file-line] | Update contributor workflow to about-statement descriptions and `portable/workspace/project`. |
| G13 | MEDIUM | Tier 2 manifest mapping | Manifest mapping worked example still includes `operation`. | `docs/manifest-field-mapping.md:315-322` [direct-file-line] | Regenerate or manually repair the worked example. |
| G14 | MEDIUM | Tier 3 helper script | Field-purpose backfill helper still contains `operation` comments and a “5-axis” divider. | `scripts/backfill-field-purpose-comments.js:92-98`, `:286` [direct-file-line] | Remove retired operation comment template and rename divider. |
| G15 | LOW | Tier 3 lint script | Lint code now enforces only `subject/scope` but the surrounding comment still says v8 5-axis classification. | `scripts/skill-lint.js:195-200` [direct-file-line] | Correct comment and error wording to prevent future doc regeneration drift. |

Optional upstream-displacement sweep: I checked official/current release surfaces lightly. OpenAI’s changelog lists newer agent/Codex/Responses capabilities, Anthropic release notes list API tools such as code execution/web search and Claude Code release-note routing, and OpenCode has recent changelog surfaces. I did not form a per-skill displacement finding from that sweep because this was SYSTEM-side and no specific skill was tested against those sources. Sources: [OpenAI changelog](https://platform.openai.com/docs/changelog), [Anthropic API release notes](https://docs.anthropic.com/en/release-notes/api), [Anthropic Claude Code release notes](https://docs.anthropic.com/en/release-notes/claude-code), [OpenCode changelog](https://opencode.ai/da/changelog). [external-source]

## D. Priority Ordering

1. Fix Tier 1 truth first: schema descriptions/comments, JSON-LD context, and manifest schema. These are machine-consumed surfaces and currently propagate retired doctrine.
2. Amend or supersede ADR-0017. The decision register still says `operation` is required.
3. Repair canonical normative docs: `SKILL_GRAPH.md`, `SKILL_METADATA_PROTOCOL.md`, `SKILL_AUDIT_LOOP.md`, `docs/skill-metadata-protocol.md`, and `CHANGELOG.md`.
4. Fix authoring entrypoints: template, README, ADOPTION, QUICKSTART, AUTHORING-QUICKSTART, PRIMER, CONTRIBUTING.
5. Repair Tier 3 stale tooling: v7-to-v8 codemod, category checker, backfill comments, manifest schema/generator comments.
6. Regenerate generated artifacts: field reference, status doc, marketplace export.
7. Address the `lib/audit` workspace-path debt, but treat the prior audit’s exact test-failure claim as outdated or wrong.
8. Drain CONTENT-side skill operation fields only through `/audit:*`, not through SYSTEM batch edits.

## E. Prior Audit Quality

The prior audit did especially well at separating intentional drain-pending red gates from SYSTEM cleanup gaps. The dissent section made the right distinction: red verify is not automatically wrong after a schema-breaking SYSTEM commit, but stale codemods, ADRs, and generated schemas are still SYSTEM debt.

It did especially poorly on S4-B19. That section converted a real smell into an over-precise claim: the named smoke test passes when run directly, two of the four named files do not match the stated `REPO_ROOT` pattern, and `scripts/` is included in the package files. The better finding is narrower: several bundled audit modules still encode workspace-specific paths, so standalone behavior needs targeted hardening.

## F. Completeness Claim

I examined 39 SYSTEM surfaces: the prior audit, skill schema, manifest schema, JSON-LD context, protocol docs, audit-loop docs, graph doc, ADRs 0009/0016/0017/0018, package scripts, CI workflow, migration codemod, protocol checker, category checker, manifest generator, lint script, field-purpose backfill script, template, audit manifests, four `lib/audit` files, the audit smoke test, active authoring docs, generated-doc checks, verify gates, marketplace gates, counts, and a light official web sweep.

I confirmed 19 of 21 prior B-findings, disputed 2, added 15 new findings. Items I did not examine fully: older ADRs 0001-0015 except 0009/0016/0017/0018, audit runner prompt bodies, every marketplace generated skill, every canonical SKILL.md body, and a full per-skill upstream displacement audit.
