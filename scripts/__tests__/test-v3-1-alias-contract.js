#!/usr/bin/env node
/**
 * Test: v3.1 preferred field aliases round-trip and mismatch gates.
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
  type: 'capability',
  archetype: 'capability',
  category: 'testing',
  domain: 'skill-system/testing',
  scope: 'portable',
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
    runtimes: ['claude-code>=2.0'],
    agent_runtimes: ['claude-code>=2.0'],
    node: '>=20',
    node_version: '>=20',
  },
  grounding: {
    domain_object: 'Alias contract',
    subject: 'Alias contract',
    grounding_mode: 'repo_specific',
    claim_scope: 'repo_specific',
    truth_sources: ['schemas/skill.schema.json'],
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
assert(entry.archetype === fm.archetype, 'archetype alias should pass through');
assert(entry.domain === fm.domain, 'domain should pass through');
assert(entry.allowed_tools === fm.allowed_tools, 'allowed_tools alias should pass through');
assert(entry.health.reviewed_at === fm.reviewed_at, 'reviewed_at alias should project to health.reviewed_at');
assert(entry.health.eval && entry.health.eval.content_state === 'unverified', 'nested eval alias should project to health.eval');
assert(entry.compatibility.agent_runtimes[0] === 'claude-code>=2.0', 'compatibility.agent_runtimes should pass through');
assert(entry.compatibility.node_version === '>=20', 'compatibility.node_version should pass through');
assert(entry.grounding.subject === 'Alias contract', 'grounding.subject should pass through');
assert(entry.grounding.claim_scope === 'repo_specific', 'grounding.claim_scope should pass through');
assert(entry.portability.export_targets[0] === 'skill-md', 'portability.export_targets should pass through');

const mismatch = { ...fm, archetype: 'workflow' };
const mismatchErrors = checkAliasParity(mismatch);
assert(mismatchErrors.some(e => e.includes('archetype')), 'alias mismatch should be reported by lint helper');

let threw = false;
try {
  buildSkillEntry(mismatch, FIXTURE_PATH, 'alias-fixture', null);
} catch (e) {
  threw = /alias contract violation/.test(e.message);
}
assert(threw, 'manifest generator should refuse mismatched aliases');

pass('v3.1 aliases pass through and mismatches fail');
process.exit(0);
