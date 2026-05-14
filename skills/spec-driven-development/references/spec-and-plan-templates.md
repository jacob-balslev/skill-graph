# Spec and Plan Templates

Use these templates as a starting point for every new non-trivial feature or refactor.

## 1. Specification Template (`spec.md`)

```markdown
# [Feature Name] — Specification

> **Type**: Product Spec
> **Author**: [Agent Name/Model]
> **Status**: Draft | Approved
> **Date**: YYYY-MM-DD

## 1. Context & Motivation
[One-paragraph summary: what is the core problem and why is it worth solving now? Link to relevant Linear issues.]

## 2. Requirements (Must-Haves)
- [ ] Requirement 1: [Specific, observable behavior]
- [ ] Requirement 2: [Specific, observable behavior]
- [ ] ...

## 3. Success Criteria
[How do we know we're Done? E.g., "The dashboard shows the reconciled margin for Shopify orders."]

## 4. Constraints & Boundaries
- **Security**: [Auth, RLS, data access rules]
- **Privacy (GDPR)**: [PII treatment, redaction, storage rules]
- **Architecture**: [Module boundaries, tech stack requirements]
- **Out of Scope**: [What are we NOT doing in this task?]

## 5. Edge Cases
- [ ] Empty state (zero data)
- [ ] Error state (API failure, timeout)
- [ ] High-volume data (latency, pagination)
- [ ] ...
```

## 2. Technical Plan Template (`plan.md`)

```markdown
# [Feature Name] — Technical Plan

> **Type**: Architecture Plan
> **Spec Reference**: `spec.md`
> **Author**: [Agent Name/Model]
> **Status**: Draft | Approved
> **Date**: YYYY-MM-DD

## 1. Implementation Strategy
[Overview of the high-level architecture: affected modules, new components, and data flow.]

## 2. Affected Modules & Dependencies
| Module | Change Type | Impact |
|--------|-------------|--------|
| `apps/web/src/lib/...` | Update | New utility for [Function] |
| `apps/web/src/app/...` | Create | New route handler for [Route] |
| `prisma/schema.prisma`| Update | New field `[column]` in table `[table]` |

## 3. Data Flow & API Contracts
[Describe the input/output lifecycle and JSON shapes for any new endpoints.]

## 4. Database Schema Changes
```sql
-- SQL DDL or Prisma changes
ALTER TABLE organizations ADD COLUMN workspace_kind TEXT DEFAULT 'customer';
```

## 5. Testing Strategy
| Tier | Coverage Target | Verification Method |
|------|-----------------|---------------------|
| Unit | Logic/Utilities | `npm run test:unit` |
| Integration| API/Components | `playwright-cli` |
| Visual QA | UI/UX Compliance| `design-review` skill |

## 6. Task Decomposition
1. [ ] Task 1: [Short, atomic description] (<10 mins)
2. [ ] Task 2: [Short, atomic description] (<10 mins)
3. [ ] ...
```
