#!/usr/bin/env node
'use strict';

/**
 * grader-output-validator.js
 *
 * Programmatic enforcement of the BARS scoring math, critical-dimension
 * min-gate, and per-dim score arithmetic on grader outputs. The grader
 * prompts in `lib/audit/graders/` and the judge agents in
 * `.claude/agents/{experiment,fusion}-judge.md` describe these rules in
 * natural language; this validator catches the case where a judge model
 * ignores them or computes the total inconsistently.
 *
 * Why this script exists
 * ----------------------
 * Without runner-side validation, the min-gate and BARS math are merely
 * suggestions. A judge that returns total=82 when min_gate_triggered=true
 * would sail through unchecked. This validator either fixes the score
 * (corrective mode) or errors out (strict mode) when the judge's stated
 * arithmetic disagrees with the rules.
 *
 * Supports three output shapes:
 *   - concept-grader-output (0-100 per scored dim across 7 dims)
 *   - experiment-judge output (13 dims, anchored BARS 1-5, 110-pt total, 3 critical dims)
 *   - fusion-judge output (6 dims, anchored BARS 1-7 or 1-5, 100-pt total, 2 critical dims)
 *
 * Usage:
 *   node scripts/skill/grader-output-validator.js --file path/to/verdict.json
 *   node scripts/skill/grader-output-validator.js --file ... --strict
 *   cat verdict.json | node scripts/skill/grader-output-validator.js --stdin
 *   node scripts/skill/grader-output-validator.js --file ... --correct --out fixed.json
 */

const fs = require('fs');
const path = require('path');

// ─── Shape detection ───────────────────────────────────────────────────

function detectShape(data) {
  if (!data || typeof data !== 'object') return 'unknown';

  // Fusion-judge: top-level fusion_id + scores object keyed by candidate label
  if (typeof data.fusion_id === 'string' && data.scores && typeof data.scores === 'object') {
    return 'fusion_judge';
  }

  // Experiment-judge: comparison report doesn't have a single JSON shape;
  // it's mostly markdown. Skip programmatic validation unless wrapped as JSON.
  if (data.experiment_id && Array.isArray(data.dimensions)) {
    return 'experiment_judge';
  }

  // Concept-grader: dimension_scores object
  if (data.dimension_scores && typeof data.dimension_scores === 'object') {
    return 'concept_grader';
  }

  return 'unknown';
}

// ─── Concept-grader validator ─────────────────────────────────────────

const CONCEPT_DIM_WEIGHTS = {
  definition: 1.0,
  mental_model: 1.5,
  purpose: 1.0,
  boundary: 1.5,
  taxonomy: 1.0,
  analogy: 0.5,
  application: 2.0,
};
const CONCEPT_DIMENSION_MAX = 100;
const CONCEPT_PRIMARY_PASS_MIN = 50;
const CONCEPT_SCORE_RATIO_PASS_MIN = 0.7;

function validateConceptGrader(data) {
  const issues = [];
  const dims = data.dimension_scores || {};

  if (data.score_scale !== undefined && data.score_scale !== '0-100') {
    issues.push({ severity: 'error', code: 'invalid_score_scale', value: data.score_scale });
  }
  if (
    data.max_score_per_dimension !== undefined
    && data.max_score_per_dimension !== CONCEPT_DIMENSION_MAX
  ) {
    issues.push({
      severity: 'error',
      code: 'invalid_max_score_per_dimension',
      value: data.max_score_per_dimension,
      expected: CONCEPT_DIMENSION_MAX,
    });
  }

  // Each scored dim must be an integer 0..100; absent non-primary dims are null.
  for (const [dim, val] of Object.entries(dims)) {
    if (val !== null && (!Number.isInteger(val) || val < 0 || val > CONCEPT_DIMENSION_MAX)) {
      issues.push({ severity: 'error', code: 'invalid_dim_value', dim, value: val });
    }
  }

  // Primary dimension must be a real 0..100 score, not null.
  if (data.primary_dimension) {
    const pVal = dims[data.primary_dimension];
    if (pVal === null || pVal === undefined) {
      issues.push({
        severity: 'error',
        code: 'primary_dimension_null',
        primary: data.primary_dimension,
      });
    }
  }

  // Recompute raw_score and weighted_score
  let rawScore = 0;
  let scoredCount = 0;
  let weightedNumer = 0;
  let weightSumScored = 0;
  for (const [dim, val] of Object.entries(dims)) {
    if (typeof val !== 'number') continue;
    rawScore += val;
    scoredCount += 1;
    const w = CONCEPT_DIM_WEIGHTS[dim] || 1.0;
    weightedNumer += val * w;
    weightSumScored += w;
  }
  const maxPossible = CONCEPT_DIMENSION_MAX * scoredCount;
  const scoreRatio = maxPossible ? rawScore / maxPossible : 0;
  const weightedScore = weightSumScored ? weightedNumer / (weightSumScored * CONCEPT_DIMENSION_MAX) : 0;
  const numericScores = Object.values(dims).filter((v) => typeof v === 'number');
  if (
    data.score_scale !== '0-100'
    && numericScores.length > 0
    && numericScores.every((v) => v === 0 || v === 1 || v === 2)
  ) {
    issues.push({
      severity: 'error',
      code: 'legacy_concept_scale_suspected',
      detail: 'dimension_scores look like the retired 0/1/2 scale; concept grading now uses 0-100',
    });
  }

  // Compare to stated values
  if (typeof data.raw_score === 'number' && Math.abs(data.raw_score - rawScore) > 0.01) {
    issues.push({
      severity: 'error',
      code: 'raw_score_mismatch',
      stated: data.raw_score,
      computed: rawScore,
    });
  }
  if (typeof data.max_raw_score === 'number' && Math.abs(data.max_raw_score - maxPossible) > 0.01) {
    issues.push({
      severity: 'error',
      code: 'max_raw_score_mismatch',
      stated: data.max_raw_score,
      computed: maxPossible,
    });
  }
  if (typeof data.weighted_score === 'number' && Math.abs(data.weighted_score - weightedScore) > 0.005) {
    issues.push({
      severity: 'error',
      code: 'weighted_score_mismatch',
      stated: data.weighted_score,
      computed: round(weightedScore, 4),
    });
  }
  if (typeof data.score_ratio === 'number' && Math.abs(data.score_ratio - scoreRatio) > 0.01) {
    issues.push({
      severity: 'error',
      code: 'score_ratio_mismatch',
      stated: data.score_ratio,
      computed: round(scoreRatio, 4),
    });
  }

  // passed: primary dim ≥ 50 AND score_ratio ≥ 0.7
  const primaryScore = data.primary_dimension ? dims[data.primary_dimension] : null;
  const computedPassed = typeof primaryScore === 'number'
    && primaryScore >= CONCEPT_PRIMARY_PASS_MIN
    && scoreRatio >= CONCEPT_SCORE_RATIO_PASS_MIN;
  if (typeof data.passed === 'boolean' && data.passed !== computedPassed) {
    issues.push({
      severity: 'error',
      code: 'passed_mismatch',
      stated: data.passed,
      computed: computedPassed,
    });
  }

  return {
    shape: 'concept_grader',
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
    computed: {
      raw_score: rawScore,
      max_raw_score: maxPossible,
      weighted_score: round(weightedScore, 4),
      score_ratio: round(scoreRatio, 4),
      passed: computedPassed,
      scored_dimensions: scoredCount,
      score_scale: '0-100',
      max_score_per_dimension: CONCEPT_DIMENSION_MAX,
    },
  };
}

// ─── Fusion-judge validator ───────────────────────────────────────────

const FUSION_DIM_CONFIG = {
  correctness: { weight: 25, band: 7, critical: true, gate_below: 4 },
  completeness: { weight: 20, band: 7, critical: false, gate_below: null },
  code_quality: { weight: 20, band: 5, critical: false, gate_below: null },
  test_coverage: { weight: 15, band: 5, critical: false, gate_below: null },
  safety: { weight: 10, band: 5, critical: true, gate_below: 3 },
  elegance: { weight: 10, band: 5, critical: false, gate_below: null },
};
const FUSION_MIN_GATE_CAP = 60;

function validateFusionJudge(data) {
  const issues = [];
  const scores = data.scores || {};
  const candidateValidations = {};

  for (const [label, cand] of Object.entries(scores)) {
    const candIssues = [];
    const bars = cand.bars || null;
    const perDim = cand.per_dim_scores || {};
    let recomputedTotal = 0;
    let minGateTriggered = false;
    let minGateDim = null;

    if (!bars) {
      candIssues.push({ severity: 'warn', code: 'bars_missing', label });
    }

    for (const [dim, cfg] of Object.entries(FUSION_DIM_CONFIG)) {
      let dimScore = null;
      if (bars && typeof bars[dim] === 'number') {
        const band = bars[dim];
        if (band < 1 || band > cfg.band) {
          candIssues.push({
            severity: 'error',
            code: 'bars_out_of_range',
            label,
            dim,
            band,
            allowed: `1..${cfg.band}`,
          });
        }
        dimScore = (band * cfg.weight) / cfg.band;

        // Compare to stated per_dim score
        const stated = perDim[dim];
        if (typeof stated === 'number' && Math.abs(stated - dimScore) > 0.05) {
          candIssues.push({
            severity: 'error',
            code: 'per_dim_mismatch',
            label,
            dim,
            stated,
            computed: round(dimScore, 4),
            formula: `${band} * (${cfg.weight}/${cfg.band})`,
          });
        }

        // Min-gate check
        if (cfg.critical && band < cfg.gate_below) {
          if (!minGateTriggered) {
            minGateTriggered = true;
            minGateDim = dim;
          }
        }
      } else if (typeof perDim[dim] === 'number') {
        dimScore = perDim[dim];
      } else {
        candIssues.push({
          severity: 'error',
          code: 'dim_score_missing',
          label,
          dim,
        });
      }
      if (typeof dimScore === 'number') recomputedTotal += dimScore;
    }

    const cappedTotal = minGateTriggered ? Math.min(recomputedTotal, FUSION_MIN_GATE_CAP) : recomputedTotal;

    // raw_total check
    if (typeof cand.raw_total === 'number' && Math.abs(cand.raw_total - recomputedTotal) > 0.1) {
      candIssues.push({
        severity: 'error',
        code: 'raw_total_mismatch',
        label,
        stated: cand.raw_total,
        computed: round(recomputedTotal, 4),
      });
    }
    // total check
    if (typeof cand.total === 'number' && Math.abs(cand.total - cappedTotal) > 0.1) {
      candIssues.push({
        severity: 'error',
        code: 'total_after_gate_mismatch',
        label,
        stated: cand.total,
        computed: round(cappedTotal, 4),
        min_gate_triggered: minGateTriggered,
        min_gate_dim: minGateDim,
      });
    }
    // min_gate flag check
    if (cand.min_gate_triggered !== undefined && cand.min_gate_triggered !== minGateTriggered) {
      candIssues.push({
        severity: 'error',
        code: 'min_gate_flag_mismatch',
        label,
        stated: cand.min_gate_triggered,
        computed: minGateTriggered,
        computed_dim: minGateDim,
      });
    }

    candidateValidations[label] = {
      computed_raw_total: round(recomputedTotal, 4),
      computed_total: round(cappedTotal, 4),
      computed_min_gate_triggered: minGateTriggered,
      computed_min_gate_dim: minGateDim,
      issues: candIssues,
    };
    issues.push(...candIssues);
  }

  return {
    shape: 'fusion_judge',
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
    candidates: candidateValidations,
  };
}

// ─── Experiment-judge validator ───────────────────────────────────────

const EXPERIMENT_DIM_CONFIG = {
  data_integrity: { weight: 15, band: 5, critical: true, gate_below: 3 },
  visual_hierarchy: { weight: 12, band: 5, critical: true, gate_below: 3 },
  typography: { weight: 8, band: 5, critical: false, gate_below: null },
  spacing: { weight: 8, band: 5, critical: false, gate_below: null },
  color: { weight: 8, band: 5, critical: false, gate_below: null },
  surfaces_depth: { weight: 8, band: 5, critical: false, gate_below: null },
  interactive_states: { weight: 8, band: 5, critical: false, gate_below: null },
  dark_mode: { weight: 8, band: 5, critical: false, gate_below: null },
  responsive: { weight: 8, band: 5, critical: false, gate_below: null },
  accessibility: { weight: 8, band: 5, critical: true, gate_below: 3 },
  loading_empty_error: { weight: 5, band: 5, critical: false, gate_below: null },
  overall_craft: { weight: 4, band: 5, critical: false, gate_below: null },
  journey_quality: { weight: 10, band: 5, critical: false, gate_below: null },
};
const EXPERIMENT_MIN_GATE_CAP = 60;

function validateExperimentJudge(data) {
  // Experiment-judge output is markdown-heavy; we only validate if a JSON-shaped
  // payload is provided. The function exists primarily so that a future
  // structured-output mode plugs in cleanly.
  const issues = [];
  const dims = data.dimensions || {};
  const phases = ['phase1', 'phase3'];
  const phaseTotals = {};

  for (const phase of phases) {
    let total = 0;
    let minGateTriggered = false;
    let minGateDim = null;
    for (const [dim, cfg] of Object.entries(EXPERIMENT_DIM_CONFIG)) {
      const phaseData = dims[dim] && dims[dim][phase];
      if (!phaseData || typeof phaseData.bars !== 'number') {
        issues.push({ severity: 'warn', code: 'phase_dim_missing', phase, dim });
        continue;
      }
      const band = phaseData.bars;
      if (band < 1 || band > cfg.band) {
        issues.push({
          severity: 'error',
          code: 'bars_out_of_range',
          phase,
          dim,
          band,
          allowed: `1..${cfg.band}`,
        });
      }
      const computed = (band * cfg.weight) / cfg.band;
      if (typeof phaseData.score === 'number' && Math.abs(phaseData.score - computed) > 0.1) {
        issues.push({
          severity: 'error',
          code: 'per_dim_mismatch',
          phase,
          dim,
          stated: phaseData.score,
          computed: round(computed, 4),
        });
      }
      total += computed;
      if (cfg.critical && band < cfg.gate_below) {
        if (!minGateTriggered) {
          minGateTriggered = true;
          minGateDim = dim;
        }
      }
    }
    const cappedTotal = minGateTriggered ? Math.min(total, EXPERIMENT_MIN_GATE_CAP) : total;
    phaseTotals[phase] = {
      raw_total: round(total, 4),
      final_total: round(cappedTotal, 4),
      min_gate_triggered: minGateTriggered,
      min_gate_dim: minGateDim,
    };
  }

  return {
    shape: 'experiment_judge',
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
    phase_totals: phaseTotals,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────

function round(x, places) {
  if (x == null || !Number.isFinite(x)) return null;
  const f = 10 ** places;
  return Math.round(x * f) / f;
}

function validate(data) {
  const shape = detectShape(data);
  switch (shape) {
    case 'concept_grader': return validateConceptGrader(data);
    case 'fusion_judge': return validateFusionJudge(data);
    case 'experiment_judge': return validateExperimentJudge(data);
    default:
      return {
        shape: 'unknown',
        valid: false,
        issues: [{ severity: 'error', code: 'unknown_shape', detail: 'Could not detect known grader/judge output shape' }],
      };
  }
}

function correct(data, validation) {
  // Apply the validator's recomputed values back onto the data. Used when
  // running with --correct to produce a canonical output even if the judge
  // got the arithmetic wrong.
  const corrected = JSON.parse(JSON.stringify(data));
  if (validation.shape === 'concept_grader' && validation.computed) {
    Object.assign(corrected, {
      raw_score: validation.computed.raw_score,
      max_raw_score: validation.computed.max_raw_score,
      weighted_score: validation.computed.weighted_score,
      score_ratio: validation.computed.score_ratio,
      passed: validation.computed.passed,
      scored_dimensions: validation.computed.scored_dimensions,
      score_scale: validation.computed.score_scale,
      max_score_per_dimension: validation.computed.max_score_per_dimension,
    });
  } else if (validation.shape === 'fusion_judge' && validation.candidates) {
    for (const [label, v] of Object.entries(validation.candidates)) {
      if (!corrected.scores[label]) continue;
      corrected.scores[label].raw_total = v.computed_raw_total;
      corrected.scores[label].total = v.computed_total;
      corrected.scores[label].min_gate_triggered = v.computed_min_gate_triggered;
      corrected.scores[label].min_gate_dimension = v.computed_min_gate_dim;
    }
  }
  return corrected;
}

// ─── CLI ──────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith('--')) continue;
    const key = t.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { args[key] = true; continue; }
    args[key] = next;
    i += 1;
  }
  return args;
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      'Usage: node scripts/skill/grader-output-validator.js --file <path> [--strict] [--correct] [--out <path>]\n' +
      '       cat output.json | node scripts/skill/grader-output-validator.js --stdin\n\n' +
      'Validates: concept grader, experiment-judge, fusion-judge outputs.\n' +
      '  --strict    Exit code 1 if any error-severity issue is found\n' +
      '  --correct   Write corrected JSON (computed totals/passed) to --out or stdout\n'
    );
    process.exit(0);
  }

  let inputText;
  if (args.stdin) {
    inputText = fs.readFileSync(0, 'utf8');
  } else if (args.file) {
    inputText = fs.readFileSync(args.file, 'utf8');
  } else {
    process.stderr.write('grader-output-validator: --file or --stdin required\n');
    process.exit(2);
  }

  let data;
  try {
    data = JSON.parse(inputText);
  } catch (err) {
    process.stderr.write(`grader-output-validator: input is not valid JSON: ${err.message}\n`);
    process.exit(2);
  }

  const result = validate(data);

  if (args.correct) {
    const corrected = correct(data, result);
    const output = JSON.stringify(corrected, null, 2);
    if (args.out) {
      fs.writeFileSync(args.out, output);
      process.stderr.write(`Corrected output written to ${args.out}\n`);
    } else {
      process.stdout.write(output + '\n');
    }
  } else {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  }

  if (args.strict && !result.valid) {
    process.exit(1);
  }
}

module.exports = {
  detectShape,
  validate,
  correct,
  validateConceptGrader,
  validateFusionJudge,
  validateExperimentJudge,
  CONCEPT_DIM_WEIGHTS,
  CONCEPT_DIMENSION_MAX,
  CONCEPT_PRIMARY_PASS_MIN,
  CONCEPT_SCORE_RATIO_PASS_MIN,
  FUSION_DIM_CONFIG,
  EXPERIMENT_DIM_CONFIG,
};
