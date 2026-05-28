---
name: schema-evolution
description: "Use when reasoning about how a database schema changes over time without breaking deployed application code: the expand/contract pattern (Ambler & Sadalage), the zero-downtime change rules, the backwards-and-forwards compatibility envelope (deploy ordering and rollback discipline), the catalog of schema changes (add column, drop column, rename, type change, add constraint, add index) and the safe procedure for each, the dual-write and dual-read transitions that make non-trivial changes safe in production, and the relationship between schema evolution as a design discipline and database-migration mechanics as its tooling. Do NOT use for the mechanical execution of one migration (use database-migration), schema design from scratch (use data-modeling), query tuning (use query-optimization), or distributed-data partitioning (use sharding-strategy). Do NOT use for which indexes the database has (use indexing-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: engineering/data
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"schema evolution\",\"expand contract\",\"parallel change\",\"zero-downtime migration\",\"backwards compatibility\",\"rolling deploy\",\"dual write\",\"dual read\",\"schema versioning\",\"additive change\"]"
  triggers: "[\"how do we rename this column without downtime\",\"expand contract\",\"is this migration safe\",\"schema versioning\",\"backwards compatibility for database\"]"
  examples: "[\"design the expand-contract sequence to rename a column from `name` to `full_name` across a deployed system\",\"decide whether to add a NOT NULL column with a default or with a separate backfill phase\",\"diagnose a deploy that broke because the schema change shipped before the code change\",\"explain why drop-column is the third phase of expand-contract, not the first\"]"
  relations: "{\"related\":[\"data-modeling\",\"database-migration\",\"indexing-strategy\",\"acid-fundamentals\"],\"boundary\":[{\"skill\":\"data-modeling\",\"reason\":\"data-modeling owns the design of a schema at a point in time; this skill owns how that schema changes between points in time. The two compose: data-modeling decides the target shape; this skill decides the safe path from current to target.\"},{\"skill\":\"database-migration\",\"reason\":\"database-migration owns the mechanics of applying one migration (ALTER TABLE, batched backfill, CONCURRENTLY indexes, unpooled connections); this skill owns the multi-step sequence of migrations and the deploy-coordination discipline that makes the sequence safe.\"},{\"skill\":\"indexing-strategy\",\"reason\":\"indexing-strategy owns which indexes the database has; this skill owns how the index set evolves over time. Adding or removing an index is one type of schema change governed by this skill's discipline.\"}],\"verify_with\":[\"data-modeling\",\"database-migration\"]}"
  anti_examples: "[\"execute one ALTER TABLE migration mechanically (use database-migration)\",\"design a schema from scratch (use data-modeling)\",\"diagnose a slow query (use query-optimization)\"]"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Schema evolution is to a database what stage carpentry is to a Broadway musical — the show does not stop; you do not bolt a new staircase to the stage during the second act; you build the new staircase upstage while the old staircase serves the cast (expand), gradually rehearse the cast to use the new one while the old still works (migrate), and only after every performer has memorized the new route do you remove the old staircase (contract). Removing the old before everyone has migrated is the production-incident equivalent of a missed cue."
  misconception: "|"
  concept: "{\"definition\":\"Schema evolution is the discipline of changing a database schema over time in a way that keeps deployed application code working. The unit of work is a *change to the schema* (add a column, rename a column, change a type, add a constraint, drop a column) that must be applied to a database serving an application that does not stop running. The central technique is expand/contract (Ambler & Sadalage 2006; also called parallel change): introduce the new shape *additively* without removing the old shape (expand), migrate the application to use the new shape, then remove the old shape (contract). The discipline is the *ordering* across migrations and deploys, the backwards-and-forwards-compatibility envelope each intermediate state must satisfy, and the rollback discipline that keeps the system recoverable when any step fails. The mechanical execution of any single migration is the concern of database-migration; the *sequence* of migrations and their relationship to application deploys is this skill's concern.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/schema-evolution/SKILL.md
  skill_graph_export_description_projection: boundary
---

# Schema Evolution

## Coverage

The discipline of changing a database schema over time without breaking deployed application code. Covers the expand/contract (parallel change) pattern as the foundational technique, the backwards-and-forwards compatibility envelope each intermediate state must satisfy, the catalog of schema-change types and their safety profiles (additive, constraint-tightening, destructive, renaming, type-change), the backfill strategies (no-backfill, batched, background, dual-write-only, lazy), the dual-write / dual-read transition patterns, the deploy-ordering rules (migration-first vs code-first), and the relationship to the underlying database-migration tooling that executes individual steps.

## Philosophy

Schema and deployed code are co-evolving systems. The danger is desynchronization — schema changes break running code; code changes assume a schema that hasn't been deployed yet. Expand/contract is the protocol that keeps both sides compatible during transition: additively introduce the new shape, migrate, then contract the old.

The discipline is not in the individual ALTER TABLE statement (that's database-migration's concern). It is in the *sequencing* across migrations and deploys, the compatibility envelope at every intermediate point, and the rollback discipline that keeps the system recoverable when a step fails.

The most consequential phases are the boundaries — entering migrate (the dual-write/dual-read transition) and entering contract (the irreversible drop). Knowing the criteria for crossing each boundary is the operational hygiene that separates evolved systems from broken ones.

## The Expand / Migrate / Contract Phases

```
   ┌────────────────────────────────────────┐
   │ Phase 1: EXPAND                         │
   │ • Add new column / table / index        │
   │ • Old shape unchanged                   │
   │ • Old code continues working unchanged  │
   │ • New code can use new shape if deployed│
   │ • Rollback: drop new shape              │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 2: MIGRATE (multi-deploy)         │
   │ • Deploy code that dual-writes          │
   │ • Backfill existing data (batched)      │
   │ • Deploy code that dual-reads (new w/   │
   │   fallback to old)                      │
   │ • Verify production traffic on new      │
   │ • Deploy code that single-reads new     │
   │ • Rollback: revert code; old shape OK   │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 3: CONTRACT (irreversible)        │
   │ • Drop old column / table / index       │
   │ • No code references old shape          │
   │ • Rollback: impossible (data is gone)   │
   └────────────────────────────────────────┘
```

The time between expand-complete and contract-start is normally days or weeks, not minutes.

## Change-Type Safety Matrix

| Change | Single-step safe? | Pattern |
|---|---|---|
| Add nullable column | Yes | Direct ALTER |
| Add column with NOT NULL DEFAULT | Yes (in Postgres 11+ for constant defaults; verify per database) | Direct ALTER |
| Add column with NOT NULL no default | No | Expand: add nullable; backfill; add constraint with NOT VALID; VALIDATE |
| Add new table | Yes | Direct CREATE TABLE |
| Add index | Yes (with CONCURRENTLY in Postgres) | CREATE INDEX CONCURRENTLY |
| Add foreign key | No (validation locks) | ADD FK NOT VALID; then VALIDATE CONSTRAINT separately |
| Add CHECK constraint | No (validation locks) | Same NOT VALID + VALIDATE pattern |
| Add UNIQUE constraint | No (needs verified uniqueness) | Verify no duplicates; CREATE UNIQUE INDEX CONCURRENTLY; ADD CONSTRAINT USING INDEX |
| Drop column | No (deployed code references it) | Full expand/contract |
| Drop table | No (deployed code references it) | Full expand/contract |
| Drop index | Yes (only if no query relies on it) | DROP INDEX CONCURRENTLY |
| Rename column | No | Full expand/contract: add new; dual-write; backfill; switch reads; drop old |
| Rename table | No | Same expand/contract pattern |
| Change column type | No | Add new column; backfill with conversion; switch reads; drop old |
| Change DEFAULT | Yes | Direct ALTER (affects only future inserts) |

## The Deploy-Ordering Rule

| Direction | When safe | Risk |
|---|---|---|
| **Migration first, then code** | Migration is additive (column added; nothing depending on it) | Migration runs; old code keeps working; new code rolls out and uses new |
| **Code first, then migration** | Code is backwards-compatible with old schema | New code rolls out; tolerates old schema; migration runs; new code now uses new shape |
| **Coordinated (multi-step)** | Most non-trivial changes | Expand/migrate/contract spans multiple deploys |

The deploy-ordering choice is a design decision per change. The expand/contract pattern's value is that it makes the ordering *explicit* and *survivable* at every intermediate point.

## When To Contract

The criteria for crossing into the irreversible contract phase:

- [ ] All deployed code reads exclusively from the new shape (verified via code inspection or runtime monitoring).
- [ ] All deployed code writes exclusively to the new shape, or writes to both with the old write being redundant.
- [ ] The backfill is complete and verified — no existing rows have inconsistent state.
- [ ] Observability for the new shape is in place; the old shape's removal would not blind monitoring.
- [ ] The migrate phase has been stable in production for a defined observation period (typically days).
- [ ] Rollback path during the contract is not required — the team has decided the change is permanent.

Premature contract is a common cause of incidents. The contract phase is irreversible by definition.

## Verification

After applying this skill, verify:
- [ ] Every non-trivial schema change is planned as expand → migrate → contract, not as a single deploy.
- [ ] The compatibility envelope is explicit: which code versions are expected to run, and with which schema versions, at every intermediate point.
- [ ] Constraint-tightening changes use the NOT VALID + VALIDATE pattern (or equivalent in the specific database) to avoid blocking writes during validation.
- [ ] Index creation uses CONCURRENTLY (Postgres) or equivalent non-blocking mechanism.
- [ ] Dual-write / dual-read transitions have defined criteria for advancing to the next state — not "we'll know when we're ready."
- [ ] The contract phase has explicit verification criteria (above list) before it runs.
- [ ] Backfill jobs are batched (rows in tractable chunks) and resumable (can pick up where they left off after failure).
- [ ] Rollback is preserved through expand and migrate; the team accepts irreversibility only at contract.
- [ ] Migrations are reviewed for the *sequence* and the *envelope*, not just the syntax.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Executing one ALTER TABLE migration mechanically | `database-migration` | database-migration owns the mechanics; this owns the sequencing |
| Designing the schema from scratch | `data-modeling` | data-modeling owns design; this owns evolution |
| Deciding which indexes to maintain | `indexing-strategy` | indexing-strategy owns design; this owns how the index set evolves |
| Tuning a slow query | `query-optimization` | query-optimization owns retrieval performance; this owns schema change |
| Horizontal partitioning | `sharding-strategy` | sharding owns partition; this owns schema shape changes |
| Choosing isolation level | `transaction-isolation` | transaction-isolation owns concurrency; this owns shape |

## Key Sources

- Ambler, S. W., & Sadalage, P. J. (2006). *Refactoring Databases: Evolutionary Database Design*. Addison-Wesley. The canonical reference for the expand/contract pattern (called "Parallel Change" in some literature) and the broader catalog of database refactorings.
- Sadalage, P. J., & Fowler, M. ["Evolutionary Database Design"](https://martinfowler.com/articles/evodb.html). Practitioner essay summarizing the discipline of incremental schema change.
- Fowler, M. ["ParallelChange"](https://martinfowler.com/bliki/ParallelChange.html). Short reference on the parallel-change pattern as a general software-evolution technique (applies beyond databases).
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — ALTER TABLE"](https://www.postgresql.org/docs/current/sql-altertable.html). Reference for Postgres-specific safe-change patterns (NOT VALID, CONCURRENTLY, etc.).
- Strong Migrations (Ruby) and pt-online-schema-change (MySQL/Percona). Open-source tools that encode the safe-migration patterns and reject unsafe migrations at lint time.
- gh-ost (GitHub's online schema change tool for MySQL). Documented patterns for online schema change on large MySQL tables; useful framing for non-Postgres environments.
- Sandberg, R. (2021). ["Online Migrations at Scale"](https://stripe.com/blog/online-migrations) (Stripe Engineering Blog). Industrial case study on expand/contract at scale.
- Shopify Engineering. ["Adding a NOT NULL Column to a Table in Postgres"](https://shopify.engineering/safely-adding-not-null-columns-postgres). Industrial guide to one common change with detailed safety reasoning.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 4 covers schema evolution in distributed-data contexts including the document/wide-column store cases.
