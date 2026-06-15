#!/usr/bin/env node
// check-audit-manifest.js — verify Skill Audit Loop run artifacts against the manifest.
//
// What this enforces (the "false sense of canonicality" guard):
//   A verdict.md may claim comprehension_verdict in the graded comprehension set
//   {PROVISIONAL, PASS, SHALLOW, REDUNDANT} ONLY if skills/<name>/evals/comprehension.json
//   exists on disk. The May 22-25 incident with `backend`, `mcp-builder`, and
//   `token-cost-estimation` shipped PROVISIONAL stamps with no comprehension.json
//   on disk — that is the failure mode this guard prevents.
//
//   A comprehension_verdict must be one of the comprehension enum values
//   (PASS/SHALLOW/REDUNDANT/PROVISIONAL/UNVERIFIED/SKIPPED_BASELINE_HIGH/NA per
//   schemas/skill-audit-state.schema.json). Any other value stamped into the
//   comprehension slot is a malformed verdict and is flagged.
//
// Walks: skill-graph/skill-audit-loop/progress/skill-audits/<skill>/runs/<run-id>/verdict.md
//        (run-root relocated 2026-06-07T from .opencode/progress/skill-audits per ADR-0016 #3)
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

// Comprehension graded set (per schemas/skill-audit-state.schema.json + ADR 0011): values
// that imply a comprehension grader actually ran and produced a result. UNVERIFIED (no
// assessment), SKIPPED_BASELINE_HIGH (procedural early-skip), and NA (skill has no
// comprehension.json by design) are explicitly NOT graded.
const GRADED_COMPREHENSION_VERDICTS = new Set([
  'PROVISIONAL', 'PASS', 'SHALLOW', 'REDUNDANT',
]);

// The full comprehension_verdict enum. A value stamped into the comprehension slot
// that is NOT one of these is a malformed verdict (e.g. a typo or a value copied from
// another field) and is flagged so it cannot propagate into the sidecar.
const VALID_COMPREHENSION_VERDICTS = new Set([
  'PASS', 'SHALLOW', 'REDUNDANT', 'PROVISIONAL',
  'UNVERIFIED', 'SKIPPED_BASELINE_HIGH', 'NA',
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

// Parse a verdict.md and return { comprehension: 'PROVISIONAL' | 'UNVERIFIED' | ... }.
// The verdict comes from a Markdown table row like:
//   | comprehension | PROVISIONAL | Single-model... |
// or from prose like "comprehension_verdict: PROVISIONAL".
function parseVerdictFile(verdictPath) {
  const text = fs.readFileSync(verdictPath, 'utf8');
  const verdicts = { comprehension: null };

  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*comprehension(?:_verdict)?\s*\|\s*([A-Z_]+)\s*\|/i);
    if (m) {
      verdicts.comprehension = m[1].toUpperCase();
    }
  }
  const proseLine = /comprehension_verdict\s*[:=]\s*([A-Z_]+)/gi;
  let m;
  while ((m = proseLine.exec(text)) !== null) {
    if (!verdicts.comprehension) verdicts.comprehension = m[1].toUpperCase();
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
    return { comprehension_verdict: null, source: null };
  }

  const sidecar = path.join(skillDir, 'audit-state.json');
  if (fs.existsSync(sidecar)) {
    const state = JSON.parse(fs.readFileSync(sidecar, 'utf8'));
    return {
      comprehension_verdict: state.comprehension_verdict || null,
      source: sidecar,
    };
  }

  const skillMd = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillMd)) {
    return { comprehension_verdict: null, source: null };
  }
  const text = fs.readFileSync(skillMd, 'utf8');
  // Legacy fallback: older deployments may still carry the behavior-gate verdict
  // in frontmatter. New migrated skills use audit-state.json.
  const cm = text.match(/^comprehension_verdict:\s*([A-Z_]+)\s*$/m);
  return {
    comprehension_verdict: cm ? cm[1].toUpperCase() : null,
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

function resolveComprehensionPath(workspace, skill) {
  return resolveEvalArtifact(workspace, skill, 'comprehension.json');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = loadManifest();
  // The manifest is ALWAYS loaded from the real REPO_ROOT, so its indexed paths
  // (runner/phase-prompt/command/alias) are relative to the REAL workspace (parent of
  // REPO_ROOT) — NOT args.workspace, which the caller may override to a hermetic temp dir
  // to scope only the run-dir/skills walk. Resolving manifest paths against the override
  // would falsely report every skill-graph/... path missing.
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
      // Malformed-verdict guard: a comprehension_verdict that is not one of the
      // valid comprehension enum values is a typo or a value copied from another
      // field. Surfacing it here catches the parser/author error before it
      // propagates into SKILL.md / the sidecar.
      const comprehensionEnumInvalid = verdicts.comprehension && !VALID_COMPREHENSION_VERDICTS.has(verdicts.comprehension);

      // Read the current durable Audit Status — if it has been honestly downgraded
      // to UNVERIFIED, treat the historical per-run claim as resolved-via-downgrade
      // rather than a live failure.
      const health = readSkillAuditStatus(args.workspace, skill);
      const currentHealthIsHonestlyDowngraded = claimsGraded &&
        health.comprehension_verdict &&
        !GRADED_COMPREHENSION_VERDICTS.has(health.comprehension_verdict);

      const entry = {
        skill,
        runId,
        comprehension_verdict: verdicts.comprehension,
        comprehension_json_exists: comprehensionExists,
        comprehension_json_path: comprehensionPath,
        audit_status_comprehension_verdict: health.comprehension_verdict,
        audit_status_source: health.source,
      };
      checks.push(entry);

      if (claimsGraded && !comprehensionExists && !currentHealthIsHonestlyDowngraded) {
        failures.push({
          ...entry,
          reason: `Verdict claims comprehension=${verdicts.comprehension} but ${comprehensionPath} does not exist on disk, AND the current Audit Status (comprehension_verdict=${health.comprehension_verdict || 'unknown'}, source=${health.source || 'missing'}) has not been honestly downgraded to UNVERIFIED. Per the May 22-25 incident root cause, any graded comprehension_verdict (PROVISIONAL/PASS/SHALLOW/REDUNDANT) requires a gradeable comprehension.json. Either author the comprehension.json (and re-run the assessment) or downgrade the audit-state verdict to UNVERIFIED — the verifier respects honest downgrade as the resolution path.`,
        });
      }
      if (comprehensionEnumInvalid) {
        failures.push({
          ...entry,
          reason: `Verdict has comprehension_verdict=${verdicts.comprehension}, which is not a valid comprehension-layer value (per schemas/skill-audit-state.schema.json). Use one of PASS/SHALLOW/REDUNDANT/PROVISIONAL/UNVERIFIED/SKIPPED_BASELINE_HIGH/NA.`,
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
      manifest_path_failures: manifestPaths.failures,
      manifest_path_skipped: manifestPaths.skipped,
    }, null, 2) + '\n');
  } else {
    console.log(`[check-audit-manifest] checked ${checks.length} verdicts across ${skills.length} skills (limit=${args.limit}${args.strictAll ? ', strict-all' : ''})`);
    if (failures.length === 0) {
      console.log('[check-audit-manifest] OK — every graded verdict has its gradeable artifact on disk.');
    } else {
      console.log(`[check-audit-manifest] FAIL — ${failures.length} verdict(s) claim a graded behavior verdict without the matching artifact:`);
      for (const f of failures) {
        console.log(`  ${f.skill}/${f.runId}: comprehension=${f.comprehension_verdict}, missing ${path.relative(args.workspace, f.comprehension_json_path)}`);
      }
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

  process.exit((failures.length > 0 || manifestPaths.failures.length > 0) ? 1 : 0);
}

try {
  main();
} catch (err) {
  console.error(`[check-audit-manifest] fatal: ${err.message || err}`);
  process.exit(2);
}
