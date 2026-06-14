#!/usr/bin/env node
/**
 * Test: v3.1 SKOS predicate runtime migration (R1)
 *
 * Verifies that the manifest generator iterates the complete canonical predicate set
 * (related, broader, narrower, suppresses, disjoint_with, verify_with, depends_on,
 * io_contract) and emits all declared relations into the manifest entry.
 *
 * Before R1, the iteration list in `generate-manifest.js` was hardcoded to
 * ['adjacent', 'boundary', 'verify_with', 'depends_on'] and silently dropped
 * `related`, `broader`, `narrower`, `disjoint_with`. Authors who followed
 * ADR 0001 v3.1 SKOS naming would see lint warnings nudging them to the new
 * names but their relations would never reach the manifest.
 *
 * This test asserts the regression is closed: build a manifest entry from the
 * fixture, confirm every declared predicate survives the round-trip.
 *
 * Exit 0 on pass, 1 on failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('../lib/parse-frontmatter');
const { buildSkillEntry } = require('../generate-manifest');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FIXTURE_PATH = path.join(REPO_ROOT, 'examples', 'tests', 'v3-1-skos-fixture', 'SKILL.md');

const EXPECTED_PREDICATES = [
  // v3.1 SKOS additions
  'related',
  'broader',
  'narrower',
  // Routing-layer exclusion (ADR 0018)
  'suppresses',
  'verify_with',
  'depends_on',
  // v3.1 separate orthogonal relation per ADR 0006 Option B
  'disjoint_with',
  // Composition hook
  'io_contract',
];

function fail(msg) {
  process.stderr.write(`FAIL test-v3-1-skos-runtime: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-v3-1-skos-runtime: ${msg}\n`);
}

function main() {
  if (!fs.existsSync(FIXTURE_PATH)) {
    fail(`fixture missing at ${path.relative(REPO_ROOT, FIXTURE_PATH)}`);
  }

  const text = fs.readFileSync(FIXTURE_PATH, 'utf8');
  const fm = parseFrontmatter(text);
  if (!fm) fail('fixture has no parseable frontmatter');

  // Guard: every expected predicate is declared in the fixture frontmatter.
  for (const kind of EXPECTED_PREDICATES) {
    const arr = fm.relations && fm.relations[kind];
    const ok = kind === 'io_contract'
      ? arr && typeof arr === 'object' && !Array.isArray(arr) && Object.keys(arr).length > 0
      : Array.isArray(arr) && arr.length > 0;
    if (!ok) {
      fail(`fixture frontmatter missing relations.${kind} — fixture is the test substrate, must declare every predicate under test`);
    }
  }

  const entry = buildSkillEntry(fm, FIXTURE_PATH, 'v3-1-skos-fixture', null);

  if (!entry || typeof entry !== 'object') fail('buildSkillEntry returned non-object');
  if (!entry.relations || typeof entry.relations !== 'object') {
    fail('manifest entry has no `relations` block — generator dropped all relations');
  }

  // Round-trip assertion: every predicate declared in the fixture must appear
  // in the manifest entry's relations block with the same target list shape.
  const missing = [];
  const sizeMismatch = [];
  for (const kind of EXPECTED_PREDICATES) {
    if (kind === 'io_contract') {
      if (!entry.relations.io_contract || !Array.isArray(entry.relations.io_contract.inputs) || !Array.isArray(entry.relations.io_contract.outputs)) {
        missing.push(kind);
      }
      continue;
    }
    if (!Array.isArray(entry.relations[kind])) {
      missing.push(kind);
      continue;
    }
    if (entry.relations[kind].length !== fm.relations[kind].length) {
      sizeMismatch.push(`${kind}: fixture has ${fm.relations[kind].length}, manifest has ${entry.relations[kind].length}`);
    }
  }

  if (missing.length > 0) {
    fail(`predicates dropped from manifest entry: ${missing.join(', ')}. Generator iteration list does not include these keys.`);
  }
  if (sizeMismatch.length > 0) {
    fail(`predicate target counts differ between fixture and manifest:\n  - ${sizeMismatch.join('\n  - ')}`);
  }

  // Sanity: retired aliases still normalize to canonical output for historical
  // callers, but generated manifests do not re-emit retired keys.
  const aliasFm = {
    ...fm,
    relations: {
      adjacent: ['documentation'],
      boundary: [{ skill: 'skill-router', reason: 'skill-router owns dispatch decisions' }],
    },
  };
  const aliasEntry = buildSkillEntry(aliasFm, FIXTURE_PATH, 'v3-1-skos-fixture-aliases', null);
  if (!aliasEntry.relations || !Array.isArray(aliasEntry.relations.related) || aliasEntry.relations.related.length !== 1) {
    fail('back-compat regression: relations.adjacent should normalize to canonical relations.related');
  }
  if (!Array.isArray(aliasEntry.relations.suppresses) || aliasEntry.relations.suppresses.length !== 1) {
    fail('back-compat regression: relations.boundary should normalize to canonical relations.suppresses');
  }
  if ('adjacent' in aliasEntry.relations || 'boundary' in aliasEntry.relations) {
    fail('manifest generator must not re-emit retired relation aliases');
  }

  pass(`all ${EXPECTED_PREDICATES.length} canonical predicates round-trip cleanly + retired aliases normalize`);
  pass('R1 closed: ADR 0001 SKOS additions, ADR 0018 suppresses, ADR 0006 disjoint_with split, and io_contract are implemented in scripts/generate-manifest.js');
  process.exit(0);
}

main();
