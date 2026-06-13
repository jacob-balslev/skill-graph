#!/usr/bin/env node
/**
 * Test: activation.paths include/exclude semantics.
 *
 * Guards the reference router against treating `!pattern` negations as positive
 * path matches. Negations only subtract from earlier positive includes.
 */

'use strict';

const { routeSkills, matchesGlob, matchPathList } = require('../skill-graph-route');

function fail(msg) {
  process.stderr.write(`FAIL test-router-paths: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-router-paths: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

const a11ySkill = {
  id: 'a11y',
  name: 'a11y',
  path: 'skills/a11y/SKILL.md',
  type: 'capability',
  scope: 'portable',
  health: { eval_state: 'passing' },
  activation: {
    keywords: [],
    triggers: [],
    paths: [
      '**/*.{html,tsx,jsx,vue,svelte}',
      '**/*.css',
      '!**/*.test.{ts,tsx,js,jsx}',
      '!**/dist/**',
      '!**/node_modules/**',
    ],
  },
};

function route(pathArg) {
  return routeSkills({
    skills: [a11ySkill],
  }, {
    query: 'unrelated prompt',
    project: null,
    maxResults: 5,
    minEvalState: 'unverified',
    pathArg,
    todayISO: '2026-05-13',
  });
}

assert(matchesGlob('src/components/Button.tsx', '**/*.{html,tsx,jsx,vue,svelte}'), 'brace glob should match .tsx paths');
assert(matchesGlob('src/components/Button.test.tsx', '!**/*.test.{ts,tsx,js,jsx}'), 'matchesGlob should test the underlying negated glob');

const included = matchPathList('src/components/Button.tsx', a11ySkill.activation.paths);
assert(included.matched, 'positive .tsx path should match');
assert(included.pattern === '**/*.{html,tsx,jsx,vue,svelte}', 'path reason should be the positive include pattern');

const excluded = matchPathList('src/components/Button.test.tsx', a11ySkill.activation.paths);
assert(!excluded.matched, 'test path should be excluded by negation');
assert(excluded.excludedBy === '!**/*.test.{ts,tsx,js,jsx}', 'excludedBy should identify the subtractive pattern');

const negationOnly = matchPathList('src/components/Button.tsx', ['!**/*.test.{ts,tsx,js,jsx}']);
assert(!negationOnly.matched, 'a negation-only list must not create a positive match');

const includedRoute = route('src/components/Button.tsx');
assert(includedRoute.selected.length === 1, 'router should select a11y for included .tsx path');
assert(includedRoute.selected[0].reasons.includes('path:**/*.{html,tsx,jsx,vue,svelte}'), 'router should cite the positive path include');
assert(!includedRoute.selected[0].reasons.some(r => r.startsWith('path:!')), 'router must not cite negation as a positive path reason');

const excludedRoute = route('src/components/Button.test.tsx');
assert(excludedRoute.selected.length === 0, 'router should not select a11y for excluded test path');

const exampleSkill = {
  id: 'routing-owner',
  name: 'routing-owner',
  path: 'skills/routing-owner/SKILL.md',
  health: { eval_state: 'unverified' },
  activation: {
    keywords: [],
    triggers: [],
    examples: ['design reconnect and catch-up behavior after an EventSource disconnect'],
    anti_examples: ['generate quarterly OKRs from this scorecard'],
    paths: [],
  },
};

const exampleRoute = routeSkills({
  skills: [exampleSkill],
}, {
  query: 'design reconnect and catch-up behavior after an EventSource disconnect',
  project: null,
  maxResults: 5,
  minEvalState: 'unverified',
  todayISO: '2026-05-13',
});
assert(exampleRoute.selected.length === 1, 'router should select a skill on an exact activation example');
assert(exampleRoute.selected[0].reasons.includes('example:exact'), 'router should cite exact example activation');

const antiExampleRoute = routeSkills({
  skills: [exampleSkill],
}, {
  query: 'generate quarterly OKRs from this scorecard',
  project: null,
  maxResults: 5,
  minEvalState: 'unverified',
  todayISO: '2026-05-13',
});
assert(antiExampleRoute.selected.length === 0, 'router should not select a skill on its exact anti-example');

pass('activation.paths negations subtract only from prior positive includes; examples and anti_examples affect exact routing');
process.exit(0);
