# 30-Minute Quickstart for Project Developers

> **Audience.** A working developer with at least one painful skill — wrong-skill activation on an ambiguous prompt, or a `SKILL.md` quoting a file that no longer exists, or skills that should be project-scoped but live in a shared folder. You have ~30 minutes and a Node 20+ environment.
>
> **What you'll do.** Adopt Skill Graph for one painful workflow — author a `webhook-review` skill grounded in real repository files, add a second skill that depends on it, watch the lint catch a broken relation, route a real query, and record a drift baseline so the skill warns you when its truth source moves.
>
> **What you won't do.** Migrate your whole library yet. Pilot on one skill first; the rest follows after you've felt the contract pay off once.

| Minute | Step | What you'll learn |
|---|---|---|
| M0–M2 | Clone the repo and install | The repo runs with zero external dependencies |
| M3–M7 | Copy the template into your first skill directory | The authoring flow is copy → rename → adapt → strip → verify |
| M8–M11 | Fill in the 13 required v3 fields for `webhook-review` | Why each field exists and what it commits you to |
| M12–M15 | Lint your first skill | Lint output is the primary debugging surface |
| M16–M19 | Create a second skill (`webhook-incident-runbook`) with a `relations.depends_on` link | The graph is real — relations enforce that `depends_on` targets exist |
| M20–M24 | Break the relation deliberately and watch lint catch it | The contract fails loud, not silent |
| M25–M29 | Route a real query and read the routing trace | Why each skill was SELECTED, CO-LOADED, or EXCLUDED |
| M30 | Record the drift baseline | The skill now knows when its truth source moved |

---

## M0–M2: Clone and install

```bash
git clone https://github.com/jacobbalslev/skill-graph my-skill-library
cd my-skill-library
node --version
```

Expected output:

```
v20.17.0
```

That's it for installation. Skill Graph has zero runtime dependencies — every script is pure Node with no `npm install` step. (`package.json` exists for `prettier` only, used in CI.)

---

## M3–M7: Copy the template into `webhook-review`

```bash
mkdir -p skills/webhook-review
cp examples/skill-template.md skills/webhook-review/SKILL.md
ls skills/webhook-review/
```

Expected output:

```
SKILL.md
```

Open `skills/webhook-review/SKILL.md` in your editor. The template is a *real, valid, schema-conformant* Skill Graph skill whose subject is skill authoring itself. You'll adapt it by:

1. Renaming the identity (`name`, `description`, `version`)
2. Rewriting `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When` for your subject
3. Stripping every `# TEMPLATE NOTE:` YAML comment and `> **TEMPLATE NOTE:**` blockquote — they are authoring scaffolding, never skill content

The template lints clean as-is, so you can incrementally edit and re-lint to catch mistakes early.

---

## M8–M11: Fill in the 13 required v3 fields

The 13 required v3 fields are: `schema_version`, `name`, `description`, `version`, `type`, `browse_category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`. The template has all 13 — you're replacing values, not adding fields.

For `webhook-review`, the values look like:

```yaml
schema_version: 3
name: webhook-review
description: "Use when reviewing or implementing the webhook receiver for a third-party integration — verifying the signature header, reading the raw request body before parsing, returning the correct HTTP status codes, and pairing verification with an idempotency layer. Activate this skill whenever the task touches files under `app/api/webhooks/**` or mentions webhook signature verification — even if the user just says 'the webhook'. Do NOT use for general API authentication patterns (use a different skill) or for chasing a specific webhook failure from logs (use debugging)."
version: 0.1.0
type: capability
browse_category: integration
scope: codebase
owner: <your-handle-or-team>
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
```

For `scope: codebase` you also need a `grounding` block — point it at the real webhook handler in your repo:

```yaml
grounding:
  domain_object: "Webhook signature verification primitive — the cryptographic check that makes the signature header trustworthy"
  grounding_mode: repo_specific
  truth_sources:
    - app/api/webhooks/stripe/route.ts
    - lib/webhooks/verify-signature.ts
    - .env.example
  failure_modes:
    - signature_check_skipped
    - raw_body_mutated_before_verify
    - constructEvent_in_try_catch_with_swallow
  evidence_priority: repo_code_first
```

Adjust the `truth_sources` paths to match your actual handler files. Strip every `# TEMPLATE NOTE:` and `> **TEMPLATE NOTE:**` blockquote before the next step.

---

## M12–M15: Lint your first skill

```bash
node scripts/skill-lint.js skills/webhook-review
```

If everything is correct:

```
OK   [T1↔T3]     schemas/ (cross-schema parity)
OK   [T5 sample] examples/skills.manifest.sample.json
OK   [T3↔T5]     examples/skills.manifest.sample.json (generator parity)
OK   [T5 evals]  examples/evals/ (truth_source ranges)
OK   [T5]        skills/webhook-review/SKILL.md

1 file(s) checked, 0 error(s).
```

If a required field is missing, the failure looks like:

```
FAIL skills/webhook-review/SKILL.md
  ─ schema: must have required property 'browse_category'

1 file(s) checked, 1 error(s).
```

The lint is opinionated and verbose by design — it tells you the file, the rule, the field, and the fix. It is the primary debugging surface for authoring.

---

## M16–M19: Create a second skill with a `depends_on` link

Most pain in skill libraries comes from skills that *depend on* each other but don't say so. Let's add `webhook-incident-runbook` (a workflow skill that runs when a webhook outage happens) and have it declare `depends_on: webhook-review` — the runbook can't proceed if the underlying review skill isn't authored.

```bash
mkdir -p skills/webhook-incident-runbook
cp examples/skill-template.md skills/webhook-incident-runbook/SKILL.md
```

Edit `skills/webhook-incident-runbook/SKILL.md` to set:

```yaml
schema_version: 3
name: webhook-incident-runbook
description: "Use when a webhook receiver is failing in production — reproduce the failure, isolate to a specific provider, restore service. Activate this skill whenever the task says 'the webhook is down' or mentions a webhook outage. Do NOT use for routine code-review of webhook receivers (use webhook-review)."
version: 0.1.0
type: workflow
browse_category: integration
scope: portable
owner: <your-handle>
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
relations:
  depends_on:
    - skill: webhook-review
      min_version: "^0.1.0"
```

Body: include the required `## Workflow` section (workflow archetype mandates it), plus `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When`.

Lint:

```bash
node scripts/skill-lint.js skills/webhook-incident-runbook
```

Expected:

```
OK   [T5]        skills/webhook-incident-runbook/SKILL.md

1 file(s) checked, 0 error(s).
```

---

## M20–M24: Break the relation and watch lint catch it

In `skills/webhook-incident-runbook/SKILL.md`, change the depends_on target from `webhook-review` to a name that doesn't exist yet:

```yaml
relations:
  depends_on:
    - skill: webhook-review-typo
      min_version: "^0.1.0"
```

Re-lint:

```bash
node scripts/skill-lint.js skills/webhook-incident-runbook
```

Expected:

```
FAIL skills/webhook-incident-runbook/SKILL.md
  ─ relations.depends_on: "webhook-review-typo" does not match any known skill in skills/

1 file(s) checked, 1 error(s).
```

The lint walks every relation predicate (`depends_on`, `verify_with`, `boundary`, `adjacent`, `disjoint_with`) and verifies that every named target resolves to a real sibling skill in `skills/`. This is the contract that catches the most-painful failure mode in real libraries: a skill that *claims* it depends on another, but the other was renamed/deleted/never-shipped, and nothing surfaces the broken edge until an agent tries to load the relation chain at runtime.

Restore the correct name:

```yaml
relations:
  depends_on:
    - skill: webhook-review
      min_version: "^0.1.0"
```

Re-lint and confirm `0 error(s)`.

---

## M25–M29: Route a real query

```bash
node scripts/skill-graph-route.js "review my webhook receiver for signature handling"
```

Expected (your output will list whatever skills exist in your library):

```
Query: "review my webhook receiver for signature handling"

SELECTED
  Skill                   Score  State        Reason
  ────────────────────────────────────────────────────────────────────────
  webhook-review          7      unverified   keyword:webhook signature verification, keyword:webhook receiver, keyword:webhook authentication

CO-LOADED
  Skill                   State        Reason
  ────────────────────────────────────────────────────────────────────────
  webhook-incident-runbook unverified  depends_on: webhook-review depends on this skill

1 selected, 1 co-loaded, 0 excluded. 0 stale.
```

Read the trace as evidence:

- **SELECTED** — the router picked `webhook-review` because three keyword tokens matched. You can see exactly *which* keywords matched, so if the wrong skill activates you can fix the keyword list rather than guess.
- **CO-LOADED** — `webhook-incident-runbook` is loaded alongside because it `depends_on: webhook-review`. The router respects the graph automatically — you don't have to ask for the dependency.
- **EXCLUDED** — would appear if any skill named `webhook-review` in its `relations.boundary` (anti-routing). Empty here because no boundary fires.

---

## M30: Record the drift baseline

`webhook-review` is grounded in three truth sources (the route handler, the verifier, the env example). If any of those files change, the skill might be silently lying. Record the baseline so the drift sentinel can warn you:

```bash
node scripts/skill-graph-drift.js --record --apply skills/webhook-review
```

Expected:

```
Recorded baseline for webhook-review:
  app/api/webhooks/stripe/route.ts: <sha256...>
  lib/webhooks/verify-signature.ts: <sha256...>
  .env.example: <sha256...>

Updated skills/webhook-review/SKILL.md frontmatter: drift_check.truth_source_hashes
```

Run the drift check:

```bash
node scripts/skill-graph-drift.js
```

Expected:

```
13 skill(s): 0 DRIFT, 0 NO_BASELINE, 12 UNGROUNDED
```

(`UNGROUNDED` = skills with no `grounding` block; that's normal for `scope: portable` and `scope: reference` skills.)

Now edit `app/api/webhooks/stripe/route.ts` (any change — add a comment) and re-run drift:

```bash
node scripts/skill-graph-drift.js
```

Expected:

```
DRIFT         webhook-review
  DRIFT         app/api/webhooks/stripe/route.ts

13 skill(s): 1 DRIFT, 0 NO_BASELINE, 12 UNGROUNDED
```

The skill now warns you that the truth source moved. Re-verify the skill against the changed file (does the `## Verification` checklist still pass?), then re-record the baseline once you've confirmed:

```bash
node scripts/skill-graph-drift.js --record --apply skills/webhook-review
```

---

## Where to go from here

You've adopted Skill Graph for one painful workflow. The contract paid off twice in 30 minutes — caught a broken relation at lint time and surfaced a stale truth source at drift-check time.

| Next step | Read |
|---|---|
| Migrate your second skill | This document, repeated for the next skill |
| Understand the full contract | [`docs/PRIMER.md`](PRIMER.md) and [`docs/metadata-contract.md`](metadata-contract.md) |
| See worked examples in a real project | [`examples/projects/saas-stripe-postgres/README.md`](../examples/projects/saas-stripe-postgres/README.md) |
| Set up CI integration | [`docs/integrations/github-actions.md`](integrations/github-actions.md) |
| Decide which skills to author next | [`docs/recommended-skills.md`](recommended-skills.md) |

If a step in this quickstart did not match your local output, file an issue — the lint output is the primary debugging surface and any divergence between the documented expected output and the real output is a bug in the docs or the script, never in your skill.
