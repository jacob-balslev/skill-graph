# Best-Practices Research — Design-Review Remediation (2026-05-21)

> Web research gathered while solving the findings in
> `docs/plans/skill-library-as-lens-review-2026-05-21.md`. Captures the external
> best practices that informed the fixes (implemented and planned), with all
> source links. Routed here per `AGENTS.md § Document Routing Table` ("Research
> findings → docs/research/*.md").
> Last updated: 2026-05-21

## 1. JSON-LD 1.1 property-scoped contexts (informed P1 — the `boundary` term collision)

**Problem.** A single JSON-LD `@context` term resolves by key, not by nesting depth. So the
token `boundary` could not serve both the top-level Understanding field (a string) and the
`relations.boundary` routing predicate (an array) — both collapsed to one global term.

**Best practice.** JSON-LD 1.1 introduced **scoped contexts** specifically for this case: an
expanded term definition may carry a nested `@context` that redefines a key *only within that
property* (property-scoped) or *within that type* (type-scoped). Processing order is
property-scoped first, then embedded, then type-scoped.

Minimal pattern (the one applied to `schemas/skill.context.jsonld`):

```json
{
  "@context": {
    "relations": {
      "@id": "sg:relations",
      "@context": { "boundary": { "@id": "sg:disjointOwnership", "@container": "@set" } }
    },
    "boundary": { "@id": "sg:conceptBoundary" }
  }
}
```

Result: `boundary` at the top level → `sg:conceptBoundary` (the Understanding string);
`boundary` inside `relations` → `sg:disjointOwnership` (the routing predicate). Same authoring
surface, correct RDF projection for both senses.

### Sources
- [JSON-LD 1.1 (W3C Recommendation)](https://www.w3.org/TR/json-ld11/) — § Scoped Contexts; the normative definition of property- and type-scoped contexts.
- [JSON-LD 1.1 syntax (editor's draft)](https://w3c.github.io/json-ld-syntax/) — same content, working-group draft.
- [w3c/json-ld-api #380](https://github.com/w3c/json-ld-api/issues/380) — edge case: expansion of property-scoped contexts for nested properties (worth re-checking if we ever nest scoped contexts deeper).

## 2. Retrieval / RAG evaluation coverage (informs G1 — routing eval covers only 5.6% of the corpus)

**Best practice.**
- Core retrieval metrics: **Recall@k** (did the relevant items appear in the top-k), Precision@k, MRR, nDCG. Recall@k is the critical one for routing — missing the right skill is the failure that matters.
- **Test-set coverage:** stratify the query set by type — ambiguous, multi-hop, conversational, long-tail — so the baseline represents the domains the library claims to cover. "Evidence coverage" = do we retrieve *all* necessary sub-facts, not just one lucky hit.
- Combine golden (human-reviewed) queries with synthetic generation (Ragas/ARES) + human review.
- Tune k on validation performance (try k = 3, 5, 10 …); recall-oriented first-pass + reranker is the standard high-recall/high-precision pattern.

**Application to Skill Graph.** The routing eval should (a) track a coverage metric
(`routing_eval: present` / total) as first-class, (b) stratify the ≥30-query baseline by query
type, and (c) report Recall@1/Recall@3 of the router against human-labelled expected skills —
not just the current per-skill PASS/FAIL on 8 skills.

### Sources
- [How to Evaluate Retrieval Quality in RAG Pipelines: Precision@k, Recall@k, F1@k — Towards Data Science](https://towardsdatascience.com/how-to-evaluate-retrieval-quality-in-rag-pipelines-precisionk-recallk-and-f1k/)
- [A complete guide to RAG evaluation — Evidently AI](https://www.evidentlyai.com/llm-guide/rag-evaluation)
- [RAG Evaluation — Pinecone](https://www.pinecone.io/learn/series/vector-databases-in-production-for-busy-engineers/rag-evaluation/)
- [Evaluating the Retrieval Component in RAG — apxml](https://apxml.com/courses/getting-started-rag/chapter-6-evaluating-improving-rag-systems/evaluating-retrieval)
- [RAG Evaluation Metrics Explained: Recall@K, MRR, Faithfulness — langcopilot](https://langcopilot.com/posts/2025-09-17-rag-evaluation-101-from-recall-k-to-answer-faithfulness)

## 3. LLM-as-judge for behavioral evaluation (informs A1 — the gate-9 application grader design)

**Best practice.**
- The evaluator prompt defines the judge's role, an explicit checklist of criteria with
  **positive and negative behavior examples per criterion**, and the scoring format.
- **Boolean pass/fail is more reliable than fine-grained 1–10 scales** for rubric-based judges
  (lower judge variance). When a graded scale is needed, 1–5 is easier to anchor than 1–10.
- This pairs with the in-repo `evaluation` skill's **BARS** guidance: concrete behavioral
  anchors + worked examples cut central-tendency bias (~28%) vs vague labels; scale format alone
  shifts scores ~1.5 points (arXiv 2506.22316).
- Use **Chain-of-Thought** — judge reasons step-by-step before the verdict.
- **Calibrate to >85% agreement** with a human reviewer on a small calibration set before trusting the judge.
- **Rubric drift is an attack/decay surface** — "criterion-preserving" edits can silently steer
  verdicts; pin rubrics to fixed human reference points and version them.

**Application to Skill Graph (gate 9 / `application_verdict`).** Design the application grader as:
load-skill-vs-no-skill A/B on a real artifact → CoT → boolean per-criterion checklist →
roll up to the `APPLICABLE | REDUNDANT | HARMFUL | MIXED | FALSE_POSITIVE | UNVERIFIED` enum.
Calibrate the judge against human verdicts on a ~10-skill sample before stamping any verdict;
never stamp `APPLICABLE` without an `eval_last_run` receipt (the honest-states rule). External
corroboration that this gate matters: SkillsBench (arXiv 2602.12670) found 19% of agent skills
produce negative deltas — exactly the `HARMFUL`/`REDUNDANT` cases gate 9 exists to catch.

### Sources
- [LLM-As-Judge: 7 Best Practices & Evaluation Templates — Monte Carlo](https://montecarlo.ai/blog-llm-as-judge/)
- [LLM as a Judge: Guide to Evaluation & Best Practices — Agenta](https://agenta.ai/blog/llm-as-a-judge-guide-to-llm-evaluation-best-practices)
- [LLM Evaluators: Tutorial & Best Practices — Patronus AI](https://www.patronus.ai/llm-testing/llm-evaluators)
- [Exploring LLM-as-a-Judge — Weights & Biases](https://wandb.ai/site/articles/exploring-llm-as-a-judge/)
- [How to Calibrate LLM-as-a-Judge with Human Corrections — LangChain](https://www.langchain.com/articles/llm-as-a-judge)
- [Rubrics as an Attack Surface: Stealthy Preference Drift in LLM Judges — arXiv 2602.13576](https://arxiv.org/pdf/2602.13576)
- [Judge's Verdict: LLM Judge Capability Through Human Agreement — arXiv 2510.09738](https://arxiv.org/pdf/2510.09738)
