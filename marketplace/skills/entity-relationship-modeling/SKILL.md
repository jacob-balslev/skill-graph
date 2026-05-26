---
name: entity-relationship-modeling
description: "Use when designing database tables, reviewing schema changes, planning migrations, or translating conceptual models into physical database structures. Covers ER notation, entity/attribute/key design, normalization and denormalization, junction tables, inheritance mapping, temporal modeling, ER-to-SQL translation, indexing, and constraints. Do NOT use for conceptual domain analysis (use `conceptual-modeling`), formal ontology (use `ontology`), or cross-system API contracts (use `system-interface-contracts`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: engineering
  subject: code-engineering
  domain: engineering/modeling
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-29"
  drift_check: "{\"last_verified\":\"2026-03-29\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"entity relationship\",\"ER diagram\",\"ER model\",\"database design\",\"schema design\",\"normalization\",\"foreign key\",\"primary key\",\"junction table\",\"database modeling\"]"
  triggers: "[\"er-modeling-skill\",\"database-design-skill\"]"
  relations: "{\"related\":[\"database-migration\",\"data-modeling\"],\"boundary\":[\"conceptual-modeling\"],\"verify_with\":[\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/entity-relationship-modeling/SKILL.md
---
# Entity-Relationship Modeling

## Domain Context

**What is this skill?** This skill provides entity-relationship (ER) modeling patterns for designing database schemas from domain requirements: Chen notation and Crow's Foot notation, entity identification and attribute analysis, primary/foreign key design, normalization (1NF through BCNF), denormalization trade-offs, junction table patterns, inheritance mapping strategies (single-table, class-table, concrete-table), temporal data modeling, and schema evolution/migration patterns. Covers the ER-to-SQL translation pipeline, indexing strategy from access patterns, constraint specification (NOT NULL, UNIQUE, CHECK, FK), and anti-patterns like EAV abuse, polymorphic associations, and over-normalization. Use when designing new database tables, reviewing schema changes, planning migrations, or translating conceptual models into physical database structures. Do NOT use for conceptual domain analysis (use `conceptual-modeling`), formal ontology (use `ontology`), or cross-system data mapping (use `relational-mapping`).

## Coverage

Entity-relationship modeling for database schema design: Chen notation and Crow's Foot notation, entity identification and attribute analysis, primary/foreign key design (natural vs. surrogate, UUID vs. serial), normalization forms (1NF through BCNF) with trade-off analysis, denormalization patterns for read performance, junction table design for M:N relationships, inheritance mapping strategies (single-table, class-table, concrete-table), temporal data modeling (SCD Type 1/2/3, bi-temporal), schema evolution and migration patterns, ER-to-SQL translation, indexing strategy from access patterns, constraint specification (NOT NULL, UNIQUE, CHECK, FK, EXCLUDE), and anti-patterns (EAV, polymorphic associations, over-normalization, mega-tables). Does not cover conceptual domain analysis (`conceptual-modeling`), formal ontology (`ontology`), or cross-system data mapping (`relational-mapping`).

## Philosophy

A database schema is a commitment about what the business considers true. Every table is a claim that a category of things exists; every foreign key is a claim that two categories are related; every constraint is a claim about what the business considers valid. Bad ER design does not just cause slow queries — it causes business logic bugs, data integrity violations, and migration nightmares. This skill exists because agents commonly produce schemas that "work" for the happy path but fail under real-world conditions: concurrent updates, schema evolution, multi-tenancy, and audit requirements. The goal is schemas that are correct first, performant second, and evolvable always.

## 1. Entity Identification

### What Makes a Good Entity

| Criterion | Pass | Fail |
|-----------|------|------|
| **Has identity** | Two orders can be distinguished by ID | "OrderType" — just an enum value |
| **Has multiple attributes** | Order has status, amount, date, customer | "Color" with just a name |
| **Has a lifecycle** | Order transitions through states | A constant lookup value |
| **Participates in relationships** | Order belongs to Customer, has LineItems | An isolated value with no connections |
| **Business users name it** | "Customer," "Product," "Order" | "DataRecord," "Item," "Thing" |

### Entity vs. Attribute vs. Relationship

| If it has... | It is probably... |
|-------------|-------------------|
| Multiple attributes of its own | An entity |
| Only a name/label | An attribute (or enum) |
| Attributes that describe a connection | A relationship entity (reified relationship) |
| Multiple instances per parent | A child entity (not a multi-valued attribute) |

## 2. Primary Key Design

> For philosophical identity questions (what makes two entities "the same"), see `ontology`. This section covers the database implementation of those decisions.

| Strategy | When to use | Trade-offs |
|----------|-------------|-----------|
| **UUID (v4 or v7)** | Distributed systems, multi-tenancy, external exposure | 16 bytes, not sortable (v4), not human-readable |
| **UUID v7** | Need sortable UUIDs for index performance | Timestamp-prefixed, best of both worlds |
| **Serial/BIGSERIAL** | Single-database, internal only | Compact, sortable, but reveals sequence |
| **Natural key** | Immutable business identifier (ISO codes, SKUs) | Only if truly immutable; rare in practice |
| **Composite key** | Junction tables, external system references | Complex JOINs, ORM friction |

Rules:
- Default to UUID v7 for new tables in multi-tenant SaaS (sortable, no sequence leakage, distributed-safe).
- Never expose serial IDs externally (information leakage: competitor can count your orders).
- Natural keys are tempting but dangerous — "immutable" business identifiers change more often than you think.

## 3. Relationship Patterns

### Cardinality Implementation

| Relationship | Implementation |
|-------------|---------------|
| **1:1** | FK with UNIQUE on child table, or merge into one table |
| **1:N** | FK on the N-side (child) referencing parent PK |
| **M:N** | Junction table with two FKs + composite UNIQUE |
| **M:N with attributes** | Junction table promoted to entity (with its own PK and additional columns) |
| **Self-referential** | FK referencing same table (e.g., `manager_id` → `employees.id`) |
| **Polymorphic** | Avoid; use junction tables per type or single FK with type discriminator |

### Junction Table Design

```sql
-- Simple M:N
CREATE TABLE product_categories (
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- M:N with attributes (promoted to entity)
CREATE TABLE order_line_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id),
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

## 4. Normalization

| Form | Rule | Violation example | Fix |
|------|------|-------------------|-----|
| **1NF** | Atomic values, no repeating groups | `tags: "red,blue,green"` | Separate table for tags |
| **2NF** | No partial dependencies (all non-key attributes depend on entire PK) | Junction table with attributes depending on only one FK | Move to parent table or new entity |
| **3NF** | No transitive dependencies (non-key attributes don't depend on other non-key attributes) | `order.customer_name` duplicating `customer.name` | Remove; join when needed |
| **BCNF** | Every determinant is a candidate key | Rare in practice; usually 3NF suffices | Decompose table |

Rules:
- Normalize to 3NF by default for transactional tables.
- Denormalize deliberately for read-heavy analytics with documented justification.
- Never skip normalization analysis — even if you plan to denormalize, understanding the normal form reveals the true dependencies.

## 5. Denormalization Patterns

| Pattern | When | Risk |
|---------|------|------|
| **Materialized view** | Read-heavy aggregations, dashboards | Staleness, refresh overhead |
| **Computed column** | Frequently derived values | Must be maintained on writes |
| **Redundant column** | Avoid frequent JOINs for hot queries | Update anomalies |
| **JSON column** | Flexible schema within structured data | Query complexity, no FK enforcement |
| **Pre-aggregated table** | Time-series rollups, analytics | Dual-write consistency |

Rules:
- Every denormalization must document: what is denormalized, why, and how consistency is maintained.
- Prefer materialized views (DB-maintained) over application-level redundancy (app-maintained).
- JSON columns are not a substitute for proper entity design; use only for genuinely flexible/unstructured data.

## 6. Inheritance Mapping

| Strategy | When | Trade-offs |
|----------|------|-----------|
| **Single-table** (STI) | Few subtypes, similar attributes, simple queries | Nullable columns, wasted space |
| **Class-table** | Many shared attributes, need FK to parent | JOIN overhead, complex inserts |
| **Concrete-table** | Subtypes are queried independently, few shared operations | No polymorphic queries, attribute duplication |

### Decision Matrix

| Criterion | Single-table | Class-table | Concrete-table |
|-----------|-------------|-------------|----------------|
| Query simplicity | Best | Worst | Medium |
| Storage efficiency | Worst | Best | Medium |
| Polymorphic queries | Built-in | Requires JOIN | Requires UNION |
| Subtype isolation | None | Partial | Full |
| Schema evolution | Easy (add column) | Medium (alter multiple) | Hard (alter each) |

Rules:
- Default to single-table inheritance for <= 3 subtypes with mostly shared attributes.
- Switch to class-table when subtypes diverge significantly (many subtype-specific columns).
- Concrete-table only when subtypes are operationally independent and never queried together.

## 7. Temporal Data Modeling

| Pattern | Tracks | Implementation |
|---------|--------|---------------|
| **SCD Type 1** | Current value only (overwrite) | Simple UPDATE |
| **SCD Type 2** | Full history with validity periods | `valid_from`, `valid_to`, `is_current` |
| **SCD Type 3** | Previous + current value | `current_value`, `previous_value` columns |
| **Bi-temporal** | Both business time and system time | `valid_from`, `valid_to`, `recorded_at`, `superseded_at` |

Rules:
- Financial data requires at minimum SCD Type 2 (full audit trail).
- Use `valid_to IS NULL` or a boolean `is_current` flag for efficient current-value queries.
- Bi-temporal modeling is necessary when you need to answer "what did we think was true on date X about date Y?"

## 8. Constraint Specification

| Constraint | Purpose | Example |
|-----------|---------|---------|
| `NOT NULL` | Attribute is mandatory | Every order has a customer |
| `UNIQUE` | No duplicate values | Email addresses |
| `CHECK` | Business rule enforcement | `quantity > 0`, `amount_cents >= 0` |
| `FOREIGN KEY` | Referential integrity | Order references Customer |
| `EXCLUDE` | No overlapping ranges | Booking date ranges |
| `DEFAULT` | Sensible initial value | `created_at DEFAULT now()` |

Rules:
- Push validation to the database whenever possible. Application-level validation can be bypassed; DB constraints cannot.
- Every financial amount column needs `CHECK (amount >= 0)` or explicit handling of negatives.
- Prefer `ON DELETE CASCADE` for composition (line items); `ON DELETE RESTRICT` for association (customer has orders).

## 9. Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| **EAV (Entity-Attribute-Value)** | Generic `key/value` table instead of proper columns | Design explicit entities; use JSON column for genuinely dynamic attributes |
| **Polymorphic association** | One FK column + type discriminator pointing to multiple tables | Separate FK per related table, or junction table per relationship type |
| **Mega-table** | 50+ columns, many nullable | Decompose into related entities by business concern |
| **Over-normalization** | 15 JOINs for a simple query | Selectively denormalize with materialized views |
| **God table** | One table serves orders, invoices, quotes, and returns | Separate by business entity; share via FK to common parent if needed |
| **Missing constraints** | No CHECK, FK, or UNIQUE — all validation in app code | Add database-level constraints as the source of truth |
| **Implicit deletion** | `is_deleted` boolean instead of proper lifecycle | Use soft delete with `deleted_at` timestamp, or archive tables |

## Verification

> **Scope note:** This checklist covers the implementation (ER) layer — primary keys, foreign keys, normalization, and index strategy. For relationship-level verification (named associations, semantic cardinality), use [`conceptual-modeling`]. For axiom-level verification (formal class definitions, property domains/ranges), use [`ontology`].

After applying this skill, verify:
- [ ] Primary keys are defined for every entity with an explicit strategy (UUID v7 preferred for new tables)
- [ ] Foreign keys correctly reference parent PKs with explicit ON DELETE behavior (CASCADE for composition, RESTRICT for association)
- [ ] Normalization level is documented (3NF for OLTP default; any denormalization is justified and documented)
- [ ] Index strategy is documented — at minimum, covering PKs, FK columns, and query predicates for hot paths
- [ ] Financial columns have CHECK constraints for valid ranges (`amount >= 0` or explicit negatives handling)
- [ ] Temporal data has the appropriate SCD type for audit requirements
- [ ] No EAV or polymorphic association patterns without explicit justification

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Analyzing business requirements into implementation-independent domain concepts | `conceptual-modeling` | Conceptual modeling captures the domain; ER modeling implements the storage |
| Defining formal type hierarchies with reasoning and axioms | `ontology` | Ontology is the philosophical layer; ER modeling is the physical layer |
| Mapping entities between different systems or representations | `relational-mapping` | Relational mapping connects systems; ER modeling designs one system's schema |
| Running SQL migrations on Neon Postgres | `database-migration` | Migration handles the change process; ER modeling handles the target design |

---

*Version 1.0.0 — 2026-03-29. Initial creation.*
