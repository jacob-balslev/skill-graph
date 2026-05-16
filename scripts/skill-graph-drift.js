#!/usr/bin/env node
/**
 * skill-graph drift — the drift sentinel for Skill Metadata Protocol grounding metadata.
 *
 * Walks every skill with a `grounding.truth_sources` list, hashes each source
 * file, and compares against the stored
 * `drift_check.truth_source_hashes` baseline. Reports four states:
 *
 *   - DRIFT           truth source has changed since last verification
 *   - STALE           `drift_check.last_verified` is older than lifecycle.stale_after_days
 *   - BROKEN          a declared local truth source file does not exist
 *   - NO_BASELINE     truth sources exist but no hashes are recorded yet
 *   - EXTERNAL_UNHASHED
 *                     a URL truth source is valid but not fetched by this tool
 *
 * This tool is the reason `grounding.truth_sources` is in the contract at all.
 * Without an executable drift check, grounding is decorative; with this tool,
 * grounding anchors every skill to evidence and surfaces the moment evidence
 * moves out from under the skill.
 *
 * Usage:
 *   node scripts/skill-graph-drift.js                        # check all skills
 *   node scripts/skill-graph-drift.js skills/shopify         # check one skill
 *   node scripts/skill-graph-drift.js --json                 # JSON output
 *   node scripts/skill-graph-drift.js --record skills/shopify          # preview YAML
 *   node scripts/skill-graph-drift.js --record --apply skills/shopify  # write in place
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 when no DRIFT or BROKEN; 1 otherwise. STALE, NO_BASELINE, and
 * EXTERNAL_UNHASHED are informational and do not fail.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { parseFrontmatter } = require('./lib/parse-frontmatter');
const { workspaceRoot, resolveTruthSourcePath } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const DEFAULT_SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const CONFIG_PATH = path.join(REPO_ROOT, '.skill-graph', 'config.json');

// ---------------------------------------------------------------------------
// Workspace config (shared with generate-manifest.js)
// ---------------------------------------------------------------------------

function loadWorkspaceConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return (raw && raw.workspace) || null;
  } catch (e) {
    return null;
  }
}

function resolveSkillRoots(workspace) {
  if (!workspace || !Array.isArray(workspace.skill_roots) || workspace.skill_roots.length === 0) {
    return [{ absPath: DEFAULT_SKILLS_DIR, project: null }];
  }
  return workspace.skill_roots
    .map(entry => {
      if (typeof entry === 'string') return { absPath: path.resolve(REPO_ROOT, entry), project: null };
      if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
        return {
          absPath: path.resolve(REPO_ROOT, entry.path),
          project: (typeof entry.project === 'string' && entry.project.length > 0) ? entry.project : null,
        };
      }
      return null;
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Truth source normalization + hashing
// ---------------------------------------------------------------------------

function normalizeTruthSource(src) {
  if (typeof src === 'string') {
    return { key: src, path: src, lineRange: null, anchor: null, raw: src };
  }
  if (src && typeof src === 'object' && typeof src.path === 'string') {
    const lineRange = src.line_range && typeof src.line_range === 'object'
      ? {
          start: Number.isInteger(src.line_range.start) ? src.line_range.start : null,
          end: Number.isInteger(src.line_range.end) ? src.line_range.end : null,
        }
      : null;
    const anchor = typeof src.anchor === 'string' && src.anchor.length > 0 ? src.anchor : null;
    let key = src.path;
    if (lineRange && lineRange.start) {
      key += `#L${lineRange.start}-L${lineRange.end || lineRange.start}`;
    } else if (anchor) {
      key += `#${anchor}`;
    }
    return { key, path: src.path, lineRange, anchor, raw: src };
  }
  return { key: String(src), path: null, lineRange: null, anchor: null, raw: src, malformed: true };
}

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function isRemoteTruthSourcePath(value) {
  return /^https?:\/\//i.test(String(value));
}

function slugifyHeading(headingText) {
  return headingText
    .replace(/^#+\s*/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sectionForHeadingAnchor(text, anchor) {
  const lines = text.split('\n');
  let start = -1;
  let level = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && slugifyHeading(m[2]) === anchor) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+/);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join('\n');
}

function sha256TruthSource(src, skillRoots = []) {
  const normalized = normalizeTruthSource(src);
  if (normalized.malformed || !normalized.path) {
    return { normalized, hash: null, error: 'malformed truth source' };
  }

  if (isRemoteTruthSourcePath(normalized.path)) {
    return {
      normalized,
      hash: null,
      error: 'external URL not hashed by zero-dependency drift sentinel',
      external: true,
    };
  }

  const absPath = resolveTruthSourcePath(normalized.path, REPO_ROOT, skillRoots);
  if (!fs.existsSync(absPath)) {
    return { normalized, hash: null, error: 'file not found' };
  }

  const text = fs.readFileSync(absPath, 'utf8').replace(/\r\n?/g, '\n');
  let content = text;

  if (normalized.lineRange && normalized.lineRange.start) {
    const lines = text.split('\n');
    const start = normalized.lineRange.start;
    const end = normalized.lineRange.end || start;
    if (start < 1 || end < start || end > lines.length) {
      return { normalized, hash: null, error: `line range ${start}-${end} out of bounds` };
    }
    content = lines.slice(start - 1, end).join('\n');
  } else if (normalized.anchor) {
    const section = sectionForHeadingAnchor(text, normalized.anchor);
    if (section !== null) {
      content = section;
    }
  }

  if (normalized.anchor && !text.includes(normalized.anchor) && sectionForHeadingAnchor(text, normalized.anchor) === null) {
    return { normalized, hash: null, error: `anchor "${normalized.anchor}" not found` };
  }

  return { normalized, hash: hashContent(content), error: null };
}

// ---------------------------------------------------------------------------
// Drift check per skill
// ---------------------------------------------------------------------------

function checkSkill(skillMdPath, skillRoots = []) {
  const rel = path.relative(REPO_ROOT, skillMdPath);
  const text = fs.readFileSync(skillMdPath, 'utf8');
  const fm = parseFrontmatter(text);

  if (!fm) {
    return { skill: rel, status: 'NO_FRONTMATTER', details: 'cannot parse frontmatter', truth_sources: [] };
  }
  const name = fm.name || path.basename(path.dirname(skillMdPath));
  const grounding = fm.grounding;
  if (!grounding || !Array.isArray(grounding.truth_sources) || grounding.truth_sources.length === 0) {
    return { skill: name, path: rel, status: 'UNGROUNDED', details: 'no truth_sources declared', truth_sources: [] };
  }

  const driftCheck = fm.drift_check || {};
  const recordedHashes = driftCheck.truth_source_hashes || {};
  const lastVerified = driftCheck.last_verified || null;
  const lifecycle = fm.lifecycle || {};

  const truthSources = [];
  let anyDrift = false;
  let anyBroken = false;
  let anyMissingHash = false;
  let anyExternal = false;

  for (const src of grounding.truth_sources) {
    const hashed = sha256TruthSource(src, skillRoots);
    const liveHash = hashed.hash;
    const sourceKey = hashed.normalized.key;
    const recorded = recordedHashes[sourceKey];

    let entryStatus;
    if (hashed.external) { entryStatus = 'EXTERNAL_UNHASHED'; anyExternal = true; }
    else if (liveHash === null) { entryStatus = 'BROKEN'; anyBroken = true; }
    else if (!recorded) { entryStatus = 'NO_BASELINE'; anyMissingHash = true; }
    else if (liveHash !== recorded) { entryStatus = 'DRIFT'; anyDrift = true; }
    else { entryStatus = 'CLEAN'; }

    truthSources.push({
      source: sourceKey,
      path: hashed.normalized.path,
      line_range: hashed.normalized.lineRange,
      anchor: hashed.normalized.anchor,
      live_hash: liveHash,
      recorded_hash: recorded || null,
      error: hashed.error,
      status: entryStatus,
    });
  }

  // Staleness.
  let stale = false;
  let daysSinceVerified = null;
  if (lastVerified && lifecycle.stale_after_days) {
    const a = new Date(lastVerified).getTime();
    const b = Date.now();
    if (!isNaN(a)) {
      daysSinceVerified = Math.floor((b - a) / 86400000);
      stale = daysSinceVerified > lifecycle.stale_after_days;
    }
  }

  let status;
  if (anyDrift) status = 'DRIFT';
  else if (anyBroken) status = 'BROKEN';
  else if (stale) status = 'STALE';
  else if (anyMissingHash) status = 'NO_BASELINE';
  else if (anyExternal) status = 'EXTERNAL_UNHASHED';
  else status = 'CLEAN';

  return {
    skill: name,
    path: rel,
    status,
    stale,
    days_since_verified: daysSinceVerified,
    stale_after_days: lifecycle.stale_after_days || null,
    last_verified: lastVerified,
    truth_sources: truthSources,
  };
}

// ---------------------------------------------------------------------------
// --record mode: emit a drift_check block with current hashes + today's date.
//
// Prints a YAML fragment by default. With --apply, rewrites the SKILL.md file
// in place using line-based replacement. Line-based so we preserve the
// author's comments, quoting, and indentation.
// ---------------------------------------------------------------------------

function todayISO() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function buildDriftCheckBlock(truthSources, indent) {
  const out = [];
  out.push(`${indent}drift_check:`);
  out.push(`${indent}  last_verified: "${todayISO()}"`);
  if (truthSources.length > 0) {
    out.push(`${indent}  truth_source_hashes:`);
    for (const ts of truthSources) {
      if (ts.live_hash) {
        out.push(`${indent}    "${ts.source}": "${ts.live_hash}"`);
      }
    }
  }
  return out;
}

/**
 * Rewrite the drift_check block of a SKILL.md file in place.
 *
 * Locates the existing drift_check block (single-line scalar OR multi-line
 * object), removes it, and inserts the newly computed block at the same
 * position. All other frontmatter lines are preserved verbatim.
 */
function applyRecord(skillMdPath, truthSources) {
  const text = fs.readFileSync(skillMdPath, 'utf8');
  const newline = text.includes('\r\n') ? '\r\n' : '\n';
  const lines = text.split(/\r?\n/);
  if (lines[0].replace(/^\uFEFF/, '') !== '---') throw new Error('no frontmatter delimiter');
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { closeIdx = i; break; }
  }
  if (closeIdx === -1) throw new Error('unterminated frontmatter');

  // Locate drift_check block: starts at a top-level `drift_check:` line,
  // ends just before the next line at the same or shallower indent level.
  let start = -1;
  let end = -1;
  let indent = '';
  for (let i = 1; i < closeIdx; i++) {
    const m = lines[i].match(/^(\s*)drift_check\s*:/);
    if (m) {
      start = i;
      indent = m[1];
      break;
    }
  }
  if (start === -1) {
    throw new Error('drift_check block not found — run migrate-skill-v2-to-v3.js first');
  }

  // Find the end of the block.
  const blockIndentLen = indent.length;
  end = start;
  for (let i = start + 1; i < closeIdx; i++) {
    const line = lines[i];
    if (line.trim() === '') { end = i; continue; }
    const lineIndent = line.match(/^ */)[0].length;
    if (lineIndent <= blockIndentLen) {
      end = i - 1;
      break;
    }
    end = i;
  }

  const newBlock = buildDriftCheckBlock(truthSources, indent);
  const before = lines.slice(0, start);
  const after = lines.slice(end + 1);
  const newLines = before.concat(newBlock, after);
  fs.writeFileSync(skillMdPath, newLines.join(newline), 'utf8');
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function collectSkillFiles(args, roots) {
  const explicit = args.filter(a => !a.startsWith('--'));

  if (explicit.length > 0) {
    const out = [];
    for (const arg of explicit) {
      const abs = path.resolve(arg);
      if (!fs.existsSync(abs)) {
        console.error(`ERROR ${arg}: path does not exist`);
        process.exit(1);
      }
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        const skillMd = path.join(abs, 'SKILL.md');
        if (fs.existsSync(skillMd)) out.push(skillMd);
      } else if (abs.endsWith('SKILL.md')) {
        out.push(abs);
      }
    }
    return out;
  }

  const out = [];
  for (const { absPath } of roots) {
    if (!fs.existsSync(absPath)) continue;
    for (const name of fs.readdirSync(absPath).sort()) {
      const skillMd = path.join(absPath, name, 'SKILL.md');
      if (fs.existsSync(skillMd)) out.push(skillMd);
    }
  }
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const record = args.includes('--record');
  const apply = args.includes('--apply');

  const workspace = loadWorkspaceConfig();
  const roots = resolveSkillRoots(workspace);

  const files = collectSkillFiles(args, roots);
  if (files.length === 0) {
    console.error('No SKILL.md files found.');
    process.exit(1);
  }

  const reports = files.map(f => checkSkill(f, roots));

  // -------------------------------------------------------------------------
  // Record mode
  // -------------------------------------------------------------------------
  if (record) {
    let exitCode = 0;
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const skillMdPath = files[i];
      if (report.status === 'UNGROUNDED' || report.status === 'NO_FRONTMATTER') continue;
      const truthSources = report.truth_sources.filter(ts => ts.live_hash);
      if (truthSources.length === 0) continue;

      if (apply) {
        try {
          applyRecord(skillMdPath, truthSources);
          console.log(`OK ${path.relative(REPO_ROOT, skillMdPath)} — drift_check recorded`);
        } catch (e) {
          console.error(`FAIL ${path.relative(REPO_ROOT, skillMdPath)}: ${e.message}`);
          exitCode = 1;
        }
      } else {
        console.log(`# ${path.relative(REPO_ROOT, skillMdPath)} — preview (re-run with --apply to write)`);
        console.log(buildDriftCheckBlock(truthSources, '').join('\n'));
        console.log('');
      }
    }
    process.exit(exitCode);
  }

  // -------------------------------------------------------------------------
  // Check mode (default)
  // -------------------------------------------------------------------------
  if (outputJson) {
    process.stdout.write(JSON.stringify({ reports }, null, 2) + '\n');
  } else {
    const statusCounts = {};
    for (const r of reports) statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

    for (const r of reports) {
      if (r.status === 'UNGROUNDED' || r.status === 'CLEAN') continue;
      const staleInfo = r.stale ? `  (stale ${r.days_since_verified}d / limit ${r.stale_after_days}d)` : '';
      console.log(`${r.status.padEnd(13)} ${r.skill}${staleInfo}`);
      for (const ts of r.truth_sources) {
        if (ts.status !== 'CLEAN') {
          console.log(`  ${ts.status.padEnd(13)} ${ts.source}`);
        }
      }
    }

    const summary = Object.entries(statusCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([s, n]) => `${n} ${s}`)
      .join(', ');
    console.log(`\n${reports.length} skill(s): ${summary || 'all clean'}`);
  }

  const hasDriftOrBroken = reports.some(r => r.status === 'DRIFT' || r.status === 'BROKEN');
  process.exit(hasDriftOrBroken ? 1 : 0);
}

module.exports = {
  checkSkill,
  hashContent,
  isRemoteTruthSourcePath,
  normalizeTruthSource,
  sha256TruthSource,
};

if (require.main === module) main();
