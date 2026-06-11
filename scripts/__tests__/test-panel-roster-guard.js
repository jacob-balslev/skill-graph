'use strict';

// Verifies assertPanelRoster (lib/audit-shared/model-provider.js) fails closed on
// Haiku anywhere in the Skill Audit Loop — mandatory participant, advisory participant,
// or dispatch wrapper — while the default frontier+advisory roster passes.
// User directive 2026-06-11: "haiku should NOT be allowed in Skill Audit Loop".

const assert = require('assert');
const {
  assertPanelRoster, FRONTIER_PAIR, ADVISORY_MODELS, PANEL_BANNED_MODELS, PANEL_BANNED_WRAPPERS,
} = require('../../lib/audit-shared/model-provider');

let pass = 0;
const ok = (label, fn) => { fn(); console.log(`  PASS  ${label}`); pass += 1; };
const throws = (label, fn) => ok(label, () => assert.throws(fn, /assertPanelRoster/));

// Default production roster passes (note: ADVISORY_MODELS legitimately includes gemini-flash).
ok('default frontier mandatory + advisory roster passes', () => {
  assertPanelRoster({ mandatory: FRONTIER_PAIR, advisory: ADVISORY_MODELS });
});
ok('sonnet wrapper passes', () => {
  assertPanelRoster({ mandatory: FRONTIER_PAIR, wrapper: 'sonnet' });
});

// Haiku is banned in every position.
throws('haiku as a mandatory participant throws', () => assertPanelRoster({ mandatory: ['opus', 'haiku'] }));
throws('haiku as an advisory participant throws', () => assertPanelRoster({ mandatory: FRONTIER_PAIR, advisory: ['gemini', 'haiku'] }));
throws('haiku as the dispatch wrapper throws', () => assertPanelRoster({ mandatory: FRONTIER_PAIR, wrapper: 'haiku' }));

// A non-frontier mandatory (even a strong one like sonnet) is rejected — mandatory must be frontier.
throws('sonnet as a mandatory participant throws (not a frontier)', () => assertPanelRoster({ mandatory: ['opus', 'sonnet'] }));

// gemini-flash is allowed as advisory but banned as a wrapper.
ok('gemini-flash allowed as advisory', () => assertPanelRoster({ mandatory: FRONTIER_PAIR, advisory: ['gemini-flash'] }));
throws('gemini-flash as the dispatch wrapper throws', () => assertPanelRoster({ mandatory: FRONTIER_PAIR, wrapper: 'gemini-flash' }));

// Invariant guards on the exported sets.
ok('PANEL_BANNED_MODELS contains haiku, not gemini-flash', () => {
  assert.ok(PANEL_BANNED_MODELS.has('haiku'));
  assert.ok(!PANEL_BANNED_MODELS.has('gemini-flash'));
});
ok('PANEL_BANNED_WRAPPERS contains haiku and gemini-flash', () => {
  assert.ok(PANEL_BANNED_WRAPPERS.has('haiku'));
  assert.ok(PANEL_BANNED_WRAPPERS.has('gemini-flash'));
});

console.log(`\ntest-panel-roster-guard: ${pass} passed, 0 failed`);
