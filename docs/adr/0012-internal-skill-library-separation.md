# ADR 0012 — Internal Skill Library Separation: Defense-in-Depth Gate vs Separate Repo

**Status:** Accepted
**Date:** 2026-05-21
**Task:** SH-6322
**Parent:** SH-6281
**Related:** SH-6286 (prior leak), SH-6323 (pre-push gate), SH-6324 (CONTRIBUTING.md gate docs), SH-6325 (CI enforcement)

> **Note (2026-06-14):** the `SH-####` task IDs throughout are pre-migration historical Linear references — Skill Graph work moved to the dedicated `SKI` org on 2026-06-03. The 143-public / 162-internal skill counts are as-of 2026-05-21. The defense-in-depth boundary policy itself remains live.

## Hard Rule

> **No Sales Hub / Sales Channels / Printify / Shopify / customer / personal API / bank / credential / PII data may enter the public `skills/` repo or the eval pipeline — ever.** This rule is not softened by process convenience, agent automation, or partial-path filters.

This ADR is the architectural decision record for how that rule is structurally enforced.

## Context

Two classes of skill live in this workspace:

| Surface | Path | Count | Audience | Sensitivity |
|---|---|---|---|---|
| **Public canonical library** | `~/Development/skills/skills/` | 143 skills | Public (github.com/jacob-balslev/skills, skills.sh) | Non-PII, non-project-specific, OSS-portable |
| **Private internal skills** | `~/Development/sales-hub/.agents/skills/` | ~162 skills | Internal agent sessions only | Sales Hub, Shopify, Printify, Stripe, customer data patterns |

These two surfaces share a common parent working tree at `~/Development/`. They do **not** share a git boundary — `sales-hub/` is its own nested git repo, and `skill-graph/` is another.

### Incident: SH-6286 — Prior Leak

On 2026-05-16, four internal skills reached the public git history of `jacob-balslev/skills`. The cause was a `git add -A` (or equivalent) that crossed the `sales-hub/.agents/skills/` boundary because the operator was working from a broader working tree without per-path discipline. The skills were reverted before a push but had already been committed locally. This was the event that triggered the parent task SH-6281 and the curation of this ADR.

### Existing control

`skill-graph/scripts/export-marketplace-skills.js` already applies `PRIVACY_PATTERNS` at export time — scanning for local file paths, email addresses, private keys, known secret prefixes, `sales-hub/` path fragments, and internal DB surface names. It also enforces a publication gate that excludes any skill with `scope: codebase|operational` or `grounding_mode: repo_specific|repo_internal`.

This control is export-time only. It prevents internal content from reaching the marketplace export surface (`marketplace/skills/`), but it does not prevent internal skills from being accidentally staged into the `jacob-balslev/skills` release repo via a direct `git add` before an export step runs.

### What "protection" actually needs to cover

Three attack surfaces require blocking:

1. **Export path** — internal skills flowing through `export-marketplace-skills.js` into `marketplace/skills/` and from there into the public release repo.
2. **Direct git path** — internal skills directly `git add`-ed into the `jacob-balslev/skills` working tree and pushed without going through the export pipeline.
3. **Eval pipeline path** — internal skill content passed to the eval grader (Opus API calls) that logs or caches content externally.

## Options Considered

### Option A — Separate Private Repo

Move `sales-hub/.agents/skills/` into a dedicated private GitHub repo (e.g., `jacob-balslev/sales-hub-skills` or a private repo inside an org). The two skill surfaces live in entirely separate git histories.

**Pros:**
- Hard filesystem + git boundary. No `git add` can cross the boundary by accident.
- Identity separation: the private repo can have private CI, access controls, and secret injection without polluting the public OSS project.
- No reliance on agent discipline or per-push hooks — the separation is enforced by the version-control topology itself.

**Cons:**
- Operational friction: agents working on sales-hub skills and the public library in the same session must context-switch repos. Cross-surface references (e.g., a private sales-hub skill adapting a pattern from the public library) require explicit cross-repo coordination.
- Private repo cost: self-hosted or paid GitHub plan if secret-scanning on private repos is required; minor but real.
- Does not fix the eval pipeline path — even with separate repos, a careless eval prompt can pass private skill content to an external API.
- Does not fix the `jacob-balslev/skills` direct-git path — the release repo is still a separate git tree that can be written to directly.
- Raises the barrier to future curation (the explicit curation policy in ADR 0008 intentionally allows non-PII, non-Sales-Hub patterns to move from the private surface to the public library; a hard repo boundary makes that curation harder, not easier).

**Why rejected:** Option A solves attack surface 1 and partially 2, but not 3. It also introduces coordination friction that outweighs its structural benefit when the eval pipeline remains unguarded and the release repo remains writable. The separation it provides is boundary enforcement by physical distance — useful as a last-resort backstop, but not the defense-in-depth architecture this situation requires.

### Option B — Defense-in-Depth Gate (chosen)

Keep the single working tree topology. Layer multiple independent controls so that no single failure (accidental `git add`, misfired export, or careless eval prompt) can produce a leak:

| Layer | Gate | What it blocks |
|---|---|---|
| **L1 — Working tree `.gitignore`** | `sales-hub/.agents/skills/` in `jacob-balslev/skills` `.gitignore` with an allowlist pattern | Direct `git add` path (attack surface 2) |
| **L2 — Export pipeline scope gate** | `export-marketplace-skills.js` `scope`/`grounding_mode` exclusions + `PRIVACY_PATTERNS` scan | Export path (attack surface 1) |
| **L3 — Pre-push hook in the release repo** | `jacob-balslev/skills` pre-push hook that scans staged content for `PRIVACY_PATTERNS` hits before any push lands remotely | Both paths as a final backstop |
| **L4 — CI enforcement** | GitHub Actions workflow in `jacob-balslev/skills` that runs the same `PRIVACY_PATTERNS` scan on every PR and push | Both paths as a remote-side backstop |
| **L5 — Eval pipeline guard** | Eval prompts constructed via a content-filter step that strips codebase-scoped grounding before sending to external APIs | Eval pipeline path (attack surface 3) |

**Pros:**
- Each layer is independently testable and auditable.
- No single gate failure causes a leak — two or more layers must fail simultaneously.
- Curation path (ADR 0008) remains low-friction: a skill promoted from the private surface to the public library is explicitly curated, not blocked by a hard repo boundary.
- The gate logic (PRIVACY_PATTERNS, scope exclusions) is centralised in `export-marketplace-skills.js` and reused across layers; a change to the patterns updates all layers in one commit.
- Directly addresses all three attack surfaces, unlike Option A which misses attack surface 3.

**Cons:**
- Requires author discipline to keep hooks installed and enabled.
- More moving parts than a hard repo split; each layer must be maintained and kept consistent with the canonical PRIVACY_PATTERNS.
- Hook installation is per-clone — a fresh clone of the release repo does not auto-install the pre-push hook (mitigated by documenting in CONTRIBUTING.md as SH-6324).

## Decision

**Adopt Option B (defense-in-depth gate) as the structural enforcement architecture.**

The gate layers (L2, L3, L4) are already partially implemented; the gap is the pre-push hook (L3), CI enforcement (L4), and CONTRIBUTING.md documentation (L5 is a follow-up concern). This ADR unblocks those three child tasks.

### Rationale

Option A provides a strong structural guarantee for one attack surface (direct git add) at the cost of operational friction and incomplete coverage. Option B covers all three attack surfaces with layered, independently auditable controls — and critically, it makes the gate logic reusable and centrally maintained rather than relying solely on physical separation.

The SH-6286 incident was not a case where physical repo separation would have helped: the operator was working in the correct repo (`jacob-balslev/skills`) and used `git add` carelessly. The fix is a commit-time or push-time scan that catches internal content regardless of how it arrived, not a harder repo boundary.

A defense-in-depth architecture is strictly stronger: it does everything Option A does (via L1's allowlist `.gitignore`) plus adds the remaining layers that Option A cannot provide.

### Child tasks unblocked

| Task | What it implements | Layer |
|---|---|---|
| **SH-6323** | Pre-push hook in `jacob-balslev/skills` that runs PRIVACY_PATTERNS scan before any push | L3 |
| **SH-6325** | GitHub Actions CI workflow enforcing zero internal-path leakage on every PR | L4 |
| **SH-6324** | CONTRIBUTING.md section documenting the gate, hook installation, and the Hard Rule | Author guidance |

## Consequences

- The `PRIVACY_PATTERNS` array in `export-marketplace-skills.js` becomes the canonical gate definition. Any new internal path prefix, DB surface name, or project-specific identifier that must be blocked must be added here; all layers (L2, L3, L4) consume it via the shared module or a sourced copy.
- ADR 0008 curation policy remains valid: non-PII, non-Sales-Hub patterns may still be promoted from the private surface to the public library via the explicit curation pipeline — Option B's gates do not block deliberate, reviewed promotion.
- If a future state crosses the threshold where Option A becomes structurally attractive (e.g., the private skill surface grows a team of its own with independent CI requirements), this ADR can be superseded. The gate layers put in place by SH-6323/6324/6325 remain valid backstops regardless.
- The eval pipeline path (attack surface 3) is flagged as a follow-up concern not fully addressed by the three child tasks. A dedicated eval content-filter (L5) should be scoped as a subsequent task.

## References

- SH-6281 — parent: public skills library isolation
- SH-6286 — prior leak incident (4 internal skills reached public git history)
- SH-6322 — this ADR task
- SH-6323 — pre-push gate implementation
- SH-6324 — CONTRIBUTING.md gate documentation
- SH-6325 — CI enforcement
- ADR 0008 — Skill surface split and curation policy (governs how skills move between surfaces)
- `skill-graph/scripts/export-marketplace-skills.js` — canonical PRIVACY_PATTERNS definition
- Memory: `skill-graph-private-content-boundary.md` — workspace-level enforcement record
