#!/usr/bin/env node
// check-charter-parity.js — enforce verbatim mirror of the SKILL-GRAPH-CHARTER block
// between the canonical source (skill-graph/AGENTS.md) and any active mirror.
//
// Background: skill-graph/AGENTS.md:8-12 declares a `<!-- SKILL-GRAPH-CHARTER v1 -->`
// block whose Mission/Vision/Three-Layers content is supposed to be mirrored verbatim
// into every active Skill Graph project repo's AGENTS.md. Opus's 2026-05-25 review
// (novelty memo #6) flagged this as drift-waiting-to-happen because no script enforced
// the mirror. This script closes that gap.
//
// Mirror states:
//   - CANONICAL SOURCE — the master copy, lives in skill-graph/AGENTS.md.
//   - MIRROR (active) — must match the canonical between the marker lines.
//   - MIRROR (archived) — known to be frozen at a prior version; warned but not failed.
//
// Exit codes:
//   0 — every active mirror matches the canonical (or only the canonical exists).
//   1 — at least one active mirror has drift, OR the canonical is missing.
//   2 — operational error.
//
// Flags:
//   --json     emit a JSON summary instead of human-readable lines.
//   --strict   treat archived mirrors as failures, not warnings.

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const WORKSPACE_ROOT = path.resolve(REPO_ROOT, '..');

const CANONICAL_PATH = path.join(REPO_ROOT, 'AGENTS.md');
const MARKER_BEGIN_RE = /<!--\s*SKILL-GRAPH-CHARTER\s+v(\d+)\s+—\s*([^.\n-]+?)(?:\s*\.\s*|\s*--)/;
const MARKER_END_RE = /-->/;

function parseArgs(argv) {
  const args = { json: false, strict: false };
  for (const a of argv) {
    if (a === '--json') args.json = true;
    else if (a === '--strict') args.strict = true;
    else if (a === '--help' || a === '-h') {
      console.log('Usage: check-charter-parity.js [--json] [--strict]');
      process.exit(0);
    } else {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    }
  }
  return args;
}

// Extract the charter block from a file. Returns { state, version, body }.
// state is 'CANONICAL', 'MIRROR_ACTIVE', 'MIRROR_ARCHIVED', or null if no marker.
function extractCharter(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split('\n');

  let inBlock = false;
  let state = null;
  let version = null;
  const body = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!inBlock) {
      const m = line.match(MARKER_BEGIN_RE);
      if (m) {
        version = m[1];
        const role = m[2].trim().toUpperCase();
        if (role.includes('CANONICAL SOURCE')) state = 'CANONICAL';
        else if (role.includes('MIRROR') && role.includes('ARCHIVED')) state = 'MIRROR_ARCHIVED';
        else if (role.includes('MIRROR')) state = 'MIRROR_ACTIVE';
        else state = 'UNKNOWN_ROLE';
        inBlock = true;
      }
    } else {
      if (MARKER_END_RE.test(line)) {
        // The end marker is on this line. The marker line itself is metadata, not body.
        break;
      }
      body.push(line);
    }
  }
  if (state === null) return null;
  return { state, version, body: body.join('\n').trim() };
}

// Find every AGENTS.md / CLAUDE.md / similar file under WORKSPACE_ROOT that might
// carry a charter marker. We scope this to AGENTS.md only because that's what the
// canonical declaration names; broader scanning would invite false positives.
function findChartersInWorkspace() {
  const results = [];
  const candidates = [
    path.join(REPO_ROOT, 'AGENTS.md'),
    path.join(WORKSPACE_ROOT, 'skill-audit-loop', 'AGENTS.md'),
    path.join(WORKSPACE_ROOT, 'skill-metadata-protocol', 'AGENTS.md'),
    path.join(WORKSPACE_ROOT, 'skills', 'AGENTS.md'),
  ];
  for (const file of candidates) {
    const charter = extractCharter(file);
    if (charter) results.push({ file, ...charter });
  }
  return results;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const canonicalCharter = extractCharter(CANONICAL_PATH);
  if (!canonicalCharter) {
    console.error(`[check-charter-parity] FATAL: canonical SKILL-GRAPH-CHARTER block not found in ${CANONICAL_PATH}`);
    process.exit(2);
  }
  if (canonicalCharter.state !== 'CANONICAL') {
    console.error(`[check-charter-parity] FATAL: charter in ${CANONICAL_PATH} declares state ${canonicalCharter.state}, expected CANONICAL`);
    process.exit(2);
  }

  const charters = findChartersInWorkspace();
  const mirrors = charters.filter((c) => c.file !== CANONICAL_PATH);

  const failures = [];
  const warnings = [];

  for (const mirror of mirrors) {
    const same = mirror.body === canonicalCharter.body;
    if (mirror.state === 'MIRROR_ACTIVE') {
      if (!same) {
        failures.push({
          file: mirror.file,
          state: mirror.state,
          version: mirror.version,
          reason: `Active mirror diverges from canonical (skill-graph/AGENTS.md). Active mirrors MUST be byte-identical between markers.`,
        });
      }
    } else if (mirror.state === 'MIRROR_ARCHIVED') {
      if (!same) {
        const entry = {
          file: mirror.file,
          state: mirror.state,
          version: mirror.version,
          reason: `Archived mirror diverges from canonical. Expected for frozen mirrors; ${args.strict ? 'failed under --strict' : 'warning only'}.`,
        };
        if (args.strict) failures.push(entry); else warnings.push(entry);
      }
    } else {
      failures.push({
        file: mirror.file,
        state: mirror.state,
        version: mirror.version,
        reason: `Unknown charter role ${mirror.state}; expected MIRROR (active) or MIRROR (archived).`,
      });
    }
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({
      canonical_path: CANONICAL_PATH,
      canonical_version: canonicalCharter.version,
      mirrors_checked: mirrors.length,
      failures: failures.length,
      warnings: warnings.length,
      failures_detail: failures,
      warnings_detail: warnings,
    }, null, 2) + '\n');
  } else {
    console.log(`[check-charter-parity] canonical: ${path.relative(WORKSPACE_ROOT, CANONICAL_PATH)} (v${canonicalCharter.version})`);
    console.log(`[check-charter-parity] mirrors checked: ${mirrors.length}`);
    if (failures.length === 0 && warnings.length === 0) {
      console.log('[check-charter-parity] OK — every mirror is in parity (or correctly archived).');
    } else {
      for (const f of failures) console.log(`  FAIL ${path.relative(WORKSPACE_ROOT, f.file)} (${f.state}): ${f.reason}`);
      for (const w of warnings) console.log(`  WARN ${path.relative(WORKSPACE_ROOT, w.file)} (${w.state}): ${w.reason}`);
    }
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

try { main(); } catch (err) {
  console.error(`[check-charter-parity] fatal: ${err.message || err}`);
  process.exit(2);
}
