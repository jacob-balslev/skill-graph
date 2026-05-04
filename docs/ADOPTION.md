# Adopting Skill Graph

> Should you adopt Skill Graph for your AI agent skill library? This page is a 1-screen decision tree. For the full mental model, read [`PRIMER.md`](PRIMER.md). For the contract details, read [`metadata-contract.md`](metadata-contract.md).

## Quick yes/no

You should adopt Skill Graph if your skill library has any of these properties:

1. **Two or more skills cover overlapping territory** and the agent routes to the wrong one.
2. **One skill is load-bearing for another** and you've silently broken the assumption.
3. **One or more skills are grounded in specific repo files** that change frequently.
4. **You run evals on skills** and want the router to respect quality.
5. **You're authoring skills for multiple projects** that share some and diverge on others.
6. **You need to verify a skill still matches reality** (drift detection on grounded claims).

If none of these apply, stay on base [Agent Skills](https://agentskills.io/specification). The extra fields are overhead without payoff until the library is large enough to produce the implicit graph.

## The 5-minute decision

| You have… | You want… | Recommendation |
|---|---|---|
| 1–10 skills, single project | A simple way to author and load instructions | Stay on Agent Skills; revisit later |
| 10+ skills, growing | Routing that respects relations + quality | **Adopt Skill Graph** |
| Skills grounded in repo files | Drift detection when truth sources change | **Adopt Skill Graph** (drift sentinel) |
| Multi-project workspace | Shared skills + project-specific overlays | **Adopt Skill Graph** (multi-root mode) |
| Skills shipped externally | Compatibility with Agent Skills consumers | **Adopt Skill Graph + use export transform** |
| Skills with formal evals | Honest routing claims (lint enforces) | **Adopt Skill Graph** (routing-eval check) |

## Cost-benefit summary

| You pay | You get |
|---|---|
| 13 required frontmatter fields per skill (vs Agent Skills' 2) | Typed relations enforced by lint |
| SHA-256 baselines for grounded skills | Drift detection at skill-level granularity |
| Cross-skill relation existence checks | Confident routing decisions, auditable by CI |
| Time-boxed `freshness` claims | Time-boxed credibility |
| Schema versioning discipline | Smooth migration story across breaking bumps |
| One export transform step before publishing externally | Round-trip compatibility with the base standard |

The fields you pay for cluster into 8 semantic purposes (Identity, Classification, Health, Eval Health, Activation & Routing, Relations, Grounding, Portability). The full anatomy is in [`metadata-contract.md § Anatomy`](metadata-contract.md).

## 5-minute quickstart

For the full conceptual primer read [`PRIMER.md`](PRIMER.md). To migrate your first skill from a valid Agent Skills file:

1. **Copy the template** — `cp examples/skill-template.md skills/<your-skill>/SKILL.md`. The template is a real, valid, schema-conformant Skill Graph skill whose subject is skill authoring itself; adapt by rewriting identity, description, body, and verification.
2. **Add the 13 required Skill Graph fields** — `schema_version: 3`, `version`, `type`, `browse_category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, plus your existing `name` and `description`. The template inline-comments each field.
3. **Strip the teaching annotations** — every `> **TEMPLATE NOTE:**` blockquote and `# TEMPLATE NOTE:` YAML comment must be removed before commit.
4. **Validate locally:**
   ```bash
   node scripts/skill-lint.js                     # schema + relations + evals + sections
   node scripts/check-contract-consistency.js     # cross-artifact parity
   node scripts/generate-manifest.js              # compile to a deterministic manifest
   node scripts/skill-graph-route.js --query "your test query"  # see routing in action
   ```
5. **If the skill is grounded in repo files**, record the drift baseline:
   ```bash
   node scripts/skill-graph-drift.js --record --apply skills/<your-skill>
   ```
6. **If you need to publish externally**, project back to Agent Skills shape:
   ```bash
   node scripts/export-skill.js skills/<your-skill>
   ```

If any step fails, the error message names the rule and the file. Lint output is the primary debugging surface; it's deliberately verbose.

## When to revisit your adoption decision

Re-evaluate the cost-benefit when:

- **Your library exceeds 20 skills.** Implicit graph density is hitting; explicit relations start paying back the authoring cost.
- **You hit a routing failure** that descriptions alone can't fix. `relations.boundary` and `relations.disjoint_with` exist for exactly this.
- **An eval reveals a quality gradient** you want to express in metadata. `eval_state` + `eval_artifacts` + `routing_eval` are the three orthogonal axes.
- **A grounded skill claims something the codebase no longer supports.** The drift sentinel will surface this — but only if you adopted it before the drift accumulated.
- **You start authoring skills for a second project** that shares some and diverges on others. Multi-root workspace mode + `project_tags` is built for this.

## What Skill Graph is *not*

To set expectations honestly:

- **Not a router.** Skill Graph ships a *reference* router (`scripts/skill-graph-route.js`) to demonstrate why the metadata exists. Production routers should consume the manifest and apply their own scoring. The reference router is intentionally simple.
- **Not a runtime.** Skill Graph defines the contract and ships the validators. It does not load skills into an agent at request time — that's the consumer's job.
- **Not a full ontology framework.** The relations are typed (boundary, related, broader, narrower, depends_on, verify_with) but Skill Graph does not implement OWL inference, satisfiability checking, or formal class subsumption. Use `ontology` skill if you need that.
- **Not a proprietary format.** The schema is JSON Schema; the contract is MIT-licensed. The export transform makes every skill round-trippable to the base Agent Skills format.

## Where to go next

| You want to… | Read |
|---|---|
| Understand the conceptual model | [`PRIMER.md`](PRIMER.md) |
| Look up a specific field's semantics | [`field-reference.md`](field-reference.md) |
| See a worked authoring example | [`../examples/skill-template.md`](../examples/skill-template.md) |
| Read the architecture and authority tiers | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| See which skills are recommended for a starter library | [`recommended-skills.md`](recommended-skills.md) |
| Set up CI integration | [`integrations/github-actions.md`](integrations/github-actions.md) |
| Decide between four overlapping taxonomy axes | [`field-decision-guide.md`](field-decision-guide.md) |

## Compatibility direction (one-paragraph honesty)

A Skill Graph SKILL.md is **not** automatically a valid Agent Skills file. The `compatibility` shape (object vs string) and the `name` pattern (allows `/` and `:` vs strict kebab-case) diverge. Going either direction requires a transform. Skill Graph → Agent Skills is automated via `scripts/export-skill.js` (flattens `compatibility` to a string, nests extensions under `metadata:`). Agent Skills → Skill Graph is a manual rewrite — you must add the 11 additional required fields. The two formats are *interoperable* via the transform, not *compatible* via shared shape.
