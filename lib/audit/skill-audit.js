#!/usr/bin/env node
/**
 * Skill Audit Runner
 *
 * Two modes:
 *
 * 1. Integrity-Gate mode (default, no flags) — runs the canonical-source lint
 *    gate AND the drift sentinel (`skill-graph-drift.js`) inline, seeds
 *    findings.md / verdict.md / scorecard.md, and **stamps the full Integrity
 *    layer of the Health Block back onto the skill's SKILL.md frontmatter**
 *    (last_audited, lint_verdict, structural_verdict, truth_verdict). Fast,
 *    free, deterministic. The body of findings.md still carries human-TODO
 *    placeholders for qualitative dimensions; those are filled either by the
 *    auditor or by `--graded`. Behavior-Gate verdicts (comprehension_verdict /
 *    application_verdict) still require `--graded` with a grader CLI.
 *
 * 2. Graded mode (--graded) — on top of mode 1, runs a prompt-driven
 *    seven-dimension review by calling an external model CLI for each
 *    dimension. Writes structured dimension verdicts with
 *    evidence quotes into findings.md / verdict.md / scorecard.md, replacing
 *    the human-TODO placeholders. Requires a grader CLI to be on PATH.
 *
 * Usage:
 *   node scripts/skill-audit.js <skill-name>
 *   node scripts/skill-audit.js <skill-name> --audit-root <path>
 *   node scripts/skill-audit.js <skill-name> --force
 *   node scripts/skill-audit.js <skill-name> --dry-run
 *   node scripts/skill-audit.js <skill-name> --graded
 *   node scripts/skill-audit.js <skill-name> --graded --grader-cli "claude -p"
 *   node scripts/skill-audit.js <skill-name> --graded --grader-cli "codex exec"
 *
 * Flags:
 *   --audit-root <path>   Output directory root (default: audits/). Per SH-6481 N5,
 *                         the default moved from examples/audits/ to audits/ at repo
 *                         root so per-skill audit evidence is not collocated with
 *                         protocol-stable specimens under examples/.
 *   --force               Overwrite existing artifacts.
 *   --dry-run             Resolve the skill and run lint but do not write any files.
 *                         Exits 0 on success, 1 if the skill cannot be resolved.
 *                         Useful for smoke-testing standalone installs.
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
const { updateFrontmatterFields } = require('../audit-shared/skill-frontmatter');
// Use the lib/audit/roots.js shim (re-exports scripts/lib/roots.js). The shim
// eliminates cross-package path escapes that break standalone npm global installs.
const { collectSkillFiles, workspaceRoot } = require('./roots');

// workspaceRoot() respects SKILL_GRAPH_WORKSPACE env var — standalone installs
// point at the user's working directory rather than any hardcoded monorepo path.
const _WORKSPACE  = workspaceRoot();
const SKILL_FILES = collectSkillFiles(_WORKSPACE);

function findSkillFile(skillName) {
  return SKILL_FILES.find(entry => {
    const base = path.basename(path.dirname(entry.filePath));
    return base === skillName || entry.filePath.endsWith(`${path.sep}${skillName}${path.sep}SKILL.md`);
  })?.filePath || null;
}

const {
  DIMENSIONS,
  collectContext,
  buildDimensionPrompt,
  parseDimensionResponse,
  aggregateVerdict,
// audit-prompt-builder shim lives in lib/audit/ for standalone-compatible requires.
} = require('./audit-prompt-builder');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const DEFAULT_GRADER_CLI     = 'claude -p';
const DEFAULT_GRADER_TIMEOUT = 120_000;

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    skillName:      null,
    // Default audit output directory. Per SH-6481 N5, audit evidence
    // (per-skill findings/verdict/scorecard from real runs) is separated from
    // examples/ (protocol-stable specimens) — they were collocated under
    // examples/audits/ pre-2026-05-26 which confused "what's a worked example
    // I can read for guidance" with "what's the latest audit output for skill
    // X." New default: <workspace>/audits/<skill>/. The existing examples/audits/
    // tree under git history remains accessible; operators can `git mv` it on
    // a clean tree if they want to migrate.
    auditRoot:      path.join(_WORKSPACE, 'audits'),
    force:          false,
    dryRun:         false,
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
    } else if (a === '--dry-run') {
      result.dryRun = true;
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
  const lintScriptCandidates = [
    path.join(__dirname, 'skill-lint.js'),
    path.join(__dirname, '..', '..', 'scripts', 'skill-lint.js'),
  ];
  const lintScript = lintScriptCandidates.find(candidate => fs.existsSync(candidate)) || lintScriptCandidates[0];
  const result = spawnSync(
    process.execPath,
    [lintScript, skillDir, '--no-color'],
    {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SKILL_GRAPH_PACKAGE_ROOT: path.resolve(__dirname, '..', '..'),
        SKILL_GRAPH_WORKSPACE: process.env.SKILL_GRAPH_WORKSPACE || _WORKSPACE,
      },
    }
  );
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    exitCode: result.status === null ? 1 : result.status,
  };
}

// ---------------------------------------------------------------------------
// Drift runner (truth-layer Integrity Gate)
// ---------------------------------------------------------------------------

// Invoke scripts/skill-graph-drift.js for a single skill and return the
// per-skill report status. Subprocess pattern matches runLint above and avoids
// the standalone-install path-shim trap (the drift script lives in scripts/,
// not lib/audit/, so a direct require would escape lib/audit/'s boundary).
function runDrift(skillDir) {
  const driftScriptCandidates = [
    path.join(__dirname, '..', '..', 'scripts', 'skill-graph-drift.js'),
    path.join(__dirname, 'skill-graph-drift.js'),
  ];
  const driftScript = driftScriptCandidates.find(candidate => fs.existsSync(candidate));
  if (!driftScript) {
    return { ok: false, status: null, error: 'skill-graph-drift.js not found on either candidate path' };
  }

  const result = spawnSync(
    process.execPath,
    [driftScript, skillDir, '--json'],
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024 }
  );

  if (result.error) {
    return { ok: false, status: null, error: `drift spawn failed: ${result.error.message}` };
  }

  // Drift exits 0 on clean, 1 on DRIFT/BROKEN. Both are valid outcomes that
  // emit JSON; we only treat parse failure as an audit-completion error.
  try {
    const data = JSON.parse(result.stdout || '{}');
    const reports = Array.isArray(data.reports) ? data.reports : [];
    if (reports.length === 0) {
      return { ok: false, status: null, error: 'drift output had no reports for this skill' };
    }
    return { ok: true, status: reports[0].status, error: null };
  } catch (err) {
    const preview = (result.stdout || '').trim().slice(0, 200).replace(/\n/g, ' ');
    return { ok: false, status: null, error: `drift JSON parse failed: ${err.message} (preview: ${preview})` };
  }
}

// Map the drift sentinel's per-skill status to the four-verdict Health Block
// truth_verdict enum (PASS | DRIFT | BROKEN | UNVERIFIED). Rollup defined in
// SKILL_AUDIT_LOOP.md § The Inner Pipeline of `audit` — "OK → PASS, DRIFT →
// DRIFT, BROKEN → BROKEN, else UNVERIFIED". Accept legacy CLEAN for older
// drift outputs so historical artifacts remain readable.
// UNGROUNDED is treated as PASS because a skill with no truth_sources has
// nothing that could drift — the truth gate is vacuously satisfied.
function mapDriftStatusToTruthVerdict(driftStatus) {
  switch (driftStatus) {
    case 'CLEAN':
    case 'OK':
    case 'UNGROUNDED':
      return 'PASS';
    case 'DRIFT':
      return 'DRIFT';
    case 'BROKEN':
      return 'BROKEN';
    default:
      // STALE, NO_BASELINE, EXTERNAL_UNHASHED, NO_FRONTMATTER, and any future
      // states all roll up as UNVERIFIED — the audit-loop doc convention.
      return 'UNVERIFIED';
  }
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

function previewSubprocessOutput(run, maxLength = 500) {
  const combined = [run.stderr, run.stdout]
    .map(part => String(part || '').trim())
    .filter(Boolean)
    .join('\n');
  if (!combined) return 'no stdout/stderr emitted';
  const compact = combined.replace(/\s+/g, ' ').trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength - 1)}…` : compact;
}

function normalizeLintDiagnostics(lintRun, parsedDiagnostics, skillFile) {
  const diagnostics = Array.isArray(parsedDiagnostics) ? [...parsedDiagnostics] : [];
  const lintErrors = diagnostics.filter(d => d.severity === 'error');
  if (lintRun.exitCode !== 0 && lintErrors.length === 0) {
    diagnostics.push({
      severity: 'error',
      filePath: path.relative(_WORKSPACE, skillFile),
      line: 1,
      column: 1,
      message: `skill-lint.js exited ${lintRun.exitCode} without parseable diagnostics: ${previewSubprocessOutput(lintRun)}`,
      help: 'Fix the lint runner or schema/package-root resolution before stamping lint_verdict or structural_verdict as PASS.',
    });
  }
  return diagnostics;
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
  if (/deprecated/.test(d.message)) return 'Follow the migration note in docs/manifest-field-mapping.md § Migration Note — v1 → v2.';
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
  const context = collectContext({ skillDir, repoRoot: _WORKSPACE });
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
    { surface: 'grounding',    title: 'Grounding quality — claims vs truth sources',   note: 'If scope: project (or legacy scope: codebase), do all truth_sources exist? Do claims in the body match the referenced files? Classify any mismatch as skill drift, code drift, or doc drift.' },
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
    '# Seed Findings (Incomplete)',
    '',
    '> This file is a seed artifact from `skill-graph audit` without `--graded`. It records deterministic lint evidence plus explicit TODO review areas. It is not a completed qualitative audit until the TODO sections are replaced by reviewer or grader evidence.',
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
      'The skill passes the canonical-source schema lint gate: valid frontmatter, `schemas/skill.schema.json` validation, valid identifier shape, non-empty description, and parent-directory/name alignment.',
      'This does not certify relation semantics, truth fidelity, routing behavior, or teaching usefulness.',
      'Run the remaining Integrity Gate checks and Behavior Gate evals before promoting Health Block verdicts.',
    ].join(' ');
  } else if (errors.length === 0) {
    const warnList = warnings.map(w => `- ${w.message}`).join('\n');
    rationale = [
      `The skill passes canonical-source lint with ${warnings.length} warning(s) emitted by skill-lint.js:`,
      '',
      warnList,
      '',
      'Run the remaining Integrity Gate checks and Behavior Gate evals before promoting Health Block verdicts.',
    ].join('\n');
  } else {
    const errList = errors.map(e => `- ${e.message}`).join('\n');
    rationale = [
      `The skill fails deterministic lint with ${errors.length} error(s):`,
      '',
      errList,
      '',
      'All canonical-source lint errors must be resolved before qualitative review is meaningful. Re-run `node scripts/skill-lint.js <skill-name>` after each fix.',
    ].join('\n');
  }

  return [
    '# Seed Verdict (Incomplete)',
    '',
    '## Skill',
    '',
    `\`${skillName}\``,
    '',
    '## Audit Date',
    '',
    isoDate,
    '',
    '## Integrity Gate',
    '',
    verdict.replace('PASS WITH FIXES', 'PASS_WITH_FIXES'),
    '',
    '## Behavior Gate',
    '',
    'UNVERIFIED',
    '',
    '## Rationale',
    '',
    rationale,
    '',
    '## Human Judgment Required',
    '',
    'This is a seed verdict generated by `skill-graph audit` without `--graded`. It reflects only the focused canonical-source lint result plus the drift truth check.',
    'A human auditor or graded audit run must review the following before the Health Block verdicts are final:',
    '',
    '- Activation quality (routing coverage, keyword specificity)',
    '- Relation semantics (related/broader/boundary correctness)',
    '- Grounding fidelity (claims vs truth sources, when scope: project or legacy scope: codebase)',
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
  const warnings   = diagnostics.filter(d => d.severity === 'warn');
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
    metaNote  = `auto: ${schemaErrs.length} lint error(s) — canonical-source gate violated`;
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
    '# Seed Scorecard (Incomplete)',
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
    '> **Note:** This incomplete scorecard was generated by `node scripts/skill-audit.js` without `--graded`.',
    '> Canonical-source validity is auto-scored from `skill-lint.js` output.',
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
    '## Integrity Gate',
    '',
    finalVerdict.replace('PASS WITH FIXES', 'PASS_WITH_FIXES'),
    '',
    '## Behavior Gate',
    '',
    'UNVERIFIED',
    '',
    '## Dimension Rollup',
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
  const warnings   = diagnostics.filter(d => d.severity === 'warn');
  const schemaErrs = errors.filter(d => {
    const cat = inferCategory(d.message);
    return cat === 'Schema validity' || cat === 'Naming convention';
  });
  // v0.5.0: use the full 1–5 scale per `skills/evaluation/SKILL.md:69-106`
  // doctrine. 5 = zero lint errors and zero warnings. 4 = zero errors, some
  // warnings. 1 = lint errors present (the skill fails the canonical-source gate).
  let metaScore, metaNote;
  if (schemaErrs.length > 0) {
    metaScore = '1';
    metaNote  = `${schemaErrs.length} lint error(s) — canonical-source gate violated`;
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
    '> **Note:** Canonical-source validity is auto-scored from `skill-lint.js`. All other',
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
  const warnings = diagnostics.filter(d => d.severity === 'warn');
  if (warnings.length > 0) return 'PASS_WITH_FIXES';
  return 'PASS';
}

// ---------------------------------------------------------------------------
// Scope reader (fallback for when we don't collect full context)
// ---------------------------------------------------------------------------

function readScopeFromSkill(skillFilePath) {
  try {
    // parse-frontmatter shim lives in lib/audit/ for standalone-compatible requires.
    const { parseFrontmatter } = require('./parse-frontmatter');
    const text = fs.readFileSync(skillFilePath, 'utf8');
    const fm   = parseFrontmatter(text);
    return (fm && fm.scope) ? String(fm.scope) : null;
  } catch (e) {
    // SH-6540: surface parse failures instead of swallowing them. Lint upstream
    // normally fails-fast on broken YAML, but if it doesn't, the audit run
    // should leave a trail so the corrupted skill is investigable.
    console.warn(`[skill-audit] readScopeFromSkill failed for ${skillFilePath}: ${e.message}`);
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
    console.error('\nUsage: node scripts/skill-audit.js <skill-name> [--audit-root <path>] [--force] [--dry-run] [--graded [--grader-cli <cmd>] [--grader-timeout <ms>]]');
    process.exit(1);
  }

  const skillFile = findSkillFile(opts.skillName);
  if (!skillFile) {
    console.error(`error: skill not found in configured skill roots: ${opts.skillName}`);
    console.error(`       Available skills: ${SKILL_FILES.map(entry => path.basename(path.dirname(entry.filePath))).join(', ')}`);
    process.exit(1);
  }
  const skillDir = path.dirname(skillFile);

  // --dry-run: resolve skill, run lint, print summary — no file writes.
  if (opts.dryRun) {
    console.log(`dry-run: resolved skill '${opts.skillName}' → ${skillFile}`);
    const lintRun = runLint(skillDir);
    const diagnostics = normalizeLintDiagnostics(lintRun, parseLintOutput(lintRun.stderr), skillFile);
    const lintErrors = diagnostics.filter(d => d.severity === 'error');
    console.log(`dry-run: lint ${lintErrors.length === 0 ? 'PASS' : 'FAIL'} (exit ${lintRun.exitCode})`);
    console.log('dry-run: no files written.');
    process.exit(lintErrors.length === 0 ? 0 : 1);
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

  // Mode announce — name what this run will and will not produce BEFORE any work
  // starts (was previously announced only at the end of the run, which let the
  // reader spend the run cost before learning the artifact would be partial).
  if (opts.graded) {
    console.log(`Mode: GRADED audit on skills/${opts.skillName} — Integrity Gate (lint + drift) + Behavior Gate (comprehension + application graders). Stamps all four verdicts.`);
  } else {
    console.log(`Mode: INTEGRITY-only audit on skills/${opts.skillName} (no --graded) — runs lint + drift, stamps structural_verdict + truth_verdict + last_audited. Qualitative scorecard dimensions are written as TODO placeholders for human review. Re-run with --graded to invoke the grader and stamp comprehension_verdict + application_verdict.`);
  }

  console.log(`Running skill-lint.js on skills/${opts.skillName}…`);
  const lintRun = runLint(skillDir);
  const diagnostics = normalizeLintDiagnostics(lintRun, parseLintOutput(lintRun.stderr), skillFile);
  const lintErrors   = diagnostics.filter(d => d.severity === 'error');
  const lintWarnings = diagnostics.filter(d => d.severity === 'warn');
  if (lintErrors.length === 0) {
    console.log(`  lint: PASS${lintWarnings.length > 0 ? ` (${lintWarnings.length} warning(s))` : ''}`);
  } else {
    console.log(`  lint: FAIL (${lintErrors.length} error(s), ${lintWarnings.length} warning(s))`);
  }

  // Integrity Gate Phase 2 — truth via inline drift sentinel. Per
  // SKILL_AUDIT_LOOP.md § "The Inner Pipeline of `audit`", the drift check
  // runs in the same pass as lint and feeds truth_verdict into the Health
  // Block. Without this call, truth_verdict would stay UNVERIFIED on every
  // skill (the gap SH-6481 Task 1 fixes).
  console.log(`Running skill-graph-drift.js on skills/${opts.skillName}…`);
  const drift = runDrift(skillDir);
  if (drift.ok) {
    console.log(`  drift: ${drift.status}`);
  } else {
    console.log(`  drift: ERROR — ${drift.error}`);
  }

  const isoDate = new Date().toISOString().slice(0, 10);

  let findingsMd, verdictMd, scorecardMd, summaryTail;

  if (!opts.graded) {
    // ---- Integrity-Gate-only path ----
    // Writes structural_verdict + lint_verdict + last_audited to the Health
    // Block (see below). The qualitative dimensions in findings.md remain
    // human-TODO until --graded runs or an auditor fills them in.
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

  console.log(`\nWrote ${path.relative(_WORKSPACE, outDir)}/{findings,verdict,scorecard}.md — ${summaryTail}`);

  // Stamp Integrity Gate verdicts back into the skill's own Health Block. Until
  // this step ran, the audit produced evidence artifacts but the SKILL.md
  // structural_verdict / truth_verdict stayed UNVERIFIED — the gap SH-6481
  // F14 / SAL-1 caught. Both Integrity layers (structural from lint, truth
  // from drift) are now written here; the Behavior Gate verdicts
  // (comprehension_verdict / application_verdict) still require --graded.
  const lintVerdict = lintErrors.length > 0 ? 'FAIL' : 'PASS';
  const structuralVerdict = lintErrors.length > 0 ? 'FAIL' : 'PASS';
  // truth_verdict: PASS/DRIFT/BROKEN when drift ran successfully; UNVERIFIED
  // when the drift subprocess errored (so the audit doesn't silently claim
  // PASS on a truth gate we couldn't actually run — same SAL-7 anti-pattern
  // the F14 fix existed to prevent).
  const truthVerdict = drift.ok ? mapDriftStatusToTruthVerdict(drift.status) : 'UNVERIFIED';
  const healthFields = {
    last_audited: isoDate,
    lint_verdict: lintVerdict,
    structural_verdict: structuralVerdict,
    truth_verdict: truthVerdict,
  };

  try {
    const skillMdContent = fs.readFileSync(skillFile, 'utf8');
    const updated = updateFrontmatterFields(skillMdContent, healthFields);
    if (updated !== skillMdContent) {
      fs.writeFileSync(skillFile, updated, 'utf8');
      console.log(`Stamped Health Block on ${path.relative(_WORKSPACE, skillFile)}:`);
      for (const [k, v] of Object.entries(healthFields)) console.log(`  ${k}: ${v}`);
      if (!drift.ok) {
        console.log(`  (truth_verdict left UNVERIFIED — drift sentinel did not run cleanly: ${drift.error})`);
      }
      console.log('  comprehension_verdict / application_verdict: (unchanged — run --graded with grader CLI to populate)');
    } else {
      console.log(`Health Block already current on ${path.relative(_WORKSPACE, skillFile)} — no fields changed.`);
    }
  } catch (err) {
    // Surface the failure loudly. Silent swallow would re-create the SAL-7 silent-fail pattern.
    console.error(`error: Health Block write-back FAILED for ${skillFile}: ${err.message}`);
    console.error('       The audit artifacts under', outDir, 'were still written.');
    process.exitCode = 2;
  }

  // If the drift subprocess itself errored (not just emitted DRIFT/BROKEN
  // verdicts — those are legitimate findings), surface that loudly as an
  // audit-completion failure. Same SAL-7-prevention pattern.
  if (!drift.ok) {
    console.error(`warning: truth gate did not run cleanly — ${drift.error}`);
    process.exitCode = process.exitCode || 2;
  }

  if (lintErrors.length > 0) {
    console.log('\nNext step: fix the lint errors listed in findings.md, then re-run skill-audit.js --force.');
  } else if (!opts.graded) {
    console.log('\nNext step: open findings.md and complete the human-judgment TODO sections, or re-run with --graded to invoke the grader.');
  } else {
    console.log('\nNext step: address the graded findings in findings.md, then re-run with --force to refresh the verdict.');
  }
}

main();
