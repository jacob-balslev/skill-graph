---
name: gemini-flash
description: "Use when deciding whether to route a task to Google's fast/cheap Gemini Flash tier (current Gemini 3 Flash / Gemini 3.5 Flash generation, with Flash-Lite as the floor) for cheap gates, classification, extraction, structured output, format conversion, or high-throughput agentic steps — AND to find the quality-ceiling boundary where work must escalate to Gemini Pro or another frontier model. Covers the per-tier pricing (Flash-Lite / 3 Flash / 3.5 Flash), the surprisingly high quality ceiling, and the escalate-up rule (judging/grading, deep multi-step reasoning, hardest code). Do NOT use for choosing the frontier large-context tier (use `gemini-pro`), for general agent-system architecture (use `agent-engineering`), or for dispatching among local skills (use `skill-router`). Do NOT use for I need to reason over a 600K-token corpus in one call. Do NOT use for design the agent system that composes these models. Do NOT use for which of my local skills should handle this request?"
license: MIT
compatibility: "Markdown, any agent runtime; model facts current as of 2026-06-08"
allowed-tools: Read WebSearch
metadata:
  subject: agent-ops
  subjects: "[\"agent-ops\",\"ai-engineering\"]"
  public: "true"
  scope: "Deciding when to route a task to Google's fast/cheap Gemini Flash tier (Gemini 3 Flash / 3.5 Flash, Flash-Lite as the floor) — cheap gates, classification, extraction, structured output, high-throughput agentic steps — and identifying the quality-ceiling boundary where work must escalate to Gemini Pro or another frontier model (judging/grading, deep multi-step reasoning, hardest code). Portable model-routing knowledge, not anchored to any project. Excludes the frontier large-context Pro tier (gemini-pro), agent-system architecture (agent-engineering), and request-time dispatch among local skills (skill-router)."
  taxonomy_domain: agent/models
  stability: experimental
  keywords: "[\"route to Gemini Flash\",\"cheap fast model for gates\",\"Gemini Flash classification extraction\",\"structured output cheap model\",\"Gemini 3 Flash vs 3.5 Flash pricing\",\"Flash-Lite cheapest tier\",\"when to escalate from Flash to Pro\",\"high volume cheap LLM\",\"quality ceiling cheap model\",\"agentic loop per-step model\"]"
  examples: "[\"I need to classify 50k support tickets cheaply — which model?\",\"what's the cheapest Gemini tier for bulk JSON extraction?\",\"is Gemini Flash good enough to grade these evals, or do I escalate?\",\"3 Flash Preview or 3.5 Flash for a high-volume agent loop?\"]"
  anti_examples: "[\"I need to reason over a 600K-token corpus in one call\",\"design the agent system that composes these models\",\"which of my local skills should handle this request?\"]"
  relations: "{\"related\":[\"gemini-pro\",\"agent-engineering\",\"autonomous-loop-patterns\",\"skill-router\"],\"suppresses\":[{\"skill\":\"gemini-pro\",\"reason\":\"I own the CHEAP/FAST/high-volume tier and the WHEN-to-escalate-up decision; gemini-pro owns the frontier large-context/multimodal-depth/hardest-reasoning tier on the other side of that boundary\"}],\"verify_with\":[\"gemini-pro\",\"agent-engineering\"]}"
  mental_model: "The cheap/fast model tier is a band with a floor, a workhorse, and a ceiling. The floor and workhorse absorb high-volume, throughput-bound, or low-per-item-complexity work. The ceiling is the kind of work the tier must NOT own: anything where the model's output IS the quality bar (grading, judging, scoring, verdicts) and deep multi-step reasoning where an early error compounds. The core decision is placing each task on the correct side of that ceiling."
  purpose: "Avoid two equal-but-opposite routing errors: over-routing cheap high-volume work UP to a frontier model and paying many times over for unused capability, and under-routing quality-deciding work DOWN to a cheap tier and poisoning every downstream decision built on its output."
  concept_boundary: "Owns the cheap/fast tier selection and the escalate-up boundary. Does NOT own the frontier large-context tier decision, agent-system architecture that composes many models, or request-time dispatch among local skills — those are separate concepts on the other side of the boundary it defines."
  analogy: "It is the line cook of the model kitchen — fast, cheap, and genuinely good at high-volume prep; you keep it on the line, but you do not hand it the dish whose taste is the restaurant's reputation, which goes to the head chef."
  misconception: "That 'cheap and fast' means 'only for throwaway work.' The cheap-tier quality ceiling is high — it can match or beat an earlier frontier tier on real coding benchmarks at a fraction of the cost. The true escalation boundary is not 'is this important?' but 'is the model's output the quality bar, or is this compounding-error-prone deep reasoning?' — those escalate; important high-volume production work does not."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/gemini-flash/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Gemini Flash

## Concept of the skill

**What it is:** A routing skill that decides when a task should go to Google's fast/cheap Gemini Flash tier (current Gemini 3 Flash / Gemini 3.5 Flash, with Flash-Lite as the floor) — and, just as importantly, where the Flash tier's quality ceiling is and when work must escalate up to Gemini Pro or another frontier model.

**Mental model:** Flash is a tier with a floor, a workhorse, and a ceiling. FLOOR = Flash-Lite ($0.25/$1.50), for the highest-volume classification/extraction. WORKHORSE = Gemini 3 Flash ($0.50/$3.00) and the agent-optimized Gemini 3.5 Flash GA ($1.50/$9.00). CEILING = the kinds of work Flash must NOT own: anything where the model's output IS the quality bar (grading, judging, eval scoring, audit verdicts), deep multi-step reasoning where an early error compounds, and the hardest agentic code. The skill's core job is to place a task on the correct side of that ceiling.

**Why it exists:** Two equal-but-opposite routing errors are common and expensive. (1) Over-routing UP: sending a 50K-row classification job to a frontier model and paying 8–20× for capability the task never uses. (2) Under-routing: sending a grading/judging task to Flash to "save cost," which poisons every downstream decision built on those verdicts. This skill names the boundary explicitly so neither error is made by default, and it corrects the assumption that "cheap" means "low quality" — Gemini 3 Flash actually out-scores an earlier Gemini Pro on SWE-Bench Verified.

**What it is NOT:** It is not the frontier large-context decision (that's `gemini-pro`), not agent-system architecture (`agent-engineering`), not dispatch among your local skills (`skill-router`), and not a Gemini API integration guide.

**Adjacent concepts:** `gemini-pro` (the frontier tier on the other side of the escalation boundary); `agent-engineering` (how to compose a Flash step and a frontier step into one system); `autonomous-loop-patterns` (the loop whose per-step model choice this skill informs); `skill-router` (dispatches among skills, not among external model tiers).

**One-line analogy:** Flash is the line cook of the model kitchen — fast, cheap, and genuinely good at the high-volume prep; you keep it on the line, but you do not hand it the dish whose taste is the restaurant's reputation (the grading/judging work goes to the head chef, Gemini Pro).

**Common misconception:** That "cheap and fast" means "only for throwaway work." Wrong: the Flash quality ceiling is high — Gemini 3 Flash beats an earlier Gemini Pro on SWE-Bench Verified at ~a quarter the input cost. The real boundary is not "is this important?" but "is the model's output the quality bar, or compounding-error-prone deep reasoning?" — those escalate; high-volume production work that happens to be important does not.

## Coverage

- The three tiers within Flash: Flash-Lite (the floor, highest-volume), Gemini 3 Flash (the workhorse), and Gemini 3.5 Flash (agent-optimized GA) — and which work each fits.
- The work the Flash tier owns: cheap gates / pre-screens / triage, classification and extraction at volume, structured output and format conversion, and high-throughput per-step agentic work.
- The escalate-up boundary: the kinds of work Flash must NOT own — anything where the model's output IS the quality bar (grading, judging, eval scoring, audit verdicts), deep multi-step reasoning where an early error compounds, and the hardest agentic code.
- The surprisingly high quality ceiling (a Flash tier can exceed an earlier Pro on real coding benchmarks) and why "cheap" does not mean "low quality."
- The per-tier pricing and the non-obvious cost facts: newer is not automatically cheaper, and the cost advantage narrows as the agent-optimized GA tier approaches the frontier tier's rate.
- That full 1M context and native multimodal input are available even at Flash prices.

## Philosophy of the skill

The cheap/fast tier earns its keep only when a task is placed on the correct side of one boundary, and both sides of that boundary have an expensive failure mode. Route quality-deciding work down to save cost and the cheap model's weak output silently corrupts every decision built on it — a far larger cost than the model spend ever saved. Route cheap high-volume work up out of caution and you pay many times over for capability the task never touches. The discipline rejects the lazy heuristic "important work goes to the big model": importance is not the boundary. The boundary is whether the model's output IS the quality bar, or whether the task is a long chain of dependent inference where one early error snowballs — those escalate, regardless of how routine they look. Everything else, including high-volume work that genuinely matters to the business, belongs on the cheap tier, because the tier's quality ceiling is high enough to carry it. Naming that boundary explicitly is the whole job; defaulting either way is the error.

## When to Route to Gemini Flash

Route here when the dominant constraint is throughput, latency, or cost — AND the task is not on the escalate-up list below:

| Signal | Why Flash | Tier within Flash |
|---|---|---|
| Cheap gate / pre-screen / triage | First-pass filter before a frontier model sees the item | Flash-Lite or 3 Flash |
| Classification / extraction at volume | Per-call frontier cost would dominate; Flash quality is sufficient | Flash-Lite (highest volume) → 3 Flash |
| Structured output / format conversion | Schema-constrained shaping, JSON, reformatting | 3 Flash |
| High-throughput agentic loop step | 3.5 Flash is agent-optimized, ~4× faster output | 3.5 Flash GA |
| Bulk audit / lint-style pass | Top-tier judge is overkill for mechanical review | 3 Flash |

## Capability & Pricing — Flash tier (June 2026)

| | Flash-Lite (floor) | 3 Flash (workhorse) | 3.5 Flash (GA, agent-optimized) |
|---|---|---|---|
| Input / 1M | **$0.25** | **$0.50** | $1.50 |
| Output / 1M | **$1.50** | **$3.00** | $9.00 |
| Context (input) | 1M | 1M | 1M |
| Multimodal | text·image·audio·video·PDF | same | same |
| Notable | cheapest; HumanEval ~90.5% | **SWE-Bench Verified 78.0%** (beats earlier Pro 76.2%) | Google's strongest agentic+coding Flash; default in Gemini app |

Two non-obvious facts that drive routing: (1) Gemini 3 Flash's SWE-Bench Verified (78.0%) **exceeds an earlier Gemini Pro** — the Flash ceiling is high. (2) Gemini 3.5 Flash GA is ~3× the price of 3 Flash Preview — "newer" is not automatically "cheaper"; for cost-sensitive batch work, 3 Flash Preview / Flash-Lite can still be the right pick.

## Strengths vs Weaknesses

**Strengths**
- Lowest cost per token in the Gemini family; Flash-Lite is the floor for volume work.
- Surprisingly high quality ceiling — production-grade coding/agentic results, not a toy tier.
- Full 1M context and native multimodal even at Flash prices.
- 3.5 Flash is agent-optimized and ~4× faster output — ideal as the per-step model in long loops.

**Weaknesses (the escalate-up boundary)**
- **Must not be the deciding judge of quality.** Grading, eval scoring, audit verdicts, security/architecture analysis go UP — a weak judge poisons downstream data.
- **Compounding-error reasoning.** Long dependent inference chains where an early mistake snowballs belong on a frontier model.
- **Cost advantage narrows at 3.5 Flash GA.** $1.50/$9.00 approaches Gemini 3.1 Pro's ≤200K rate ($2.00/$12.00); when the gap is small, Pro's stronger reasoning is the better buy.

## Verification

Confirm a Gemini-Flash routing decision before committing to it — and confirm it does not cross the escalate-up boundary.

- [ ] The task was placed on the correct side of the escalate-up boundary by the right test: is the model's output the quality bar, or is this compounding-error-prone deep reasoning? — not by "is this important?"
- [ ] Quality-deciding work (grading, judging, eval scoring, audit verdicts, security/architecture analysis) was NOT routed to Flash — it escalates to a frontier model.
- [ ] Deep multi-step reasoning where an early error compounds was escalated, not kept on Flash for throughput.
- [ ] The correct Flash sub-tier was chosen for the work (Flash-Lite for the highest volume, the workhorse tier for general throughput, the agent-optimized GA tier for fast per-step agentic loops) — not "newest by default."
- [ ] The decision accounted for the cost facts that newer is not automatically cheaper, and that the GA tier's price advantage narrows toward the frontier tier's rate (where the frontier's stronger reasoning can become the better buy).
- [ ] High-volume work that merely happens to be important was NOT escalated as if importance were the boundary.

## Do NOT Use When

| Instead of `gemini-flash` | Use | Why |
|---|---|---|
| The task needs frontier large-context (≈1M-token) reasoning in one call | `gemini-pro` | That is the frontier tier on the other side of the escalation boundary |
| The model's output IS the quality bar (grading, judging, eval scoring, audit verdicts) | (frontier model — e.g. `gemini-pro` / Claude Opus / GPT-5) | A lesser model must never be the sole/deciding judge of quality |
| You are designing how a Flash step and a frontier step compose into a system | `agent-engineering` | That is agent-system architecture, one layer above tier selection |
| You need to pick which of YOUR skills handles a request | `skill-router` | That dispatches among local skills, not among external model tiers |
| Deep multi-step reasoning where an early error compounds | (frontier model) | Flash is for throughput, not long compounding-inference chains |

## References

- `references/model-facts.md` — current per-tier context/pricing/benchmark facts with sources (Last updated 2026-06-08)
- `gemini-pro` skill — the frontier tier work escalates UP to when it crosses the Flash quality ceiling

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/models`
- Scope: Deciding when to route a task to Google's fast/cheap Gemini Flash tier (Gemini 3 Flash / 3.5 Flash, Flash-Lite as the floor) — cheap gates, classification, extraction, structured output, high-throughput agentic steps — and identifying the quality-ceiling boundary where work must escalate to Gemini Pro or another frontier model (judging/grading, deep multi-step reasoning, hardest code). Portable model-routing knowledge, not anchored to any project. Excludes the frontier large-context Pro tier (gemini-pro), agent-system architecture (agent-engineering), and request-time dispatch among local skills (skill-router).

**When to use**
- I need to classify 50k support tickets cheaply — which model?
- what's the cheapest Gemini tier for bulk JSON extraction?
- is Gemini Flash good enough to grade these evals, or do I escalate?
- 3 Flash Preview or 3.5 Flash for a high-volume agent loop?

**Not for**
- I need to reason over a 600K-token corpus in one call
- design the agent system that composes these models
- which of my local skills should handle this request?
- Owned by `gemini-pro`

**Related skills**
- Verify with: `gemini-pro`, `agent-engineering`
- Related: `gemini-pro`, `agent-engineering`, `autonomous-loop-patterns`, `skill-router`

**Concept**
- Mental model: The cheap/fast model tier is a band with a floor, a workhorse, and a ceiling. The floor and workhorse absorb high-volume, throughput-bound, or low-per-item-complexity work. The ceiling is the kind of work the tier must NOT own: anything where the model's output IS the quality bar (grading, judging, scoring, verdicts) and deep multi-step reasoning where an early error compounds. The core decision is placing each task on the correct side of that ceiling.
- Purpose: Avoid two equal-but-opposite routing errors: over-routing cheap high-volume work UP to a frontier model and paying many times over for unused capability, and under-routing quality-deciding work DOWN to a cheap tier and poisoning every downstream decision built on its output.
- Boundary: Owns the cheap/fast tier selection and the escalate-up boundary. Does NOT own the frontier large-context tier decision, agent-system architecture that composes many models, or request-time dispatch among local skills — those are separate concepts on the other side of the boundary it defines.
- Analogy: It is the line cook of the model kitchen — fast, cheap, and genuinely good at high-volume prep; you keep it on the line, but you do not hand it the dish whose taste is the restaurant's reputation, which goes to the head chef.
- Common misconception: That 'cheap and fast' means 'only for throwaway work.' The cheap-tier quality ceiling is high — it can match or beat an earlier frontier tier on real coding benchmarks at a fraction of the cost. The true escalation boundary is not 'is this important?' but 'is the model's output the quality bar, or is this compounding-error-prone deep reasoning?' — those escalate; important high-volume production work does not.

**Keywords**
- `route to Gemini Flash`, `cheap fast model for gates`, `Gemini Flash classification extraction`, `structured output cheap model`, `Gemini 3 Flash vs 3.5 Flash pricing`, `Flash-Lite cheapest tier`, `when to escalate from Flash to Pro`, `high volume cheap LLM`, `quality ceiling cheap model`, `agentic loop per-step model`

<!-- skill-graph-context:end -->
