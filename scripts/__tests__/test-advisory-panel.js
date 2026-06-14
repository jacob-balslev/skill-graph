#!/usr/bin/env node
/**
 * Tests for the Skill Audit Loop advisory tier (model-roster expansion).
 *
 * The certifying CORE of the audit loop is the two-frontier pair (Opus 4.8 ⇄
 * GPT-5.5). The ADVISORY tier (Gemini 3.1 Pro + the free OpenCode Zen models +
 * Gemini Flash) adds breadth: each advisory model runs as the MEASURED generator,
 * graded by a CORE frontier (top-tier) — measurement, not lesser-model judging, so
 * no-lesser-models-for-quality is honored. Advisory verdicts must NEVER change the
 * certifying synthesized_verdict (which comes only from the core reconciliation).
 *
 * Also covers display-name resolution (output shows "Opus 4.8" / "GPT-5.5" /
 * "Gemini 3.1 Pro", never the bare alias).
 *
 * Uses only Node built-ins. Injects deps.runDirection so no live CLI is needed.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { runBidirectionalEval, runAdvisoryPanel } = require('../../lib/audit/run-bidirectional-eval');
const { ADVISORY_MODELS, FRONTIER_PAIR, resolveDisplayName } = require('../../lib/audit-shared/model-provider');

let passed = 0;
function ok(label, cond) {
  if (!cond) throw new Error(`FAIL: ${label}`);
  passed += 1;
  console.log(`  ok ${label}`);
}

// A fake direction runner: core directions certify; advisory directions return a
// mix (minimax REDUNDANT) to prove advisory can disagree without moving the verdict.
function fakeRunDirection({ direction, generatorModel, graderModel }) {
  const advisory = direction.startsWith('advisory:');
  return {
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    generator_family: generatorModel,
    grader_family: graderModel,
    // resolved_model is the GRADER's resolved id (the grader is the certifying judge) — it
    // must share the grader's family, else A7's family-consistency guard correctly caps.
    resolved_model: graderModel,
    verdict: advisory && generatorModel === 'minimax' ? 'REDUNDANT' : 'APPLICABLE',
    certification_tier: 'certifying',
    calibrated: true,
    red_herring_cases_total: 1,
    execution_profile: { tools: true, research: true, repoScope: '.', cwd: '.' },
  };
}

console.log('test-advisory-panel:');

// 1. Core is still the two-frontier pair (unchanged).
ok('FRONTIER_PAIR is the 2 frontier core', Array.isArray(FRONTIER_PAIR) && FRONTIER_PAIR.length === 2);

// 2. Advisory roster = enabled breadth models (Gemini Pro + reliable Zen free + Gemini Flash);
// no core overlap.
// nemotron was dropped from auto-dispatch (SKI-210, unreliable free-tier dispatch) — its
// descriptor stays in the registry but it is no longer in ADVISORY_MODELS.
// big-pickle was dropped from auto-dispatch (2026-06-09, OpenCode Zen 429/free-usage limit
// plus no first token in bounded direct probes) — descriptor stays resolvable for explicit probes.
// minimax was dropped from auto-dispatch (2026-06-10T, text-capture propose produced
// non-document output twice in the live content-monitor panel run) — descriptor stays resolvable.
ok('ADVISORY_MODELS has 4 entries', ADVISORY_MODELS.length === 4);
ok('advisory excludes the core frontier pair', !ADVISORY_MODELS.some((m) => FRONTIER_PAIR.includes(m)));
ok('advisory no longer auto-dispatches nemotron (SKI-210)', !ADVISORY_MODELS.includes('nemotron'));
ok('advisory no longer auto-dispatches big-pickle (rate-limited)', !ADVISORY_MODELS.includes('big-pickle'));
ok('advisory no longer auto-dispatches minimax (no-document delivery)', !ADVISORY_MODELS.includes('minimax'));
for (const m of ['gemini', 'deepseek-flash', 'mimo', 'gemini-flash']) {
  ok(`advisory includes ${m}`, ADVISORY_MODELS.includes(m));
}

// 3. Display names spell out full model names (never the alias).
ok('opus -> Opus 4.8', resolveDisplayName('opus') === 'Opus 4.8');
ok('opus -> Opus 4.8', resolveDisplayName('opus') === 'Opus 4.8');
ok('gpt-5.5 -> GPT-5.5', resolveDisplayName('gpt-5.5') === 'GPT-5.5');
ok('gemini -> Gemini 3.1 Pro', resolveDisplayName('gemini') === 'Gemini 3.1 Pro');
ok('minimax -> MiniMax M3', resolveDisplayName('minimax') === 'MiniMax M3');
ok('big-pickle descriptor display remains available', resolveDisplayName('big-pickle') === 'Big Pickle');

// 4. runAdvisoryPanel: every advisory model measured, graded by a CORE frontier.
const panel = runAdvisoryPanel({ mode: 'application', deps: { runDirection: fakeRunDirection } });
ok('panel runs every advisory model', panel.length === ADVISORY_MODELS.length);
ok('panel grader is a core frontier (top-tier)', panel.every((e) => e.grader === resolveDisplayName(FRONTIER_PAIR[0])));
ok('panel entries carry display names', panel.every((e) => typeof e.display === 'string' && !e.display.includes('-')));
ok('panel tier is advisory', panel.every((e) => e.tier === 'advisory'));
ok('no panel errors with injected runner', !panel.some((e) => e.error));

// 5. Advisory NEVER changes the certifying verdict (the whole point).
const withAdvisory = runBidirectionalEval({ mode: 'application', skill: 'demo', cwd: '.', advisory: true, deps: { runDirection: fakeRunDirection } });
const withoutAdvisory = runBidirectionalEval({ mode: 'application', skill: 'demo', cwd: '.', advisory: false, deps: { runDirection: fakeRunDirection } });
ok('advisory_panel attached when opted in', Array.isArray(withAdvisory.advisory_panel) && withAdvisory.advisory_panel.length === ADVISORY_MODELS.length);
ok('advisory_panel null when not opted in', withoutAdvisory.advisory_panel === null);
ok('synthesized_verdict identical with/without advisory', withAdvisory.synthesized_verdict === withoutAdvisory.synthesized_verdict);
ok('verdict comes from the core (APPLICABLE), not advisory dissent', withAdvisory.synthesized_verdict === 'APPLICABLE');

// 6. Live/default advisory execution fans out to workers instead of running the
// free/advisory models one after another.
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'advisory-panel-test-'));
const startsFile = path.join(tmpDir, 'starts.jsonl');
const workerModule = path.join(tmpDir, 'fake-worker-runner.js');
fs.writeFileSync(workerModule, `
'use strict';
const fs = require('fs');
module.exports.runDirection = function runDirection({ direction, generatorModel, graderModel }) {
  fs.appendFileSync(process.env.ADVISORY_PANEL_TEST_STARTS, JSON.stringify({ model: generatorModel, at: Date.now() }) + '\\n');
  const done = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(done, 0, 0, 1000);
  return {
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    generator_family: generatorModel,
    grader_family: graderModel,
    resolved_model: graderModel,
    verdict: 'APPLICABLE',
    certification_tier: 'certifying',
    calibrated: true,
    red_herring_cases_total: 1,
    execution_profile: { tools: true, research: true, repoScope: '.', cwd: '.' },
  };
};
`);
const oldStarts = process.env.ADVISORY_PANEL_TEST_STARTS;
process.env.ADVISORY_PANEL_TEST_STARTS = startsFile;
try {
  const startedAt = Date.now();
  const workerPanel = runAdvisoryPanel({
    mode: 'application',
    deps: { runDirectionModule: workerModule, workerTimeoutMs: 10000 },
  });
  const elapsedMs = Date.now() - startedAt;
  const starts = fs.readFileSync(startsFile, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const spreadMs = Math.max(...starts.map((s) => s.at)) - Math.min(...starts.map((s) => s.at));
  ok('worker panel runs every advisory model', workerPanel.length === ADVISORY_MODELS.length);
  ok('worker panel returned without errors', !workerPanel.some((e) => e.error));
  ok('worker panel starts every advisory model', starts.length === ADVISORY_MODELS.length);
  ok('worker panel starts advisory models in parallel', spreadMs < 1500);
  ok('worker panel finishes faster than sequential one-second sleeps', elapsedMs < 3000);
} finally {
  if (oldStarts === undefined) delete process.env.ADVISORY_PANEL_TEST_STARTS;
  else process.env.ADVISORY_PANEL_TEST_STARTS = oldStarts;
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

console.log(`test-advisory-panel: ${passed} passed`);
