#!/usr/bin/env node
/**
 * Regression test for collectNeighborSummaries (SH-6317).
 *
 * Before the fix, collectNeighborSummaries resolved neighbor skill paths via a
 * flat lookup: path.join(repoRoot, "skills", name, "SKILL.md"). This always
 * missed skills stored in the nested sibling layout used by the canonical
 * library: ../skills/skills/<category>/<name>/SKILL.md. The code then did
 * `if (!fs.existsSync(...)) continue;` — silently dropping every neighbour,
 * degrading the relation-dimension grader context without any error.
 *
 * The fix mirrors SH-6129: use resolveSkillRoots + collectSkillFiles to build
 * a name → SKILL.md index that walks the configured skill roots recursively,
 * then look up each neighbour by name.
 *
 * This test asserts that a skill with relations produces NON-EMPTY
 * neighborSummaries when the neighbour SKILL.md lives under a nested sub-dir
 * (mimicking the real canonical layout). It also asserts that genuinely
 * missing skills are still skipped cleanly.
 */

'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');

// Pull the private function under test. collectContext is the public surface
// that calls collectNeighborSummaries internally, but we need the summaries
// in isolation. We access collectNeighborSummaries by requiring the module and
// calling collectContext, which exposes neighborSummaries in its return value.
const { collectContext } = require('../lib/audit-prompt-builder');

// ── Helpers ──────────────────────────────────────────────────────────────────

function fail(msg) {
  process.stderr.write(`FAIL test-collect-neighbor-summaries: ${msg}\n`);
  process.exit(1);
}

function pass(msg) {
  process.stdout.write(`PASS test-collect-neighbor-summaries: ${msg}\n`);
}

function assert(condition, msg) {
  if (!condition) fail(msg);
}

// ── Minimal SKILL.md content helpers ─────────────────────────────────────────

function minimalSkillMd(name, description) {
  return [
    '---',
    `name: ${name}`,
    `type: capability`,
    `scope: portable`,
    `description: "${description}"`,
    '---',
    '',
    `# ${name}`,
    '',
    'Body text.',
    '',
  ].join('\n');
}

function skillWithRelations(name, relatedName) {
  return [
    '---',
    `name: ${name}`,
    `type: capability`,
    `scope: portable`,
    `description: "A skill that has relations."`,
    `relations:`,
    `  related:`,
    `    - ${relatedName}`,
    '---',
    '',
    `# ${name}`,
    '',
    'Body text with a related skill.',
    '',
  ].join('\n');
}

// ── Fixtures builder ──────────────────────────────────────────────────────────

/**
 * Creates a temporary directory tree that mimics the nested sibling layout:
 *
 *   <tmpDir>/
 *     skill-graph/                    ← fake repoRoot
 *       .skill-graph/
 *         config.json                 ← points skill_roots at ../library/skills
 *       skill-audit-loop/SKILL_AUDIT_LOOP.md (§ Part 2 anchor)        ← stub (required by collectContext)
 *       schemas/
 *         SKILL_METADATA_PROTOCOL_schema.json           ← stub (required by collectContext)
 *       scripts/
 *         export-skill.js             ← stub (controls exportTransformAvailable)
 *     library/
 *       skills/
 *         <category>/
 *           <skillName>/
 *             SKILL.md                ← the neighbor skill lives here
 *
 * The audited skill lives in <skillDir> which is always a flat dir the caller
 * provides separately.
 */
function createFixtures() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-neighbor-'));

  const repoRoot = path.join(tmpDir, 'skill-graph');
  fs.mkdirSync(path.join(repoRoot, '.skill-graph'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'schemas'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });

  // Stub files collectContext reads unconditionally. The per-skill checklist lives in
  // skill-audit-loop/SKILL_AUDIT_LOOP.md § Part 2 (SH-6652 — the path was a glued-anchor
  // bogus filename before). Provide the real path with a Part 2 anchor so the section
  // extraction has something to slice.
  fs.mkdirSync(path.join(repoRoot, 'skill-audit-loop'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'skill-audit-loop', 'SKILL_AUDIT_LOOP.md'),
    '# Part 1 — Overview\n\nstub\n\n# Part 2 — Per-Skill Audit Checklist\n\nstub checklist content\n\n# Part 3 — Runbook\n\nstub\n'
  );
  fs.writeFileSync(
    path.join(repoRoot, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json'),
    '{}'
  );
  // scripts/export-skill.js stub (controls exportTransformAvailable flag).
  fs.writeFileSync(
    path.join(repoRoot, 'scripts', 'export-skill.js'),
    "'use strict';\n"
  );

  // Sibling library layout: library/skills/<category>/<name>/SKILL.md
  const librarySkillsRoot = path.join(tmpDir, 'library', 'skills');

  // Config pointing skill_roots at the sibling library.
  // skill_roots is top-level since the 2026-05-27 config flatten.
  const config = {
    skill_roots: [path.relative(repoRoot, librarySkillsRoot)],
  };
  fs.writeFileSync(
    path.join(repoRoot, '.skill-graph', 'config.json'),
    JSON.stringify(config, null, 2)
  );

  return { tmpDir, repoRoot, librarySkillsRoot };
}

function cleanup(tmpDir) {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) { /* best-effort */ }
}

// ── Test 1: nested sibling layout produces non-empty neighborSummaries ────────

(function testNestedLayoutProducesNonEmptyNeighborSummaries() {
  const { tmpDir, repoRoot, librarySkillsRoot } = createFixtures();
  try {
    const neighborName  = 'helper-skill';
    const neighborCat   = 'foundations';
    const auditedName   = 'audited-skill';

    // Place the neighbour in the nested category sub-dir.
    const neighborDir = path.join(librarySkillsRoot, neighborCat, neighborName);
    fs.mkdirSync(neighborDir, { recursive: true });
    fs.writeFileSync(
      path.join(neighborDir, 'SKILL.md'),
      minimalSkillMd(neighborName, 'Neighbour skill for testing.')
    );

    // Place the audited skill in a flat dir (replicates how skill-audit.js
    // passes skillDir — it's an absolute path derived from the caller's cwd).
    const auditedDir = path.join(tmpDir, 'audited', auditedName);
    fs.mkdirSync(auditedDir, { recursive: true });
    fs.writeFileSync(
      path.join(auditedDir, 'SKILL.md'),
      skillWithRelations(auditedName, neighborName)
    );

    const ctx = collectContext({ skillDir: auditedDir, repoRoot });

    assert(
      Array.isArray(ctx.neighborSummaries),
      'neighborSummaries should be an array'
    );
    assert(
      ctx.neighborSummaries.length > 0,
      `neighborSummaries should be non-empty; got ${ctx.neighborSummaries.length} entries. ` +
      'This is the SH-6317 regression: the flat path.join(repoRoot, "skills", name) ' +
      'lookup misses nested siblings and silently returns [].'
    );

    const summary = ctx.neighborSummaries[0];
    assert(
      summary.name === neighborName,
      `expected neighbor name "${neighborName}", got "${summary.name}"`
    );
    assert(
      typeof summary.description === 'string' && summary.description.length > 0,
      'neighbor summary should have a non-empty description'
    );
    assert(
      Array.isArray(summary.relatedVia) && summary.relatedVia.includes('related'),
      `relatedVia should include "related"; got ${JSON.stringify(summary.relatedVia)}`
    );

    pass('nested sibling layout produces non-empty neighborSummaries (SH-6317 fix verified)');
  } finally {
    cleanup(tmpDir);
  }
})();

// ── Test 2: genuinely missing neighbor is still skipped cleanly ───────────────

(function testMissingNeighborSkippedCleanly() {
  const { tmpDir, repoRoot } = createFixtures();
  try {
    const auditedName = 'audited-skill-2';

    // Skill references a neighbour that does not exist anywhere.
    const auditedDir = path.join(tmpDir, 'audited', auditedName);
    fs.mkdirSync(auditedDir, { recursive: true });
    fs.writeFileSync(
      path.join(auditedDir, 'SKILL.md'),
      skillWithRelations(auditedName, 'non-existent-skill')
    );

    const ctx = collectContext({ skillDir: auditedDir, repoRoot });

    assert(
      Array.isArray(ctx.neighborSummaries),
      'neighborSummaries should still be an array when neighbor is missing'
    );
    assert(
      ctx.neighborSummaries.length === 0,
      `genuinely missing neighbor should produce [] (got ${ctx.neighborSummaries.length})`
    );

    pass('genuinely missing neighbor is silently skipped (clean-skip contract preserved)');
  } finally {
    cleanup(tmpDir);
  }
})();

// ── Test 3: flat layout (no config) still works ───────────────────────────────

(function testFlatLayoutWithNoConfig() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-neighbor-flat-'));
  try {
    const repoRoot = path.join(tmpDir, 'repo');
    fs.mkdirSync(path.join(repoRoot, 'schemas'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(repoRoot, 'skill-audit-loop'), { recursive: true });
    fs.writeFileSync(path.join(repoRoot, 'skill-audit-loop', 'SKILL_AUDIT_LOOP.md'), '# Part 2 — Per-Skill Audit Checklist\n\nstub\n');
    fs.writeFileSync(path.join(repoRoot, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json'), '{}');
    fs.writeFileSync(path.join(repoRoot, 'scripts', 'export-skill.js'), "'use strict';\n");

    const neighborName = 'flat-neighbor';
    // Flat layout: repoRoot/skills/<name>/SKILL.md (no category sub-dir).
    const flatSkillsRoot = path.join(repoRoot, 'skills', neighborName);
    fs.mkdirSync(flatSkillsRoot, { recursive: true });
    fs.writeFileSync(
      path.join(flatSkillsRoot, 'SKILL.md'),
      minimalSkillMd(neighborName, 'Flat neighbour for testing.')
    );

    const auditedDir = path.join(tmpDir, 'audited-flat');
    fs.mkdirSync(auditedDir, { recursive: true });
    fs.writeFileSync(
      path.join(auditedDir, 'SKILL.md'),
      skillWithRelations('audited-flat-skill', neighborName)
    );

    const ctx = collectContext({ skillDir: auditedDir, repoRoot });

    assert(
      Array.isArray(ctx.neighborSummaries),
      'neighborSummaries should be an array for flat layout'
    );
    assert(
      ctx.neighborSummaries.length > 0,
      `flat layout should still find neighbor; got ${ctx.neighborSummaries.length} entries`
    );

    pass('flat layout (no .skill-graph/config.json) still resolves neighbors correctly');
  } finally {
    cleanup(tmpDir);
  }
})();
