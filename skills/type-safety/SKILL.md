---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: type-safety
description: "Use when reasoning about types as a quality property of code: what guarantees the type system actually provides, the difference between sound and unsound systems, structural vs nominal typing, type narrowing and exhaustiveness, the runtime/compile-time boundary, and where validation must happen because the type system cannot. Covers TypeScript, Flow, Hindley-Milner languages, and gradual typing in general. Do NOT use for runtime input validation library choice (use api-design for API surface validation; use individual library docs for library mechanics), for SQL type mapping (use data-modeling), or for type system implementation (compilers — out of scope)."
version: 1.0.0
type: capability
category: quality
domain: quality/types
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-15"
drift_check:
  last_verified: "2026-05-15"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - type safety
  - TypeScript
  - sound type system
  - unsound type system
  - structural typing
  - nominal typing
  - type narrowing
  - exhaustiveness check
  - gradual typing
  - runtime boundary
triggers:
  - "is this type-safe"
  - "should this be `any` or `unknown`"
  - "exhaustiveness check"
  - "narrowing"
  - "where does validation belong"
examples:
  - "review whether this discriminated union has an exhaustiveness check at the switch"
  - "decide whether to use `any` or `unknown` for this third-party JSON payload"
  - "explain why TypeScript's `as` cast doesn't actually validate at runtime"
  - "design where Zod (or any validator) parses at the application boundary"
anti_examples:
  - "implement HMAC verification for an inbound webhook (use webhook-integration)"
  - "design the JSON shape of an API endpoint (use api-design)"
  - "choose between Postgres column types (use data-modeling)"
relations:
  related:
    - api-design
    - testing-strategy
    - code-review
  boundary:
    - skill: api-design
      reason: "api-design owns the external request/response surface; type-safety owns the discipline of expressing internal program correctness as types."
    - skill: testing-strategy
      reason: "testing-strategy owns the runtime verification of behavior; type-safety owns the compile-time verification of structure. They cover different failure modes."
    - skill: data-modeling
      reason: "data-modeling owns persistence and entity shape; type-safety owns the in-memory type contracts that consume that shape."
  verify_with:
    - testing-strategy
    - code-review
concept:
  definition: "Type safety is the property of a program in which type errors — operations applied to values of the wrong kind — are detected before they cause incorrect behavior. A type system provides type safety to the extent that it formally rules out classes of errors at compile time. A sound type system rules out all errors of the kinds it tracks; an unsound system rules out some but allows others through escape hatches."
  mental_model: |
    Five primitives structure type-system reasoning:

    1. **Type** — a label that constrains the set of values a variable, parameter, or expression may take. A type is a *proposition* about a value; a typed expression is a *proof* of that proposition.

    2. **Soundness** — the system's guarantee that if a program type-checks, certain classes of errors cannot occur at runtime. A *sound* system makes a hard promise; an *unsound* system makes a soft one. TypeScript is unsound by design (escape hatches like `as`, `any`, function bivariance, ambient declarations); Rust's type system is largely sound (with `unsafe` as the documented escape hatch); Haskell's is sound within its purity boundary.

    3. **Structural vs nominal typing** — *structural* systems (TypeScript, Go interfaces) decide compatibility by shape: two types are compatible if their members match. *Nominal* systems (Java, C#) decide compatibility by name: two types are compatible only if one extends/implements the other. The choice affects what counts as "the same type."

    4. **Narrowing** — the process by which the type checker refines a broad type (`string | number`) into a narrower one (`string`) based on control-flow evidence (`typeof x === 'string'`, `x instanceof Date`, `x !== null`). Narrowing makes union types tractable; without it, every union access requires a cast.

    5. **The runtime boundary** — the line at which the type system stops. At I/O boundaries (network, disk, environment variables, `JSON.parse`, `localStorage`), values arrive without type information; the program's claims about them are unverified until parsed. Runtime validation (Zod, io-ts, Yup, manual guards) is the discipline of converting an unverified value into a typed value at the boundary.

    The deep insight (Curry-Howard): types are propositions, programs are proofs. A function `(x: A) => B` is a proof that given an A, you can produce a B. Type-checking is proof-checking. Soundness is the property that the proof-checker doesn't accept invalid proofs.
  purpose: |
    Static types catch a category of errors that would otherwise become runtime bugs, production incidents, or silent data corruption. The cost is up-front: types must be authored and maintained. The benefit is compounding: every refactor is safer, every IDE interaction is informed, every consumer of a function sees the contract at the call site.

    But type-safety is not free correctness. An unsound system (TypeScript) makes guarantees only over the part of the program that doesn't use escape hatches. A program that liberally uses `any` or `as` has the *appearance* of type safety without the *substance*. The discipline of type-safety is knowing where the system's guarantees end and where runtime validation must take over.

    The opposite failure — refusing static types altogether — pays the runtime cost on every interaction with the code. Dynamic languages without optional typing rely on tests, documentation, and reader vigilance to communicate the contracts that types would have made explicit. They scale poorly with team size and code size; they scale especially poorly with AI agents reading the code without local context.
  boundary: |
    **Type safety is not validation.** Validation (Zod, Yup, io-ts, manual guards) is a runtime check that produces a typed value from an untyped one. Type safety is the compile-time discipline that consumes the typed value. They compose: validate at the boundary, then trust the type inside. They do not substitute.

    **Type safety is not testing.** Tests verify behavior; types verify structure. A function that adds two numbers and returns the wrong number is type-safe (`(a: number, b: number) => number`) but tests must catch the logic error. Conversely, a 100% test-covered function with `any` parameters has no compile-time safety: a future refactor can silently widen the contract.

    **Type safety is not Hungarian notation.** Encoding type information in variable names (`strName`, `bIsActive`) is a workaround for languages without types, not a substitute for them. Modern static type systems make this practice obsolete.

    **Type safety is not language choice.** Languages exist along a spectrum: dynamically typed (Python, Ruby, JavaScript), gradually typed (TypeScript, Python with mypy, Ruby with Sorbet), statically typed (Java, C#, Go), and dependently typed (Idris, Coq, Lean). The discipline applies at every level; only the affordances differ.

    **`unknown` is not `any`.** Both accept any value. The difference is what the type system lets you do next: `any` lets you do anything (escape hatch); `unknown` forces you to narrow (runtime guard) before access. `unknown` is the type-safe answer to "I don't know what this is yet"; `any` is the unsafe answer.
  taxonomy: |
    - **Sound type system** (specialization) — guarantees no type errors at runtime for the categories tracked. Rust (memory safety, with `unsafe`), Haskell (within purity), ML, F*, Lean.
    - **Unsound (gradual) type system** (specialization) — provides static guarantees with documented escape hatches. TypeScript, Python+mypy, Ruby+Sorbet, Hack, Dart. The Siek-Vachharajani 2007 gradual typing paper formalizes the soundness vs ergonomics trade-off.
    - **Structural typing** (alternative) — compatibility by shape (TypeScript, Go interfaces, OCaml polymorphic records).
    - **Nominal typing** (alternative) — compatibility by name (Java, C#, Swift, Rust enums).
    - **Dependent types** (specialization) — types that depend on values (Idris, Coq, Lean, F*). Stronger than typical static types; can encode invariants like "this list is non-empty."
    - **Refinement types** (composition) — types narrowed by a predicate (LiquidHaskell, F*'s refinement subset). Sits between dependent types and Hindley-Milner.
    - **Narrowing** (downstream technique) — control-flow type refinement; depends on the type system supporting it.
    - **Validation** (composition with validation libraries) — runtime conversion from untyped to typed values at the boundary. Zod, io-ts, valibot for TypeScript; Pydantic for Python.
  analogy: |
    A type system is to runtime errors what a building's structural engineering is to physical collapse. The engineering happens before construction (compile time) and verifies that the design is sound *given the materials specified*. It doesn't prevent fires, vandalism, or earthquakes beyond spec — those are different threat classes (testing, validation, monitoring). A sound type system is to building codes as a court-certified engineer's stamp; an unsound one is to a junior engineer's draft — useful, often correct, but with documented caveats.

    The escape hatches (`any`, `as`, `// @ts-ignore`) are the analog of "engineering judgment" override: legitimate when the engineer knows something the codified rules don't, dangerous when used to silence inconvenient warnings.
  misconception: |
    The most common misconception is that **TypeScript prevents runtime errors**. It does not. TypeScript is unsound (deliberately), and even without escape hatches, it makes no guarantees about values that cross the runtime boundary: `JSON.parse(input) as User` produces a value of *static* type User and *actual* type whatever the bytes contained. The static type is a claim, not a verification.

    The second misconception is that **`any` and `unknown` are interchangeable**. They are opposites in intent. `any` opts out of the type system entirely (every operation is allowed, every assignment is accepted). `unknown` opts in to maximum scrutiny (no operation is allowed until you narrow). A codebase that uses `any` for "I don't know yet" has silently disabled type safety for those paths; a codebase that uses `unknown` for the same case retains safety and forces explicit narrowing.

    The third misconception is that **more types are always better**. Excessive typing produces fragile, ceremony-heavy code that breaks on every refactor. The right level of typing is the level at which (a) every public boundary is typed, (b) every value crossing the I/O boundary is parsed, and (c) types narrow naturally rather than requiring casts. Internal helpers can often be inferred; not every variable needs an explicit annotation.

    The fourth misconception is that **type assertions (`as`) check types**. They do not. `as` is a directive to the type checker: "trust me, this is the type I say it is." It compiles to nothing at runtime. A misused `as` is a silent bug waiting to happen.
---

# Type Safety

## Coverage

The discipline of using a type system to rule out classes of runtime errors before they occur. Covers what soundness means and where TypeScript (and other gradual systems) is unsound, structural vs nominal typing, type narrowing and exhaustiveness checking, the runtime boundary problem, the difference between `any` and `unknown`, when to use type assertions (rarely) and when to validate (always at I/O boundaries), and the connection to runtime validation libraries.

## Philosophy

Types are claims about values; type-checking is proof-checking. A program that compiles is a program whose claims have been internally consistent — but a program is more than its compiler. Values that arrive from outside the program (HTTP responses, environment variables, parsed JSON, untrusted user input) have no type until you parse them, no matter what type annotation sits next to them.

The discipline of type-safety is to take the compile-time guarantees seriously and to know exactly where they stop. A codebase that pretends `JSON.parse(x) as User` is safe has confused a syntactic claim with a semantic guarantee. A codebase that validates at the boundary and trusts the type inside has correctly aligned the two layers.

In gradual systems like TypeScript, the discipline includes treating escape hatches (`any`, `as`, `// @ts-ignore`) as exceptional, justified, and rare — not as the default response to a type error.

## Soundness — What the System Actually Promises

| System | Soundness | Where it leaks |
|---|---|---|
| TypeScript | Unsound (by design) | `any`, `as`, function bivariance, ambient declarations, type assertions, `Object.keys()` typed as `string[]`, array `.find()` returning a `T` not `T \| undefined` (without strict flag), unchecked `noUncheckedIndexedAccess`, mutable arrays in covariant positions |
| Flow | Unsound | Similar escape hatches; less broadly adopted |
| Python + mypy | Unsound (gradual) | `Any`, `cast`, dynamic-only constructs |
| Java | Sound for types, unsound for null | NullPointerException; generics erased at runtime |
| C# | Mostly sound | Reflection, `dynamic` |
| Go | Sound for types, structural interfaces | Empty interface (`interface{}`) is the escape hatch; type assertions panic on failure |
| Rust | Sound (memory + types) | `unsafe` blocks are documented escape hatches |
| Haskell | Sound (within purity) | `unsafePerformIO`, FFI |

**Practical TypeScript stance:** Enable strict mode (`strict: true`), enable `noUncheckedIndexedAccess`, enable `noImplicitAny`. These flags close the most common leakage points. Without them, the system's guarantees are substantially weaker than developers assume.

## Narrowing

Narrowing is the type checker's mechanism for refining a broad type based on control-flow evidence. Use it instead of casts.

```typescript
function process(x: string | number | null) {
  if (x === null) return;            // narrows to string | number
  if (typeof x === 'string') {        // narrows to string
    return x.toUpperCase();
  }
  // here x is narrowed to number
  return x.toFixed(2);
}
```

| Narrowing technique | Use when |
|---|---|
| `typeof x === '...'` | Distinguishing primitives |
| `x instanceof Class` | Distinguishing class instances |
| `'field' in x` | Distinguishing discriminated objects |
| `x === literal` | Distinguishing literal types |
| Discriminated union via tag field | Designed-in narrowing for ADTs |
| User-defined type guards (`x is T`) | Custom predicates |
| `Array.isArray(x)` | Array vs non-array |

Discriminated unions are the strongest pattern:

```typescript
type Result =
  | { ok: true; value: User }
  | { ok: false; error: string };

function handle(r: Result) {
  if (r.ok) return r.value;  // narrows; `r.error` is not accessible here
  return r.error;            // narrowed to the error branch
}
```

## Exhaustiveness Checking

Force the compiler to verify that all cases of a union are handled. The pattern uses an unreachable `never` branch.

```typescript
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

function describe(m: Method): string {
  switch (m) {
    case 'GET':    return 'safe';
    case 'POST':   return 'mutation';
    case 'PUT':    return 'idempotent replacement';
    case 'DELETE': return 'idempotent removal';
    default: {
      const _exhaustive: never = m;  // compile error if a case is missing
      throw new Error(`unhandled: ${_exhaustive}`);
    }
  }
}
```

When a new variant is added to `Method`, the `never` assignment fails to type-check — the compiler points at every missing branch. This converts a runtime "unhandled case" bug into a compile-time error.

## The Runtime Boundary

Type information stops at the runtime boundary. Values crossing in must be parsed; values crossing out are serialized.

| Boundary | Risk | Discipline |
|---|---|---|
| `JSON.parse(networkResponse)` | Returns `any` (or `unknown` with stricter typing); no validation | Parse with a schema (Zod, io-ts) before trusting the type |
| `process.env.X` | All env vars are `string \| undefined`, but TypeScript may type them as `string` via globals | Validate at startup with a typed env config object |
| `localStorage.getItem(k)` | Returns `string \| null`, but the contents are untyped | Parse + validate before use |
| `fetch(url).then(r => r.json())` | The promise resolves with `any` | Validate against an expected schema |
| Database driver results | Library-typed; trust depends on the library's contract | Verify the library actually checks types at the boundary |
| `Function(string)` / `eval` | Arbitrary code; arbitrary types | Avoid; if necessary, type the result as `unknown` |

The pattern: **validate at the boundary; trust the type inside.**

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.coerce.date(),
});

type User = z.infer<typeof UserSchema>;

async function fetchUser(id: string): Promise<User> {
  const raw = await fetch(`/api/users/${id}`).then(r => r.json());
  return UserSchema.parse(raw);  // throws on validation failure
}
// Inside the rest of the program, User is trusted.
```

## `any` vs `unknown` vs `never`

| Type | Set of values | What you can do with it |
|---|---|---|
| `any` | All values | Anything (escape hatch — no checking) |
| `unknown` | All values | Nothing until you narrow (safe escape hatch) |
| `never` | No values | Nothing (used for exhaustiveness checks and unreachable code) |
| `void` | Returned, not consumed | Function return only; the value is "no value worth using" |

Rule: prefer `unknown` over `any` always. The cost is one narrowing step; the benefit is type-safety preserved.

## Verification

After applying this skill, verify:
- [ ] TypeScript strict mode is enabled (`"strict": true` in tsconfig).
- [ ] `noUncheckedIndexedAccess` is enabled; array/object access produces `T | undefined`.
- [ ] No `any` appears in committed code without an inline comment explaining why `unknown` is insufficient.
- [ ] No `as Type` cast appears without an inline comment explaining why narrowing is insufficient.
- [ ] Every I/O boundary parses with a runtime validator (Zod, io-ts, valibot, etc.) before the value is treated as typed.
- [ ] Discriminated unions have an exhaustiveness check at every consumer site.
- [ ] Public API boundaries (exported functions, route handlers, library entry points) have explicit return types — not just inferred.
- [ ] `// @ts-ignore` and `// @ts-expect-error` are accompanied by a justification and a tracking comment.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the JSON shape of an API endpoint | `api-design` | api-design owns the external surface contract; this skill owns internal type discipline |
| Verifying behavior at runtime with tests | `testing-strategy` | testing-strategy owns runtime verification; this skill owns compile-time |
| Designing database schema and column types | `data-modeling` | data-modeling owns persistence shape; this skill owns in-memory type contracts |
| Choosing between Zod / io-ts / valibot | individual library docs + `api-design` | Library choice is a tactical decision below this skill |
| Implementing the compiler / type-checker | language compiler implementation references | Out of scope — this skill is about *using* type systems, not building them |

## Key Sources

- Pierce, B. C. (2002). *Types and Programming Languages*. MIT Press. The canonical textbook. Chapters 1-3 cover untyped lambda calculus, simple types, and the soundness/progress/preservation framework that underpins every type system.
- Siek, J. G., & Taha, W. (2006). "Gradual Typing for Functional Languages." *Scheme and Functional Programming 2006*. The original gradual typing paper.
- Siek, J. G., & Vachharajani, M. (2008). "Gradual typing with unification-based inference." *Proceedings of the 2008 symposium on Dynamic languages*. Formalizes the soundness vs ergonomics trade-off in gradual systems.
- Microsoft. [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html). The reference for TypeScript's type system, including the documented unsoundness in *Type Compatibility* and *Narrowing* chapters.
- Anders Hejlsberg et al. [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals). Explicit acknowledgement that TypeScript trades soundness for ergonomics: "non-goals: apply a sound or 'provably correct' type system."
- Curry, H. B., & Feys, R. (1958). *Combinatory Logic, Volume I*. Original work on the Curry-Howard correspondence — types as propositions, programs as proofs.
