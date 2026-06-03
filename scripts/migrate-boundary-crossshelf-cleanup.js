#!/usr/bin/env node
/**
 * One-time CONTENT codemod: drain cross-shelf `relations.boundary` edges.
 *
 * The 12-shelf re-axis (ADR-0020) split confusable skills across competency
 * shelves, which turned many same-shelf `relations.boundary` edges into
 * cross-shelf ones. Per the empirically-justified SAME-DOMAIN-ONLY boundary
 * doctrine (SKILL_METADATA_PROTOCOL.md § Relations, 2026-05-17 sweep: removing
 * cross-domain boundary entries caused 0 top-1 routing changes — they were
 * silent low-confidence exclusions), a cross-shelf boundary edge is debt. The
 * doctrine's prescribed fix is to move it to `relations.related`.
 *
 * This codemod, for every skill whose `relations` is a single-line escaped-JSON
 * scalar, moves each cross-shelf `boundary` entry's target into `related`
 * (deduped) and removes it from `boundary`. Every moved {source, target, reason}
 * is logged to stderr so the distinction text is preserved in the run record +
 * git history (the prior SKILL.md). Authoring `anti_examples` from those reasons
 * is per-skill audit-loop follow-up, not mechanical.
 *
 * Same-shelf boundary entries are left untouched. Skills whose `relations` is
 * not the single-line escaped-JSON form are reported as skips (none expected).
 *
 * Usage:
 *   node scripts/migrate-boundary-crossshelf-cleanup.js            # dry-run (default)
 *   node scripts/migrate-boundary-crossshelf-cleanup.js --apply    # rewrite SKILL.md
 */
'use strict';
const fs = require('fs');
const path = require('path');

const APPLY = process.argv.includes('--apply');
const SKILLS_ROOT = process.env.SKILLS_ROOT
  || path.resolve(__dirname, '..', '..', 'skills', 'skills');

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === 'SKILL.md') acc.push(p);
  }
  return acc;
}
function readSubject(text) {
  for (const line of text.split(/\r?\n/)) {
    if (line.trimStart().startsWith('#')) continue;
    const m = line.match(/^\s*subject:\s*([a-z][a-z0-9-]*)\s*$/);
    if (m) return m[1];
  }
  return null;
}
const RELATIONS_RE = /^(\s*)relations:\s*"(.*)"\s*$/m;
const targetName = (edge) => (typeof edge === 'string' ? edge : (edge && edge.skill)) || null;

function main() {
  const files = walk(SKILLS_ROOT, []);
  // name -> subject (current/migrated)
  const subjectOf = {};
  for (const f of files) subjectOf[path.basename(path.dirname(f))] = readSubject(fs.readFileSync(f, 'utf8'));

  let touched = 0, movedEdges = 0, skipped = [];
  const log = [];

  for (const f of files) {
    const name = path.basename(path.dirname(f));
    const srcSubject = subjectOf[name];
    const raw = fs.readFileSync(f, 'utf8');
    const m = raw.match(RELATIONS_RE);
    if (!m) continue; // no relations line
    let rel;
    try { rel = JSON.parse(m[2].replace(/\\"/g, '"')); }
    catch { skipped.push(name + ' (unparseable relations)'); continue; }
    if (!Array.isArray(rel.boundary) || rel.boundary.length === 0) continue;

    const keep = [], move = [];
    for (const edge of rel.boundary) {
      const tgt = targetName(edge);
      const tgtSubj = tgt ? (subjectOf[tgt] || subjectOf[tgt.split(/[/:]/).pop()]) : null;
      if (tgt && tgtSubj && tgtSubj !== srcSubject) move.push(edge);
      else keep.push(edge);
    }
    if (move.length === 0) continue;

    const related = Array.isArray(rel.related) ? rel.related.slice() : [];
    for (const edge of move) {
      const tgt = targetName(edge);
      if (tgt && !related.includes(tgt)) related.push(tgt);
      log.push(`${name}  --x-->  ${tgt}  [${subjectOf[tgt] || '?'}]  reason: ${typeof edge === 'object' ? (edge.reason || '') : ''}`);
      movedEdges++;
    }
    rel.boundary = keep;
    if (keep.length === 0) delete rel.boundary;
    rel.related = related;

    if (APPLY) {
      const serialized = JSON.stringify(rel).replace(/"/g, '\\"');
      const newLine = `${m[1]}relations: "${serialized}"`;
      fs.writeFileSync(f, raw.replace(RELATIONS_RE, newLine));
    }
    touched++;
  }

  process.stderr.write(`mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}   root: ${SKILLS_ROOT}   skills: ${files.length}\n`);
  process.stderr.write(`skills with cross-shelf boundary edges moved: ${touched}   edges moved: ${movedEdges}\n`);
  if (skipped.length) process.stderr.write(`SKIPPED (relations not single-line escaped-JSON): ${skipped.length}\n  ${skipped.join('\n  ')}\n`);
  process.stderr.write('\n--- moved edges (preserved here + in git history) ---\n');
  log.slice(0, 400).forEach((l) => process.stderr.write('  ' + l + '\n'));
  if (!APPLY) process.stderr.write('\n(dry-run — re-run with --apply)\n');
}
main();
