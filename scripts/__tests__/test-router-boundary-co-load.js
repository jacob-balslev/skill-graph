#!/usr/bin/env node
/**
 * Test: boundary exclusions suppress co-loads from excluded skills.
 *
 * A boundary-excluded skill must not still contribute its own verify_with,
 * broader, or depends_on partners to the final route. Otherwise an excluded
 * ownership domain leaks context back into the selection through its neighbors.
 */

'use strict';

const { routeSkills } = require('../skill-graph-route');

function fail(msg) {
  process.stderr.write(`FAIL test-router-boundary-co-load: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-router-boundary-co-load: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

function skill(name, keywords, relations = {}) {
  return {
    id: name,
    name,
    path: `skills/${name}/SKILL.md`,
    deployment_target: 'portable',
    health: { eval_state: 'unverified' },
    activation: { keywords, triggers: [], paths: [] },
    relations,
  };
}

const manifest = {
  skills: [
    skill('skill-router', ['routing'], {
      boundary: [{ skill: 'middleware-patterns', reason: 'skill-router owns agent dispatch over web middleware routing' }],
    }),
    skill('middleware-patterns', ['routing', 'middleware'], {
      verify_with: ['security-fundamentals'],
    }),
    skill('security-fundamentals', ['security']),
  ],
};

function route(query) {
  return routeSkills(manifest, {
    query,
    project: null,
    maxResults: 10,
    minEvalState: 'unverified',
    pathArg: null,
    todayISO: '2026-06-01',
  });
}

const boundaryRoute = route('routing');
assert(boundaryRoute.selected.some(e => e.skill.name === 'skill-router'), 'skill-router should select for routing query');
assert(boundaryRoute.excluded.some(e => e.skill.name === 'middleware-patterns' && e.role === 'boundary_excluded'),
  'middleware-patterns should be boundary-excluded by skill-router');
assert(!boundaryRoute.coLoaded.some(e => e.skill.name === 'security-fundamentals'),
  'verify_with partner of boundary-excluded middleware-patterns must not be co-loaded');

const middlewareRoute = route('middleware');
assert(middlewareRoute.selected.some(e => e.skill.name === 'middleware-patterns'), 'middleware-patterns should select when not excluded');
assert(middlewareRoute.coLoaded.some(e => e.skill.name === 'security-fundamentals' && e.role === 'verify_with'),
  'verify_with partner should still co-load when its declaring skill remains selected');

pass('boundary-excluded skills do not leak co-load partners');
process.exit(0);
