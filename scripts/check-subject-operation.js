#!/usr/bin/env node
/**
 * check-subject-operation — validates the v8 5-axis classification per ADR-0017.
 *
 * Why this exists
 * ---------------
 * ADR-0017 ships v8 with a 9-value `subject` enum and a 4-value `operation`
 * enum (Bloom-grounded). Predicted post-migration `operation` distribution
 * was `know` 35-45% / `do` 25-35% / `decide` 20-30% / `modify` 1-3`.
 * Actual: `know` 67% / `do` 31% / `decide` 1% / `modify` 1`.
 *
 * The discriminating axis collapsed: `decide` is 20x under-populated. Either
 * (a) the codemod's heuristic was wrong and many skills should reclassify, or
 * (b) the predicted distribution was wrong. Either way, no automated checker
 * existed; this script provides one.
 *
 * What it checks
 * --------------
 * 1. `subject` is one of the 9 closed enum values (per ADR-0017).
 * 2. `operation` is one of the 4 closed enum values (per ADR-0017).
 * 3. `scope` is one of the 3 v8 values OR a v7 alias accepted during sunset.
 * 4. Subject distribution balance: each shelf holds 5-25 skills (ADR-0017's
 *    balance rule). Reports shelves outside that band.
 * 5. Operation distribution sanity vs ADR-0017's predicted distribution.
 * 6. Per-skill `operation` claim sanity-check: scans the skill body for
 *    Bloom-aligned linguistic markers and flags when the declared `operation`
 *    doesn't match the body's strongest signal. Does NOT auto-rewrite — only
 *    reports the mismatch with evidence.
 *
 * Usage
 *   node scripts/check-subject-operation.js                       # all, pretty
 *   node scripts/check-subject-operation.js --json                # all, JSON
 *   node scripts/check-subject-operation.js --skill <name>        # single skill
 *   node scripts/check-subject-operation.js --summary             # corpus-level only
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFiles } = require('./lib/roots');

const SUBJECT_ENUM = [
  'code-engineering',
  'quality-assurance',
  'frontend-ui',
  'design-craft',
  'agent-ops',
  'product-domain',
  'knowledge-organization',
  'meta-methods',
  'data-analytics',
];
const OPERATION_ENUM = ['know', 'do', 'decide', 'modify'];
const SCOPE_V8 = ['portable', 'workspace', 'project'];
const SCOPE_V7_ALIASES = { codebase: 'project', reference: 'workspace' };

const BALANCE_MIN = 5;
const BALANCE_MAX = 25;

// Frontmatter detector. Tolerates an optional UTF-8 BOM at file start by
// using the Unicode escape form rather than a literal character (the security
// scanner blocks embedded U+FEFF in source).
const FRONTMATTER_RE = new RegExp('^[\\uFEFF]?---\\r?\\n[\\s\\S]*?\\r?\\n---(?:\\r?\\n|$)');

const OPERATION_MARKERS = {
  decide: [
    /\bdecide when to\b/gi,
    /\bchoose between\b/gi,
    /\btrade[- ]offs?\b/gi,
    /\bcriteria\b/gi,
    /\bselection rules?\b/gi,
    /\bwhich to use\b/gi,
    /\bpick (?:the|a|an) (?:right|correct|appropriate)\b/gi,
  ],
  do: [
    /^[*\-#]\s*(?:Run|Apply|Build|Execute|Deploy|Implement|Configure|Install|Migrate|Refactor|Replace|Add|Remove|Update)\s/gim,
    /\bstep \d+\b/gi,
    /\b(?:then|next),\s+(?:run|do|apply)\b/gi,
    /\bworkflow\b/gi,
    /\bprocedure\b/gi,
  ],
  know: [
    /\b(?:is|are|means|represents|defines|describes)\b/gi,
    /\bthe (?:concept|model|principle|definition|theory|framework)\b/gi,
    /\bmental model\b/gi,
    /\bunderstand (?:that|the|how|why|what)\b/gi,
  ],
  modify: [
    /\binject(?:s|ed|ing)?\b/gi,
    /\boverlay\b/gi,
    /\bapply (?:this )?lens\b/gi,
    /\brewrites? the\b/gi,
    /\baugments? the\b/gi,
  ],
};

function parseArgs(argv) {
  const args = { skill: null, json: false, summary: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skill') args.skill = argv[++i];
    else if (a === '--json') args.json = true;
    else if (a === '--summary') args.summary = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  process.stdout.write(`check-subject-operation - validates v8 5-axis classification per ADR-0017.

Usage:
  node scripts/check-subject-operation.js                       # all, pretty
  node scripts/check-subject-operation.js --json                # all, JSON
  node scripts/check-subject-operation.js --skill <name>        # single skill
  node scripts/check-subject-operation.js --summary             # corpus-level only

Reports: subject/operation/scope enum validity, subject distribution balance
(5-25 per shelf), per-skill operation claim sanity-check (body marker signals).
`);
}

function extractBody(text) {
  const m = text.match(FRONTMATTER_RE);
  return m ? text.slice(m[0].length) : text;
}

function scoreOperationMarkers(body) {
  const counts = { decide: 0, do: 0, know: 0, modify: 0 };
  for (const op of Object.keys(OPERATION_MARKERS)) {
    for (const re of OPERATION_MARKERS[op]) {
      const matches = body.match(re);
      if (matches) counts[op] += matches.length;
    }
  }
  return counts;
}

function inferOperation(counts) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return null;
  if (entries[0][1] > 0 && entries[1][1] > 0 && entries[1][1] / entries[0][1] > 0.7) {
    return 'ambiguous';
  }
  return entries[0][0];
}

function checkSkill(filePath, text) {
  const fm = normalizeFrontmatter(parseFrontmatter(text));
  if (!fm) return null;
  const body = extractBody(text);
  const findings = [];

  const subject = fm.subject || null;
  const subjectValid = SUBJECT_ENUM.includes(subject);
  if (!subjectValid) {
    findings.push(`subject "${subject}" is not in the v8 closed enum (one of: ${SUBJECT_ENUM.join(', ')})`);
  }

  const operation = fm.operation || null;
  const operationValid = OPERATION_ENUM.includes(operation);
  if (!operationValid) {
    findings.push(`operation "${operation}" is not in the v8 closed enum (one of: ${OPERATION_ENUM.join(', ')})`);
  }

  let scope = fm.scope || null;
  const scopeOriginal = scope;
  if (scope && SCOPE_V7_ALIASES[scope]) {
    findings.push(`scope "${scope}" is a v7 alias (deprecated, accepted during sunset). v8 value: "${SCOPE_V7_ALIASES[scope]}"`);
    scope = SCOPE_V7_ALIASES[scope];
  }
  const scopeValid = SCOPE_V8.includes(scope);
  if (!scopeValid) {
    findings.push(`scope "${scopeOriginal}" is not valid (v8: ${SCOPE_V8.join(', ')}; v7 aliases: codebase|reference)`);
  }

  const evidence = scoreOperationMarkers(body);
  const inferred = inferOperation(evidence);
  let operationClaimSupported = true;

  if (operationValid && inferred && inferred !== 'ambiguous') {
    if (inferred !== operation) {
      operationClaimSupported = false;
      const inferredCount = evidence[inferred];
      const declaredCount = evidence[operation] || 0;
      findings.push(
        `operation: declared "${operation}" but body signals "${inferred}" (${inferredCount} ${inferred}-markers vs ${declaredCount} ${operation}-markers). Review classification or rebalance body.`,
      );
    }
  } else if (operationValid && (inferred === null || inferred === 'ambiguous')) {
    operationClaimSupported = null;
  }

  return {
    skill: fm.name || path.basename(path.dirname(filePath)),
    path: filePath,
    subject,
    subject_valid: subjectValid,
    operation,
    operation_valid: operationValid,
    operation_claim_supported: operationClaimSupported,
    operation_inferred: inferred && inferred !== 'ambiguous' ? inferred : null,
    operation_evidence: evidence,
    scope: scopeOriginal,
    scope_valid: scopeValid,
    findings,
  };
}

function aggregateCorpus(results) {
  const subjectDist = {};
  const operationDist = {};
  for (const r of results) {
    if (r.subject_valid) subjectDist[r.subject] = (subjectDist[r.subject] || 0) + 1;
    if (r.operation_valid) operationDist[r.operation] = (operationDist[r.operation] || 0) + 1;
  }

  const subjectBalanceWarnings = [];
  for (const subj of SUBJECT_ENUM) {
    const count = subjectDist[subj] || 0;
    if (count < BALANCE_MIN) {
      subjectBalanceWarnings.push({
        subject: subj,
        count,
        expected: `${BALANCE_MIN}-${BALANCE_MAX}`,
        action: 'fold or recruit',
      });
    } else if (count > BALANCE_MAX) {
      subjectBalanceWarnings.push({
        subject: subj,
        count,
        expected: `${BALANCE_MIN}-${BALANCE_MAX}`,
        action: 'subdivide via domain:',
      });
    }
  }

  const totalScored = Object.values(operationDist).reduce((a, b) => a + b, 0);
  const operationPct = {};
  for (const op of OPERATION_ENUM) {
    operationPct[op] = totalScored > 0 ? Math.round(((operationDist[op] || 0) / totalScored) * 1000) / 10 : 0;
  }
  const operationDistWarnings = [];
  const adrPredicted = { know: [35, 45], do: [25, 35], decide: [20, 30], modify: [1, 3] };
  for (const op of OPERATION_ENUM) {
    const pct = operationPct[op];
    const [lo, hi] = adrPredicted[op];
    if (pct < lo) {
      operationDistWarnings.push({
        operation: op,
        actual_pct: pct,
        adr_predicted: `${lo}-${hi}%`,
        action: 'under-populated vs ADR-0017 prediction; review codemod heuristic or update prediction',
      });
    } else if (pct > hi) {
      operationDistWarnings.push({
        operation: op,
        actual_pct: pct,
        adr_predicted: `${lo}-${hi}%`,
        action: 'over-populated vs ADR-0017 prediction; some skills likely misclassified',
      });
    }
  }

  return {
    subject_distribution: subjectDist,
    subject_balance_warnings: subjectBalanceWarnings,
    operation_distribution: operationDist,
    operation_distribution_pct: operationPct,
    operation_distribution_warnings: operationDistWarnings,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const files = collectSkillFiles();
  if (files.length === 0) {
    process.stderr.write('check-subject-operation: no SKILL.md files found\n');
    process.exit(1);
  }

  const results = [];
  for (const { filePath } of files) {
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      process.stderr.write(`check-subject-operation: cannot read ${filePath}: ${e.message}\n`);
      continue;
    }
    const r = checkSkill(filePath, text);
    if (!r) continue;
    if (args.skill && r.skill !== args.skill) continue;
    results.push(r);
  }

  if (results.length === 0 && args.skill) {
    process.stderr.write(`check-subject-operation: no skill named "${args.skill}" found\n`);
    process.exit(1);
  }

  const corpus = aggregateCorpus(results);
  const claimMismatches = results.filter((r) => r.operation_claim_supported === false).length;
  const enumViolations = results.filter(
    (r) => !r.subject_valid || !r.operation_valid || !r.scope_valid,
  ).length;

  const summary = {
    total_skills: results.length,
    enum_violations: enumViolations,
    operation_claim_mismatches: claimMismatches,
    ...corpus,
  };

  if (args.json) {
    process.stdout.write(JSON.stringify({ summary, results }, null, 2) + '\n');
  } else if (args.summary) {
    process.stdout.write('Subject/Operation/Scope Summary\n');
    process.stdout.write('================================\n');
    process.stdout.write(`  total_skills: ${summary.total_skills}\n`);
    process.stdout.write(`  enum_violations: ${summary.enum_violations}\n`);
    process.stdout.write(`  operation_claim_mismatches: ${summary.operation_claim_mismatches}\n\n`);
    process.stdout.write('Subject distribution (5-25 balance band):\n');
    for (const [subj, count] of Object.entries(corpus.subject_distribution).sort((a, b) => b[1] - a[1])) {
      const marker = count < BALANCE_MIN ? ' [UNDER]' : count > BALANCE_MAX ? ' [OVER]' : '';
      process.stdout.write(`  ${subj.padEnd(28)} ${String(count).padStart(4)}${marker}\n`);
    }
    process.stdout.write('\nOperation distribution (ADR-0017 predicted):\n');
    for (const op of OPERATION_ENUM) {
      const count = corpus.operation_distribution[op] || 0;
      const pct = corpus.operation_distribution_pct[op];
      const warn = corpus.operation_distribution_warnings.find((w) => w.operation === op);
      process.stdout.write(`  ${op.padEnd(8)} ${String(count).padStart(4)}  ${String(pct).padStart(5)}%${warn ? ' [' + warn.action.split(';')[0] + ']' : ''}\n`);
    }
  } else {
    process.stdout.write('Skill                                  Subject                  Op       Op-OK  Scope\n');
    process.stdout.write('-------------------------------------- ------------------------ -------- -----  -----\n');
    for (const r of results) {
      const opOk = r.operation_claim_supported === false ? '  N  ' : r.operation_claim_supported === null ? '  ?  ' : '  Y  ';
      process.stdout.write(
        `${(r.skill || '').padEnd(38).slice(0, 38)} ${(r.subject || '').padEnd(24).slice(0, 24)} ${(r.operation || '').padEnd(8).slice(0, 8)} ${opOk}  ${r.scope || ''}\n`,
      );
    }
    process.stdout.write('\n');
    process.stdout.write(`total_skills: ${summary.total_skills}\n`);
    process.stdout.write(`enum_violations: ${summary.enum_violations}\n`);
    process.stdout.write(`operation_claim_mismatches: ${summary.operation_claim_mismatches}\n`);
  }

  process.exit(enumViolations > 0 ? 1 : 0);
}

if (require.main === module) main();

module.exports = { checkSkill, aggregateCorpus, SUBJECT_ENUM, OPERATION_ENUM };
