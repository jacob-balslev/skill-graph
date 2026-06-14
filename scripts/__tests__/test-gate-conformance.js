#!/usr/bin/env node
'use strict';

/**
 * test-gate-conformance.js — executable conformance suite for the Skill Audit
 * Loop gates and the Skill Metadata Protocol validation rules.
 *
 * Reads `audits/gate-conformance/spec.yaml` (the declarative Given/When/Then
 * source of truth for the gate criteria) and, for every scenario, runs the
 * named EXISTING gate script against the scenario's fixture, asserting the exit
 * code and output. This runner adds NO gate logic of its own — it orchestrates
 * the gate scripts the scenarios reference (currently `skill-lint.js` for the
 * structural gate, `skill-graph-drift.js` for the truth gate,
 * `check-application-evals.js` for application-eval structure, and
 * `check-audit-manifest.js` for verdict/artifact honesty; see the WHEN map
 * below). Negative fixtures live under
 * `audits/gate-conformance/fixtures/invalid/<rule>/` or hermetic fixture
 * workspaces under `audits/gate-conformance/fixtures/*-workspaces/`,
 * deliberately outside every corpus lint/manifest/eval sweep so they can never
 * redden `verify`.
 *
 * The spec is authored in YAML and parsed with the repo's existing
 * `scripts/lib/parse-frontmatter.js` (wrapped in `---` delimiters) — no new
 * dependency. See `audits/gate-conformance/README.md` for the contract.
 *
 * Run:
 *   node scripts/__tests__/test-gate-conformance.js
 * Part of `npm run test:unit` (and therefore `verify` and `verify:system`).
 * Exits non-zero on the first failing scenario (assert throws), per the repo's
 * plain-`assert` test convention.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseFrontmatter } = require('../lib/parse-frontmatter');

const REPO_ROOT = path.resolve(__dirname, '../..');
const SPEC_DIR = path.join(REPO_ROOT, 'audits', 'gate-conformance');
const SPEC_FILE = path.join(SPEC_DIR, 'spec.yaml');
const BOM = String.fromCharCode(0xfeff);

/**
 * WHEN map: `scenario.when` → the argv (relative to REPO_ROOT) for the existing
 * gate script that implements that check. `givenAbs` is the absolute path to
 * the scenario's fixture dir; `scenario` is the full parsed scenario object so
 * a builder can read extra fields (e.g. a `--skill <name>`).
 *
 * Add a row here when a new gate gets a conformance scenario — never inline new
 * gate logic in this file.
 */
const WHEN = {
  // Structural Integrity Gate — schema + frontmatter + cross-file rules.
  'skill-lint': (givenAbs) => ['scripts/skill-lint.js', '--path', givenAbs, '--no-color'],
  // Truth Gate — drift sentinel; takes the fixture's SKILL.md positionally and
  // exits non-zero on DRIFT or BROKEN.
  'drift': (givenAbs) => ['scripts/skill-graph-drift.js', path.join(givenAbs, 'SKILL.md')],
  // Application-eval structural gate — hermetic fixture workspace with its own
  // .skill-graph/config.json, so the check does not scan the live corpus.
  'application-evals': (givenAbs, scenario) => ({
    argv: [
      'scripts/check-application-evals.js',
      '--skill',
      scenario.skill || 'demo-skill',
      '--check',
    ],
    env: { SKILL_GRAPH_WORKSPACE: givenAbs },
  }),
  // Verdict/artifact honesty gate — hermetic fixture workspace for per-run
  // verdicts and skill sidecars; the script still validates the real SYSTEM
  // manifest paths from this repo.
  'audit-manifest': (givenAbs) => [
    'scripts/check-audit-manifest.js',
    '--workspace',
    givenAbs,
    '--limit',
    '5',
  ],
};

/** Load + parse the YAML spec into its `scenarios` array. */
function loadScenarios() {
  assert(fs.existsSync(SPEC_FILE), `gate-conformance spec not found: ${SPEC_FILE}`);
  const raw = fs.readFileSync(SPEC_FILE, 'utf8').split(BOM).join('');
  const fm = parseFrontmatter(`---\n${raw}\n---\n`);
  assert(
    fm && Array.isArray(fm.scenarios) && fm.scenarios.length > 0,
    'spec.yaml must parse to a non-empty `scenarios:` list'
  );
  return fm.scenarios;
}

/** Run one scenario and assert its `then` outcome against the live gate run. */
function runScenario(scenario) {
  const { id, when, given, then } = scenario;
  assert(id, 'scenario is missing `id`');
  assert(when, `scenario ${id}: missing \`when\``);
  assert(given, `scenario ${id}: missing \`given\``);
  assert(then, `scenario ${id}: missing \`then\``);

  const build = WHEN[when];
  assert(build, `scenario ${id}: unknown \`when: ${when}\` — add it to the WHEN map`);

  const givenAbs = path.resolve(SPEC_DIR, given);
  assert(fs.existsSync(givenAbs), `scenario ${id}: \`given\` path not found: ${given}`);

  const command = normalizeCommand(build(givenAbs, scenario));
  const res = spawnSync('node', command.argv, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...(command.env || {}) },
  });
  assert(!res.error, `scenario ${id}: failed to spawn ${command.argv.join(' ')}: ${res.error}`);
  const output = `${res.stdout || ''}${res.stderr || ''}`;

  if (then.exit !== undefined) {
    assert.strictEqual(
      res.status,
      Number(then.exit),
      `scenario ${id}: expected exit ${then.exit}, got ${res.status}\n--- command ---\nnode ${command.argv.join(' ')}\n--- output ---\n${output}`
    );
  }
  // `output_contains` / `output_absent` accept a string OR an array of strings.
  // For an array, EVERY element must (or must not) appear. Asserting multiple
  // path-independent substrings from the gate's actual diagnostic is how a
  // scenario avoids passing for the wrong reason — a single substring that also
  // appears in the fixture path or echoed source is a weak assertion.
  for (const needle of asList(then.output_contains)) {
    assert(
      output.includes(needle),
      `scenario ${id}: expected output to contain "${needle}"\n--- output ---\n${output}`
    );
  }
  for (const needle of asList(then.output_absent)) {
    assert(
      !output.includes(needle),
      `scenario ${id}: expected output to NOT contain "${needle}"\n--- output ---\n${output}`
    );
  }
}

/** Accept a legacy argv array or a richer { argv, env } command object. */
function normalizeCommand(command) {
  if (Array.isArray(command)) return { argv: command, env: {} };
  assert(command && Array.isArray(command.argv), 'WHEN builder must return argv[] or { argv, env }');
  return command;
}

/** Normalize a scalar-or-array `then` field to an array of strings (or []). */
function asList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
}

function main() {
  const scenarios = loadScenarios();

  // Guard against silent duplicate ids in the spec.
  const seen = new Set();
  for (const s of scenarios) {
    assert(!seen.has(s.id), `duplicate scenario id in spec.yaml: ${s.id}`);
    seen.add(s.id);
  }

  for (const s of scenarios) {
    runScenario(s);
    console.log(`  ok  ${String(s.gate || '?').padEnd(13)} ${s.id}`);
  }
  console.log(`\nPASS gate-conformance: ${scenarios.length}/${scenarios.length} scenario(s)`);
}

main();
