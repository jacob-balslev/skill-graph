'use strict';

/**
 * audit-state-sidecar.js — read/write helper for the per-skill `audit-state.json`
 * sidecar (ADR-0019). The audit/eval/provenance fields live in this sibling JSON
 * file, NOT in SKILL.md frontmatter. The audit loop (`/audit:*`) is the only
 * writer; everyday agents never read it.
 *
 * Canonical home. `lib/audit/audit-state-sidecar.js` is a thin re-export shim so
 * audit runtime code can `require('./audit-state-sidecar')` without a path that
 * escapes the lib/audit boundary (mirrors parse-frontmatter / roots).
 *
 * Self-contained: Node built-ins only.
 */

const fs = require('fs');
const path = require('path');

/** Absolute path to the audit-state.json sibling of a SKILL.md. */
function sidecarPathForSkill(skillMdPath) {
  return path.join(path.dirname(skillMdPath), 'audit-state.json');
}

/**
 * Read the sidecar for a skill. Returns the parsed object, or null when the
 * sidecar is absent / unreadable / not a plain object (an unmigrated or
 * brand-new skill legitimately has no sidecar — callers treat null as "no
 * audit state recorded", never as an error).
 */
function readSidecar(skillMdPath) {
  const p = sidecarPathForSkill(skillMdPath);
  if (!fs.existsSync(p)) return null;
  try {
    const obj = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    return obj;
  } catch (e) {
    process.stderr.write(`WARN ${p}: cannot parse audit-state.json — ${e.message}\n`);
    return null;
  }
}

/**
 * Merge a sidecar object UNDER a frontmatter object — frontmatter wins on any
 * key collision (the two field sets are disjoint by contract, so a collision
 * only happens for a skill mid-migration that still carries an audit field in
 * frontmatter, where the frontmatter copy is the one consumers read today).
 * Null sidecar returns the frontmatter unchanged. Mutates neither input.
 */
function joinSidecar(fm, sidecar) {
  if (!sidecar) return fm;
  return { ...sidecar, ...fm };
}

/**
 * Merge `fields` into the skill's sidecar (creating the file if absent),
 * preserving all other sidecar keys, and write pretty JSON with a trailing
 * newline. `undefined` values are dropped (not written). No-op write when the
 * serialized content is unchanged.
 *
 * @returns {{ written: boolean, path: string, sidecar: object }}
 */
function writeSidecarFields(skillMdPath, fields) {
  const p = sidecarPathForSkill(skillMdPath);
  const existing = readSidecar(skillMdPath) || {};
  const next = { ...existing, ...fields };
  for (const k of Object.keys(next)) {
    if (next[k] === undefined) delete next[k];
  }
  const before = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  const after = JSON.stringify(next, null, 2) + '\n';
  if (before === after) return { written: false, path: p, sidecar: next };
  fs.writeFileSync(p, after);
  return { written: true, path: p, sidecar: next };
}

module.exports = { sidecarPathForSkill, readSidecar, joinSidecar, writeSidecarFields };
