'use strict';

// Unit tests for the multi-agent PANEL enrich orchestrator (run-panel-enrich.js).
// Pure DI — no real dispatch, no fs. Mirrors test-bidirectional-enrich.js patterns.

const assert = require('assert');
const panel = require('../../lib/audit/run-panel-enrich');

let passed = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); passed += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); throw e; }
}

// ── 1. validateMandatoryCoverage ──
console.log('1. validateMandatoryCoverage');

check('both mandatory models surfaced => ok', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'codex-current', disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'codex-current', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'codex-current']);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.covered.sort(), ['codex-current', 'opus']);
});

check('a mandatory model absent from the ledger => violation (silent frontier loss)', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'codex-current', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'codex-current']);
  assert.strictEqual(r.ok, false);
  assert.match(r.violations[0].reason, /codex-current.*silently lost/);
});

check('surfaced via corroborated_by also counts as covered', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', corroborated_by: ['codex-current'], disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'codex-current', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'codex-current']);
  assert.strictEqual(r.ok, true);
});

check('a dropped-with-reason contribution still counts as covered (presence, not disposition)', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'codex-current', disposition: 'dropped', drop_reason: 'redundant' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'codex-current', alive: true }];
  assert.strictEqual(panel.validateMandatoryCoverage(ledger, props, ['opus', 'codex-current']).ok, true);
});

// ── 2. runConvergence ──
console.log('2. runConvergence');

function mkProps(list) {
  // list: [{model, tier, hash}]
  return list.map((x) => ({ model: x.model, tier: x.tier, proposalPath: `p-${x.model}.md`, noveltyMemoPath: null, round: 0, contentHash: x.hash, alive: true, error: null, artifactsDir: `runs/${x.model}` }));
}

check('converges (stable) when no agent changes in a round', () => {
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'codex-current', tier: 'mandatory', hash: 'b' }]);
  const deps = {
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    // revise returns same hash => no change => stable at round 1
    reviseProposal: ({ reviserModel }) => ({ ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: reviserModel === 'opus' ? 'a' : 'b', changed: false }),
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: panel.DEFAULT_CONVERGENCE });
  assert.strictEqual(r.converged, true);
  assert.strictEqual(r.reason, 'stable');
  assert.strictEqual(r.rounds, 1);
});

check('hits round-budget when agents keep changing every round', () => {
  let n = 0;
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a0' }, { model: 'codex-current', tier: 'mandatory', hash: 'b0' }]);
  const deps = {
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => { n += 1; return { ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: `${reviserModel}-${n}`, changed: true }; },
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.converged, false);
  assert.strictEqual(r.reason, 'round-budget');
  assert.strictEqual(r.rounds, 3);
});

check('HASH-AUTHORITATIVE: agent claims changed:false but emits a different hash => counted as changed', () => {
  let round = 0;
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'codex-current', tier: 'mandatory', hash: 'b' }]);
  const deps = {
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => {
      // opus lies (changed:false) but the hash differs the first round, then stabilizes
      round += 1;
      if (reviserModel === 'opus' && round <= 2) return { ok: true, proposalPath: 'p-opus.md', contentHash: 'a2', changed: false };
      return { ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: reviserModel === 'opus' ? 'a2' : 'b', changed: false };
    },
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  // round 1: opus hash a->a2 (changed despite changed:false), codex b->b (stable) => not all stable
  // round 2: opus a2->a2 (stable), codex stable => converged
  assert.strictEqual(r.converged, true);
  assert.strictEqual(r.rounds, 2);
});

check('quorum-collapsed when a mandatory model dies below quorum mid-rounds', () => {
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'codex-current', tier: 'mandatory', hash: 'b' }]);
  const deps = {
    crossReview: ({ reviewerModel }) => (reviewerModel === 'codex-current' ? { ok: false, error: 'dead' } : { ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => ({ ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: `${reviserModel}-x`, changed: true }),
    hashProposal: (p) => p,
  };
  // round 1: codex dies in cross-review -> alive mandatory = 1; round 2 quorum guard fires
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.reason, 'quorum-collapsed');
});

check('advisory death is best-effort: does not collapse quorum, run continues', () => {
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'codex-current', tier: 'mandatory', hash: 'b' }, { model: 'minimax', tier: 'advisory', hash: 'c' }]);
  const deps = {
    crossReview: ({ reviewerModel }) => (reviewerModel === 'minimax' ? { ok: false, error: 'dead advisory' } : { ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => ({ ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: reviserModel === 'opus' ? 'a' : 'b', changed: false }),
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.converged, true);
  assert.strictEqual(r.reason, 'stable');
  assert.strictEqual(proposals.find((p) => p.model === 'minimax').alive, false);
});

// ── 3. runPanelEnrich — DI sequencing ──
console.log('3. runPanelEnrich — DI sequencing');

function makeDeps(overrides = {}) {
  const calls = { mandatoryProposals: [], advisoryProposals: [], curatedWith: null, applied: 0, evalDirs: [] };
  const base = {
    _calls: calls,
    buildResearchBrief: () => 'BRIEF',
    claimSlot: ({ model }) => ({ run_id: `r-${model}`, artifactsDir: `runs/${model}` }),
    claimAdvisorySlot: ({ model }) => ({ run_id: `r-${model}`, artifactsDir: `runs/${model}`, ok: true }),
    researchAndPropose: ({ model }) => { calls.mandatoryProposals.push(model); return { proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    researchAndProposeAdvisory: ({ model }) => { calls.advisoryProposals.push(model); return { ok: true, proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    releaseSlot: () => {},
    hashProposal: (p) => `h:${p}`,
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel, ownProposalPath }) => ({ ok: true, proposalPath: ownProposalPath, contentHash: `h:${ownProposalPath}`, changed: false }),
    curate: (args) => { calls.curatedWith = args; return { mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'merge-ledger.json', mergeLedger: { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'codex-current', disposition: 'kept' }] } }; },
    prepareEnrichedEval: ({ skillDir }) => ({ evalSkillDir: `${skillDir}/.enriched`, cleanup: () => {} }),
    applyMerge: ({ skillDir }) => { calls.applied += 1; return { applied: `${skillDir}/SKILL.md` }; },
    evalArtifactExists: () => true,
    runEvalDirection: ({ direction, executionProfile, skillDir }) => { calls.evalDirs.push(skillDir); return { direction, verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: executionProfile }; },
  };
  return { ...base, ...overrides };
}

check('runs mandatory + advisory proposals, converges, curates with advisory+crossReview, keeps + applies', () => {
  const deps = makeDeps();
  const r = panel.runPanelEnrich({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: ['minimax', 'gemini'], deps });
  assert.deepStrictEqual(deps._calls.mandatoryProposals, ['opus', 'codex-current']);
  assert.deepStrictEqual(deps._calls.advisoryProposals, ['minimax', 'gemini']);
  // curate received both mandatory proposals + advisory + crossReview key
  assert.strictEqual(deps._calls.curatedWith.proposals.length, 2);
  assert.strictEqual(deps._calls.curatedWith.advisoryProposals.length, 2);
  assert.ok(Array.isArray(deps._calls.curatedWith.crossReview));
  assert.strictEqual(r.merge.anti_loss.ok, true);
  assert.strictEqual(r.merge.mandatory_coverage.ok, true);
  assert.strictEqual(r.eval.synthesized_verdict, 'APPLICABLE');
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
  assert.strictEqual(r.mode, 'panel');
  assert.deepStrictEqual(r.advisory_models_alive.sort(), ['gemini', 'minimax']);
});

check('MANDATORY propose failure ABORTS the run', () => {
  const deps = makeDeps({ researchAndPropose: ({ model }) => { if (model === 'codex-current') throw new Error('codex down'); return { proposalPath: `p-${model}.md` }; } });
  assert.throws(() => panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /MANDATORY research\/propose failed.*codex down/);
});

check('ADVISORY propose failure does NOT abort — recorded in advisory_failures', () => {
  const deps = makeDeps({ researchAndProposeAdvisory: ({ model }) => (model === 'minimax' ? { ok: false, error: 'minimax timeout' } : { ok: true, proposalPath: `p-${model}.md` }) });
  const r = panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: ['minimax', 'gemini'], deps });
  assert.strictEqual(r.applied, true);
  assert.deepStrictEqual(r.advisory_models_alive, ['gemini']);
  assert.strictEqual(r.advisory_failures.length, 1);
  assert.match(r.advisory_failures[0].error, /minimax timeout/);
});

check('anti-loss violation in the merge throws', () => {
  const deps = makeDeps({ curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 9, surfaced_by: 'opus', disposition: 'dropped' }] } }) });
  assert.throws(() => panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /anti-loss/);
});

check('mandatory coverage gap throws (curator dropped a frontier proposal entirely)', () => {
  const deps = makeDeps({ curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }] } }) });
  assert.throws(() => panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /mandatory coverage gap/);
});

check('missing eval artifact => guardrail skipped => keep + apply, eval null', () => {
  const deps = makeDeps({ evalArtifactExists: () => false });
  const r = panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(deps._calls.evalDirs.length, 0);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
});

check('HARMFUL eval => revert, does NOT apply', () => {
  const deps = makeDeps({ runEvalDirection: ({ direction, executionProfile }) => ({ direction, verdict: 'HARMFUL', certification_tier: 'certifying', execution_profile: executionProfile }) });
  const r = panel.runPanelEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.keep_or_revert.action, 'revert');
  assert.strictEqual(r.applied, false);
});

check('requires skill/skillDir/cwd, 2-model mandatory, and injected deps', () => {
  assert.throws(() => panel.runPanelEnrich({ deps: {} }), /skill, skillDir, and cwd are required/);
  assert.throws(() => panel.runPanelEnrich({ skill: 's', skillDir: '/x', cwd: '/x', mandatoryModels: ['opus'], deps: {} }), /2-element array/);
  assert.throws(() => panel.runPanelEnrich({ skill: 's', skillDir: '/x', cwd: '/x', advisoryModels: [], deps: {} }), /must be a function/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
