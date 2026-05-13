# Skill Retrieval Evidence

> Status: research notes for positioning and roadmap work.
> Last checked: 2026-05-13.

This note collects source-backed claims about skill and tool retrieval. Use it
when explaining why Skill Graph exists: large skill libraries need more than
names and short descriptions. They need full skill text, structured metadata,
relations, evals, grounding, and repeatable routing metrics.

## Evidence Bank

| Source | What the source says | Skill Graph implication |
|---|---|---|
| SkillRouter, arXiv:2603.22455 | Large skill registries make it infeasible to expose every skill at inference time. The paper reports that hiding full skill bodies caused a 31-44 percentage-point routing accuracy drop on an approximately 80K-skill benchmark, then proposes full-text retrieve-and-rerank routing. | Skill Graph should not optimize for `name` + `description` routing. The project should make full skill records easier to index, evaluate, rerank, and govern. |
| SkillRet, arXiv:2605.05726 | Skill retrieval remains underexplored and realistic retrieval is still far from solved. The benchmark has 17,810 public agent skills, 63,259 training samples, and 4,997 evaluation queries; task-specific retrieval training materially improves NDCG@10. | Skill Graph can be the structure layer for benchmarkable, trainable skill retrieval: taxonomy, semantic tags, examples, anti-examples, and eval state all become supervised signals. |
| ToolRet, arXiv:2503.01763 | Tool retrieval from large toolsets is a critical first step for LLM agents. The paper finds that strong conventional IR models perform poorly on tool retrieval and that low retrieval quality hurts task pass rate. | Skill routing is a real systems problem, not just prompt wording. Skill Graph should measure retrieval quality directly and treat routing errors as product failures. |
| Tool-to-Agent Retrieval, arXiv:2511.01854 | Routing through coarse agent descriptions can hide fine-grained tool capabilities. The paper improves retrieval by representing tools and parent agents in a shared vector space and traversing metadata relationships. | Skill Graph's relation edges and metadata are useful routing infrastructure, especially when a query matches a fine-grained capability that a coarse description would miss. |
| ToolLLM, arXiv:2307.16789 | ToolLLM collected 16,464 APIs and equipped the model with a neural API retriever so tools do not need to be selected manually. | Retrieval is part of scalable tool and skill ecosystems. Skill Graph should position itself as the contract that makes retrieval records explicit, auditable, and portable. |

## Positioning Statements

Use these as careful, source-backed positioning, not as final marketing copy:

- Skill retrieval is now a first-class agent infrastructure problem.
- Short descriptions are not enough for large or overlapping skill libraries.
- Full skill bodies carry routing signal that metadata-only systems miss.
- Structured metadata is still essential: it supplies filters, trust signals,
  boundaries, eval labels, grounding, and graph edges around full-text retrieval.
- Skill Graph turns a folder of Markdown skills into retrieval-ready records:
  title, description, body, examples, anti-examples, paths, taxonomy, relations,
  eval state, grounding, portability, and freshness.
- Skill Graph is not competing with learned retrieval. It gives learned
  retrieval better records, better labels, and better governance.

## Claims To Avoid

- Do not claim that frontmatter alone solves skill retrieval.
- Do not claim that `name` + `description` is an adequate production router for
  serious libraries.
- Do not claim that deterministic metadata routing beats trained rerankers at
  large scale unless this repo has measured that result.
- Do not cite routing metrics without naming the benchmark, skill pool size,
  and evaluation split.

## Product Direction

The strongest Skill Graph direction is a hybrid:

1. Make each skill a high-quality retrieval record: `name`, `description`, full
   body, examples, anti-examples, paths, tags, relations, eval status, and
   grounding.
2. Keep deterministic lint and protocol consistency checks as the contract gate.
3. Add routing evals that produce confusion pairs, false-positive rates, and
   coverage gaps.
4. Support full-text retrieve-and-rerank over skill bodies.
5. Use Skill Graph metadata as filters, labels, trust signals, and graph
   post-processing around learned retrieval.

## Sources

- SkillRouter: Skill Routing for LLM Agents at Scale - <https://arxiv.org/abs/2603.22455>
- SkillRet: A Large-Scale Benchmark for Skill Retrieval in LLM Agents - <https://arxiv.org/abs/2605.05726>
- Retrieval Models Aren't Tool-Savvy: Benchmarking Tool Retrieval for Large Language Models - <https://arxiv.org/abs/2503.01763>
- Tool-to-Agent Retrieval: Bridging Tools and Agents for Scalable LLM Multi-Agent Systems - <https://arxiv.org/abs/2511.01854>
- ToolLLM: Facilitating Large Language Models to Master 16000+ Real-world APIs - <https://arxiv.org/abs/2307.16789>
