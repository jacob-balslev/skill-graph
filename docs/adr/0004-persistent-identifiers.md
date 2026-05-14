# ADR 0004 — Persistent Identifiers via URN

- **Status:** Accepted (2026-04-20)
- **Deciders:** Skill Graph maintainers
- **Relates to:** ADR 0002 (JSON-LD @context), FAIR Findability

## Context

The external audit of 2026-04-20 found that Skill Graph covers FAIR Findability well *within a single repository* (via `name`, `keywords`, `triggers`, `examples`, `category`) but has **no globally unique persistent identifier**. `name` is unique only inside one repo; two workspaces both shipping a skill called `knowledge-graph` have no way to be told apart. This blocks cross-repo federation, registry publication, and long-term citation.

## Decision

Introduce an **optional** top-level `urn` field in v3 (additive, non-breaking) and make it **required** in v4 (breaking, one major bump away). The URN follows the syntax:

```
urn:skill:<repo-slug>:<skill-name>
```

Examples:

- `urn:skill:skill-graph:knowledge-graph`
- `urn:skill:<placeholder-repo-a>:data-table-ux`
- `urn:skill:<placeholder-repo-b>:order-fulfillment`
- `urn:skill:<placeholder-repo-c>:seo-keywords`

Rules:

1. `<repo-slug>` is the publishing repo's canonical short handle. Lowercase, hyphen-separated, `[a-z0-9-]+`.
2. `<skill-name>` must match the skill's `name` field.
3. The `urn` value must be globally unique. A registry (future work) resolves URNs to skill manifests.
4. Consumers treat the URN as the stable identity. `name` is display-layer.
5. The URN is the `@id` in the JSON-LD projection (see ADR 0002).

Regex: `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`

## Rationale

- **URN is the right tool.** RFC 8141 defines URNs as namespaced, resolvable-optional, persistent. The `urn:skill:` namespace can be registered with IANA later; the scheme is valid without registration because URNs are syntactic identifiers.
- **Globally unique beats locally unique.** A federated registry, cross-repo import, or long-term citation all require global identity. `name` cannot carry that load.
- **Optional-in-v3, required-in-v4 respects existing libraries.** No skill needs to ship a URN today. Authors can add them incrementally. The schema bump consolidates the change with other v4 breaking changes so there is no "URN-only bump".
- **URN over URL.** URLs imply web resolvability; we are not yet running a resolver. URN is honest about the identifier-only role. If we ever add a resolver, the URN can still be the canonical ID and the URL becomes the resolution endpoint.

## Consequences

### Positive

- FAIR Findability moves from "repo-local" to "global".
- Cross-repo skill federation is unblocked.
- Long-term citation is possible — an external doc can cite `urn:skill:skill-graph:knowledge-graph@1.0.0` as a stable reference.
- JSON-LD projection gains a proper `@id` instead of inventing one from the `name`.

### Negative

- Skills without URNs in v3 are identifiable only by `name` + repo context. Acceptable because the field is optional.
- v4 bump forces every skill to add one. Mitigated by a codemod (`scripts/migrate-v3-to-v4.js` — future work) that infers the URN from the repo root.

### Neutral

- Today's skills continue to validate without the field.
- The JSON-LD `@context` already maps `urn` → `@id` (ADR 0002), so adding the field does not require a context update.

## Implementation checklist

- [x] Add optional `urn` field to `schemas/skill.v3.schema.json` with the regex above.
- [x] Add optional `urn` field to `schemas/skill.schema.json` (mirror of v3).
- [x] Add `urn` to `docs/field-reference.md` with a URN-authoring guide.
- [x] Map `urn` to `@id` in `schemas/skill.context.jsonld`.
- [ ] Ship `scripts/migrate-v3-to-v4.js` when v4 is cut (out of scope for this ADR).
- [ ] Decide and publish the repo-slug-to-URN mapping rule for multi-root workspaces (out of scope for this ADR).

## References

- RFC 8141 — Uniform Resource Names (URNs) — https://datatracker.ietf.org/doc/html/rfc8141
- FAIR Principles, F1 "(Meta)data are assigned a globally unique and persistent identifier" — Wilkinson et al. 2016
