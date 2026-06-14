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
// Walks: skill-graph/skill-audit-loop/progress/skill-audits/<skill>/runs/<run-id>/verdict.md
//        (run-root relocated 2026-06-07T from .opencode/progress/skill-audits per ADR-0016 #3)
// Reads: skill-graph/audits/manifest.json
// Resolves canonical skill source via:
//   - skills/<skill>/evals/comprehension.json (workspace canonical)
//
// Exit codes:
//   0 — all checked verdicts are honest about their gradeable artifact
//   1 — at least one verdict makes a graded claim without the artifact on disk,
//       or the active skills manifest still contains application_verdict:HARMFUL
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

// Application graded set: every non-UNVERIFIED application verdict claims an
// application assessment ran and therefore requires skills/<name>/evals/application.json
// on disk (symmetric to the comprehension-artifact gate). Do not mix these values
// into GRADED_COMPREHENSION_VERDICTS; that was the bug fixed on 2026-05-25.
const GRADED_APPLICATION_VERDICTS = new Set([
  'APPLICABLE', 'PROVISIONAL', 'NOT_DISCRIMINATED_CEILING',
  'EQUIVALENT_ON_FRONTIER', 'REDUNDANT', 'MIXED', 'HARMFUL', 'FALSE_POSITIVE',
]);
const HARMFUL_REQUIRED_ACTION =
  'git rm the active skill files so recovery lives in git history; explain the harmful eval/verdict evidence in the commit message and completion report. Do not quarantine or archive the harmful skill under another active path.';

const APPLICATION_ONLY_VERDICTS = new Set([
  'APPLICABLE', 'NOT_DISCRIMINATED_CEILING', 'EQUIVALENT_ON_FRONTIER',
  'MIXED', 'HARMFUL', 'FALSE_POSITIVE',
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

// The skills-with-health manifest is a SEPARATE generated file (skills.manifest.json
// at the workspace root) — NOT audits/manifest.json (which indexes protocols/runners
// and has no `.skills` key). The HARMFUL/PROVISIONAL application_verdict scan below
// reads THIS file. Reading `.skills` off audits/manifest.json left the HARMFUL gate
// silently inert (it always saw an empty array) — fixed 2026-06-10T.
function loadSkillsManifest(workspace) {
  const p = path.join(workspace, 'skills.manifest.json');
  if (!fs.existsSync(p)) return { skills: [], source: null, present: false };
  try {
    const m = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { skills: Array.isArray(m.skills) ? m.skills : [], source: p, present: true };
  } catch (err) {
    return { skills: [], source: p, present: false, error: String(err.message || err) };
  }
}

// Assert every path the manifest INDEXES (runner / phase-prompt / command body, and
// both ends of each alias) actually exists on disk. Without this the index can drift
// silently — stale alias targets and unregistered prompts (the exact failures this
// guard was added to catch, 2026-06-10T). Repo-relative paths (skill-graph/...) always
// resolve and are HARD failures when missing; workspace-relative paths
// (.claude/.opencode/prompts/audits/...) are validated only when the monorepo workspace
// is present (a standalone @skill-graph/cli clone has no .claude tree), mirroring the
// graceful-skip pattern in check-routing-config.js.
function validateManifestPaths(manifest, workspace) {
  const monorepo = fs.existsSync(path.join(workspace, '.claude'));
  const entries = [];
  for (const proto of (manifest.protocols || [])) {
    for (const r of (proto.runners || [])) entries.push({ kind: 'runner', id: r.id, p: r.path });
    for (const r of (proto.phase_prompts || [])) entries.push({ kind: 'phase_prompt', id: r.id, p: r.path });
    for (const c of (proto.commands || [])) entries.push({ kind: 'command', id: c.id, p: c.path });
    for (const a of (proto.aliases || [])) {
      // A relocation record (from_deleted:true) intentionally points its `from` at a
      // legacy path that was deleted to git history — validate only its `to` target.
      if (a.from && !a.from_deleted) entries.push({ kind: 'alias.from', id: a.from, p: a.from });
      if (a.to) entries.push({ kind: 'alias.to', id: `${a.from} -> ${a.to}`, p: a.to });
    }
  }
  const failures = [];
  const skipped = [];
  for (const e of entries) {
    if (!e.p) continue;
    const isRepoPath = e.p.startsWith('skill-graph/');
    const abs = path.join(workspace, e.p);
    if (fs.existsSync(abs)) continue;
    if (isRepoPath || monorepo) failures.push({ ...e, abs });
    else skipped.push({ ...e, reason: 'workspace path absent in standalone clone' });
  }
  return { failures, skipped, monorepo };
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

function resolveSkillDir(workspace, skill) {
  const skillsRoot = path.join(workspace, 'skills');
  const flat = path.join(skillsRoot, skill);
  if (fs.existsSync(path.join(flat, 'SKILL.md'))) return flat;

  const nestedRoot = path.join(skillsRoot, 'skills');
  if (fs.existsSync(nestedRoot)) {
    const subjects = fs.readdirSync(nestedRoot, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    for (const subject of subjects) {
      const nested = path.join(nestedRoot, subject, skill);
      if (fs.existsSync(path.join(nested, 'SKILL.md'))) return nested;
    }
  }
  return null;
}

// Read the current durable Audit Status. In the live ADR-0019 contract, verdicts
// live in audit-state.json beside SKILL.md. Legacy flat/frontmatter fallback is
// kept only so older deployments can still use the honest-downgrade escape hatch.
function readSkillAuditStatus(workspace, skill) {
  const skillDir = resolveSkillDir(workspace, skill);
  if (!skillDir) {
    return { comprehension_verdict: null, application_verdict: null, source: null };
  }

  const sidecar = path.join(skillDir, 'audit-state.json');
  if (fs.existsSync(sidecar)) {
    const state = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
    return {
      comprehension_verdict: state.comprehension_verdict || null,
      application_verdict: state.application_verdict || null,
      source: sidecar,
    };
  }

  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) {
    return { comprehension_verdict: null, application_verdict: null, source: null };
  }
  const text = fs.readFileSync(skillMd, 'utf8');
  // Legacy fallback: older deployments may still carry behavior-gate verdicts
  // in frontmatter. New migrated skills use audit-state.json.
  const cm = text.match(/^comprehension_verdict:\s*([A-Z_]+)\s*$/m);
  const am = text.match(/^application_verdict:\s*([A-Z_]+)\s*$/m);
  return {
    comprehension_verdict: cm ? cm[1].toUpperCase() : null,
    application_verdict: am ? am[1].toUpperCase() : null,
    source: skillMd,
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
  // The manifest is ALWAYS loaded from the real REPO_ROOT, so its indexed paths
  // (runner/phase-prompt/command/alias) are relative to the REAL workspace (parent of
  // REPO_ROOT) — NOT args.workspace, which the caller may override to a hermetic temp dir
  // to scope only the run-dir/skills walk. Resolving manifest paths against the override
  // would falsely report every skill-graph/... path missing (regression caught by
  // test-application-artifact-enforcement, which runs the gate with --workspace <temp>).
  const manifestPaths = validateManifestPaths(manifest, WORKSPACE_DEFAULT);
  // Run-root relocated 2026-06-07T from <ws>/.opencode/progress/skill-audits to
  // <ws>/skill-graph/skill-audit-loop/progress/skill-audits per the ADR-0016 surface #3
  // supersession. The run-layout substructure (<skill>/runs/<run-id>/...) underneath is unchanged.
  const progressDir = path.join(args.workspace, 'skill-graph', 'skill-audit-loop', 'progress', 'skill-audits');
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
      const comprehensionEnumLeak = verdicts.comprehension && APPLICATION_ONLY_VERDICTS.has(verdicts.comprehension);

      // Read the current durable Audit Status — if it has been honestly downgraded
      // to UNVERIFIED, treat the historical per-run claim as resolved-via-downgrade
      // rather than a live failure.
      const health = readSkillAuditStatus(args.workspace, skill);
      const currentHealthIsHonestlyDowngraded = claimsGraded &&
        health.comprehension_verdict &&
        !GRADED_COMPREHENSION_VERDICTS.has(health.comprehension_verdict);

      // SH-6548: symmetric application-artifact enforcement (was informational).
      // A per-run verdict claiming a high-stakes graded application verdict
      // (anything except UNVERIFIED) must have skills/<name>/evals/application.json
      // on disk — same honest-downgrade escape hatch as comprehension.
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
        audit_status_comprehension_verdict: health.comprehension_verdict,
        audit_status_application_verdict: health.application_verdict,
        audit_status_source: health.source,
      };
      checks.push(entry);

      if (claimsGraded && !comprehensionExists && !currentHealthIsHonestlyDowngraded) {
        failures.push({
          ...entry,
          reason: `Verdict claims comprehension=${verdicts.comprehension} but ${comprehensionPath} does not exist on disk, AND the current Audit Status (comprehension_verdict=${health.comprehension_verdict || 'unknown'}, source=${health.source || 'missing'}) has not been honestly downgraded to UNVERIFIED. Per the May 22-25 incident root cause, any graded comprehension_verdict (PROVISIONAL/PASS/SHALLOW/REDUNDANT) requires a gradeable comprehension.json. Either author the comprehension.json (and re-run the assessment) or downgrade the audit-state verdict to UNVERIFIED — the verifier respects honest downgrade as the resolution path.`,
        });
      }
      if (comprehensionEnumLeak) {
        failures.push({
          ...entry,
          reason: `Verdict has comprehension_verdict=${verdicts.comprehension}, but that value is an application-layer enum (per schemas/skill-audit-state.schema.json and ADR 0011). The comprehension and application enum sets are disjoint. Either correct the verdict to use a comprehension-layer value (PASS/SHALLOW/REDUNDANT/PROVISIONAL/UNVERIFIED/SKIPPED_BASELINE_HIGH/NA) or move this value into the application_verdict slot.`,
        });
      }
      if (claimsGradedApplication && !applicationExists && !currentAppIsHonestlyDowngraded) {
        failures.push({
          ...entry,
          reason: `Verdict claims application=${verdicts.application} but ${applicationPath} does not exist on disk, AND the current Audit Status (application_verdict=${health.application_verdict || 'unknown'}, source=${health.source || 'missing'}) has not been honestly downgraded out of the graded set. Any graded application_verdict (anything except UNVERIFIED) is the primary behavior-gate signal and requires a gradeable evals/application.json. Either author the application.json (and re-run the assessment) or downgrade the audit-state verdict to UNVERIFIED — the verifier respects honest downgrade as the resolution path.`,
        });
      }
    }
  }

  // Corpus-wide application_verdict scan per ADR-0011 § Addendum 2026-05-27.
  // HARMFUL is the SkillsBench-19% case the gate exists to catch. It is not a
  // warning: an active skill proven to make agents worse must be removed with
  // `git rm` so recovery lives in git history, and the removal commit/report
  // must explain the harmful evidence. Do not quarantine it under another
  // active path. A replacement must earn a fresh non-HARMFUL verdict.
  // PROVISIONAL is real single-model signal awaiting dual-run confirmation;
  // previously invisible because the verifier collapsed it into the broader
  // graded-set check.
  // Read the skills-with-health manifest (skills.manifest.json), NOT audits/manifest.json.
  const skillsManifest = loadSkillsManifest(args.workspace);
  const manifestSkills = skillsManifest.skills;
  const harmful_skills = [];
  const provisional_skills = [];
  // Advisory receipt-freshness scan (SKI board F11, 2026-06-14): a graded
  // application_verdict asserts the skill was evaluated, but the gate above only
  // proves the eval ARTIFACT exists — not that the receipt is still current. If the
  // SKILL.md body was edited AFTER its `eval_last_run`, the recorded verdict describes
  // a stale version of the skill. This is ADVISORY ONLY: it never adds to `failures`
  // and never changes the exit code (most skills carry no receipt yet, and a stale
  // receipt is migration signal, not a contract violation). Every step is guarded so a
  // missing file / unparseable date can never break the verify-wired gate.
  const stale_receipt_skills = [];
  for (const entry of manifestSkills) {
    const av = entry && entry.health && entry.health.application_verdict;
    if (av === 'HARMFUL') {
      harmful_skills.push({
        name: entry.name || entry.id,
        path: entry.path || null,
        required_action: HARMFUL_REQUIRED_ACTION,
      });
    } else if (av === 'PROVISIONAL') {
      provisional_skills.push({ name: entry.name || entry.id, path: entry.path || null });
    }
    try {
      const lastRun = entry && entry.health && entry.health.eval_last_run;
      if (av && GRADED_APPLICATION_VERDICTS.has(av) && lastRun && entry.path) {
        const runMs = Date.parse(lastRun);
        // Manifest paths are relative to the skill-graph dir (e.g. ../skills/skills/.../SKILL.md).
        const skillMdPath = path.resolve(args.workspace, 'skill-graph', entry.path);
        if (!Number.isNaN(runMs) && fs.existsSync(skillMdPath)) {
          const mtimeMs = fs.statSync(skillMdPath).mtimeMs;
          // 24h grace so a same-day edit+eval pair is not flagged.
          if (mtimeMs - runMs > 24 * 60 * 60 * 1000) {
            stale_receipt_skills.push({
              name: entry.name || entry.id,
              path: entry.path || null,
              application_verdict: av,
              eval_last_run: lastRun,
              skill_mtime: new Date(mtimeMs).toISOString().slice(0, 10),
            });
          }
        }
      }
    } catch (_) { /* advisory only — never break the gate on a stat/parse error */ }
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({
      manifest_schema_version: manifest.schema_version,
      checked: checks.length,
      failures: failures.length,
      failures_detail: failures,
      checks_detail: checks,
      manifest_path_failures: manifestPaths.failures,
      manifest_path_skipped: manifestPaths.skipped,
      skills_manifest_source: skillsManifest.source,
      skills_manifest_present: skillsManifest.present,
      harmful_skills,
      provisional_skills,
      stale_receipt_skills,
    }, null, 2) + '\n');
  } else {
    console.log(`[check-audit-manifest] checked ${checks.length} verdicts across ${skills.length} skills (limit=${args.limit}${args.strictAll ? ', strict-all' : ''})`);
    if (failures.length === 0) {
      console.log('[check-audit-manifest] OK — every graded verdict has its gradeable artifact on disk.');
    } else {
      console.log(`[check-audit-manifest] FAIL — ${failures.length} verdict(s) claim a graded behavior verdict without the matching artifact:`);
      for (const f of failures) {
        const missing = f.application_json_exists === false
          ? `application=${f.application_verdict}, missing ${path.relative(args.workspace, f.application_json_path)}`
          : `comprehension=${f.comprehension_verdict}, missing ${path.relative(args.workspace, f.comprehension_json_path)}`;
        console.log(`  ${f.skill}/${f.runId}: ${missing}`);
      }
    }
    if (harmful_skills.length > 0) {
      console.log(`[check-audit-manifest] FAIL — ${harmful_skills.length} active skill(s) carry application_verdict: HARMFUL and must be removed from the active corpus:`);
      for (const s of harmful_skills) console.log(`  ${s.name}: ${HARMFUL_REQUIRED_ACTION}`);
    }
    if (provisional_skills.length > 0) {
      console.log(`[check-audit-manifest] PROVISIONAL — ${provisional_skills.length} skill(s) carry single-model application_verdict awaiting dual-run grader confirmation.`);
    }
    if (stale_receipt_skills.length > 0) {
      console.log(`[check-audit-manifest] STALE-RECEIPT (advisory) — ${stale_receipt_skills.length} skill(s) were edited after their eval_last_run; the recorded verdict describes an older skill body and should be re-evaluated:`);
      for (const s of stale_receipt_skills) console.log(`  ${s.name}: ${s.application_verdict} eval_last_run=${s.eval_last_run} < SKILL.md mtime=${s.skill_mtime}`);
    }
    if (!skillsManifest.present) {
      console.log('[check-audit-manifest] NOTE — skills.manifest.json not found at workspace root; HARMFUL/PROVISIONAL health scan skipped (standalone clone).');
    }
    // Manifest path-integrity (stale aliases / unregistered prompts drift guard).
    if (manifestPaths.failures.length > 0) {
      console.log(`[check-audit-manifest] FAIL — ${manifestPaths.failures.length} manifest path(s) do not exist on disk:`);
      for (const f of manifestPaths.failures) {
        console.log(`  [${f.kind}] ${f.id}: ${f.p}`);
      }
    } else {
      console.log('[check-audit-manifest] OK — every manifest runner/phase-prompt/command/alias path exists on disk.');
    }
    if (manifestPaths.skipped.length > 0) {
      console.log(`[check-audit-manifest] (${manifestPaths.skipped.length} workspace path(s) skipped — standalone clone, no .claude tree.)`);
    }
  }

  process.exit((failures.length > 0 || manifestPaths.failures.length > 0 || harmful_skills.length > 0) ? 1 : 0);
}

try {
  main();
} catch (err) {
  console.error(`[check-audit-manifest] fatal: ${err.message || err}`);
  process.exit(2);
}
