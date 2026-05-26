---
name: client-server-boundary
description: "Use when reasoning about the line at which execution context changes between a server runtime and a client runtime: what values can cross via serialization, what cannot, the directives that mark transitions (`'use client'`, `'use server'`), the difference between server-rendered HTML and a serialized component tree, the trust model that treats client input as adversarial, and the consequences of leaking server-only modules into client bundles. Do NOT use for when and where the UI is produced (use rendering-models), the HTTP wire protocol itself (use http-semantics), how to organize the frontend codebase (use frontend-architecture), or how to design the JSON shape of an API endpoint (use api-design). Do NOT use for the discipline of compile-time type checking (use type-safety)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: do
  category: engineering
  subject: frontend-ui
  domain: engineering/frontend
  scope: workspace
  owner: skill-graph-maintainer
  freshness: "2026-05-15"
  drift_check: "{\"last_verified\":\"2026-05-15\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"client server boundary\",\"serialization boundary\",\"use client directive\",\"use server directive\",\"React Server Components\",\"server actions\",\"RPC\",\"serializable types\",\"structured clone\",\"secret leakage\"]"
  triggers: "[\"can I pass this function as a prop\",\"why is my server-only module in the client bundle\",\"what does 'use client' actually do\",\"is it safe to put this secret in a server component\",\"why won't this Date / Map / class serialize\"]"
  examples: "[\"decide whether a piece of data must cross the network or can stay server-only\",\"diagnose why a component marked as a server component is being shipped to the client\",\"review whether secrets in server code can leak through serialized props\",\"design which functions are exposed as server actions and which stay internal\"]"
  anti_examples: "[\"decide whether a route should be SSG or SSR (use rendering-models)\",\"design HTTP authentication headers (use http-semantics)\",\"design the JSON shape of an API response body (use api-design)\"]"
  relations: "{\"related\":[\"rendering-models\",\"http-semantics\",\"frontend-architecture\",\"type-safety\",\"api-design\"],\"boundary\":[{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the staging of work across build/request/stream/interaction. client-server-boundary owns the serialization frontier — what can cross between server code and client code. The two compose: any rendering model that emits a server-produced artifact for client consumption faces a boundary.\"},{\"skill\":\"http-semantics\",\"reason\":\"http-semantics owns the wire protocol (verbs, status codes, headers, caching). client-server-boundary is upstream — it decides what data exists at the boundary and how it is encoded into request and response bodies.\"},{\"skill\":\"api-design\",\"reason\":\"api-design owns the external API surface (versioning, REST/GraphQL choice, endpoint shape). client-server-boundary owns the in-program boundary between a unified frontend codebase's server and client halves — a tighter, framework-mediated boundary than a public API.\"},{\"skill\":\"type-safety\",\"reason\":\"type-safety owns the discipline of compile-time type checking. client-server-boundary is one of the places where the type system stops — values crossing the boundary lose their type until parsed.\"}],\"verify_with\":[\"type-safety\",\"api-design\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "The client-server boundary is to a unified codebase what an embassy boundary is to a city — both spaces exist in the same physical address, but inside the embassy the law of one country applies (server: full filesystem, secret access, database), outside the law of another applies (client: browser sandbox, no secrets), and everyone crossing must pass through documented customs (serialization) with their bags inspected (validation) and stamped (authentication)."
  misconception: "|"
  concept: "{\"definition\":\"The client-server boundary is the line in a unified codebase at which execution context changes — between a server runtime (full filesystem, secret access, database connections) and a client runtime (browser, no filesystem, no server secrets, untrusted by the server). Anything that crosses the boundary must be serialized: encoded as bytes on one side, decoded into a value on the other. The boundary is marked by directives, enforced by the framework, and made invisible to the developer who treats it correctly.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/client-server-boundary/SKILL.md
  skill_graph_export_description_projection: boundary
---

# Client-Server Boundary

## Coverage

The line in a unified codebase at which execution context changes between server and client. Covers the three governing properties (serialization, direction, trust), the wire formats currently in use (JSON, structured clone, RSC payload, FormData), the directives that mark the boundary (`'use client'`, `'use server'`, framework-specific equivalents), the trust asymmetry that makes client→server crossings categorically different from server→client, the leakage modes (server-only modules, secrets, hidden imports) that an unmarked boundary creates, and the misconceptions that arise from treating the boundary as either invisible or as a TypeScript-checked contract.

## Philosophy

The boundary always exists. Even an old PHP application with a templated HTML response has a server runtime and a client runtime separated by a wire protocol; the boundary is the network. What modern frameworks add is not the boundary itself, but the markers that make it visible — directives that say "this code is for over there" and serializers that say "these bytes will arrive on the other side as this shape."

The discipline of the boundary is to take seriously the asymmetry between sides:

- Server code can read secrets; client code cannot.
- Server code receives requests; client code makes them.
- Server code trusts itself; client code is trusted by the server only after validation.
- Server code can import any module; client code can import only what the bundler shipped.

A program that treats the two sides as interchangeable will leak secrets, ship broken code, and trust adversaries. A program that marks the boundary explicitly will pay a small upfront cost in ceremony and gain a large benefit in legibility and refactor safety.

The goal of this skill is to make the boundary an object of explicit thought — not a thing to work around, but a thing to design with.

## Directives — The Boundary Made Syntactic

| Directive | Where it goes | What it means |
|---|---|---|
| `'use client'` | Top of a `.tsx` or `.ts` file | This file is the first client module in its import graph. Everything it imports becomes part of the client bundle. The framework will server-render it for first paint, then ship it to the client. |
| `'use server'` | Top of a `.ts` file or first line of a function body | The functions in this file (or this specific function) become server actions — RPC handlers callable from the client. The function body executes on the server; the client invokes it via a network call. |
| `import 'server-only'` | A line at the top of a server-intended module | A static import that causes the bundler to error if this module ends up in the client bundle. A guardrail, not a directive. |
| `import 'client-only'` | A line at the top of a client-intended module | Symmetric: errors if the module ends up in the server bundle. Useful for code that touches `window`, `document`, or other browser-only globals. |

The directives are not the boundary; they are the marks that make the boundary visible. A file without `'use client'` in an App Router project is implicitly a server component — the absence is meaningful.

## Serialization — What Can Cross

| Wire format | Allowed types | Disallowed types |
|---|---|---|
| Plain JSON | string, number, boolean, null, plain objects, arrays | undefined, functions, Dates (become strings), Maps, Sets, Symbols, BigInts, class instances, circular references |
| Structured clone (postMessage, IndexedDB) | All JSON + Date, RegExp, Blob, File, FileList, ImageData, Map, Set, ArrayBuffer, typed arrays | Functions, DOM nodes, Error objects (partial), class instances with non-cloneable internals |
| RSC payload (React Server Components) | All structured-clone + Promises, JSX trees, server-action function references (as opaque tokens) | Arbitrary closures, classes with private fields, host-environment-bound objects |
| FormData (multipart/form-data) | string key/value, File/Blob | Nested structure (must encode as JSON inside a string field), non-string non-file values |

The practical rule: **if you cannot describe the value in terms of bytes, it cannot cross.** A `Map<string, User>` can cross structured-clone but not JSON; serialize to an array of `[key, value]` pairs for JSON.

## Trust — The Asymmetric Boundary

The two directions across the boundary have categorically different trust profiles.

**Server → client.** The server emits a payload. The payload is trusted by its producer (the server) and consumed as data by the client. The client cannot tamper with the payload in transit (TLS), but can read everything inside it and use the contents however the client code chooses.

Implications:
- Do not put server secrets in the payload. The client will see them.
- Do not assume the client will *not* call a function in the payload. If the payload says "this user is an admin," the client UI may render an admin panel; if a security check depends on it, that check must be repeated on the server.
- The payload is a window into the server's state model. Keep it minimal.

**Client → server.** The client emits a request. The request crosses the trust boundary; every byte is adversarial. The server must:

- Parse the request structurally (the bytes may not be the expected shape).
- Validate the contents semantically (the values may not be in the expected range).
- Authenticate the requester (cookies, tokens — themselves potentially forged).
- Authorize the action (the authenticated requester may not have permission for this operation).
- Rate-limit (the client may be a script).

Server actions look like local function calls when invoked from a client component. They are not. They are RPC handlers with a network in front of them and a hostile caller on the other side of the network.

## Common Leakage Modes

| Leakage mode | What goes wrong | How to prevent |
|---|---|---|
| Secret in a shared module | `process.env.SECRET` is referenced in a module imported by both server and client; the secret name (and possibly value) ends up in the client bundle | Import the secret only in modules guarded by `import 'server-only'`; or read it inside a server action / route handler where the import graph cannot leak |
| Server-only API in a client bundle | `fs.readFileSync` or `pg.Client` is imported into a `'use client'` component; build fails or runtime crashes | Mark client components with `'use client'`; mark server-only utilities with `import 'server-only'`; the bundler's static analysis catches the leak |
| Untyped client→server validation gap | A server action accepts an argument typed as `{ userId: string }`; the client constructs a payload with `{ userId: 123 }`; the server crashes or, worse, queries with `123` and accidentally exposes another user's data | Validate every server-action argument with a runtime schema (Zod, valibot); never trust the TypeScript types of an RPC handler |
| Trusted-by-default client claim | A server action checks `if (req.userRole === 'admin') ...` where `req.userRole` came from the client (via cookie, header, or body) | Re-derive trust from the server's authoritative source (the session record, the database, the IdP) — never from the client's self-report |
| Non-serializable value in props | A `'use client'` component receives a server-built `Map<string, User>` as a prop; the RSC serializer can encode it, but a misconfigured project on plain JSON cannot — silent data loss or runtime crash | Test the serialization shape in code review; convert to plain objects at the boundary; or upgrade to a wire format that supports the type |
| Closure leakage attempt | A server component constructs `() => doSomething()` and tries to pass it to a client component as a prop | Use a `'use server'` function (which serializes as an RPC reference) or pass the data the function uses and reconstruct the behavior on the client |

## RSC Server Actions — A Worked Example

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';
import { requireSession } from '@/lib/auth';
import { db } from '@/lib/db';

const UpdateNameInput = z.object({
  userId: z.string().uuid(),
  name: z.string().min(1).max(100),
});

export async function updateUserName(rawInput: unknown) {
  // 1. Authenticate the caller (server-only source of truth)
  const session = await requireSession();

  // 2. Validate the input (the bytes from the client may be anything)
  const input = UpdateNameInput.parse(rawInput);

  // 3. Authorize the action (the authenticated user may not be allowed to do this)
  if (session.userId !== input.userId && !session.isAdmin) {
    throw new Error('not allowed');
  }

  // 4. Perform the action
  await db.user.update({
    where: { id: input.userId },
    data: { name: input.name },
  });
}
```

```typescript
// app/profile/edit.tsx
'use client';

import { updateUserName } from '@/app/actions';

export function EditProfile({ userId }: { userId: string }) {
  return (
    <form action={async (formData) => {
      await updateUserName({
        userId,
        name: formData.get('name'),
      });
    }}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  );
}
```

The shape of this code embeds the boundary's three properties:

- **Serialization** — the `formData` is a `FormData` (the wire format for a form submission), unwrapped to a plain object before the action is invoked.
- **Direction** — the form is client→server; everything in `rawInput` is potentially adversarial.
- **Trust** — the session is the server's authoritative claim about who is calling; `input.userId` is the client's claim about who to operate on; the authorization check compares the two.

A version of this code that skipped the schema parse, used the session's `userId` as if it were the same as `input.userId`, or trusted a client-supplied `isAdmin` claim would have a vulnerability at the boundary.

## Verification

After applying this skill, verify:
- [ ] Every file that ships to the client has `'use client'` (or is reachable only through client imports) — the implicit-server default is intentional, not accidental.
- [ ] Every server action has `'use server'` at the function or file level — the function's network reachability is explicit.
- [ ] Server actions validate input with a runtime schema (Zod, valibot, io-ts) — types from TypeScript are not validation.
- [ ] Server actions re-derive trust from a server-authoritative source (session, JWT verification, database lookup) — client-supplied trust claims are never accepted.
- [ ] Modules holding secrets import `'server-only'` — the bundler will error if they leak.
- [ ] Modules touching `window`, `document`, or other browser globals import `'client-only'` — symmetric guardrail.
- [ ] Props passed from server to client components are serializable in the project's wire format — verified by build success and by code review for non-trivial types (Maps, class instances, Dates).
- [ ] FormData payloads with nested structure are validated after parsing — no `as` casts of `JSON.parse` results.
- [ ] No closures cross the boundary — only data, server-action references, and RSC primitives.
- [ ] Authentication, authorization, and rate-limiting live inside server actions and route handlers, not in client components.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding when and where the UI is produced (CSR/SSR/SSG/RSC) | `rendering-models` | rendering-models owns the staging decision; client-server-boundary owns the serialization frontier — they compose but are distinct |
| Designing HTTP caching, status codes, content negotiation | `http-semantics` | http-semantics owns the wire protocol; client-server-boundary owns what data exists at the boundary |
| Organizing the frontend folder layout and module structure | `frontend-architecture` | frontend-architecture is wider — it includes state management, component layering, feature boundaries; the client-server-boundary is one axis it touches |
| Designing the JSON shape of an external API | `api-design` | api-design owns external surface contracts; client-server-boundary is the internal boundary inside a single application |
| Choosing between Zod / valibot / io-ts as a runtime validator | individual library docs + `api-design` | library choice is below this skill |
| Enforcing TypeScript discipline inside the program | `type-safety` | type-safety owns compile-time discipline; the boundary is one of the places where type safety stops |

## Key Sources

- React team. [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md). Proposed Dec 2020. The canonical specification of the RSC wire format, including the rules for what can be serialized across the boundary and the role of `'use client'` / `'use server'`.
- Sebastian Markbåge (React core). ["The Future of Web Software Is Server Components"](https://www.youtube.com/watch?v=zMf_xeGPn6s). 2022 talk. The mental model of the boundary as a serialization protocol rather than a deployment topology.
- Vercel. [Next.js documentation — Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components). Reference for `'use client'` / `'use server'` semantics, the `server-only` and `client-only` packages, and the serialization rules in App Router.
- WHATWG. [HTML Living Standard — Structured clone algorithm](https://html.spec.whatwg.org/multipage/structured-data.html#structured-clone). Specification of the broader-than-JSON serialization set used by postMessage, IndexedDB, and Worker boundaries.
- Mark Erikson. ["Why React Server Components Are Important"](https://blog.isquaredsoftware.com/2023/04/whats-the-deal-with-react-server-components/). 2023. Practitioner-level explanation of the boundary's implications for bundle size, hydration, and the framework-author contract.
- Remix team. [Loader and Action documentation](https://remix.run/docs/en/main/route/loader). Reference for the function-named boundary convention that predates and informs RSC's directive-based model.
- OWASP. [Top 10:2021 — A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/). The class of vulnerabilities that arise specifically from treating client-supplied trust claims as authoritative — the failure mode this skill exists to prevent.
- Hejlsberg, A. et al. [TypeScript Handbook — Type assertions and the `unknown` type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions). The explicit acknowledgement that `as` casts do not validate at runtime — the gap that boundary-crossing validation must fill.
