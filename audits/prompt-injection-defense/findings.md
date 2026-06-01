# Findings

## Skill

`prompt-injection-defense`

## Audit Date

2026-06-01

## Findings

ID: F1
Severity: HIGH
Surface: metadata / sidecar
Category: Structural conformance
Problem: `SKILL.md` still carried loop-owned audit/eval state and a deprecated nested `concept` field, while missing the required v8 `scope` field.
Evidence: `node bin/skill-graph.js lint prompt-injection-defense` reported 17 errors before repair, including missing `scope`, additional properties for `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, verdict fields, `last_audited`, `lint_verdict`, and `concept`. `node scripts/normalize-skill-field-shape.js --report --skill prompt-injection-defense` identified 15 fields to relocate, missing semantic `scope`, and unknown `concept`.
Evidence strength: command-output
Action: FIXED-IN-SESSION in skills commit `b400e35`; moved loop-owned state to `audit-state.json`, added `scope`, removed `concept`, and updated export protocol/path.

ID: F2
Severity: MEDIUM
Surface: grounding
Category: Truth-source coverage
Problem: The skill body had useful Key Sources, but no structured truth sources were declared for drift/tooling, so the drift sentinel reported `UNGROUNDED`.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/prompt-injection-defense` returned `status: "UNGROUNDED"` with `details: "no truth_sources declared"` before repair. After repair it returned `EXTERNAL_UNHASHED` for OWASP LLM01 2025, OWASP Prompt Injection Prevention Cheat Sheet, Anthropic browser-use prompt-injection research, NIST AI 100-2 E2025, and Greshake et al. arXiv 2302.12173.
Evidence strength: command-output
Action: FIXED-IN-SESSION in skills commit `b400e35`; added universal `grounding.truth_sources`. Truth remains `UNVERIFIED` because the drift sentinel cannot hash external URLs.

ID: F3
Severity: MEDIUM
Surface: evals
Category: Comprehension coverage
Problem: `eval_artifacts` was declared `planned`, but no gradeable comprehension eval existed for the skill.
Evidence: `find skills/quality-assurance/prompt-injection-defense -maxdepth 3 -type f -print` initially returned only `SKILL.md`. After repair, `node -e` parsed `skills/quality-assurance/prompt-injection-defense/evals/comprehension.json`, and the eval file contains eight dimension-tagged cases covering definition, mental_model, purpose, boundary, taxonomy, analogy, application, and misconception.
Evidence strength: direct-file-line + command-output
Action: FIXED-IN-SESSION in skills commit `b400e35`; added `evals/comprehension.json` and set sidecar `eval_artifacts: "present"`.

ID: F4
Severity: NONE
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: The description names the core trigger condition, "systems that pass untrusted content to a language model," and lists direct/indirect/exfiltration/action-trigger taxonomy plus untrusted surfaces. Keywords are capped at 10 and specific to prompt injection. Examples cover RAG, planning/execution separation, blocklist limitations, and tool authority for email attachments. Anti-examples route jailbreak/model-safety, API security, type-safety/API design, and tool-call-flow away from this skill.
Evidence strength: direct-file-line
Action: No fix required.

ID: F5
Severity: NONE
Surface: relations
Category: Graph correctness
Problem: No relation defect found.
Evidence: `relations.boundary` separates this skill from `tool-call-flow`, `type-safety`, `api-design`, and `http-semantics` by mechanism: protocol cycle, compile-time shape, request/response contract, and transport semantics versus the LLM-specific untrusted-content authority threat. `verify_with` points to `api-design` and `tool-call-flow`, which are useful cross-checks for tool/API authority.
Evidence strength: direct-file-line
Action: No fix required.

ID: F6
Severity: NONE
Surface: content
Category: Content quality
Problem: No content-density defect found.
Evidence: The body has Coverage, Philosophy, a direct/indirect threat-model table, a defense-stack table, an injection-surfaces table, a markdown-image exfiltration walkthrough, a dual-LLM pattern section, a verification checklist, and an explicit "Do NOT Use When" boundary table. External source checks on 2026-06-01 confirmed the body still matches current primary guidance: OWASP LLM01 2025 names direct/indirect injection, RAG/fine-tuning limitations, least privilege, human approval, segregating external content, adversarial testing, markdown-image exfiltration, and multimodal injection; Anthropic's 2025 browser-use research says browser agents remain exposed to untrusted web content and no browser agent is immune; NIST AI 100-2 E2025 provides current adversarial-ML taxonomy context; Greshake et al. remains the foundational indirect-injection paper.
Evidence strength: direct-file-line + external-source
Action: No fix required.

ID: F7
Severity: NONE
Surface: portability
Category: Export safety
Problem: No portability defect found.
Evidence: `deployment_target: portable`, the new `scope` is provider/product agnostic, and the grounding sources are public external references. No private repo paths, credentials, customer data, or Sales Hub-specific assumptions appear in the skill body or eval file.
Evidence strength: direct-file-line
Action: No fix required.

## Verification Receipts

- `node bin/skill-graph.js lint prompt-injection-defense` -> PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill prompt-injection-defense` -> 0 fields with work.
- `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/prompt-injection-defense` -> `EXTERNAL_UNHASHED`, not stale, five external truth sources listed.
- `node scripts/skill/check-version-earned.js skills/skills/quality-assurance/prompt-injection-defense/SKILL.md` -> schema version earned.
- `node scripts/check-markdown-links.js ../skills/skills/quality-assurance/prompt-injection-defense/SKILL.md` -> OK.
- `node -e` JSON parse for `audit-state.json` and `evals/comprehension.json` -> OK.
- `node scripts/skill/source-truth-catalog.js --skill skills/quality-assurance/prompt-injection-defense --deep --json` -> no key files, concept/doctrine skill catalog emitted.
- `node scripts/skill/skill-test-runner.js --skill skills/quality-assurance/prompt-injection-defense --json` -> skipped, no key-file tests.
- `node scripts/skill/claim-extractor.js --skill skills/quality-assurance/prompt-injection-defense --json` -> 0 repo path/symbol claims.
- `git diff --check -- skills/quality-assurance/prompt-injection-defense/SKILL.md skills/quality-assurance/prompt-injection-defense/audit-state.json skills/quality-assurance/prompt-injection-defense/evals/comprehension.json` -> OK.
