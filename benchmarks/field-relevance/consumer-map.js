#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — P1 Consumer-Dependency Map
 *
 * WHY: relevance is adoption-independent. The first intrinsic screen is "does any
 * code path READ this field?" A field no consumer reads can only have human-reader
 * value (which must be argued, not assumed). This is the deterministic, free core of P1.
 *
 * METHOD: for each schema field, grep each consumer file for an ACCESS pattern
 * (`.field`, `'field'`, `"field"`, `field:`) — not a bare word — to filter prose
 * mentions and catch real property access / string-key reads. Output field -> consumers.
 *
 * CAVEAT (reported, not hidden): grep is a strong signal, not a proof of a live read
 * path. Common-word fields (name/version/description/owner/boundary/purpose/scope/paths)
 * are flagged for manual confirmation. The router is annotated from verified facts:
 * scoreSkill scores on triggers/keywords/paths; the full routeSkills pipeline also gates
 * on project/deployment_target/relations/verdicts/eval_state/staleness.
 *
 * INVOCATION: node benchmarks/field-relevance/consumer-map.js [--json]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const asJson = process.argv.includes('--json');
const SG = path.resolve(__dirname, '..', '..');           // skill-graph root
const DEV = path.resolve(SG, '..');                       // Development root
const SCHEMA = path.join(SG, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');

// Consumer set: [label, absolute path, role]
const CONSUMERS = [
  ['injector',  path.join(DEV, 'agent-orchestration', 'hooks', 'skill-injector.py'), 'path-b1 deterministic injector'],
  ['router',    path.join(SG, 'scripts', 'skill-graph-route.js'), 'path-b2 routeSkills'],
  ['manifest',  path.join(SG, 'scripts', 'generate-manifest.js'), 'manifest projection'],
  ['export',    path.join(SG, 'scripts', 'export-marketplace-skills.js'), 'marketplace publication'],
  ['lint',      path.join(SG, 'scripts', 'skill-lint.js'), 'schema/structural lint'],
  ['drift',     path.join(SG, 'scripts', 'skill-graph-drift.js'), 'drift sentinel'],
  ['graph',     path.join(DEV, 'scripts', 'skill', 'skill-graph-builder.js'), 'knowledge-graph edges'],
  ['cgrader',   path.join(SG, 'lib', 'audit', 'graders', 'concept-grader-prompt.md'), 'comprehension grader'],
];

// Common-word fields whose grep hits need manual confirmation (high false-positive risk).
const COMMON_WORDS = new Set([
  'name', 'version', 'description', 'owner', 'boundary', 'purpose', 'scope',
  'paths', 'concept', 'analogy', 'license', 'project', 'repo', 'examples', 'stability',
]);

function refCount(file, field) {
  if (!fs.existsSync(file)) return 0;
  // Access patterns: .field | 'field' | "field" | field: | field= | [field]
  // Escape nothing (field names are [a-z0-9_-]); build an ERE.
  const pat = `([.'"\\[]${field}['"\\]]|[.'"]${field}\\b|\\b${field}['"]?[:=])`;
  try {
    // NOTE: no -r — on a single file, -r makes grep emit "file:count" which breaks parseInt.
    const out = execFileSync('grep', ['-aEc', pat, file], { encoding: 'utf8' }).trim();
    return parseInt(out, 10) || 0;
  } catch (e) {
    return 0; // grep exit 1 = no match
  }
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const fields = Object.keys(schema.properties);

  const rows = fields.map((field) => {
    const consumers = [];
    for (const [label, file] of CONSUMERS) {
      if (refCount(file, field) > 0) consumers.push(label);
    }
    return {
      field,
      consumers,
      consumer_count: consumers.length,
      no_consumer: consumers.length === 0,
      confirm_manually: COMMON_WORDS.has(field),
    };
  });

  rows.sort((a, b) => a.consumer_count - b.consumer_count || a.field.localeCompare(b.field));

  if (asJson) {
    process.stdout.write(JSON.stringify({
      generated_for: 'field-relevance-benchmark/P1-consumer-map',
      consumers: CONSUMERS.map(([l, , role]) => ({ label: l, role })),
      caveat: 'grep access-pattern signal; common-word fields flagged confirm_manually; router scoring fields = triggers/keywords/paths (verified in scoreSkill)',
      fields: rows,
    }, null, 2) + '\n');
    return;
  }

  console.log('Field-Relevance P1 — Consumer-Dependency Map');
  console.log('Consumers: ' + CONSUMERS.map(([l]) => l).join(', ') + '\n');
  console.log('FIELD'.padEnd(24) + 'N  CONSUMERS (⚠=confirm manually)');
  console.log('-'.repeat(70));
  for (const r of rows) {
    const flag = r.confirm_manually ? ' ⚠' : '';
    const tag = r.no_consumer ? 'NO CONSUMER' : r.consumers.join(', ');
    console.log(r.field.padEnd(24) + String(r.consumer_count).padStart(2) + '  ' + tag + flag);
  }
  const dead = rows.filter((r) => r.no_consumer && !r.confirm_manually).map((r) => r.field);
  console.log('\nNO CONSUMER (and not a common-word false-positive risk): ' + (dead.join(', ') || 'none'));
}

main();
