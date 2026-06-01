# Findings

## Skill

`semiotics`

## Audit Date

2026-06-01

## Findings

ID: F1
Severity: HIGH
Surface: metadata / sidecar
Category: Structural conformance
Problem: `SKILL.md` still carried loop-owned audit/eval/provenance state, lifecycle/portability state, and a deprecated nested `concept` field.
Evidence: `node bin/skill-graph.js lint semiotics` reported 18 errors and 1 warning before repair. The errors were additional properties in `SKILL.md`: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `portability`, `lifecycle`, `concept`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `last_audited`, and `lint_verdict`. `node scripts/normalize-skill-field-shape.js --report --skill semiotics` identified 17 fields to relocate and schema-unknown `concept`.
Evidence strength: command-output
Action: FIXED-IN-SESSION in skills commit `0ff4b74`; moved loop-owned state to `audit-state.json`, removed `concept`, added top-level field-purpose comments, updated relation comments, and advanced the content label to v8 after preserving the v8 teaching fields.

ID: F2
Severity: MEDIUM
Surface: evals / claims
Category: Eval coverage and stale artifact reference
Problem: The skill declared planned eval artifacts and referenced a non-existent external eval draft, but no current gradeable eval existed beside the skill.
Evidence: Initial file inventory returned only `SKILL.md`. `node scripts/skill/claim-extractor.js --skill skills/design-craft/semiotics --json` reported a broken path claim for `examples/evals/semiotics.json`. After repair, `evals/comprehension.json` exists with eight dimension-tagged cases and claim extraction reports 1 verified claim and 0 broken claims.
Evidence strength: command-output + direct-file-line
Action: FIXED-IN-SESSION in skills commit `0ff4b74`; added the sibling comprehension eval file, changed sidecar `eval_artifacts` to `present`, and removed the stale path-like eval reference from the body.

ID: F3
Severity: NONE
Surface: grounding
Category: Truth-source coverage
Problem: No grounding defect found.
Evidence: The skill already declared six public truth sources. `node scripts/skill-graph-drift.js --json ../skills/skills/design-craft/semiotics` returned `EXTERNAL_UNHASHED`, not stale, after repair. Manual source checks on 2026-06-01 confirmed the declared sources still support the core claims: Peirce's sign theory covers sign/object/interpretant and icon/index/symbol; Open Library records the Saussure and Barthes sources; Norman's signifier article supports the signifier/affordance distinction; NN/g Icon Usability supports icon ambiguity and text-pairing guidance; W3C WCAG 2.2 Use of Color supports the never-color-alone rule.
Evidence strength: command-output + external-source
Action: No content fix required. Truth remains `UNVERIFIED` because the local drift sentinel cannot hash external URLs.

ID: F4
Severity: NONE
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: The description, keywords, examples, and anti-examples target sign-system analysis across icon, color, shape, position, visual metaphor, affordance, and naming-plus-visual surfaces. The anti-examples route wording to `microcopy`, craft/contrast to `visual-design-foundations`/`a11y`, formal hierarchies to ontology skills, and morphology to `linguistics`.
Evidence strength: direct-file-line
Action: No fix required.

ID: F5
Severity: NONE
Surface: relations
Category: Graph correctness
Problem: No relation defect found.
Evidence: `relations.boundary` separates semiotics from `semantics`, `microcopy`, `semantic-relations`, and `visual-design-foundations` by ownership of multi-channel sign systems versus individual textual signals, wording, concept relations, and visual craft. `related` edges point to `linguistics`, `a11y`, `intent-recognition`, and `visual-design-foundations`; `verify_with` points to `a11y` and `code-review`, useful cross-checks for color and code/API signifier claims.
Evidence strength: direct-file-line
Action: No fix required.

ID: F6
Severity: NONE
Surface: content
Category: Content quality
Problem: No content-density defect found.
Evidence: The body has Coverage, Philosophy, When to Use, foundations for Peirce/Saussure/Barthes, visual semiotics tables, iconography rules, affordance/signifier guidance, code/API semiotics, a semiotic-coherence audit checklist, Evals, Verification, Do NOT Use When, and Key Sources.
Evidence strength: direct-file-line
Action: No fix required.

ID: F7
Severity: NONE
Surface: portability
Category: Export safety
Problem: No portability defect found.
Evidence: `deployment_target: portable`, the `scope` is stack-agnostic and product-agnostic, and the grounding sources are public. No private repo paths, credentials, customer data, or Sales Hub-specific assumptions appear in the skill body or eval file.
Evidence strength: direct-file-line
Action: No fix required.

## Verification Receipts

- `node bin/skill-graph.js lint semiotics` -> PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill semiotics` -> 0 fields with work.
- `node scripts/skill-graph-drift.js --json ../skills/skills/design-craft/semiotics` -> `EXTERNAL_UNHASHED`, not stale, six external truth sources listed.
- `node scripts/skill/check-version-earned.js skills/skills/design-craft/semiotics/SKILL.md` -> schema version earned.
- `node scripts/check-markdown-links.js ../skills/skills/design-craft/semiotics/SKILL.md` -> OK.
- `node -e` JSON parse for `audit-state.json` and `evals/comprehension.json` -> OK.
- `node scripts/skill/source-truth-catalog.js --skill skills/design-craft/semiotics --deep --json` -> no key files, concept/doctrine skill catalog emitted.
- `node scripts/skill/skill-test-runner.js --skill skills/design-craft/semiotics --json` -> skipped, no key-file tests.
- `node scripts/skill/claim-extractor.js --skill skills/design-craft/semiotics --json` -> 1 verified claim, 0 broken claims.
- `git diff --check -- skills/design-craft/semiotics/SKILL.md skills/design-craft/semiotics/audit-state.json skills/design-craft/semiotics/evals/comprehension.json` -> OK.
