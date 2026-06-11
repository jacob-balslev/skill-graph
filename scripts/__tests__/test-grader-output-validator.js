#!/usr/bin/env node
'use strict';

const assert = require('assert');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const validator = require(path.join(REPO_ROOT, 'lib', 'audit', 'grader-output-validator'));

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. application grader 0-100 scale');

check('accepts 0-100 integer axis scores and computes normalized weighted score', () => {
  const data = {
    red_herring: false,
    axis_scores: {
      flag_correctness: 90,
      fix_correctness: 70,
      false_positive_avoidance: 95,
      primary_signal_clarity: 50,
    },
    raw_score: 305,
    weighted_score: 0.7818,
    passed: true,
  };
  const result = validator.validateApplicationGrader(data);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.computed.raw_score, 305);
  assert.strictEqual(result.computed.max_raw_score, 400);
  assert.strictEqual(result.computed.weighted_score, 0.7818);
  assert.strictEqual(result.computed.passed, true);
});

check('rejects out-of-range and non-integer application axis scores', () => {
  const result = validator.validateApplicationGrader({
    axis_scores: {
      flag_correctness: 101,
      fix_correctness: -1,
      false_positive_avoidance: 99.5,
      primary_signal_clarity: 60,
    },
  });
  assert.strictEqual(result.valid, false);
  const invalidAxes = result.issues
    .filter((issue) => issue.code === 'invalid_axis_value')
    .map((issue) => issue.axis)
    .sort();
  assert.deepStrictEqual(invalidAxes, ['false_positive_avoidance', 'fix_correctness', 'flag_correctness']);
});

check('red-herring pass gate uses false_positive_avoidance >= 50', () => {
  const result = validator.validateApplicationGrader({
    red_herring: true,
    axis_scores: {
      flag_correctness: 100,
      fix_correctness: 100,
      false_positive_avoidance: 49,
      primary_signal_clarity: 100,
    },
    passed: true,
  });
  assert.strictEqual(result.computed.primary_axis, 'false_positive_avoidance');
  assert.strictEqual(result.computed.passed, false);
  assert.ok(result.issues.some((issue) => issue.code === 'passed_mismatch'));
});

check('correct() writes 0-100 application math back onto grader output', () => {
  const data = {
    red_herring: false,
    axis_scores: {
      flag_correctness: 80,
      fix_correctness: 80,
      false_positive_avoidance: 80,
      primary_signal_clarity: 80,
    },
    raw_score: 4,
    weighted_score: 1,
    passed: false,
  };
  const validation = validator.validateApplicationGrader(data);
  const corrected = validator.correct(data, validation);
  assert.strictEqual(corrected.raw_score, 320);
  assert.strictEqual(corrected.max_raw_score, 400);
  assert.strictEqual(corrected.weighted_score, 0.8);
  assert.strictEqual(corrected.passed, true);
});

console.log(`\n${passed} passed`);
