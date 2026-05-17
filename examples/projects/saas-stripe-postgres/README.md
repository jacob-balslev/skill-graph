# saas-stripe-postgres — Skill Graph Example Project

This directory is an OSS specimen demonstrating Skill Graph on a realistic SaaS stack: Next.js App Router + Stripe webhooks + Postgres with row-level security. It is a documentation artifact, not a maintained starter kit.

**Purpose:** Show developers how to author, relate, and route skills for a payment-integrated, multi-tenant SaaS — so they can build their own skill library using the same patterns.

---

## Skill Graph Structure

Five specimen skills, each representing a distinct layer of the stack:

```
stripe-webhook-signature-verification
  │  depends_on  ──────────────────────────────────────┐
  │  boundary with nextjs-server-action-validation     │
  │  verify_with nextjs-server-action-validation       │
  ▼                                                     ▼
payment-provider-router              postgres-rls-pattern
  │  depends_on                          │  verify_with
  │  stripe-webhook-signature-verification│  migrate-orders-to-canonical-schema
  ▼                                     ▼
nextjs-server-action-validation  migrate-orders-to-canonical-schema
  │  depends_on postgres-rls-pattern      │  depends_on postgres-rls-pattern
  │  boundary stripe-webhook-...          │  boundary payment-provider-router
```

| Skill | Type | Scope | Domain |
|---|---|---|---|
| `stripe-webhook-signature-verification` | capability | portable | engineering/payments |
| `postgres-rls-pattern` | capability | portable | engineering/database |
| `nextjs-server-action-validation` | capability | portable | engineering/web |
| `payment-provider-router` | router | portable | engineering/payments |
| `migrate-orders-to-canonical-schema` | workflow | codebase | engineering/database |

---

## Routing Trace

**Query:** "How do I safely handle a Stripe webhook in a Next.js API route?"

This is the kind of question that activates multiple skills in sequence. Here is the routing trace showing which skills fire and why:

```
Input: "How do I safely handle a Stripe webhook in a Next.js API route?"

Step 1 — Router resolves candidates:
  MATCH  stripe-webhook-signature-verification
         trigger: "stripe-webhook-signature-verification"
         keywords: ["stripe webhook signature verification",
                    "webhook hmac verification",
                    "stripe constructEvent"]
         score: HIGH

  MATCH  payment-provider-router
         keywords: ["payment event routing", "stripe event type dispatch"]
         score: MEDIUM

  NO MATCH  nextjs-server-action-validation
            anti_examples: ["validate the stripe-signature header in a
                             webhook route handler"]
            → excluded by anti_example match

  NO MATCH  postgres-rls-pattern
            → no keyword/trigger overlap with webhook routing

Step 2 — Relation graph consulted:
  stripe-webhook-signature-verification.depends_on → postgres-rls-pattern
  (idempotency key INSERT runs inside orgQuery)
  → postgres-rls-pattern co-activated at lower priority

  stripe-webhook-signature-verification.boundary → payment-provider-router
  (verification is a precondition for routing)
  → payment-provider-router activated as step 2

Step 3 — Activation order:
  1. stripe-webhook-signature-verification  ← verify authenticity
  2. payment-provider-router                ← route to handler
  3. postgres-rls-pattern                   ← query layer (co-activated)

Output: Three skills activated in dependency order.
```

**Paste-able verification** (run from `examples/projects/saas-stripe-postgres/`):

```bash
# Verify the 5 skills pass schema validation (run from skill-graph repo root)
cd ~/Development/skill-graph
node scripts/skill-lint.js \
  examples/projects/saas-stripe-postgres/skills/stripe-webhook-signature-verification/SKILL.md \
  examples/projects/saas-stripe-postgres/skills/postgres-rls-pattern/SKILL.md \
  examples/projects/saas-stripe-postgres/skills/nextjs-server-action-validation/SKILL.md \
  examples/projects/saas-stripe-postgres/skills/payment-provider-router/SKILL.md \
  examples/projects/saas-stripe-postgres/skills/migrate-orders-to-canonical-schema/SKILL.md
```

Expected output (all 5 pass T5):
```
OK   [T5]  stripe-webhook-signature-verification/SKILL.md
OK   [T5]  postgres-rls-pattern/SKILL.md
OK   [T5]  nextjs-server-action-validation/SKILL.md
OK   [T5]  payment-provider-router/SKILL.md
OK   [T5]  migrate-orders-to-canonical-schema/SKILL.md
5 file(s) checked, 0 error(s)
```

---

## What Each Skill Demonstrates

### `stripe-webhook-signature-verification` — Skill Graph Contract: Pushy Description + Negative Boundary

The description reads as a command: "Use when validating incoming Stripe webhook requests... Do NOT use for general HTTP signature validation (use a generic crypto-signature skill)."

This is the Skill Graph pattern for descriptions: pushy trigger phrase + explicit negative boundary. Claude tends to under-trigger skills with polite descriptions ("This skill provides..."). Command-form descriptions force the router to match.

### `postgres-rls-pattern` — Skill Graph Contract: Portability

`scope: portable` + `portability.readiness: portable` declares this skill is codebase-agnostic. The orgQuery wrapper pattern works on any Postgres + Node.js project without modification.

### `nextjs-server-action-validation` — Skill Graph Contract: Anti-Examples

The `anti_examples` field prevents false positives:
```yaml
anti_examples:
  - "validate the stripe-signature header in a webhook route handler"
```
Without this, the router might activate this skill for a webhook validation query — both are about "validation". The anti_example explicitly signals: if the user is asking about `stripe-signature`, route to `stripe-webhook-signature-verification` instead.

### `payment-provider-router` — Skill Graph Contract: Router Archetype + Depends-On

`type: router` activates the router archetype section map: `## Coverage`, `## Routing Rules`, `## Do NOT Use When` (no Philosophy section). The `depends_on` relation declares that `stripe-webhook-signature-verification` must run before this router sees the event.

### `migrate-orders-to-canonical-schema` — Skill Graph Contract: Grounding

`scope: codebase` + `grounding.truth_sources` anchors this skill to actual files in the example project (`db/migrations/0004_canonicalize_orders.sql`, `db/schema.sql`). When those files change, the drift sentinel flags the skill as potentially stale. This is how Skill Graph prevents skills from becoming documentation that drifts from the code.

---

## Drift-Check Baseline

The drift sentinel records a content hash for `truth_sources` files. When either file changes, the skill's `drift_check.last_verified` becomes stale.

To record the current baseline (run from skill-graph repo root):

```bash
node scripts/skill-graph-drift.js \
  --record \
  --apply \
  examples/projects/saas-stripe-postgres/skills/migrate-orders-to-canonical-schema
```

The command reads the `truth_sources` paths from the skill frontmatter, hashes the file contents, and writes the hashes to `drift_check.truth_source_hashes`. Future runs of `npm run drift` compare the live hashes against the recorded baseline and report STALE when they diverge.

After recording, the skill frontmatter gains a `truth_source_hashes` block:

```yaml
drift_check:
  last_verified: "2026-05-18"
  truth_source_hashes:
    examples/projects/saas-stripe-postgres/db/migrations/0004_canonicalize_orders.sql: "sha256:<hash>"
    examples/projects/saas-stripe-postgres/db/schema.sql: "sha256:<hash>"
```

---

## Skills Referenced vs. Skills in This Project

The 5 skills cross-reference each other via `relations`. They also reference skills from the main Skill Graph library (e.g., `documentation`, `refactor`) via the `boundary` predicate — those skills must exist in the configured skill root (`../skills/skills/`) for the lint check to pass.

**Skills referenced from the library root** (must exist in `../skills/skills/`):

| Referenced by | Skill referenced | Via predicate |
|---|---|---|
| (all skills) | Standard library skills | (none in this example — intra-project only) |

These 5 specimens only cross-reference each other. They are self-contained within the example project.

---

## File Structure

```
examples/projects/saas-stripe-postgres/
├── README.md                        ← this file
├── db/
│   ├── schema.sql                   ← canonical table + RLS policy definitions
│   └── migrations/
│       └── 0004_canonicalize_orders.sql  ← Phase 1+2 of orders canonicalization
└── skills/
    ├── stripe-webhook-signature-verification/SKILL.md
    ├── postgres-rls-pattern/SKILL.md
    ├── nextjs-server-action-validation/SKILL.md
    ├── payment-provider-router/SKILL.md
    └── migrate-orders-to-canonical-schema/SKILL.md
```

---

## Why These 5 Skills?

These specimens were chosen by the IMPROVEMENT_PLAN 2026-05-06 board meeting (U19 edit) to demonstrate Skill Graph's contract on a realistic stack:

- **Stripe webhook + RLS + Server Action** covers the three most common "how do I do this securely?" questions in a SaaS codebase
- **Payment router** demonstrates the `type: router` archetype, distinct from `capability` and `workflow`
- **Migration** demonstrates `scope: codebase` grounding and the four-phase procedure pattern — the hardest migration category to get right

Each skill is a specimen for learning, not a production recommendation. The patterns are generic; adopt them and adapt them to your own codebase.
