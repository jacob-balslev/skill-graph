#!/usr/bin/env node
/**
 * Test: historical field aliases normalize and mismatch gates still fire.
 */

'use strict';

const path = require('path');
const { buildSkillEntry } = require('../generate-manifest');
const { checkAliasParity } = require('../lib/alias-contract');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'examples', 'tests', 'v3-1-alias-fixture.md');

function fail(msg) {
  process.stderr.write(`FAIL test-v3-1-alias-contract: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-v3-1-alias-contract: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

const fm = {
  schema_version: 4,
  name: 'alias-fixture',
  urn: 'urn:skill:skill-graph:alias-fixture',
  description: 'Fixture skill used to verify v3.1 alias pass-through and parity checks.',
  version: '1.0.0',
  subject: 'agent-ops',
  deployment_target: 'portable',
  taxonomy_domain: 'skill-system/testing',
  scope: 'Free-text PRD-style scope statement for the alias fixture.',
  owner: 'skill-graph-maintainer',
  freshness: '2026-05-13',
  reviewed_at: '2026-05-13',
  drift_check: {
    last_verified: '2026-05-13',
    verified_at: '2026-05-13',
  },
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
  comprehension_state: 'absent',
  eval: {
    artifacts: 'none',
    content_state: 'unverified',
    routing_coverage: 'absent',
    comprehension_state: 'absent',
  },
  'allowed-tools': 'Read Grep',
  allowed_tools: 'Read Grep',
  compatibility: {
    agent_runtimes: ['agent-runtime>=2.0'],
    node_version: '>=20',
  },
  grounding: {
    subject_matter: 'Alias contract',
    grounding_mode: 'repo_specific',
    truth_sources: ['schemas/SKILL_METADATA_PROTOCOL_schema.json'],
    failure_modes: ['silent_alias_drop'],
    evidence_priority: 'repo_code_first',
  },
  portability: {
    readiness: 'scripted',
    targets: ['skill-md'],
    export_targets: ['skill-md'],
  },
};

const parityErrors = checkAliasParity(fm);
assert(parityErrors.length === 0, `fixture should satisfy alias parity, got: ${parityErrors.join('; ')}`);

const entry = buildSkillEntry(fm, FIXTURE_PATH, 'alias-fixture', null);
assert(entry.urn === fm.urn, 'urn should pass through');
assert(entry.taxonomy_domain === fm.taxonomy_domain, 'taxonomy_domain should pass through');
assert(entry.allowed_tools === fm.allowed_tools, 'allowed_tools alias should pass through');
assert(entry.health.reviewed_at === fm.reviewed_at, 'reviewed_at alias should project to health.reviewed_at');
assert(entry.health.eval && entry.health.eval.content_state === 'unverified', 'nested eval alias should project to health.eval');
assert(entry.compatibility.agent_runtimes[0] === 'agent-runtime>=2.0', 'compatibility.agent_runtimes should be the emitted runtime key');
assert(entry.compatibility.node_version === '>=20', 'compatibility.node_version should be the emitted Node key');
// compatibility.runtimes / compatibility.node alias normalization assertions removed with the
// aliases themselves (SKI-353, 2026-06-15). The schema's additionalProperties:false now rejects
// those keys outright — there is no normalization step left to assert.
assert(entry.grounding.subject_matter === 'Alias contract', 'grounding.subject_matter should pass through');
assert(entry.grounding.grounding_mode === 'repo_specific', 'grounding.grounding_mode (canonical; claim_scope alias removed SKI-241) should pass through');
assert(entry.portability.export_targets[0] === 'skill-md', 'portability.export_targets should pass through');

const mismatch = { ...fm, reviewed_at: '2099-01-01' };
const mismatchErrors = checkAliasParity(mismatch);
assert(mismatchErrors.some(e => e.includes('reviewed_at')), 'alias mismatch should be reported by lint helper');

let threw = false;
try {
  buildSkillEntry(mismatch, FIXTURE_PATH, 'alias-fixture', null);
} catch (e) {
  threw = /alias contract violation/.test(e.message);
}
assert(threw, 'manifest generator should refuse mismatched aliases');

pass('historical aliases normalize and mismatches fail');
process.exit(0);
