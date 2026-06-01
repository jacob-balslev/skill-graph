# P0 + P1 — Deterministic Findings (adoption-independent)

> **⚠ CORRECTION (user directive, 2026-06-01) — read before using ANY routing number below.**
> The corpus was authored BEFORE the routing system was built. Therefore routing-ablation
> over the live corpus (the P1b table, the P4 leave-two-out, the P3a body-vs-meta arms)
> describes **the current router's WIRING, not field relevance** — it is downstream of our own
> authoring and is **NOT valid evidence for any keep/drop/consolidate verdict.** `keywords`,
> `triggers`, and every activation/classification field are **KEEP-BY-CONTRACT** — the benchmark
> gets no vote on removing them. The routing numbers are retained ONLY as a description of how
> today's router is wired (a form of consumer-dependency). Valid relevance evidence is invariant
> to both population and the self-authored routing outcome: consumer wiring (descriptive),
> gate-flip counterfactual, conceptual/dimensional need, and controlled injection on CONSTRUCTED
> probes. See `docs/plans/field-relevance-benchmark-2026-05-31.md § Methodology correction #2`.
>
> Field-Relevance Benchmark, Phases P0 + P1. All results are deterministic and free
> (0 model calls). Relevance is judged by **consumer-dependency** + **counterfactual
> outcome change** — never population, never self-authored routing outcome. Artifacts:
> `p1-consumer-map.json`, `p1-routing-ablation.json` (wiring-only). Regenerate:
> `node benchmarks/field-relevance/consumer-map.js`, `node benchmarks/field-relevance/routing-ablation.js`.

## P0 — field → dimension → machine, and the path-a decision

The 15 dimensions (CONCEPTUAL-MODEL.md v2) map to three measurement machines:
- **Machine R** (routing) — `keywords/triggers/paths/relations/subject` (+ a future body-aware path-a).
- **Machine B** (behavior) — Understanding fields + `scope` (LLM, deferred to P3b).
- **Machine C** (consumer/decision-gating) — everything else (verdicts, eval state, grounding, governance, distribution).

**path-a decision: SCOPE IT OUT for now.** Measuring "metadata marginal over body" needs a
body-aware retriever the repo does not have. Building one is a P2+ investment. P0/P1 therefore
report routing relevance for the **two deterministic metadata routers only** (path-b1 injector,
path-b2 routeSkills). Every routing verdict below is stamped path-b.

**Redundant pairs** (skill-overlap): 34 keyword-overlap groups, 0 trigger/path dups. Keyword
overlap is *recall*, not duplication — resolve with relation edges, never by deleting keywords
(per the keyword-overlap-is-recall memo). Candidate substitute-pair for P4 leave-two-out:
`triggers`+`keywords` (both feed scoreSkill).

## P1a — Consumer-dependency map (which code READS each field)

**Critical caveat — `manifest` is pass-through, not a decision.** `generate-manifest.js`
projects ~every field into the manifest, so "read by manifest" only means the field *reaches*
the manifest — it does not mean any consumer *acts* on the value. The load-bearing signal is the
**acting consumers**: `injector`, `router`, `export`, `lint`, `drift`, `graph`, `cgrader`.

**Two consumers live OUTSIDE the grep set** (so two fields look deader than they are):
- the **agent runtime / harness** reads `allowed-tools` (and the body) — not visible to these scripts.
- **skills.sh indexing** consumes the published marketplace surface.

Acting-consumer counts (manifest-only excluded):

| Acting consumers | Fields |
|---|---|
| **router + others (routing/gates)** | `keywords` (injector/router/graph), `triggers` (injector/router/graph), `relations` (router/export/lint/graph), `deployment_target` (router/export/lint), `paths` (injector/router), `subject` (lint/graph/cgrader), `structural_verdict` (router/export), `eval_state` (router), `application_verdict`/`truth_verdict` (router), `drift_check` (router/drift), `lifecycle` (injector/router/drift/graph), `grounding` (export/drift), `drift_status` (drift) |
| **cgrader (comprehension grader INPUT)** | `mental_model`, `purpose`, `analogy` (+ `boundary`/`subject` via cgrader). `misconception` = **0 consumers** (consistent with "not directly graded") |
| **export (publication)** | `anti_examples` (boundary synth), `description`, `scope`, `license?`, `deployment_target`, `grounding` |
| **manifest-only (pass-through → DECORATIVE candidates pending the gate test)** | `compatibility`, `marketplace_tier`, `portability`, `runtime_telemetry`, `urn`, `schema_version`, `owner`, `routing_bundles`, `superseded_by`, `taxonomy_domain`, `eval_score`, `eval_failed_ids`, `eval_artifacts`, `routing_eval`, `last_audited`, `freshness`, `comprehension_state`, `comprehension_verdict`, `lint_verdict`, `reviewed_at`, the alias fields |

⚠ Common-word fields (`name`/`description`/`scope`/`boundary`/`project`/`version`/`license`/`owner`/`stability`/`paths`/`examples`/`purpose`/`analogy`/`concept`/`repo`) were access-pattern-grepped but still merit manual confirmation. `marketplace_tier` shows **manifest-only, not export** — worth a targeted check that the publication path actually reads the tier.

## P1b — Routing ablation (path-b2 routeSkills, 64-query baseline, Recall@1 = 0.766)

| Ablated field | Recall@1 | ΔR@1 | Recall@3 | ΔR@3 | verdict (path-b2) |
|---|---|---|---|---|---|
| `keywords` | 0.031 | **−0.734** | 0.031 | **−0.859** | **LOAD-BEARING — the dominant routing signal** |
| `relations` | 0.766 | 0.000 | 0.938 | **+0.047** | **LOAD-BEARING via exclusion** (boundary edges suppress co-routing; removing them admits more candidates → R@3 up) |
| `triggers` | 0.766 | 0.000 | 0.891 | 0.000 | routing-CAPABLE, **unexercised** (no baseline query exact-matches a trigger — coverage gap, NOT dead) |
| `paths` | 0.766 | 0.000 | 0.891 | 0.000 | routing-CAPABLE, **unexercised** (scoreSkill scores paths only with `--path`; NL baseline passes none) |
| `examples` | 0.766 | 0.000 | 0.891 | 0.000 | **NOT a score input** (it IS the eval's test cases, not a routing signal) |
| `anti_examples` | 0.766 | 0.000 | 0.891 | 0.000 | **NOT a score input** (hard-negatives + export boundary synth, not scoring) |
| `subject` | 0.766 | 0.000 | 0.891 | 0.000 | **NOT a score input** (browse/classification/graph, not routeSkills scoring) |
| `scope` | 0.766 | 0.000 | 0.891 | 0.000 | **NOT a score input** (human when-to-use; export) |
| `description` | 0.766 | 0.000 | 0.891 | 0.000 | **NOT a score input** for THIS keyword router (a body/description-aware path-a router would differ — SkillRouter's 31–44pp body finding applies to path-a, which isn't built) |

## P1c — Gate-flip catalog (decision-gating, from schema `allOf` + export/lint consumers)

A field is LOAD-BEARING-by-gating if changing its value flips a pipeline outcome (deterministic, from the schema's `allOf` rules and the export/lint consumers):

| Field value | Flips |
|---|---|
| `deployment_target: project` | requires `grounding` (lint) + excludes from marketplace export (publication gate) |
| `stability: deprecated` | requires `superseded_by` (lint) |
| `comprehension_state: present` | requires the 5 Understanding fields (lint) |
| `eval_state: passing`/`monitored` | requires `eval_artifacts: present` (lint allOf) |
| `subject` + `subjects` | requires `subjects[0] == subject` (lint) |
| `structural_verdict: FAIL` | router demotion + export block (router/export read it) |
| `grounding_mode: repo_specific` | marketplace export exclusion (publication gate) |

## Preliminary verdicts (path-stamped; LLM phases pending)

- **LOAD-BEARING (proven this phase):** `keywords` (routing, dominant), `relations` (routing-exclusion + graph/lint/export), `deployment_target` (gate), `grounding` (drift + publication gate), `structural_verdict` (router/export gate), `eval_state` (gate), `stability`/`superseded_by` (gate), `subject` (classification/graph/lint + cgrader), `comprehension_state` (gate), the Understanding fields `mental_model`/`purpose`/`analogy`/`boundary` (cgrader INPUT — per the just-landed comprehension framing fix), `drift_check`/`drift_status` (drift), `lifecycle` (staleness).
- **CAPABLE-BUT-UNEXERCISED (coverage gap — needs P2 baseline expansion to verdict):** `triggers`, `paths`.
- **NOT-A-ROUTING-SIGNAL, relevance elsewhere:** `examples`/`anti_examples` (eval cases + export), `description`/`scope` (human + export + future path-a).
- **DECORATIVE candidates (manifest-only, no acting consumer — pending counterfactual confirm):** `compatibility`, `marketplace_tier`, `portability`, `runtime_telemetry`, `urn`, `routing_bundles`, `taxonomy_domain`, `owner`, the eval-bookkeeping fields, the alias layer.
- **`misconception`:** 0 consumers (not even the grader) — its only value is as a body-level authored inoculation hint; DECORATIVE as frontmatter metadata.
- **`allowed-tools`:** appears manifest-only here, but its real consumer is the **agent harness** (outside the grep set) — LOAD-BEARING by execution-gating, not decorative. Flagged so it isn't mis-verdicted.

## Completeness

Examined all 56 fields on consumer-dependency; 9 candidate routing fields on ablation; 7 gate
rules. Excluded from verdict: the LLM-path fields (behavior delta P3b, path-a routing P3a) and
the DECORATIVE candidates needing counterfactual confirmation (P1 next sub-step / P4). Population
counts excluded by design. No field given a final verdict from population.
