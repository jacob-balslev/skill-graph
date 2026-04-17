#!/usr/bin/env node
/**
 * Skill Audit Stub Generator
 *
 * Seeds three audit artifact stubs from lint output, leaving all qualitative
 * judgment as human TODOs. Designed to accelerate the Step 2–9 sequence in
 * docs/skill-audit-loop.md by pre-populating deterministic findings so
 * auditors can focus on routing, content, and eval quality.
 *
 * Usage:
 *   node scripts/skill-audit.js <skill-name>
 *   node scripts/skill-audit.js <skill-name> --audit-root <path>
 *   node scripts/skill-audit.js <skill-name> --force
 *   node scripts/skill-audit.js <skill-name> --audit-root audits/ --force
 *
 * Produces under <audit-root>/<skill-name>/:
 *   findings.md   — lint-derived findings + human-judgment TODOs
 *   verdict.md    — stub verdict based on lint outcome
 *   scorecard.md  — 7 dimension rows with schema validity auto-scored
 *
 * Self-contained. Only uses Node built-ins. No external dependencies.
 * Exit 0 on success, 1 on any error.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT  = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    skillName: null,
    auditRoot: path.join(REPO_ROOT, 'examples', 'audits'),
    force:     false,
    errors:    [],
  };

  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a === '--audit-root') {
      i++;
      if (!args[i]) {
        result.errors.push('--audit-root requires a path argument');
      } else {
        result.auditRoot = path.resolve(args[i]);
      }
    } else if (a === '--force') {
      result.force = true;
    } else if (!a.startsWith('--')) {
      if (result.skillName) {
        result.errors.push(`unexpected positional argument: ${a}`);
      } else {
        result.skillName = a;
      }
    } else {
      result.errors.push(`unknown flag: ${a}`);
    }
    i++;
  }

  if (!result.skillName) {
    result.errors.push('missing required argument: <skill-name>');
  }

  return result;
}

// ---------------------------------------------------------------------------
// Lint runner — spawns skill-lint.js as a child process and captures output
// ---------------------------------------------------------------------------

/**
 * Run skill-lint.js against the given skill directory.
 *
 * @param {string} skillDir - Absolute path to the skill directory.
 * @returns {{ stdout: string, stderr: string, exitCode: number }}
 */
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
 * Diagnostic tuple extracted from lint stderr.
 *
 * @typedef {object} LintDiagnostic
 * @property {'error'|'warn'} severity
 * @property {string} filePath
 * @property {number} line
 * @property {number} column
 * @property {string} message
 * @property {string|null} help
 */

/**
 * Parse the lint stderr output into structured diagnostic tuples.
 *
 * skill-lint.js emits diagnostics in this format (with --no-color):
 *
 *   [error] skills/a11y/SKILL.md:3:1
 *   (blank)
 *   > 3 | schema_version: 2
 *       ^ some message
 *   (blank or more frame lines)
 *   (blank)
 *     help: optional help text
 *   (blank)
 *
 * The parser collects the [error]/[warn] header lines and the caret message
 * lines. It does NOT attempt to parse full code frames — it only extracts
 * the minimal (file, line, col, severity, message) tuple needed for findings.
 *
 * @param {string} stderr - Raw stderr from the lint child process.
 * @returns {LintDiagnostic[]}
 */
function parseLintOutput(stderr) {
  const diagnostics = [];
  const lines = stderr.split('\n');

  // State machine: walk the lines, collecting header + caret pairs.
  // A diagnostic block starts with a [error] or [warn] header line:
  //   [error] skills/foo/SKILL.md:12:3
  // followed by frame lines, then a caret line:
  //     ^ message text here

  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match the severity+location header line.
    // Pattern: [error] path/to/file.md:line:col
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

    // Match the caret line: spaces + ^ + space + message
    // e.g.  "        ^ unknown field: nme"
    if (current && current.message === '') {
      const caretMatch = line.match(/^\s*\^\s+(.+)$/);
      if (caretMatch) {
        current.message = caretMatch[1].trim();
        continue;
      }
    }

    // Match a help line: "  help: ..."
    if (current && line.match(/^\s+help:\s+/)) {
      current.help = line.replace(/^\s+help:\s+/, '').trim();
      continue;
    }
  }

  if (current) diagnostics.push(current);

  // Filter out diagnostics without a parsed message (incomplete blocks).
  return diagnostics.filter(d => d.message !== '');
}

// ---------------------------------------------------------------------------
// Category inference from message text
// ---------------------------------------------------------------------------

/**
 * Infer a human-readable category from a lint error/warn message.
 *
 * @param {string} message
 * @returns {string}
 */
function inferCategory(message) {
  if (/missing required field|unknown field|enum|pattern|minLength|oneOf|sub-field/.test(message)) {
    return 'Schema validity';
  }
  if (/parent directory|name/.test(message)) {
    return 'Naming convention';
  }
  if (/relations\.|adjacent|boundary|verify_with|depends_on/.test(message)) {
    return 'Relation quality';
  }
  if (/eval_artifacts|eval_state|routing_eval/.test(message)) {
    return 'Eval quality';
  }
  if (/grounding|domain_object|truth_sources/.test(message)) {
    return 'Grounding quality';
  }
  if (/section|Coverage|Philosophy|Verification|Do NOT/.test(message)) {
    return 'Content quality';
  }
  if (/keywords|description|routing/.test(message)) {
    return 'Activation quality';
  }
  if (/deprecated|migration|rename|v1/.test(message)) {
    return 'Schema migration';
  }
  return 'Lint diagnostic';
}

/**
 * Derive a recommended fix suggestion from the diagnostic.
 *
 * @param {LintDiagnostic} d
 * @returns {string}
 */
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
  if (/not in enum/.test(d.message)) {
    return 'Replace the value with one of the canonical enum values listed in docs/field-reference.md.';
  }
  if (/does not match any known skill/.test(d.message)) {
    return 'Check the skill name for typos or remove the dangling relation target.';
  }
  if (/deprecated/.test(d.message)) {
    return 'Follow the migration note in docs/manifest-contract.md § Migration Note — v1 → v2.';
  }
  return 'Inspect the flagged line, correct the value, and re-run skill-lint.js.';
}

// ---------------------------------------------------------------------------
// Artifact template builders
// ---------------------------------------------------------------------------

/**
 * Build the findings.md stub.
 *
 * @param {string} skillName
 * @param {LintDiagnostic[]} diagnostics
 * @param {string} isoDate - e.g. "2026-04-17"
 * @returns {string}
 */
function buildFindings(skillName, diagnostics, isoDate) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');

  // Assign finding IDs to lint-derived issues, then add human-judgment TODOs.
  const findingBlocks = [];
  let fIndex = 1;

  // Lint-derived findings — one per diagnostic.
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

  // Human-judgment placeholder findings always appended.
  const humanJudgmentTodos = [
    { id: `F${fIndex++}`,   surface: 'activation',   title: 'Activation quality — routing coverage',         note: 'Does the description name real trigger scenarios? Are keywords specific and not generic filler? Does the skill under-trigger or over-trigger for its intended use case?' },
    { id: `F${fIndex++}`,   surface: 'relations',     title: 'Relation quality — graph correctness',          note: 'Do adjacent/boundary/verify_with relations point at semantically correct neighbors? Are boundary rules crisp enough to prevent misuse? Are dependencies real?' },
    { id: `F${fIndex++}`,   surface: 'grounding',     title: 'Grounding quality — claims vs truth sources',   note: 'If scope: codebase, do all truth_sources exist? Do claims in the body match the referenced files? Classify any mismatch as skill drift, code drift, or doc drift.' },
    { id: `F${fIndex++}`,   surface: 'content',       title: 'Content quality — completeness and density',    note: 'Does the skill have a clear Coverage section, a Philosophy section, at least one decision table or checklist, and explicit negative bounds (Do NOT Use When)? Does it contain generic filler that adds no routing signal?' },
    { id: `F${fIndex++}`,   surface: 'evals',         title: 'Eval quality — coverage and realism',           note: 'Do eval files exist if the skill is expected to be graded? Do they test realistic prompts — not trivia — and cover boundaries and failure cases as well as the happy path?' },
  ];

  for (const todo of humanJudgmentTodos) {
    findingBlocks.push([
      `ID: ${todo.id}`,
      `Severity: TODO`,
      `Surface: ${todo.surface}`,
      `Category: ${todo.title}`,
      `Problem: TODO — human judgment required`,
      `Evidence: TODO — reviewer must inspect the skill body`,
      `Required action: ${todo.note}`,
    ].join('\n'));
  }

  // Required fixes section.
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
    verdictLabel(diagnostics),
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

/**
 * Build the verdict.md stub.
 *
 * @param {string} skillName
 * @param {LintDiagnostic[]} diagnostics
 * @param {string} isoDate
 * @returns {string}
 */
function buildVerdict(skillName, diagnostics, isoDate) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');
  const verdict  = verdictLabel(diagnostics);

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
    '- Relation semantics (adjacency correctness, boundary crispness)',
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

/**
 * Build the scorecard.md stub.
 *
 * Schema validity is auto-scored from lint; all other dimensions are TODO.
 * When scope is portable the grounding row is N/A.
 *
 * @param {string}           skillName
 * @param {LintDiagnostic[]} diagnostics
 * @param {string|null}      scope       - Value of the `scope:` frontmatter field.
 * @returns {string}
 */
function buildScorecard(skillName, diagnostics, scope) {
  const errors     = diagnostics.filter(d => d.severity === 'error');
  const schemaErrs = errors.filter(d => {
    const cat = inferCategory(d.message);
    return cat === 'Schema validity' || cat === 'Naming convention';
  });

  const metaScore = schemaErrs.length === 0 ? '5 (auto: lint passes)' : `0 (auto: ${schemaErrs.length} lint error(s))`;
  const groundingRow = scope === 'portable'
    ? 'N/A | `scope: portable` — grounding dimension does not apply'
    : 'TODO | Human review required — verify claims match truth sources';

  const rows = [
    `| Metadata validity | ${metaScore} |`,
    '| Activation quality | TODO | Human review required — see findings.md |',
    '| Relation quality | TODO | Human review required — see findings.md |',
    `| Grounding fidelity | ${groundingRow} |`,
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
// Verdict label helper
// ---------------------------------------------------------------------------

/**
 * Derive the canonical verdict label from lint diagnostics.
 *
 * Lint errors → FAIL.
 * Lint warnings only → PASS WITH FIXES.
 * No lint issues → PASS WITH FIXES (pending human review).
 *
 * The human reviewer will update this label after qualitative inspection.
 *
 * @param {LintDiagnostic[]} diagnostics
 * @returns {string}
 */
function verdictLabel(diagnostics) {
  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');
  if (errors.length > 0)   return 'FAIL';
  if (warnings.length > 0) return 'PASS WITH FIXES';
  return 'PASS WITH FIXES';   // pending qualitative human review
}

// ---------------------------------------------------------------------------
// Read frontmatter scope from the skill file (best-effort, no hard dep)
// ---------------------------------------------------------------------------

/**
 * Extract the `scope:` value from a SKILL.md frontmatter block.
 * Returns null if the file cannot be read or parsed.
 *
 * @param {string} skillFilePath
 * @returns {string|null}
 */
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
  const { skillName, auditRoot, force, errors: argErrors } = parseArgs(process.argv);

  if (argErrors.length > 0) {
    for (const e of argErrors) console.error(`error: ${e}`);
    console.error('\nUsage: node scripts/skill-audit.js <skill-name> [--audit-root <path>] [--force]');
    process.exit(1);
  }

  // 1. Validate skill directory exists.
  const skillDir  = path.join(SKILLS_DIR, skillName);
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

  // 2. Determine output directory.
  const outDir = path.join(auditRoot, skillName);

  // 3. Guard against overwriting existing artifacts unless --force.
  const targetFiles = ['findings.md', 'verdict.md', 'scorecard.md'];
  if (!force) {
    const existing = targetFiles.filter(f => fs.existsSync(path.join(outDir, f)));
    if (existing.length > 0) {
      console.error(`error: audit artifacts already exist in ${outDir}`);
      console.error(`       Existing files: ${existing.join(', ')}`);
      console.error('       Pass --force to overwrite.');
      process.exit(1);
    }
  }

  // 4. Run lint and capture output.
  console.log(`Running skill-lint.js on skills/${skillName}…`);
  const { stderr, exitCode } = runLint(skillDir);
  const diagnostics = parseLintOutput(stderr);

  const errors   = diagnostics.filter(d => d.severity === 'error');
  const warnings = diagnostics.filter(d => d.severity === 'warn');

  if (exitCode === 0) {
    console.log(`  lint: PASS${warnings.length > 0 ? ` (${warnings.length} warning(s))` : ''}`);
  } else {
    console.log(`  lint: FAIL (${errors.length} error(s), ${warnings.length} warning(s))`);
  }

  // 5. Read scope for scorecard grounding row.
  const scope = readScopeFromSkill(skillFile);

  // 6. Determine today's date for timestamps.
  const isoDate = new Date().toISOString().slice(0, 10);

  // 7. Build the three artifact stubs.
  const findingsMd  = buildFindings(skillName, diagnostics, isoDate);
  const verdictMd   = buildVerdict(skillName, diagnostics, isoDate);
  const scorecardMd = buildScorecard(skillName, diagnostics, scope);

  // 8. Write output files.
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'findings.md'),  findingsMd,  'utf8');
  fs.writeFileSync(path.join(outDir, 'verdict.md'),   verdictMd,   'utf8');
  fs.writeFileSync(path.join(outDir, 'scorecard.md'), scorecardMd, 'utf8');

  // 9. Print summary.
  const humanTodoCount = 5; // fixed: the 5 qualitative TODO findings always appended
  console.log(
    `\nCreated ${path.relative(REPO_ROOT, outDir)}/{findings,verdict,scorecard}.md` +
    ` — ${diagnostics.length} lint finding(s) stubbed, ${humanTodoCount} human-judgment TODOs.`
  );

  if (errors.length > 0) {
    console.log('\nNext step: fix the lint errors listed in findings.md, then re-run skill-audit.js --force.');
  } else {
    console.log('\nNext step: open findings.md and complete the human-judgment TODO sections.');
  }
}

main();
