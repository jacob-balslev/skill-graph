---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: nextjs-server-action-validation
description: "Use when authoring or reviewing Next.js Server Actions — applying schema validation (Zod or equivalent) to form input, returning typed error shapes the form can render, handling the `useFormState` lifecycle, and avoiding the classic 'trust the client' failure where validation runs only in the browser. Activate this skill whenever the task touches a function annotated with `'use server'`, mentions `useFormState` or `useFormStatus`, or asks how to validate form data on a server action. Do NOT use for tRPC or REST API validation (different concern), or for client-side form UX patterns alone (use a forms skill)."
version: 0.1.0
type: capability
browse_category: engineering
category: framework/nextjs/server-actions
scope: portable
owner: saas-stripe-postgres-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Next.js 14+ App Router with Server Actions enabled; Zod ^3 (or equivalent runtime validator)"
allowed-tools: Read Grep
keywords:
  - server action
  - server actions
  - next.js server action
  - "'use server'"
  - useFormState
  - useFormStatus
  - server action validation
  - zod server action
  - typed form errors
  - server action security
  - form data validation
  - revalidatePath
  - form action
triggers:
  - nextjs-server-action-validation
examples:
  - "validate this checkout server action with Zod and return typed errors"
  - "my useFormState action returns plain strings — wire it to render structured field errors"
  - "review this server action — it trusts the client to have already validated the form"
  - "convert this REST endpoint to a Server Action and keep the validation contract"
anti_examples:
  - "validate the body of this tRPC mutation"                       # tRPC, not Server Actions
  - "make this React form prettier"                                  # client UX, not server validation
  - "the server action throws but the form does not show the error"  # debugging the rendering bug, not validation pattern
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose explaining Server Actions; this skill enforces the validation primitive in code"
    - skill: refactor
      reason: "refactor reshapes code; this skill enforces a specific validation contract that must survive any refactor"
    - skill: debugging
      reason: "debugging chases a specific server-action failure; this skill is the authoring discipline applied before failure"
  verify_with:
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - agent-skills
project_tags:
  - next.js
  - react
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---

# Next.js Server Action Validation

## Coverage

- The `'use server'` directive — what it actually does to the function (RPC bridge), why it changes how you reason about input trust, and which patterns become available vs unavailable
- Schema validation with Zod (or an equivalent runtime validator) at the **server** entry point — never at the client form alone
- The `useFormState` typed-error contract — how the action's return type becomes the form's render input, and the discriminated-union pattern for `{ status: 'success' } | { status: 'error', fieldErrors: Record<string,string[]> }`
- `revalidatePath` and `revalidateTag` discipline — when to call them after a mutation succeeds, and the failure mode where stale UI persists because revalidation was forgotten
- Authorization at the action boundary — server actions are publicly callable RPC endpoints; the `auth()` check inside the action is mandatory, not optional
- The cross-cutting concern of CSRF — Next.js Server Actions ship with origin protection by default, but custom action endpoints (e.g. exposed via API routes for non-React clients) must add their own check

## Philosophy

A Server Action looks like a function call but behaves like an HTTP endpoint. Treating it as the former — trusting the input shape, skipping the auth check, omitting the validation step "because the form already did it" — collapses every guarantee the type system gave you on the client side. The runtime types of the inputs to a Server Action are always `unknown`; only a runtime validator can refine them to typed values. The function-call ergonomics are a developer-experience win, not a security model. The discipline is: validate every input at the action boundary, return a typed result the form can render, and assume the client has been replaced by curl.

## Verification

Use this checklist before merging any new or modified Server Action:

- [ ] The action begins with a runtime schema validation (Zod `.parse()` or `.safeParse()`) of every input, not just a TypeScript cast
- [ ] The action's return type is a discriminated union the form can render — not a thrown exception, not a redirect-on-error string
- [ ] An `auth()` check runs before any side-effect or database read — server actions are publicly callable, not gated by client routing
- [ ] Successful mutations call `revalidatePath` or `revalidateTag` to keep the UI in sync — silent stale-data regressions trace back to this gap
- [ ] If the action is exposed outside the same-origin React form (e.g., wrapped in a custom API route), the CSRF guarantee is re-established explicitly
- [ ] A test harness exercises the action with malformed input (missing fields, wrong types, oversized strings) and asserts the typed error shape — not a thrown exception

## Do NOT Use When

| Use instead | When |
|---|---|
| (a tRPC validation skill) | The mutation goes through tRPC, not a Server Action — different lifecycle, different validation surface |
| (a forms-UX skill) | The task is purely about client-side form behavior (focus management, optimistic UI, etc.) |
| `debugging` | A specific server-action call is failing in production and you need to reproduce + isolate it |
| `documentation` | The task is writing a reference or tutorial about Server Actions |
