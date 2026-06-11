'use strict';

// Per-model Skill Audit Loop participation ledger.
//
// The four Audit Status verdicts answer "what is the current certified state of
// the skill?" This ledger answers a different question: "which model aliases
// have actually participated in the loop for this skill, and how far did they
// get?" Keep it separate from verdicts so advisory/free-model runs widen the
// evidence surface without certifying quality.

const {
  ADVISORY_MODELS,
  FRONTIER_PAIR,
  REGISTRY_VERSION,
  resolveModelDescriptor,
} = require('../audit-shared/model-provider');

const SKIPPED_REASONS = new Set([
  'budget-exhausted',
  'auth',
  'not-authenticated',
  'not-ready',
  'claim',
  'single-frontier-degraded',
  'not-requested',
]);

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function descriptorFor(model) {
  try { return resolveModelDescriptor(model); }
  catch (_) { return { alias: model, provider: 'unknown', backend: 'unknown' }; }
}

function statusForFailure(reason) {
  return SKIPPED_REASONS.has(String(reason || '').toLowerCase()) ? 'skipped' : 'failed';
}

function basePhaseStatus() {
  return {
    budget: 'not_applicable',
    claim: 'not_applicable',
    propose: 'not_applicable',
    cross_review: 'not_applicable',
    revise: 'not_applicable',
    curate: 'not_applicable',
    verify: 'not_applicable',
    evaluate: 'not_applicable',
    apply: 'not_applicable',
    record: 'not_applicable',
  };
}

function receiptFor(result) {
  if (result && result.merge && result.merge.mergeLedgerPath) return result.merge.mergeLedgerPath;
  if (result && result.eval && result.eval.merge_ledger_ref) return result.eval.merge_ledger_ref;
  return undefined;
}

function failureMap(result) {
  const out = new Map();
  for (const f of Array.isArray(result && result.advisory_failures) ? result.advisory_failures : []) {
    if (!f || !f.model) continue;
    if (!out.has(f.model)) out.set(f.model, []);
    out.get(f.model).push(f);
  }
  return out;
}

function writeOperation(coverage, model, operation, record) {
  const descriptor = descriptorFor(model);
  const previous = asObject(coverage.models && coverage.models[model]);
  const operations = { ...asObject(previous.operations), [operation]: record };
  coverage.models[model] = {
    model,
    provider: descriptor.provider || 'unknown',
    backend: descriptor.backend || 'unknown',
    tier: record.tier,
    operations,
  };
}

function mandatoryRecord({ model, result, evalMode, at, operation, receipt }) {
  const phases = basePhaseStatus();
  const missing = result && result.degraded_frontier && Array.isArray(result.degraded_frontier.missing)
    ? result.degraded_frontier.missing
    : [];
  if (missing.includes(model)) {
    phases.budget = 'skipped';
    phases.claim = 'skipped';
    phases.propose = 'skipped';
    phases.evaluate = 'skipped';
    return {
      at,
      operation,
      eval_mode: evalMode,
      tier: 'mandatory',
      status: 'skipped',
      registry_version: (result && result.registry_version) || REGISTRY_VERSION,
      phase_status: phases,
      failure_reason: 'single-frontier-degraded',
      failure_detail: result.degraded_frontier.reason,
      certifying: false,
      regrade_required: true,
      receipt,
    };
  }

  const certifyingBlocked = Array.isArray(result && result.certifying_blocked) && result.certifying_blocked.length > 0;
  phases.budget = 'completed';
  phases.claim = 'completed';
  phases.propose = 'completed';
  phases.cross_review = 'completed';
  phases.revise = 'completed';
  phases.curate = 'completed';
  phases.verify = result && result.verify && result.verify.status === 'RUN' ? 'completed' : 'degraded';
  phases.evaluate = result && result.eval_status === 'RUN' ? 'completed' : (result && result.eval_status ? 'skipped' : 'not_applicable');
  phases.apply = result && result.applied ? 'completed' : 'skipped';
  phases.record = 'completed';

  return {
    at,
    operation,
    eval_mode: evalMode,
    tier: 'mandatory',
    status: certifyingBlocked ? 'degraded' : 'completed',
    registry_version: (result && result.registry_version) || REGISTRY_VERSION,
    phase_status: phases,
    verdict: result && result.eval ? result.eval.synthesized_verdict : undefined,
    certifying: Boolean(result && result.eval_certified),
    regrade_required: Boolean(
      certifyingBlocked || (result && result.degraded_frontier && result.degraded_frontier.regrade_required)
    ),
    failure_reason: certifyingBlocked ? 'non-certifying-run' : undefined,
    failure_detail: certifyingBlocked ? result.certifying_blocked.join('; ') : undefined,
    receipt,
  };
}

function advisoryRecord({ model, result, evalMode, at, operation, receipt, failures }) {
  const phases = basePhaseStatus();
  const modelFailures = failures.get(model) || [];
  const alive = Array.isArray(result && result.advisory_models_alive) && result.advisory_models_alive.includes(model);
  const firstFailure = modelFailures[0];

  phases.budget = 'completed';
  phases.claim = 'completed';
  phases.propose = alive ? 'completed' : 'skipped';
  phases.cross_review = alive ? 'completed' : 'skipped';
  phases.revise = alive ? 'completed' : 'skipped';
  phases.curate = alive ? 'completed' : 'skipped';
  phases.verify = 'not_applicable';
  phases.evaluate = 'not_applicable';
  phases.apply = 'not_applicable';
  phases.record = 'completed';

  for (const f of modelFailures) {
    const reason = f.failure_reason || 'error';
    if (f.phase === 'budget') phases.budget = statusForFailure(reason);
    if (f.phase === 'claim') phases.claim = statusForFailure(reason);
    if (f.phase === 'propose') phases.propose = statusForFailure(reason);
    if (f.phase === 'review') phases.cross_review = 'failed';
    if (f.phase === 'revise') phases.revise = 'failed';
  }

  let status = 'skipped';
  if (alive && modelFailures.length === 0) status = 'completed';
  else if (alive && modelFailures.length > 0) status = 'degraded';
  else if (firstFailure) status = statusForFailure(firstFailure.failure_reason);
  else {
    phases.budget = 'skipped';
    phases.claim = 'skipped';
  }

  return {
    at,
    operation,
    eval_mode: evalMode,
    tier: 'advisory',
    status,
    registry_version: (result && result.registry_version) || REGISTRY_VERSION,
    phase_status: phases,
    certifying: false,
    regrade_required: false,
    failure_reason: firstFailure ? (firstFailure.failure_reason || 'error') : (alive ? undefined : 'not-requested'),
    failure_detail: firstFailure ? String(firstFailure.error || '').slice(0, 300) : undefined,
    receipt,
  };
}

function buildModelRunCoverage({ existing, result, evalMode = 'application', at = new Date().toISOString(), operation = 'panel' } = {}) {
  const prior = asObject(existing);
  const coverage = {
    schema_version: 1,
    updated_at: at,
    registry_version: (result && result.registry_version) || prior.registry_version || REGISTRY_VERSION,
    models: { ...asObject(prior.models) },
  };

  const receipt = receiptFor(result);
  const mandatory = Array.from(new Set([
    ...FRONTIER_PAIR,
    ...(Array.isArray(result && result.mandatory_models) ? result.mandatory_models : []),
  ]));
  const advisory = Array.from(new Set([
    ...ADVISORY_MODELS,
    ...(Array.isArray(result && result.advisory_models_requested) ? result.advisory_models_requested : []),
  ]));
  const failures = failureMap(result);

  for (const model of mandatory) {
    writeOperation(coverage, model, operation, mandatoryRecord({ model, result, evalMode, at, operation, receipt }));
  }
  for (const model of advisory) {
    writeOperation(coverage, model, operation, advisoryRecord({ model, result, evalMode, at, operation, receipt, failures }));
  }

  return coverage;
}

module.exports = {
  buildModelRunCoverage,
};
