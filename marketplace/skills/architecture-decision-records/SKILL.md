---
name: architecture-decision-records
description: "Use when writing, reviewing, or updating Architecture Decision Records: context, decision, options rejected, consequences, status, supersession, and follow-up verification. Do NOT use for general documentation prose (use `documentation`), code review findings (use `code-review`), or choosing between frameworks before a decision exists (use `framework-fit-analysis`). Do NOT use for write a general README section explaining how this module works. Do NOT use for choose which framework we should use for this project. Do NOT use for review this PR for bugs and regressions. Do NOT use for design the interface contract between these two services."
license: MIT
compatibility: "Portable ADR discipline for Markdown decision logs, repo docs, design docs, and architecture governance."
allowed-tools: Read Grep
metadata:
  relations: "{\"adjacent\":[\"framework-fit-analysis\"]}"
  subject: software-architecture
  deployment_target: portable
  scope: "Writing, reviewing, and updating Architecture Decision Records — context, decision, options rejected, consequences, status, supersession, and follow-up verification. Portable across any project that records architectural decisions; principle-grounded, not repo-bound. Excludes general documentation prose (documentation), code-review findings (code-review), and choosing between frameworks before a decision exists (framework-fit-analysis)."
  taxonomy_domain: architecture/decision-records
  stability: experimental
  keywords: "[\"ADR\",\"architecture decision record\",\"decision log\",\"technical decision\",\"decision consequences\",\"options rejected\",\"superseded ADR\",\"architectural rationale\",\"decision status\"]"
  examples: "[\"write an ADR for choosing Postgres views as the source of truth\",\"review this architecture decision record for missing consequences and rejected options\",\"this decision changed - should we amend the ADR or supersede it?\",\"extract the decision from this long architecture discussion into a durable ADR\"]"
  anti_examples: "[\"write a general README section explaining how this module works\",\"choose which framework we should use for this project\",\"review this PR for bugs and regressions\",\"design the interface contract between these two services\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/architecture-decision-records/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Architecture Decision Records

## Coverage

Create and audit ADRs for significant technical choices. Covers decision context, forces, considered options, chosen decision, rejected alternatives, consequences, status, supersession, links to implementation, and follow-up verification. Use for decisions with future readers, cross-team consequences, operational cost, or hard-to-reverse effects.

## Philosophy

An ADR is not a design essay. It is a durable answer to "Why did we choose this, given what we knew then?" It should preserve the tradeoff, not retroactively make the decision look inevitable.

Good ADRs are short, dated, statused, and honest about consequences. If a future agent cannot tell whether the decision still holds, the record failed.

## Method

1. Name the decision in one sentence.
2. Capture context and forces, including constraints and non-goals.
3. List serious options considered, including "do nothing" when real.
4. State the decision and why it won.
5. Record consequences: benefits, costs, risks, migration obligations, and reversibility.
6. Set status: proposed, accepted, deprecated, or superseded.
7. Link implementation surfaces and verification checks.

## Status Decision Table

| Situation | ADR action |
|---|---|
| Decision is still under review | Keep status `proposed`; record open questions and decision date target. |
| Decision has been made and implementation is active | Set status `accepted`; link implementation surfaces and verification checks. |
| Decision remains historically true but is no longer recommended | Set status `deprecated`; explain the replacement direction. |
| A later decision replaces it | Set status `superseded`; link the newer ADR and summarize what changed. |
| Implementation drifted but the decision still stands | Keep status, add a follow-up section with the verification gap and owner. |
| The ADR records multiple unrelated choices | Split into one ADR per decision before accepting it. |

## Verification

- [ ] The ADR records one decision, not a cluster of unrelated choices
- [ ] Rejected options are concrete and plausible
- [ ] Consequences include costs and risks, not only benefits
- [ ] Status and date are present
- [ ] Supersession links are explicit when the decision changed
- [ ] Implementation references are current or intentionally absent
- [ ] The decision can be understood without reading the whole discussion that caused it

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | You need a guide, README, tutorial, or reference page. |
| `framework-fit-analysis` | The task is still evaluating options before a decision. |
| `code-review` | The task is reviewing a diff for correctness. |
| `system-interface-contracts` | You need to design a contract before recording the decision. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Deployment: `portable`
- Domain: `architecture/decision-records`
- Scope: Writing, reviewing, and updating Architecture Decision Records — context, decision, options rejected, consequences, status, supersession, and follow-up verification. Portable across any project that records architectural decisions; principle-grounded, not repo-bound. Excludes general documentation prose (documentation), code-review findings (code-review), and choosing between frameworks before a decision exists (framework-fit-analysis).

**When to use**
- write an ADR for choosing Postgres views as the source of truth
- review this architecture decision record for missing consequences and rejected options
- this decision changed - should we amend the ADR or supersede it?
- extract the decision from this long architecture discussion into a durable ADR

**Not for**
- write a general README section explaining how this module works
- choose which framework we should use for this project
- review this PR for bugs and regressions
- design the interface contract between these two services

**Related skills**
- Related: `framework-fit-analysis`

**Keywords**
- `ADR`, `architecture decision record`, `decision log`, `technical decision`, `decision consequences`, `options rejected`, `superseded ADR`, `architectural rationale`, `decision status`

<!-- skill-graph-context:end -->
