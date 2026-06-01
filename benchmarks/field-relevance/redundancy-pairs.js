#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — P4 Leave-Two-Out Redundancy (path-b2, deterministic)
 *
 * WHY: single leave-one-out is blind to SUBSTITUTE PAIRS. If two fields carry the
 * same routing signal, ablating EITHER alone reads ~0 (the other covers for it), so
 * a naive single-field ablation would mislabel BOTH as DECORATIVE. Leave-two-out
 * removes the pair together and compares the joint drop against each single drop.
 *
 * INTERPRETATION (Δ = baseline_metric − ablated_metric, so Δ>0 means removal HURT):
 *   - pairΔ ≈ max(singleΔ_a, singleΔ_b)            → NOT substitutes; the larger field owns the signal,
 *                                                     the smaller is redundant-or-inert ON THIS BASELINE.
 *   - pairΔ  >  max(singleΔ_a, singleΔ_b) + ε       → SUBSTITUTE MASKING: joint removal costs more than
 *                                                     either alone ⇒ each field carries unique signal the
 *                                                     other was masking. Neither is DECORATIVE.
 *   - pairΔ ≈ singleΔ_a + singleΔ_b (additive)      → INDEPENDENT contributors (no overlap, no masking).
 *
 * This is exact (no sampling) over the deterministic `routeSkills` path, scored
 * against evals/retrieval-baseline-v2.json. It does NOT prove a field is dead — it
 * only certifies that a DECORATIVE verdict is not hiding a substitute pair. A field
 * unexercised by THIS baseline (e.g. triggers, paths) reads inert here regardless;
 * P2's trigger-aware baseline is what actually exercises those.
 *
 * INVOCATION: node benchmarks/field-relevance/redundancy-pairs.js [--baseline <path>]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SG = path.resolve(__dirname, '..', '..');
const MANIFEST = path.join(SG, 'skills.manifest.json');
const argv = process.argv.slice(2);
const baselineArg = argv[argv.indexOf('--baseline') + 1];
const BASELINE = baselineArg && !baselineArg.startsWith('--')
  ? path.resolve(baselineArg)
  : path.join(SG, 'evals', 'retrieval-baseline-v2.json');
const EVAL = path.join(SG, 'scripts', 'skill-graph-routing-eval.js');
const TMP = path.join(SG, '.skill-graph');

// field -> strip mutator on ONE manifest skill entry (mirrors routing-ablation.js)
const STRIP = {
  keywords:      (s) => { if (s.activation) delete s.activation.keywords; },
  triggers:      (s) => { if (s.activation) delete s.activation.triggers; },
  paths:         (s) => { if (s.activation) delete s.activation.paths; },
  relations:     (s) => { delete s.relations; },
  subject:       (s) => { delete s.subject; },
  // relation sub-edges (broader/narrower live under relations.*)
  'relations.broader':  (s) => { if (s.relations) delete s.relations.broader; },
  'relations.narrower': (s) => { if (s.relations) delete s.relations.narrower; },
  'relations.related':  (s) => { if (s.relations) delete s.relations.related; },
  'relations.boundary': (s) => { if (s.relations) delete s.relations.boundary; },
};

// Pairs to test for substitute-masking (per the plan's overlap candidates).
const PAIRS = [
  ['keywords', 'triggers'],                  // both feed scoreSkill — primary substitute-pair candidate
  ['relations.related', 'relations.broader'],// browse adjacency vs hierarchy expansion (Stage 4b)
  ['relations.boundary', 'relations.related'],// exclusion guard vs co-load
  ['keywords', 'paths'],                     // NL-keyword vs file-path activation
];

function recall(manifestObj, tag) {
  if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });
  const p = path.join(TMP, `_redun-${tag}.manifest.json`);
  fs.writeFileSync(p, JSON.stringify(manifestObj));
  const outFile = path.join(TMP, `_redun-${tag}.out.json`);
  execSync(`node ${JSON.stringify(EVAL)} --manifest ${JSON.stringify(p)} --baseline ${JSON.stringify(BASELINE)} --json > ${JSON.stringify(outFile)} 2>/dev/null || true`);
  const out = fs.readFileSync(outFile, 'utf8');
  fs.unlinkSync(p); fs.unlinkSync(outFile);
  const b = JSON.parse(out).baseline;
  return { r1: b.recall_at_1, r3: b.recall_at_3, total: b.total };
}

function ablate(base, fields, tag) {
  const clone = JSON.parse(JSON.stringify(base));
  const skills = clone.skills ? clone.skills : clone;
  for (const s of skills) for (const f of fields) STRIP[f](s);
  return recall(clone, tag);
}

function main() {
  const base = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const baseR = recall(base, 'none');
  const EPS = 1e-9;

  console.log('Field-Relevance P4 — Leave-Two-Out Redundancy (path-b2 routeSkills)');
  console.log(`Baseline: Recall@1 ${baseR.r1.toFixed(4)}  Recall@3 ${baseR.r3.toFixed(4)}  (n=${baseR.total})`);
  console.log(`Baseline file: ${path.relative(SG, BASELINE)}\n`);

  const rows = [];
  for (const [a, b] of PAIRS) {
    const ra = ablate(base, [a], `s-${a}`);
    const rb = ablate(base, [b], `s-${b}`);
    const rab = ablate(base, [a, b], `p-${a}-${b}`);
    const dA = baseR.r1 - ra.r1;       // single-a drop (R@1)
    const dB = baseR.r1 - rb.r1;       // single-b drop
    const dAB = baseR.r1 - rab.r1;     // pair drop
    const dA3 = baseR.r3 - ra.r3, dB3 = baseR.r3 - rb.r3, dAB3 = baseR.r3 - rab.r3;
    const maxSingle = Math.max(dA, dB);
    const additive = dA + dB;
    let verdict;
    if (dAB > maxSingle + 1e-6) verdict = 'SUBSTITUTE-MASKING (joint > either single — each carries unique signal)';
    else if (Math.abs(dAB - additive) < 1e-6 && additive > 1e-6) verdict = 'INDEPENDENT (additive, no overlap)';
    else if (dAB < EPS && maxSingle < EPS) verdict = 'BOTH-INERT on this baseline (unexercised; not a substitute pair)';
    else verdict = `NOT-SUBSTITUTES (larger field "${dA >= dB ? a : b}" owns the signal; other redundant/inert here)`;
    rows.push({ pair: [a, b], single_drop_r1: { [a]: +dA.toFixed(4), [b]: +dB.toFixed(4) },
      pair_drop_r1: +dAB.toFixed(4), single_drop_r3: { [a]: +dA3.toFixed(4), [b]: +dB3.toFixed(4) },
      pair_drop_r3: +dAB3.toFixed(4), verdict });
    console.log(`PAIR  ${a} + ${b}`);
    console.log(`  single ΔR@1:  ${a}=${dA >= 0 ? '+' : ''}${dA.toFixed(4)}   ${b}=${dB >= 0 ? '+' : ''}${dB.toFixed(4)}`);
    console.log(`  pair   ΔR@1:  ${dAB >= 0 ? '+' : ''}${dAB.toFixed(4)}   (single ΔR@3 ${a}=${dA3.toFixed(4)} ${b}=${dB3.toFixed(4)} | pair ΔR@3 ${dAB3.toFixed(4)})`);
    console.log(`  → ${verdict}\n`);
  }

  fs.writeFileSync(path.join(__dirname, 'p4-redundancy-pairs.json'),
    JSON.stringify({ generated_for: 'field-relevance-benchmark/P4-leave-two-out',
      path: 'b2-routeSkills', baseline: baseR, baseline_file: path.relative(SG, BASELINE),
      pairs: rows }, null, 2) + '\n');
  console.log('Wrote p4-redundancy-pairs.json');
}

main();
