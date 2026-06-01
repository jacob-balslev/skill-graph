# External Agent-Skill Ecosystem — Research Snapshot

> Type: Research (one-shot investigation). Date: 2026-06-01.
> Scope: external skills, tools, specs, and papers relevant to the three skill-system layers —
> Skill Metadata Protocol (SMP), Skill Graph (SG), Skill Audit Loop (SAL).
> Provenance: two parallel research agents (GitHub/awesome-lists/directories + HN/blogs/arXiv).
> Companion: the full local+external catalog lives in the session plan `adaptive-rolling-globe.md`.
> **Note:** folding specific findings into individual skills' `references/` is CONTENT work — do it
> via `/audit:improve`, not by hand-editing this doc into a skill. This file is the SYSTEM-safe record.

Theme codes: **KG** knowledge-graph · **ONT** ontology · **TAX** taxonomy · **SEM** semantics ·
**SMT** semiotics · **EVAL** evaluation/grading · **AUD** audit · **PROMPT** prompt engineering ·
**DOC** documentation · **INFRA** skill-library infra · **META** metadata/schema.

---

## 1. Tools directly comparable to our pipeline (evaluate before adopting)

| Tool | URL | What it is | Maps to | Flag |
|---|---|---|---|---|
| **agent-ecosystem/skill-validator** | github.com/agent-ecosystem/skill-validator | Go CLI: structural validation (frontmatter, token counts via o200k_base, unclosed fences, link resolution, **orphan-file reachability incl. Python import chains**), **content analysis** (imperative ratio, info density), **contamination analysis** (cross-language mismatch), and **LLM-as-judge `score evaluate`** on 6 SKILL.md dims (Clarity, Actionability, Token Efficiency, Scope Discipline, Directive Precision, **Novelty**) + 5 reference dims. Pre-commit hooks, GH Actions annotations, `review-skill` agent. | INFRA, EVAL, AUD, META — the closest external analog to our whole lint+grade pipeline | ADOPT-eval |
| **agent-sh/agnix** | github.com/agent-sh/agnix · agent-sh.github.io/agnix | "Linter + LSP for AI coding assistants." Validates SKILL.md/CLAUDE.md/AGENTS.md/hooks/MCP. **399–423 rules** (rules.json authoritative), CLI + LSP + IDE plugins, `--fix`, `--strict`, watch, JSON + **SARIF** (GitHub Code Scanning). | INFRA, META, AUD, DOC — upgrade candidate for `skill-lint.js` | ADOPT-eval |
| **sattyamjjain/verdict** | github.com/sattyamjjain/verdict | Offline (no-LLM, stdlib) auto-grader on **7 weighted dims** (Correctness .25, Completeness .20, Adherence .15, Actionability .15, Efficiency .10, Safety .10, Consistency .05), 11 domain rubrics, `Stop`/`SubagentStop` hooks, `/judge --against HEAD~1`, `/scorecard`, `/benchmark`. | EVAL, AUD — deterministic grading floor complementing our LLM grader | ADOPT-eval |
| **muratcankoylan/agent-skills-for-context-engineering** | github.com/muratcankoylan/Agent-Skills-for-Context-Engineering | 15 skills; most relevant: `evaluation` (deterministic checks/rubrics/regression), `advanced-evaluation` (LLM-judge scoring, pairwise, **rubric generation, bias mitigation**), `harness-engineering` (locked metrics, **novelty gates**, rollback), `bdi-mental-states` (RDF→beliefs). | EVAL, KG, ONT, PROMPT — maps 1:1 onto our audit doctrine + prompt-shape rule | INSPIRE |
| **lyndonkl/claude** | github.com/lyndonkl/claude | 7 GraphRAG skills: `knowledge-graph-construction`, `embedding-fusion-strategy`, `retrieval-search-orchestration`, `graphrag-system-design`, `graphrag-evaluation`, `data-schema-knowledge-modeling` (**ontologies**), `information-architecture` (**taxonomy**, card sort, tree testing). | KG, ONT, TAX, SEM, META — best external match for our SG + SMP modeling layers | INSPIRE |
| **obra/superpowers** + **superpowers-skills** | github.com/obra/superpowers | Core skills lib + `skills-search`. `meta/` skills: `writing-skills`, `testing-skills-with-subagents`, `sharing-skills`, **`gardening-skills-wiki`** (library maintenance). | INFRA, EVAL, DOC, META — closest analog to our meta-skill set + audit loop | INSPIRE |
| **glebis/claude-skills** | github.com/glebis/claude-skills | 65+ skills. `Ecosystem` (skill-health + staleness + **CLAUDE.md instruction drift** audit) ≈ our skill-census + drift; `Session Search` (semantic transcript search), `Skill Studio` (interview→spec), `Meta`, `Retrospective`. | INFRA, AUD, SEM, EVAL, META | INSPIRE |
| **K-Dense-AI/claude-scientific-skills** | github.com/K-Dense-AI/claude-scientific-skills | 140 science skills + 100+ DBs; large-corpus org pattern (scientific-skills.md index, examples.md). | INFRA, DOC | INSPIRE (org pattern) |

## 2. Spec, standards, and doctrine (the contract we extend)

- **Agent Skills Specification** — agentskills.io/specification · co-governed at github.com/agentskills/agentskills (incl. **`skills-ref`** Python validator). The open contract; the `metadata` map is where our v8 axes legally live under the public spec. (META) **[ADOPT — verify our export stays spec-valid]**
- **Evaluating skill output quality** — agentskills.io/skill-creation/evaluating-skills. The canonical **with-vs-without-skill delta** + **blind comparison** (LLM judge sees both versions, provenance hidden) + `timing.json` token/latency capture. This IS our Behavior Gate doctrine. (EVAL) **[ADOPT]**
- **anthropics/skills** — github.com/anthropics/skills. Reference corpus + **`skill-creator`** (interactive authoring + eval/grading/benchmark loop), `mcp-builder`, `doc-coauthoring`, the `docx/pdf/pptx/xlsx` document skills. (INFRA, META, DOC)
- **Equipping agents for the real world with Agent Skills** — anthropic.com/engineering/equipping-agents-... — progressive-disclosure design rationale. (META, DOC)
- **Knowledge graph construction with Claude (Cookbook)** — platform.claude.com/cookbook/capabilities-knowledge-graph-guide — structured-output extraction → entity resolution. (KG, ONT)
- **Edalex Rich Skill Descriptor (RSD) / OpenRSD** — edalex.com — a human-capability skill-typing standard; prior art for descriptor structure. (TAX, META)
- **Diátaxis** — diataxis.fr (+ /quality) — the tutorial/how-to/reference/explanation model behind skill body vs `references/`. (DOC)
- **Ubiquitous Language** — martinfowler.com/bliki/UbiquitousLanguage.html + DDD — the substantive prior art for naming/meaning (closest thing to applied semiotics). (SEM)

## 3. Directories / aggregators (query, don't enumerate)

- **agentskill.sh (skills.sh)** — 201k+ skills, package-manager model. **skillsdirectory.com** — 93k+ **security-verified** skills (50+ security rules / 10 threat categories), categories incl. Documentation, Code Review, Testing. **officialskills.sh** — official-team skills (anthropics, microsoft, figma, getsentry, google-labs, huggingface, trail-of-bits). Awesome-lists: VoltAgent, ComposioHQ, travisvn, karanb192 (notes KG/ontology/taxonomy/audit GAPS), sickn33, alirezarezvani (strong authoring-discipline convention). (INFRA)

## 4. Papers & high-signal references

### Skill ecosystem, routing, scaling (SG core)
- **arXiv:2603.02176** — Organizing/Orchestrating/Benchmarking Agent Skills at ecosystem scale (200→200K). **Tree-based retrieval approximates oracle skill selection** — the de-facto routing benchmark for a skill graph.
- **arXiv:2602.08004 / 2601.10338 / 2602.06547** — large skill-ecosystem censuses (~40k+ skills, "widespread intent-level redundancy"; 26% have ≥1 vulnerability) — justifies our overlap + safety lens.
- **arXiv:2511.01854** Tool-to-Agent Retrieval — fine-grained tool→agent retrieval beats coarse matching (+19.4% Recall@5). **arXiv:2502.07223** Graph RAG-Tool Fusion — structured tool dependencies (our `depends_on`). **arXiv:2410.14594** Toolshed.
- **arXiv:2602.20426** — Rewriting Tool Descriptions: **description quality dominates selection as the catalog scales** (validates the `description`/`scope` thesis). **arXiv:2603.13950** ToolFlood — overlapping descriptions dominate the embedding space (our keyword-overlap-is-recall + routing-collision concern).
- **arXiv:2604.02837** — Secure Agent Skills: architecture + **threat taxonomy** (methodology to mirror).
- **arXiv:2305.16291** Voyager — foundational ever-growing skill-library paper.

### LLM-as-judge: bias, calibration, rubrics (SAL core)
- **arXiv:2603.00077** Autorubric — **binary criteria → highest inter-rater reliability; ordinal scales should be 3–5 levels with behavioral anchors** (central-tendency bias on broad scales). Direct guidance for our BARS.
- **arXiv:2604.22891** self-preference bias — judges overrate their own output (why a single grader run is **PROVISIONAL, not PASS**). **arXiv:2406.07791** position bias. **arXiv:2411.15594** the LLM-as-judge survey. **arXiv:2601.08654** RULERS (locked rubrics, evidence-anchored, QWK). **arXiv:2507.08794** "one token to fool a judge" (adversarial fragility).
- **arXiv:2604.03809** representational collapse in multi-agent panels (our prompt-shape anchor; cosine 0.888, rank 2.17/3.0) + **2602.03794** diversity scaling + **2309.13007** ReConcile.
- Practitioner: Hamel Husain "LLM-as-a-Judge that drives results" (hamel.dev) · Veris "asking the wrong question" · Netflix synopses eval.

### HN threads worth reading
- Anthropic "Introducing Agent Skills" (id=45607117) · Simon Willison "bigger deal than MCP" (id=45619537, flags spec under-specified on metadata) · "Analysis of 4000 skills.md repos" (pradeep.md) · nori-lint "Linter for Skill.md" (id=47263327) · VeriContext "preventing stale documentation" (id=47145928, our drift concern) · "Taxonomy, Ontology, KG, and Semantics" talk (id=46209023) · Diátaxis (id=42325011, 514 pts).

---

## 5. How this maps to our layers + follow-ups

- **SMP:** our `description`/`scope` primacy is validated by arXiv:2602.20426 + ToolFlood. `keywords`-overlap-is-recall is exactly the ToolFlood tension — keep it a feature, fix collisions with relation edges.
- **SG:** tree-based retrieval (2603.02176) and tool-to-agent retrieval (2511.01854) are the routing-at-scale prior art beyond our portable `skill-router` — see the `capability-routing-at-scale` gap.
- **SAL:** Autorubric (3–5 anchored levels) + self-preference bias (PROVISIONAL≠PASS) directly back our BARS + confidence-tier doctrine. `skill-validator`/`verdict`/`agnix` are concrete tools to benchmark our pipeline against.
- **Gaps to file** (`/audit:discover`): `llm-as-judge-calibration`, `skill-supply-chain-security`, `capability-routing-at-scale`, `skill-discovery`.

## Completeness
Captures every external tool/spec/paper the two research agents surfaced as relevant; full per-source
enumeration (incl. exclusions) is in the agents' transcripts. Directory aggregates (93k–201k skills) are
listed as queryable sources, not enumerated. URLs are spot-check-before-adopt.
