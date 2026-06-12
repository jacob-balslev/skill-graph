#!/usr/bin/env node
'use strict';

/**
 * eval-discriminability-report.js
 *
 * Measures whether the repo's eval grader scores are usefully discriminative
 * or compressed into a narrow band. Reads stored grader history logs and
 * per-skill eval result caches, emits per-dimension descriptive statistics
 * (histogram, mean, sigma, coefficient of variation, ceiling/floor effects),
 * and internal-consistency stats (Cronbach's alpha) across dimensions.
 *
 * Why this script exists
 * ----------------------
 * LLM-as-judge graders systematically cluster scores in narrow bands. Without
 * empirical compression detection, the grader rubric appears to work but loses
 * its ability to discriminate quality. Published evidence:
 *   - DeepSeek-V3 rates >50% of items at score 5 (arXiv 2506.22316)
 *   - Concept-grader scores in this repo cluster 0.7-0.92 weighted, no
 *     observed scores below 0.6 across the sampled corpus
 *   - Baseline -> with-skill deltas typically +0.016 (operationally invisible)
 *
 * This script measures it. See:
 *   docs/plans/eval-weighting-decompression.md
 *   skills/evaluation/references/score-compression-research.md
 *
 * Targets (per Galileo, Cohen, Cronbach research):
 *   - CV >= 0.2  -> usable discrimination
 *   - CV  < 0.1  -> compressed (flag)
 *   - Cronbach alpha >= 0.7 -> acceptable internal consistency
 *   - Ceiling effect > 20% at max score -> flag
 *   - Floor effect  > 20% at min score  -> flag
 *
 * Usage:
 *   node skill-graph/scripts/eval-discriminability-report.js
 *   node skill-graph/scripts/eval-discriminability-report.js --json
 *   node skill-graph/scripts/eval-discriminability-report.js --out /tmp/report.json
 *   node skill-graph/scripts/eval-discriminability-report.js --skill autonomous-loop-patterns
 *   node skill-graph/scripts/eval-discriminability-report.js --strict   # exit 1 if compression detected
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const LOGS_DIR = path.join(REPO_ROOT, 'agent-orchestration', 'logs');
const CACHE_DIR = path.join(REPO_ROOT, '.cache');

const EVAL_HISTORY = path.join(LOGS_DIR, 'eval-history.jsonl');
const COMPREHENSION_HISTORY = path.join(LOGS_DIR, 'comprehension-history.jsonl');
const APPLICATION_HISTORY = path.join(LOGS_DIR, 'application-history.jsonl');

// ─── CLI ───────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (!t.startsWith('--')) { args._.push(t); continue; }
    const key = t.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { args[key] = true; continue; }
    args[key] = next;
    i += 1;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const wantJson = !!args.json;
const outFile = args.out || null;
const skillFilter = args.skill || null;
const strict = !!args.strict;
const showHelp = !!args.help || !!args.h;

if (showHelp) {
  process.stdout.write(
    'Usage: node skill-graph/scripts/eval-discriminability-report.js [options]\n\n' +
    'Options:\n' +
    '  --skill <name>   Filter to a single skill\n' +
    '  --json           Emit JSON only (no text summary)\n' +
    '  --out <path>     Write JSON report to file\n' +
    '  --strict         Exit code 1 if any dimension is flagged as compressed\n' +
    '  --help           Show this help\n'
  );
  process.exit(0);
}

// ─── Stats primitives ──────────────────────────────────────────────────

function mean(xs) {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function variance(xs, mu) {
  if (xs.length < 2) return null;
  const m = mu !== undefined ? mu : mean(xs);
  let s = 0;
  for (const x of xs) {
    const d = x - m;
    s += d * d;
  }
  return s / (xs.length - 1); // sample variance (n-1)
}

function stddev(xs) {
  const v = variance(xs);
  return v == null ? null : Math.sqrt(v);
}

function coefficientOfVariation(xs) {
  const m = mean(xs);
  const s = stddev(xs);
  if (m == null || s == null) return null;
  if (m === 0) return null; // CV undefined when mean is zero
  return Math.abs(s / m);
}

function histogram(xs, bins) {
  // bins: sorted array of bin edges; values fall into the bin where x === edge,
  // or for continuous data, into bin i where bins[i] <= x < bins[i+1]
  if (bins.every((b) => Number.isInteger(b))) {
    const counts = Object.fromEntries(bins.map((b) => [b, 0]));
    for (const x of xs) {
      if (counts[x] !== undefined) counts[x] += 1;
    }
    return counts;
  }
  // continuous case (e.g. weighted scores 0..1)
  const counts = bins.slice(0, -1).map(() => 0);
  for (const x of xs) {
    for (let i = 0; i < bins.length - 1; i += 1) {
      if (x >= bins[i] && (i === bins.length - 2 ? x <= bins[i + 1] : x < bins[i + 1])) {
        counts[i] += 1;
        break;
      }
    }
  }
  return bins.slice(0, -1).map((edge, i) => ({ bin: `${edge}-${bins[i + 1]}`, count: counts[i] }));
}

// Cronbach's alpha across N dimensions for a set of items.
// items: array of objects keyed by dimension; each value numeric.
// k = number of dimensions; alpha = (k/(k-1)) * (1 - sum(var_i) / var_total)
//
// In this repo the concept grader correctly returns null for unaddressed
// dimensions, which means complete-case Cronbach is almost never computable.
// This function survives for the rare cases where the data IS complete, but
// the primary reliability signal in the report is now the pairwise Spearman
// matrix (see spearmanMatrix below) which handles missing data naturally.
function cronbachAlpha(items, dimensions) {
  const k = dimensions.length;
  if (k < 2) return null;
  // Filter items that have a score on every dimension (Cronbach requires complete cases).
  const completeRows = items
    .map((it) => dimensions.map((d) => (typeof it[d] === 'number' ? it[d] : null)))
    .filter((row) => row.every((v) => v !== null));
  if (completeRows.length < 2) return null;
  // var per dimension
  const perDimVar = [];
  for (let i = 0; i < k; i += 1) {
    const col = completeRows.map((r) => r[i]);
    const v = variance(col);
    if (v == null) return null;
    perDimVar.push(v);
  }
  // var of total score per item
  const totals = completeRows.map((r) => r.reduce((a, b) => a + b, 0));
  const varTotal = variance(totals);
  if (varTotal == null || varTotal === 0) return null;
  const sumVar = perDimVar.reduce((a, b) => a + b, 0);
  return (k / (k - 1)) * (1 - sumVar / varTotal);
}

// Spearman rank correlation between two arrays. Handles ties via fractional
// ranking. Returns null when n < 3 or either column has zero variance.
function spearmanCorrelation(xs, ys) {
  if (xs.length !== ys.length || xs.length < 3) return null;
  function rank(arr) {
    const indexed = arr.map((value, index) => ({ value, index }));
    indexed.sort((a, b) => a.value - b.value);
    const ranks = new Array(arr.length);
    let i = 0;
    while (i < indexed.length) {
      let j = i;
      while (j + 1 < indexed.length && indexed[j + 1].value === indexed[i].value) j += 1;
      const avgRank = (i + j) / 2 + 1; // 1-based fractional rank
      for (let k = i; k <= j; k += 1) ranks[indexed[k].index] = avgRank;
      i = j + 1;
    }
    return ranks;
  }
  const rx = rank(xs);
  const ry = rank(ys);
  const meanRx = rx.reduce((a, b) => a + b, 0) / rx.length;
  const meanRy = ry.reduce((a, b) => a + b, 0) / ry.length;
  let num = 0; let dxs = 0; let dys = 0;
  for (let i = 0; i < rx.length; i += 1) {
    const a = rx[i] - meanRx;
    const b = ry[i] - meanRy;
    num += a * b;
    dxs += a * a;
    dys += b * b;
  }
  if (dxs === 0 || dys === 0) return null;
  return num / Math.sqrt(dxs * dys);
}

// Pairwise Spearman correlation matrix across all dim pairs. For each pair,
// uses only the rows where both dims have numeric scores (pairwise deletion).
// Yields a per-dim "mean off-diagonal correlation" — a reliability proxy that
// degrades gracefully when most cells are null, unlike Cronbach which needs
// fully complete cases.
function spearmanMatrix(items, dimensions) {
  const matrix = {};
  const pairCounts = {};
  for (const d1 of dimensions) {
    matrix[d1] = {};
    pairCounts[d1] = {};
    for (const d2 of dimensions) {
      if (d1 === d2) {
        matrix[d1][d2] = 1;
        pairCounts[d1][d2] = items.length;
        continue;
      }
      const xs = [];
      const ys = [];
      for (const it of items) {
        if (typeof it[d1] === 'number' && typeof it[d2] === 'number') {
          xs.push(it[d1]); ys.push(it[d2]);
        }
      }
      pairCounts[d1][d2] = xs.length;
      matrix[d1][d2] = spearmanCorrelation(xs, ys);
    }
  }
  // Per-dim mean off-diagonal correlation (excluding nulls)
  const dimMeans = {};
  for (const d1 of dimensions) {
    const vals = dimensions
      .filter((d2) => d2 !== d1)
      .map((d2) => matrix[d1][d2])
      .filter((v) => typeof v === 'number');
    dimMeans[d1] = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }
  // Overall mean off-diagonal correlation
  const allOffDiag = [];
  for (const d1 of dimensions) {
    for (const d2 of dimensions) {
      if (d1 < d2 && typeof matrix[d1][d2] === 'number') allOffDiag.push(matrix[d1][d2]);
    }
  }
  const overallMean = allOffDiag.length > 0
    ? allOffDiag.reduce((a, b) => a + b, 0) / allOffDiag.length
    : null;
  return { matrix, pairCounts, dimMeans, overallMean, offDiagonalSampleCount: allOffDiag.length };
}

// Bootstrap 95% confidence interval on a statistic (default: mean) by
// resampling with replacement. Default 1000 iterations. Returns null when
// n < 5 (CI is meaningless on tiny samples).
function bootstrapMeanCi(xs, iterations = 1000, alpha = 0.05) {
  if (!Array.isArray(xs) || xs.length < 5) return null;
  const n = xs.length;
  const samples = [];
  for (let i = 0; i < iterations; i += 1) {
    let sum = 0;
    for (let j = 0; j < n; j += 1) {
      sum += xs[Math.floor(Math.random() * n)];
    }
    samples.push(sum / n);
  }
  samples.sort((a, b) => a - b);
  const lower = samples[Math.floor((alpha / 2) * iterations)];
  const upper = samples[Math.floor((1 - alpha / 2) * iterations) - 1];
  return { lower, upper, iterations, confidence: 1 - alpha };
}

function ratio(numerator, denominator) {
  if (!denominator) return 0;
  return numerator / denominator;
}

// ─── Compression flags ─────────────────────────────────────────────────

function flagCompression({ cv, ceilingRatio, floorRatio }) {
  const flags = [];
  if (cv != null && cv < 0.1) flags.push(`CV ${cv.toFixed(3)} < 0.1 (compressed)`);
  if (ceilingRatio != null && ceilingRatio > 0.2) flags.push(`ceiling ${(ceilingRatio * 100).toFixed(0)}% > 20%`);
  if (floorRatio != null && floorRatio > 0.2) flags.push(`floor ${(floorRatio * 100).toFixed(0)}% > 20%`);
  return flags;
}

// ─── Data loaders ──────────────────────────────────────────────────────

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const out = [];
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      /* ignore malformed lines */
    }
  }
  return out;
}

function readCacheFiles() {
  if (!fs.existsSync(CACHE_DIR)) return [];
  const files = fs.readdirSync(CACHE_DIR).filter((f) => /^eval-results-.*\.json$/.test(f));
  return files.map((f) => {
    try {
      return { file: f, data: JSON.parse(fs.readFileSync(path.join(CACHE_DIR, f), 'utf8')) };
    } catch {
      return null;
    }
  }).filter(Boolean);
}

// ─── Analyzers ─────────────────────────────────────────────────────────

const COMPREHENSION_DIMS = [
  'definition', 'mental_model', 'purpose', 'boundary', 'taxonomy', 'analogy', 'application',
];

const APPLICATION_AXES = [
  'flag_correctness', 'fix_correctness', 'false_positive_avoidance', 'primary_signal_clarity',
];

function analyzeCorpus(entries, dimList, valueScale, label, opts = {}) {
  // entries: array of grader records with per-dimension numeric scores (0..100 or weighted 0..1)
  // dimList: list of dimension keys to analyze
  // valueScale: { min, max } for ceiling/floor and histogram bins
  // returns per-dimension stats + cross-dim Cronbach
  const skillScope = opts.skillFilter ? entries.filter((e) => (e.skill_name || e.skill) === opts.skillFilter) : entries;
  if (skillScope.length === 0) {
    return { label, n: 0, perDimension: {}, cronbach_alpha: null, flags: ['no data'] };
  }
  const perDimension = {};
  for (const dim of dimList) {
    const xs = [];
    for (const e of skillScope) {
      const v = opts.extract ? opts.extract(e, dim) : e[dim];
      if (typeof v === 'number') xs.push(v);
    }
    if (xs.length === 0) {
      perDimension[dim] = { n: 0, flags: ['no observations'] };
      continue;
    }
    const mu = mean(xs);
    const sd = stddev(xs);
    const cv = coefficientOfVariation(xs);
    const ceilingCount = xs.filter((x) => x === valueScale.max).length;
    const floorCount = xs.filter((x) => x === valueScale.min).length;
    const ceilingRatio = ratio(ceilingCount, xs.length);
    const floorRatio = ratio(floorCount, xs.length);
    const isInteger = Number.isInteger(valueScale.min) && Number.isInteger(valueScale.max);
    const bins = isInteger
      ? Array.from({ length: valueScale.max - valueScale.min + 1 }, (_, i) => valueScale.min + i)
      : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    perDimension[dim] = {
      n: xs.length,
      mean: round(mu, 4),
      stddev: sd != null ? round(sd, 4) : null,
      coefficient_of_variation: cv != null ? round(cv, 4) : null,
      min: Math.min(...xs),
      max: Math.max(...xs),
      ceiling_count: ceilingCount,
      ceiling_ratio: round(ceilingRatio, 4),
      floor_count: floorCount,
      floor_ratio: round(floorRatio, 4),
      histogram: histogram(xs, bins),
      flags: flagCompression({ cv, ceilingRatio, floorRatio }),
    };
  }
  // Cronbach: build per-row arrays where each row is a single case with all dim scores
  let alpha = null;
  if (opts.itemGrouping) {
    const grouped = opts.itemGrouping(skillScope);
    alpha = cronbachAlpha(grouped, dimList);
  }
  return {
    label,
    n: skillScope.length,
    skill_filter: opts.skillFilter || null,
    perDimension,
    cronbach_alpha: alpha != null ? round(alpha, 4) : null,
    cronbach_alpha_target: 0.7,
    cronbach_alpha_status: alpha == null ? 'unknown' : alpha >= 0.7 ? 'acceptable' : 'low',
  };
}

function round(x, places) {
  if (x == null || !Number.isFinite(x)) return null;
  const f = 10 ** places;
  return Math.round(x * f) / f;
}

// ─── Comprehension grader analysis ─────────────────────────────────────

function analyzeComprehensionHistory(entries, skillFilter) {
  // Each row has dimension + baseline_score, with_skill_score, baseline_weighted, with_skill_weighted, delta_raw, delta_weighted
  // We want: per-dimension distribution of with_skill_weighted, baseline_weighted, and delta_weighted.
  const scoped = skillFilter ? entries.filter((e) => e.skill_name === skillFilter) : entries;
  if (scoped.length === 0) {
    return { n: 0, by_dimension: {}, by_metric: {}, flags: ['no data'] };
  }
  // Group by dimension; compute stats for with_skill_weighted, baseline_weighted, delta_weighted
  const byDim = {};
  const dims = new Set(scoped.map((e) => e.dimension).filter(Boolean));
  for (const dim of dims) {
    const rows = scoped.filter((e) => e.dimension === dim);
    const bxs = rows.map((r) => r.baseline_weighted).filter((v) => typeof v === 'number');
    const wxs = rows.map((r) => r.with_skill_weighted).filter((v) => typeof v === 'number');
    const dxs = rows.map((r) => r.delta_weighted).filter((v) => typeof v === 'number');
    byDim[dim] = {
      n: rows.length,
      with_skill_weighted: descriptive(wxs, { min: 0, max: 1 }),
      baseline_weighted: descriptive(bxs, { min: 0, max: 1 }),
      delta_weighted: descriptive(dxs, { min: -1, max: 1 }),
    };
  }
  // Overall (across all dimensions)
  const overallWeighted = scoped.map((e) => e.with_skill_weighted).filter((v) => typeof v === 'number');
  const overallDelta = scoped.map((e) => e.delta_weighted).filter((v) => typeof v === 'number');
  return {
    n: scoped.length,
    skill_filter: skillFilter || null,
    by_dimension: byDim,
    overall: {
      with_skill_weighted: descriptive(overallWeighted, { min: 0, max: 1 }),
      delta_weighted: descriptive(overallDelta, { min: -1, max: 1 }),
    },
  };
}

function descriptive(xs, scale) {
  if (xs.length === 0) return { n: 0, flags: ['no observations'] };
  const mu = mean(xs);
  const sd = stddev(xs);
  const cv = coefficientOfVariation(xs);
  // For continuous-valued data, define "ceiling" as values within top 5% of the scale.
  const range = scale.max - scale.min;
  const ceilingThreshold = scale.max - range * 0.05;
  const floorThreshold = scale.min + range * 0.05;
  const ceilingCount = xs.filter((x) => x >= ceilingThreshold).length;
  const floorCount = xs.filter((x) => x <= floorThreshold).length;
  const ceilingRatio = ratio(ceilingCount, xs.length);
  const floorRatio = ratio(floorCount, xs.length);
  return {
    n: xs.length,
    mean: round(mu, 4),
    stddev: sd != null ? round(sd, 4) : null,
    coefficient_of_variation: cv != null ? round(cv, 4) : null,
    min: round(Math.min(...xs), 4),
    max: round(Math.max(...xs), 4),
    ceiling_threshold: round(ceilingThreshold, 4),
    floor_threshold: round(floorThreshold, 4),
    ceiling_count: ceilingCount,
    ceiling_ratio: round(ceilingRatio, 4),
    floor_count: floorCount,
    floor_ratio: round(floorRatio, 4),
    histogram: histogram(xs, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]),
    bootstrap_mean_ci_95: (() => {
      const ci = bootstrapMeanCi(xs, 1000, 0.05);
      return ci ? { lower: round(ci.lower, 4), upper: round(ci.upper, 4), n: xs.length } : null;
    })(),
    flags: flagCompression({ cv, ceilingRatio, floorRatio }),
  };
}

// ─── Per-dimension Cronbach from cache files ──────────────────────────

function analyzeCronbachFromCache(cacheEntries, skillFilter) {
  // Each cache file has results[] with per-case dimension_scores under baseline and with_skill.
  // We compute Cronbach across the 7 dims using with_skill scores, one row per case.
  const rows = [];
  let cacheCount = 0;
  for (const { file, data } of cacheEntries) {
    if (skillFilter && data.skillName !== skillFilter) continue;
    if (!data || data.mode !== 'comprehension' || !Array.isArray(data.results)) continue;
    cacheCount += 1;
    for (const r of data.results) {
      const ws = r.with_skill && r.with_skill.dimension_scores;
      if (!ws) continue;
      const row = {};
      for (const dim of COMPREHENSION_DIMS) {
        const v = ws[dim];
        // Use 0..100 directly. Drop nulls — Cronbach requires complete cases per dim.
        if (typeof v === 'number') row[dim] = v;
      }
      rows.push(row);
    }
  }
  const alpha = cronbachAlpha(rows, COMPREHENSION_DIMS);
  // Pairwise Spearman: graceful with missing data, primary reliability signal.
  const spearman = spearmanMatrix(rows, COMPREHENSION_DIMS);
  return {
    cache_files_used: cacheCount,
    complete_cases: rows.filter((r) => COMPREHENSION_DIMS.every((d) => typeof r[d] === 'number')).length,
    total_cases: rows.length,
    cronbach_alpha: alpha != null ? round(alpha, 4) : null,
    cronbach_alpha_target: 0.7,
    cronbach_alpha_status: alpha == null ? 'unknown' : alpha >= 0.7 ? 'acceptable' : 'low',
    cronbach_notes: 'Cronbach requires items with scores on ALL dimensions; null dimensions exclude that row. The concept grader correctly uses null for unaddressed dimensions, so Cronbach is usually insufficient-data — the Spearman matrix below is the primary reliability signal.',
    spearman: {
      overall_mean_off_diagonal: spearman.overallMean != null ? round(spearman.overallMean, 4) : null,
      off_diagonal_sample_count: spearman.offDiagonalSampleCount,
      per_dim_mean_off_diagonal: Object.fromEntries(
        Object.entries(spearman.dimMeans).map(([d, v]) => [d, v != null ? round(v, 4) : null]),
      ),
      matrix: Object.fromEntries(
        Object.entries(spearman.matrix).map(([d1, row]) => [
          d1,
          Object.fromEntries(Object.entries(row).map(([d2, v]) => [d2, v != null ? round(v, 4) : null])),
        ]),
      ),
      pair_counts: spearman.pairCounts,
      notes: 'Pairwise Spearman with pairwise-deletion of missing data. Per-dim mean off-diagonal correlation is the per-dim reliability proxy: values near 1.0 imply the dimension is redundant with the others; values near 0 imply orthogonal. A healthy grader has 0.3-0.7 mean off-diagonal correlation — dims should correlate (measuring related concepts) but not collapse (each adds signal).',
    },
  };
}

// ─── Eval history (A/B) ────────────────────────────────────────────────

function analyzeEvalHistory(entries, skillFilter) {
  const scoped = skillFilter ? entries.filter((e) => e.skill === skillFilter || e.skill_name === skillFilter) : entries;
  if (scoped.length === 0) return { n: 0, flags: ['no data'] };
  const scores = scoped.map((e) => e.score).filter((v) => typeof v === 'number');
  const baselineScores = scoped.map((e) => e.baseline_score).filter((v) => typeof v === 'number');
  const passes = scoped.filter((e) => e.passed === true).length;
  const baselinePasses = scoped.filter((e) => e.baseline_passed === true).length;
  // failure_category histogram
  const categoryCounts = {};
  for (const e of scoped) {
    const cat = e.failure_category || 'unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  return {
    n: scoped.length,
    skill_filter: skillFilter || null,
    pass_rate: round(passes / scoped.length, 4),
    baseline_pass_rate: round(baselinePasses / scoped.length, 4),
    score_descriptive: descriptive(scores, { min: 0, max: 1 }),
    baseline_score_descriptive: descriptive(baselineScores, { min: 0, max: 1 }),
    failure_categories: categoryCounts,
  };
}

// ─── Run ───────────────────────────────────────────────────────────────

const comprehensionEntries = readJsonl(COMPREHENSION_HISTORY);
const evalEntries = readJsonl(EVAL_HISTORY);
const applicationEntries = readJsonl(APPLICATION_HISTORY);
const cacheEntries = readCacheFiles();

const report = {
  generated_at: new Date().toISOString(),
  skill_filter: skillFilter,
  sources: {
    eval_history: { path: path.relative(REPO_ROOT, EVAL_HISTORY), entries: evalEntries.length },
    comprehension_history: { path: path.relative(REPO_ROOT, COMPREHENSION_HISTORY), entries: comprehensionEntries.length },
    application_history: { path: path.relative(REPO_ROOT, APPLICATION_HISTORY), entries: applicationEntries.length },
    cache_files: { dir: path.relative(REPO_ROOT, CACHE_DIR), count: cacheEntries.length },
  },
  targets: {
    coefficient_of_variation_min: 0.2,
    coefficient_of_variation_compressed: 0.1,
    cronbach_alpha_acceptable: 0.7,
    ceiling_effect_threshold: 0.2,
    floor_effect_threshold: 0.2,
  },
  eval_history_analysis: analyzeEvalHistory(evalEntries, skillFilter),
  comprehension_analysis: analyzeComprehensionHistory(comprehensionEntries, skillFilter),
  comprehension_cronbach: analyzeCronbachFromCache(cacheEntries, skillFilter),
  application_analysis: applicationEntries.length > 0
    ? analyzeComprehensionHistory(applicationEntries, skillFilter) // shape is similar enough for now
    : { n: 0, note: 'application-history.jsonl is empty or missing — application-shape eval layer not yet exercised across the corpus' },
};

// Aggregate flags across the report
const allFlags = [];
function collectFlags(node, pathParts) {
  if (!node) return;
  if (Array.isArray(node.flags) && node.flags.length > 0) {
    for (const f of node.flags) allFlags.push({ where: pathParts.join('.'), flag: f });
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'flags' || k === 'histogram') continue;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      collectFlags(v, [...pathParts, k]);
    }
  }
}
collectFlags(report.comprehension_analysis, ['comprehension']);
collectFlags(report.eval_history_analysis, ['eval_history']);
collectFlags(report.application_analysis, ['application']);

report.compression_flags = allFlags;
report.verdict = allFlags.length === 0
  ? 'no compression detected'
  : `${allFlags.length} compression flag(s) raised — see compression_flags`;

if (outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  process.stderr.write(`Report written to ${outFile}\n`);
}

if (wantJson) {
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
  // Human-readable summary
  const lines = [];
  lines.push('Eval Discriminability Report');
  lines.push('============================');
  lines.push(`Generated:        ${report.generated_at}`);
  lines.push(`Skill filter:     ${skillFilter || '(all)'}`);
  lines.push('');
  lines.push('Sources:');
  lines.push(`  eval-history.jsonl:           ${report.sources.eval_history.entries} entries`);
  lines.push(`  comprehension-history.jsonl:  ${report.sources.comprehension_history.entries} entries`);
  lines.push(`  application-history.jsonl:    ${report.sources.application_history.entries} entries`);
  lines.push(`  .cache/eval-results-*.json:   ${report.sources.cache_files.count} files`);
  lines.push('');
  lines.push('Targets:');
  lines.push(`  CV minimum target:        ${report.targets.coefficient_of_variation_min}`);
  lines.push(`  CV compression threshold: ${report.targets.coefficient_of_variation_compressed}`);
  lines.push(`  Cronbach alpha minimum:   ${report.targets.cronbach_alpha_acceptable}`);
  lines.push(`  Ceiling effect threshold: ${report.targets.ceiling_effect_threshold}`);
  lines.push(`  Floor effect threshold:   ${report.targets.floor_effect_threshold}`);
  lines.push('');

  // A/B history
  const eh = report.eval_history_analysis;
  if (eh && eh.n > 0) {
    lines.push(`A/B Eval History (n=${eh.n})`);
    lines.push(`  with-skill pass rate:   ${eh.pass_rate}`);
    lines.push(`  baseline pass rate:     ${eh.baseline_pass_rate}`);
    lines.push(`  with-skill score mean:  ${eh.score_descriptive.mean} (sigma ${eh.score_descriptive.stddev}, CV ${eh.score_descriptive.coefficient_of_variation})`);
    lines.push(`  baseline score mean:    ${eh.baseline_score_descriptive.mean}`);
    lines.push(`  failure categories:     ${JSON.stringify(eh.failure_categories)}`);
    lines.push('');
  }

  // Comprehension per-dim
  const cm = report.comprehension_analysis;
  if (cm && cm.n > 0) {
    lines.push(`Comprehension Grader History (n=${cm.n} rows, ${Object.keys(cm.by_dimension).length} dimensions)`);
    lines.push('  Per-dimension with_skill_weighted:');
    for (const [dim, stats] of Object.entries(cm.by_dimension)) {
      const ws = stats.with_skill_weighted;
      const cv = ws.coefficient_of_variation == null ? 'n/a' : ws.coefficient_of_variation.toFixed(3);
      const ceil = (ws.ceiling_ratio * 100).toFixed(0);
      const flagStr = ws.flags && ws.flags.length > 0 ? '  ⚑ ' + ws.flags.join('; ') : '';
      lines.push(`    ${dim.padEnd(14)} n=${String(ws.n).padEnd(4)} mean=${(ws.mean ?? 0).toFixed(3)} sigma=${(ws.stddev ?? 0).toFixed(3)} CV=${cv} ceiling=${ceil}%${flagStr}`);
    }
    lines.push('  Overall with_skill_weighted:');
    const o = cm.overall.with_skill_weighted;
    lines.push(`    mean=${o.mean} sigma=${o.stddev} CV=${o.coefficient_of_variation} ceiling=${(o.ceiling_ratio * 100).toFixed(0)}%`);
    const od = cm.overall.delta_weighted;
    lines.push(`  Overall delta_weighted (with_skill - baseline):`);
    lines.push(`    mean=${od.mean} sigma=${od.stddev} (operational invisibility threshold: |delta| < 0.05 means no real lift)`);
    lines.push('');
  }

  // Cronbach + Spearman
  const cron = report.comprehension_cronbach;
  if (cron) {
    lines.push(`Reliability across 7 comprehension dimensions:`);
    lines.push(`  cache files used:  ${cron.cache_files_used}`);
    lines.push(`  total cases:       ${cron.total_cases}`);
    lines.push(`  complete cases:    ${cron.complete_cases} (Cronbach denominator)`);
    lines.push(`  Cronbach alpha:    ${cron.cronbach_alpha ?? '(insufficient complete cases)'}`);
    if (cron.spearman) {
      const sp = cron.spearman;
      lines.push(`  Spearman mean off-diagonal: ${sp.overall_mean_off_diagonal ?? '(no pairs)'} (from ${sp.off_diagonal_sample_count} pair-correlations)`);
      lines.push(`  Interpretation: |rho|>0.85 redundant dims (consider merge); 0.3-0.85 related but distinct; <0.3 orthogonal (OK if intentional).`);
      lines.push(`  Per-dim mean off-diagonal Spearman rho:`);
      for (const [dim, val] of Object.entries(sp.per_dim_mean_off_diagonal)) {
        const v = val == null ? 'n/a' : val.toFixed(3);
        const flag = (val != null && Math.abs(val) > 0.85) ? '  ⚑ likely redundant with another dim' : '';
        lines.push(`    ${dim.padEnd(14)} mean_rho=${v}${flag}`);
      }
    }
    lines.push('');
  }

  // Application
  const app = report.application_analysis;
  if (app.n > 0) {
    lines.push(`Application-Shape Grader History (n=${app.n})`);
    for (const [dim, stats] of Object.entries(app.by_dimension || {})) {
      const ws = stats.with_skill_weighted;
      lines.push(`    ${dim.padEnd(28)} mean=${(ws.mean ?? 0).toFixed(3)} CV=${(ws.coefficient_of_variation ?? 0).toFixed(3)}`);
    }
    lines.push('');
  } else {
    lines.push(`Application-Shape Grader History: empty (layer not yet exercised)`);
    lines.push('');
  }

  // Compression flags
  if (allFlags.length === 0) {
    lines.push('Compression flags: none detected ✓');
  } else {
    lines.push(`Compression flags raised (${allFlags.length}):`);
    for (const f of allFlags) lines.push(`  ⚑ ${f.where}: ${f.flag}`);
  }
  lines.push('');
  lines.push(`Verdict: ${report.verdict}`);
  process.stdout.write(lines.join('\n') + '\n');
}

if (strict && allFlags.length > 0) {
  process.exit(1);
}
