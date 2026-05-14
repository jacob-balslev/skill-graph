---
name: architecture-decision-records
description: "Use when writing, reviewing, or updating Architecture Decision Records: context, decision, options rejected, consequences, status, supersession, and follow-up verification. Do NOT use for general documentation prose (use `documentation`), code review findings (use `code-review`), or choosing between frameworks before a decision exists (use `framework-fit-analysis`)."
license: MIT
compatibility: "Portable ADR discipline for Markdown decision logs, repo docs, design docs, and architecture governance."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: engineering
  domain: architecture/decision-records
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"ADR\",\"architecture decision record\",\"decision log\",\"technical decision\",\"decision consequences\",\"options rejected\",\"superseded ADR\",\"architectural rationale\",\"decision status\"]"
  examples: "[\"write an ADR for choosing Postgres views as the source of truth\",\"review this architecture decision record for missing consequences and rejected options\",\"this decision changed - should we amend the ADR or supersede it?\",\"extract the decision from this long architecture discussion into a durable ADR\"]"
  anti_examples: "[\"write a general README section explaining how this module works\",\"choose which framework we should use for this project\",\"review this PR for bugs and regressions\",\"design the interface contract between these two services\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation explains systems broadly; architecture-decision-records records a specific durable decision and its consequences\"},{\"skill\":\"framework-fit-analysis\",\"reason\":\"framework-fit-analysis evaluates options before selection; architecture-decision-records records the selected option and tradeoffs\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates a diff; architecture-decision-records evaluates the decision record\"},{\"skill\":\"system-interface-contracts\",\"reason\":\"system-interface-contracts designs boundaries and contracts; architecture-decision-records records the decision to adopt one\"}],\"related\":[\"framework-fit-analysis\",\"bounded-context-mapping\",\"system-interface-contracts\",\"dependency-architecture\"],\"verify_with\":[\"documentation\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/architecture-decision-records/SKILL.md
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

