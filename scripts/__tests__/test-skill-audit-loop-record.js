'use strict';

// Unit test for recordFullLoop() — the CLI-path composition that makes a /skill-audit-loop
// run record the FULL per-skill loop (Integrity Gate + Behavior Gate verdicts) into the
// sidecar. Pure DI: spawn / fs / writeSidecarFields / todayIsoDate / toSidecarReceipt are
// injected, so no real graders run. Verifies the Completion Rule (every gate run-and-stamped
// or UNVERIFIED-with-finding, never silently skipped) and that recording is keep-gated.

const assert = require('assert');
const { recordFullLoop } = require('../../lib/audit/run-skill-audit-loop');

let pass = 0;
let fail = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); pass += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); fail += 1; }
}

// Build injectable deps that capture sidecar writes + spawn calls.
function makeDeps({ existing = [] } = {}) {
  const writes = [];
  const spawns = [];
  return {
    writes,
    spawns,
    deps: {
      spawn: (_node, argv) => { spawns.push(argv.join(' ')); return { status: 0, stdout: '', stderr: '' }; },
      fs: { existsSync: (p) => existing.some((e) => p.endsWith(e)) },
      writeSidecarFields: (_md, fields) => { writes.push(fields); },
      todayIsoDate: () => '2026-06-07',
      toSidecarReceipt: (r) => ({ synthesized_verdict: r.synthesized_verdict, parity_ok: true, directions: [] }),
    },
  };
}
const merged = (writes) => Object.assign({}, ...writes);
const base = { skill: 'demo', skillDir: '/tmp/skills/demo', cwd: '/tmp/sg', evalMode: 'application' };

// 1. KEEP + guardrail receipt (APPLICABLE) + comprehension.json present →
//    integrity stamped, last_changed set, application_verdict from receipt, bidirectional
//    receipt persisted, comprehension graded via canonical evaluate (spawn).
check('keep: records Integrity + Behavior gates (receipt verdict + canonical comprehension)', () => {
  const d = makeDeps({ existing: ['evals/comprehension.json'] });
  const out = recordFullLoop({
    ...base,
    result: { applied: true, eval: { synthesized_verdict: 'APPLICABLE' } },
    deps: d.deps,
  });
  assert.strictEqual(out.recorded.integrity, 'stamped', 'integrity gate ran');
  assert.strictEqual(out.recorded.last_changed, '2026-06-07', 'last_changed stamped');
  assert.strictEqual(out.recorded.application_verdict, 'APPLICABLE', 'application verdict from receipt');
  assert.strictEqual(out.recorded.comprehension_verdict, 'stamped', 'comprehension graded via canonical evaluate');
  const w = merged(d.writes);
  assert.ok(w.eval_last_run && w.eval_last_run.bidirectional, 'bidirectional receipt persisted');
  assert.strictEqual(w.application_verdict, 'APPLICABLE');
  assert.strictEqual(w.last_changed, '2026-06-07');
  // integrity = skill-audit.js subprocess; comprehension = evaluate-skill.js subprocess
  assert.ok(d.spawns.some((s) => s.includes('skill-audit.js')), 'spawned Integrity Gate');
  assert.ok(d.spawns.some((s) => s.includes('evaluate-skill.js') && s.includes('comprehension')), 'spawned comprehension evaluate');
});

// 2. KEEP + NO guardrail receipt + NO eval artifacts → behavior verdicts UNVERIFIED, each
//    with an explicit finding (never a silent skip). Integrity still runs.
check('keep, missing evals: behavior verdicts UNVERIFIED with explicit findings', () => {
  const d = makeDeps({ existing: [] });
  const out = recordFullLoop({
    ...base,
    result: { applied: true, eval: null },
    deps: d.deps,
  });
  assert.strictEqual(out.recorded.integrity, 'stamped');
  assert.strictEqual(out.recorded.application_verdict, 'UNVERIFIED');
  assert.strictEqual(out.recorded.comprehension_verdict, 'UNVERIFIED');
  // D1 regression guard: the honest downgrade must be WRITTEN to the sidecar, not merely
  // recorded locally. The bug this catches: a kept (CHANGED) body keeping a stale prior
  // APPLICABLE because UNVERIFIED was set on `recorded` but never persisted via writeSidecarFields.
  const w = merged(d.writes);
  assert.strictEqual(w.application_verdict, 'UNVERIFIED', 'application_verdict UNVERIFIED WRITTEN to sidecar on keep+missing-eval');
  assert.strictEqual(w.comprehension_verdict, 'UNVERIFIED', 'comprehension_verdict UNVERIFIED WRITTEN to sidecar on keep+missing-eval');
  assert.ok(out.findings.some((f) => /application\.json/.test(f)), 'finding names missing application.json');
  assert.ok(out.findings.some((f) => /comprehension\.json/.test(f)), 'finding names missing comprehension.json');
  // no behavior gate spawned (no comprehension.json), no application stamp
  assert.ok(!d.spawns.some((s) => s.includes('evaluate-skill.js')), 'no canonical evaluate spawned');
});

// 3. REVERT (applied:false) → only the Integrity Gate runs; behavior verdicts NOT re-stamped.
check('revert: integrity only; no behavior re-stamp; explicit revert finding', () => {
  const d = makeDeps({ existing: ['evals/application.json', 'evals/comprehension.json'] });
  const out = recordFullLoop({
    ...base,
    result: { applied: false, eval: { synthesized_verdict: 'APPLICABLE' } },
    deps: d.deps,
  });
  assert.strictEqual(out.recorded.integrity, 'stamped');
  assert.strictEqual(out.recorded.application_verdict, undefined, 'no behavior stamping on revert');
  assert.strictEqual(out.recorded.last_changed, undefined, 'no last_changed on revert');
  assert.ok(out.findings.some((f) => /Reverted/i.test(f)), 'revert finding present');
  assert.ok(merged(d.writes).last_changed === undefined, 'no sidecar last_changed write on revert');
});

console.log(`\nResults: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
