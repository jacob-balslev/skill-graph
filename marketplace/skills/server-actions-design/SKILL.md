---
name: server-actions-design
description: "Use when designing or reviewing React Server Functions / Next.js Server Actions for mutations: the 'use server' directive, function-to-POST endpoint semantics, form integration through action/formAction, React useActionState and useFormStatus, progressive enhancement, server-side validation, authentication, authorization, rate limiting, cache revalidation, redirect/refresh/updateTag behavior, bound arguments, and the security boundary that makes actions public HTTP endpoints despite function-like syntax. Covers Next.js App Router as the canonical implementation. Do NOT use for read-path data fetching with React Server Components (use server-components-design), broader serialization/directive mechanics (use client-server-boundary), externally consumed API contracts (use api-design), or form visual/interaction UX (use form-ux-architecture). Do NOT use for choose between SSR and SSG (use rendering-models). Do NOT use for debug React hook dependency arrays in a client form (use hooks-patterns)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-engineering
  public: "true"
  scope: "Teaching the portable mutation-design discipline for React Server Functions and Next.js Server Actions: when a 'use server' function becomes an invokable POST endpoint, how form action/formAction integration preserves progressive enhancement, how useActionState and useFormStatus report mutation state, how to validate and authorize untrusted arguments, how to revalidate or refresh UI after writes, and how to choose between an in-app action and a public API contract. Applies to Next.js App Router mutations and form submissions. Excludes read-path Server Component fetching (server-components-design), general client/server serialization mechanics (client-server-boundary), public REST/GraphQL/mobile/third-party API design (api-design), and visual form UX or accessibility details (form-ux-architecture)."
  taxonomy_domain: engineering/frontend
  grounding: "{\"subject_matter\":\"React Server Functions and Next.js Server Actions for App Router mutations\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://nextjs.org/docs/app/getting-started/mutating-data\",\"https://nextjs.org/docs/app/api-reference/directives/use-server\",\"https://nextjs.org/docs/app/guides/data-security\",\"https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions\",\"https://nextjs.org/docs/app/api-reference/functions/revalidatePath\",\"https://nextjs.org/docs/app/api-reference/functions/revalidateTag\",\"https://nextjs.org/docs/app/api-reference/functions/updateTag\",\"https://nextjs.org/docs/app/api-reference/functions/refresh\",\"https://react.dev/reference/react/useActionState\",\"https://react.dev/reference/react-dom/hooks/useFormStatus\"],\"failure_modes\":[\"Treating 'use server' as internal-only instead of a public POST endpoint\",\"Relying on TypeScript call signatures or UI controls instead of server-side parsing and authorization\",\"Using Server Actions for third-party/mobile/public API contracts that need stable HTTP semantics\",\"Forgetting cache revalidation/refresh after writes\",\"Using event handlers or startTransition for forms that should preserve progressive enhancement\",\"Leaving old useFormState or stale Server Actions-only terminology unconnected to current Server Functions wording\"],\"evidence_priority\":\"general_knowledge_first\"}"
  stability: experimental
  keywords: "[\"Server Actions\",\"Server Functions\",\"use server\",\"form action attribute\",\"formAction\",\"useActionState\",\"useFormStatus\",\"revalidatePath\",\"updateTag\",\"Next.js mutation\"]"
  triggers: "[\"how do I submit a form to the server\",\"do I need an API route for this mutation\",\"how do I call a server function from a button\",\"why is my Server Action exposed as an endpoint\",\"useActionState vs useFormState\",\"how do I revalidate after mutation\",\"can Server Actions run in event handlers\",\"how do I use updateTag after a Server Action\"]"
  examples: "[\"design a create-comment form using a Server Action and useActionState so it works without JavaScript and reports server-side validation errors\",\"decide whether a delete button should call a Server Action or an API route\",\"audit a Server Action for missing authorization even though it looks like a normal imported function\",\"design the cache revalidation strategy for a mutation that changes multiple cached routes\",\"review whether bound action arguments are safe for this edit form\"]"
  anti_examples: "[\"design a Server Component that reads data on render (use server-components-design)\",\"design a public REST API consumed by mobile clients or third parties (use api-design)\",\"choose between SSR and SSG (use rendering-models)\",\"design the visual UX and accessibility of a form's validation states (use form-ux-architecture)\",\"explain the whole use client serialization boundary (use client-server-boundary)\",\"debug React hook dependency arrays in a client form (use hooks-patterns)\"]"
  relations: "{\"related\":[\"server-components-design\",\"client-server-boundary\",\"form-ux-architecture\",\"api-design\",\"hooks-patterns\",\"security-fundamentals\",\"http-semantics\"],\"suppresses\":[{\"skill\":\"server-components-design\",\"reason\":\"server-components-design owns the read path where Server Components fetch data during render; server-actions-design owns the write path where a client-triggered mutation runs on the server.\"}],\"verify_with\":[\"client-server-boundary\",\"server-components-design\",\"api-design\",\"security-fundamentals\",\"form-ux-architecture\",\"hooks-patterns\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A Server Action is like a service-counter form wired straight to the back office: the customer fills out normal paperwork, the clerk executes privileged work behind the counter, and the office must still check identity, authority, and the paperwork before changing records."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/server-actions-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Server Actions Design

## Concept of the skill

Server Actions design is the discipline of using React Server Functions for App Router mutations without forgetting that the function-shaped API is still an HTTP boundary. A form or client transition serializes untrusted values, sends a POST to a generated server endpoint, executes privileged code server-side, then returns action state and optionally refreshed UI — so the practitioner must treat every argument as attacker-controlled and every visible read path as stale until revalidated or refreshed. The model exists because Server Actions reduce duplicated client/server mutation code, preserve form-first progressive enhancement, and integrate with the Next.js cache; but that same convenience can hide authentication, authorization, validation, and cache-invalidation mistakes behind ordinary-looking function calls. It is **not** Server Component read-path design, a public API contract, the whole client/server serialization model, form visual UX, or general hook discipline: `server-components-design` owns reads, `client-server-boundary` owns serialization/directive mechanics, `api-design` owns stable external HTTP contracts, `security-fundamentals` checks trust boundaries, `form-ux-architecture` owns the user-facing form experience, and `hooks-patterns` owns general Client Component hook rules. The one-line analogy: a Server Action is a privileged back-office operation triggered by a normal form; the form is convenient, but the office still checks identity, authority, and paperwork. The common misconception to correct is that a Server Action is private merely because the client imports it like a function — it is a reachable POST endpoint with framework protections that do not replace authorization or validation.

## Coverage

The design discipline for React Server Functions and Next.js Server Actions used as mutations: where to place `'use server'`, how actions become POST endpoints, how forms invoke actions through `action` and `formAction`, how `useActionState` and `useFormStatus` expose state and pending UI, how progressive enhancement constrains the design, how to validate and authorize inputs, how to choose cache revalidation primitives, and when to use a route handler or public API instead.

Use the current vocabulary deliberately:

| Term | Meaning |
|---|---|
| Server Function | React's broader async server-executed function primitive. |
| Server Action | A Server Function used in an action or mutation context, commonly through forms or transitions. |
| `'use server'` | The directive that marks an async function or module's exports as server-executed. |
| Action endpoint | The generated POST endpoint the framework uses to invoke the server function. |

## Philosophy of the skill

Before Server Actions, a browser mutation usually required two parallel structures: client code that called `fetch('/api/foo', { method: 'POST', body: ... })` and a server route handler that parsed the request, validated it, authorized it, executed the mutation, and serialized a response. The two sides had to agree on a wire format and failure shape.

Server Actions collapse that into one server-side declaration that the UI can bind to a form. This removes boilerplate and drift. It also makes the dangerous part easier to miss: the collapse is syntactic, not semantic. The server still receives serialized input over HTTP from a caller that may not be your UI. Treat the function as a public endpoint disguised as a function.

The second principle is progressive enhancement. A form wired with `<form action={serverAction}>` can submit before client JavaScript is loaded and can still be enhanced after hydration. Designing the mutation around click handlers, local-only state, or event-only invocation throws away one of the major reasons to use actions.

## The `'use server'` Contract

Use one of these declaration shapes:

| Shape | Use when | Constraint |
|---|---|---|
| Module-level directive | A shared actions file is imported by Server and Client Components. | All exports in the file are server functions. |
| Inline directive inside a Server Component | The action needs server-side closure context from the component render. | It can be passed to a form or button from that Server Component. |
| Imported action in a Client Component | The Client Component needs to invoke the action through a form, button, transition, or event. | The action must live in a module-level `'use server'` file. |

```ts
// app/actions/comments.ts
'use server'

export async function createComment(formData: FormData) {
  // runs on the server
}
```

```tsx
// app/posts/[id]/page.tsx - Server Component
export default async function PostPage() {
  async function addComment(formData: FormData) {
    'use server'
    // can close over server-side render state
  }

  return <form action={addComment}>...</form>
}
```

Arguments and return values must be serializable by React. Treat the apparent TypeScript signature as developer ergonomics, not runtime validation. The browser can submit different bytes than the UI would produce.

## Form-First Mutation Pattern

The canonical action consumes `FormData`, validates it on the server, checks the session and permissions, mutates, then updates the read path.

```tsx
'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/auth'
import { db } from '@/db'

const CommentInput = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(1000),
})

export async function addComment(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const parsed = CommentInput.safeParse({
    postId: formData.get('postId'),
    body: formData.get('body'),
  })

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }

  const canComment = await db.post.canComment({
    postId: parsed.data.postId,
    userId: session.user.id,
  })

  if (!canComment) {
    return { ok: false, error: 'Forbidden' }
  }

  await db.comment.create({
    data: {
      postId: parsed.data.postId,
      body: parsed.data.body,
      authorId: session.user.id,
    },
  })

  revalidatePath(`/posts/${parsed.data.postId}`)
  return { ok: true }
}
```

```tsx
<form action={addComment}>
  <input type="hidden" name="postId" value={postId} />
  <textarea name="body" required />
  <button type="submit">Post</button>
</form>
```

Hidden inputs are user-controlled. Use them for convenience, not authority. The action decides whether the authenticated user may mutate the referenced resource.

## `useActionState` and `useFormStatus`

`useActionState` wraps an action and gives the client the latest returned state plus a form action to pass into `<form action={...}>`.

The server function used with `useActionState` accepts the previous state first and the submitted `FormData` second. It can delegate to the plain form action if you want one mutation implementation:

```ts
'use server'

type CommentState =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> }

export async function addCommentWithState(
  _previousState: CommentState,
  formData: FormData,
): Promise<CommentState> {
  return addComment(formData)
}
```

```tsx
'use client'

import { useActionState } from 'react'
import { addCommentWithState } from '@/app/actions/comments'

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction, isPending] = useActionState(addCommentWithState, { ok: true })

  return (
    <form action={formAction}>
      <input type="hidden" name="postId" value={postId} />
      <textarea name="body" />
      {!state.ok && <p>{state.error ?? state.fieldErrors?.body?.[0]}</p>}
      <button disabled={isPending}>{isPending ? 'Posting...' : 'Post'}</button>
    </form>
  )
}
```

When a function is wrapped by `useActionState` and used as a form action, React passes the previous state as the first argument and the submitted `FormData` as the next argument. Design the server function signature for that shape when using the hook.

`useFormStatus` reads status from a descendant of the nearest parent form.

```tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Saving...' : 'Save'}</button>
}
```

It does not observe a form rendered in the same component that calls the hook. Put the submit button in a child component.

## Cache And Navigation After Writes

A mutation that changes data visible to Server Components must update the relevant cached read path or router state.

| Primitive | Use when | Notes |
|---|---|---|
| `revalidatePath(path, type?)` | A specific page, layout, or route handler cache should be invalidated. | In Server Functions it can update the currently viewed affected path immediately; dynamic route patterns need `type`. |
| `revalidateTag(tag, 'max')` | Tagged cached data can be stale while fresh data loads in the background. | Can be called in Server Functions and Route Handlers; immediate-expiration form is deprecated unless using explicit advanced options. |
| `updateTag(tag)` | A Server Action needs read-your-own-writes for tagged cached data. | Server Actions only; immediately expires the tag so the next request waits for fresh data. |
| `refresh()` | The current client router should refresh from inside a Server Action. | Server Actions only; use when router state must be refreshed and a path/tag invalidation is not the right primitive. |
| `redirect(path)` | Successful mutation should navigate somewhere else. | Throws a framework-handled control-flow exception; call cache updates first and avoid swallowing it in `catch`. |

If the action mutates database state and returns `ok: true` but never revalidates, the UI can continue showing stale data. Choose the smallest primitive that makes the user's next read correct.

## Bound Arguments And Closures

`bind` can pre-fill action arguments:

```tsx
const deletePost = deletePostAction.bind(null, post.id)

return (
  <form action={deletePost}>
    <button type="submit">Delete</button>
  </form>
)
```

Bound values are not a security boundary. Use them to avoid hidden inputs or simplify call sites, but never bind secrets and never skip authorization. Next.js can encrypt closed-over variables for inline actions, but the docs warn not to rely on encryption alone to prevent sensitive exposure. The action must still re-read current server truth and authorize the operation when invoked.

## Security Discipline

| Concern | Required design choice |
|---|---|
| Public endpoint semantics | Treat every exported action as a public HTTP endpoint, even with encrypted/non-deterministic action IDs. |
| Authentication | Read the current session server-side inside the action or its data access layer. |
| Authorization | Check permission against the target resource at the moment of mutation. |
| Input validation | Parse `FormData` or serialized arguments with a runtime schema before mutating. |
| Hidden or bound values | Treat them as attacker-controlled references, not proof of authority. |
| CSRF | Rely on the framework same-origin and POST-only protections only within their documented assumptions; configure `serverActions.allowedOrigins` narrowly when proxies require it. |
| Body size | Know the default 1 MB request limit and configure `serverActions.bodySizeLimit` only for justified larger forms. |
| Rate limiting | Add per-action throttles for expensive, anonymous, or abuse-prone operations. |
| Return values | Return only data the client is allowed to see, preferably a minimal result object. |

Use route handlers or `api-design` instead when the caller is not this App Router UI, when clients need stable URL/method/status semantics, when third parties need documentation, or when a webhook/mobile/server-to-server consumer must call the mutation.

## Common Anti-Patterns

| Anti-pattern | Why it fails | Correction |
|---|---|---|
| Trusting a client-supplied `userId`, `role`, or `orgId` | The browser controls submitted values. | Derive actor identity from the server session and authorize against server truth. |
| Validating only with TypeScript or client UI | Types and disabled controls do not run on hostile requests. | Parse at the action boundary with a runtime schema. |
| Using event handlers for normal forms | Loses progressive enhancement and pre-hydration submission. | Prefer `<form action={serverAction}>` and `formAction` for submit buttons. |
| Forgetting revalidation | Server state changes while Server Component UI stays stale. | Call the appropriate path/tag/router primitive after the write. |
| Catching `redirect` accidentally | `redirect` throws; catch blocks can swallow navigation. | Call it outside `try/catch`, or rethrow framework control-flow errors. |
| Returning raw database records | Internal fields can cross to the client. | Return a minimal serializable result or DTO. |
| Treating action IDs as authorization | Secure IDs reduce accidental exposure but do not prove caller rights. | Authenticate and authorize every mutation. |
| Using Server Actions as external APIs | Generated endpoints are not stable public contracts. | Use route handlers / REST / GraphQL and `api-design`. |

## Verification

After applying this skill, verify:

- [ ] Every action checks authentication before privileged work.
- [ ] Every action authorizes the actor against the target resource.
- [ ] Every argument from `FormData`, hidden inputs, bound arguments, URL params, or serialized client calls is parsed server-side.
- [ ] Every mutation updates visible read paths with `revalidatePath`, `revalidateTag`, `updateTag`, `refresh`, or a justified redirect.
- [ ] Forms that can be native forms use `action` or `formAction`, not a JS-only click handler.
- [ ] `useActionState` actions have the correct previous-state plus payload signature.
- [ ] `useFormStatus` is called in a descendant of the form it observes.
- [ ] No secret or authority-bearing value is hidden, bound, or closed over as the only protection.
- [ ] Expensive or anonymous actions have rate limiting.
- [ ] Return values expose only client-safe data.
- [ ] Externally consumed contracts use route handlers or API design instead of generated action endpoints.

## Grounding Sources

- React docs - [`'use server'`](https://react.dev/reference/rsc/use-server). The React directive contract for Server Functions.
- React docs - [`useActionState`](https://react.dev/reference/react/useActionState). The hook for action state and pending status.
- React docs - [`useFormStatus`](https://react.dev/reference/react-dom/hooks/useFormStatus). The hook for nearest-parent form status.
- Next.js docs - [Mutating Data](https://nextjs.org/docs/app/getting-started/mutating-data). Current App Router Server Functions / Server Actions overview.
- Next.js docs - [`use server`](https://nextjs.org/docs/app/api-reference/directives/use-server). Next.js directive usage and security considerations.
- Next.js docs - [Data Security](https://nextjs.org/docs/app/guides/data-security). Public endpoint semantics, authorization, rate limiting, closures, encryption, and audit guidance.
- Next.js docs - [`serverActions`](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions). `allowedOrigins` and `bodySizeLimit` configuration.
- Next.js docs - [`revalidatePath`](https://nextjs.org/docs/app/api-reference/functions/revalidatePath), [`revalidateTag`](https://nextjs.org/docs/app/api-reference/functions/revalidateTag), [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag), [`refresh`](https://nextjs.org/docs/app/api-reference/functions/refresh), and [`redirect`](https://nextjs.org/docs/app/api-reference/functions/redirect). Cache, router, and navigation primitives after writes.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the Server Component read path | `server-components-design` | That skill owns data fetching during render; this skill owns client-triggered mutations. |
| Explaining the entire `'use client'` / `'use server'` serialization model | `client-server-boundary` | This skill applies the boundary to actions, not all boundary mechanics. |
| Designing a public REST, GraphQL, mobile, webhook, or third-party API | `api-design` | Server Actions are internal UI endpoints, not stable external contracts. |
| Designing validation layout, field messages, focus, accessibility, or microcopy | `form-ux-architecture` | This skill owns the server execution model, not form presentation. |
| Debugging general React hook rules | `hooks-patterns` | This skill covers action-specific hooks only. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Public: `true`
- Domain: `engineering/frontend`
- Scope: Teaching the portable mutation-design discipline for React Server Functions and Next.js Server Actions: when a 'use server' function becomes an invokable POST endpoint, how form action/formAction integration preserves progressive enhancement, how useActionState and useFormStatus report mutation state, how to validate and authorize untrusted arguments, how to revalidate or refresh UI after writes, and how to choose between an in-app action and a public API contract. Applies to Next.js App Router mutations and form submissions. Excludes read-path Server Component fetching (server-components-design), general client/server serialization mechanics (client-server-boundary), public REST/GraphQL/mobile/third-party API design (api-design), and visual form UX or accessibility details (form-ux-architecture).

**When to use**
- design a create-comment form using a Server Action and useActionState so it works without JavaScript and reports server-side validation errors
- decide whether a delete button should call a Server Action or an API route
- audit a Server Action for missing authorization even though it looks like a normal imported function
- design the cache revalidation strategy for a mutation that changes multiple cached routes
- review whether bound action arguments are safe for this edit form
- Triggers: `how do I submit a form to the server`, `do I need an API route for this mutation`, `how do I call a server function from a button`, `why is my Server Action exposed as an endpoint`, `useActionState vs useFormState`, `how do I revalidate after mutation`, `can Server Actions run in event handlers`, `how do I use updateTag after a Server Action`

**Not for**
- design a Server Component that reads data on render (use server-components-design)
- design a public REST API consumed by mobile clients or third parties (use api-design)
- choose between SSR and SSG (use rendering-models)
- design the visual UX and accessibility of a form's validation states (use form-ux-architecture)
- explain the whole use client serialization boundary (use client-server-boundary)
- debug React hook dependency arrays in a client form (use hooks-patterns)
- Owned by `server-components-design`: the read path

**Related skills**
- Verify with: `client-server-boundary`, `server-components-design`, `api-design`, `security-fundamentals`, `form-ux-architecture`, `hooks-patterns`
- Related: `server-components-design`, `client-server-boundary`, `form-ux-architecture`, `api-design`, `hooks-patterns`, `security-fundamentals`, `http-semantics`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A Server Action is like a service-counter form wired straight to the back office: the customer fills out normal paperwork, the clerk executes privileged work behind the counter, and the office must still check identity, authority, and the paperwork before changing records.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://nextjs.org/docs/app/getting-started/mutating-data`, `https://nextjs.org/docs/app/api-reference/directives/use-server`, `https://nextjs.org/docs/app/guides/data-security`, `https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions`, `https://nextjs.org/docs/app/api-reference/functions/revalidatePath`, `https://nextjs.org/docs/app/api-reference/functions/revalidateTag`, `https://nextjs.org/docs/app/api-reference/functions/updateTag`, `https://nextjs.org/docs/app/api-reference/functions/refresh`, `https://react.dev/reference/react/useActionState`, `https://react.dev/reference/react-dom/hooks/useFormStatus`

**Keywords**
- `Server Actions`, `Server Functions`, `use server`, `form action attribute`, `formAction`, `useActionState`, `useFormStatus`, `revalidatePath`, `updateTag`, `Next.js mutation`

<!-- skill-graph-context:end -->
