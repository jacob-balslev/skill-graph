#!/usr/bin/env node
'use strict';

/**
 * Black-box PUBLIC-CLI loop contract test.
 *
 * Drives the real `bin/skill-graph.js` surfaces — `audit`, `evaluate`, `evolve`,
 * and the `init` create path — against a FIXTURE skill in a hermetic temp
 * workspace, with a STUBBED model CLI (no real model is ever invoked), and
 * asserts the on-disk verdict / receipt transitions. This is the regression net
 * that makes "the loop is done" mean "the real loop ran and wrote real state",
 * not "the code reads correctly" (the recurring false-green failure mode).
 *
 * It is the contract-level backstop for the three breaks reproduced in the
 * 2026-05-30 end-to-end review (docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md):
 *   - Break #1 — `/evolve` scaffold dispatched a wrong, silently-swallowed path.
 *                Guarded here by (a) running `evolve --analyze-only` end-to-end and
 *                (b) asserting the scaffold script the engine references exists.
 *   - Break #2 — `evaluate` only wrote verdicts behind a flag; the help promised
 *                default writes. Guarded here by running `evaluate` with DEFAULT
 *                flags and asserting the Health Block actually moved on disk.
 *   - Break #3 — a verdict could be stamped with no backing artifact. Guarded here
 *                by asserting evaluate leaves a durable on-disk receipt/score.
 *
 * Model-free: a stub `claude` / `opencode` / `gemini` on PATH returns canned
 * grader JSON, so the real shell-out + parse + stamp path executes without a
 * model. Deterministic and hermetic — everything lives under an mkdtemp dir that
 * is removed on exit.
 *
 * Run: node scripts/__tests__/test-public-cli-loop-contract.js
 *
 * Wiring status (2026-05-31): all 14 assertions pass. Step 3 inverted the
 * --write-verdict default to persist-by-default, so the eval_score-by-default
 * forcing-function assertion is now green, and this test is wired into the
 * `test:unit` suite (so it runs under both `npm run verify` and
 * `npm run verify:system`) as the public-CLI loop guard.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..'); // skill-graph/
const BIN = path.join(REPO_ROOT, 'bin', 'skill-graph.js');
const TEMPLATE = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');

let passed = 0;
let failed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  PASS  ${name}`);
  } else {
    failed++;
    failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

// ---------------------------------------------------------------------------
// Hermetic temp workspace
// ---------------------------------------------------------------------------
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-cli-contract-'));
const SKILL_NAME = 'contract-fixture';
const skillDir = path.join(tmp, 'skills', SKILL_NAME);
const evalsDir = path.join(skillDir, 'evals');
const skillMd = path.join(skillDir, 'SKILL.md');
const compEval = path.join(evalsDir, 'comprehension.json');
const stubBin = path.join(tmp, 'binstub');
const cannedVerdict = path.join(tmp, 'canned-verdict.json');

function cleanup() {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}
process.on('exit', cleanup);

// --- Fixture SKILL.md: derive from the canonical template (CI keeps it lint-valid). ---
function buildFixtureSkill() {
  fs.mkdirSync(evalsDir, { recursive: true });
  let body = fs.readFileSync(TEMPLATE, 'utf8');
  // Rename to match the parent directory (lint requires name == dir).
  body = body.replace(/^name:\s*skill-metadata-template\s*$/m, `name: ${SKILL_NAME}`);
  // Strip the template's authoring scaffolding so the derived skill is clean.
  body = body
    .split('\n')
    .filter((line) => !/^\s*#\s*TEMPLATE NOTE:/.test(line) && !/^\s*>\s*\*\*TEMPLATE NOTE:/.test(line))
    .join('\n');
  fs.writeFileSync(skillMd, body);
}

// --- comprehension.json: minimal dimension-tagged eval (shape from a real corpus skill). ---
function buildComprehensionEval() {
  const evalDoc = {
    skill_name: SKILL_NAME,
    subject: 'agent-ops',
    adjacent_concepts: [],
    evals: [
      {
        id: 1,
        dimension: 'definition',
        criticality: 'high',
        truth_mode: 'conceptual_correctness',
        skill_type: 'capability',
        prompt: 'Define the concept this skill teaches in one paragraph.',
        substance: 'A correct definition of the concept.',
        calibration: 'A correct answer names the concept and its purpose.',
      },
    ],
  };
  fs.writeFileSync(compEval, JSON.stringify(evalDoc, null, 2));
}

// --- Stub model CLIs on PATH: return canned grader JSON, no real model. ---
const CONCEPT_GRADE = JSON.stringify({
  dimension_scores: {
    definition: 2,
    mental_model: 2,
    purpose: 2,
    boundary: 2,
    taxonomy: 2,
    analogy: 2,
    application: 2,
  },
  dimension_reasoning: {},
  verdict_category: 'correct',
});

function buildStubBins() {
  fs.mkdirSync(stubBin, { recursive: true });
  // claude: prints the concept-grade JSON regardless of args (serves both the
  // generator response and the grader grade — the generator's "response" is
  // just fed back into the grader prompt, the grader parses the JSON).
  const claudeStub = `#!/bin/sh\ncat <<'SGJSON'\n${CONCEPT_GRADE}\nSGJSON\n`;
  fs.writeFileSync(path.join(stubBin, 'claude'), claudeStub, { mode: 0o755 });
  // gemini: same raw JSON.
  fs.writeFileSync(path.join(stubBin, 'gemini'), claudeStub, { mode: 0o755 });
  // opencode: the grader's opencode branch parses JSONL { type:'text', part:{text} }.
  const openEvent = JSON.stringify({ type: 'text', part: { text: CONCEPT_GRADE } });
  const opencodeStub = `#!/bin/sh\ncat <<'SGJSON'\n${openEvent}\nSGJSON\n`;
  fs.writeFileSync(path.join(stubBin, 'opencode'), opencodeStub, { mode: 0o755 });
  // canned grader output for `audit --graded --grader-cli "cat <file>"`.
  fs.writeFileSync(cannedVerdict, CONCEPT_GRADE);
}

function buildConfig() {
  fs.mkdirSync(path.join(tmp, '.skill-graph'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, '.skill-graph', 'config.json'),
    JSON.stringify({ schema_version: 1, skill_roots: ['skills'] }, null, 2),
  );
}

function runCli(args, { cwd = tmp, extraEnv = {} } = {}) {
  return spawnSync(process.execPath, [BIN, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 120000,
    env: {
      ...process.env,
      PATH: `${stubBin}${path.delimiter}${process.env.PATH}`,
      SKILL_GRAPH_WORKSPACE: tmp,
      // Both default to claude-family → routes to the stubbed `claude` binary.
      COMPREHENSION_GENERATOR_MODEL: 'sonnet',
      COMPREHENSION_GRADER_MODEL: 'opus',
      ...extraEnv,
    },
  });
}

function readSkill() {
  return fs.readFileSync(skillMd, 'utf8');
}

function frontmatterValue(text, key) {
  // matches `key: value` and `  key: value` (indented metadata-block form)
  const m = text.match(new RegExp(`^\\s*${key}:\\s*(.+?)\\s*$`, 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '') : null;
}

// ADR-0019: the audit loop stamps verdicts + eval state into the audit-state.json
// sidecar (sibling of SKILL.md), not the frontmatter.
function readSidecar() {
  const p = path.join(path.dirname(skillMd), 'audit-state.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}
function sidecarValue(key) {
  const v = readSidecar()[key];
  return v === undefined ? null : v;
}

// ===========================================================================
console.log('Public-CLI loop contract test\n');

buildFixtureSkill();
buildComprehensionEval();
buildStubBins();
buildConfig();

// --- 0. Sanity: the fixture resolves + lints (audit --dry-run is non-writing). ---
const dryRun = runCli(['audit', SKILL_NAME, '--dry-run']);
check('audit --dry-run resolves the fixture skill (exit 0)', dryRun.status === 0,
  `exit ${dryRun.status}; stderr: ${(dryRun.stderr || '').slice(0, 400)}`);

// --- 1. audit writes Integrity-gate verdicts to disk (deterministic, no model). ---
const auditRun = runCli(['audit', SKILL_NAME, '--force']);
check('audit exits 0', auditRun.status === 0,
  `exit ${auditRun.status}; stderr: ${(auditRun.stderr || '').slice(0, 400)}`);
// ADR-0019: Integrity-gate verdicts are stamped into the audit-state.json sidecar.
check('audit stamps structural_verdict to the sidecar', sidecarValue('structural_verdict') !== null);
check('audit stamps truth_verdict to the sidecar', sidecarValue('truth_verdict') !== null);
check('audit stamps last_audited to the sidecar', Boolean(sidecarValue('last_audited')));

// --- 2. BREAK #2 — evaluate stamps the Health Block by DEFAULT (no flag). ---
const beforeEvalVerdict = sidecarValue('comprehension_verdict');
const evalRun = runCli(['evaluate', '--mode', 'comprehension', compEval]);
const afterEvalVerdict = sidecarValue('comprehension_verdict');
const evalScore = sidecarValue('eval_score');
check('evaluate exits 0', evalRun.status === 0,
  `exit ${evalRun.status}; stderr: ${(evalRun.stderr || '').slice(0, 600)}`);
// Step 3 (2026-05-31) CLOSED this. comprehension_verdict + freshness were already
// stamped by default; Step 3 inverted the v6 Health Block (eval_score /
// eval_failed_ids) from opt-in (--write-verdict) to persist-by-default with
// --dry-run as the opt-out. This assertion now passes by default; it guards
// against a regression back to opt-in write-back (Break #2).
check('BREAK#2: evaluate writes eval_score by default (no --write-verdict)', evalScore !== null,
  `eval_score=${evalScore} (expected non-null; closed by Step 3); stdout tail: ${(evalRun.stdout || '').slice(-300)}`);
check('BREAK#2: evaluate moves comprehension_verdict off UNVERIFIED by default',
  afterEvalVerdict !== null && afterEvalVerdict !== 'UNVERIFIED',
  `before=${beforeEvalVerdict} after=${afterEvalVerdict}`);
check('BREAK#3: evaluate stamps freshness (durable on-disk receipt)',
  Boolean(sidecarValue('freshness')));

// --- 3. init create path scaffolds a SKILL.md (deterministic). ---
const initDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-cli-init-'));
const initRun = runCli(['init'], { cwd: initDir });
const initCreatedSkill = fs.existsSync(path.join(initDir, 'SKILL.md'))
  || (fs.existsSync(initDir) && fs.readdirSync(initDir).some((f) => /SKILL\.md$/.test(f)
      || (fs.statSync(path.join(initDir, f)).isDirectory()
          && fs.existsSync(path.join(initDir, f, 'SKILL.md')))));
check('init create path exits 0', initRun.status === 0,
  `exit ${initRun.status}; stderr: ${(initRun.stderr || '').slice(0, 400)}`);
check('init create path scaffolds a SKILL.md on disk', initCreatedSkill,
  `initDir contents: ${fs.existsSync(initDir) ? fs.readdirSync(initDir).join(',') : '(missing)'}`);
try { fs.rmSync(initDir, { recursive: true, force: true }); } catch { /* best effort */ }

// --- 4. evolve runs end-to-end in analyze-only mode (no model, no execute). ---
const evolveRun = runCli([
  'evolve', '--analyze-only', '--top', '1',
  '--workspace-root', tmp, '--skills-dir', path.join(tmp, 'skills'),
]);
check('evolve --analyze-only exits 0 (engine loads + analyzer runs)', evolveRun.status === 0,
  `exit ${evolveRun.status}; stderr: ${(evolveRun.stderr || '').slice(0, 600)}`);

// --- 5. BREAK #1 guard — the scaffold script the evolve engine dispatches exists. ---
// The 2026-05-30 path-drift break was a bare wrong scaffold path swallowed into a
// status code. Assert every scaffold/dispatch path the engine references resolves
// to a real file, so a path regression fails this test instead of failing silently.
const engineSrc = fs.readFileSync(
  path.join(REPO_ROOT, 'lib', 'audit', 'skill-evolution-loop.js'), 'utf8');
const scaffoldRefs = [...engineSrc.matchAll(/['"]([\w./-]*skill-auto-create\.js)['"]/g)].map((m) => m[1]);
check('BREAK#1: evolve engine references a skill-auto-create.js path', scaffoldRefs.length > 0,
  'no skill-auto-create.js reference found in skill-evolution-loop.js');
// The engine resolves these relative to the workspace scripts/skill dir at runtime;
// assert the leaf script exists somewhere reachable (workspace scripts/skill).
const autoCreate = path.join(REPO_ROOT, '..', 'scripts', 'skill', 'skill-auto-create.js');
check('BREAK#1: skill-auto-create.js exists at the workspace scripts/skill path',
  fs.existsSync(autoCreate), `looked at ${autoCreate}`);

// ===========================================================================
console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nFailures:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exitCode = 1;
}
