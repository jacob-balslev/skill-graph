#!/usr/bin/env node
/**
 * Test: project-relevance activation fields affect routing decisions.
 *
 * Guards the reference router against accepting codebase-specific metadata in
 * the manifest while leaving it inert in selection.
 */

'use strict';

const { routeSkills } = require('../skill-graph-route');

function fail(msg) {
  process.stderr.write(`FAIL test-router-project-activation: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-router-project-activation: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

function skill(name, activation, extra = {}) {
  return {
    id: name,
    name,
    path: `skills/${name}/SKILL.md`,
    health: { eval_state: 'unverified' },
    activation: {
      keywords: ['shared prompt'],
      triggers: [],
      paths: [],
      ...activation,
    },
    ...extra,
  };
}

const manifest = {
  skills: [
    skill('generic-helper', {}),
    skill('next-api-debugging', {
      dependencies: ['next'],
      codebase_layer: ['api'],
      applicable_tasks: ['debugging'],
      environment: ['production'],
      internal_tools: ['scripts/trace-api.sh'],
    }, {
      project_adoption_stage: 'current-standard',
    }),
  ],
};

const result = routeSkills(manifest, {
  query: 'shared prompt',
  project: null,
  maxResults: 1,
  minEvalState: 'unverified',
  pathArg: null,
  dependencies: ['next'],
  codebaseLayers: ['api'],
  applicableTasks: ['debugging'],
  environments: ['production'],
  internalTools: ['scripts/trace-api.sh'],
  projectAdoptionStages: ['current-standard'],
  todayISO: '2026-06-12',
});

assert(result.selected.length === 1, 'one skill should be selected');
assert(result.selected[0].skill.name === 'next-api-debugging', 'project-relevance fields should break keyword tie');

const reasons = result.selected[0].reasons;
for (const expected of [
  'dependency:next',
  'codebase_layer:api',
  'applicable_task:debugging',
  'environment:production',
  'internal_tool:scripts/trace-api.sh',
  'project_adoption_stage:current-standard',
]) {
  assert(reasons.includes(expected), `missing route reason ${expected}`);
}

pass('project-relevance activation fields score and explain routing');
process.exit(0);
