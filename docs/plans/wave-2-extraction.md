# Wave 2 Extraction Plan

Status: retained as sequencing rationale. The current repository has already shipped the universal Tier A and Tier B recommendations from `docs/recommended-skills.md`; this plan explains the broader extraction strategy that informed those choices.

## Goal

Wave 2 was the expansion from a small starter set into a library large enough to demonstrate Skill Graph's actual value:

- Multiple archetypes, not only `capability`.
- Multiple scopes, including portable, reference, and codebase skills.
- Enough relation density for routing, verification, and boundary behavior to matter.
- Enough domain variety that `category`, `category`, `workspace_tags`, and `routing_bundles` are visibly different axes.

The goal was not to maximize skill count. The goal was to make the protocol's graph shape observable in real authored skills.

## Selection Axes

Wave 2 candidates were evaluated against four axes:

| Axis | Question |
|---|---|
| Universal utility | Would a broad set of developers or agents benefit immediately? |
| Graph value | Does this skill create useful `relations`, `grounding`, or routing boundaries? |
| Archetype coverage | Does it exercise `capability`, `workflow`, `router`, or `overlay` behavior? |
| Scope coverage | Does it prove the difference between portable, reference, and codebase skills? |

The final OSS recommendation split these concerns:

- `docs/recommended-skills.md` optimizes for universal adopter utility.
- This Wave 2 plan optimizes for expressive coverage and graph density.

## Candidate Clusters

### Core Library Operations

These skills make a Skill Graph library self-maintaining:

- `skill-router`
- `skill-scaffold`
- `graph-audit`
- `skill-infrastructure`
- `documentation`

### Everyday Engineering

These skills earn broad utility across most software projects:

- `debugging`
- `testing-strategy`
- `refactor`
- `code-review`
- `version-control`
- `database-migration`
- `webhook-integration`
- `error-tracking`

### AI-Native Engineering

These skills address agent-era work directly:

- `prompt-craft`
- `context-engineering`
- `tool-call-strategy`
- `agent-engineering`
- `agent-orchestration`
- `agent-observability`

### Knowledge Organization

These skills demonstrate the protocol's semantic and taxonomic range:

- `taxonomy-design`
- `ontology-modeling`
- `semantics`
- `knowledge-modeling`
- `knowledge-graph`
- `bounded-context-mapping`

### Design And UX

These skills demonstrate non-codebase expertise while still benefiting from routing groups and boundaries:

- `a11y`
- `task-analysis`
- `user-research`
- `research-synthesis`
- `journey-mapping`
- `layout-composition`
- `visual-hierarchy`
- `typography-system`
- `color-system-design`
- `interaction-patterns`
- `form-ux-architecture`
- `microcopy`

### Doctrine And Strategy

These were treated as advanced, demand-driven candidates because they need stronger body prose and clearer routing boundaries:

- `theory-of-constraints`
- `ooda-loop`
- `shape-up`
- `wardley-mapping`
- `domain-driven-design`

## Extraction Order

1. Ship the original eight starters as the minimal specimen set.
2. Close universal Tier A utility: authoring, review, naming, prompting, security, and accessibility.
3. Add Tier B operational skills that most projects eventually need.
4. Add one specialized cluster at a time only when the cluster demonstrates a new protocol behavior or clear adopter demand.
5. Use routing evals and overlap checks after every batch; do not let graph density become duplicate activation noise.

## Exit Criteria

Wave 2 is done when the library has:

- A credible universal baseline for everyday engineering and AI-agent work.
- At least one strong example of every shipped archetype.
- Relation edges that are useful to routing and verification, not decorative.
- Drift and eval metadata that reflect real maintenance posture.
- Documentation that explains why the current inventory exists without relying on private synthesis notes.
