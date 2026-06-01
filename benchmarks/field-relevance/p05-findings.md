# P0.5 — Fresh Corpus Inventory: Findings

> Field-Relevance Benchmark, Phase 0.5. Re-derives per-field population from a real
> frontmatter parse (`normalizeFrontmatter`) over 159 canonical skills, replacing the
> stale Explore-pass priors. Raw data: `p05-inventory.json`. Regenerate:
> `node benchmarks/field-relevance/inventory.js`.

## ⚠ Framing correction (2026-05-31): population is NOT a relevance signal

**This file reports per-field POPULATION counts. Population measures our own authoring
habits, not a field's intrinsic worth — the corpus is self-authored.** Adoption is recorded
here as *operational context only* (e.g. "to use field X, N skills would need authoring"),
**never** as evidence that a field is relevant or dead. A field on 0 skills may be highly
useful but unauthored; a field on 159 skills may be dead weight we filled in dutifully.
Relevance is judged by consumer-dependency + controlled experiments, per
`CONCEPTUAL-MODEL.md`. Read every "overturned / confirmed-dead" label below as a *population*
statement, not a *relevance verdict*.

## Headline: population priors were wrong; the corpus is mid-migration

**Corpus = 159 skills** (not the 280/390 the Explore pass guessed). 0 parse failures.

### Population priors OVERTURNED (Explore pass undercounted; reality = widely authored — relevance still TBD by consumer/experiment)
| Field | Explore prior | **Real (P0.5)** | Verdict change |
|---|---|---|---|
| `taxonomy_domain` | 1 skill, DEAD | **138/159 (87%)** | NOT dead — among the most-adopted optional fields. GPT-5.5 was right. |
| `portability` | 1 skill, DEAD | **94/159 (59%)** | NOT dead. |

The Explore pass grepped top-level `^taxonomy_domain:` and missed the Agent-Skills **nested `metadata:` encoding** where these fields actually live. **Lesson: no benchmark phase may inherit a grep-based count; only `normalizeFrontmatter` counts are trusted.**

### Population: 0%-authored fields (UNAUTHORED — not "dead"; relevance decided by consumer-dependency, not this count)
`subjects` (polyhierarchy), `marketplace_tier`, `project`, `repo`, `runtime_telemetry`, `urn`, `superseded_by`, `eval_failed_ids` — **0/159 each.**
Alias layer confirmed unused: `allowed_tools` (0), nested `eval` (0), `reviewed_at` (0) — the corpus uses canonical spellings (`allowed-tools` 87%, flat `eval_*`, `freshness`). **Dropping the alias layer is empirically safe.**

### NEW surprises (not in any prior)
1. **`scope` is REQUIRED by v8 but populated on only 7/159 (4%) — and the corpus FAILS lint because of it.** Verified: `skill-lint.js` errors `scope is required by the v8 contract` on a sampled skill. The schema is ahead of the corpus (the "clean cut, schema-first" doctrine in action). → `scope` relevance is **unmeasurable by ablation on the current corpus**; verdict deferred to post-migration or measured only on the 7 populated skills. This is the semantic-debt confound (plan Risk #3), now quantified.
2. **`paths` populated on only 2/159 (1%).** Prior said LOAD-BEARING (injector scores on it). Even if the consumer is wired, the field is **LATENT** (capability-wired, near-zero adoption) — it cannot show a corpus-level routing delta. Verdict will be path-stamped: wired ≠ used.
3. **`comprehension_state` is INVARIANT** — 83 populated, all the same value → zero corpus information. Candidate DECORATIVE.
4. **The four audit verdicts carry low information:** `application_verdict`, `comprehension_verdict`, `structural_verdict`, `lint_verdict` each have only 2 distinct values across all 159 skills (near-constant — almost everything is one verdict). `truth_verdict` has 4. These are populated but barely vary → their *relevance is in decision-gating*, not in corpus information (measured by Machine C, not discriminability).
5. **Eval-receipt fields near-zero:** `eval_score` (2), `eval_last_run` (1), `last_changed` (4), `drift_status` (6). Largely unused.

## Adoption tiers (all 56 fields)
- **Universal (100%, required+audit):** name, description, subject, deployment_target, schema_version, version, owner, freshness, drift_check, eval_artifacts, eval_state, routing_eval, keywords, relations, + the 4 verdicts + lint_verdict (stamped by the audit loop, not authored).
- **High (50–99%):** last_audited (99), stability (99), license (98), anti_examples (90), examples (90), allowed-tools (87), **taxonomy_domain (87)**, triggers (62), **portability (59)**, compatibility (58), lifecycle (55), the 5 Understanding fields + boundary (52), concept (41, legacy).
- **Low (5–49%):** grounding (25%).
- **UNPOPULATED (<5%):** scope* (4%, REQUIRED), drift_status (4%), last_changed (3%), eval_score (1%), paths (1%), eval_last_run (1%), routing_bundles (1%), and the 0% set above. (* = required-but-unpopulated = corpus non-conformance, not field irrelevance.)

## Consequences for later phases
- **Coverage gate (P1):** any field <5% adoption gets a sub-population-only verdict; never a corpus-aggregate NULL read as DEAD. Applies to scope, paths, routing_bundles, drift_status, eval_score, last_changed, eval_last_run.
- **Drop list now has data behind it:** the 0%-adoption + 0-consumer fields (subjects, marketplace_tier, project, repo, runtime_telemetry, urn, superseded_by, eval_failed_ids, alias layer) are DEAD on both axes.
- **`taxonomy_domain` and `portability` removed from the drop list** — they are widely authored; their relevance now turns on whether any consumer reads them (P1 consumer-grep) and whether the value gates anything (Machine C).
- **A real SYSTEM finding fell out:** the corpus fails lint on required `scope`. That is CONTENT-mode migration work (drain via `/audit:*`), filed separately — not fixed here.
