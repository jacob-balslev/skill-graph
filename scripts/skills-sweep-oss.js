#!/usr/bin/env node
/**
 * skills-sweep-oss.js — Karpathy-style autonomous sweep for the Skill Graph
 * open-source starter library.
 *
 * Iterates every production SKILL.md (skills/<name>/SKILL.md) and runs a
 * five-phase loop per skill:
 *
 *   ANALYZE  → parse frontmatter + body, compute deterministic health signals
 *   TRIAGE   → merge with library-wide state; decide skip / audit / fix
 *   EXECUTE  → invoke the pluggable editor command (if any) to apply fixes
 *   VERIFY   → re-run every gate; refuse promotion if ANY gate regresses
 *   PROMOTE  → stage edits, append to the ledger, release the checkpoint
 *
 * The scaffold `examples/skill-template.md` is explicitly excluded — it is a
 * teaching artifact, not a production skill (see the SCAFFOLD banner in that
 * file). Every other SKILL.md is eligible.
 *
 * Verification gates (library-wide, run once before and once after the sweep):
 *
 *   1. node scripts/skill-lint.js --include-template --strict
 *   2. node scripts/check-contract-consistency.js
 *   3. node scripts/skill-graph-routing-eval.js --manifest <generated>
 *   4. node scripts/skill-graph-drift.js --check (where drift_check present)
 *   5. redaction grep — rejects any personal / workspace-specific string
 *      that would leak private context into the open-source library
 *
 * The redaction pass is the load-bearing guard that keeps the OSS variant
 * portable. It runs on (a) every edited SKILL.md and (b) the final git diff.
 *
 * Checkpointing:
 *   state at `audits/_state/sweep.json` — one line per skill with
 *   {claimed_at, completed_at, findings_hash, verdict}. Safe to resume mid-
 *   sweep; the next invocation skips completed skills unless --force-all.
 *
 * Usage:
 *   node scripts/skills-sweep-oss.js                          # stub mode: audit + report, no edits
 *   node scripts/skills-sweep-oss.js --dry-run                # STEPS 1-4 only, prints plan, no edits, no commits
 *   node scripts/skills-sweep-oss.js --skill <name>           # one skill only
 *   node scripts/skills-sweep-oss.js --max-skills 3           # cap this run
 *   node scripts/skills-sweep-oss.js --resume                 # skip skills already marked completed
 *   node scripts/skills-sweep-oss.js --force-all              # ignore checkpoint
 *   node scripts/skills-sweep-oss.js --editor-cmd "<cmd>"     # invoke editor on each skill; --dry-run still skips it
 *   node scripts/skills-sweep-oss.js --stratum <codebase|reference|portable>
 *   node scripts/skills-sweep-oss.js --no-commit              # do not git commit; stage edits only
 *
 * The editor command receives three env vars when invoked:
 *   SKILL_GRAPH_SKILL_DIR      = absolute path to skills/<name>/
 *   SKILL_GRAPH_FINDINGS_PATH  = absolute path to audits/<name>/findings.md
 *   SKILL_GRAPH_SKILL_NAME     = <name>
 * Any LLM CLI (claude, codex, gemini, etc.) that can accept a markdown
 * findings file + edit SKILL.md in place satisfies the contract. Default is
 * stub mode — no editor is invoked, the sweep reports findings only.
 *
 * Exit codes:
 *   0  every skill PASSED or was SKIPPED (clean state)
 *   1  usage error or missing prerequisite
 *   2  at least one skill FAILED verification (fix + re-run)
 *   3  redaction guard rejected a change (personal data leak blocked)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const AUDITS_DIR = path.join(REPO_ROOT, 'audits');
const STATE_DIR = path.join(AUDITS_DIR, '_state');
const CHECKPOINT_PATH = path.join(STATE_DIR, 'sweep.json');
const LEDGER_PATH = path.join(AUDITS_DIR, 'sweep-ledger.jsonl');
const MANIFEST_PATH = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');

// ─── Redaction deny-list ────────────────────────────────────────────────────
//
// These strings MUST NOT appear in any Skill Graph SKILL.md, manifest entry,
// or plan document. They identify the private workspace this OSS library was
// extracted from. The guard runs twice per edit (on the file, then on the
// git diff) and hard-fails the sweep if any match is found. This is the
// scaffold that keeps the "personal" vs "open-source" split honest.
//
// Adding to the list is a one-sided ratchet — items get added when a leak is
// discovered, never removed. A whitelist approach would be tighter but
// requires a corpus we do not have; the deny-list approach catches the
// specific identifiers known to exist in the parent workspace.
const REDACTION_PATTERNS = [
  /\bjacob[-_ ]?balslev\b/i,
  /\bjacobbalslev\b/i,
  /\bjacob[-_ ]?b\b/i,
  /\bsales[-_]hub\b/i,
  /\bsales_hub\b/i,
  /\bfree[-_]oppression\b/i,
  /\bdagpenge\b/i,
  /\ba-kasse\b/i,
  /\banti[-_]trump\b/i,
  /\banti[-_]ice\b/i,
  /\bantifasc\w*\b/i,
  /\bprintify\b/i,
  /\bneon\s*postgres\b/i,
  /\bSH-\d{2,}\b/,
  /\/Users\/[a-z0-9_-]+\b/i,
  /\bProjekter\/Development\b/,
  /\bobsidian\s*vault\b/i,
  /\bclaude[-_ ]code\b/i,
];

const SCAFFOLD_PATHS = [
  path.join(REPO_ROOT, 'examples', 'skill-template.md'),
];

// ─── CLI parsing ────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) { args._.push(token); continue; }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { args[key] = true; continue; }
    args[key] = next;
    i += 1;
  }
  return args;
}

function usage(code = 0) {
  process.stdout.write(`Usage: skills-sweep-oss.js [flags]

  --skill NAME          Sweep a single skill only.
  --stratum SCOPE       Sweep only skills with frontmatter scope: SCOPE
                        (codebase | reference | portable).
  --max-skills N        Cap this run at N skills.
  --editor-cmd CMD      Invoke CMD per skill to apply fixes (stub mode if absent).
  --resume              Skip skills already marked completed in the checkpoint.
  --force-all           Ignore the checkpoint and re-run every skill.
  --dry-run             Run phases 1-4 and print the plan; no edits, no commits.
  --no-commit           Stage edits only; do not git commit.
  --help                Print this help and exit 0.

Exit codes: 0 clean, 1 usage error, 2 verification failure, 3 redaction block.
`);
  process.exit(code);
}

// ─── State helpers ──────────────────────────────────────────────────────────

function readCheckpoint() {
  try { return JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8')); } catch { return { skills: {} }; }
}
function writeCheckpoint(state) {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2) + '\n');
}
function appendLedger(entry) {
  if (!fs.existsSync(AUDITS_DIR)) fs.mkdirSync(AUDITS_DIR, { recursive: true });
  fs.appendFileSync(LEDGER_PATH, JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n');
}

// ─── Skill enumeration ──────────────────────────────────────────────────────

function enumerateSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => ({
      name: e.name,
      dir: path.join(SKILLS_DIR, e.name),
      skillPath: path.join(SKILLS_DIR, e.name, 'SKILL.md'),
    }))
    .filter(s => fs.existsSync(s.skillPath));
}

// Use the shared parser that skill-lint, generate-manifest, export-skill, and
// the router all use. The previous implementation was a line-by-line regex
// that only captured scalar values on the same line as the key, silently
// dropping every block sequence (keywords, triggers, examples, anti_examples,
// paths) and every nested object (relations, grounding, drift_check). That
// caused false-positive findings like "no Layer 1 activation signals" on
// skills that in fact declared dozens of keywords.
const { parseFrontmatter: sharedParseFrontmatter } = require('./lib/parse-frontmatter');

function readFrontmatter(skillPath) {
  const src = fs.readFileSync(skillPath, 'utf8');
  return sharedParseFrontmatter(src) || {};
}

// ─── Gate runners ───────────────────────────────────────────────────────────

function runNode(scriptRel, extraArgs = []) {
  const r = spawnSync('node', [path.join(REPO_ROOT, scriptRel), ...extraArgs], {
    cwd: REPO_ROOT, encoding: 'utf8',
  });
  return { ok: r.status === 0, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function regenerateManifest() {
  return runNode('scripts/generate-manifest.js', [
    '--include-template', '--timestamp', '1970-01-01T00:00:00Z',
    '--output', MANIFEST_PATH,
  ]);
}
function runLint()     { return runNode('scripts/skill-lint.js', ['--include-template', '--strict']); }
function runContract() { return runNode('scripts/check-contract-consistency.js', []); }
function runHarness()  { return runNode('scripts/skill-graph-routing-eval.js', ['--manifest', MANIFEST_PATH]); }
function runDrift() {
  const driftScript = path.join(REPO_ROOT, 'scripts', 'skill-graph-drift.js');
  if (!fs.existsSync(driftScript)) return { ok: true, stdout: '(drift script absent — skipped)', stderr: '' };
  return runNode('scripts/skill-graph-drift.js', ['--check']);
}

function runRedaction(scopePaths) {
  const hits = [];
  for (const p of scopePaths) {
    if (!fs.existsSync(p)) continue;
    const stat = fs.statSync(p);
    const files = stat.isDirectory() ? walkFiles(p) : [p];
    for (const f of files) {
      if (!/\.(md|json|jsonl|yml|yaml|mmd)$/i.test(f)) continue;
      const src = fs.readFileSync(f, 'utf8');
      for (const pat of REDACTION_PATTERNS) {
        const m = src.match(pat);
        if (m) hits.push({ file: path.relative(REPO_ROOT, f), pattern: pat.source, match: m[0] });
      }
    }
  }
  return { ok: hits.length === 0, hits };
}
function walkFiles(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === '_state' || e.name === 'audits') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkFiles(p));
    else out.push(p);
  }
  return out;
}

// ─── Per-skill phases ───────────────────────────────────────────────────────

function analyzeSkill(skill) {
  const fm = readFrontmatter(skill.skillPath);
  const body = fs.readFileSync(skill.skillPath, 'utf8');
  const findings = [];

  if (!fm.schema_version) findings.push({ sev: 'error',   msg: 'missing schema_version' });
  if (!fm.description)    findings.push({ sev: 'error',   msg: 'missing description' });
  if (!fm.scope)          findings.push({ sev: 'warning', msg: 'missing scope field' });
  if (!fm.type)           findings.push({ sev: 'warning', msg: 'missing type field' });
  if (!fm.owner)          findings.push({ sev: 'info',    msg: 'missing owner field' });

  if (!/^# /m.test(body))                       findings.push({ sev: 'error',   msg: 'no H1 in body' });
  if (!/## Coverage\b/m.test(body))             findings.push({ sev: 'warning', msg: 'no ## Coverage section' });
  if (!/## Philosophy\b/m.test(body))           findings.push({ sev: 'info',    msg: 'no ## Philosophy section' });
  // Layer 1 (Activation surface) is a CONCEPT spread across five optional
  // fields in the v3 contract, not a single `activation:` field or `## Activation`
  // body section. Check whether any of them carry a non-empty value.
  const activationFields = ['keywords', 'triggers', 'examples', 'anti_examples', 'paths'];
  const hasActivation = activationFields.some((f) => {
    const v = fm[f];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  });
  if (!hasActivation)
    findings.push({
      sev: 'info',
      msg: 'no Layer 1 activation signals (keywords/triggers/examples/anti_examples/paths all empty)',
    });

  const localRedaction = runRedaction([skill.skillPath]);
  for (const h of localRedaction.hits) {
    findings.push({ sev: 'error', msg: `redaction hit "${h.match}" (pattern ${h.pattern})` });
  }

  return { frontmatter: fm, findings };
}

function writeFindingsReport(skill, result) {
  const dir = path.join(AUDITS_DIR, skill.name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const lines = [];
  lines.push(`# audit — ${skill.name}`);
  lines.push('');
  lines.push(`> Generated by \`scripts/skills-sweep-oss.js\` at ${new Date().toISOString()}.`);
  lines.push('');
  lines.push('## Frontmatter');
  lines.push('');
  lines.push('```yaml');
  for (const [k, v] of Object.entries(result.frontmatter)) lines.push(`${k}: ${v}`);
  lines.push('```');
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  if (result.findings.length === 0) {
    lines.push('_no findings_');
  } else {
    for (const f of result.findings) lines.push(`- **[${f.sev}]** ${f.msg}`);
  }
  lines.push('');
  const findingsPath = path.join(dir, 'findings.md');
  fs.writeFileSync(findingsPath, lines.join('\n'));
  return findingsPath;
}

function maybeInvokeEditor(skill, findingsPath, editorCmd, { dryRun }) {
  if (!editorCmd || dryRun) return { invoked: false, ok: true };
  const r = spawnSync(editorCmd, [], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      SKILL_GRAPH_SKILL_DIR: skill.dir,
      SKILL_GRAPH_FINDINGS_PATH: findingsPath,
      SKILL_GRAPH_SKILL_NAME: skill.name,
    },
    shell: true,
  });
  return { invoked: true, ok: r.status === 0, stdout: r.stdout, stderr: r.stderr };
}

function hashSkill(skill) {
  return crypto.createHash('sha256').update(fs.readFileSync(skill.skillPath)).digest('hex').slice(0, 16);
}

// ─── Main sweep ─────────────────────────────────────────────────────────────

function main() {
  const argv = parseArgs(process.argv.slice(2));
  if (argv.help) usage(0);

  const dryRun = !!argv['dry-run'];
  const editorCmd = argv['editor-cmd'] || null;
  const stratum = argv.stratum || null;
  const onlySkill = argv.skill || null;
  const maxSkills = argv['max-skills'] ? parseInt(argv['max-skills'], 10) : Infinity;
  const resume = !!argv.resume;
  const forceAll = !!argv['force-all'];
  const noCommit = !!argv['no-commit'];

  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`error: skills dir not found at ${SKILLS_DIR}`);
    process.exit(1);
  }

  console.log(`\n=== skills-sweep-oss ===`);
  console.log(`  mode:      ${dryRun ? 'DRY-RUN' : editorCmd ? 'EDIT' : 'STUB (audit only)'}`);
  console.log(`  editor:    ${editorCmd || '(none — stub mode)'}`);
  console.log(`  stratum:   ${stratum || '(all)'}`);
  console.log(`  skill:     ${onlySkill || '(all)'}`);
  console.log(`  resume:    ${resume}`);

  // Library-wide pre-flight gates
  console.log('\n--- PRE-FLIGHT GATES ---');
  const baseline = {
    manifest: regenerateManifest(),
    lint: runLint(),
    contract: runContract(),
    harness: runHarness(),
    drift: runDrift(),
  };
  for (const [name, r] of Object.entries(baseline)) {
    console.log(`  baseline.${name}: ${r.ok ? 'OK' : 'FAIL'}`);
    if (!r.ok) console.log('    ' + (r.stderr || r.stdout).split('\n').slice(-3).join('\n    '));
  }
  const baselineOk = Object.values(baseline).every(r => r.ok);
  if (!baselineOk && !dryRun) {
    console.error('\nBASELINE FAILURE — fix the library before sweeping. Aborting.');
    process.exit(2);
  }

  // Enumerate and filter
  let skills = enumerateSkills();
  if (onlySkill) skills = skills.filter(s => s.name === onlySkill);
  if (stratum) {
    skills = skills.filter(s => {
      const fm = readFrontmatter(s.skillPath);
      return fm.scope === stratum;
    });
  }
  skills = skills.filter(s => !SCAFFOLD_PATHS.includes(s.skillPath));
  const checkpoint = forceAll ? { skills: {} } : readCheckpoint();
  if (resume) {
    skills = skills.filter(s => !(checkpoint.skills[s.name]?.verdict === 'PASS'));
  }
  skills = skills.slice(0, maxSkills);

  console.log(`\n--- SKILLS TO SWEEP: ${skills.length} ---`);
  for (const s of skills) console.log(`  • ${s.name}`);

  if (skills.length === 0) { console.log('\nnothing to sweep. exit 0.'); process.exit(0); }

  let failures = 0;
  let redactionBlocks = 0;

  for (const skill of skills) {
    console.log(`\n>>> ${skill.name}`);
    checkpoint.skills[skill.name] = { claimed_at: new Date().toISOString(), verdict: 'IN_PROGRESS' };
    writeCheckpoint(checkpoint);

    const preHash = hashSkill(skill);
    const analysis = analyzeSkill(skill);
    const findingsPath = writeFindingsReport(skill, analysis);
    const errorFindings = analysis.findings.filter(f => f.sev === 'error');
    console.log(`    ANALYZE: ${analysis.findings.length} finding(s) — ${errorFindings.length} error(s)`);
    console.log(`    report:  ${path.relative(REPO_ROOT, findingsPath)}`);

    if (editorCmd && !dryRun) {
      const ed = maybeInvokeEditor(skill, findingsPath, editorCmd, { dryRun });
      console.log(`    EXECUTE: editor invoked (${ed.ok ? 'ok' : 'fail'})`);
      if (!ed.ok) {
        checkpoint.skills[skill.name] = { ...checkpoint.skills[skill.name], verdict: 'EDITOR_FAIL', completed_at: new Date().toISOString() };
        writeCheckpoint(checkpoint);
        appendLedger({ skill: skill.name, verdict: 'EDITOR_FAIL', pre_hash: preHash });
        failures += 1;
        continue;
      }
    }

    const postHash = hashSkill(skill);
    const changed = preHash !== postHash;
    console.log(`    VERIFY:  skill ${changed ? 'CHANGED' : 'unchanged'} (${preHash.slice(0,8)} → ${postHash.slice(0,8)})`);

    // Redaction gate (most load-bearing — never skipped)
    const red = runRedaction([skill.skillPath, path.join(AUDITS_DIR, skill.name)]);
    if (!red.ok) {
      console.error('    REDACTION BLOCK:');
      for (const h of red.hits) console.error(`      ${h.file}: matched "${h.match}" (pattern ${h.pattern})`);
      checkpoint.skills[skill.name] = { ...checkpoint.skills[skill.name], verdict: 'REDACTION_BLOCK', completed_at: new Date().toISOString() };
      writeCheckpoint(checkpoint);
      appendLedger({ skill: skill.name, verdict: 'REDACTION_BLOCK', hits: red.hits });
      redactionBlocks += 1;
      continue;
    }

    // Per-skill verification — re-run all gates. If any regressed, REFUSE promotion.
    if (changed && !dryRun) {
      const post = {
        manifest: regenerateManifest(),
        lint: runLint(),
        contract: runContract(),
        harness: runHarness(),
        drift: runDrift(),
      };
      const regressions = [];
      for (const [name, r] of Object.entries(post)) if (!r.ok && baseline[name].ok) regressions.push(name);
      if (regressions.length > 0) {
        console.error(`    VERIFY FAIL: regressed on [${regressions.join(', ')}] — rolling back`);
        spawnSync('git', ['checkout', '--', skill.dir], { cwd: REPO_ROOT });
        spawnSync('git', ['checkout', '--', MANIFEST_PATH], { cwd: REPO_ROOT });
        checkpoint.skills[skill.name] = { ...checkpoint.skills[skill.name], verdict: 'REGRESSION', completed_at: new Date().toISOString() };
        writeCheckpoint(checkpoint);
        appendLedger({ skill: skill.name, verdict: 'REGRESSION', regressions });
        failures += 1;
        continue;
      }
    }

    // PROMOTE — stage edits, optionally commit, mark done
    if (changed && !dryRun && !noCommit) {
      spawnSync('git', ['add', skill.dir, MANIFEST_PATH], { cwd: REPO_ROOT });
      const msg = `chore(skills): sweep audit — ${skill.name}\n\nAutomated Karpathy-style sweep via scripts/skills-sweep-oss.js.\nFindings: audits/${skill.name}/findings.md`;
      const cm = spawnSync('git', ['commit', '--only', skill.dir, MANIFEST_PATH, '-m', msg], { cwd: REPO_ROOT, encoding: 'utf8' });
      console.log(`    PROMOTE: commit ${cm.status === 0 ? 'ok' : 'FAILED'}`);
    }

    checkpoint.skills[skill.name] = { ...checkpoint.skills[skill.name], verdict: 'PASS', completed_at: new Date().toISOString(), pre_hash: preHash, post_hash: postHash };
    writeCheckpoint(checkpoint);
    appendLedger({ skill: skill.name, verdict: 'PASS', pre_hash: preHash, post_hash: postHash, findings: analysis.findings.length });
  }

  // Library-wide redaction sweep over everything touched
  console.log('\n--- FINAL REDACTION SWEEP ---');
  const finalRed = runRedaction([SKILLS_DIR, AUDITS_DIR, MANIFEST_PATH]);
  if (!finalRed.ok) {
    console.error(`FINAL REDACTION FAILURE: ${finalRed.hits.length} hits`);
    for (const h of finalRed.hits.slice(0, 10)) console.error(`  ${h.file}: "${h.match}"`);
    process.exit(3);
  }
  console.log('  OK — 0 hits');

  console.log(`\n=== sweep complete: ${skills.length - failures - redactionBlocks} PASS, ${failures} FAIL, ${redactionBlocks} REDACTION ===`);
  process.exit(failures > 0 ? 2 : redactionBlocks > 0 ? 3 : 0);
}

if (require.main === module) main();
module.exports = { REDACTION_PATTERNS, analyzeSkill, runRedaction, enumerateSkills };
