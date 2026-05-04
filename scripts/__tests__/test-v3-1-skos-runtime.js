#!/usr/bin/env node
/**
 * Test: v3.1 SKOS predicate runtime migration (R1)
 *
 * Verifies that the manifest generator iterates the complete v3.1 predicate set
 * (related, broader, narrower, boundary, disjoint_with, verify_with, depends_on,
 * adjacent) and emits all declared relations into the manifest entry.
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
  // v3.0 stable + canonical (per ADR 0006)
  'boundary',
  'verify_with',
  'depends_on',
  // v3.1 separate orthogonal relation per ADR 0006 Option B
  'disjoint_with',
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
    if (!Array.isArray(arr) || arr.length === 0) {
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

  // Sanity: the back-compat alias `adjacent` continues to flow through if declared.
  // Fixture omits `adjacent` deliberately (it would draw a deprecation warning),
  // so this test only confirms the iteration list KNOWS about adjacent. We
  // synthesise a parallel fixture in-memory to verify.
  const adjacentFm = {
    ...fm,
    relations: { adjacent: ['documentation'] },
  };
  const adjacentEntry = buildSkillEntry(adjacentFm, FIXTURE_PATH, 'v3-1-skos-fixture-adjacent', null);
  if (!adjacentEntry.relations || !Array.isArray(adjacentEntry.relations.adjacent) || adjacentEntry.relations.adjacent.length !== 1) {
    fail('back-compat regression: relations.adjacent is dropped by generator (should still flow through as an alias for related per ADR 0001)');
  }

  pass(`all ${EXPECTED_PREDICATES.length} v3.1 predicates round-trip cleanly + adjacent back-compat preserved`);
  pass('R1 closed: ADR 0001 SKOS additions and ADR 0006 boundary/disjoint_with split are implemented in scripts/generate-manifest.js');
  process.exit(0);
}

main();
