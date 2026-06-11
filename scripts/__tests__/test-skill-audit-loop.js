'use strict';

// Unit tests for the multi-agent PANEL enrich orchestrator (run-skill-audit-loop.js).
// Pure DI — no real dispatch, no fs. Mirrors test-skill-audit-loop-lite.js patterns.

const assert = require('assert');
const panel = require('../../lib/audit/run-skill-audit-loop');

let passed = 0;
function check(name, fn) {
  try { fn(); console.log(`  PASS    ${name}`); passed += 1; }
  catch (e) { console.log(`  FAIL    ${name}\n          ${e.message}`); throw e; }
}

// ── 1. validateMandatoryCoverage ──
console.log('1. validateMandatoryCoverage');

check('both mandatory models surfaced => ok', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'gpt-5.5', disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'gpt-5.5', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'gpt-5.5']);
  assert.strictEqual(r.ok, true);
  assert.deepStrictEqual(r.covered.sort(), ['gpt-5.5', 'opus']);
});

check('a mandatory model absent from the ledger => violation (silent frontier loss)', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'gpt-5.5', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'gpt-5.5']);
  assert.strictEqual(r.ok, false);
  assert.match(r.violations[0].reason, /gpt-5.5.*silently lost/);
});

check('surfaced via corroborated_by also counts as covered', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', corroborated_by: ['gpt-5.5'], disposition: 'kept' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'gpt-5.5', alive: true }];
  const r = panel.validateMandatoryCoverage(ledger, props, ['opus', 'gpt-5.5']);
  assert.strictEqual(r.ok, true);
});

check('a dropped-with-reason contribution still counts as covered (presence, not disposition)', () => {
  const ledger = { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'gpt-5.5', disposition: 'dropped', drop_reason: 'redundant' }] };
  const props = [{ model: 'opus', alive: true }, { model: 'gpt-5.5', alive: true }];
  assert.strictEqual(panel.validateMandatoryCoverage(ledger, props, ['opus', 'gpt-5.5']).ok, true);
});

// ── 2. runConvergence ──
console.log('2. runConvergence');

function mkProps(list) {
  // list: [{model, tier, hash}]
  return list.map((x) => ({ model: x.model, tier: x.tier, proposalPath: `p-${x.model}.md`, noveltyMemoPath: null, round: 0, contentHash: x.hash, alive: true, error: null, artifactsDir: `runs/${x.model}` }));
}

check('converges (stable) when no agent changes in a round', () => {
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b' }]);
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
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a0' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b0' }]);
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
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b' }]);
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
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b' }]);
  const deps = {
    crossReview: ({ reviewerModel }) => (reviewerModel === 'gpt-5.5' ? { ok: false, error: 'dead' } : { ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => ({ ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: `${reviserModel}-x`, changed: true }),
    hashProposal: (p) => p,
  };
  // round 1: codex dies in cross-review -> alive mandatory = 1; round 2 quorum guard fires
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.reason, 'quorum-collapsed');
});

check('advisory death is best-effort: does not collapse quorum, run continues', () => {
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b' }, { model: 'minimax', tier: 'advisory', hash: 'c' }]);
  const deps = {
    crossReview: ({ reviewerModel }) => (reviewerModel === 'minimax' ? { ok: false, error: 'dead advisory' } : { ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => ({ ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: reviserModel === 'opus' ? 'a' : 'b', changed: false }),
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.converged, true);
  assert.strictEqual(r.reason, 'stable');
  const advisory = proposals.find((p) => p.model === 'minimax');
  assert.strictEqual(advisory.alive, true, 'advisor proposal stays alive for curation');
  assert.strictEqual(advisory.advisoryFailure.phase, 'review');
});

check('SKI-211: advisory churn does NOT block convergence — stability is mandatory-only', () => {
  // 2 mandatory stable after round 1; 1 advisory re-emits a different hash every round
  // (the text-capture churn). Convergence must key off the mandatory tier and converge.
  const proposals = mkProps([{ model: 'opus', tier: 'mandatory', hash: 'a' }, { model: 'gpt-5.5', tier: 'mandatory', hash: 'b' }, { model: 'minimax', tier: 'advisory', hash: 'c0' }]);
  let n = 0;
  const deps = {
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    reviseProposal: ({ reviserModel }) => {
      if (reviserModel === 'minimax') { n += 1; return { ok: true, proposalPath: 'p-minimax.md', contentHash: `c-${n}`, changed: true }; }
      return { ok: true, proposalPath: `p-${reviserModel}.md`, contentHash: reviserModel === 'opus' ? 'a' : 'b', changed: false };
    },
    hashProposal: (p) => p,
  };
  const r = panel.runConvergence({ skill: 's', skillDir: '/x', proposals, deps, policy: { maxRounds: 3, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 } });
  assert.strictEqual(r.converged, true, 'converges despite advisory churning every round');
  assert.strictEqual(r.reason, 'stable');
  assert.strictEqual(r.rounds, 1, 'converges at round 1 — mandatory stable immediately');
});

// ── 3. runSkillAuditLoop — DI sequencing ──
console.log('3. runSkillAuditLoop — DI sequencing');

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
    curate: (args) => {
      calls.curatedWith = args;
      return {
        mergedSkillPath: 'SKILL.md',
        mergeLedgerPath: 'merge-ledger.json',
        mergeLedger: { contributions: args.proposals.concat(args.advisoryProposals || []).map((p, i) => ({ id: i + 1, surfaced_by: p.model, disposition: 'kept' })) },
      };
    },
    prepareEnrichedEval: ({ skillDir }) => ({ evalSkillDir: `${skillDir}/.enriched`, cleanup: () => {} }),
    applyMerge: ({ skillDir }) => { calls.applied += 1; return { applied: `${skillDir}/SKILL.md` }; },
    evalArtifactExists: () => true,
    runEvalDirection: ({ direction, executionProfile, skillDir }) => {
      calls.evalDirs.push(skillDir);
      return {
        direction,
        verdict: 'APPLICABLE',
        certification_tier: 'certifying',
        calibrated: true,
        red_herring_cases_total: 1,
        execution_profile: executionProfile,
      };
    },
  };
  return { ...base, ...overrides };
}

check('runs mandatory + advisory proposals, converges, curates with advisory+crossReview, keeps + applies', () => {
  const deps = makeDeps();
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: ['minimax', 'gemini'], deps });
  assert.deepStrictEqual(deps._calls.mandatoryProposals, ['opus', 'gpt-5.5']);
  assert.deepStrictEqual(deps._calls.advisoryProposals, ['minimax', 'gemini']);
  // curate received both mandatory proposals + advisory + crossReview key
  assert.strictEqual(deps._calls.curatedWith.proposals.length, 2);
  assert.strictEqual(deps._calls.curatedWith.advisoryProposals.length, 2);
  assert.ok(Array.isArray(deps._calls.curatedWith.crossReview));
  assert.strictEqual(r.merge.anti_loss.ok, true);
  assert.strictEqual(r.merge.mandatory_coverage.ok, true);
  assert.strictEqual(r.merge.advisory_coverage.ok, true);
  assert.strictEqual(r.eval.synthesized_verdict, 'APPLICABLE');
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
  assert.strictEqual(r.mode, 'panel');
  assert.deepStrictEqual(r.advisory_models_alive.sort(), ['gemini', 'minimax']);
});

check('MANDATORY propose failure ABORTS the run', () => {
  const deps = makeDeps({ researchAndPropose: ({ model }) => { if (model === 'gpt-5.5') throw new Error('codex down'); return { proposalPath: `p-${model}.md` }; } });
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /MANDATORY research\/propose failed.*codex down/);
});

check('ADVISORY propose failure does NOT abort — recorded in advisory_failures', () => {
  const deps = makeDeps({ researchAndProposeAdvisory: ({ model }) => (model === 'minimax' ? { ok: false, error: 'minimax timeout' } : { ok: true, proposalPath: `p-${model}.md` }) });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: ['minimax', 'gemini'], deps });
  assert.strictEqual(r.applied, true);
  assert.deepStrictEqual(r.advisory_models_alive, ['gemini']);
  assert.strictEqual(r.advisory_failures.length, 1);
  assert.match(r.advisory_failures[0].error, /minimax timeout/);
});

check('ADVISORY cross-review failure does NOT drop its proposal from curation', () => {
  const deps = makeDeps({
    crossReview: ({ reviewerModel }) => (reviewerModel === 'minimax' ? { ok: false, error: 'review timeout' } : { ok: true, structured: { items: [] } }),
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: ['minimax'], deps });
  assert.strictEqual(r.applied, true);
  assert.deepStrictEqual(deps._calls.curatedWith.advisoryProposals.map((p) => p.model), ['minimax']);
  assert.strictEqual(r.advisory_failures.length, 1);
  assert.strictEqual(r.advisory_failures[0].phase, 'review');
});

check('advisory coverage gap throws when a produced advisor is absent from ledger', () => {
  const deps = makeDeps({
    curate: (args) => ({
      mergedSkillPath: 'SKILL.md',
      mergeLedgerPath: 'm.json',
      mergeLedger: { contributions: args.proposals.map((p, i) => ({ id: i + 1, surfaced_by: p.model, disposition: 'kept' })) },
    }),
  });
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: ['minimax'], deps }), /advisory coverage gap/);
});

check('B2: round-budget non-convergence curates-from-last-stable + marks NON-CERTIFYING (no abort, no discard)', () => {
  let counter = 0;
  const deps = makeDeps({
    reviseProposal: ({ reviserModel, ownProposalPath }) => {
      counter += 1;
      return { ok: true, proposalPath: ownProposalPath, contentHash: `${reviserModel}-${counter}`, changed: true };
    },
  });
  // maxRounds:1 with an always-changing reviser ⇒ mandatory never stabilizes ⇒ non-converged.
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], convergence: { maxRounds: 1, minRounds: 1, stabilityThreshold: 1.0, quorum: 2 }, deps });
  // Knowledge is PRESERVED: the run curated from the last stable mandatory proposals
  // (no NonConvergenceError, no discard).
  assert.notStrictEqual(deps._calls.curatedWith, null);
  assert.strictEqual(r.convergence.converged, false);
  // …but it is NON-CERTIFYING: certifying_blocked names the non-converged reason and
  // eval_certified is false even though makeDeps' eval returns a certifying APPLICABLE.
  assert.ok(Array.isArray(r.certifying_blocked) && r.certifying_blocked.some((x) => /non-converged/.test(x)),
    `certifying_blocked should name non-converged; got ${JSON.stringify(r.certifying_blocked)}`);
  assert.strictEqual(r.eval_certified, false);
});

check('ADVISORY budget exhaustion skips that advisor without aborting', () => {
  const deps = makeDeps({
    assertBudget: ({ model }) => {
      if (model === 'minimax') {
        const err = new Error('budget window exhausted');
        err.code = 'BUDGET_EXHAUSTED';
        throw err;
      }
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: ['minimax', 'gemini'], deps });
  assert.strictEqual(r.applied, true);
  assert.deepStrictEqual(deps._calls.advisoryProposals, ['gemini']);
  assert.deepStrictEqual(r.advisory_models_alive, ['gemini']);
  assert.strictEqual(r.advisory_failures.length, 1);
  assert.strictEqual(r.advisory_failures[0].phase, 'budget');
  assert.strictEqual(r.advisory_failures[0].failure_reason, 'budget-exhausted');
});

check('anti-loss violation in the merge throws', () => {
  const deps = makeDeps({ curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 9, surfaced_by: 'opus', disposition: 'dropped' }] } }) });
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /anti-loss/);
});

check('mandatory coverage gap throws (curator dropped a frontier proposal entirely)', () => {
  const deps = makeDeps({ curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }] } }) });
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }), /mandatory coverage gap/);
});

check('missing eval artifact => guardrail skipped => keep + apply, eval null', () => {
  const deps = makeDeps({ evalArtifactExists: () => false });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(deps._calls.evalDirs.length, 0);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
});

check('HARMFUL eval => revert, does NOT apply', () => {
  const deps = makeDeps({
    runEvalDirection: ({ direction, executionProfile }) => ({
      direction,
      verdict: 'HARMFUL',
      certification_tier: 'certifying',
      calibrated: true,
      red_herring_cases_total: 1,
      execution_profile: executionProfile,
    }),
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.keep_or_revert.action, 'revert');
  assert.strictEqual(r.applied, false);
});

check('single-available-frontier degraded mode uses quorum=1 and PROVISIONAL-capped eval', () => {
  const deps = makeDeps();
  const r = panel.runSkillAuditLoop({
    skill: 's',
    skillDir: '/x/s',
    cwd: '/x',
    mandatoryModels: ['gpt-5.5'],
    advisoryModels: [],
    degradedFrontier: { enabled: true, reason: 'single_frontier:opus_budget_exhausted', missingFrontiers: ['opus'] },
    deps,
  });
  assert.deepStrictEqual(deps._calls.mandatoryProposals, ['gpt-5.5']);
  assert.strictEqual(deps._calls.curatedWith.proposals.length, 1);
  assert.strictEqual(r.convergence.policy.quorum, 1);
  assert.strictEqual(r.degraded_frontier.enabled, true);
  assert.deepStrictEqual(r.degraded_frontier.available, ['gpt-5.5']);
  assert.strictEqual(r.eval.reconciliation, 'single-frontier-provisional');
  assert.strictEqual(r.eval.synthesized_verdict, 'PROVISIONAL');
  assert.strictEqual(r.eval.regrade_required, true);
  assert.strictEqual(r.eval_certified, false);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
});

check('requires skill/skillDir/cwd, 2-model mandatory unless degraded, and injected deps', () => {
  assert.throws(() => panel.runSkillAuditLoop({ deps: {} }), /skill, skillDir, and cwd are required/);
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x', cwd: '/x', mandatoryModels: ['opus'], deps: {} }), /2-element array unless degradedFrontier\.enabled/);
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x', cwd: '/x', mandatoryModels: ['opus', 'gpt-5.5'], degradedFrontier: { enabled: true }, deps: {} }), /exactly one available mandatory model/);
  assert.throws(() => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x', cwd: '/x', advisoryModels: [], deps: {} }), /must be a function/);
});

// ── 4. Phase 3.1 mandatory verification gate (2026-06-10T) ──
console.log('4. Phase 3.1 verify gate');

check('verify is DEFERRED (recorded, not silently RUN) when no verifyMerge dep is injected', () => {
  const deps = makeDeps();
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.verify.status, 'DEFERRED');
  assert.strictEqual(r.verify.rounds, 0);
  assert.strictEqual(r.applied, true); // curate-only composition still keeps + applies
});

check('both frontiers approve => verify RUN, 1 round, proceeds to eval + apply', () => {
  const verified = [];
  const deps = makeDeps({
    verifyMerge: ({ verifierModel }) => { verified.push(verifierModel); return { ok: true, approved: true, gaps: [], parse_ok: true }; },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.verify.status, 'RUN');
  assert.strictEqual(r.verify.rounds, 1);
  assert.deepStrictEqual(verified.sort(), ['gpt-5.5', 'opus']);
  assert.strictEqual(r.verify.approvals.opus, true);
  assert.strictEqual(r.verify.approvals['gpt-5.5'], true);
  assert.strictEqual(r.applied, true);
});

check('round-1 gap => curator revision + re-verify approves in round 2 (curate called twice)', () => {
  let verifyCalls = 0;
  const curateArgs = [];
  const deps = makeDeps({
    curate: (args) => {
      curateArgs.push(args);
      return {
        mergedSkillPath: 'SKILL.md',
        mergeLedgerPath: 'merge-ledger.json',
        mergeLedger: { contributions: args.proposals.concat(args.advisoryProposals || []).map((p, i) => ({ id: i + 1, surfaced_by: p.model, disposition: 'kept' })) },
      };
    },
    verifyMerge: () => {
      verifyCalls += 1;
      // round 1: both verifiers flag a gap (calls 1-2); round 2: both approve (calls 3-4)
      if (verifyCalls <= 2) return { ok: true, approved: false, gaps: [{ kind: 'unevidenced-claim', item: 'claim X lacks evidence', evidence: 'f.js:1', required_action: 'drop or evidence it' }], parse_ok: true };
      return { ok: true, approved: true, gaps: [], parse_ok: true };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.verify.status, 'RUN');
  assert.strictEqual(r.verify.rounds, 2);
  assert.strictEqual(curateArgs.length, 2); // initial curate + one verify revision
  assert.strictEqual(r.verify.gaps.length, 2); // the two round-1 gaps stay on the record
  assert.strictEqual(r.applied, true);

  // B7: the verify-revision curate call receives the gaps via a TYPED verifyGaps[] param,
  // NOT smuggled into crossReview with a synthetic targetModel:'curator'.
  const revision = curateArgs[1];
  assert.ok(Array.isArray(revision.verifyGaps) && revision.verifyGaps.length === 2, 'revision curate received typed verifyGaps[]');
  assert.ok(revision.verifyGaps.every((g) => g.verifier && g.item && g.required_action), 'verifyGaps carry verifier/item/required_action');
  // crossReview is NOT the carrier for verify gaps anymore.
  assert.ok(!(revision.crossReview || []).some((c) => c.targetModel === 'curator'), 'verify gaps are NOT smuggled into crossReview as targetModel:curator');
  // The initial curate (round-0) carries no verify gaps.
  assert.ok(!curateArgs[0].verifyGaps || curateArgs[0].verifyGaps.length === 0, 'initial curate has no verify gaps');
});

check('approval never reached after max verify rounds => throws, nothing applied', () => {
  const deps = makeDeps({
    verifyMerge: () => ({ ok: true, approved: false, gaps: [{ kind: 'own-coverage', item: 'my contribution dropped silently', evidence: 'ledger', required_action: 'restore it' }], parse_ok: true }),
  });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }),
    /phase 3\.1 verification failed/,
  );
  assert.strictEqual(deps._calls.applied, 0);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
