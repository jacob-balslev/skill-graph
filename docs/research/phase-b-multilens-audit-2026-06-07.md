# Phase B — Skill Graph Project Multi-Lens Audit (2026-06-07)

> Type: Research / audit findings (read-only). Status: report complete; remediation sequenced below.
> Method: five enriched/baseline skills loaded as audit lenses against the Skill Graph project
> (`~/Development/skill-graph/` code/docs/schemas + `~/Development/skills/` content) during the
> panel-enrich drain. Lens provenance: `semantics` **enriched**, `code-review` **enriched**,
> `information-architecture`/`conceptual-modeling` v8-scope, `methodical` v8-complete,
> `taxonomy-design`/`ontology-modeling`/`graph-audit`/`diff-analysis`/`best-practice`/`no-cutting-corners` **baseline**.
> This doc is the durable record of the in-chat Phase B report + the post-drain remediation queue.

## Severity rollup

P0 = 0 · **P1 = 6** · **P2 = 47** · **P3 = 31** · **P4/INFO = 13** · **Total = 97.**

## Remediation status (2026-06-07)

User decision (2026-06-07): **let the panel-enrich drain finish (~88 skills, ~3–4 days), batch SYSTEM fixes after.** Rationale: most actionable fixes are code/schema in files the drain executes every hour (`run-panel-enrich.js`, `panel-enrich-live-deps.js`, `skill-lint.js`, `parse-frontmatter.js`, the schemas); editing them mid-drain risks corrupting the multi-day run. Nothing endangers the running drain (fence-opt-out #L2-1 only triggers on injected dispatch; ReDoS #L2-2 is in the marketplace exporter the drain never calls).

**Already fixed (corpus-independent doc fixes, safe mid-drain):** commit `ffeaedf` — semantics #3 (glossary `schema_version` 3→8), #5 (AGENTS "9 values"→12), #7 (head-noun inline count removed), methodical #4 (`73f9e0f` qualified as a workspace-repo commit).

---

## Lens 1 — Semantics + Conceptual-Modeling (naming / conceptual integrity) — 15

| # | Sev | Finding | Evidence | Root cause | Rule |
|---|---|---|---|---|---|
|1|P1|`relations.boundary` name inverts its mechanic (reads "defer to X", runtime = "exclude X when I win")|schema `SKILL_METADATA_PROTOCOL_schema.json:246`; protocol `SKILL_METADATA_PROTOCOL.md:611-624`|sign/referent diverged|sign misencodes referent (machine-reader smell)|
|2|P1|One name, two concepts: `boundary` is BOTH an Understanding field (string) AND `relations.boundary` (array)|Understanding `boundary` schema:113-116; relations schema:244-269; protocol:476-479|two design lineages reused "boundary"|one name → two referents|
|3|P2|`glossary.md` says `schema_version` "Currently 3" — live is v8 **[FIXED ffeaedf]**|glossary.md:123|glossary stuck at v3|self-contradiction|
|4|P2|Glossary + `routing_bundles` desc reference retired axes `category`/`domain` as live|glossary.md:137; schema:223|retired refs not swept on v8 cut|schema-vs-prose drift|
|5|P2|AGENTS.md:245 "`subject` (9 values)" vs enum 12 **[FIXED ffeaedf]**|AGENTS.md:245 vs :239|partial edit on 9→12|self-contradiction|
|6|P2|Glossary missing entries for the 5 live v8 classification fields (`subject`/`deployment_target`/`scope`/`taxonomy_domain`)|glossary.md:1-151|glossary predates v8 reaxis|terminology-audit gap|
|7|P3|`head-noun-glossary.md` hardcodes "102 skills" (banned inline count) **[FIXED ffeaedf]**|head-noun-glossary.md:15|manual count in prose|stale quantity claim|
|8|P3|Glossary `urn`/`adjacent` use "v4" milestone framing abandoned by clean-cut model|glossary.md:9,115|pre-clean-cut deprecation policy|asserts lifecycle system no longer follows|
|9|P3|`grounding_mode`↔`claim_scope` alias; `claim_scope` collides with `scope` field|schema:385-402 + :71-74|v3.1 alias + word reuse|one concept/two names + word collision|
|10|P3|`runtimes`/`agent_runtimes` and `node`/`node_version` dual-name aliases|schema:147-168|v3.1 aliases never retired|one referent/two signs|
|11|P3|`allowed-tools` (kebab key) vs `allowed_tools` (snake "preferred alias")|schema:176-178|base-spec kebab + v3.1 snake|"preferred" sign ≠ canonical sign|
|12|P3|`comprehension.schema.json skill_type` enum carries retired `router`/`overlay`|comprehension.schema.json:82-86 vs glossary.md:53|eval metadata borrowed dead archetype names|enum reuse|
|13|P3|`comprehension.schema.json dimension` enum includes `taxonomy` though Understanding dropped it|comprehension.schema.json:43-55 vs protocol:461|grader dims not reconciled w/ v5→v6|model element refs retired element|
|14|P4|application vs comprehension eval schemas use divergent discriminator vocab|application.schema.json:24-27 vs comprehension.schema.json:8|authored different dates|cross-schema naming consistency|
|15|P4|`subjects[]` `allOf` claims "subjects[0] MUST equal subject" but `then` only sets `minItems:1` (no-op)|schema:509-524|JSON Schema can't express cross-field equality; comment overstates|contract sign overclaims enforced referent|

Security note: no embedded-instruction/injection content found (negative result recorded).

## Lens 2 — Code-Review + Diff-Analysis (correctness/security) — 16 (14 actionable + 2 verified non-findings)

| # | Sev | Finding | Evidence | Root cause | Rule |
|---|---|---|---|---|---|
|1|P1|OS fence fully disabled whenever custom `dispatch`/`advisoryDispatch` injected (test seam = fence opt-out)|`enrich-live-deps.js:327`; `panel-enrich-live-deps.js:165`|test-injection seam conflated with fence opt-out|security/auth-edge|
|2|P1|ReDoS risk in email privacy regex (P0 leak filter) over ≤32MB model-influenced bodies|`scripts/lib/privacy-patterns.js:54`, scanned in `export-marketplace-skills.js:755`|unbounded ambiguous char-class before required literal|perf/security|
|3|P1|`skill-lint.js` runs `else` when `if` is ABSENT (opposite of JSON Schema); gates `structural_verdict`|`scripts/skill-lint.js:172-176`|reimplemented if/then/else w/o "if absent ⇒ no conditional"|correctness/logic|
|4|P2|`assertSafeOutputRoot(outputRoot)` return discarded, then `rmSync(outputRoot)` deletes unvalidated path (latent)|`export-marketplace-skills.js:701-703`|validate X, operate on Y|destructive-op safety|
|5|P2|Validator fail-OPEN: invalid `pattern`/unknown `format` returns pass|`scripts/skill-lint.js:129-135,123-127`|defensive fail-open in a gate|swallowed error → false PASS|
|6|P2|`extractEnrichedDoc` accepts ANY frontmatter+≥500-char text as a "skill doc" and writes it|`panel-enrich-live-deps.js:99-108,314-318`|structural-only acceptance of untrusted model output|input validation / AI-output verification|
|7|P2|`parseLastJsonBlock` `lastIndexOf('{')` fallback silently drops a reviewer's feedback on stray `{`|`panel-enrich-live-deps.js:64-76,376-378`|over-tolerant JSON salvage, silent failure|tolerance buries real failure|
|8|P2|Eval guardrail skipped → unconditional KEEP whenever skill has no `evals/<mode>.json` (corpus-wide reality)|`run-panel-enrich.js:387-409`; `run-bidirectional-enrich.js:294-312`|guardrail optional by design; most skills lack evals|safety gate mostly inert|
|9|P2|`process.once('exit')` Seatbelt-profile cleanup misses SIGINT/SIGTERM → leaked `.sb` files|`panel-enrich-live-deps.js:167-169`; `enrich-live-deps.js:329-334`; `isolated-checkout.js:264-270`|exit handler doesn't cover signals|resource leak|
|10|P3|`--max-rounds` `Number()` unvalidated → `NaN` silently skips all cross-review|`run-panel-enrich.js:495,108`|missing numeric validation/clamp|input validation|
|11|P3|CLI parser treats any `--`-prefixed value as a flag (`--skill --foo` → `skill=true`)|`run-panel-enrich.js:476`; `run-bidirectional-enrich.js:367`|naive flag/value disambiguation|input validation/UX|
|12|P3|`detectPrivacyViolations` silently skips unreadable files (`catch{continue}`) in privacy gate|`scripts/lib/privacy-patterns.js:166-170`|fail-open on read error in security gate|swallowed error in gate|
|13|P3|`stripInlineComment` unquoted branch can drop ` #…` data from unquoted scalars|`scripts/lib/parse-frontmatter.js:65-68`|comment-strip heuristic on unquoted scalars|silent data loss|
|14|P3|`buildClaudeEnrichArgs` uses `--permission-mode bypassPermissions`; unsandboxed when fence degrades (non-macOS), degrade silent|`enrich-live-deps.js:199-207`; `isolated-checkout.js:233-240`|sandbox best-effort; degrade still runs|defense-in-depth gap|
|15|P4|`MODEL_LATEST`/`DISPLAY_NAMES` restate dated versions — sanctioned exception (non-finding)|`model-provider.js:33-47,344-366`|by design|intentional-vs-accidental|
|16|P4|`modelFamily('codex-current')` word-boundary — verified correct (non-finding)|`certification.js:21-49`|n/a|verify-don't-assume|

Dissent (recorded): highest real panel-enrich risk is weak untrusted-output acceptance + inert eval guardrail (#6+#8), NOT shell injection — no command-injection bug found (all dispatch uses argv arrays; only `shell:true` is a win32 branch the macOS-only repo never hits).

## Lens 3 — Methodical + Best-Practice + No-Cutting-Corners (rigor / drift) — 9

| # | Sev | Finding | Evidence | Root cause | Rule |
|---|---|---|---|---|---|
|1|P1|`verify:system` currently RED, contradicting doc "shippable when green" — `marketplace:verify` + `status:check` are members yet failing|`package.json:90`; `export --check` exit 1 (6 stale reds); `status:check` exit 1|corpus-export gate wired into the "SYSTEM-only" gate|methodical RULE-8|
|2|P2|AGENTS.md:673 exclusion list omits `marketplace:verify` (a corpus-driven verify:system member)|AGENTS.md:673 vs package.json:90|exclusion list missed a member|claim ahead of evidence|
|3|P2|Committed `conformance.generated.md` "35/165"; live "41/168"; `status:check` stale (exit 1)|committed doc vs ledger; `build-status-doc.js --check` exit 1|generated docs not regenerated after corpus growth|docs ship with change|
|4|P3|AGENTS.md:679 bare `73f9e0f` is a workspace commit **[FIXED ffeaedf]**|AGENTS.md:679|cross-repo hash w/o qualifier|TESTIMONY-as-DIRECT|
|5|P3|`.claude/rules/version-schema-contract.md:83` says `schemas/skill.schema.json` — no such file (it's the `$id`; real file `SKILL_METADATA_PROTOCOL_schema.json`)|rule:83; `ls schemas/`|`$id` URL leaf reused as filename|naming/anti-hallucination|
|6|P3|Silent cap: `run-skill-improvement-loop.js:816` `.slice(0,maxSkills)` NO log (vs `batch-eval.js:317` logged)|`run-skill-improvement-loop.js:816`|cap w/o disclosure log|methodical RULE-2|
|7|P3|`evolve` is `[PREVIEW]` in `--help` but presented as production in AGENTS.md (84,139,724)|`bin/skill-graph.js --help` vs AGENTS.md|maturity marker in help, absent in doc|state maturity honestly|
|8|P4|Non-graded `audit` mode emits scorecard dims as literal `TODO` — documented/honest-by-design (non-finding)|`skill-audit.js:559-737,586`|by-design integrity-only mode|UNVERIFIED not promoted (correct)|
|9|P4|Injection scan of lib/scripts/docs → 0 hits (negative result recorded)|grep → 0|n/a|input-as-evidence|

## Lens 4 — Graph-Audit (knowledge graph + routing integrity) — 32

| # | Sev | Finding | Evidence | Root cause | Rule |
|---|---|---|---|---|---|
|1|P2|`bcg-matrix` in corpus but NO node in `skill-graph.json`|graph `totalSkills:166` vs corpus 168|graph not rebuilt since 2026-06-04|missing node|
|2|P2|`vrio` in corpus but NO graph node|same|same|missing node|
|3-7|P2|All 5 `compositeBundles.*.path` (`naming-decision`,`classification-design`,`knowledge-structure`,`integration-pipeline`,`testing-strategy`) → `skills/_bundles/<x>/SKILL.md` do not exist|`skill-routing-config.json`; no `_bundles/` dir|bundle files declared, never authored|dangling edges (all 5 composite bundles dead)|
|8|P3|`naming-decision.replaces` → `glossary` (no such skill)|routing config|retired/renamed|referential integrity|
|9|P3|`classification-design.replaces` → `taxonomy` (actual `taxonomy-design`)|routing config|stale rename|referential integrity|
|10|P3|`classification-design.replaces` → `categorization` (no skill)|routing config|retired|referential integrity|
|11|P3|`knowledge-structure.replaces` → `ontology` (actual `ontology-modeling`)|routing config|stale rename|referential integrity|
|12|P3|`integration-pipeline.replaces` → `connector-blueprint`|routing config|retired|referential integrity|
|13|P3|`integration-pipeline.replaces` → `data-sync`|routing config|retired|referential integrity|
|14|P3|`integration-pipeline.replaces` → `data-reconciliation`|routing config|retired|referential integrity|
|15|P3|`testing-strategy.replaces` → `javascript-testing-patterns`|routing config|retired|referential integrity|
|16|P3|`testing-strategy.replaces` → `test-generator`|routing config|retired|referential integrity|
|17|P3|`testing-strategy.replaces` → `test-coverage` (actual `test-coverage-strategy`)|routing config|stale rename|referential integrity|
|18-25|P2|8 grounding truth-sources on 4 reasoning-strategy skills (`bayesian-reasoning`×2, `seven-powers`×2, `playing-to-win`×2, `porters-five-forces`×2) point at pre-v8 `skills/meta-methods/<x>/references/…` (actual `skills/skills/reasoning-strategy/<x>/references/…`)|each SKILL.md grounding|pre-v8 `meta-methods/` layout|grounding drift → drift sentinel BROKEN|
|26|P2|`project-knowledge-extraction` grounding → `docs/PRIMER.md` (actual `skill-metadata-protocol/PRIMER.md`)|SKILL.md; `ls`|PRIMER moved|grounding/referential|
|27|P2|`lint-overlay` grounding → `scripts/lint/check-routing-quality.js` (absent)|SKILL.md; `scripts/lint/`|script renamed/deleted|grounding/referential|
|28|P2|`lint-overlay` grounding → `scripts/lint/check-routing-eval.js` (absent)|same|same|grounding/referential|
|29|P2|19 skills claim `eval_artifacts: present` with no `evals/*.json` (`interaction-patterns`,`microcopy`,`form-ux-architecture`,`interaction-feedback`,`visual-design-foundations`,`layout-composition`,`refactor`,`task-analysis`,`observability-modeling`,`api-design`,`webhook-integration`,`system-interface-contracts`,`dependency-architecture`,`event-contract-design`,`framework-fit-analysis`,`data-modeling`,`performance-engineering`,`lint-overlay`,`design-system-architecture`)|`find` confirms no evals|unearned `present` claim|eval-artifact coherence|
|30|P4|`project-knowledge-extraction` grounding → `skills/skill-scaffold/SKILL.md` + `skills/context-graph/SKILL.md` (exist at `marketplace/skills/…`, wrong prefix)|`ls`|path-prefix mismatch|grounding (info)|
|31|P4|`lint-overlay` grounding → `skills/testing-strategy/SKILL.md` (exists at `marketplace/skills/…`)|`ls`|same prefix mismatch|grounding (info)|
|32|P4|`skill-graph.json summary.totalSkills:166` vs corpus 168 (stale)|graph vs `find`|built before bcg-matrix/vrio|stale artifact metadata|

Clean checks (no findings): 0 dangling relation targets across 1,146 corpus edges · 0 stale graph nodes · 0 name/dir mismatches · 0 `depends_on` cycles · 0 self-loops · 0 duplicate edges · 0 `APPLICABLE` without eval · 0 dangling refs in co-occurrence/keyword-matrix/bundles/labelMap. NOTE: graph-audit's "0 boundary deference violations / all 203 ownership-framed" CONFLICTS with Lens 5 #17 (18 deference-framed reasons) — different detection heuristics; unresolved, flagged.

## Lens 5 — Taxonomy-Design + Ontology-Modeling + Information-Architecture — 25

| # | Sev | Finding | Evidence | Root cause | Rule |
|---|---|---|---|---|---|
|1|P2|`product-domain` shelf = 3 (below 5-floor); ADR-0020 recruitment exception untracked|`find`→3|exception filed w/o tracking|balance rule (<5)|
|2|P2|`quality-assurance` shelf AT 25-ceiling; `lint-overlay` lacks `taxonomy_domain`|`find`→25|no pre-emptive subdivision|balance rule (>25)|
|3|P2|`quality/testing` (10) and `quality/testing-strategy` (1) siblings but latter is umbrella of former|grep|mixed granularity|siblings share one principle|
|4|P2|`taxonomy_domain` first-segment `foundations` shared across 3 subjects|grep|first segment not scoped to subject|canonical labels|
|5|P2|`engineering` first-segment shared across 8 subjects; `engineering/data` mixes backend+data-engineering|grep|first segment not constrained to subject|siblings share principle|
|6|P2|`route-handler-design` (backend) declares `taxonomy_domain: engineering/frontend`|SKILL.md|folder migrated, domain stale|primary-principle consistency|
|7|P2|`quality/security` mixes QA + AI (`prompt-injection-defense`)|grep|AI-security skill in QA path|MECE|
|8|P2|`quality/doctrine` shared by QA (`diff-analysis`) + s-e-method (`prioritization`)|grep|no cross-subject uniqueness|controlled vocabulary|
|9|P2|`information-architecture` `subjects:[design,knowledge-organization]` but `taxonomy_domain` anchors design only|SKILL.md:24-36|polyhierarchy not reflected in taxonomy_domain|multi-classification consistency|
|10|P2|11/22 `design` skills (50%) have no `taxonomy_domain`; shelf near ceiling|python|ADR-0020 cleanup deferred|subdivision before overflow|
|11|P2|161 (skill,target) pairs across 89 skills in BOTH `boundary` AND `related` (contradictory routing signals)|python|boundary(suppress) vs related(expand) conflated|formal consistency|
|12|P2|127 asymmetric `boundary` edges (76%) — A→B but not B→A|python|authors intended mutual exclusion w/o modeling it|disjointness should be symmetric when intent is mutual|
|13|P2|`broader`/`narrower` used by ZERO skills — flat graph, no IS-A structure|python 0/0|schema provisions SKOS, no authoring contract|hierarchy requires populated edges|
|14|P2|`disjoint_with` (OWL) used by zero skills — disjointness modeled via `boundary` (meaning vs retrieval conflated)|python 0|no guidance distinguishing boundary vs disjoint_with|conflation|
|15|P2|16 `skill_graph_canonical_skill` paths point at pre-ADR-0020 folders (`frontend-ui/`,`design-craft/`,`meta-methods/`,`code-engineering/`) — broken provenance|python `os.path.exists` False|`git mv` renamed folders, provenance field not updated|single canonical home broken|
|16|P3|5 skills declare `subject:` top-level (unindented) not under `metadata:` (`methodical`,`task-path-optimization`,`doc-updater`,`no-cutting-corners`,`blue-ocean-strategy`)|`grep "^subject:"` 4 vs `"^  subject:"` 163|older YAML layout not migrated|structural consistency|
|17|P3|18 `boundary` reasons use "X handles/covers/owns…" (deference) — opposite of required "I own X exclusively"|python 18|authors read `reason` as neighbor-description|relation-direction consistency|
|18|P3|`keywords` skill (knowledge-organization) teaches SEO/search/marketplace; `taxonomy_domain: product/search` contradicts shelf|SKILL.md|classified by name not content|classify by primary principle|
|19|P3|`skill-evolution` (project-scoped SG operational tool) on portable `knowledge-organization` shelf|SKILL.md|content is SG infra not portable methodology|browse confusion|
|20|P3|`design/interaction` shared by `interaction-patterns` + `interaction-feedback` which have a `boundary` between them|grep + edge|boundary-excluded pair shares leaf path|MECE|
|21|P3|`design/ux` shared by `form-ux-architecture` + `microcopy` (different abstraction levels)|grep|insufficiently granular subdivision|granularity|
|22|P4|`skill_graph_protocol` distribution: 99 v5, 18 v6, 5 v7, 24 v8, 22 none — majority pre-v8|python|migration debt|governance/drift cadence|
|23|P4|`depends_on` used by only 5 skills — no transitive prerequisite loading|python 5|no doctrine mandates prerequisites|property completeness|
|24|P4|Grading doctrine has two canonical homes (workspace `skills/evaluation` + skill-graph grader prompts) across two repos|Development/AGENTS.md:325 + skill-graph Doc Ownership Map|no cross-repo single-homing rule|single canonical home|
|25|P4|`reasoning-strategy` shelf mixes market-strategy frameworks + cognitive-reasoning patterns|ADR-0020 + grep (10 strategy + 3 reasoning)|ADR split solved a different axis|one primary principle per shelf|

## Cross-lens corroboration

- **v8 clean-cut migration never swept** (largest root cause; 4 lenses): semantics #3/#4/#5/#8, methodical #5, taxonomy #6/#15/#22, graph-audit #18-28/#30/#31. Folders/fields renamed but glossary text, `taxonomy_domain` values, `skill_graph_canonical_skill` provenance, and `grounding.truth_sources` not updated.
- **`relations.boundary` design fault line** (3 lenses): semantics #1/#2, taxonomy #11/#12/#14/#17. Genuine inter-lens CONFLICT: graph-audit clean-check says 0 deference reasons; taxonomy #17 says 18 — reconcile heuristics.
- **Derived artifacts lag the corpus**: graph-audit #1/#2/#32, methodical #3, semantics #7 — regenerate post-drain.
- **`eval_artifacts: present` unearned at scale** (graph-audit #29 = 19 skills) ∩ code-review #8 (guardrail inert when no eval) — most enrichments apply with no behavioral gate AND some skills falsely claim a gradeable artifact.

---

## POST-DRAIN SYSTEM FIX BATCH (the queued work)

Run after the panel-enrich drain completes. Declare SYSTEM mode. One logical change per commit, `--only` path-limited, separate from CONTENT.

### Batch A — SYSTEM code (correctness/hardening), in drain-executed files (must wait for drain)
- L2-3 P1: fix `skill-lint.js:172-176` if/else-without-if (verify with the lint suite against the corpus + template).
- L2-5 P2: `skill-lint.js:123-135` validator fail-open on bad `pattern`/unknown `format` → warn/fail-closed.
- L2-6 P2: `panel-enrich-live-deps.js:99-108` `looksLikeSkillDoc` strengthen acceptance of untrusted model output.
- L2-7 P2: `panel-enrich-live-deps.js:64-76` `parseLastJsonBlock` stop silently dropping feedback.
- L2-9 P2: signal-aware Seatbelt-profile cleanup (`panel-enrich-live-deps.js:167`, `enrich-live-deps.js:329`, `isolated-checkout.js:264`).
- L2-10/11 P3: CLI arg validation (`--max-rounds` NaN; `--`-prefixed value-as-flag) in both enrich CLIs.
- L2-13 P3: `parse-frontmatter.js:65-68` unquoted-scalar comment-strip data loss.
- L3-6 P3: add a truncation log to `run-skill-improvement-loop.js:816` (mirror `batch-eval.js:317`).

### Batch B — SYSTEM security (HIGH risk tier → HITL approval per risk-tiered-autonomous-changes.md)
- L2-1 P1: OS fence disabled when custom `dispatch` injected (`enrich-live-deps.js:327`, `panel-enrich-live-deps.js:165`) — decouple test-injection seam from fence opt-out.
- L2-2 P1: ReDoS in email privacy regex (`scripts/lib/privacy-patterns.js:54`) — bound the char-class / use a linear matcher.
- L2-12 P3: `detectPrivacyViolations` (`privacy-patterns.js:166-170`) fail-open on unreadable file in the privacy gate → fail-closed.
- L2-14 P3: silent unsandboxed degrade on non-macOS (`isolated-checkout.js:233-240`) — make the degrade loud / gate it.
- L2-4 P2: `export-marketplace-skills.js:701-703` operate on the validated path, not the raw arg.

### Batch C — SYSTEM schema/doc (drain reads schemas; do post-drain)
- L1-4 P2: remove retired `category`/`domain` from `routing_bundles` description (schema:223) + glossary:137.
- L1-9/10/11 P3: retire dual-name aliases (`grounding_mode`/`claim_scope`; `runtimes`/`agent_runtimes`; `node`/`node_version`; `allowed-tools`/`allowed_tools`) per clean-cut policy.
- L1-12/13 P3: drop retired `router`/`overlay` from `comprehension.schema.json skill_type`; reconcile `dimension` enum `taxonomy` with the v6 Understanding fields.
- L1-15 P4: fix the no-op `subjects[]` `allOf` (or document the limitation honestly).
- L1-6 P2: add glossary entries for `subject`/`deployment_target`/`scope`/`taxonomy_domain` (doc — safe mid-drain, see Batch E).
- L1-8 P3: remove "v4" milestone framing from glossary `urn`/`adjacent` (doc — safe, Batch E).
- L3-5 P3: fix `.claude/rules/version-schema-contract.md:83` path (`skill.schema.json` is the `$id`) — **CRITICAL risk tier (rules dir) → HITL.**
- L3-7 P3: add `[PREVIEW]` caveat to `evolve` in AGENTS.md (84/139/724) (doc — safe, Batch E).
- L3-2 P2 + L3-1 P1: reconcile the verify:system exclusion-list doc WITH the gate-composition decision (should `marketplace:verify`/`status:check` be in verify:system?). Design decision — see Open Decisions.

### Batch D — regeneration pass (run ONCE, after drain completes)
- Rebuild the graph (adds `bcg-matrix`,`vrio`; fixes `summary.totalSkills`): graph-audit #1/#2/#32.
- Regenerate `docs/status.generated.md` + `docs/conformance.generated.md`: methodical #3.
- Re-run `npm run verify:system` / `release:check` and confirm green: methodical #1.

### Batch E — safe DOC-only fixes (can do mid-drain, between drain pings)
- L1-6 glossary entries for the 5 v8 classification fields.
- L1-8 glossary `urn`/`adjacent` v4-framing.
- L1-4 (glossary:137 portion only — NOT the schema desc).
- L3-7 evolve `[PREVIEW]` caveat in AGENTS.md.

### Routing-config (workspace `agent-orchestration/references/skill-routing-config.json`) — DESIGN DECISION
- graph-audit #3-17: all 5 composite-bundle paths are dead + ~10 stale `replaces` entries. Decide: **create** the 5 `_bundles/<x>/SKILL.md` files, or **delete** the dead composite-bundle entries + fix `replaces` renames. Not drain-executed; can be done anytime once decided.

### CONTENT items — route through the drain / `/audit:*`, NEVER ad-hoc (Non-Negotiable #16)
- graph-audit #18-31: stale grounding truth-source paths (pre-v8 `meta-methods/`) + 19 unearned `eval_artifacts: present`. As panel-enrich re-touches each skill it may fix some; the unearned `eval_artifacts` may need `scripts/normalize-skill-field-shape.js --apply` (CONTENT) run through the loop.
- taxonomy #1-10/#16-21: `taxonomy_domain` values, subject placement, top-level-`subject` YAML, boundary/related contradictions — CONTENT, via `/audit:*`.

## Open decisions (independent of the drain)
1. **Routing-config composite bundles**: create the 5 bundle files, or delete the dead entries? (graph-audit #3-17)
2. **`relations.boundary` → `relations.suppresses` rename** (semantics #1, the pending ADR-0018): major SYSTEM clean-cut migration — pursue or defer? Also reconcile the boundary deference-vs-ownership heuristic conflict (graph-audit clean-check vs taxonomy #17).
3. **verify:system gate composition** (methodical #1/#2): keep `marketplace:verify`/`status:check` as members (and accept they go red on stale generated artifacts), or move them to `release:check` only?

## Completeness claim
Examined 97 findings across 5 lenses (semantics 15, code-review 16, methodical 9, graph-audit 32, taxonomy/IA 25). This doc covers all 97. Items excluded: none. Lens self-reported deep-read gaps (honesty, not exclusion): code-review skipped `roots.js`, `skill-graph-route.js`, `evaluate-skill.js`, several `check-*`/`build-*` validators; semantics grep-only on `field-reference.md` + 3 schema files. Worthwhile second-pass targets.
