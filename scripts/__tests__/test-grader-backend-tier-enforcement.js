#!/usr/bin/env node
/**
 * Tests for grader-backend tier enforcement in runGraderPrompt (SKI-40).
 *
 * A grader is a QUALITY JUDGE: per no-lesser-models-for-quality, every grader
 * backend must run on a top-tier model, never Haiku / Sonnet / Gemini Flash /
 * MiniMax / Nemotron. The `claude` backend already fails closed (SH-6664); this
 * suite pins the extension of that guard to the `gemini` and (defensively) the
 * `opencode` backends: the gemini path used to run with NO model, silently
 * falling back to the Gemini CLI default (the workspace gemini tooling defaults
 * to Flash). The fix resolves the frontier Gemini and asserts top-tier BEFORE
 * shelling out, so a Flash request throws instead of grading quality on a weak
 * model.
 *
 * NO live LLM calls: every assertion exercises the fail-closed throw that fires
 * BEFORE any CLI subprocess is spawned.
 *
 * Uses only Node built-ins.
 */

'use strict';

const os = require('os');
const path = require('path');

// Redirect eval history logs to temp paths BEFORE requiring the runner (they are
// resolved at module load), matching the certification test convention.
process.env.EVAL_HISTORY_LOG = path.join(os.tmpdir(), 'ski40-eval-history.log');
process.env.APPLICATION_HISTORY_LOG = path.join(os.tmpdir(), 'ski40-app-history.log');

const { runGraderPrompt } = require('../../lib/audit/evaluate-skill');

let passed = 0;
let failed = 0;

function expectThrow(name, fn, rePattern) {
  let threw = null;
  try {
    fn();
  } catch (err) {
    threw = err;
  }
  if (!threw) {
    failed += 1;
    console.error(`✗ ${name}\n  expected a throw, got none`);
    return;
  }
  if (rePattern && !rePattern.test(String(threw.message))) {
    failed += 1;
    console.error(`✗ ${name}\n  threw, but message did not match ${rePattern}: ${threw.message}`);
    return;
  }
  passed += 1;
  console.log(`✓ ${name}`);
}

const WS = os.tmpdir();

// 1. gemini grader with a Flash model fails closed BEFORE shelling out (SKI-40).
expectThrow(
  'gemini grader rejects a Flash model (lesser tier) before running the CLI',
  () => runGraderPrompt('judge prompt', { grader: 'gemini', model: 'gemini-flash', workspace: WS }),
  /lesser-tier|may not JUDGE quality/i,
);

// 2. gemini grader rejects an explicit gemini-3-flash-preview id too.
expectThrow(
  'gemini grader rejects gemini-3-flash-preview id',
  () => runGraderPrompt('judge prompt', { grader: 'gemini', model: 'gemini-3-flash-preview', workspace: WS }),
  /lesser-tier|may not JUDGE quality/i,
);

// 3. claude grader still fails closed when no model is supplied (SH-6664 regression).
expectThrow(
  'claude grader rejects a missing model (no silent weak default)',
  () => runGraderPrompt('judge prompt', { grader: 'claude', workspace: WS }),
  /no grader model supplied|strong-tier/i,
);

console.log(`\nTests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
