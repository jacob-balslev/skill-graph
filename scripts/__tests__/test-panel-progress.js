'use strict';

// Unit tests for lib/audit/panel-progress.js — the panel-enrich visibility layer
// (heartbeat status.json contract + pinned-header TUI gating). Pure Node, no LLM.

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createProgressReporter, renderCollected, fmtElapsed } = require('../../lib/audit/panel-progress');

let passed = 0;
let failed = 0;
function ok(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); passed += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); failed += 1; }
}

// A fake stream that captures writes and reports as a non-TTY by default.
function fakeStream({ isTTY = false } = {}) {
  const chunks = [];
  return { isTTY, rows: 40, cols: 100, write: (s) => { chunks.push(String(s)); return true; }, _chunks: chunks, text: () => chunks.join('') };
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panel-progress-'));
const statusPath = (n) => path.join(tmp, `${n}.json`);
const readStatus = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── 1. heartbeat shape (the watch-audit-batch.sh contract) ──
console.log('1. heartbeat shape');
ok('writes the documented status.json keys (superset of comprehension-ab-driver)', () => {
  const sf = statusPath('shape');
  const out = fakeStream();
  let clock = 1000;
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: ['minimax'],
    statusFile: sf, tty: false, now: () => clock, out,
  });
  r.heartbeat();
  const st = readStatus(sf);
  for (const k of ['ts', 'pid', 'total', 'done', 'failed', 'running', 'complete', 'agents']) {
    assert.ok(Object.prototype.hasOwnProperty.call(st, k), `missing key ${k}`);
  }
  assert.strictEqual(st.total, 3, 'total = mandatory + advisory');
  assert.strictEqual(st.done, 0);
  assert.strictEqual(st.complete, false);
  assert.ok(Array.isArray(st.running) && st.running.length === 0);
  assert.strictEqual(st.agents.length, 3);
  assert.deepStrictEqual(st.agents.map((a) => a.tier), ['mandatory', 'mandatory', 'advisory']);
});

// ── 2. progress-event state transitions ──
console.log('2. progress-event state transitions');
ok('propose start → running; propose done → done count increments', () => {
  const sf = statusPath('transitions');
  const out = fakeStream();
  let clock = 0;
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: [],
    statusFile: sf, tty: false, now: () => clock, out,
  });
  clock = 5000;
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  let st = readStatus(sf);
  assert.strictEqual(st.running.length, 1, 'one agent running after start');
  assert.strictEqual(st.running[0].cell, 'opus:propose');
  assert.strictEqual(st.done, 0);
  clock = 9000;
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'done' });
  st = readStatus(sf);
  assert.strictEqual(st.running.length, 0, 'no agent running after done');
  assert.strictEqual(st.done, 1, 'done incremented');
  assert.strictEqual(st.agents.find((a) => a.model === 'opus').state, 'proposed');
});

ok('agent fail → failed count; skip → skipped state, not counted done/failed', () => {
  const sf = statusPath('failskip');
  const r = createProgressReporter({
    skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: ['minimax'],
    statusFile: sf, tty: false, out: fakeStream(),
  });
  r.onProgress({ kind: 'agent', model: 'codex-current', tier: 'mandatory', phase: 'propose', state: 'fail' });
  r.onProgress({ kind: 'agent', model: 'minimax', tier: 'advisory', phase: 'propose', state: 'skip' });
  const st = readStatus(sf);
  assert.strictEqual(st.failed, 1, 'one failed');
  assert.strictEqual(st.done, 0, 'skip is not done');
  assert.strictEqual(st.agents.find((a) => a.model === 'minimax').state, 'skipped');
});

ok('phase event updates the phase label', () => {
  const sf = statusPath('phase');
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: [], statusFile: sf, tty: false, out: fakeStream() });
  r.onProgress({ kind: 'phase', phase: 'curate (synthesis)' });
  assert.strictEqual(readStatus(sf).phase, 'curate (synthesis)');
});

// ── 3. TTY gating ──
console.log('3. TTY gating');
ok('NOT a TTY → no ANSI escapes written, heartbeat still written', () => {
  const sf = statusPath('notty');
  const out = fakeStream({ isTTY: false });
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: [], statusFile: sf, tty: false, out });
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  r.teardown();
  assert.strictEqual(out.text(), '', 'no terminal writes when not a TTY');
  assert.ok(fs.existsSync(sf), 'heartbeat still written when not a TTY');
  assert.strictEqual(readStatus(sf).complete, true, 'teardown marks complete');
});

ok('TTY → writes ANSI scroll-region + header escapes', () => {
  const out = fakeStream({ isTTY: true });
  const r = createProgressReporter({ skill: 's', mandatoryModels: ['opus', 'codex-current'], advisoryModels: ['minimax'], statusFile: statusPath('tty'), tty: true, out });
  r.onProgress({ kind: 'agent', model: 'opus', tier: 'mandatory', phase: 'propose', state: 'start' });
  const text = out.text();
  assert.ok(text.includes('\x1b['), 'emits ANSI escapes on a TTY');
  assert.ok(text.includes('opus'), 'renders the agent row');
  assert.ok(text.includes('MANDATORY'), 'renders the tier tag');
  r.teardown();
  assert.ok(out.text().includes('\x1b[r'), 'teardown resets the scroll region');
});

// ── 3b. renderCollected — the canonical collected view ──
console.log('3b. renderCollected (canonical collected view)');
ok('renders a summary header + one tree row per agent', () => {
  const status = {
    skill: 'schema-evolution', phase: 'cross-review r1/2', elapsed_s: 125,
    done: 1, total: 3, failed: 0,
    agents: [
      { model: 'opus', tier: 'mandatory', phase: 'review', state: 'reviewing', elapsed_s: 40 },
      { model: 'codex-current', tier: 'mandatory', phase: 'propose', state: 'proposed', elapsed_s: 0 },
      { model: 'minimax', tier: 'advisory', phase: 'propose', state: 'queued', elapsed_s: 0 },
    ],
  };
  const lines = renderCollected(status);
  assert.strictEqual(lines.length, 5, '2 summary lines + 3 agent rows');
  assert.ok(lines[0].includes('schema-evolution') && lines[0].includes('1/3 done') && lines[0].includes('cross-review r1/2'));
  assert.ok(lines[1].includes('2 MANDATORY') && lines[1].includes('1 advisory'));
  assert.ok(lines[2].includes('opus') && lines[2].includes('MANDATORY') && lines[2].includes('reviewing'));
  assert.ok(lines[2].startsWith('├') && lines[4].startsWith('└'), 'tree branches');
  assert.ok(lines[4].includes('minimax') && lines[4].includes('advisory'));
});
ok('marks DONE in the header when complete', () => {
  const lines = renderCollected({ skill: 's', phase: 'apply (keep)', done: 2, total: 2, complete: true, agents: [] });
  assert.ok(lines[0].includes('DONE'));
});
ok('tolerates a missing/empty status object', () => {
  const lines = renderCollected(null);
  assert.ok(Array.isArray(lines) && lines.length === 2, 'header lines even with no agents');
});

// ── 4. helper ──
console.log('4. helpers');
ok('fmtElapsed formats seconds and minutes', () => {
  assert.strictEqual(fmtElapsed(5000), '5s');
  assert.strictEqual(fmtElapsed(65000), '1m 5s');
  assert.strictEqual(fmtElapsed(120000), '2m');
});

try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (_) {}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
