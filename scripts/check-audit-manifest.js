#!/usr/bin/env node
// check-audit-manifest.js — verify Skill Audit Loop run artifacts against the manifest.
//
// What this enforces (the "false sense of canonicality" guard from GPT-5.5):
//   A verdict.md may claim comprehension_verdict in the graded comprehension set
//   {PROVISIONAL, PASS, SHALLOW, REDUNDANT} ONLY if skills/<name>/evals/comprehension.json
//   exists on disk. The May 22-25 incident with `backend`, `mcp-builder`, and
//   `token-cost-estimation` shipped PROVISIONAL stamps with no comprehension.json
//   on disk — that is the failure mode this guard prevents.
//
//   Comprehension and application enums are DISJOINT per schemas/skill.schema.json:261-285
//   and ADR 0011. APPLICABLE / MIXED / HARMFUL are application-verdict values and must
//   never appear in the comprehension graded set (see GRADED_APPLICATION_VERDICTS below
//   for the application-layer counterpart). The earlier mixed set leaked application
//   enums into the comprehension check — fixed 2026-05-25.
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

// Comprehension graded set (per schemas/skill.schema.json:261-272 + ADR 0011): values
// that imply a comprehension grader actually ran and produced a result. UNVERIFIED (no
// assessment), SKIPPED_BASELINE_HIGH (procedural early-skip), and NA (skill has no
// comprehension.json by design) are explicitly NOT graded.
const GRADED_COMPREHENSION_VERDICTS = new Set([
  'PROVISIONAL', 'PASS', 'SHALLOW', 'REDUNDANT',
]);

// Application graded set (per schemas/skill.schema.json:274-285 + ADR 0011): kept
// here so future application-artifact gates can reference the same authoritative
// partition. Currently informational — the verifier only enforces comprehension
// artifacts. Do not mix these values into GRADED_COMPREHENSION_VERDICTS; that was
// the bug fixed on 2026-05-25.
const GRADED_APPLICATION_VERDICTS = new Set([
  'APPLICABLE', 'MIXED', 'HARMFUL',
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

// Read the current SKILL.md Health Block. Returns the comprehension_verdict declared
// in the SKILL.md frontmatter (durable state), or null if the file or field is missing.
// This is the post-2026-05-25 resolution path: a per-run verdict.md may have stamped
// PROVISIONAL without the artifact (the May 22-25 incident pattern), but if the SKILL.md
// has since been honestly downgraded to UNVERIFIED, the run-level claim is superseded
// and the verifier should not report a live failure for that resolved historical drift.
function readSkillHealthBlock(skillsRoot, skill) {
  const skillMd = path.join(skillsRoot, skill, 'SKILL.md');
  if (!fs.existsSync(skillMd)) return { comprehension_verdict: null };
  const text = fs.readFileSync(skillMd, 'utf8');
  // Frontmatter parse — we only need comprehension_verdict, so read the first ~80 lines.
  const m = text.match(/^comprehension_verdict:\s*([A-Z_]+)\s*$/m);
  return { comprehension_verdict: m ? m[1].toUpperCase() : null };
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
      // Category-error guard: a verdict.md that stamps an application-only enum
      // (APPLICABLE/MIXED/HARMFUL) into the comprehension slot is malformed. The
      // schema (schemas/skill.schema.json:261-285) keeps the two enums disjoint;
      // surfacing this here catches the parser/author error before it propagates
      // into SKILL.md frontmatter.
      const comprehensionEnumLeak = verdicts.comprehension && GRADED_APPLICATION_VERDICTS.has(verdicts.comprehension);

      // Read the current SKILL.md Health Block — if the durable state has been
      // honestly downgraded to UNVERIFIED, treat the historical per-run claim as
      // resolved-via-downgrade rather than a live failure.
      const health = readSkillHealthBlock(skillsRoot, skill);
      const currentHealthIsHonestlyDowngraded = claimsGraded &&
        health.comprehension_verdict &&
        !GRADED_COMPREHENSION_VERDICTS.has(health.comprehension_verdict);

      const entry = {
        skill,
        runId,
        comprehension_verdict: verdicts.comprehension,
        application_verdict: verdicts.application,
        comprehension_json_exists: comprehensionExists,
        comprehension_json_path: comprehensionPath,
        skill_md_comprehension_verdict: health.comprehension_verdict,
      };
      checks.push(entry);

      if (claimsGraded && !comprehensionExists && !currentHealthIsHonestlyDowngraded) {
        failures.push({
          ...entry,
          reason: `Verdict claims comprehension=${verdicts.comprehension} but ${comprehensionPath} does not exist on disk, AND the current SKILL.md Health Block (comprehension_verdict=${health.comprehension_verdict || 'unknown'}) has not been honestly downgraded to UNVERIFIED. Per the May 22-25 incident root cause, any graded comprehension_verdict (PROVISIONAL/PASS/SHALLOW/REDUNDANT) requires a gradeable comprehension.json. Either author the comprehension.json (and re-run the assessment) or downgrade the SKILL.md verdict to UNVERIFIED — the verifier respects honest downgrade as the resolution path.`,
        });
      }
      if (comprehensionEnumLeak) {
        failures.push({
          ...entry,
          reason: `Verdict has comprehension_verdict=${verdicts.comprehension}, but that value is an application-layer enum (per schemas/skill.schema.json:274-285 and ADR 0011). The comprehension and application enum sets are disjoint. Either correct the verdict to use a comprehension-layer value (PASS/SHALLOW/REDUNDANT/PROVISIONAL/UNVERIFIED/SKIPPED_BASELINE_HIGH/NA) or move this value into the application_verdict slot.`,
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
