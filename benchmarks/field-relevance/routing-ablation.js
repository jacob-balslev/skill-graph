#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — P1 Routing Ablation (path-b2, deterministic)
 *
 * WHY: the consumer-map says which fields the router READS; this says which fields
 * actually MOVE routing. Strip a field from every manifest entry, re-run the routing
 * baseline, measure ΔRecall@1. A field whose removal doesn't move Recall is not
 * routing-load-bearing — regardless of whether code references it.
 *
 * This is a leave-one-FIELD-out ablation over the deterministic `routeSkills` path
 * (`skill-graph-route.js`), scored against `evals/retrieval-baseline-v2.json` (64 queries).
 * It is exact (no sampling) for this path. Prediction from scoreSkill: only
 * triggers/keywords/paths can move the score; examples/anti_examples/relations/subject/
 * scope/description should read ΔRecall ≈ 0 (they are not score inputs).
 *
 * INVOCATION: node benchmarks/field-relevance/routing-ablation.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SG = path.resolve(__dirname, '..', '..');
const MANIFEST = path.join(SG, 'skills.manifest.json');
const BASELINE = path.join(SG, 'evals', 'retrieval-baseline-v2.json');
const EVAL = path.join(SG, 'scripts', 'skill-graph-routing-eval.js');
const TMP = path.join(SG, '.skill-graph');

// field -> how to strip it from one manifest skill entry
const ABLATIONS = {
  keywords:      (s) => { if (s.activation) delete s.activation.keywords; },
  triggers:      (s) => { if (s.activation) delete s.activation.triggers; },
  paths:         (s) => { if (s.activation) delete s.activation.paths; },
  examples:      (s) => { if (s.activation) delete s.activation.examples; },
  anti_examples: (s) => { if (s.activation) delete s.activation.anti_examples; },
  relations:     (s) => { delete s.relations; },
  subject:       (s) => { delete s.subject; },
  scope:         (s) => { delete s.scope; },
  description:   (s) => { delete s.description; },
};

function recallAt1(manifestObj, tag) {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });
  const p = path.join(TMP, `_ablation-${tag}.manifest.json`);
  fs.writeFileSync(p, JSON.stringify(manifestObj));
  const outFile = path.join(TMP, `_ablation-${tag}.out.json`);
  // routing-eval exits non-zero when per-skill routing cases FAIL — that is the
  // skill-level verdict, NOT a baseline error. Redirect stdout to a file (shell
  // captures the FULL output regardless of exit code) and `|| true` to ignore exit 1.
  execSync(`node ${JSON.stringify(EVAL)} --manifest ${JSON.stringify(p)} --baseline ${JSON.stringify(BASELINE)} --json > ${JSON.stringify(outFile)} 2>/dev/null || true`);
  const out = fs.readFileSync(outFile, 'utf8');
  fs.unlinkSync(p);
  fs.unlinkSync(outFile);
  const b = JSON.parse(out).baseline;
  return { r1: b.recall_at_1, r3: b.recall_at_3, total: b.total };
}

function main() {
  const base = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const skillsKey = base.skills ? 'skills' : null;
  const getSkills = (m) => (skillsKey ? m[skillsKey] : m);

  const baseR = recallAt1(base, 'none');
  console.log('Field-Relevance P1 — Routing Ablation (path-b2 routeSkills)');
  console.log(`Baseline: Recall@1 ${baseR.r1.toFixed(4)}  Recall@3 ${baseR.r3.toFixed(4)}  (n=${baseR.total})\n`);
  console.log('ABLATED FIELD'.padEnd(16) + 'Recall@1   ΔR@1     Recall@3   ΔR@3    routing-load-bearing?');
  console.log('-'.repeat(78));

  const results = [];
  for (const [field, strip] of Object.entries(ABLATIONS)) {
    const clone = JSON.parse(JSON.stringify(base));
    for (const s of getSkills(clone)) strip(s);
    const r = recallAt1(clone, field);
    const d1 = r.r1 - baseR.r1;
    const d3 = r.r3 - baseR.r3;
    const lb = Math.abs(d1) > 1e-9 || Math.abs(d3) > 1e-9 ? 'YES' : 'no (inert)';
    results.push({ field, r1: r.r1, d1, r3: r.r3, d3, load_bearing: lb !== 'no (inert)' });
    console.log(
      field.padEnd(16) +
      r.r1.toFixed(4).padStart(8) + '  ' +
      (d1 >= 0 ? '+' : '') + d1.toFixed(4).padStart(7) + '  ' +
      r.r3.toFixed(4).padStart(8) + '  ' +
      (d3 >= 0 ? '+' : '') + d3.toFixed(4).padStart(7) + '   ' +
      lb
    );
  }
  console.log('\nLoad-bearing for path-b2 routing: ' +
    (results.filter(r => r.load_bearing).map(r => r.field).join(', ') || 'none'));
  console.log('Inert (router does NOT route on them): ' +
    results.filter(r => !r.load_bearing).map(r => r.field).join(', '));

  fs.writeFileSync(path.join(__dirname, 'p1-routing-ablation.json'),
    JSON.stringify({ generated_for: 'field-relevance-benchmark/P1-routing-ablation',
      path: 'b2-routeSkills', baseline: baseR, results }, null, 2) + '\n');
}

main();
