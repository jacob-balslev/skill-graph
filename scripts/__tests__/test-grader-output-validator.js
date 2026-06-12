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

console.log('1. concept grader 0-100 scale');

check('accepts 0-100 integer Comprehension scores and computes scored-criterion denominator', () => {
  const data = {
    score_scale: '0-100',
    max_score_per_dimension: 100,
    primary_dimension: 'definition',
    dimension_scores: {
      definition: 90,
      mental_model: 75,
      purpose: null,
      boundary: null,
      taxonomy: null,
      analogy: null,
      application: 85,
    },
    raw_score: 250,
    max_raw_score: 300,
    weighted_score: 0.8278,
    score_ratio: 0.8333,
    passed: true,
  };
  const result = validator.validateConceptGrader(data);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.computed.raw_score, 250);
  assert.strictEqual(result.computed.max_raw_score, 300);
  assert.strictEqual(result.computed.weighted_score, 0.8278);
  assert.strictEqual(result.computed.score_ratio, 0.8333);
  assert.strictEqual(result.computed.passed, true);
  assert.strictEqual(result.computed.score_scale, '0-100');
  assert.strictEqual(result.computed.max_score_per_dimension, 100);
});

check('rejects out-of-range and non-integer concept scores', () => {
  const result = validator.validateConceptGrader({
    primary_dimension: 'definition',
    dimension_scores: {
      definition: 101,
      mental_model: -1,
      purpose: 99.5,
      boundary: null,
      taxonomy: null,
      analogy: null,
      application: 60,
    },
  });
  assert.strictEqual(result.valid, false);
  const invalidDims = result.issues
    .filter((issue) => issue.code === 'invalid_dim_value')
    .map((issue) => issue.dim)
    .sort();
  assert.deepStrictEqual(invalidDims, ['definition', 'mental_model', 'purpose']);
});

check('correct() writes 0-100 concept math and denominator back onto grader output', () => {
  const data = {
    primary_dimension: 'application',
    dimension_scores: {
      definition: null,
      mental_model: 80,
      purpose: null,
      boundary: null,
      taxonomy: null,
      analogy: null,
      application: 70,
    },
    raw_score: 3,
    max_raw_score: 4,
    weighted_score: 1,
    score_ratio: 1,
    passed: false,
  };
  const validation = validator.validateConceptGrader(data);
  const corrected = validator.correct(data, validation);
  assert.strictEqual(corrected.raw_score, 150);
  assert.strictEqual(corrected.max_raw_score, 200);
  assert.strictEqual(corrected.weighted_score, 0.7429);
  assert.strictEqual(corrected.score_ratio, 0.75);
  assert.strictEqual(corrected.passed, true);
  assert.strictEqual(corrected.score_scale, '0-100');
  assert.strictEqual(corrected.max_score_per_dimension, 100);
});

check('flags likely retired 0/1/2 concept outputs when no 0-100 scale is declared', () => {
  const result = validator.validateConceptGrader({
    primary_dimension: 'definition',
    dimension_scores: {
      definition: 2,
      mental_model: 1,
      purpose: null,
      boundary: null,
      taxonomy: null,
      analogy: null,
      application: 2,
    },
    raw_score: 5,
    max_raw_score: 6,
    score_ratio: 0.8333,
    passed: true,
  });
  assert.strictEqual(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.code === 'legacy_concept_scale_suspected'));
});

console.log('\n2. application grader 0-100 scale');

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
