#!/usr/bin/env node
/**
 * Test: integrity routing gate.
 *
 * Receipt for the router's integrity gate: the router gates ONLY on the
 * Integrity verdicts (enums per docs/verdict-semantics.md):
 *
 *   1. structural_verdict=FAIL excludes the skill (role integrity_excluded).
 *   2. truth_verdict=BROKEN excludes the skill (role integrity_excluded).
 *   3. UNVERIFIED structural/truth stays routable ("unknown" is not "broken").
 *   4. comprehension_verdict is informational only — it never gates or boosts routing.
 */

'use strict';

const { routeSkills } = require('../skill-graph-route');

let failures = 0;
function assert(condition, msg) {
  if (condition) {
    process.stdout.write(`  PASS  ${msg}\n`);
  } else {
    process.stderr.write(`  FAIL  ${msg}\n`);
    failures += 1;
  }
}

const TODAY = '2026-05-31';

// A skill that matches the query "widget" on an exact keyword (+3 each), so all
// candidates score equally and ONLY the integrity gate differentiates them.
function widgetSkill(name, health) {
  return {
    id: name,
    name,
    path: `skills/${name}/SKILL.md`,
    type: 'capability',
    deployment_target: 'portable',
    health,
    activation: { keywords: ['widget'], triggers: [], paths: [] },
    relations: {},
  };
}

function route(skills, maxResults = 20) {
  return routeSkills({ skills }, {
    query: 'widget',
    project: null,
    maxResults,
    minEvalState: 'unverified',
    pathArg: null,
    todayISO: TODAY,
  });
}

// ---------------------------------------------------------------------------
// Integrity gate: structural FAIL and truth BROKEN are hard blocks;
// UNVERIFIED structural/truth and any comprehension_verdict stay routable.
// ---------------------------------------------------------------------------
const gateSkills = [
  widgetSkill('comp-unverified', { comprehension_verdict: 'UNVERIFIED' }),
  widgetSkill('comp-pass', { comprehension_verdict: 'PASS' }),
  widgetSkill('comp-shallow', { comprehension_verdict: 'SHALLOW' }),
  widgetSkill('struct-unverified', { structural_verdict: 'UNVERIFIED' }),
  widgetSkill('truth-unverified', { truth_verdict: 'UNVERIFIED' }),
  widgetSkill('struct-fail', { structural_verdict: 'FAIL' }),
  widgetSkill('truth-broken', { truth_verdict: 'BROKEN' }),
];

const r = route(gateSkills);
const selectedNames = new Set(r.selected.map(e => e.skill.name));
const excludedByRole = {};
for (const e of r.excluded) {
  excludedByRole[e.skill.name] = e.role;
}

assert(selectedNames.has('comp-unverified'), 'UNVERIFIED comprehension_verdict stays routable (informational only)');
assert(selectedNames.has('comp-pass'), 'PASS comprehension_verdict stays routable (informational only)');
assert(selectedNames.has('comp-shallow'), 'SHALLOW comprehension_verdict stays routable (does not gate routing)');
assert(selectedNames.has('struct-unverified'), 'UNVERIFIED structural_verdict stays routable (corpus default)');
assert(selectedNames.has('truth-unverified'), 'UNVERIFIED truth_verdict stays routable (corpus default)');
assert(excludedByRole['struct-fail'] === 'integrity_excluded', 'structural_verdict=FAIL is a hard integrity block');
assert(excludedByRole['truth-broken'] === 'integrity_excluded', 'truth_verdict=BROKEN is a hard integrity block');

// An integrity-exclusion reason names the verdict (the router explains WHY).
const structFailEntry = r.excluded.find(e => e.skill.name === 'struct-fail');
assert(structFailEntry && /structural_verdict=FAIL/.test(structFailEntry.reason),
  'integrity-excluded reason names the structural_verdict');
const truthBrokenEntry = r.excluded.find(e => e.skill.name === 'truth-broken');
assert(truthBrokenEntry && /truth_verdict=BROKEN/.test(truthBrokenEntry.reason),
  'integrity-excluded reason names the truth_verdict');

// ---------------------------------------------------------------------------
if (failures > 0) {
  process.stderr.write(`\ntest-router-verdict-gate: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-router-verdict-gate: integrity routing gate gates only on structural FAIL / truth BROKEN\n');
