---
name: governance
description: "Use when defining decision rights, ownership, approvals, policy lifecycle, change management, rollout controls, evidence, review cadences, or audit trails across product, content, data, design, and operations. Covers governance domains, RACI-style accountability, controlled change, and compliance evidence. Do NOT use for agent tool-permission policy (use `guardrails`) or application RBAC/user permission checks (use `owasp-security`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/governance
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-28"
  drift_check: "{\"last_verified\":\"2026-03-28\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"governance\",\"data governance\",\"design governance\",\"content governance\",\"process governance\",\"change management\",\"policy lifecycle\",\"decision authority\",\"raci\",\"raci matrix\",\"accountability matrix\",\"audit trail\"]"
  triggers: "[\"governance-skill\"]"
  relations: "{\"related\":[\"information-architecture\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/governance/SKILL.md
---
# Governance

## Domain Context

**What is this skill?** This skill provides general governance guidance for policy, accountability, and controlled change across product, content, data, design, and operational systems. Covers governance domains, decision rights, RACI-style accountability models, policy lifecycle design, change management, compliance evidence, review cadences, and audit-trail expectations. Use when defining who decides what, setting ownership and approval boundaries, designing or reviewing policy workflows, planning controlled rollout and rollback, or auditing whether a system has enough structure to stay trustworthy as it grows. Do NOT use for agent-specific tool permission and trust-policy design (use agent-governance), or for application RBAC and user permission checks (use nextauth-patterns).

> Governance is the operating structure around decisions, ownership, policy, and controlled change. It keeps systems trustworthy when multiple stakeholders, rules, and review cycles must stay aligned.

## Key Files

| File | Purpose |
|---|---|
| `skills/governance/references/governance-frameworks.md` | RACI templates, lifecycle states, change-governance checklist, compliance evidence patterns |
## Coverage

This skill covers governance domains (data, design, content, process, taxonomy), decision rights and RACI-style accountability models, policy lifecycle states (draft through retired), change management checklists, audit trail and compliance evidence requirements, review cadence design, and the boundary between general organizational governance and agent-specific or auth-specific governance. It does not cover the mechanics of event logging (use `audit-traceability`), taxonomy model internals (use `taxonomy`), agent tool permissions (use `agent-governance`), or user RBAC (use `nextauth-patterns`).

## Philosophy

Governance exists because systems with multiple stakeholders, policies, and review cycles silently degrade when ownership and approval paths are implicit rather than explicit. Without this skill, agents default to treating governance as optional commentary rather than a structural requirement. The observable failure mode is "policy drift" — rules that exist in conversation but have no accountable owner, no lifecycle state, no review cadence, and no audit evidence. This skill forces agents to name the owner, define the approval path, distinguish draft from active guidance, and pair governance changes with documentation updates in the same commit.

## 1. When to Use This Skill

Use this skill when the problem is about authority, accountability, policy, or controlled change rather than implementation mechanics.

| Use this skill for... | Use another skill for... |
|---|---|
| Defining ownership, approvers, and review cadence | Agent-specific tool permissions and trust scores (`agent-governance`) |
| Designing policy lifecycle states and publication rules | Application RBAC or auth checks (`nextauth-patterns`) |
| Structuring change management, approvals, and rollback expectations | Taxonomy structure internals (`taxonomy`) |
| Auditing whether a workflow has enough governance | Immutable event logging implementation (`audit-traceability`) |

## 2. Governance Domains

Governance is domain-specific, but the control questions repeat across domains.

| Domain | Primary question | Typical outputs |
|---|---|---|
| Data governance | Who defines quality, retention, and access rules? | data owner, retention policy, audit evidence |
| Design governance | Who can change tokens, patterns, or visual standards? | review gates, design system ownership, exception process |
| Content governance | Who publishes, revises, and retires content? | editorial workflow, approver roles, freshness review |
| Process governance | Who can change operational workflow or release rules? | approval path, rollback rule, review cadence |
| Taxonomy governance | Who approves naming and classification changes? | candidate -> approved -> deprecated lifecycle |

## 3. Decision Rights and Accountability

Every governed system needs an explicit answer to four questions: who proposes, who approves, who executes, and who must be informed.

### RACI default

| Role | Responsibility |
|---|---|
| Responsible | Does the work and prepares the change |
| Accountable | Owns the final decision and outcome |
| Consulted | Gives domain input before approval |
| Informed | Needs awareness after the decision |

Rules:
- One accountable owner per decision surface.
- If everyone is accountable, nobody is accountable.
- Use RACI for cross-functional changes, not for trivial one-person edits.

## 4. Policy Lifecycle

Policies need lifecycle states so drafts, approved rules, and retired guidance are not confused.

| State | Meaning | Required control |
|---|---|---|
| Draft | Proposed but not authoritative | named owner and review target |
| In review | Stakeholders are actively evaluating | tracked approvers and comment trail |
| Approved | Normative source of truth | publication date and accountable owner |
| Published | In active use | discoverable location and affected-surface links |
| Deprecated | Still visible but being phased out | replacement path and sunset date |
| Retired | No longer valid | preserved audit record |

## 5. Change Management

Governed change is not just "someone edited a file." It includes impact, approvals, rollout, and reversal.

### Minimum change-governance checklist

- Define the change scope and affected surfaces.
- Name the accountable owner.
- Identify who must review before approval.
- Record rollout timing and communication plan.
- Define rollback conditions before release.
- Preserve the decision trail after implementation.

Use a formal change workflow when any of these are true:
- more than one team or stakeholder is affected,
- the change alters policy or user trust,
- rollback would be costly,
- or compliance evidence is required.

## 6. Audit Trails and Evidence

Governance without evidence becomes folklore. Record what changed, why it changed, who approved it, and when it became effective.

| Evidence type | Why it matters |
|---|---|
| Decision record | Explains why a rule exists |
| Approval trace | Proves the change followed process |
| Effective date | Prevents version ambiguity |
| Supersession link | Shows what replaced the old rule |
| Review history | Keeps stale policy from acting current |

If the task is about the storage or append-only mechanics of the log itself, pair or route to `audit-traceability`.

## 7. Review Cadence

Governed systems drift unless review timing is explicit.

| Artifact | Typical cadence | Triggered review examples |
|---|---|---|
| Policy documents | quarterly or on major change | new regulation, new platform, scope expansion |
| Design standards | per major release plus periodic review | token drift, repeated exceptions |
| Content standards | monthly or quarterly | stale docs, terminology changes |
| Taxonomies | quarterly | orphan categories, synonym collisions |

## 8. Boundaries and Pairing

- Use `agent-governance` when the problem is about agent policies, allowed tools, trust scoring, or intent classification.
- Use `nextauth-patterns` when the problem is about user auth, session scope, or RBAC.
- Use `taxonomy` for taxonomy-model decisions once governance ownership is clear.
- Use `doc-updater` when governance changes require updated docs in the same change.

## 9. Reference Files

| File | What's in it |
|---|---|
| `references/governance-frameworks.md` | RACI templates, lifecycle states, change-governance checklist, compliance evidence patterns |

## Verification

- [ ] One accountable owner is named for each governed surface
- [ ] Approval path is explicit, not implied
- [ ] Lifecycle states distinguish draft, active, and retired guidance
- [ ] Rollback expectations are defined before release
- [ ] Audit evidence captures what changed, why, who approved, and when
- [ ] Boundary skills are named when the task crosses into auth, agent policy, or taxonomy internals
- [ ] Documentation updates ship with the governance change

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Agent tool permissions, trust scores, intent classification | `agent-governance` | Agent-governance owns the declarative policy framework for what agents may do |
| User auth, session scope, RBAC checks | `nextauth-patterns` | Application-level permissions are auth concerns, not organizational governance |
| Taxonomy model design and classification internals | `taxonomy` | Governance sets who approves taxonomy changes; taxonomy owns the model structure |
| Immutable event log implementation and append-only mechanics | `audit-traceability` | Governance defines what evidence is needed; audit-traceability implements the storage |
| GDPR-specific data handling and privacy controls | `gdpr-compliance` | Governance provides the review framework; GDPR-compliance owns the specific privacy rules |

---

*Version 1.1.0 — Updated 2026-03-28. Added Coverage, Philosophy, Do NOT Use When sections. Renamed Verification Checklist to standard Verification heading.*
