# Governance Frameworks

> Dense reference material for governance decisions. Keep the SKILL.md focused on routing and judgment; use this file when you need templates, state models, or checklists.

## 1. RACI Templates

### Policy change RACI

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Draft policy update | domain owner | policy owner | impacted stakeholders | downstream operators |
| Review and comments | reviewers | policy owner | legal / security / design as needed | team leads |
| Approval decision | approver delegate | accountable owner | domain experts | affected teams |
| Publish and communicate | program manager or owner | accountable owner | docs owner | everyone affected |
| Deprecate and replace | owner | accountable owner | replacement owners | downstream teams |

### Design-system governance RACI

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Propose token or component change | design system maintainer | design lead | frontend lead, accessibility owner | product teams |
| Exception review | requesting team | design lead | design system maintainer | reviewers |
| Approve breaking change | design lead | product/design authority | frontend and UX owners | all consuming teams |

### Content governance RACI

| Activity | Responsible | Accountable | Consulted | Informed |
|---|---|---|---|---|
| Draft content | content author | content owner | support, product, legal as needed | affected teams |
| Approve publish | editor | content owner | subject-matter reviewer | support and operations |
| Freshness review | content owner | content owner | domain experts | readers/support |

## 2. Policy Lifecycle Model

### Canonical states

| State | Entry criteria | Exit criteria | Required metadata |
|---|---|---|---|
| Draft | proposed rule exists | review requested | owner, scope, created date |
| In review | reviewers assigned | approved or sent back | reviewers, review notes |
| Approved | accountable owner signs off | published | approver, approval date |
| Published | active source of truth | deprecated | effective date, location, audience |
| Deprecated | replacement identified or pending retirement | retired | replacement link, sunset date |
| Retired | no longer authoritative | archived only | archival reference |

### Lifecycle traps

- Drafts stored next to live policy without clear status marker
- Published policy with no owner or review date
- Deprecated policy with no replacement path
- Retired policy deleted instead of archived, destroying traceability

## 3. Change-Management Checklist

Use this checklist when a change affects trust, compliance, or multiple stakeholders.

### Before approval

- Define the problem and affected surfaces.
- State whether the change is additive, breaking, or corrective.
- Identify the accountable owner.
- List required reviewers.
- Record rollout window.
- Define rollback trigger and rollback owner.

### Before rollout

- Confirm the approved source is the one being released.
- Confirm downstream documentation is updated.
- Communicate the change to affected teams.
- Confirm monitoring or audit capture exists.

### After rollout

- Record effective date.
- Capture exceptions or incidents.
- Schedule the next review date.

## 4. Compliance Evidence Pattern

Governance work often needs evidence even when the repo is not implementing a formal compliance framework.

| Evidence | Minimum contents |
|---|---|
| Decision record | problem, decision, rationale, owner, date |
| Approval record | approver, timestamp, scope, status |
| Change record | before/after summary, rollout timing, rollback path |
| Review record | reviewer names, findings, next review date |
| Supersession record | what was replaced, why, effective date |

## 5. Decision Authority Questions

Ask these before finalizing governance structure:

1. What decision is being governed?
2. Who is accountable when the decision is wrong?
3. Who must review before it becomes authoritative?
4. What evidence proves the process was followed?
5. How is the decision revised, deprecated, or retired?

## 6. Boundary Notes

- `agent-governance` owns agent tool permissions, trust scoring, and execution intent classes.
- `nextauth-patterns` owns application auth/session/RBAC patterns.
- `taxonomy` owns taxonomy-model details after governance structure is decided.
- `audit-traceability` owns immutable audit-log implementation mechanics.

---

Autonomous improvement loops may update SKILL.md routing guidance, but they must not modify this reference file automatically.
