---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: nextjs-server-action-validation
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when writing a Next.js Server Action that accepts user-submitted form data, mutation parameters, or any client-originated input. Every Server Action is a public HTTP endpoint regardless of how it is called — validate with Zod and check authentication as the first two operations before touching the database. Do NOT use for GET route handlers or Server Components that fetch data (those have no user-supplied input); do NOT use for Stripe webhook handlers (use stripe-webhook-signature-verification instead)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: frontend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Server-side input validation for Next.js Server Actions in the saas-stripe-postgres example — schema-validate untrusted form/RPC payloads at the server boundary before any mutation. Excludes external-webhook signature verification (stripe-webhook-signature-verification) and database-layer RLS enforcement (postgres-rls-pattern)."
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: engineering/web

# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`agent_runtimes`, `node_version`) over free-text `notes`.
compatibility:
  agent_runtimes:
    - node
  node_version: ">=20"
  notes: "Next.js App Router >=14 with server actions enabled; Zod >=3."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - next.js server action validation
  - zod input validation
  - server action security
  - server action auth check
  - server action public endpoint
  - use server directive
  - form action security
  - server action pattern
  - mutation validation
  - next.js app router actions
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - nextjs-server-action-validation
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "app/actions/*.ts"
  - "lib/actions/*.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "write a Server Action for the checkout form that validates the selected plan before creating a Stripe session"
  - "secure a Server Action so it rejects unauthenticated requests"
  - "validate user input with Zod in a Server Action before writing to Postgres"
  - "my Server Action is being called directly via fetch — is that safe?"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "validate the stripe-signature header in a webhook route handler"
  - "fetch data in a Server Component to display on a page"
  - "write a GET route handler that returns public product data"
# relations: typed graph edges to sibling skills. Current fields:
# related (adjacency for browse / co-routing expansion) /
# suppresses (exclude listed skills from co-routing when THIS skill wins; write reason
#             as "I own this exclusively over X", not "use X instead") /
# boundary (DEPRECATED alias of suppresses, retained for unmigrated skills) /
# verify_with (cross-check; co-loaded as one-hop expansion) /
# depends_on (composition; transitive — A→B→C loads all three) /
# broader / narrower (SKOS-style generalization) /
# disjoint_with (mutual exclusion for incompatible ownership).
relations:
  related:
    - stripe-webhook-signature-verification
    - postgres-rls-pattern
  depends_on:
    - postgres-rls-pattern
  verify_with:
    - stripe-webhook-signature-verification
---

# Next.js Server Action Validation

## Concept of the skill

**What it is:** The validation and authorization discipline for Next.js Server Actions that accept client-originated input.
**Mental model:** A Server Action is a public POST endpoint wearing function-call syntax.
**Why it exists:** Convenience syntax can hide the HTTP boundary, leading developers to skip auth, input validation, or org scoping.
**What it is NOT:** It is not GET route handling, Server Component data fetching, or Stripe webhook verification.
**Adjacent concepts:** Zod schemas, auth checks, org-scoped mutations, controlled error surfaces.
**One-line analogy:** It is the security checkpoint every form submission crosses before touching the database.
**Common misconception:** Only the project UI can call the action; any HTTP client can call the generated endpoint.

## Coverage

- The public endpoint reality — `'use server'` functions are exposed as POST endpoints that any HTTP client can call directly; the Next.js call graph is not a security boundary
- Validation order — auth check BEFORE Zod parse, Zod parse BEFORE database access; any other order produces an exploitable window
- Zod schema design for actions — using `.safeParse()` over `.parse()` to return structured errors rather than throwing; returning `{ error: ... }` shapes that the calling Client Component can render
- Org-scoping after authentication — verifying that `input.orgId` matches the session's org, not just that the user is logged in
- Error surface control — how `try/catch` around database calls prevents internal errors from propagating to the client response

## Philosophy of the skill

Server Actions are a convenience feature that makes form submission feel like a function call. That convenience obscures a critical fact: the action is a public HTTP POST endpoint. A developer who writes `const { data } = await myAction(formData)` in a Client Component is writing what looks like a local function call, but the runtime sends an HTTP request that any script can replicate. Skipping auth or validation because "it's called from our own UI" is the same reasoning that made `getServerSideProps` data-fetching functions leaky in the Pages Router — the server boundary does not restrict callers.

## Standard Action Pattern

```typescript
"use server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { orgQuery } from "@/lib/db";

const CreateOrderSchema = z.object({
  orgId: z.string().uuid(),
  planId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function createOrder(input: unknown) {
  // 1. Auth check — before anything else
  const session = await getServerSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // 2. Zod parse — structured errors, not thrown exceptions
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 3. Org-scope check — user must belong to the org they are acting on
  if (session.user.orgId !== parsed.data.orgId) {
    return { error: "Forbidden" };
  }

  // 4. Database write — inside orgQuery for RLS enforcement
  try {
    const [order] = await orgQuery(parsed.data.orgId, (tx) =>
      tx`INSERT INTO orders (org_id, plan_id, quantity) VALUES (
          ${parsed.data.orgId}, ${parsed.data.planId}, ${parsed.data.quantity}
        ) RETURNING *`
    );
    return { data: order };
  } catch {
    return { error: "Failed to create order" };
  }
}
```

## Validation Order Rationale

| Order | Risk |
|---|---|
| Auth → Zod → orgScope → DB | Correct — each gate eliminates the next attack surface |
| Zod → Auth → DB | Attacker can probe the schema structure without authenticating |
| Auth → DB (no Zod) | Malformed input reaches the query layer; injection risk |
| DB → Auth (anywhere) | Unauthenticated database reads before rejection |

## Verification

- [ ] Every `'use server'` function calls `getServerSession()` as its first statement
- [ ] Every `'use server'` function runs `Schema.safeParse()` before any database call
- [ ] The session org ID is compared to the input org ID before the database call
- [ ] Database calls are wrapped in `orgQuery`, not bare SQL
- [ ] Errors returned to the client do not include stack traces or query text

## Do NOT Use When

| Use instead | When |
|---|---|
| `stripe-webhook-signature-verification` | The entry point is a webhook route handler, not a Server Action |
| (a data-fetching skill) | The function is a Server Component that fetches data, with no user-submitted input |
| `postgres-rls-pattern` | The task is defining the database-layer policy, not the action-layer validation |
