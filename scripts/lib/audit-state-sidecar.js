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

/**
 * The behavior-gate verdicts that EARN the `skill_graph_protocol` content label.
 * A real assessment of a gradeable artifact earns it: `PASS` (independent grader
 * confirmed) and `PROVISIONAL` (a single competent model assessed the skill and
 * recorded a real result). `UNVERIFIED` (no gradeable artifact / no assessment)
 * never earns it; the negative grader verdicts `SHALLOW` / `REDUNDANT` are
 * deliberately excluded too — a skill flagged for rework has not earned a
 * content-conformance claim, and will be stamped if a later run reaches
 * PASS/PROVISIONAL.
 */
const PROTOCOL_EARNING_VERDICTS = new Set(['PASS', 'PROVISIONAL']);

/**
 * PURE earned-label computer (no fs). Returns the `skill_graph_protocol` content
 * label a skill has earned, or null when the earned condition is unmet:
 *   - the behavior gate produced a content-earning verdict (PASS/PROVISIONAL), AND
 *   - the skill carries a positive `schema_version` (integrity-validated upstream).
 *
 * The value mirrors the skill's `schema_version` MAJOR (e.g. `Skill Metadata
 * Protocol v8`), but — unlike `schema_version`, which a codemod can bump — the
 * label is WRITTEN only under the earned condition (the callers below gate on
 * this returning non-null), so its PRESENCE, not its integer, is the honest
 * "content verified at vN" signal. Kept pure so dependency-injected call sites
 * (recordFullLoop) can compute it with their own injected sidecar I/O.
 *
 * @returns {string|null}
 */
function earnedProtocolLabel({ comprehensionVerdict, schemaVersion } = {}) {
  if (!PROTOCOL_EARNING_VERDICTS.has(comprehensionVerdict)) return null;
  const major = typeof schemaVersion === 'number'
    ? schemaVersion
    : (typeof schemaVersion === 'string' && /^\d+/.test(schemaVersion) ? parseInt(schemaVersion, 10) : NaN);
  if (!Number.isFinite(major) || major <= 0) return null;
  return `Skill Metadata Protocol v${major}`;
}

/**
 * fs-touching convenience wrapper around {@link earnedProtocolLabel}: reads the
 * skill's sidecar, computes the earned label, and writes it when earned and not
 * already current. Used by the non-DI `evaluate` write-back path. Idempotent.
 *
 * Per `AGENTS.md § Version Labels Are Earned, Not Bumped`, this and the inline
 * equivalent in recordFullLoop are the only deterministic write paths for the
 * content label — never a find-replace.
 *
 * @returns {string|null} the stamped label, or null when the earned condition is unmet.
 */
function stampEarnedProtocolLabel(skillMdPath, { comprehensionVerdict } = {}) {
  const sidecar = readSidecar(skillMdPath) || {};
  const label = earnedProtocolLabel({ comprehensionVerdict, schemaVersion: sidecar.schema_version });
  if (!label) return null;
  if (sidecar.skill_graph_protocol === label) return label;
  writeSidecarFields(skillMdPath, { skill_graph_protocol: label });
  return label;
}

module.exports = {
  sidecarPathForSkill,
  readSidecar,
  joinSidecar,
  writeSidecarFields,
  earnedProtocolLabel,
  stampEarnedProtocolLabel,
  PROTOCOL_EARNING_VERDICTS,
};
