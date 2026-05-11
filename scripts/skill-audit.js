#!/usr/bin/env node
/**
 * Skill Audit Runner
 *
 * Two modes:
 *
 * 1. Stub mode (default, no flags) — seeds findings.md / verdict.md / scorecard.md
 *    from lint output, leaving qualitative judgment as human TODOs. Fast, free,
 *    deterministic. This is the original behavior and is unchanged.
 *
 * 2. Graded mode (--graded) — on top of the stub, runs a prompt-driven
 *    seven-dimension review by calling an external model CLI for each
 *    dimension. Writes structured PASS / PASS WITH FIXES / FAIL verdicts with
 *    evidence quotes into findings.md / verdict.md / scorecard.md, replacing
 *    the human-TODO placeholders. Requires a grader CLI to be on PATH.
 *
 * Usage:
 *   node scripts/skill-audit.js <skill-name>
 *   node scripts/skill-audit.js <skill-name> --audit-root <path>
 *   node scripts/skill-audit.js <skill-name> --force
 *   node scripts/skill-audit.js <skill-name> --graded
 *   node scripts/skill-audit.js <skill-name> --graded --grader-cli "claude -p"
 *   node scripts/skill-audit.js <skill-name> --graded --grader-cli "codex exec"
 *
 * Flags:
 *   --audit-root <path>   Output directory root (default: examples/audits/).
 *   --force               Overwrite existing artifacts.
 *   --graded              Enable the prompt-driven grader pass.
 *   --grader-cli <cmd>    Shell command to invoke the grader. The prompt is
 *                         piped to stdin; stdout is parsed. Default: `claude -p`.
 *   --grader-timeout <ms> Per-dimension timeout in milliseconds. Default: 120000.
 *
 * Produces under <audit-root>/<skill-name>/:
 *   findings.md   — lint-derived findings + graded findings (graded mode) or human TODOs (stub)
 *   verdict.md    — stub verdict (stub mode) or aggregated graded verdict (graded mode)
 *   scorecard.md  — seven dimensions with scores from lint (metadata) and grader (others)
 *
 * Self-contained. Only uses Node built-ins. No external npm dependencies.
 * Exit 0 on success, 1 on any error.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT  = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

const {
  DIMENSIONS,
  collectContext,
  buildDimensionPrompt,
  parseDimensionResponse,
  aggregateVerdict,
} = require('./lib/audit-prompt-builder');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const DEFAULT_GRADER_CLI     = 'claude -p';
const DEFAULT_GRADER_TIMEOUT = 120_000;

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    skillName:      null,
    auditRoot:      path.join(REPO_ROOT, 'examples', 'audits'),
    force:          false,
    graded:         false,
    graderCli:      DEFAULT_GRADER_CLI,
    graderTimeout:  DEFAULT_GRADER_TIMEOUT,
    errors:         [],
  };

  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === '--audit-root') {
      i++;
      if (!args[i]) result.errors.push('--audit-root requires a path argument');
      else result.auditRoot = path.resolve(args[i]);
    } else if (a === '--force') {
      result.force = true;
    } else if (a === '--graded') {
      result.graded = true;
    } else if (a === '--grader-cli') {
      i++;
      if (!args[i]) result.errors.push('--grader-cli requires a command string');
      else result.graderCli = args[i];
    } else if (a === '--grader-timeout') {
      i++;
      const n = Number(args[i]);
      if (!Number.isFinite(n) || n <= 0) result.errors.push('--grader-timeout requires a positive integer (ms)');
      else result.graderTimeout = n;
    } else if (!a.startsWith('--')) {
      if (result.skillName) result.errors.push(`unexpected positional argument: ${a}`);
      else result.skillName = a;
    } else {
      result.errors.push(`unknown flag: ${a}`);
    }
    i++;
  }

  if (!result.skillName) result.errors.push('missing required argument: <skill-name>');

  return result;
}

// ---------------------------------------------------------------------------
// Lint runner
// ---------------------------------------------------------------------------

function runLint(skillDir) {
  const lintScript = path.join(__dirname, 'skill-lint.js');
  const result = spawnSync(
    process.execPath,
    [lintScript, skillDir, '--no-color', '--skip-generator-parity'],
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
  );
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status === null ? 1 : result.status,
  };
}

// ---------------------------------------------------------------------------
// Lint output parser
// ---------------------------------------------------------------------------

/**
 * @typedef {object} LintDiagnostic
 * @property {'error'|'warn'} severity
 * @property {string} filePath
 * @property {number} line
 * @property {number} column
 * @property {string} message
 * @property {string|null} help
 */

function parseLintOutput(stderr) {
  const diagnostics = [];
  const lines = stderr.split('\n');
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const headerMatch = line.match(/^\[(error|warn)\]\s+(.+?):(\d+):(\d+)\s*$/);
    if (headerMatch) {
      if (current) diagnostics.push(current);
      current = {
        severity: headerMatch[1] === 'warn' ? 'warn' : 'error',
        filePath: headerMatch[2],
        line:     parseInt(headerMatch[3], 10),
        column:   parseInt(headerMatch[4], 10),
        message:  '',
        help:     null,
      };
      continue;
    }

    if (current && current.message === '') {
      const caretMatch = line.match(/^\s*\^\s+(.+)$/);
      if (caretMatch) {
        current.message = caretMatch[1].trim();
        continue;
      }
    }

    if (current && line.match(/^\s+help:\s+/)) {
      current.help = line.replace(/^\s+help:\s+/, '').trim();
      continue;
    }
  }

  if (current) diagnostics.push(current);
  return diagnostics.filter(d => d.message !== '');
}

// ---------------------------------------------------------------------------
// Category inference from message text
// ---------------------------------------------------------------------------

function inferCategory(message) {
  if (/missing required field|unknown field|enum|pattern|minLength|oneOf|sub-field/.test(message)) return 'Schema validity';
  if (/parent directory|name/.test(message)) return 'Naming convention';
  if (/relations\.|adjacent|related|broader|narrower|boundary|disjoint_with|verify_with|depends_on/.test(message)) return 'Relation quality';
  if (/eval_artifacts|eval_state|routing_eval/.test(message)) return 'Eval quality';
  if (/grounding|domain_object|truth_sources/.test(message)) return 'Grounding quality';
  if (/section|Coverage|Philosophy|Verification|Do NOT/.test(message)) return 'Content quality';
  if (/keywords|description|routing/.test(message)) return 'Activation quality';
  if (/deprecated|migration|rename|v1/.test(message)) return 'Schema migration';
  return 'Lint diagnostic';
}

function inferFix(d) {
  if (d.help) return d.help;
  if (/missing required field: (.+)/.test(d.message)) {
    const field = d.message.match(/missing required field: (.+)/)[1];
    return `Add the required \`${field}:\` field. See docs/field-reference.md for allowed values.`;
  }
  if (/unknown field: (.+)/.test(d.message)) {
    const field = d.message.match(/unknown field: (.+)/)[1];
    return `Remove or rename \`${field}\`. Check docs/field-reference.md for the canonical field list.`;
  }
  if (/not in enum/.test(d.message)) return 'Replace the value with one of the canonical enum values listed in docs/field-reference.md.';
  if (/does not match any known skill/.test(d.message)) return 'Check the skill name for typos or remove the dangling relation target.';
  if (/deprecated/.test(d.message)) return 'Follow the migration note in docs/manifest-contract.md § Migration Note — v1 → v2.';
  return 'Inspect the flagged line, correct the value, and re-run skill-lint.js.';
}

// ---------------------------------------------------------------------------
// Grader CLI invocation
// ---------------------------------------------------------------------------

/**
 * Invoke the grader CLI with the composed prompt on stdin, return stdout.
 *
 * The CLI command is user-supplied (--grader-cli) so we do not hardcode a
 * provider. The prompt is piped to stdin to avoid shell-escaping issues with
 * large multi-line prompts containing quotes and backticks.
 *
 * @param {string} graderCli Shell-style command, e.g. `claude -p` or `codex exec`.
 * @param {string} prompt    Full prompt text.
 * @param {number} timeoutMs Per-call timeout.
 * @returns {{ ok: boolean, stdout: string, stderr: string, exitCode: number, error: string|null }}
 */
function invokeGrader(graderCli, prompt, timeoutMs) {
  const [cmd, ...cmdArgs] = graderCli.trim().split(/\s+/);
  if (!cmd) {
    return { ok: false, stdout: '', stderr: '', exitCode: 1, error: 'empty grader-cli' };
  }

  const result = spawnSync(cmd, cmdArgs, {
    input:    prompt,
    encoding: 'utf8',
    timeout:  timeoutMs,
    maxBuffer: 20 * 1024 * 1024,
    stdio:    ['pipe', 'pipe', 'pipe'],
  });

  if (result.error) {
    const msg = result.error.code === 'ENOENT'
      ? `grader CLI not found on PATH: ${cmd}. Pass --grader-cli to point at an installed CLI.`
      : `grader CLI failed to spawn: ${result.error.message}`;
    return { ok: false, stdout: '', stderr: '', exitCode: 1, error: msg };
  }

  if (result.signal === 'SIGTERM' || result.status === null) {
    return { ok: false, stdout: result.stdout || '', stderr: result.stderr || '', exitCode: 124, error: `grader CLI timed out after ${timeoutMs}ms` };
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status,
    error: result.status === 0 ? null : `grader CLI exited with status ${result.status}: ${(result.stderr || '').trim().slice(0, 500)}`,
  };
}

// ---------------------------------------------------------------------------
// Graded pass — run every dimension, collect verdicts
// ---------------------------------------------------------------------------

function runGradedPass(skillDir, opts) {
  const context = collectContext({ skillDir, repoRoot: REPO_ROOT });
  const results = [];

  for (const dimension of DIMENSIONS) {
    const applies = dimension.appliesWhen(context.frontmatter);
    if (!applies) {
      results.push({
        dimension,
        skipped: true,
        verdict: {
          dimension: dimension.id,
          score: 'N/A',
          verdict: 'N/A',
          justification: `Dimension does not apply to this skill (scope: ${context.frontmatter && context.frontmatter.scope}).`,
          findings: [],
          raw: '',
        },
        error: null,
      });
      console.log(`  ${dimension.id}: N/A (skipped — does not apply)`);
      continue;
    }

    const prompt = buildDimensionPrompt({ dimension, context });
    process.stdout.write(`  ${dimension.id}: calling grader (${prompt.length} char prompt)… `);
    const call = invokeGrader(opts.graderCli, prompt, opts.graderTimeout);

    if (!call.ok) {
      console.log(`ERROR — ${call.error}`);
      results.push({ dimension, skipped: false, verdict: null, error: call.error });
      continue;
    }

    const parsed = parseDimensionResponse(call.stdout, dimension);
    if (!parsed.ok) {
      const preview = call.stdout.trim().slice(0, 200).replace(/\n/g, ' ');
      console.log(`PARSE ERROR — ${parsed.error} (preview: ${preview})`);
      results.push({ dimension, skipped: false, verdict: null, error: parsed.error, raw: call.stdout });
      continue;
    }

    console.log(`${parsed.verdict.verdict} — score ${parsed.verdict.score} — ${parsed.verdict.findings.length} finding(s)`);
    results.push({ dimension, skipped: false, verdict: parsed.verdict, error: null });
  }

  return { context, results };
}

// ---------------------------------------------------------------------------
// Artifact template builders — stub mode
// ---------------------------------------------------------------------------

function buildFindingsStub(skillName, diagnostics, isoDate) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');

  const findingBlocks = [];
  let fIndex = 1;

  for (const d of diagnostics) {
    const severity = d.severity === 'error' ? 'P1' : 'P2';
    const category = inferCategory(d.message);
    const fix      = inferFix(d);
    findingBlocks.push([
      `ID: F${fIndex}`,
      `Severity: ${severity}`,
      `Surface: ${d.filePath}:${d.line}:${d.column}`,
      `Category: ${category}`,
      `Problem: ${d.message}`,
      `Evidence: Emitted by skill-lint.js — see ${d.filePath} line ${d.line}`,
      `Required action: ${fix}`,
    ].join('\n'));
    fIndex++;
  }

  const humanJudgmentTodos = [
    { surface: 'activation',   title: 'Activation quality — routing coverage',         note: 'Does the description name real trigger scenarios? Are keywords specific and not generic filler? Does the skill under-trigger or over-trigger for its intended use case?' },
    { surface: 'relations',    title: 'Relation quality — graph correctness',          note: 'Do relations point at semantically correct neighbors? Are boundary handoffs crisp enough to prevent misuse? Are broader/narrower claims taxonomic rather than associative? Are dependencies real?' },
    { surface: 'grounding',    title: 'Grounding quality — claims vs truth sources',   note: 'If scope: codebase, do all truth_sources exist? Do claims in the body match the referenced files? Classify any mismatch as skill drift, code drift, or doc drift.' },
    { surface: 'content',      title: 'Content quality — completeness and density',    note: 'Does the skill have a clear Coverage section, a Philosophy section, at least one decision table or checklist, and explicit negative bounds (Do NOT Use When)? Does it contain generic filler that adds no routing signal?' },
    { surface: 'evals',        title: 'Eval quality — coverage and realism',           note: 'Do eval files exist if the skill is expected to be graded? Do they test realistic prompts — not trivia — and cover boundaries and failure cases as well as the happy path?' },
  ];

  for (const todo of humanJudgmentTodos) {
    findingBlocks.push([
      `ID: F${fIndex}`,
      `Severity: TODO`,
      `Surface: ${todo.surface}`,
      `Category: ${todo.title}`,
      `Problem: TODO — human judgment required`,
      `Evidence: TODO — reviewer must inspect the skill body`,
      `Required action: ${todo.note}`,
    ].join('\n'));
    fIndex++;
  }

  let requiredFixes = '';
  if (errors.length === 0 && warnings.length === 0) {
    requiredFixes = 'None identified by lint. See human-judgment finding blocks above for remaining review areas.';
  } else {
    const fixLines = [];
    let fi = 1;
    for (const d of diagnostics) {
      const sev = d.severity === 'error' ? '[P1 error]' : '[P2 warning]';
      fixLines.push(`- F${fi} ${sev}: ${d.message}`);
      fi++;
    }
    requiredFixes = fixLines.join('\n');
  }

  return [
    '# Findings',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Audit Date',
    '',
    isoDate,
    '',
    '## Verdict Summary',
    '',
    verdictLabelFromLint(diagnostics),
    '',
    '## Findings',
    '',
    findingBlocks.join('\n\n'),
    '',
    '## Required Fixes',
    '',
    requiredFixes,
    '',
  ].join('\n');
}

function buildVerdictStub(skillName, diagnostics, isoDate) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');
  const verdict  = verdictLabelFromLint(diagnostics);

  let rationale = '';
  if (errors.length === 0 && warnings.length === 0) {
    rationale = [
      'The skill passes all deterministic lint checks (schema validity, naming convention, relation target existence, eval coherence).',
      'Human judgment is required to assess activation quality, relation semantics, grounding fidelity, content quality, eval realism, and portability.',
      'Update this verdict after completing the qualitative review sections in findings.md.',
    ].join(' ');
  } else if (errors.length === 0) {
    const warnList = warnings.map(w => `- ${w.message}`).join('\n');
    rationale = [
      `The skill passes schema validation with ${warnings.length} warning(s) emitted by skill-lint.js:`,
      '',
      warnList,
      '',
      'Human judgment is required for the qualitative dimensions (activation, content, evals, portability). Update this verdict after completing findings.md.',
    ].join('\n');
  } else {
    const errList = errors.map(e => `- ${e.message}`).join('\n');
    rationale = [
      `The skill fails deterministic lint with ${errors.length} error(s):`,
      '',
      errList,
      '',
      'All lint errors must be resolved before qualitative review is meaningful. Re-run `node scripts/skill-lint.js skills/<skill-name>` after each fix.',
    ].join('\n');
  }

  return [
    '# Verdict',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Audit Date',
    '',
    isoDate,
    '',
    '## Final Verdict',
    '',
    verdict,
    '',
    '## Rationale',
    '',
    rationale,
    '',
    '## Human Judgment Required',
    '',
    'This is a stub verdict generated by `node scripts/skill-audit.js`. It reflects only the deterministic lint result.',
    'A human auditor must review the following before this verdict is final:',
    '',
    '- Activation quality (routing coverage, keyword specificity)',
    '- Relation semantics (related/broader/boundary correctness)',
    '- Grounding fidelity (claims vs truth sources, when scope: codebase)',
    '- Content quality (decision tables, Philosophy section, negative bounds)',
    '- Eval quality (coverage, realism, boundary cases)',
    '- Portability (no private assumptions leak through, export targets are real)',
    '',
    '## Follow-up State',
    '',
    'TODO — set to one of: `No fixes required`, `Fixes applied`, `Fixes deferred — <reason>`, or `Pending human review`.',
    '',
  ].join('\n');
}

function buildScorecardStub(skillName, diagnostics, scope) {
  const errors     = diagnostics.filter(d => d.severity === 'error');
  const warnings   = diagnostics.filter(d => d.severity === 'warning');
  const schemaErrs = errors.filter(d => {
    const cat = inferCategory(d.message);
    return cat === 'Schema validity' || cat === 'Naming convention';
  });

  // v0.5.0: 3-column markdown (Dimension | Score | Note) + 1–5 numeric scores
  // aligned with `evaluation` doctrine. Prior version emitted a 2-column row
  // for Metadata validity which broke markdown rendering.
  let metaScore, metaNote;
  if (schemaErrs.length > 0) {
    metaScore = '1';
    metaNote  = `auto: ${schemaErrs.length} lint error(s) — schema contract violated`;
  } else if (warnings.length > 0) {
    metaScore = '4';
    metaNote  = `auto: lint passes with ${warnings.length} warning(s)`;
  } else {
    metaScore = '5';
    metaNote  = 'auto: lint passes clean';
  }

  const groundingRow = scope === 'portable'
    ? '| Grounding fidelity | N/A | `scope: portable` — grounding dimension does not apply |'
    : '| Grounding fidelity | TODO | Human review required — verify claims match truth sources |';

  const rows = [
    `| Metadata validity | ${metaScore} | ${metaNote} |`,
    '| Activation quality | TODO | Human review required — see findings.md |',
    '| Relation quality | TODO | Human review required — see findings.md |',
    groundingRow,
    '| Content quality | TODO | Human review required — see findings.md |',
    '| Eval quality | TODO | Human review required — see findings.md |',
    '| Portability quality | TODO | Human review required — see findings.md |',
  ];

  return [
    '# Scorecard',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Dimensions',
    '',
    '| Dimension | Score | Note |',
    '|---|---|---|',
    ...rows,
    '',
    '> **Note:** This scorecard was generated by `node scripts/skill-audit.js`.',
    '> Schema validity is auto-scored from `skill-lint.js` output.',
    '> All other dimensions require human judgment. Replace each TODO with a',
    '> 1–5 score and a short justification once the review is complete.',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Artifact template builders — graded mode
// ---------------------------------------------------------------------------

function buildFindingsGraded(skillName, diagnostics, isoDate, gradedResults, finalVerdict, graderCli) {
  const findingBlocks = [];
  let fIndex = 1;

  // Lint-derived findings first, unchanged.
  for (const d of diagnostics) {
    const severity = d.severity === 'error' ? 'P1' : 'P2';
    const category = inferCategory(d.message);
    const fix      = inferFix(d);
    findingBlocks.push([
      `ID: F${fIndex}`,
      `Severity: ${severity}`,
      `Surface: ${d.filePath}:${d.line}:${d.column}`,
      `Category: ${category}`,
      `Source: skill-lint.js`,
      `Problem: ${d.message}`,
      `Evidence: Emitted by skill-lint.js — see ${d.filePath} line ${d.line}`,
      `Required action: ${fix}`,
    ].join('\n'));
    fIndex++;
  }

  // Graded findings, one block per finding, tagged with dimension + grader.
  for (const r of gradedResults) {
    if (r.error || !r.verdict || r.verdict.verdict === 'N/A') continue;
    for (const finding of r.verdict.findings) {
      findingBlocks.push([
        `ID: F${fIndex}`,
        `Severity: ${finding.severity}`,
        `Surface: ${finding.surface}`,
        `Category: ${r.dimension.label}`,
        `Source: grader (${graderCli})`,
        `Problem: ${finding.problem}`,
        `Evidence: ${finding.evidence}`,
        `Required action: ${finding.required_action}`,
      ].join('\n'));
      fIndex++;
    }
  }

  // Graded errors surface as findings too so they don't get lost.
  for (const r of gradedResults) {
    if (!r.error) continue;
    findingBlocks.push([
      `ID: F${fIndex}`,
      `Severity: P2`,
      `Surface: grader-${r.dimension.id}`,
      `Category: Grader infrastructure`,
      `Source: skill-audit.js`,
      `Problem: Grader call failed for dimension "${r.dimension.label}"`,
      `Evidence: ${r.error.slice(0, 400)}`,
      `Required action: Re-run with a working grader CLI (see --grader-cli) or complete this dimension manually.`,
    ].join('\n'));
    fIndex++;
  }

  const requiredFixesLines = [];
  if (diagnostics.length > 0) {
    let fi = 1;
    for (const d of diagnostics) {
      const sev = d.severity === 'error' ? '[P1 error]' : '[P2 warning]';
      requiredFixesLines.push(`- F${fi} ${sev}: ${d.message}`);
      fi++;
    }
  }
  for (const r of gradedResults) {
    if (r.error || !r.verdict || r.verdict.verdict === 'PASS' || r.verdict.verdict === 'N/A') continue;
    const count = r.verdict.findings.length;
    if (count > 0) {
      requiredFixesLines.push(`- ${r.dimension.label}: ${r.verdict.verdict} — ${count} finding(s) from grader`);
    }
  }
  const requiredFixes = requiredFixesLines.length === 0
    ? 'None — all dimensions PASS under grader review and lint is clean.'
    : requiredFixesLines.join('\n');

  return [
    '# Findings',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Audit Date',
    '',
    isoDate,
    '',
    '## Audit Mode',
    '',
    `\`--graded\` (grader: \`${graderCli}\`)`,
    '',
    '## Verdict Summary',
    '',
    finalVerdict,
    '',
    '## Findings',
    '',
    findingBlocks.length === 0 ? '_(no findings — lint clean and grader PASS across every dimension)_' : findingBlocks.join('\n\n'),
    '',
    '## Required Fixes',
    '',
    requiredFixes,
    '',
  ].join('\n');
}

function buildVerdictGraded(skillName, isoDate, gradedResults, finalVerdict, graderCli) {
  const summaryRows = [
    '| Dimension | Verdict | Score |',
    '|---|---|---|',
    ...gradedResults.map(r => {
      if (r.error) return `| ${r.dimension.label} | ERROR | n/a |`;
      const v = r.verdict;
      return `| ${r.dimension.label} | ${v.verdict} | ${v.score} |`;
    }),
  ].join('\n');

  const justifications = gradedResults
    .filter(r => r.verdict && !r.error)
    .map(r => `- **${r.dimension.label}** (${r.verdict.verdict}, score ${r.verdict.score}): ${r.verdict.justification}`)
    .join('\n');

  const errorNotes = gradedResults
    .filter(r => r.error)
    .map(r => `- **${r.dimension.label}** — grader error: ${r.error.slice(0, 300)}`)
    .join('\n');

  return [
    '# Verdict',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Audit Date',
    '',
    isoDate,
    '',
    '## Audit Mode',
    '',
    `\`--graded\` (grader: \`${graderCli}\`)`,
    '',
    '## Final Verdict',
    '',
    finalVerdict,
    '',
    '## Dimension Summary',
    '',
    summaryRows,
    '',
    '## Rationale',
    '',
    justifications || '_(no per-dimension justifications — every dimension errored)_',
    '',
    errorNotes ? ['## Grader Errors', '', errorNotes, ''].join('\n') : '',
    '## Follow-up State',
    '',
    'TODO — set to one of: `No fixes required`, `Fixes applied`, `Fixes deferred — <reason>`, or `Pending human review`.',
    '',
  ].join('\n');
}

function buildScorecardGraded(skillName, diagnostics, gradedResults) {
  const errors     = diagnostics.filter(d => d.severity === 'error');
  const warnings   = diagnostics.filter(d => d.severity === 'warning');
  const schemaErrs = errors.filter(d => {
    const cat = inferCategory(d.message);
    return cat === 'Schema validity' || cat === 'Naming convention';
  });
  // v0.5.0: use the full 1–5 scale per `skills/evaluation/SKILL.md:69-106`
  // doctrine. 5 = zero lint errors and zero warnings. 4 = zero errors, some
  // warnings. 1 = lint errors present (the skill fails the schema contract).
  let metaScore, metaNote;
  if (schemaErrs.length > 0) {
    metaScore = '1';
    metaNote  = `${schemaErrs.length} lint error(s) — schema contract violated`;
  } else if (warnings.length > 0) {
    metaScore = '4';
    metaNote  = `lint passes with ${warnings.length} warning(s)`;
  } else {
    metaScore = '5';
    metaNote  = 'lint passes clean';
  }

  // Metadata validity is lint-derived; all other rows come from the grader.
  const byId = new Map(gradedResults.map(r => [r.dimension.id, r]));

  function rowFor(id, label) {
    if (id === 'metadata') {
      return `| ${label} | ${metaScore} | auto: ${metaNote} |`;
    }
    const r = byId.get(id);
    if (!r) return `| ${label} | TODO | (no grader output) |`;
    if (r.error) return `| ${label} | ERROR | grader error — see findings.md |`;
    const v = r.verdict;
    const note = (v.justification || '').replace(/\|/g, '\\|').slice(0, 300);
    return `| ${label} | ${v.score} | ${v.verdict} — ${note} |`;
  }

  const rows = [
    rowFor('metadata',    'Metadata validity'),
    rowFor('activation',  'Activation quality'),
    rowFor('relation',    'Relation quality'),
    rowFor('grounding',   'Grounding fidelity'),
    rowFor('content',     'Content quality'),
    rowFor('eval',        'Eval quality'),
    rowFor('portability', 'Portability quality'),
  ];

  return [
    '# Scorecard',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Dimensions',
    '',
    '| Dimension | Score | Note |',
    '|---|---|---|',
    ...rows,
    '',
    '> **Note:** Metadata validity is auto-scored from `skill-lint.js`. All other',
    '> dimensions come from the `--graded` grader pass. See `verdict.md` for the',
    '> per-dimension rationale and `findings.md` for the specific finding evidence.',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Verdict label helper (stub mode)
// ---------------------------------------------------------------------------

function verdictLabelFromLint(diagnostics) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  if (errors.length > 0) return 'FAIL';
  // v0.5.0: stub mode completes only the Metadata-validity row (from lint).
  // The other six dimensions are human-judgment TODOs. Per `skills/evaluation/
  // SKILL.md:69-106` doctrine, a skill is not Done until all scores >= 4 —
  // so a stub with 6 TODO rows cannot honestly claim PASS WITH FIXES. PARTIAL
  // reflects "useful but still incomplete" (the vocabulary definition in
  // `docs/single-skill-audit-checklist.md § Verdict`).
  return 'PARTIAL';
}

// ---------------------------------------------------------------------------
// Scope reader (fallback for when we don't collect full context)
// ---------------------------------------------------------------------------

function readScopeFromSkill(skillFilePath) {
  try {
    const { parseFrontmatter } = require('./lib/parse-frontmatter');
    const text = fs.readFileSync(skillFilePath, 'utf8');
    const fm   = parseFrontmatter(text);
    return (fm && fm.scope) ? String(fm.scope) : null;
  } catch (_) {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv);

  if (opts.errors.length > 0) {
    for (const e of opts.errors) console.error(`error: ${e}`);
    console.error('\nUsage: node scripts/skill-audit.js <skill-name> [--audit-root <path>] [--force] [--graded [--grader-cli <cmd>] [--grader-timeout <ms>]]');
    process.exit(1);
  }

  const skillDir  = path.join(SKILLS_DIR, opts.skillName);
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillDir)) {
    console.error(`error: skill directory not found: ${skillDir}`);
    console.error(`       Available skills: ${fs.readdirSync(SKILLS_DIR).join(', ')}`);
    process.exit(1);
  }
  if (!fs.existsSync(skillFile)) {
    console.error(`error: SKILL.md not found in ${skillDir}`);
    process.exit(1);
  }

  const outDir = path.join(opts.auditRoot, opts.skillName);
  const targetFiles = ['findings.md', 'verdict.md', 'scorecard.md'];
  if (!opts.force) {
    const existing = targetFiles.filter(f => fs.existsSync(path.join(outDir, f)));
    if (existing.length > 0) {
      console.error(`error: audit artifacts already exist in ${outDir}`);
      console.error(`       Existing files: ${existing.join(', ')}`);
      console.error('       Pass --force to overwrite.');
      process.exit(1);
    }
  }

  console.log(`Running skill-lint.js on skills/${opts.skillName}…`);
  const { stderr, exitCode } = runLint(skillDir);
  const diagnostics = parseLintOutput(stderr);
  const lintErrors   = diagnostics.filter(d => d.severity === 'error');
  const lintWarnings = diagnostics.filter(d => d.severity === 'warn');
  if (exitCode === 0) {
    console.log(`  lint: PASS${lintWarnings.length > 0 ? ` (${lintWarnings.length} warning(s))` : ''}`);
  } else {
    console.log(`  lint: FAIL (${lintErrors.length} error(s), ${lintWarnings.length} warning(s))`);
  }

  const isoDate = new Date().toISOString().slice(0, 10);

  let findingsMd, verdictMd, scorecardMd, summaryTail;

  if (!opts.graded) {
    // ---- stub path (unchanged) ----
    const scope = readScopeFromSkill(skillFile);
    findingsMd  = buildFindingsStub(opts.skillName, diagnostics, isoDate);
    verdictMd   = buildVerdictStub(opts.skillName, diagnostics, isoDate);
    scorecardMd = buildScorecardStub(opts.skillName, diagnostics, scope);
    const humanTodoCount = 5;
    summaryTail = `${diagnostics.length} lint finding(s) stubbed, ${humanTodoCount} human-judgment TODOs.`;
  } else {
    // ---- graded path ----
    console.log(`\nRunning graded pass — grader: \`${opts.graderCli}\` (timeout ${opts.graderTimeout}ms/call)`);
    const { results } = runGradedPass(skillDir, opts);

    const validVerdicts = results.filter(r => r.verdict && !r.error).map(r => r.verdict);
    const finalVerdict  = lintErrors.length > 0 ? 'FAIL' : aggregateVerdict(validVerdicts);

    findingsMd  = buildFindingsGraded(opts.skillName, diagnostics, isoDate, results, finalVerdict, opts.graderCli);
    verdictMd   = buildVerdictGraded(opts.skillName, isoDate, results, finalVerdict, opts.graderCli);
    scorecardMd = buildScorecardGraded(opts.skillName, diagnostics, results);

    const graderErrors = results.filter(r => r.error).length;
    const gradedFindingCount = results.reduce((n, r) => n + (r.verdict ? r.verdict.findings.length : 0), 0);
    summaryTail = `${diagnostics.length} lint finding(s), ${gradedFindingCount} graded finding(s), ${graderErrors} grader error(s).`;
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'findings.md'),  findingsMd,  'utf8');
  fs.writeFileSync(path.join(outDir, 'verdict.md'),   verdictMd,   'utf8');
  fs.writeFileSync(path.join(outDir, 'scorecard.md'), scorecardMd, 'utf8');

  console.log(`\nWrote ${path.relative(REPO_ROOT, outDir)}/{findings,verdict,scorecard}.md — ${summaryTail}`);

  if (lintErrors.length > 0) {
    console.log('\nNext step: fix the lint errors listed in findings.md, then re-run skill-audit.js --force.');
  } else if (!opts.graded) {
    console.log('\nNext step: open findings.md and complete the human-judgment TODO sections, or re-run with --graded to invoke the grader.');
  } else {
    console.log('\nNext step: address the graded findings in findings.md, then re-run with --force to refresh the verdict.');
  }
}

main();
