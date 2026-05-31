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
//   Comprehension and application enums are DISJOINT per schemas/SKILL_METADATA_PROTOCOL_schema.json:261-285
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

// Comprehension graded set (per schemas/SKILL_METADATA_PROTOCOL_schema.json:261-272 + ADR 0011): values
// that imply a comprehension grader actually ran and produced a result. UNVERIFIED (no
// assessment), SKIPPED_BASELINE_HIGH (procedural early-skip), and NA (skill has no
// comprehension.json by design) are explicitly NOT graded.
const GRADED_COMPREHENSION_VERDICTS = new Set([
  'PROVISIONAL', 'PASS', 'SHALLOW', 'REDUNDANT',
]);

// Application graded set (per schemas/SKILL_METADATA_PROTOCOL_schema.json:274-285 + ADR 0011): the
// high-stakes graded application verdicts. As of SH-6548 (2026-05-31) this set is
// ENFORCED, not merely informational — a per-run verdict claiming one of these
// requires skills/<name>/evals/application.json on disk (symmetric to the
// comprehension-artifact gate). The wider graded set (PROVISIONAL/REDUNDANT/
// FALSE_POSITIVE) is the documented next expansion (docs/verdict-semantics.md
// § Application graded set). Do not mix these values into
// GRADED_COMPREHENSION_VERDICTS; that was the bug fixed on 2026-05-25.
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
  if (!fs.existsSync(skillMd)) return { comprehension_verdict: null, application_verdict: null };
  const text = fs.readFileSync(skillMd, 'utf8');
  // Frontmatter parse — we need the two behavior-gate verdicts for the
  // honest-downgrade escape hatch (comprehension + application).
  const cm = text.match(/^comprehension_verdict:\s*([A-Z_]+)\s*$/m);
  const am = text.match(/^application_verdict:\s*([A-Z_]+)\s*$/m);
  return {
    comprehension_verdict: cm ? cm[1].toUpperCase() : null,
    application_verdict: am ? am[1].toUpperCase() : null,
  };
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

// SH-6548: post-F23 the canonical library uses a nested layout
// (~/Development/skills/skills/<subject>/<skill>/), not flat
// (~/Development/skills/<skill>/). Resolve comprehension.json by checking
// both shapes — flat first (back-compat for legacy deployments), then
// nested via a recursive walk under <workspace>/skills/skills/.
function resolveEvalArtifact(workspace, skill, artifactName) {
  const skillsRoot = path.join(workspace, 'skills');
  // Try the flat layout first (matches legacy ~/Development/skills/<skill>/).
  const flatPath = path.join(skillsRoot, skill, 'evals', artifactName);
  if (fs.existsSync(flatPath)) return { path: flatPath, exists: true };
  // Then the nested canonical layout (~/Development/skills/skills/<subject>/<skill>/).
  const nestedRoot = path.join(skillsRoot, 'skills');
  if (fs.existsSync(nestedRoot)) {
    try {
      const subjects = fs.readdirSync(nestedRoot, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      for (const subject of subjects) {
        const nestedPath = path.join(nestedRoot, subject, skill, 'evals', artifactName);
        if (fs.existsSync(nestedPath)) return { path: nestedPath, exists: true };
      }
    } catch (_) { /* fall through to MISSING */ }
  }
  // Truly missing — return the expected nested-canonical-shape path for the
  // failure message; the message will tell the reader where the file SHOULD live.
  return { path: flatPath, exists: false };
}

// Thin wrappers preserving the original call sites' intent.
function resolveComprehensionPath(workspace, skill) {
  return resolveEvalArtifact(workspace, skill, 'comprehension.json');
}
function resolveApplicationPath(workspace, skill) {
  return resolveEvalArtifact(workspace, skill, 'application.json');
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
      const resolved = resolveComprehensionPath(args.workspace, skill);
      const comprehensionPath = resolved.path;
      const comprehensionExists = resolved.exists;
      const claimsGraded = verdicts.comprehension && GRADED_COMPREHENSION_VERDICTS.has(verdicts.comprehension);
      // Category-error guard: a verdict.md that stamps an application-only enum
      // (APPLICABLE/MIXED/HARMFUL) into the comprehension slot is malformed. The
      // schema (schemas/SKILL_METADATA_PROTOCOL_schema.json:261-285) keeps the two enums disjoint;
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

      // SH-6548: symmetric application-artifact enforcement (was informational).
      // A per-run verdict claiming a high-stakes graded application verdict
      // (APPLICABLE/MIXED/HARMFUL) must have skills/<name>/evals/application.json
      // on disk — same honest-downgrade escape hatch as comprehension. The wider
      // graded set (PROVISIONAL/REDUNDANT/FALSE_POSITIVE) is the documented next
      // expansion (docs/verdict-semantics.md § Application graded set); enforcing
      // it here would require those records to ship artifacts first.
      const claimsGradedApplication = verdicts.application && GRADED_APPLICATION_VERDICTS.has(verdicts.application);
      const appResolved = claimsGradedApplication ? resolveApplicationPath(args.workspace, skill) : null;
      const applicationExists = appResolved ? appResolved.exists : null;
      const applicationPath = appResolved ? appResolved.path : null;
      const currentAppIsHonestlyDowngraded = claimsGradedApplication &&
        health.application_verdict &&
        !GRADED_APPLICATION_VERDICTS.has(health.application_verdict);

      const entry = {
        skill,
        runId,
        comprehension_verdict: verdicts.comprehension,
        application_verdict: verdicts.application,
        comprehension_json_exists: comprehensionExists,
        comprehension_json_path: comprehensionPath,
        application_json_exists: applicationExists,
        application_json_path: applicationPath,
        skill_md_comprehension_verdict: health.comprehension_verdict,
        skill_md_application_verdict: health.application_verdict,
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
          reason: `Verdict has comprehension_verdict=${verdicts.comprehension}, but that value is an application-layer enum (per schemas/SKILL_METADATA_PROTOCOL_schema.json:274-285 and ADR 0011). The comprehension and application enum sets are disjoint. Either correct the verdict to use a comprehension-layer value (PASS/SHALLOW/REDUNDANT/PROVISIONAL/UNVERIFIED/SKIPPED_BASELINE_HIGH/NA) or move this value into the application_verdict slot.`,
        });
      }
      if (claimsGradedApplication && !applicationExists && !currentAppIsHonestlyDowngraded) {
        failures.push({
          ...entry,
          reason: `Verdict claims application=${verdicts.application} but ${applicationPath} does not exist on disk, AND the current SKILL.md Health Block (application_verdict=${health.application_verdict || 'unknown'}) has not been honestly downgraded out of the graded set. A high-stakes graded application_verdict (APPLICABLE/MIXED/HARMFUL) is the primary quality signal and requires a gradeable evals/application.json. Either author the application.json (and re-run the assessment) or downgrade the SKILL.md verdict to UNVERIFIED — the verifier respects honest downgrade as the resolution path.`,
        });
      }
    }
  }

  // Corpus-wide application_verdict scan per ADR-0011 § Addendum 2026-05-27.
  // HARMFUL is the SkillsBench-19% case the gate exists to catch — it must be
  // loud, not buried in a generic facet. PROVISIONAL is real single-model
  // signal awaiting dual-run confirmation; previously invisible because the
  // verifier collapsed it into the broader graded-set check.
  const manifestSkills = Array.isArray(manifest.skills) ? manifest.skills : [];
  const harmful_skills = [];
  const provisional_skills = [];
  for (const entry of manifestSkills) {
    const av = entry && entry.health && entry.health.application_verdict;
    if (av === 'HARMFUL') {
      harmful_skills.push({ name: entry.name || entry.id, path: entry.path || null });
    } else if (av === 'PROVISIONAL') {
      provisional_skills.push({ name: entry.name || entry.id, path: entry.path || null });
    }
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({
      manifest_schema_version: manifest.schema_version,
      checked: checks.length,
      failures: failures.length,
      failures_detail: failures,
      checks_detail: checks,
      harmful_skills,
      provisional_skills,
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
    // Surface HARMFUL loudly even when failures.length === 0 — these are
    // skills that make agents WORSE, not skills with missing artifacts.
    if (harmful_skills.length > 0) {
      console.log(`[check-audit-manifest] ⚠️  HARMFUL — ${harmful_skills.length} skill(s) carry application_verdict: HARMFUL (SkillsBench 19%-band):`);
      for (const s of harmful_skills) console.log(`  ${s.name}`);
    }
    if (provisional_skills.length > 0) {
      console.log(`[check-audit-manifest] PROVISIONAL — ${provisional_skills.length} skill(s) carry single-model application_verdict awaiting dual-run grader confirmation.`);
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
