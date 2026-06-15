'use strict';

// Unit test for recordFullLoop() — the CLI-path composition that makes a /skill-audit-loop
// run record the FULL per-skill loop (Integrity Gate + Behavior Gate verdicts) into the
// sidecar. Pure DI: spawn / fs / writeSidecarFields / todayIsoDate / toSidecarReceipt are
// injected, so no real graders run. Verifies the Completion Rule (every gate run-and-stamped
// or UNVERIFIED-with-finding, never silently skipped) and that recording is keep-gated.

const assert = require('assert');
const { recordFullLoop } = require('../../lib/audit/run-skill-audit-loop');
const { buildModelRunCoverage } = require('../../lib/audit/model-run-coverage');

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
const base = { skill: 'demo', skillDir: '/tmp/skills/demo', cwd: '/tmp/sg', evalMode: 'comprehension' };

// 1. KEEP + guardrail receipt (PASS) → integrity stamped, last_changed set,
//    comprehension_verdict from the reused guardrail receipt, bidirectional receipt persisted.
check('keep: records Integrity + Behavior gates (comprehension verdict from receipt)', () => {
  const d = makeDeps({ existing: ['evals/comprehension.json'] });
  const out = recordFullLoop({
    ...base,
    result: { applied: true, eval: { synthesized_verdict: 'PASS' } },
    deps: d.deps,
  });
  assert.strictEqual(out.recorded.integrity, 'stamped', 'integrity gate ran');
  assert.strictEqual(out.recorded.last_changed, '2026-06-07', 'last_changed stamped');
  assert.strictEqual(out.recorded.comprehension_verdict, 'PASS', 'comprehension verdict from guardrail receipt');
  const w = merged(d.writes);
  assert.ok(w.eval_last_run && w.eval_last_run.bidirectional, 'bidirectional receipt persisted');
  assert.strictEqual(w.comprehension_verdict, 'PASS');
  assert.strictEqual(w.last_changed, '2026-06-07');
  // integrity = skill-audit.js subprocess; comprehension verdict is reused from the guardrail receipt (no separate spawn).
  assert.ok(d.spawns.some((s) => s.includes('skill-audit.js')), 'spawned Integrity Gate');
});

check('model_run_coverage: records mandatory and advisory model participation separately from verdicts', () => {
  const coverage = buildModelRunCoverage({
    at: '2026-06-11T12:00:00.000Z',
    evalMode: 'application',
    result: {
      registry_version: '2026-06-11',
      mandatory_models: ['opus', 'gpt-5.5'],
      advisory_models_requested: ['gemini', 'mimo'],
      advisory_models_alive: ['gemini'],
      advisory_failures: [
        { model: 'mimo', phase: 'propose', failure_reason: 'no-document', error: 'captured non-document output' },
      ],
      degraded_frontier: { enabled: false },
      verify: { status: 'RUN' },
      eval_status: 'RUN',
      eval_certified: true,
      certifying_blocked: [],
      applied: true,
      merge: { mergeLedgerPath: 'runs/demo/merge-ledger.json' },
      eval: { synthesized_verdict: 'PASS' },
    },
  });

  assert.strictEqual(coverage.models.opus.operations.panel.status, 'completed');
  assert.strictEqual(coverage.models['gpt-5.5'].operations.panel.certifying, true);
  assert.strictEqual(coverage.models.gemini.operations.panel.status, 'completed');
  assert.strictEqual(coverage.models.mimo.operations.panel.status, 'failed');
  assert.strictEqual(coverage.models.mimo.operations.panel.failure_reason, 'no-document');
  assert.strictEqual(coverage.models.mimo.operations.panel.phase_status.propose, 'failed');
  assert.strictEqual(coverage.models.opus.operations.panel.receipt, 'runs/demo/merge-ledger.json');
  assert.strictEqual(coverage.models['deepseek-flash'].operations.panel.status, 'skipped');
  assert.strictEqual(coverage.models['deepseek-flash'].operations.panel.phase_status.budget, 'skipped');

  const blocked = buildModelRunCoverage({
    at: '2026-06-11T12:00:00.000Z',
    result: {
      registry_version: '2026-06-11',
      mandatory_models: ['opus', 'gpt-5.5'],
      advisory_models_requested: [],
      advisory_models_alive: [],
      advisory_failures: [],
      degraded_frontier: { enabled: false },
      verify: { status: 'RUN' },
      eval_status: 'RUN',
      eval_certified: false,
      certifying_blocked: ['parity failed'],
      applied: true,
    },
  });
  assert.strictEqual(blocked.models.opus.operations.panel.status, 'degraded');
  assert.strictEqual(blocked.models.opus.operations.panel.regrade_required, true);
});

check('non-certifying panel receipt: PASS is capped to PROVISIONAL, receipt preserved', () => {
  const d = makeDeps({ existing: ['evals/comprehension.json'] });
  const out = recordFullLoop({
    ...base,
    result: {
      applied: true,
      certifying_blocked: ['single-frontier degraded'],
      eval: { synthesized_verdict: 'PASS', certifying_clean: false },
    },
    deps: {
      ...d.deps,
      toSidecarReceipt: (r) => ({
        synthesized_verdict: r.synthesized_verdict,
        certifying_clean: false,
        regrade_required: true,
        directions: [{ role: 'Codex', verdict: 'PASS' }],
      }),
    },
  });
  assert.strictEqual(out.recorded.comprehension_verdict, 'PROVISIONAL');
  const w = merged(d.writes);
  assert.strictEqual(w.comprehension_verdict, 'PROVISIONAL');
  assert.strictEqual(w.eval_last_run.bidirectional.synthesized_verdict, 'PASS');
  assert.ok(out.findings.some((f) => /capped at PROVISIONAL/.test(f)));
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
  assert.strictEqual(out.recorded.comprehension_verdict, 'UNVERIFIED');
  // D1 regression guard: the honest downgrade must be WRITTEN to the sidecar, not merely
  // recorded locally. The bug this catches: a kept (CHANGED) body keeping a stale prior
  // PASS because UNVERIFIED was set on `recorded` but never persisted via writeSidecarFields.
  const w = merged(d.writes);
  assert.strictEqual(w.comprehension_verdict, 'UNVERIFIED', 'comprehension_verdict UNVERIFIED WRITTEN to sidecar on keep+missing-eval');
  assert.ok(w.model_run_coverage && w.model_run_coverage.models.opus, 'model_run_coverage written to sidecar');
  assert.ok(out.findings.some((f) => /comprehension\.json/.test(f)), 'finding names missing comprehension.json');
  // no behavior gate spawned (no comprehension.json), no application stamp
  assert.ok(!d.spawns.some((s) => s.includes('evaluate-skill.js')), 'no canonical evaluate spawned');
});

// 3. REVERT (applied:false) → only the Integrity Gate runs; behavior verdicts NOT re-stamped.
check('revert: integrity only; no behavior re-stamp; explicit revert finding', () => {
  const d = makeDeps({ existing: ['evals/comprehension.json'] });
  const out = recordFullLoop({
    ...base,
    result: { applied: false, eval: { synthesized_verdict: 'PASS' } },
    deps: d.deps,
  });
  assert.strictEqual(out.recorded.integrity, 'stamped');
  assert.strictEqual(out.recorded.comprehension_verdict, undefined, 'no behavior stamping on revert');
  assert.strictEqual(out.recorded.last_changed, undefined, 'no last_changed on revert');
  assert.ok(out.findings.some((f) => /Reverted/i.test(f)), 'revert finding present');
  assert.ok(merged(d.writes).last_changed === undefined, 'no sidecar last_changed write on revert');
});

console.log(`\nResults: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
