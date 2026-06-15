# Routing Metrics

> Read this if you need to prove that Skill Metadata Protocol improves routing,
> or if you need to debug which skills are confused with one another.

Routing quality is an information-retrieval problem. A clean skill graph is not
proved by "the router felt right"; it is proved by held-out prompts, hard
negatives, confusion pairs, and repeatable metrics.

## Semantic Embedding Index — Body Text Baseline (SKI-53, 2026-06-05)

**Change:** `scripts/skill/skill-embedder.js` now indexes skill body text (markdown
content after the closing `---` frontmatter delimiter) in addition to
`name + description + keywords`. This feeds `scripts/discovery/skill-embeddings.json`,
which powers the TF-IDF cosine-similarity path in `scripts/skill/skill-router.js`
(`includeSemantic: true`, the default).

> **Location note:** `skill-embedder.js` and `skill-router.js` are **workspace** scripts (`~/Development/scripts/skill/`), not part of this skill-graph repo. They are the workspace semantic-routing path, distinct from skill-graph's own manifest router at `scripts/skill-graph-route.js`.

| Metric | Before (name+desc+kw only) | After (+ body text) | Delta |
|---|---|---|---|
| Total indexed terms | 3,955 | 16,163 | **+4.09×** |
| Skills indexed | 166 | 167 | +1 (new skill added) |
| Sample query — "tests pass locally but fail in CI" | *(no semantic match above threshold)* | `integration-test-design` @1, `e2e-test-design` @2 | FIXED |
| Sample query — "accessibility keyboard navigation" | `a11y` @1 | `a11y` @1 | unchanged |
| Sample query — "SSE or WebSocket" | *(no semantic match above threshold)* | `streaming-architecture` @1 | FIXED |

The 4× term-vocabulary expansion means the semantic router can now find skills
based on the procedural guidance in their body (e.g. "CI/CD" in
`integration-test-design`, "WebSocket" in `streaming-architecture`) rather than
only on the hand-authored frontmatter metadata.

**Router used:** `scripts/skill/skill-router.js` (semantic/TF-IDF cosine path).
This is the workspace skill resolver used by the Claude injector, manage solver,
OpenCode lanes, and design audit workers. It is a separate router from the
`skill-graph-route.js` manifest router below.

---

## Manifest-Based Router Baseline (skill-graph-route.js, 2026-06-05)

**Baseline:** `evals/retrieval-baseline-v2.json` — 64 stratified queries across 5 categories
(agent: 11, engineering: 26, quality: 12, design: 11, foundations: 4).

| Metric | Value | Evidence |
|---|---|---|
| Queries evaluated | 64 | `node scripts/skill-graph-routing-eval.js --baseline evals/retrieval-baseline-v2.json --only-asserted` |
| Recall@1 | **71.9%** (46/64) | 10 misses not in top-3, 8 hits at @3 only |
| Recall@3 | **84.4%** (54/64) | 10 total misses (not in top-3) |
| Coverage: `routing_eval: present` | 15/167 skills | 15 asserted; 1 PASS, 14 FAIL |

This router uses activation `keywords`, `triggers`, and `paths` from the compiled
manifest — NOT the embeddings file. Its Recall@1 decline from the prior
2026-05-24 baseline (96.9% / 62/64) is due to corpus expansion (147→167 skills) and
new skills whose `keywords`/`relations.suppresses` declarations need tuning. The body-text
embedding change (SKI-53) does not affect this router.

**Per-skill activation eval (asserted skills only, 2026-06-05):**

```
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix
```

Result: 1/15 PASS, 14 FAIL — suppression-edge and positive-case coverage gaps requiring
per-skill `keywords`/`relations.suppresses` updates (separate CONTENT-mode work).

**Archived: 2026-05-24 Manifest Router Baseline**

This prior baseline used an older corpus (147 skills, 9 with `routing_eval: present`):

| Metric | Value |
|---|---|
| Recall@1 | 96.9% (62/64) |
| Recall@3 | 100.0% (64/64) |
| Coverage | 9/147 skills |

Misses were: `sharding-strategy` (top-1: agent-engineering) and `visual-design-foundations`
(top-1: frontend-architecture).

---

## Baseline-covered skills eligible for `routing_eval: present`

54 unique baseline skills hit at Recall@1 in the 2026-05-24 baseline but are not yet marked `routing_eval: present`.
Their canonical `SKILL.md` files live in the sibling `skills` repo
(`~/Development/skills/skills/`). Flipping the label requires a commit in that repo;
this metric doc records the eligibility so the flip can be done in a follow-on task.

Eligible (54 skills, alphabetical):
`acid-fundamentals`, `agent-engineering`, `ai-native-development`, `api-design`,
`cap-theorem-tradeoffs`, `color-system-design`, `component-architecture`,
`connection-pooling`, `constraint-awareness`, `context-engineering`, `contract-testing`,
`dark-mode-implementation`, `data-modeling-fundamentals`, `database-migration`,
`dependency-architecture`, `e2e-test-design`, `error-tracking`, `form-ux-architecture`,
`generative-ui`, `information-architecture`, `interaction-feedback`, `mental-models`,
`mutation-testing`, `ontology-modeling`, `owasp-security`, `pattern-recognition`,
`performance-budgets`, `performance-testing`, `printify`, `project-knowledge-extraction`,
`prompt-craft`, `prompt-injection-defense`, `prototyping`, `query-optimization`,
`rendering-models`, `replication-patterns`, `route-handler-design`, `security-fundamentals`,
`server-actions-design`, `server-components-design`, `shopify`, `skill-infrastructure`,
`skill-scaffold`, `snapshot-testing`, `state-machine-modeling`,
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
| False-positive rate | Anti-examples route back to the skill they are meant to avoid. | Finds over-broad skills and missing `relations.suppresses` edges. |
| Coverage gaps | Anti-examples avoid the wrong skill but route nowhere. | Finds missing sibling skills or weak target descriptions. |
| Confusion pairs | `expected -> actual` misses between nearby skills. | Shows which boundary or description needs tightening. |

## Current Harness

Run the stratified retrieval baseline (Recall@1 / Recall@3 / coverage):

```bash
node scripts/skill-graph-routing-eval.js --baseline evals/retrieval-baseline-v2.json --only-asserted
```

The `--only-asserted` flag limits the per-skill activation suite to skills that
claim `routing_eval: present`; the 64-query retrieval baseline still runs in
full. Running the baseline command without that flag also evaluates the full
per-skill corpus and may exit nonzero because most skills have not earned
`routing_eval: present` yet.

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
| `pass_boundary_target` | Anti-example routed to a declared suppression target. The output key is retained by the harness; the authored edge is `relations.suppresses`. |
| `coverage_gap` | Anti-example avoided this skill but no other skill won. |
| `self_hit` | Anti-example routed back to the skill under test. This is a hard false positive. |
| `off_boundary_hit` | Anti-example routed to some other skill not named in `relations.suppresses`. |

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
4. **Graph post-processing:** apply `relations.suppresses` to suppress wrong
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
governance, filtering, suppression-edge, eval, and trust layer around a full-text
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
