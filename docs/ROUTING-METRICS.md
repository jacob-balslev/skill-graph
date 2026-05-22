# Routing Metrics

> Read this if you need to prove that Skill Metadata Protocol improves routing,
> or if you need to debug which skills are confused with one another.

Routing quality is an information-retrieval problem. A clean skill graph is not
proved by "the router felt right"; it is proved by held-out prompts, hard
negatives, confusion pairs, and repeatable metrics.

## Baseline Results (Updated 2026-05-22)

**Baseline:** `evals/retrieval-baseline-v2.json` — 64 stratified queries across 5 categories
(agent: 11, engineering: 26, quality: 12, design: 11, foundations: 4).

| Metric | Value | Evidence |
|---|---|---|
| Queries evaluated | 64 | `node scripts/skill-graph-routing-eval.js --baseline evals/retrieval-baseline-v2.json` |
| Recall@1 | **96.9%** (62/64) | 2 misses: `sharding-strategy`, `visual-design-foundations` |
| Recall@3 | **100.0%** (64/64) | All queries hit within top-3 |
| Coverage: `routing_eval: present` | 11/143 skills | 11 asserted; all 11 PASS in per-skill activation eval |

**Per-skill activation eval (asserted skills only):**

```
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix
```

Result: 11/11 PASS, 0 FAIL — all positive cases route to the declared skill;
all 39 negative cases route to a named boundary target (0 self-hits, 0 off-boundary hits).

**Misses at Recall@1 (hit at Recall@3 only):**

| Query ID | Expected skill | Actual top-1 |
|---|---|---|
| engineering-024 | `sharding-strategy` | `agent-engineering` |
| design-008 | `visual-design-foundations` | `frontend-architecture` |

These two skills are not eligible for `routing_eval: present` until the miss is resolved.
All other 53 skills in the baseline (including the 11 already marked `present`) hit at Recall@1.

**Baseline-covered skills eligible for `routing_eval: present`:**

51 skills hit at Recall@1 in this baseline but are not yet marked `routing_eval: present`.
Their canonical `SKILL.md` files live in the sibling `skills` repo
(`~/Development/skills/skills/`). Flipping the label requires a commit in that repo;
this metric doc records the eligibility so the flip can be done in a follow-on task.

Eligible (51 skills, alphabetical):
`acid-fundamentals`, `agent-engineering`, `ai-native-development`, `api-design`,
`cap-theorem-tradeoffs`, `color-system-design`, `component-architecture`,
`connection-pooling`, `constraint-awareness`, `context-engineering`, `contract-testing`,
`dark-mode-implementation`, `data-modeling-fundamentals`, `database-migration`,
`dependency-architecture`, `e2e-test-design`, `error-tracking`, `form-ux-architecture`,
`generative-ui`, `information-architecture`, `interaction-feedback`, `mental-models`,
`mutation-testing`, `ontology-modeling`, `owasp-security`, `pattern-recognition`,
`performance-budgets`, `performance-testing`, `printify`, `project-knowledge-extraction`,
`prompt-craft`, `prompt-injection-defense`, `prototyping`, `query-optimization`,
`rendering-models`, `replication-patterns`, `route-handler-design`, `server-actions-design`,
`server-components-design`, `shopify`, `snapshot-testing`, `state-machine-modeling`,
`state-management`, `streaming-architecture`, `theme-system-design`, `tool-call-flow`,
`tool-call-strategy`, `transaction-isolation`, `version-control`, `visual-hierarchy`,
`webhook-integration`.

---

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

Run the stratified retrieval baseline (Recall@1 / Recall@3 / coverage):

```bash
node scripts/skill-graph-routing-eval.js --baseline evals/retrieval-baseline-v2.json
```

Run all asserted routing evals (per-skill activation examples / anti-examples):

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

## Routing Architecture Recommendation

Do not design production routing around `name` + `description` only. That is a
diagnostic ablation at most, not the best router shape.

The best-supported architecture for serious skill libraries is full-text,
retrieve-and-rerank routing:

1. **Candidate record:** index each skill as a structured document containing
   `name`, `description`, full body text, examples, anti-examples, paths,
   keywords, project tags, eval state, grounding, and relation edges.
2. **First-stage retrieval:** use sparse, dense, or hybrid retrieval over the
   full skill record. Field weights may prefer `name`, `description`, examples,
   and headings for precision, but the body must remain in the index.
3. **Second-stage reranking:** rerank the top candidates with a cross-encoder,
   LLM judge, or task-trained reranker that can inspect the full skill record.
4. **Graph post-processing:** apply `relations.boundary` to suppress wrong
   owners, co-load `verify_with`, respect `depends_on`, and surface coverage
   gaps where anti-examples route nowhere.
5. **Evaluation:** report Precision@1, Precision@3, false-positive rate,
   coverage gaps, and confusion pairs against held-out prompts.

For public claims, compare the full-text graph router against production
alternatives: current metadata router, hybrid sparse+dense retrieval, and
full-text reranking. A `name` + `description` run can be kept as a negative
control to show what information is lost, but it must not be presented as the
architecture this project is trying to optimize.

Recent routing and tool-retrieval papers support this direction:

- SkillRouter (arXiv:2603.22455) reports that hiding the full skill body causes
  a 31-44 percentage-point drop in routing accuracy on an approximately 80K
  skill benchmark, then proposes a compact full-text retrieve-and-rerank
  pipeline. <https://arxiv.org/abs/2603.22455>
- SkillRet (arXiv:2605.05726) shows that skill retrieval is still far from
  solved on realistic libraries and that task-specific retrieval training
  improves NDCG@10 materially over off-the-shelf retrievers.
  <https://arxiv.org/abs/2605.05726>
- ToolRet (arXiv:2503.01763) shows that conventional IR models perform poorly
  for large tool retrieval, and that retrieval quality directly affects
  tool-use task pass rate. <https://arxiv.org/abs/2503.01763>
- Tool-to-Agent Retrieval (arXiv:2511.01854) argues against routing only through
  coarse agent descriptions; representing fine-grained tool capabilities and
  metadata relationships improves Recall@5 and nDCG@5.
  <https://arxiv.org/abs/2511.01854>

## Scaling Limits

The reference router is deliberately simple and metadata-first. That is useful
for deterministic local validation, but it is not the final retrieval
architecture for large or mixed-source skill libraries. The production path is
full skill text plus Skill Graph metadata and relations.

For very large skill pools, metadata-only routing should not be the primary
retrieval layer. Skill Graph metadata remains valuable as the contract,
governance, filtering, boundary, eval, and trust layer around a full-text
retrieval system.

Practical rule:

| Library size / shape | Suggested routing architecture |
|---|---|
| 1-10 skills | Base descriptions are usually enough. |
| 10-200 curated skills | Skill Graph metadata, relations, evals, and full skill bodies should all be available to routing; deterministic metadata routing is acceptable only as a local validation harness. |
| Hundreds to thousands of mixed-source skills | Use Skill Graph as the authoring, eval, grounding, and governance layer; pair it with full-text retrieve-and-rerank over skill bodies. |
| Tens of thousands of community skills | Use a learned retriever/reranker over full skill text; consume Skill Graph metadata as filters, labels, eval targets, and trust signals. |

Owning this limit makes the project more credible: Skill Graph is the contract
and operations layer for serious skill libraries, not a claim that frontmatter
alone solves web-scale retrieval.
