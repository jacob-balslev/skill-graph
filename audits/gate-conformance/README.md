# Gate & Protocol Conformance Spec

> Type: Reference + executable test fixtures (SYSTEM).
> A declarative, YAML-authored statement of the Skill Audit Loop's gate criteria
> and the Skill Metadata Protocol's validation rules, driven against the existing
> gate scripts by [`../../scripts/__tests__/test-gate-conformance.js`](../../scripts/__tests__/test-gate-conformance.js).

## Why this exists

The pass/fail/relevance criteria for the audit loop's gates and the protocol's
field rules previously lived only in prose ([`../../skill-audit-loop/SKILL_AUDIT_LOOP.md`](../../skill-audit-loop/SKILL_AUDIT_LOOP.md),
[`../../docs/verdict-semantics.md`](../../docs/verdict-semantics.md)), in the deterministic
gate scripts, and in the JSON Schema — with **no single executable contract**
saying "given input X, this gate yields verdict/error Y". The fixture library
also had only *passing* fixtures (`../../examples/fixture-skills/`) and **no
failing ones**, so rules like "must FAIL on missing `scope`" or "drift must
report BROKEN on a missing truth source" were never exercised.

`spec.yaml` closes that gap: it is the **single declarative home** for the gate
criteria, and every row is *executed* against the real gate scripts — so the
spec cannot silently drift from the implementation.

## How it works

- **[`spec.yaml`](spec.yaml)** — a list of `scenarios`, each a Given/When/Then row
  (`given` a fixture, `when` a named gate check runs, `then` the expected
  exit/output). Authored in YAML, parsed by the repo's existing
  `../../scripts/lib/parse-frontmatter.js` (no new dependency).
- **[`fixtures/invalid/<rule>/`](fixtures/invalid)** — one intentionally-broken
  skill per rule, each broken in exactly one way so the failing assertion is
  unambiguous. These live here (not under `examples/fixture-skills/`)
  **deliberately**: they are outside every corpus lint/manifest/eval sweep, so an
  invalid fixture can never redden `npm run verify`.
- **[`../../scripts/__tests__/test-gate-conformance.js`](../../scripts/__tests__/test-gate-conformance.js)**
  — the runner. For each scenario it runs the named existing gate script via a
  child process and asserts the exit code + output. It adds **no gate logic** of
  its own. Runs as part of `npm run test:unit` → `verify` / `verify:system`.

## Gate → coverage map

This suite covers the gates a **single skill** can be driven through by a
path/positional argument:

| Gate | Verdict | Driven by | Covered here |
|---|---|---|---|
| Structural Integrity | `structural_verdict` | `../../scripts/skill-lint.js` | ✅ missing required field, out-of-enum `subject`, dangling `relations.*` target, `comprehension_state`→Understanding cross-file rule |
| Truth | `truth_verdict` | `../../scripts/skill-graph-drift.js` | ✅ BROKEN on a missing declared truth source |

The **corpus-scoped** gates read the manifest / `skill_roots`, not a single
fixture, so they are not driven from this suite — they are already covered by
existing unit tests:

| Gate | Already covered by |
|---|---|
| Verdict honesty (graded verdict requires its artifact) | [`../../scripts/__tests__/test-application-verdict-write-back.js`](../../scripts/__tests__/test-application-verdict-write-back.js), [`../../scripts/__tests__/test-application-artifact-enforcement.js`](../../scripts/__tests__/test-application-artifact-enforcement.js) |
| Application-eval structural floor (≥5 cases, red-herring present) | [`../../scripts/__tests__/test-check-application-evals.js`](../../scripts/__tests__/test-check-application-evals.js) |

The Behavior Gate verdicts (`comprehension_verdict`, `application_verdict`) are
LLM-graded behavior measurements, not deterministic pass/fail checks, so they are
not modeled as conformance scenarios.

## Adding a scenario

1. Add (or reuse) a fixture under `fixtures/invalid/<rule>/` broken in exactly
   one way.
2. Add a `scenario` row to `spec.yaml` with its `given` / `when` / `then`.
3. If the scenario needs a gate not yet wired, add a one-line builder to the
   `WHEN` map in the runner — never inline gate logic in the runner.
4. Run `node ../../scripts/__tests__/test-gate-conformance.js`.

## Anti-patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Putting invalid fixtures under `examples/fixture-skills/` | `verify:system` runs `skill-lint.js --path examples/fixture-skills` and would fail on them. Keep them here, out of every sweep. |
| Adding gate logic to the runner | The runner only orchestrates existing gate scripts. New checks belong in the gate script; the runner just calls it. |
| A fixture broken in two ways | The failing assertion stops isolating one rule. One broken thing per fixture. |
