# Routing Metrics

> Read this if you need to prove that Skill Metadata Protocol improves routing,
> or if you need to debug which skills are confused with one another.

Routing quality is an information-retrieval problem. A clean skill graph is not
proved by "the router felt right"; it is proved by held-out prompts, hard
negatives, confusion pairs, and repeatable metrics.

## What To Measure

| Metric | Meaning | Why it matters |
|---|---|---|
| Precision@1 | The expected skill is the top-1 selected skill. | Main user-visible correctness signal. |
| Precision@3 | The expected skill appears in the first three selections. | Useful when co-loading or human choice is acceptable. |
| Positive recall by skill | Each skill's positive examples route back to that skill. | Finds invisible skills with weak descriptions or keywords. |
| False-positive rate | Anti-examples route back to the skill they are meant to avoid. | Finds over-broad skills and missing `relations.boundary` edges. |
| Coverage gaps | Anti-examples avoid the wrong skill but route nowhere. | Finds missing sibling skills or weak target descriptions. |
| Confusion pairs | `expected -> actual` misses between nearby skills. | Shows which boundary or description needs tightening. |

## Current Harness

Run all asserted routing evals:

```bash
node scripts/skill-graph-routing-eval.js --only-asserted
```

Show the confusion matrix:

```bash
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix
```

JSON output for CI or dashboards:

```bash
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix --json
```

The positive-case matrix is `expected skill -> actual top-1 winner`. The
negative-case summary counts:

| Count | Meaning |
|---|---|
| `pass_boundary_target` | Anti-example routed to a declared boundary target. |
| `coverage_gap` | Anti-example avoided this skill but no other skill won. |
| `self_hit` | Anti-example routed back to the skill under test. This is a hard false positive. |
| `off_boundary_hit` | Anti-example routed to some other skill not named in `relations.boundary`. |

## Baseline Recommendation

For public claims, keep two routing runs:

1. **Description-only baseline.** Route using only `name` and `description`.
2. **Skill Graph routing.** Route using examples, anti-examples, paths,
   keywords, eval state, project tags, and relations.

Then report the delta in Precision@1, false-positive rate, and confusion pairs.
The strongest proof for the protocol is not "metadata exists"; it is "metadata
changed the routing outcome and reduced misses."

The reference router does not yet ship a description-only baseline mode. Until
it does, use the current harness as the enforced correctness gate and treat
before/after routing traces as qualitative evidence.

## Scaling Limits

The reference router is deliberately simple and metadata-first. That is the
right shape for curated libraries where explainability, authored boundaries,
and deterministic linting matter more than maximum recall.

For very large skill pools, metadata-only routing should not be the only
retrieval layer. The 2026 SkillRouter paper, "Retrieve-and-Rerank Skill
Selection for LLM Agents at Scale" (<https://huggingface.co/papers/2603.22455>),
reports that removing the skill body caused a 29-44 percentage-point routing
drop across retrieval methods on an approximately 80K-skill pool, and that
cross-encoder attention concentrated heavily on the skill body.

Practical rule:

| Library size / shape | Suggested routing architecture |
|---|---|
| 1-10 skills | Base descriptions are usually enough. |
| 10-200 curated skills | Skill Graph metadata, relations, and evals can be the primary routing layer. |
| Hundreds to thousands of mixed-source skills | Use Skill Graph as the authoring, eval, grounding, and governance layer; pair it with full-text retrieve-and-rerank over skill bodies. |
| Tens of thousands of community skills | Use a learned retriever/reranker over full skill text; consume Skill Graph metadata as filters, labels, eval targets, and trust signals. |

Owning this limit makes the project more credible: Skill Graph is the contract
and operations layer for serious skill libraries, not a claim that frontmatter
alone solves web-scale retrieval.
