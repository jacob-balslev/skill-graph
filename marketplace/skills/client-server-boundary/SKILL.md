---
name: client-server-boundary
description: "Use when reasoning about the line where execution context changes between server runtime and client runtime: what values can cross via the active serializer, what cannot, how `'use client'`, `'use server'`, guard imports, and server-only file conventions mark module/function transitions, how React Server Components differ from server-rendered HTML, why Server Functions / Server Actions are reachable network endpoints, why client input is adversarial, and how server-only modules, secrets, raw records, or closures leak into client bundles and payloads. Do NOT use for choosing when and where UI is produced (use rendering-models), full Server Component read-path placement (use server-components-design), full Server Action mutation/form/cache design (use server-actions-design), public Route Handler endpoint design (use route-handler-design), HTTP wire semantics (use http-semantics), frontend codebase organization (use frontend-architecture), or API JSON contract design (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-engineering
  public: "true"
  scope: "Reasoning about the line where execution context changes between a server runtime and a client runtime: what values can cross via the active serializer, what cannot, how directives and file conventions mark module/function transitions (`'use client'`, `'use server'`, `.server` files, server-only directories), how React Server Components differ from server-rendered HTML, why Server Functions / Server Actions are reachable network endpoints, why client input is adversarial, and how server-only modules, secrets, raw records, or closures leak into client bundles and payloads. Portable across server/client web frameworks; principle-grounded, not repo-bound. Excludes rendering strategy choice (rendering-models), full RSC read-path placement (server-components-design), full Server Action mutation/form/cache design (server-actions-design), public Route Handler endpoint design (route-handler-design), HTTP wire semantics (http-semantics), frontend codebase organization (frontend-architecture), and API JSON contract design (api-design)."
  taxonomy_domain: engineering/frontend
  stability: experimental
  keywords: "[\"client server boundary\",\"serialization boundary\",\"use client directive\",\"use server directive\",\"React Server Components\",\"Server Functions\",\"Server Actions\",\"serializable props\",\"server-only modules\",\"secret leakage\"]"
  triggers: "[\"can I pass this function as a prop\",\"why is my server-only module in the client bundle\",\"what does 'use client' actually do\",\"is it safe to put this secret in a server component\",\"why won't this Date / Map / class serialize\",\"is this server action a public endpoint\",\"are params and searchParams trusted input\"]"
  examples: "[\"decide whether a piece of data must cross the network or can stay server-only\",\"diagnose why a component marked as a server component is being shipped to the client\",\"review whether secrets or raw database records can leak through serialized props\",\"design which values are passed into a Server Function and which are re-derived on the server\",\"explain why TypeScript types do not validate a client-to-server call\"]"
  anti_examples: "[\"decide whether a route should be SSG or SSR (use rendering-models)\",\"design a full Server Component data-fetching/caching tree (use server-components-design)\",\"design a form mutation with useActionState, revalidatePath, or updateTag (use server-actions-design)\",\"design a public route.ts endpoint for third-party callers (use route-handler-design)\",\"design HTTP authentication headers or status codes (use http-semantics)\",\"design the JSON shape of an API response body (use api-design)\"]"
  relations: "{\"related\":[\"rendering-models\",\"server-components-design\",\"server-actions-design\",\"route-handler-design\",\"http-semantics\",\"frontend-architecture\",\"type-safety\",\"api-design\",\"security-fundamentals\"],\"suppresses\":[{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the staging of work across build/request/stream/interaction. client-server-boundary owns the serialization frontier and trust transition between server code and client code. The two compose: any rendering model that emits a server-produced artifact for client consumption faces a boundary.\"}],\"verify_with\":[\"type-safety\",\"api-design\",\"server-components-design\",\"server-actions-design\",\"security-fundamentals\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "The client-server boundary is a customs gate inside one codebase: both sides may share a language and address book, but the server side has vault keys and authority, the client side is public space, and every object crossing the gate must be packed in an allowed container, inspected, and stripped of anything the public side may not see or the server side may not trust."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/client-server-boundary/SKILL.md
---
# Client-Server Boundary

## Concept of the skill

The client-server boundary is the line in a unified codebase where execution context changes between a server runtime and a client runtime. The server runtime can hold secrets, reach databases, read files, and enforce authority. The client runtime is a browser or other public caller that can read any code and data shipped to it and can send arbitrary requests back.

Anything that crosses this line is serialized. It is encoded by a wire format on one side and decoded into a value on the other. The active format matters: JSON, structured clone, React Server Component payloads, React Server Function arguments and returns, SvelteKit server-load data, and FormData are related but not interchangeable. The boundary is governed by three properties:

- **Serialization** - only values the active serializer supports can cross. Ordinary closures, rich class instances, host-bound objects, DOM nodes, request/response objects, ORM entities, and prototype-dependent domain objects should not cross.
- **Direction** - server -> client sends payloads the client can read; client -> server sends arguments, form data, cookies, headers, URL params, search params, and request bodies that the server must treat as adversarial.
- **Trust** - the server trusts server-authoritative state, the client may trust server-sent data as UI input, and the server trusts nothing the client sends until it has parsed, validated, authenticated, authorized, and rate-limited it.

Modern frameworks make this boundary syntactically visible through directives such as `'use client'` and `'use server'`, guard imports such as `import 'server-only'` and `import 'client-only'`, and file conventions such as SvelteKit's `.server` suffix, `$lib/server` directory, and `+page.server.js` / `+layout.server.js` load files. These marks do not invent the boundary. They expose an old boundary inside a shared module tree where it is otherwise easy to forget.

## Coverage

This skill covers the serialization and trust transition between server and client code: directive semantics, import-graph reachability, what values may cross in common formats, how React Server Components and Server Functions encode values, why client-to-server calls are endpoint calls, how server-only code leaks into client bundles, how server-to-client payloads leak secrets or raw records, how URL-derived values remain client input, and how TypeScript stops at the runtime boundary.

It is framework-portable, but it uses React Server Components and Next.js App Router as the modern canonical example because those systems put server and client modules in one file tree. SvelteKit is the compact cross-checking example: `.server` files and `$lib/server` modules are rejected from browser-running import graphs, while server `load` files (`+page.server.js`, `+layout.server.js`) return data that is serialized for the browser.

## Philosophy of the skill

The boundary always exists. A PHP template, a JSON API, a Remix / React Router action, a SvelteKit server load, a Next.js Server Component tree, and a React Server Function all have a server side and a client side separated by bytes. The difference in modern frameworks is that the code is colocated, so the boundary needs explicit marks and review questions.

The discipline is to stop asking "can I import this?" and ask:

1. Which side executes this code?
2. Which serializer carries this value?
3. Who can read the resulting payload or bundle?
4. Who can forge the request, argument, params, or search params?
5. Which server-authoritative source re-derives identity, ownership, and permission?
6. Which guard prevents a future refactor from moving this module across the boundary?

A program that treats both sides as interchangeable will leak secrets, publish internal fields, ship broken modules, and trust attackers. A program that designs with the boundary gets legible import graphs, smaller client bundles, explicit data transfer objects, and server-side authorization where it belongs.

## Boundary Markers

| Mark | Where it goes | What it means | Boundary risk |
|---|---|---|---|
| `'use client'` | Top of a module, before imports | This module is a client entry point when imported from server code. Its transitive dependency subtree is client code and is shipped/evaluated on the client. | Everything reachable from that entry point must be browser-safe: no secrets, server drivers, filesystem, privileged environment reads, or Node-only assumptions. |
| `'use server'` | Top of an async function body, or top of a server module whose exports are async functions | The function is a React Server Function. When called from client code it makes a network request with serialized arguments and serialized return value. In forms and mutations this is commonly called a Server Action. | It is reachable from the client. Treat arguments as untrusted, authorize the operation, and return only what the UI needs. |
| `import 'server-only'` | Top of a server-intended module | A guard that makes supported frameworks error if the module is pulled into a client graph. | Use on modules that read secrets, database clients, filesystem state, or server-only environment variables. |
| `import 'client-only'` | Top of a browser-intended module | A guard that makes supported frameworks error if the module is imported into the server graph. | Use on modules that require `window`, `document`, browser storage, layout APIs, or client-only SDKs. |
| SvelteKit `.server` modules / `$lib/server` | Filename suffix such as `secrets.server.ts`, or the `$lib/server` directory | A server-only module convention. SvelteKit rejects direct or indirect imports from browser-running code because the import chain could leak sensitive code or data. | Put private env, database, filesystem, and server SDK code behind these conventions; do not re-export them through shared utilities. |
| SvelteKit `+page.server.js` / `+layout.server.js` | Route load files | Server-only `load` functions. Their return values are serialized before reaching browser code. | Return minimal DTOs that the browser may read; keep non-serializable objects and private credentials on the server side. |

`'use client'` is an entry-point directive, not a label required on every Client Component file. A component can become client-evaluated because it is a transitive dependency of a client entry. Conversely, a module without `'use client'` can still be evaluated on the client when imported below a client entry. Review the import graph, not just the first line of a file.

`'use server'` marks Server Functions, not Server Components. In React Server Components there is no "Server Component directive"; Server Components are the default unless a client module boundary is introduced.

Next.js `proxy.ts` belongs to a different but adjacent network boundary: request interception before routing. In Next.js 16, `middleware.ts` is deprecated/renamed to `proxy.ts`, and Proxy uses the Node.js runtime. Use it for coarse decisions such as redirects, rewrites, and request shaping, but do not treat Proxy coverage as authorization for Server Functions or component data access. A matcher change, route refactor, or direct action invocation can bypass the place where Proxy ran; Server Functions still validate, authenticate, authorize, and rate-limit inside server code.

## Serialization - What Can Cross

Use the exact serializer for the crossing. "Serializable" is not a universal type.

| Crossing / wire format | Generally supported | Not supported / not safe | Review rule |
|---|---|---|---|
| Plain JSON | string, number, boolean, null, arrays, plain objects | `undefined`, functions, Symbols, BigInts, Maps, Sets, class instances, circular references; Dates become strings by convention | Convert to plain DTOs. Parse unknown JSON at the receiving side before trusting it. |
| Structured clone | JSON-like values plus Date, RegExp, Blob, File, Map, Set, ArrayBuffer, typed arrays, many Error objects | Functions, DOM nodes, Symbols; prototypes, property descriptors, getters/setters, and class private fields are not preserved | Structured clone is not a domain-object transport. Treat cloned objects as data snapshots. |
| React Server Component -> Client Component props | React-serializable primitives including `undefined` and `bigint`, globally registered symbols, iterables, Map, Set, Date, typed arrays/ArrayBuffer, Promises, JSX / React elements, and Server Function references | Ordinary functions, event objects, class instances, null-prototype objects, non-global symbols, host objects, raw Request/Response objects, ORM/domain entities | The serializer may support more than JSON, but the browser can still read every prop. Pass minimal UI-shaped DTOs. |
| React Server Function / Server Action arguments | React-serializable arguments including primitives, plain objects, arrays/iterables, Map, Set, Date, typed arrays/ArrayBuffer, FormData, Promises, and Server Function references | React elements/JSX as arguments, ordinary functions, class instances, null-prototype objects, non-global symbols, event objects | Arguments are fully client-controlled. Validate and authorize inside the function. |
| React Server Function / Server Action return values | Same return-value family as React-serializable props for boundary Client Components | Raw database records, secrets, internal flags, privileged objects, unvalidated error payloads | Return the smallest value the UI needs, often `{ success: true }` or a narrow state object. |
| SvelteKit server `load` return values | Values serializable by `devalue`: JSON-representable data plus values such as BigInt, Date, Map, Set, RegExp, repeated/cyclical references, and promises for streamed data | Component constructors and other non-serializable custom values unless explicitly handled with transport hooks | Server `load` is still server -> browser data transfer. Shape output as browser-safe DTOs. |
| FormData / multipart form submission | string fields and Blob/File values; repeated keys are allowed | Nested objects are not represented structurally; non-string non-Blob values are stringified by `append()` | Convert and validate after reading. If nesting is needed, encode one field deliberately and parse it as `unknown`. |

The practical rule is not merely "can I encode this as bytes?" It is: **can this exact framework serializer encode it, can the other side reconstruct the expected data shape, and is the reconstructed shape safe for that side to see or trust?**

Do not use `structuredClone()` as the oracle for React Server Component props or Server Function arguments. React has its own allowlists: Server Component props can include JSX / React elements, while Server Function arguments explicitly cannot. Conversely, structured clone and React serialization differ on host objects and prototype behavior. Test the serializer that actually carries the value.

When data must cross through a narrower format, reshape at the boundary:

```typescript
// JSON boundary: reshape rich server values before crossing.
const serializedUserMap = Array.from(userMap.entries());
const serializedDate = eventDate.toISOString();

// Receiving side: reconstruct only as data, not as authority.
const userMap = new Map(serializedUserMap);
const eventDate = new Date(serializedDate);
```

The "vanishing method" failure is a serialization smell: if client code expects `user.getFullName()` after `user` crossed the boundary, the design accidentally depended on a class/prototype, not on data. Pass `{ displayName }`, not a domain object with methods.

## Server-to-Client Data Minimization

The most common leak is not a secret literal in JavaScript. It is over-sharing server data:

```typescript
// Bad: a whole persistence record crosses into the browser.
<ProfileCard user={userRow} />

// Better: the server maps to the UI contract before the boundary.
<ProfileCard user={{ displayName: userRow.name, avatarUrl: userRow.avatarUrl }} />
```

Use a server-only Data Access Layer for reusable reads:

```typescript
// lib/current-user.ts
import 'server-only';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const ProfileDto = z.object({
  displayName: z.string(),
  avatarUrl: z.string().url().nullable(),
});

export async function getCurrentUserProfile() {
  const session = await auth();
  if (!session?.userId) return null;

  const row = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, avatarUrl: true },
  });

  return ProfileDto.parse({
    displayName: row.name,
    avatarUrl: row.avatarUrl,
  });
}
```

React's experimental taint APIs can add a backstop: taint a specific object reference or high-entropy unique value so React errors if it reaches a Client Component. Tainting is useful for catching simple mistakes, but it is experimental and cloning or deriving a new value can bypass the original taint. Use it as defense in depth, not as a substitute for DTOs, server-only modules, and authorization.

## Server Functions / Server Actions Are Endpoints

React calls functions marked with `'use server'` **Server Functions**. A Server Function used as a form or mutation is commonly called a **Server Action**. Either way, when client code invokes it, the client sends a serialized request to the server and receives a serialized response.

Security consequences:

- Every argument is client-controlled, including hidden form fields, values passed through `bind`, route params, search params, cookies, and request bodies.
- Exported module-level actions are reachable by client code; framework-generated secure action IDs and dead-code elimination reduce casual discovery but do not authorize callers.
- Inline action closures may capture render-time values. In Next.js, captured values may be sent to the client and back encrypted. Encryption is defense in depth, not a reason to close over secrets or skip authorization.
- Server Actions are mutation-oriented. Use Server Components / a server-only DAL for read-path data fetching, and Route Handlers for stable public HTTP endpoints or non-UI callers.
- Forms that use `<form action={serverFunction}>` still submit through a network request. Frameworks can progressively enhance the experience before or after the JavaScript bundle loads; the security model is still a server endpoint receiving untrusted input.

Prefer re-deriving identity and ownership inside the function:

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';

const UpdateNameInput = z.object({
  userId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
});

export async function updateUserName(rawInput: unknown) {
  const session = await requireSession();
  const input = UpdateNameInput.parse(rawInput);

  if (session.userId !== input.userId && !session.isAdmin) {
    throw new Error('not allowed');
  }

  await db.user.update({
    where: { id: input.userId },
    data: { name: input.name },
  });

  return { success: true };
}
```

The client-supplied `userId` is not authority. It is an input to compare with the server-derived session. A safer variant may avoid accepting `userId` from the client at all and derive the target user from the session unless admin delegation is required.

## Common Leakage Modes

| Leakage mode | What goes wrong | How to prevent |
|---|---|---|
| Secret in shared module | A module imported by both sides reads `process.env.SECRET` or a private SDK token. The client graph reaches it, causing a build error, empty substitution, or leak. | Move secret reads into server-only modules, Server Functions, Route Handlers, or the DAL; add `import 'server-only'`. |
| Server-only API in client graph | `fs`, database clients, Node-only crypto, or server SDKs become reachable below a `'use client'` entry. | Push `'use client'` to interactive leaves; guard server modules; review transitive imports. |
| Raw record in Client Component props | A Server Component passes a full DB row or ORM entity. Hidden fields cross even if not rendered. | Map to a minimal DTO before the boundary; select only needed columns. |
| Over-trusting React serialization | Because React can serialize Date, Map, Set, Promise, or Server Function references, developers pass rich domain objects. | Treat React-serializable as a transport allowlist, not a design target. Pass small data shapes. |
| Method/prototype dependency | A class instance or ORM entity crosses and client code expects methods, private fields, getters, or prototype identity to survive. | Pass plain data and reconstruct client behavior locally; keep domain objects on the server. |
| Untyped client -> server validation gap | A Server Function accepts a TypeScript type and skips runtime parsing. A forged call sends a different shape. | Accept `unknown` or `FormData`; parse with Zod, valibot, io-ts, or equivalent before use. |
| Client-supplied authority | The server trusts `userId`, `isAdmin`, tenant ID, cookie contents, hidden inputs, bound args, route params, or search params directly. | Authenticate and authorize from server-verifiable session/database/IdP state; compare client inputs against that state. |
| Inline action closure over sensitive data | An inline Server Action closes over a token or internal record. Framework support may send captured values to the client and back. | Close over stable non-secret identifiers only; re-read sensitive state on the server; treat encryption as defense in depth. |
| FormData nesting illusion | Code expects object structure from FormData, but only string/blob fields arrive; non-string values were stringified. | Parse each field deliberately; encode nested JSON in a named string field and validate after parsing. |
| Proxy/middleware authorization shortcut | A redirect or matcher in `proxy.ts` / middleware is treated as the only access-control check. A route change, matcher miss, or direct Server Function call skips it. | Use Proxy for coarse routing decisions; authenticate and authorize again inside Server Functions, Route Handlers, and server-only data access. |
| Stale vulnerable RSC packages | The project uses vulnerable React, framework, or `react-server-dom-*` versions whose decoder processes attacker-influenced Server Function/RSC payloads. | Check current React/framework advisories during boundary reviews and upgrade to patched versions. |

## Verification

After applying this skill, verify:

- [ ] Every `'use client'` entry is intentionally placed as low as practical in the tree; its transitive imports are browser-safe.
- [ ] Every server-only data, secret, filesystem, or SDK module imports `server-only` or is otherwise guarded from client reachability.
- [ ] Every browser-only module that touches `window`, `document`, browser storage, or layout APIs imports `client-only` or is otherwise guarded from server reachability.
- [ ] Every prop passed from Server Components to Client Components is React-serializable and is a minimal DTO, not a whole DB row, ORM entity, class instance, Request/Response, or domain object with methods/prototypes.
- [ ] Raw DB reads are not passed directly to client entries. A practical search is `rg "db\\..*\\.(find|select|query)"` followed by inspection of whether each result is mapped through a DTO before it reaches a `'use client'` component.
- [ ] Every Server Function / Server Action has `'use server'` at function or module level and is treated as a client-reachable endpoint.
- [ ] Every Server Function / Server Action parses arguments at runtime from `unknown` or `FormData`; no `as` cast substitutes for validation.
- [ ] Every Server Function / Server Action authenticates and authorizes inside the function or the server-only code it calls; hidden fields, bound args, disabled buttons, params, search params, and TypeScript signatures are not authority.
- [ ] Server Action return values contain only what the UI needs; raw database records and internal error objects do not return to the client.
- [ ] Inline Server Action closures do not capture secrets or full records; any captured value is considered client-visible enough to require scrutiny.
- [ ] FormData with nested structure is parsed and validated after decoding; repeated keys and stringification are intentional.
- [ ] Authentication, authorization, and rate limiting live in server code, not only in Client Components, `proxy.ts` / middleware redirects, or disabled UI.
- [ ] The project's React, framework, and `react-server-dom-*` packages are checked against current RSC / Server Function advisories.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding when and where UI is produced (CSR/SSR/SSG/ISR/RSC) | `rendering-models` | rendering-models owns staging; this skill owns the serialization and trust frontier once data crosses. |
| Designing the RSC read path, Suspense placement, DTO/DAL architecture, or cache/freshness model | `server-components-design` | That skill owns which work belongs on the server side of the RSC tree; this skill owns boundary mechanics shared by RSC, actions, and other crossings. |
| Designing a full Server Action mutation flow with forms, `useActionState`, revalidation, and optimistic UI | `server-actions-design` | This skill teaches that actions are endpoint crossings; server-actions-design owns the mutation workflow. |
| Designing a public `route.ts` / Route Handler endpoint for third parties, mobile apps, webhooks, or explicit HTTP consumers | `route-handler-design` | Route Handlers are explicit public HTTP surfaces; this skill owns the framework-mediated component/action boundary. |
| Designing HTTP caching, status codes, content negotiation, or header semantics | `http-semantics` | http-semantics owns the wire protocol; this skill owns what data and authority enter the wire. |
| Organizing frontend folder layout, feature boundaries, or client state architecture | `frontend-architecture` | Frontend architecture is wider; client-server-boundary is one import/data-flow axis inside it. |
| Designing the JSON shape of an external REST/GraphQL/mobile/third-party API | `api-design` | api-design owns public contracts and versioning; this skill owns internal server/client crossings that may not be stable APIs. |
| Choosing a validation library or enforcing TypeScript discipline generally | `type-safety` | type-safety owns compile-time and parsing discipline; this skill names where parsing is mandatory. |
| Performing a broad application-security review or OWASP-category vulnerability triage | `security-fundamentals` / `owasp-security` | This skill uses security principles at one boundary; security-fundamentals and owasp-security own wider security review. |

## Key Sources

- React. [`'use client'` directive](https://react.dev/reference/rsc/use-client). Provenance: primary vendor documentation for how `'use client'` creates a client module subtree, how transitive dependencies become client-evaluated, and which Server Component prop values are serializable.
- React. [`'use server'` directive](https://react.dev/reference/rsc/use-server). Provenance: primary vendor documentation for Server Functions, network invocation, security considerations, and the current serializable argument/return allowlist.
- Next.js. [`use client` directive](https://nextjs.org/docs/app/api-reference/directives/use-client). Provenance: framework documentation for entry-point placement and serializable Client Component props.
- Next.js. [`use server` directive](https://nextjs.org/docs/app/api-reference/directives/use-server). Provenance: framework documentation for file-level and inline Server Actions plus authentication/authorization guidance.
- Next.js. [Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components). Provenance: framework documentation for App Router's default Server Component model, `server-only` / `client-only` guards, and environment-poisoning prevention.
- Next.js. [Data Security](https://nextjs.org/docs/app/guides/data-security). Provenance: framework documentation for DAL/DTO patterns, Server Action return minimization, rate limiting, closure encryption, taint APIs, and the warning not to rely on encryption alone.
- Next.js. [`proxy.js` / `proxy.ts` file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) and [Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16). Provenance: framework documentation for `middleware.ts` -> `proxy.ts`, Node.js runtime behavior, and why Proxy cannot replace per-Server-Function authorization.
- SvelteKit. [Server-only modules](https://svelte.dev/docs/kit/server-only-modules). Provenance: primary framework documentation for `.server` filename suffixes, `$lib/server`, private environment module restrictions, and import-chain errors that prevent server-only code from reaching browser-running code.
- SvelteKit. [Loading data](https://svelte.dev/docs/kit/load). Provenance: primary framework documentation for `+page.server.js` / `+layout.server.js`, server-only `load` functions, universal-vs-server load boundaries, and devalue serialization of server-load return data.
- React. [`experimental_taintObjectReference`](https://react.dev/reference/react/experimental_taintObjectReference) and [`experimental_taintUniqueValue`](https://react.dev/reference/react/experimental_taintUniqueValue). Provenance: primary React documentation for optional taint guardrails and their caveats.
- MDN. [Structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm). Provenance: platform reference for structured-clone support and loss of prototypes/descriptors/private fields.
- MDN. [`FormData.append()`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/append). Provenance: platform reference for string/blob values, repeated fields, and automatic stringification of non-string non-Blob values.
- OWASP. [Top 10:2025 A01 Broken Access Control](https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/). Provenance: current public security reference for server-side access control, deny-by-default, direct-object-reference failures, and the rule that access control must be enforced in trusted server-side code.
- TypeScript. [Everyday Types - Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions). Provenance: language reference confirming that type assertions are erased and do not validate runtime values.
- React. [Critical Security Vulnerability in React Server Components](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components). Provenance: upstream security advisory showing that RSC / Server Function payload decoding is an operational security concern, not only a type/serialization concern.
- Vercel. [Next.js May 2026 security release](https://vercel.com/changelog/next-js-may-2026-security-release). Provenance: framework-vendor advisory for newer React/Next RSC-related fixes, including patched Next.js and `react-server-dom-*` versions.
- React Router. [Actions](https://reactrouter.com/start/framework/actions). Provenance: current Remix-lineage documentation showing that form/action server boundaries remain a broader framework pattern, not only a Next.js directive pattern.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Public: `true`
- Domain: `engineering/frontend`
- Scope: Reasoning about the line where execution context changes between a server runtime and a client runtime: what values can cross via the active serializer, what cannot, how directives and file conventions mark module/function transitions (`'use client'`, `'use server'`, `.server` files, server-only directories), how React Server Components differ from server-rendered HTML, why Server Functions / Server Actions are reachable network endpoints, why client input is adversarial, and how server-only modules, secrets, raw records, or closures leak into client bundles and payloads. Portable across server/client web frameworks; principle-grounded, not repo-bound. Excludes rendering strategy choice (rendering-models), full RSC read-path placement (server-components-design), full Server Action mutation/form/cache design (server-actions-design), public Route Handler endpoint design (route-handler-design), HTTP wire semantics (http-semantics), frontend codebase organization (frontend-architecture), and API JSON contract design (api-design).

**When to use**
- decide whether a piece of data must cross the network or can stay server-only
- diagnose why a component marked as a server component is being shipped to the client
- review whether secrets or raw database records can leak through serialized props
- design which values are passed into a Server Function and which are re-derived on the server
- explain why TypeScript types do not validate a client-to-server call
- Triggers: `can I pass this function as a prop`, `why is my server-only module in the client bundle`, `what does 'use client' actually do`, `is it safe to put this secret in a server component`, `why won't this Date / Map / class serialize`, `is this server action a public endpoint`, `are params and searchParams trusted input`

**Not for**
- decide whether a route should be SSG or SSR (use rendering-models)
- design a full Server Component data-fetching/caching tree (use server-components-design)
- design a form mutation with useActionState, revalidatePath, or updateTag (use server-actions-design)
- design a public route.ts endpoint for third-party callers (use route-handler-design)
- design HTTP authentication headers or status codes (use http-semantics)
- design the JSON shape of an API response body (use api-design)
- Owned by `rendering-models`: the staging of work across build/request/stream/interaction

**Related skills**
- Verify with: `type-safety`, `api-design`, `server-components-design`, `server-actions-design`, `security-fundamentals`
- Related: `rendering-models`, `server-components-design`, `server-actions-design`, `route-handler-design`, `http-semantics`, `frontend-architecture`, `type-safety`, `api-design`, `security-fundamentals`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: The client-server boundary is a customs gate inside one codebase: both sides may share a language and address book, but the server side has vault keys and authority, the client side is public space, and every object crossing the gate must be packed in an allowed container, inspected, and stripped of anything the public side may not see or the server side may not trust.
- Common misconception: |

**Keywords**
- `client server boundary`, `serialization boundary`, `use client directive`, `use server directive`, `React Server Components`, `Server Functions`, `Server Actions`, `serializable props`, `server-only modules`, `secret leakage`

<!-- skill-graph-context:end -->
