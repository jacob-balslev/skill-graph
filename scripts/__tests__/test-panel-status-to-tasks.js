'use strict';

// Unit test: heartbeat → native Task-panel tree (scripts/panel-status-to-tasks.js). Asserts the
// documented shape (SKILL_AUDIT_LOOP.md § Surface ordering): ONE header task whose activeForm is
// the live rollup, four per-phase tasks (propose/cross-review/revise/curate) whose subjects encode
// per-model glyphs ([Q] on mandatory/quality, ✓/⟳/✗/· state glyphs), and phase ordering derived
// from the run phase (before=completed, at=in_progress, after=pending). Pure transform.

const assert = require('assert');
const { buildTaskTree, treeSignature, agentGlyph, currentPhaseIndex, phaseState } = require('../panel-status-to-tasks');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`  PASS    ${name}`); }

const AGENTS = [
  { model: 'opus', tier: 'mandatory', phase: 'cross-review', state: 'reviewing' },
  { model: 'gpt-5.5', tier: 'quality', phase: 'cross-review', state: 'reviewing' },
  { model: 'minimax', tier: 'advisory', phase: 'cross-review', state: 'reviewed' },
  { model: 'nemotron', tier: 'advisory', phase: 'cross-review', state: 'queued' },
];

console.log('1. header rollup');
check('header is one in_progress task whose activeForm carries skill/phase/N-M/tier counts', () => {
  const t = buildTaskTree({ skill: 'debugging', phase: 'cross-review', done: 1, total: 4, agents: AGENTS });
  assert.strictEqual(t.header.subject, 'Skill Audit Loop');
  assert.strictEqual(t.header.state, 'in_progress');
  assert.match(t.header.activeForm, /^⟳ Skill Audit Loop · debugging · cross-review · 1\/4 done · 2 QUALITY\/2 advisory$/);
});
check('a failed count surfaces in the header activeForm', () => {
  const t = buildTaskTree({ skill: 's', phase: 'propose', done: 0, total: 4, failed: 1, agents: AGENTS });
  assert.match(t.header.activeForm, / · 1 failed · /);
});
check('complete flips the header glyph to ✓ and state to completed', () => {
  const t = buildTaskTree({ skill: 's', phase: 'curate', done: 4, total: 4, complete: true, agents: AGENTS });
  assert.strictEqual(t.header.state, 'completed');
  assert.match(t.header.activeForm, /^✓ Skill Audit Loop · s · complete · 4\/4 done/);
});

console.log('2. four per-phase tasks, ordered states');
check('emits exactly the four canonical phases in order', () => {
  const t = buildTaskTree({ phase: 'propose', agents: AGENTS });
  assert.deepStrictEqual(t.phases.map((p) => p.key), ['propose', 'cross-review', 'revise', 'curate']);
});
check('phases before the current run phase are completed; at = in_progress; after = pending', () => {
  const t = buildTaskTree({ phase: 'cross-review', agents: AGENTS });
  const byKey = Object.fromEntries(t.phases.map((p) => [p.key, p.state]));
  assert.strictEqual(byKey.propose, 'completed');
  assert.strictEqual(byKey['cross-review'], 'in_progress');
  assert.strictEqual(byKey.revise, 'pending');
  assert.strictEqual(byKey.curate, 'pending');
});

console.log('3. per-model glyph + [Q] encoding in subjects');
check('the active phase shows live per-model glyphs; [Q] tags mandatory/quality only', () => {
  const t = buildTaskTree({ phase: 'cross-review', agents: AGENTS });
  const cr = t.phases.find((p) => p.key === 'cross-review').subject;
  // opus + gpt are reviewing (⟳) and quality-tagged; minimax reviewed (✓) advisory no tag; nemotron queued (·)
  assert.ok(/⟳.*\[Q\]/.test(cr), 'an active quality model shows ⟳ + [Q]');
  assert.ok(cr.includes('[Q]'), 'quality models carry [Q]');
  assert.ok(/✓[^\[]*MiniMax[^\[]*( |$)/.test(cr) || /✓.*MiniMax/.test(cr), 'a done advisory model shows ✓ and no [Q]');
  assert.ok(/·[^✓⟳]*Nemotron/.test(cr), 'a queued model shows ·');
  // advisory tokens must NOT carry [Q]
  assert.ok(!/MiniMax[^ ]*\[Q\]/.test(cr) && !/Nemotron[^ ]*\[Q\]/.test(cr), 'advisory models never carry [Q]');
});
check('a future phase shows all models as · (not started)', () => {
  const t = buildTaskTree({ phase: 'propose', agents: AGENTS });
  const curate = t.phases.find((p) => p.key === 'curate').subject;
  assert.ok(curate.startsWith('curate · '));
  assert.ok(!curate.includes('✓') && !curate.includes('⟳'), 'a not-started phase has no done/active glyphs');
});
check('a completed phase shows ✓ for survivors and keeps a failed model ✗', () => {
  const agents = [
    { model: 'opus', tier: 'mandatory', phase: 'curate', state: 'curating' },
    { model: 'gemini', tier: 'advisory', phase: 'propose', state: 'failed' },
  ];
  const t = buildTaskTree({ phase: 'curate', agents });
  const propose = t.phases.find((p) => p.key === 'propose').subject;
  assert.ok(/✓.*Opus/.test(propose), 'a survivor shows ✓ in a completed phase');
  assert.ok(/✗.*Gemini/.test(propose), 'a failed agent stays ✗ in a completed phase');
});

console.log('4. helpers + signature');
check('agentGlyph maps the lifecycle vocabulary', () => {
  assert.strictEqual(agentGlyph('done'), '✓');
  assert.strictEqual(agentGlyph('reviewing'), '⟳');
  assert.strictEqual(agentGlyph('failed'), '✗');
  assert.strictEqual(agentGlyph('skipped'), '–');
  assert.strictEqual(agentGlyph('queued'), '·');
  assert.strictEqual(agentGlyph('whatever'), '·');
});
check('currentPhaseIndex maps free-text run phases; complete = all done', () => {
  assert.strictEqual(currentPhaseIndex('propose (advisory)', false), 0);
  assert.strictEqual(currentPhaseIndex('review', false), 1);
  assert.strictEqual(currentPhaseIndex('revise', false), 2);
  assert.strictEqual(currentPhaseIndex('curate', false), 3);
  assert.strictEqual(currentPhaseIndex('anything', true), 4);
});
check('phaseState ordering predicate', () => {
  assert.strictEqual(phaseState(0, 1, false), 'completed');
  assert.strictEqual(phaseState(1, 1, false), 'in_progress');
  assert.strictEqual(phaseState(2, 1, false), 'pending');
  assert.strictEqual(phaseState(2, 1, true), 'completed');
});
check('treeSignature is stable across calls and excludes the live timer', () => {
  const a = buildTaskTree({ skill: 's', phase: 'propose', done: 1, total: 4, agents: AGENTS, elapsed_s: 10 });
  const b = buildTaskTree({ skill: 's', phase: 'propose', done: 1, total: 4, agents: AGENTS, elapsed_s: 99 });
  assert.strictEqual(treeSignature(a), treeSignature(b), 'elapsed-only change does not change the signature');
  const c = buildTaskTree({ skill: 's', phase: 'revise', done: 1, total: 4, agents: AGENTS });
  assert.notStrictEqual(treeSignature(a), treeSignature(c), 'a phase change changes the signature');
});

console.log(`\n${passed} passed`);
