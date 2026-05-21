# Skill Library as Lens — 3-Layer Design Review of the Skill Graph Project

> **Type:** Findings report (report-only). No schema/code/doc changes made.
> **Date:** 2026-05-21
> **Method:** Applied the skill library at `~/Development/skills/skills/` as analytical lenses
> against the three layers of the Skill Graph project (Protocol / Graph system / Audit Loop),
> running the repo's own tooling for evidence.
> **Subject vs lens:** subject = the Skill Graph project; lens = the skill library's
> ontology / taxonomy / semantics / IA / evaluation / mlops / editorial methodologies.

## Governing insight (answer first)

**The Skill Graph's *form* is in excellent shape and its *behavioral truth* is almost entirely
unproven — and the gap between those two is the project's central, honest tension.** Every
deterministic gate is green (lint 143/0, protocol C1–C8, manifest parity, export 143/143,
doctor 6/6). But the layer the whole v7 redesign was built to enable — behavioral certification —
has produced a verdict on **zero** of 143 skills (`application_verdict: UNVERIFIED` corpus-wide,
`comprehension_verdict: UNVERIFIED` corpus-wide), routing is verified for **8/143** skills (5.6%),
and the drift sentinel has a live baseline on **~0** skills (138/143 UNGROUNDED). This is not a
defect to paper over — the docs are scrupulously honest that `UNVERIFIED` is the correct default —
but it means the project today is a superbly-engineered *contract and toolchain* sitting on top of
a corpus whose quality is asserted by construction, not yet measured. The highest-value work is not
more schema rigor; it is **running the Behavior Gate** the schema already supports.

A secondary thread runs through the docs: **single-source-of-truth blocks that drifted anyway**
because the numbers are hand-copied (skill count 142 vs actual 143; release 0.6.0 vs actual 0.5.8;
JSON-LD `eval_score` 0.0–1.0 vs actual 0.0–5.0). The intent is right; the mechanism (manual
restatement) defeats it.

---

## Evidence base (all commands run 2026-05-21, Node v26.0.0)

| Command | Result |
|---|---|
| `skill-lint.js` | 143 files, 0 errors |
| `skill-lint.js --include-template` | 2 files, 0 errors |
| `check-protocol-consistency.js` | C1–C8 all OK, 0 warnings |
| `check-markdown-links.js` | OK, 266 files |
| `generate-manifest.js --validate-only` | OK, 143 skills |
| `verify-skill-md-export.js` | 143 PASS, 0 FAIL |
| `skill-graph-routing-eval.js --only-asserted --confusion-matrix` | 8 skills, 8 PASS / 0 FAIL; 30 positive + 24 negative cases all pass |
| `skill-overlap.js` | 0 errors, 40 keyword warnings (advisory/recall) |
| `skill-graph-drift.js` | 1 DRIFT, 4 EXTERNAL_UNHASHED, 138 UNGROUNDED |
| `bin/skill-graph.js doctor` | 6/6 PASS |
| manifest summary | 143 skills; by_category {engineering 59, quality 28, design 26, agent 16, foundations 13, product 1}; by_scope {portable 94, reference 49, codebase 0}; by_type {capability 134, workflow 8, overlay 1, router 0}; by_stability {experimental 140, stable 1} |
| health distributions | routing_eval present 8 / absent 135; eval_state passing 7 / unverified 136; eval_artifacts present 31 / planned 111 / none 1; comprehension_state present 68 / none 75; application_verdict UNVERIFIED 143; comprehension_verdict UNVERIFIED 143 |

---

## LAYER 1 — Skill Metadata Protocol

Lenses: ontology-modeling, conceptual-modeling, semantics, taxonomy, contracts, naming-conventions.

| ID | Sev | Surface | Problem | Evidence | Action |
|---|---|---|---|---|---|
| P1 | HIGH | `schemas/skill.context.jsonld` | The two distinct `boundary` fields (top-level Understanding *string* vs `relations.boundary` *array*) share ONE JSON-LD term mapped to `sg:disjointOwnership` `@container:@set`. Protocol claims they're "disambiguated by nesting depth" but JSON-LD term resolution is by key, not depth, absent a scoped context. The Understanding `boundary` string therefore projects to RDF as a routing-disjointness set — wrong predicate, wrong type. Breaks the file's stated promise of RDF projection "without changing the authoring surface." | `skill.context.jsonld:105-108` (only one `boundary` term); `SKILL_METADATA_PROTOCOL.md:259-262` | Add a property-scoped context under `relations` so `relations.boundary`→`sg:disjointOwnership` while top-level `boundary`→ new `sg:conceptBoundary` (string). C8 checks coverage only, not correctness — it will not catch this. |
| P2 | MEDIUM | `skill.context.jsonld:268` | `eval_score` `_note` says scale "0.0–1.0"; every other artifact says "0.0–5.0". A consumer interpreting manifest `eval_score` via the context mis-scales by 5×. | JSON-LD `:268` vs `SKILL_METADATA_PROTOCOL.md:326`, `SKILL_AUDIT_LOOP.md:74,102`, `docs/skill-metadata-protocol.md:267,468` | Fix the `_note` to 0.0–5.0. |
| P3 | MEDIUM | `skill.context.jsonld:277,281` | Enum `_note`s stale: `drift_status` note "clean\|drifted\|unknown" vs actual `OK\|DRIFT\|BROKEN\|STALE\|NO_BASELINE\|EXTERNAL_UNHASHED\|UNKNOWN`; `lint_verdict` note "pass\|fail\|warn" vs actual `PASS\|FAIL\|UNKNOWN` (no `warn`). | JSON-LD vs `SKILL_METADATA_PROTOCOL.md:336,341` | Align the `_note`s with the v7 enums. |
| P4 | MEDIUM | `skill.context.jsonld:2-4` | Context metadata stale: `_version:3.0.0`, `_schema_version_target:6`, `_comment` "v4 frontmatter" — current contract is v7. Consistent with why the v7 Understanding `boundary` term (P1) is missing. | `skill.context.jsonld:2-4` | Bump target to 7; decide v7 term coverage including the `boundary` split. |
| P5 | MEDIUM | `SKILL_METADATA_PROTOCOL.md` (whole) | **Documented authoring shape ≠ actual corpus encoding.** The normative spec presents the contract as top-level native YAML ("Every skill is a single SKILL.md file with a YAML frontmatter block", `:38`; field tables list top-level keys). All 143 canonical skills are physically authored in the plain Agent-Skills export shape — fields nested under `metadata:`, structured values JSON-string-encoded — reconciled only by `normalizeFrontmatter()`. The spec never documents this dual encoding or the precedence rule. An author following the spec literally produces a different file than the corpus. | sample `../skills/skills/engineering/database-migration/SKILL.md` frontmatter; `scripts/lib/parse-frontmatter.js:345-454` | Add an "Encoding & Compatibility" section to the normative spec documenting both shapes + "top-level wins" precedence. |
| P6 | LOW | `parse-frontmatter.js:365-372`, `export-marketplace-skills.js:41` | The `skill_graph_protocol` content-label is stripped as export provenance before any tool sees it, and the exporter hardcodes `v7` on every export regardless of source content. So "Version Labels Are Earned" + the documented v5/v6/v7 backlog (115 v5, 25 v6) have **zero machine enforcement** — pure human discipline. | `EXPORT_PROVENANCE_FIELDS` set | Either add an advisory check (Understanding-field presence ↔ label) or state explicitly in the protocol that the label is human-asserted and unchecked. |
| P7 | INFO | `skill.context.jsonld:48,58` | JSON-LD carries terms for fields not in the v7 contract: `secondary_categories`, `marketplace_tier`. v7 routes cross-pollination through `relations.related` (max 5), not a `secondary_categories` field. Harmless (additive) but dead vocabulary. | context lines | Annotate as deprecated or remove. |
| P8 | INFO (PASS) | predicate set | **Relation ontology is sound and orthogonal.** `related`(skos:related, symmetric) / `broader`/`narrower`(skos) / `boundary`(sg:disjointOwnership, directional routing) / `disjoint_with`(owl:disjointWith, formal) / `verify_with`(prov:wasInformedBy) / `depends_on`(dcterms:requires). The `boundary` vs `disjoint_with` split (ADR 0006) correctly separates a weaker routing predicate from formal OWL disjointness. | `skill.context.jsonld:85-123`, ADR 0006 | None — state as well-designed. |
| P9 | MEDIUM | `relations.boundary` semantics | The runtime mechanic **inverts** the field's surface reading. Route applies `if (target.score >= declarer.score) skip target` (`route.js:548`) — boundary protects the *declarer's* wins, not "I defer to B." But the field name + the prescribed reason text ("use that skill instead, because…") read as deference/handoff. A predicate whose name + convention describe the opposite of its behavior is a naming hazard (the docs flag it but the field is still named/described in the deferring direction). | `SKILL_METADATA_PROTOCOL.md:395-400` | Reconcile the field name or the reason-text convention with the exclusion mechanic. |
| P10 | INFO (PASS) | category enum / foundations gate | **Foundations gate is holding:** foundations=13 (target 8–15, fail >20). The anti-junk-drawer rule is being enforced in practice. | manifest `by_category` | None — state as PASS. |
| P11 | LOW | category enum | Enum is defensibly MECE by the disambiguation rules, but balance is skewed: `product`=1, `engineering`=59 (41%). The routing "category × type × scope triple as first-pass discriminator" has weak power in practice — 59/143 share category, 134/143 share type=capability, 94/143 share scope=portable. Routing leans almost entirely on keyword score + edges, not the triple. | manifest summary | Note the triple's low discriminating power; the `domain` sub-path is doing the real categorization work inside `engineering`. |
| P12 | MEDIUM | archetype / scope coverage | `router` archetype defined (with its own eval rules) but **0** skills use it; `scope: codebase` defined (requires grounding) but **0** skills use it. The codebase=0 is correct (private-content boundary excludes Sales Hub data). But router=0 means a whole archetype + its eval discipline is unexercised in the live corpus. | manifest `by_type`/`by_scope` | Add a router specimen OR mark the archetype "reserved/aspirational" in the spec so the eval machinery isn't dangling. |
| P13 | LOW | `stability` field | 140/143 = `experimental`, 1 = `stable`. For a "canonical consolidated, published" library the field is non-discriminating — consumers cannot gate on stability. | manifest `by_stability` | Run a stability-promotion pass (`test-stability-promotion.js` exists) or document that stability is intentionally pinned pre-1.0. |

---

## LAYER 2 — Skill Graph system

Lenses: information-architecture, system-interface-contracts, api-design, rag-evaluation, knowledge-graph.

| ID | Sev | Surface | Problem | Evidence | Action |
|---|---|---|---|---|---|
| G1 | HIGH | routing eval | **Routing is verified for 5.6% of the corpus.** Only 8/143 skills carry `routing_eval: present`; 135 are `absent`. The graph's central claim — "route the right skill" — is asserted but tested for 8 nodes. | routing-eval output; manifest `routing_eval` | Expand the routing baseline; track `present/total` as a first-class coverage metric. |
| G2 | HIGH | `skill-graph-route.js` | **The docs' own showcase query mis-routes.** `route "audit my skills for schema conformance"` (printed in `--help` and AGENTS.md) selects contract-testing / generative-ui / schema-evolution / task-analysis / cognitive-load-theory — none is the skill-audit/skill-infrastructure owner; the intended skill isn't even co-loaded. The tentpole Tier-4 tool misfires on its own example. | route output 2026-05-21 | Add `examples`/`anti_examples`/`keywords` to the owning skill; add this query to the routing baseline as a regression. |
| G3 | MEDIUM | `skill-graph-drift.js` | Drift sentinel — billed as "the single highest-leverage argument" for the grounding fields — has a live hashed baseline on ~0 skills: 138/143 UNGROUNDED, 4 EXTERNAL_UNHASHED (by design — zero-dep sentinel can't fetch URLs), 1 real DRIFT. Because `scope:codebase`=0, grounding is rarely declared, so the drift layer protects almost nothing in the current corpus. | drift output; `SKILL_GRAPH.md:229` | (a) Fix the real DRIFT (`skill-infrastructure` → `scripts/skill-overlap.js`); (b) document that drift earns its rent mainly for the (currently absent) codebase-scoped skills. |
| G4 | MEDIUM | docs count | **Skill count drift: docs say 142, tooling says 143.** The block that calls itself "the canonical 'what version / how many' reference… to avoid the drift that recurs" has itself drifted by one. | `SKILL_GRAPH.md:19`, `AGENTS.md:78`, `README.md:301` vs lint/manifest/`find` = 143 | Feed the count from `build-status-doc.js` (`status.generated.md`); have docs reference the generated artifact. |
| G5 | INFO (PASS) | manifest projection | Projection fidelity is clean: C2 authored→generated parity OK, manifest valid 143, C4 sample manifest OK, export 143/143 PASS. | protocol-check, manifest, export | None — state as PASS. |
| G6 | LOW | CLI contract (`evolve`) | `evolve` is listed as a first-class command in `--help` but is `[PREVIEW · monorepo-only]` and depends on parent-repo scripts (SH-6138). A standalone CLI consumer gets a command that can't run. | `bin/skill-graph.js --help` | Gate `evolve` behind a capability check that errors clearly, or demote it from the primary command list until SH-6138 lands. |
| G7 | LOW | overlap doctrine | Overlap is correctly framed as recall, not defects (40 advisory warnings, 0 errors) — a design PASS. BUT the prescribed fix ("add/confirm a relation edge between co-activating skills") is **unmet for the highest-overlap pair**: `data-modeling ↔ entity-relationship-modeling` share 5 keywords (entity relationship, foreign key, normalization, primary key, schema design) yet `data-modeling` declares no `boundary`/`related`/`verify_with` edge to `entity-relationship-modeling`. | `skill-overlap.js`; `data-modeling/SKILL.md` relations block | Add the missing edge for the top overlap pairs (this one; owasp-security↔security-fundamentals; performance-budgets↔performance-engineering). |

---

## LAYER 3 — Skill Audit Loop

Lenses: evaluation, self-review-pattern, methodical, mlops-maturity, dora-metrics, quality-doctrine.

| ID | Sev | Surface | Problem | Evidence | Action |
|---|---|---|---|---|---|
| A1 | HIGH | Behavior Gate | **The primary quality signal is UNVERIFIED corpus-wide.** `application_verdict`=UNVERIFIED for all 143; `comprehension_verdict`=UNVERIFIED for all 143. Per the loop's own doctrine, `application_verdict: APPLICABLE` "is the only verdict that certifies a skill is useful" (`SKILL_AUDIT_LOOP.md:80`) — so **zero** skills are behaviorally certified, despite 68/143 carrying Understanding fields (gate-8-eligible *today*). This is HONEST (UNVERIFIED is the correct default) and must NOT be "fixed" by stamping verdicts. But the Behavior Gate — the entire reason for the four-verdict split (ADR 0011) — is unexercised. | manifest health distributions; `SKILL_AUDIT_LOOP.md:80` | Run gate-8 comprehension grading on the 68 eligible skills; author ≥1 gate-9 application eval as a worked specimen. The single biggest gap between the loop's design and its operation. |
| A2 | MEDIUM | eval coverage | `eval_artifacts`: present 31 / planned 111 / none 1; `eval_state` passing only 7. The discipline requires ≥7 scenarios + ≥1 negative expectation each. 111/143 skills have evals only *planned* — the loop can't evaluate what doesn't exist. | manifest health | Prioritize eval authoring for high-centrality skills; track present/planned ratio. |
| A3 | MEDIUM | MLOps maturity self-location | Integrity Gate (lint/drift/manifest/routing in CI) ≈ **Level 1**. Behavior Gate ≈ **Level 0**: the "continuous training" analog (re-grading skills as models/artifacts drift) is manual, unrun, and `evolve` (the corpus-walker = the CT loop) is non-functional standalone. The discriminating capability that would lift quality to L1 is absent. | mlops-maturity lens vs A1/G6 | State the split honestly; path to L1 = a runnable `evolve` + ≥1 application grader in CI. |
| A4 | MEDIUM | verdict rollup | Two of four verdicts are live (structural ← lint_verdict, truth ← drift_status — both run corpus-wide); two (comprehension, application) require graders that have never run, so they are permanently UNVERIFIED until then. The four-verdict split is well-justified (it refuses to let form masquerade as quality — a design PASS) but half the model is currently inert. | `SKILL_AUDIT_LOOP.md:86-96`; manifest | Pairs with A1 — running the graders activates the inert half. |
| A5 | LOW | walker duplication | The `evolve` priority algorithm references two copies of the walker: `scripts/skill/skill-evolution-loop.js` (monorepo) and `lib/audit/skill-evolution-loop.js` (skill-graph copy). Two copies = drift risk. | `SKILL_AUDIT_LOOP.md:142-150` | Confirm the copies are in sync or designate one canonical. |
| A6 | INFO (PASS) | audit doctrine | The doctrine is high quality and internally consistent: "not a lint-test factory," empty findings = PASS, Integrity floor vs Behavior target separation, Karpathy one-field-keep-or-revert. The lint reduction 11→4 checks (commit `2bd8e64`) correctly moved project-internal opinions out of the external-mandate gate. | `SKILL_AUDIT_LOOP.md:13-31`; `SKILL_GRAPH.md:149` | None — state as PASS. |

---

## LAYER 4 — Docs & ADRs (cross-cutting)

Lenses: editorial-standards, pyramid-principle, adr, toulmin-argument.

| ID | Sev | Surface | Problem | Evidence | Action |
|---|---|---|---|---|---|
| D1 | MEDIUM | single-source blocks | The "single source of truth" blocks exist (right intent) but drift anyway because numbers are hand-copied — count (G4) and others restated independently in AGENTS.md/README. The pyramid/single-source mechanism (manual restatement) defeats itself. | `SKILL_GRAPH.md:11-21` + restatements | Generate the canonical numbers; have prose reference the generated artifact. |
| D2 | LOW | version string | `SKILL_METADATA_PROTOCOL.md:3` header claims "Skill Graph 0.6.0"; `package.json` is `0.5.8` and AGENTS.md/README say 0.5.8. The protocol doc advertises a release that doesn't exist. | grep of version refs | Reconcile to 0.5.8 (or whatever the real current release is). |
| D3 | INFO (PASS) | ADR coverage | ADR set is strong and traceable (0001 predicates, 0006 boundary/disjoint_with revision, 0009 consolidation, 0011 four-verdict). Toulmin check on ADR 0011: the warrant ("aggregate masquerades as quality") is explicit and backed. | `docs/adr/*` | None — state as PASS. |

---

## Recommended priority order (preserves every finding)

Ordering only — nothing dropped. The human decides what to cut.

1. **A1** — run the Behavior Gate on the 68 eligible skills + 1 gate-9 specimen. (Closes the project's central gap; activates A4.)
2. **G2** — fix the showcase routing query (the demo of the tentpole tool misfires).
3. **G1** — expand routing-eval coverage beyond 5.6%.
4. **P1** — fix the JSON-LD `boundary` term collision (breaks the RDF-projection promise).
5. **G4 / D1 / D2** — fix the drifted single-source numbers (count 142→143, release 0.6.0→0.5.8) and make them generated.
6. **P5** — document the dual encoding in the normative spec.
7. **P2 / P3 / P4** — fix the stale JSON-LD `_note`s and version metadata.
8. **G3** — fix the real `skill-infrastructure` drift; document drift's near-zero coverage rationale.
9. **P9** — reconcile the `boundary` name/convention with its inverting mechanic.
10. **P12 / G7** — router-archetype specimen (or mark reserved); add the missing top-overlap relation edges.
11. **A2 / A3 / A5** — eval-authoring backlog; MLOps self-location doc; de-duplicate the evolve walker.
12. **P6 / P7 / P11 / P13 / G6** — content-label enforcement decision; dead JSON-LD terms; category-balance note; stability-promotion pass; gate `evolve` in the CLI.

**PASS findings (no action — stated to honor "an empty report on a sound artifact is a PASS"):**
P8 (predicate ontology), P10 (foundations gate holding), G5 (manifest projection fidelity),
A6 (audit doctrine quality), D3 (ADR traceability). The deterministic Integrity Gate is in
genuinely excellent shape; do not manufacture defects there.

## Guardrail compliance

- **Enrich, never trim:** every recommendation adds coverage/correctness; none removes capability.
- **Advisory ≠ defect:** overlap (G7) treated as recall; the only action is *adding* edges, never deleting keywords.
- **Honest states stay honest:** A1/A4 explicitly forbid stamping verdicts; the v5/v7 label backlog (P6) is migration work, not a string to replace.
- **Findings completeness:** all 25 findings shown with a severity column; prioritization is separate and additive.
- **No manufactured defects:** 5 explicit PASS findings recorded.
- **Verify before claiming:** every row cites a command output or `file:line`.
- **Report-only:** the review (this file) was report-only; remediation below was a separate, user-authorized step.

---

## Resolution log (updated 2026-05-21 — remediation authorized by the user)

Research that informed the fixes: `docs/research/design-review-best-practices-2026-05-21.md`.

### Solved & committed (batch 1 — commit `bb69c6a`)
- **P1** — `boundary` JSON-LD term collision fixed via a JSON-LD 1.1 property-scoped `@context` (`relations.boundary` → `sg:disjointOwnership`; top-level `boundary` → new `sg:conceptBoundary`). C8 still passes.
- **P2, P3, P4, P7** — corrected stale JSON-LD `_note` enums/scale, context version metadata (→ v7), and annotated non-v7 terms.
- **P5, P6** — documented the dual physical encoding + `normalizeFrontmatter` precedence + the `skill_graph_protocol` invisibility, in `SKILL_METADATA_PROTOCOL.md § Overview`.
- **G4, D1** — skill count 142 → 143 across three docs; regenerated `skills.manifest.json` (local) + `docs/status.generated.md` (now 143/v7); prose now points at the generated status doc.
- **D2** — protocol version string 0.6.0 → 0.5.8.

### Solved & committed (batch 2)
- **A3** — added an honest MLOps self-location to `SKILL_AUDIT_LOOP.md` (Integrity Gate ≈ L1, Behavior Gate ≈ L0; gate-9 has never run; path to L1).

### Started — gate-9 application grader (batch 3, A1 foundation)
- **A1 (in progress)** — confirmed gate 9 is unimplemented (no application grader prompt, no `evals/application.json`, no `--mode application` path). Authored the foundation: `lib/audit/graders/application-comparative-grader-prompt.md` (A/B with-skill-vs-baseline, CoT, boolean per-criterion → the 6-value `application_verdict` enum, BARS anchors, calibration gate) and a worked specimen `examples/evals/application.sample.json` for `database-migration` (incl. a FALSE_POSITIVE probe). **Remaining wiring:** the `evaluate-skill.js --mode application` execution path + reconciling the grader-prompt path divergence (`scripts/skill/graders/` vs `lib/audit/graders/` — finding A5) + calibration on a ~10-skill human-agreement set before any verdict certifies. Sibling-repo `skills/<name>/evals/application.json` authoring is the per-skill follow-on.

### Corrected after verification (no change needed)
- **G6** — NOT a defect. `bin/skill-graph.js:514-522` already gates `evolve` with a clear capability-unmet message AND exits 1. The original `exit:0` reading was a pipe artifact (`head`'s exit code). Stated plainly per the no-manufactured-defects guardrail.

### Deferred — separate work stream (reason stated, design captured)
- **A1, A2** (HIGH/MED) — run the Behavior Gate (gate-8 on the 68 Understanding-eligible skills + a gate-9 application specimen) and the eval-authoring backlog. Requires model graders + the `evolve` walker (SH-6138, monorepo-only). Grader design captured in the research doc § 3. Honest constraint: must not stamp verdicts without receipts.
- **G1, G2, G7, G3** — routing-coverage expansion, the showcase-query mis-route fix, the `data-modeling ↔ entity-relationship-modeling` relation edge, and the real `skill-infrastructure` drift re-record. All edit the **sibling public release repo** (`~/Development/skills/`) — a separate repo + separate commit + potential marketplace re-export; best done with that repo as the working context. Routing-eval design captured in the research doc § 2.
- **A5** — confirm the two `skill-evolution-loop.js` copies are in sync (cross-repo verification).
- **P9** — `relations.boundary` name-vs-mechanic inversion is already *documented* (`SKILL_METADATA_PROTOCOL.md:400`); fully reconciling it means renaming a relation predicate = a breaking schema change requiring a `schema_version` bump + migration. Out of scope for a non-breaking pass.
- **P11, P12, P13** — low-severity clarity notes (category balance; `router`/`codebase` archetypes unpopulated; `stability` near-uniformly `experimental`). P13 specifically should NOT assert "intentional" without verifying intent.
- **Marketplace surface** — `marketplace/README.md` shows 142 (one behind the 143-skill library). Regenerating is a deliberate release-sync action; fold into the next sync.
