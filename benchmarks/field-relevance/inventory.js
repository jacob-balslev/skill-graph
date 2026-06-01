#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — P0.5 Fresh Corpus Inventory
 *
 * WHY THIS EXISTS: the field-relevance benchmark (docs/plans field-relevance plan)
 * must not be calibrated on stale static-analysis priors. An earlier Explore pass
 * reported `taxonomy_domain` on 1 skill and `portability` on 1 skill; a parse of the
 * nested `metadata:` encoding shows 137 and 94. The discrepancy was a grep that only
 * matched top-level keys and missed the Agent-Skills nested `metadata:` block. This
 * script re-derives every per-field population count from a REAL frontmatter parse
 * (normalizeFrontmatter reconciles the flat + nested encodings) so no benchmark phase
 * inherits a wrong number.
 *
 * OUTPUT per schema-defined field:
 *   populated   — how many SKILL.md set the field (non-empty)
 *   distinct    — number of distinct values (relations/objects counted as present/absent)
 *   constant    — populated on >0 skills but only ONE distinct value (zero corpus information)
 *   coverage    — populated / total
 *   state       — UNPOPULATED (<5%) | INVARIANT (constant) | VARYING
 *
 * CONSUMED BY: P1 free-screens (coverage gate), P5 scorecard (coverage% + state columns).
 * INVOCATION:  node benchmarks/field-relevance/inventory.js [--json] [--skills <dir>]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('../../scripts/lib/parse-frontmatter');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const skillsDirArg = args[args.indexOf('--skills') + 1];
const SKILLS_DIR = skillsDirArg && !skillsDirArg.startsWith('--')
  ? path.resolve(skillsDirArg)
  : path.resolve(__dirname, '..', '..', '..', 'skills', 'skills');

const SCHEMA_PATH = path.resolve(__dirname, '..', '..', 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');

// ── Collect SKILL.md files ────────────────────────────────────────────────
function walk(dir, acc) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name === 'SKILL.md') acc.push(p);
  }
  return acc;
}

// ── Stable stringify for distinct-value counting ──────────────────────────
function valueKey(v) {
  if (v === undefined || v === null) return undefined;
  if (Array.isArray(v)) return v.length ? 'ARR:' + JSON.stringify(v) : undefined; // empty array = unpopulated
  if (typeof v === 'object') return Object.keys(v).length ? 'OBJ:' + JSON.stringify(v) : undefined;
  if (typeof v === 'string') return v.trim() === '' ? undefined : 'STR:' + v.trim();
  return 'VAL:' + String(v);
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const fields = Object.keys(schema.properties);
  const required = new Set(schema.required || []);

  const files = walk(SKILLS_DIR, []);
  const stats = {}; // field -> { populated, values:Set }
  for (const f of fields) stats[f] = { populated: 0, values: new Set() };

  let parseFailures = 0;
  for (const file of files) {
    let fm;
    try {
      const raw = fs.readFileSync(file, 'utf8');
      fm = normalizeFrontmatter(parseFrontmatter(raw));
    } catch (e) {
      parseFailures++;
      continue;
    }
    for (const f of fields) {
      const k = valueKey(fm[f]);
      if (k !== undefined) {
        stats[f].populated++;
        stats[f].values.add(k);
      }
    }
  }

  const total = files.length;
  const rows = fields.map((f) => {
    const distinct = stats[f].values.size;
    const populated = stats[f].populated;
    const coverage = total ? populated / total : 0;
    let state;
    if (populated === 0) state = 'UNPOPULATED';
    else if (coverage < 0.05) state = 'UNPOPULATED';
    else if (distinct <= 1) state = 'INVARIANT';
    else state = 'VARYING';
    return {
      field: f,
      required: required.has(f),
      populated,
      coverage: +(coverage).toFixed(3),
      distinct,
      state,
    };
  });

  rows.sort((a, b) => b.populated - a.populated || a.field.localeCompare(b.field));

  if (asJson) {
    // Emit a repo-relative path, never an absolute local path — skill-graph
    // Public Release Hygiene bars private filesystem paths from the public repo.
    const SG_ROOT = path.resolve(__dirname, '..', '..');
    const skillsDirRel = path.relative(SG_ROOT, SKILLS_DIR) || SKILLS_DIR;
    process.stdout.write(JSON.stringify({
      generated_for: 'field-relevance-benchmark/P0.5',
      skills_dir: skillsDirRel,
      total_skills: total,
      parse_failures: parseFailures,
      fields: rows,
    }, null, 2) + '\n');
    return;
  }

  console.log(`Field-Relevance P0.5 Inventory — ${total} skills (${parseFailures} parse failures)`);
  console.log(`Source: ${SKILLS_DIR}\n`);
  console.log('FIELD'.padEnd(26) + 'REQ  POP   COV    DIST  STATE');
  console.log('-'.repeat(64));
  for (const r of rows) {
    console.log(
      r.field.padEnd(26) +
      (r.required ? ' *  ' : '    ') +
      String(r.populated).padStart(4) + '  ' +
      (r.coverage * 100).toFixed(0).padStart(4) + '%  ' +
      String(r.distinct).padStart(4) + '  ' +
      r.state
    );
  }
  const unpop = rows.filter((r) => r.state === 'UNPOPULATED').map((r) => r.field);
  const invar = rows.filter((r) => r.state === 'INVARIANT').map((r) => r.field);
  console.log('\nUNPOPULATED (<5%): ' + (unpop.join(', ') || 'none'));
  console.log('INVARIANT (constant value): ' + (invar.join(', ') || 'none'));
}

main();
