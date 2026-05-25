#!/usr/bin/env node
// check-audit-manifest.js — verify Skill Audit Loop run artifacts against the manifest.
//
// What this enforces (the "false sense of canonicality" guard from GPT-5.5):
//   A verdict.md may claim comprehension_verdict in {PROVISIONAL, APPLICABLE, PASS,
//   SHALLOW, REDUNDANT, MIXED, HARMFUL} ONLY if skills/<name>/evals/comprehension.json
//   exists on disk. The May 22-25 incident with `backend`, `mcp-builder`, and
//   `token-cost-estimation` shipped PROVISIONAL stamps with no comprehension.json
//   on disk — that is the failure mode this guard prevents.
//
// Walks: .opencode/progress/skill-audits/<skill>/runs/<run-id>/verdict.md
// Reads: skill-graph/audits/manifest.json
// Resolves canonical skill source via:
//   - skills/<skill>/evals/comprehension.json (workspace canonical)
//
// Exit codes:
//   0 — all checked verdicts are honest about their gradeable artifact
//   1 — at least one verdict makes a graded claim without the artifact on disk
//   2 — operational error (manifest missing, etc.)
//
// Flags:
//   --limit N        max number of newest runs per skill to check (default: 5)
//   --json           emit a JSON summary instead of human-readable lines
//   --workspace P    workspace root (default: parent of this repo, i.e. ..)
//   --strict-all     check every run, not just the newest per skill

const fs = require('fs');
const path = require('path');

const WORKSPACE_DEFAULT = path.resolve(__dirname, '..', '..');
const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(REPO_ROOT, 'audits', 'manifest.json');

const GRADED_COMPREHENSION_VERDICTS = new Set([
  'PROVISIONAL', 'APPLICABLE', 'PASS', 'SHALLOW', 'REDUNDANT', 'MIXED', 'HARMFUL',
]);

function parseArgs(argv) {
  const args = { limit: 5, json: false, workspace: WORKSPACE_DEFAULT, strictAll: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--limit') { args.limit = Number(argv[++i]); }
    else if (arg === '--json') { args.json = true; }
    else if (arg === '--workspace') { args.workspace = path.resolve(argv[++i]); }
    else if (arg === '--strict-all') { args.strictAll = true; }
    else if (arg === '--help' || arg === '-h') {
      console.log('Usage: check-audit-manifest.js [--limit N] [--json] [--workspace PATH] [--strict-all]');
      process.exit(0);
    } else {
      console.error(`Unknown flag: ${arg}`);
      process.exit(2);
    }
  }
  return args;
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`[check-audit-manifest] manifest not found at ${MANIFEST_PATH}`);
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

// Parse a verdict.md and return:
//   { comprehension: 'PROVISIONAL' | 'UNVERIFIED' | ..., application: '...' }
// Verdicts come from a Markdown table row like:
//   | comprehension | PROVISIONAL | Single-model... |
// or from prose like "comprehension_verdict: PROVISIONAL".
function parseVerdictFile(verdictPath) {
  const text = fs.readFileSync(verdictPath, 'utf8');
  const verdicts = { comprehension: null, application: null };

  // Verdicts come from a Markdown table row OR prose; check both shapes.
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(comprehension|application)(?:_verdict)?\s*\|\s*([A-Z_]+)\s*\|/i);
    if (m) {
      verdicts[m[1].toLowerCase()] = m[2].toUpperCase();
    }
  }
  const proseLine = /(comprehension|application)_verdict\s*[:=]\s*([A-Z_]+)/gi;
  let m;
  while ((m = proseLine.exec(text)) !== null) {
    const key = m[1].toLowerCase();
    if (!verdicts[key]) verdicts[key] = m[2].toUpperCase();
  }
  return verdicts;
}

function listSkillsWithRuns(progressDir) {
  if (!fs.existsSync(progressDir)) return [];
  return fs.readdirSync(progressDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function listRunsForSkill(progressDir, skill) {
  const runsDir = path.join(progressDir, skill, 'runs');
  if (!fs.existsSync(runsDir)) return [];
  return fs.readdirSync(runsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest();
  const progressDir = path.join(args.workspace, '.opencode', 'progress', 'skill-audits');
  const skillsRoot = path.join(args.workspace, 'skills');

  const failures = [];
  const checks = [];

  const skills = listSkillsWithRuns(progressDir);
  for (const skill of skills) {
    const runs = listRunsForSkill(progressDir, skill);
    const runsToCheck = args.strictAll ? runs : runs.slice(0, args.limit);
    for (const runId of runsToCheck) {
      const verdictPath = path.join(progressDir, skill, 'runs', runId, 'verdict.md');
      if (!fs.existsSync(verdictPath)) continue;
      let verdicts;
      try {
        verdicts = parseVerdictFile(verdictPath);
      } catch (err) {
        checks.push({ skill, runId, status: 'unreadable', error: String(err.message || err) });
        continue;
      }
      const comprehensionPath = path.join(skillsRoot, skill, 'evals', 'comprehension.json');
      const comprehensionExists = fs.existsSync(comprehensionPath);
      const claimsGraded = verdicts.comprehension && GRADED_COMPREHENSION_VERDICTS.has(verdicts.comprehension);

      const entry = {
        skill,
        runId,
        comprehension_verdict: verdicts.comprehension,
        application_verdict: verdicts.application,
        comprehension_json_exists: comprehensionExists,
        comprehension_json_path: comprehensionPath,
      };
      checks.push(entry);

      if (claimsGraded && !comprehensionExists) {
        failures.push({
          ...entry,
          reason: `Verdict claims comprehension=${verdicts.comprehension} but ${comprehensionPath} does not exist on disk. Per the May 22-25 incident root cause, any non-UNVERIFIED comprehension verdict requires a gradeable comprehension.json. Either author the comprehension.json (and re-run the assessment) or downgrade the verdict to UNVERIFIED.`,
        });
      }
    }
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({
      manifest_schema_version: manifest.schema_version,
      checked: checks.length,
      failures: failures.length,
      failures_detail: failures,
      checks_detail: checks,
    }, null, 2) + '\n');
  } else {
    console.log(`[check-audit-manifest] checked ${checks.length} verdicts across ${skills.length} skills (limit=${args.limit}${args.strictAll ? ', strict-all' : ''})`);
    if (failures.length === 0) {
      console.log('[check-audit-manifest] OK — every graded verdict has its gradeable artifact on disk.');
    } else {
      console.log(`[check-audit-manifest] FAIL — ${failures.length} verdict(s) claim graded comprehension without the artifact:`);
      for (const f of failures) {
        console.log(`  ${f.skill}/${f.runId}: comprehension=${f.comprehension_verdict}, missing ${path.relative(args.workspace, f.comprehension_json_path)}`);
      }
    }
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

try {
  main();
} catch (err) {
  console.error(`[check-audit-manifest] fatal: ${err.message || err}`);
  process.exit(2);
}
