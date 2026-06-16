'use strict';

// Unit tests for tui/lib/breadcrumb.js: pure navigation stack state with
// back/forward history and per-segment focus cursor restoration.

const assert = require('assert');
const { createBreadcrumb } = require('../../tui/lib/breadcrumb');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. breadcrumb push/pop/current/segments');

check('push builds an ordered segment stack', () => {
  const nav = createBreadcrumb();
  nav.push({ id: 'sessions', label: 'Sessions', focusCursor: { row: 0 } });
  nav.push({ id: 'runs', label: 'Runs' }, { row: 3 });
  nav.push({ id: 'findings', label: 'Findings', focusCursor: { findingId: 'f1' } }, { row: 8 });

  assert.deepStrictEqual(nav.segments().map((s) => s.id), ['sessions', 'runs', 'findings']);
  assert.strictEqual(nav.current().id, 'findings');
  assert.deepStrictEqual(nav.segments()[0].focusCursor, { row: 3 });
  assert.deepStrictEqual(nav.segments()[1].focusCursor, { row: 8 });
});

check('pop removes the current segment and restores the parent', () => {
  const nav = createBreadcrumb(['sessions']);
  nav.push('runs');
  nav.push('review');
  const current = nav.pop({ findingId: 'f2' });
  assert.strictEqual(current.id, 'runs');
  assert.deepStrictEqual(nav.segments().map((s) => s.id), ['sessions', 'runs']);
});

console.log('2. breadcrumb back/forward and focus restore');

check('back and forward restore saved focus cursors', () => {
  const nav = createBreadcrumb();
  nav.push({ id: 'sessions', focusCursor: { row: 0 } });
  nav.push({ id: 'runs', focusCursor: { row: 1 } }, { row: 4 });
  nav.push({ id: 'review', focusCursor: { findingId: 'f1' } }, { row: 7 });

  assert.strictEqual(nav.back({ findingId: 'f3' }).id, 'runs');
  assert.deepStrictEqual(nav.current().focusCursor, { row: 7 });
  assert.strictEqual(nav.back({ row: 9 }).id, 'sessions');
  assert.deepStrictEqual(nav.current().focusCursor, { row: 4 });

  assert.strictEqual(nav.forward({ row: 10 }).id, 'runs');
  assert.deepStrictEqual(nav.current().focusCursor, { row: 9 });
  assert.strictEqual(nav.forward({ row: 11 }).id, 'review');
  assert.deepStrictEqual(nav.current().focusCursor, { findingId: 'f3' });
});

check('jumpTo records back history and clears forward history', () => {
  const nav = createBreadcrumb(['sessions', 'runs', 'review']);
  assert.strictEqual(nav.current().id, 'review');
  assert.strictEqual(nav.jumpTo(0, { findingId: 'f9' }).id, 'sessions');
  assert.strictEqual(nav.back({ row: 2 }).id, 'review');
  assert.deepStrictEqual(nav.current().focusCursor, { findingId: 'f9' });

  nav.jumpTo(0, { findingId: 'f10' });
  nav.push('alt-run', { row: 5 });
  assert.strictEqual(nav.current().id, 'alt-run');
  assert.strictEqual(nav.forward({ row: 6 }).id, 'alt-run');
  assert.deepStrictEqual(nav.segments().map((s) => s.id), ['sessions', 'alt-run']);
});

check('segments/current return clones, not mutable internals', () => {
  const nav = createBreadcrumb([{ id: 'sessions', focusCursor: { row: 1 } }]);
  const current = nav.current();
  current.focusCursor.row = 99;
  const segments = nav.segments();
  segments[0].id = 'mutated';

  assert.strictEqual(nav.current().id, 'sessions');
  assert.deepStrictEqual(nav.current().focusCursor, { row: 1 });
});

check('jumpTo rejects invalid indexes', () => {
  const nav = createBreadcrumb(['sessions']);
  assert.throws(() => nav.jumpTo(2), /out of range/);
  assert.throws(() => nav.jumpTo(-1), /out of range/);
});

console.log(`\n${passed} passed`);
