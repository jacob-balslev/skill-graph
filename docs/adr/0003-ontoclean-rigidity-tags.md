# ADR 0003 — OntoClean Rigidity Tags for Archetypes

- **Status:** Accepted (2026-04-20)
- **Deciders:** Skill Graph maintainers
- **Relates to:** ADR 0001 (Predicate Set)
- **Method:** Guarino & Welty, *Evaluating Ontological Decisions with OntoClean*

## Context

The external audit of 2026-04-20 flagged a latent modelling bug: the combination of `type: overlay` + `extends` + `category` can accidentally subsume a rigid category under an anti-rigid overlay. In OntoClean terms, an anti-rigid property cannot have a rigid property as its subclass — doing so produces unsatisfiable class hierarchies. The audit asked for explicit rigidity tagging on each archetype so authors and reviewers can recognise the violation before it ships.

## Decision

Annotate each archetype with four OntoClean meta-properties: **Rigidity (R)**, **Identity (I)**, **Unity (U)**, **Dependence (D)**.

| Archetype | Rigidity | Identity | Unity | Dependence |
|---|---|---|---|---|
| `capability` | **+R** (rigid) — a capability is what the skill *is*, essentially | **+I** — has its own identity criteria | **+U** — unitary scope | **-D** — does not existentially depend on another skill |
| `workflow` | **+R** (rigid) — the workflow is the essence | **+I** — has its own identity | **+U** — unitary procedure | **-D** — does not depend on another skill |
| `router` | **~R** (semi-rigid) — the router is defined by what it dispatches to; its essence can shift | **-I** — identity is inherited from the dispatch set | **~U** — scope is the union of targets | **+D** — depends on target skills for meaning |
| `overlay` | **-R** (anti-rigid) — an overlay's essence is "specialisation of X" and vanishes without X | **-I** — identity inherited from parent | **-U** — scope is parent-relative | **+D** — existentially depends on `extends` target |

### The constraint

OntoClean's key constraint: **an anti-rigid property cannot subsume a rigid property.** Applied here:

- An `overlay` (-R) cannot have a `capability`/`workflow` (+R) as `extends` target such that the overlay would *replace* the capability's identity. Overlay must *specialise* — inherit identity from parent, not redefine it.
- A `capability` (+R) cannot be declared an overlay of another `capability` — that is a +R under -R chain.

### The test

During skill authoring and review, for any `type: overlay`, answer yes to both:

1. Does the overlay's identity *depend* on the parent's identity? (If the parent were deleted, would the overlay become meaningless?)
2. Does the overlay *specialise* rather than *replace* the parent's scope?

If either answer is no, the skill is not an overlay — it is a separate `capability` or `workflow`. Change the `type` accordingly.

## Rationale

- **OntoClean is a battle-tested method for catching exactly this class of bug.** Guarino & Welty demonstrated it against WordNet and found hundreds of subsumption errors that had sat undetected. Applying it to four archetypes is trivial by comparison.
- **Explicit tags beat implicit assumptions.** Today the constraints exist informally — an author "just knows" that overlay specialises. The tags make the knowledge discoverable in the field-reference.
- **The rigidity tags cost nothing at runtime.** They are documentation. No schema change, no lint rule.
- **They unlock a future lint rule.** A v4 lint check can read the tags and warn when an overlay's body rewrites the parent's `## Coverage` (a signal of replacement, not specialisation). That is cheap to add once the tags are canonical.

## Consequences

### Positive

- Documentation gains a principled explanation of why `overlay` is different from the other archetypes.
- Future lint rules can reference the tags instead of inventing ad-hoc heuristics.
- Authors writing their first overlay have a concrete test to run against.

### Negative

- Minor cognitive load in the field-reference. Mitigated by keeping the tags in a single summary table, not repeated per field.

### Neutral

- Existing skills do not need updating; the tags describe properties the archetypes already had implicitly.

## References

- Guarino, N. & Welty, C. A. (2002). *Evaluating Ontological Decisions with OntoClean.* Communications of the ACM 45(2):61-65.
- Guarino, N. & Welty, C. *An Overview of OntoClean.* In *Handbook on Ontologies*, Springer 2009, pp. 201-220.
