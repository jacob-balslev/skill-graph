---
name: summarization
description: "Prose condensation and abstraction patterns for AI agents: extracting key findings from long reports, writing executive summaries, creating TLDRs, compressing context for handoffs between agents, progressive summarization (literature notes → permanent notes), audit report condensation, and the discipline of deciding what to keep and what to cut when space is limited. Use when summarizing session findings, writing wrap reports, condensing research for memory files, creating executive summaries of audits, compressing context before agent handoffs, or distilling long documents into actionable briefs. Do NOT use for data compression algorithms (use compression), context window budget management (use token-efficiency), or document structure (use editorial-standards)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  metadata: "{\"schema_version\":6,\"version\":\"1.0.0\",\"type\":\"capability\",\"category\":\"agent\",\"domain\":\"agent/cognition\",\"scope\":\"reference\",\"owner\":\"skill-graph-maintainer\",\"freshness\":\"2026-03-28\",\"drift_check\":\"{\\\\\\\"last_verified\\\\\\\":\\\\\\\"2026-03-28\\\\\\\"}\",\"eval_artifacts\":\"planned\",\"eval_state\":\"unverified\",\"routing_eval\":\"absent\",\"stability\":\"experimental\",\"keywords\":\"[\\\\\\\"summarization\\\\\\\",\\\\\\\"summary\\\\\\\",\\\\\\\"TLDR\\\\\\\",\\\\\\\"executive summary\\\\\\\",\\\\\\\"condensation\\\\\\\",\\\\\\\"abstract\\\\\\\",\\\\\\\"distill\\\\\\\",\\\\\\\"key findings\\\\\\\",\\\\\\\"brief\\\\\\\",\\\\\\\"compress text\\\\\\\",\\\\\\\"context handoff\\\\\\\",\\\\\\\"progressive summarization\\\\\\\"]\",\"triggers\":\"[\\\\\\\"summarization-skill\\\\\\\",\\\\\\\"summary-skill\\\\\\\"]\",\"relations\":\"{\\\\\\\"related\\\\\\\":[\\\\\\\"context-management\\\\\\\",\\\\\\\"writing-humanizer\\\\\\\"],\\\\\\\"boundary\\\\\\\":[\\\\\\\"compression\\\\\\\",\\\\\\\"context-window\\\\\\\"],\\\\\\\"verify_with\\\\\\\":[\\\\\\\"evaluation\\\\\\\"]}\",\"portability\":\"{\\\\\\\"readiness\\\\\\\":\\\\\\\"scripted\\\\\\\",\\\\\\\"targets\\\\\\\":[\\\\\\\"skill-md\\\\\\\"]}\",\"lifecycle\":\"{\\\\\\\"stale_after_days\\\\\\\":90,\\\\\\\"review_cadence\\\\\\\":\\\\\\\"quarterly\\\\\\\"}\",\"skill_graph_source_repo\":\"https://github.com/jacob-balslev/skill-graph\",\"skill_graph_protocol\":\"Skill Metadata Protocol v5\",\"skill_graph_project\":\"Skill Graph\",\"skill_graph_canonical_skill\":\"skills/summarization/SKILL.md\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/summarization/SKILL.md
---
# Summarization

## Domain Context

**What is this skill?** Prose condensation and abstraction patterns for AI agents: extracting key findings from long reports, writing executive summaries, creating TLDRs, compressing context for handoffs between agents, progressive summarization (literature notes → permanent notes), audit report condensation, and the discipline of deciding what to keep and what to cut when space is limited. Use when summarizing session findings, writing wrap reports, condensing research for memory files, creating executive summaries of audits, compressing context before agent handoffs, or distilling long documents into actionable briefs. Do NOT use for data compression algorithms (use compression), context window budget management (use token-efficiency), or document structure (use editorial-standards).

> Summarization is not shortening. It is the skill of identifying what matters and discarding what doesn't — while preserving the causal chain that makes the remaining content useful.

## Coverage

Extractive summarization (pulling key sentences verbatim), abstractive summarization (rewriting in fewer words while preserving meaning), progressive summarization (Tiago Forte's 3-layer highlight method adapted for agent work), executive summary structure (situation → findings → recommendations → next steps), TLDR generation (one-sentence distillation of a complex document), session wrap condensation (converting 50+ findings into a prioritized summary), research-to-memory compression (distilling task research into memory-file-sized briefs), agent handoff summaries (what the next agent needs to know, nothing else), audit report condensation (from raw findings to scored summary with evidence), and the information-theoretic principle of lossy compression — what you choose to lose defines the quality of the summary.

## Philosophy

Every agent in this system produces more text than any human will read. Session logs run to thousands of lines. Research files contain every detail an agent discovered. Audit reports list every finding at every severity level. Without summarization discipline, this output becomes noise — technically complete but practically useless.

The failure mode is not missing information but buried information. A 500-line research file that contains the answer on line 347 is worse than a 50-line summary that puts the answer in the first paragraph. A wrap report that lists 30 findings without priority is worse than one that highlights the 3 critical findings and links to the rest.

Summarization is lossy by definition. The skill is in choosing *what to lose*. The rules below encode that choice: keep decisions and their rationale, keep blockers and their workarounds, keep numbers and their context — drop process narration, drop tool output, drop hedging.

## When to Use

- Writing /workflow/wrap session summaries
- Creating memory topic files from research sessions
- Condensing task-researcher output for task-solver consumption
- Writing executive summaries of audit reports
- Creating TLDRs for long Linear issue descriptions
- Compressing context for agent-to-agent handoffs
- Distilling board meeting minutes into decisions + action items
- Summarizing git log history for PR descriptions
- Converting verbose tool output into human-readable findings

## Cross-Domain Synergy

- **token-efficiency**: Manages the *budget* for context (how many tokens). Summarization provides the *technique* for fitting content into that budget.
- **context-management**: Controls what enters and exits a session. Summarization provides the compression technique when eviction isn't enough.
- **editorial-standards**: Defines what good documents look like. Summarization defines how to make a good *shorter* document from a longer one.
- **writing-humanizer**: Ensures summaries don't sound robotic. Summarization focuses on *what to include*; writing-humanizer focuses on *how it reads*.
- **memory-gardener**: Maintains memory files. Summarization provides the technique for compressing session findings into memory-sized entries.
- **compression**: Covers algorithmic data compression (Zstd, Brotli). Summarization covers *prose* compression — fundamentally different because it requires semantic judgment.

---

## 1. The Summarization Hierarchy

Not all summaries serve the same purpose. Match the technique to the audience and constraint.

| Level | Name | Length | Keeps | Drops | Use For |
|-------|------|--------|-------|-------|---------|
| L1 | **TLDR** | 1-2 sentences | The single most important takeaway | Everything else | Slack messages, Linear comments, commit subjects |
| L2 | **Executive Summary** | 3-8 sentences | Situation, key findings, recommendation | Evidence, process, reasoning | Memory files, PR descriptions, wrap reports |
| L3 | **Brief** | 1-2 paragraphs | Findings + evidence + reasoning | Verbose tool output, narration | Task handoffs, research summaries |
| L4 | **Condensed Report** | 1-2 pages | Full findings with priority, evidence refs | Raw data, duplicates, process log | Audit reports, board meeting summaries |

**Rule: Always specify which level you're writing.** "Summarize this" is ambiguous. "Write an L2 executive summary" is actionable.

## 2. What to Keep vs What to Drop

**Always keep:**
- Decisions and their rationale ("Chose X because Y")
- Blockers and their workarounds or status
- Numbers with context (counts, scores, percentages)
- Action items with owners
- Surprising or non-obvious findings
- Links to evidence (file paths, URLs, line numbers)

**Always drop:**
- Process narration ("First I read the file, then I searched for...")
- Tool invocation details ("I ran grep and found...")
- Hedging and qualification ("It's worth noting that perhaps...")
- Repeated information (say it once, in the right place)
- Obvious context the reader already has
- Intermediate reasoning that led to the final conclusion

## 3. Executive Summary Structure

The executive summary is the most common summary type in this system (memory files, wrap reports, PR descriptions).

**Four-part structure:**
1. **Situation** (1 sentence): What was the task/context?
2. **Findings** (2-4 sentences): What did we discover or accomplish?
3. **Recommendation** (1-2 sentences): What should happen next?
4. **Evidence** (optional, linked): Where can the reader verify?

**Example:**
> Audited the 12 language-related skills for gap coverage. Found 4 clear gaps: microcopy (highest impact — no owner for functional UI text), i18n (linguistics has awareness but no implementation patterns), summarization (critical for agent context handoffs but unowned), and content strategy (the "what to write" layer above copywriting). Recommend creating all 4 as shared skills in the quality/meta/display layers. See gap analysis in conversation context.

## 4. Progressive Summarization for Agent Work

Adapted from Tiago Forte's method for agent memory:

- **Layer 0**: Raw output (session logs, tool results, full research)
- **Layer 1**: Highlighted key passages (extractive — pull the important sentences)
- **Layer 2**: Bold the key phrases within highlights (identify the core claims)
- **Layer 3**: Write an executive summary in your own words (abstractive)

**For memory files:** Always store Layer 3 (the executive summary) with a link to Layer 0 (the raw source) if it still exists. Never store Layer 0 directly in memory — it's too large and decays into noise.

## 5. Agent Handoff Summaries

When one agent passes work to another, the summary must answer exactly these questions:

1. **What was done?** (completed work, in one sentence)
2. **What's left?** (remaining work, as a list)
3. **What's blocked?** (if anything, with the specific blocker)
4. **What's surprising?** (non-obvious findings that affect the remaining work)
5. **Where's the evidence?** (file paths, Linear issue IDs, commit hashes)

Anything not in these 5 categories is noise for the receiving agent.

## 6. Audit Report Condensation

Raw audit findings → prioritized summary:

1. **Count and categorize**: "Found 23 findings: 3 critical, 7 high, 8 medium, 5 low"
2. **Lead with critical**: List critical findings first with one-line descriptions
3. **Group by theme**: Not by file or discovery order, but by the *type* of problem
4. **Score if applicable**: "Overall score: 36/50" with dimension breakdown
5. **Link to raw findings**: The condensed report links to the full findings file

## 7. Anti-Patterns

| Anti-Pattern | Why It's Bad | Fix |
|-------------|-------------|-----|
| "First I did X, then Y, then Z" | Process narration wastes reader time | State the outcome, not the journey |
| Including all findings at equal weight | Reader can't distinguish critical from trivial | Prioritize by severity/impact |
| Summarizing by shortening every section proportionally | Produces a uniformly shallow version | Cut entire low-value sections, keep high-value sections intact |
| "As mentioned above" / "As noted earlier" | Self-referential text that doesn't survive extraction | Make each section standalone |
| Hedging in summaries | "It might be worth considering" wastes the reader's attention | State the recommendation directly |


## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| (To be filled during next audit pass) | — | — |


## Verification

After applying this skill, verify:
- [ ] Changes follow the patterns documented above
- [ ] No regressions in affected functionality
