#!/usr/bin/env node
/**
 * Test: four-verdict Health Block routing gate (Step 5 — Decision A).
 *
 * Receipt for the router contract migration off `eval_state` onto the
 * structural/truth/application verdicts. Asserts the behaviors Decision A
 * specifies (docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md
 * § Decision A; enums per docs/verdict-semantics.md):
 *
 *   1. Proven-dangerous application verdicts (HARMFUL/FALSE_POSITIVE)
 *      are gated OUT of routing; no-lift verdicts stay routable.
 *   2. UNVERIFIED stays routable ("unknown" is not "bad").
 *   3. MIXED stays routable (it is not proven-dangerous).
 *   4. Hard integrity blocks: structural_verdict=FAIL and truth_verdict=BROKEN
 *      exclude a skill; UNVERIFIED structural/truth still routes.
 *   5. APPLICABLE rank-weights (gentle additive boost) so it wins a keyword tie
 *      over an alphabetically-earlier UNVERIFIED skill.
 *   6. A dangerous verdict EXPIRES — by age (> NEGATIVE_VERDICT_EXPIRY_DAYS) or by
 *      the skill changing after the grade (last_changed > eval_last_run.at) — so a
 *      since-fixed skill is not tombstoned.
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

// A skill that matches the query "widget" on an exact keyword (+5 each), so all
// candidates score equally and ONLY the verdict gate/boost differentiates them.
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

const recentReceipt = { at: '2026-05-20' };   // 11 days before TODAY — well inside the 90d window
const staleReceipt = { at: '2026-01-01' };     // 150 days before TODAY — past the 90d expiry window

// ---------------------------------------------------------------------------
// 1–4: gate-out dangerous verdicts, keep UNVERIFIED/MIXED/no-lift, hard integrity blocks.
// ---------------------------------------------------------------------------
const gateSkills = [
  widgetSkill('app-unverified', { application_verdict: 'UNVERIFIED' }),
  widgetSkill('app-mixed', { application_verdict: 'MIXED' }),
  widgetSkill('app-harmful', { application_verdict: 'HARMFUL', eval_last_run: recentReceipt }),
  widgetSkill('app-redundant', { application_verdict: 'REDUNDANT', eval_last_run: recentReceipt }),
  widgetSkill('app-ceiling', { application_verdict: 'NOT_DISCRIMINATED_CEILING', eval_last_run: recentReceipt }),
  widgetSkill('app-equivalent', { application_verdict: 'EQUIVALENT_ON_FRONTIER', eval_last_run: recentReceipt }),
  widgetSkill('app-false-positive', { application_verdict: 'FALSE_POSITIVE', eval_last_run: recentReceipt }),
  widgetSkill('struct-fail', { structural_verdict: 'FAIL', application_verdict: 'UNVERIFIED' }),
  widgetSkill('truth-broken', { truth_verdict: 'BROKEN', application_verdict: 'UNVERIFIED' }),
];

const r = route(gateSkills);
const selectedNames = new Set(r.selected.map(e => e.skill.name));
const excludedByRole = {};
for (const e of r.excluded) {
  excludedByRole[e.skill.name] = e.role;
}

assert(selectedNames.has('app-unverified'), 'UNVERIFIED application_verdict stays routable (selected)');
assert(selectedNames.has('app-mixed'), 'MIXED application_verdict stays routable (not proven-dangerous)');
assert(selectedNames.has('app-redundant'), 'REDUNDANT stays routable as legacy no-lift evidence, not a tombstone');
assert(selectedNames.has('app-ceiling'), 'NOT_DISCRIMINATED_CEILING stays routable (inconclusive baseline saturation)');
assert(selectedNames.has('app-equivalent'), 'EQUIVALENT_ON_FRONTIER stays routable (model/case-set scoped no-lift)');
assert(excludedByRole['app-harmful'] === 'behavior_excluded', 'HARMFUL is gated out (behavior_excluded)');
assert(excludedByRole['app-false-positive'] === 'behavior_excluded', 'FALSE_POSITIVE is gated out (behavior_excluded)');
assert(excludedByRole['struct-fail'] === 'integrity_excluded', 'structural_verdict=FAIL is a hard integrity block');
assert(excludedByRole['truth-broken'] === 'integrity_excluded', 'truth_verdict=BROKEN is a hard integrity block');

// A dangerous-exclusion reason names the verdict (the router explains WHY).
const harmfulEntry = r.excluded.find(e => e.skill.name === 'app-harmful');
assert(harmfulEntry && /application_verdict=HARMFUL/.test(harmfulEntry.reason),
  'behavior-excluded reason names the application_verdict');

// ---------------------------------------------------------------------------
// 5: APPLICABLE rank-weight boost wins a keyword tie over an alphabetically
//    earlier UNVERIFIED skill. With maxResults=1, only the boosted skill is
//    selected — proving the boost overrode the alphabetical tiebreaker.
// ---------------------------------------------------------------------------
const tieSkills = [
  widgetSkill('aaa-unverified', { application_verdict: 'UNVERIFIED' }),
  widgetSkill('zzz-applicable', { application_verdict: 'APPLICABLE' }),
];
const rTie = route(tieSkills, 1);
assert(rTie.selected.length === 1 && rTie.selected[0].skill.name === 'zzz-applicable',
  'APPLICABLE boost wins a keyword tie over an alphabetically-earlier UNVERIFIED skill');
const boostEntry = rTie.selected[0];
assert(boostEntry.reasons.some(x => /APPLICABLE \(\+2 routing boost\)/.test(x)),
  'the +2 routing boost is recorded in the decision reasons');

// Sanity: without the APPLICABLE skill, the UNVERIFIED skill IS selected at max=1
// (proves UNVERIFIED is not penalised into invisibility — it just loses the tie).
const rTieNoBoost = route([widgetSkill('aaa-unverified', { application_verdict: 'UNVERIFIED' })], 1);
assert(rTieNoBoost.selected.length === 1 && rTieNoBoost.selected[0].skill.name === 'aaa-unverified',
  'UNVERIFIED skill routes when it is the only candidate (no popularity-contest penalty)');

// ---------------------------------------------------------------------------
// 6: dangerous-verdict expiry — by age and by post-grade change.
// ---------------------------------------------------------------------------
const expirySkills = [
  // HARMFUL but the grade is 150 days old (> 90d) → expired → routes again.
  widgetSkill('harmful-old', { application_verdict: 'HARMFUL', eval_last_run: staleReceipt }),
  // HARMFUL but the skill changed 5 days AFTER the grade → expired → routes again.
  widgetSkill('harmful-changed', {
    application_verdict: 'HARMFUL',
    eval_last_run: recentReceipt,
    last_changed: '2026-05-25',
  }),
];
const rExp = route(expirySkills);
const expSelected = new Set(rExp.selected.map(e => e.skill.name));
assert(expSelected.has('harmful-old'),
  'a HARMFUL verdict older than the expiry window no longer tombstones (routes again)');
assert(expSelected.has('harmful-changed'),
  'a HARMFUL verdict is expired when the skill changed after the grade (routes again)');

// ---------------------------------------------------------------------------
if (failures > 0) {
  process.stderr.write(`\ntest-router-verdict-gate: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-router-verdict-gate: four-verdict routing gate behaves per Decision A\n');
