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
    resolved_model: generatorModel,
    verdict: advisory && generatorModel === 'minimax' ? 'REDUNDANT' : 'APPLICABLE',
    execution_profile: { tools: true, research: true, repoScope: '.', cwd: '.' },
  };
}

console.log('test-advisory-panel:');

// 1. Core is still the two-frontier pair (unchanged).
ok('FRONTIER_PAIR is the 2 frontier core', Array.isArray(FRONTIER_PAIR) && FRONTIER_PAIR.length === 2);

// 2. Advisory roster = everything else (Gemini Pro + Zen free + Gemini Flash); no core overlap.
ok('ADVISORY_MODELS has 7 entries', ADVISORY_MODELS.length === 7);
ok('advisory excludes the core frontier pair', !ADVISORY_MODELS.some((m) => FRONTIER_PAIR.includes(m)));
for (const m of ['gemini', 'minimax', 'nemotron', 'big-pickle', 'deepseek-flash', 'mimo', 'gemini-flash']) {
  ok(`advisory includes ${m}`, ADVISORY_MODELS.includes(m));
}

// 3. Display names spell out full model names (never the alias).
ok('opus -> Opus 4.8', resolveDisplayName('opus') === 'Opus 4.8');
ok('strongest-reasoning-grader -> Opus 4.8', resolveDisplayName('strongest-reasoning-grader') === 'Opus 4.8');
ok('codex-current -> GPT-5.5', resolveDisplayName('codex-current') === 'GPT-5.5');
ok('gemini -> Gemini 3.1 Pro', resolveDisplayName('gemini') === 'Gemini 3.1 Pro');
ok('minimax -> MiniMax M3', resolveDisplayName('minimax') === 'MiniMax M3');

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
ok('advisory_panel attached when opted in', Array.isArray(withAdvisory.advisory_panel) && withAdvisory.advisory_panel.length === 7);
ok('advisory_panel null when not opted in', withoutAdvisory.advisory_panel === null);
ok('synthesized_verdict identical with/without advisory', withAdvisory.synthesized_verdict === withoutAdvisory.synthesized_verdict);
ok('verdict comes from the core (APPLICABLE), not advisory dissent', withAdvisory.synthesized_verdict === 'APPLICABLE');

console.log(`test-advisory-panel: ${passed} passed`);
