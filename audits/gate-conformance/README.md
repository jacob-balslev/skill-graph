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
- **[`fixtures/invalid/<rule>/`](fixtures/invalid)** and
  **[`fixtures/warn/<rule>/`](fixtures/warn)** — one intentionally-broken or
  intentionally-warning skill per rule, each broken in exactly one way so the
  assertion is unambiguous. These live here (not under `examples/fixture-skills/`)
  **deliberately**: they are outside every corpus lint/manifest/eval sweep, so a
  negative fixture can never redden `npm run verify`.
- **[`fixtures/audit-workspaces/`](fixtures/audit-workspaces)** — hermetic
  mini-workspaces for gates that read audit runs or a workspace root rather than
  one `SKILL.md` path. They are fixture workspaces, not corpus content.
- **[`../../scripts/__tests__/test-gate-conformance.js`](../../scripts/__tests__/test-gate-conformance.js)**
  — the runner. For each scenario it runs the named existing gate script via a
  child process and asserts the exit code + output. It adds **no gate logic** of
  its own. Runs as part of `npm run test:unit` → `verify` / `verify:system`.

## Gate → coverage map

This suite covers both single-skill path gates and the small workspace-scoped
gates that can run against hermetic fixture workspaces:

| Gate | Verdict | Driven by | Covered here |
|---|---|---|---|
| Structural Integrity | `structural_verdict` | `../../scripts/skill-lint.js` | ✅ missing required field, out-of-enum `subject`, dangling `relations.*` target, `comprehension_state`→Understanding cross-file rule, invalid `audit-state.json` sidecar (missing required field), report-only warning for missing durable Audit Status verdict fields |
| Truth | `truth_verdict` | `../../scripts/skill-graph-drift.js` | ✅ BROKEN on a missing declared truth source |
| Verdict/artifact honesty | `comprehension_verdict` | `../../scripts/check-audit-manifest.js` | ✅ empty positive-control workspace, graded verdict without its eval artifact fails |

The Behavior Gate verdict (`comprehension_verdict`) is
an LLM-graded behavior measurement, not a deterministic pass/fail check, so it is
not modeled directly as a conformance scenario. The deterministic scaffolding that
keeps those verdicts honest is modeled here.

## Adding a scenario

> "Broken in exactly one way" means **one contract-relevant error**, not zero
> warnings. The negative fixtures still emit incidental lint *warnings* (e.g. the
> missing field-purpose-comment warning), which are not part of the conformance
> contract. Assert the gate's specific *error* diagnostic, and prefer
> path-independent substrings — a substring that also appears in the fixture path
> or echoed source can make a scenario pass for the wrong reason. `output_contains`
> accepts a list (all must appear); use it to pin both the gate phrase and the
> field (e.g. a backtick-wrapped `` `scope` `` that the bare path can't match).

1. Add (or reuse) a fixture under `fixtures/invalid/<rule>/` broken in exactly
   one contract-relevant way.
2. Add a `scenario` row to `spec.yaml` with its `given` / `when` / `then`.
3. If the scenario needs a gate not yet wired, add a one-line builder to the
   `WHEN` map in the runner — never inline gate logic in the runner.
4. Run `node ../../scripts/__tests__/test-gate-conformance.js`.

## Anti-patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Putting invalid fixtures under `examples/fixture-skills/` | `verify:system` runs `skill-lint.js --path examples/fixture-skills` and would fail on them. Keep them here, out of every sweep. |
| Adding gate logic to the runner | The runner only orchestrates existing gate scripts. New checks belong in the gate script; the runner just calls it. |
| A fixture broken in two ways | The failing assertion stops isolating one rule. One broken (error-level) thing per fixture; incidental warnings are fine. |
| A weak `output_contains` (substring also in the fixture path / echoed source) | The scenario can pass even if the intended gate stops firing. Assert a path-independent diagnostic substring (use the list form to pin the field too). |
