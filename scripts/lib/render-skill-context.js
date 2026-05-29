#!/usr/bin/env node
/**
 * render-skill-context.js — the shared "compile" core for projecting Skill
 * Metadata Protocol fields into a readable `## Skill Graph context` body section.
 *
 * This is the single renderer used by every path that materializes a skill for
 * an agent runtime:
 *   - `scripts/render-skills.js`        — local/dev compile (all skills, no gate)
 *   - `scripts/export-marketplace-skills.js` — public marketplace export (+ gate)
 *
 * The canonical SKILL.md source carries the rich protocol fields (under the
 * nested `metadata:` encoding or top-level), which Skill Graph's own router,
 * injector, and audit graders read directly. But a VENDOR auto-loader (Claude
 * Code / Codex / OpenCode / Gemini at startup+activation) reads only
 * `name + description` and the SKILL.md BODY — never the `metadata:` map or
 * arbitrary custom top-level fields. So the graph is invisible to a vendor
 * runtime unless it is projected into the body. This module is that projection.
 *
 * Design invariants:
 *   - AUGMENT, not replace: the authored body is untouched; the section is
 *     appended after it, fenced by stable markers so it is regenerable.
 *   - Deterministic: fixed field order, only present fields emitted, free-text
 *     whitespace collapsed — so `--check` stays stable.
 *   - No Markdown links: slugs render as `code` spans, so the projection never
 *     introduces dangling-link findings.
 *
 * Pure functions on normalized frontmatter — no fs, no network.
 */

'use strict';

const SKILL_GRAPH_CONTEXT_HEADING = '## Skill Graph context';
// Stable fence markers. A compile overwrites everything between these; content
// outside them (the authored body, and any hand-authored sections) is preserved.
const CONTEXT_MARKER_START = '<!-- skill-graph-context:start (generated — do not edit by hand) -->';
const CONTEXT_MARKER_END = '<!-- skill-graph-context:end -->';

const OWNS_CLAUSE_RE = /^[a-z][a-z0-9-]*[a-z0-9]\s+owns\s+([^;.]+?)(?:\s+where\s|\s+when\s|\s+that\s|[;.]|$)/i;

/**
 * Extract the "X owns Y" clause from a relations.boundary reason string.
 * E.g. "testing-strategy owns deterministic-software testing where every run
 * is binary..." → "deterministic-software testing".
 *
 * @param {string} reason The reason field from a Shape B boundary entry.
 * @returns {string|null} The owns clause, or null if no clean clause.
 */
function extractBoundaryOwnsClause(reason) {
  if (!reason || typeof reason !== 'string') return null;
  const m = OWNS_CLAUSE_RE.exec(reason);
  if (!m) return null;
  const clause = m[1].trim();
  if (clause.length === 0 || clause.length > 120) return null;
  return clause;
}

/** Collapse internal whitespace/newlines so a free-text field renders as one clean line. */
function oneLine(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
}

/**
 * Extract skill slugs from a relations[key] array that may be Shape A (bare
 * string slugs) or Shape B (objects `{ skill, reason }`). Returns deduped slugs
 * in source order.
 */
function relationSlugs(relations, key) {
  const arr = relations && Array.isArray(relations[key]) ? relations[key] : [];
  const out = [];
  for (const entry of arr) {
    const slug = typeof entry === 'string' ? entry : entry && entry.skill;
    if (slug && typeof slug === 'string' && !out.includes(slug)) out.push(slug);
  }
  return out;
}

/** Render a single truth-source entry (string or `{ path|file, lines, anchor }`) to a short string. */
function truthSourceLabel(entry) {
  if (typeof entry === 'string') return oneLine(entry);
  if (!entry || typeof entry !== 'object') return '';
  const base = entry.path || entry.file || entry.source || '';
  return oneLine(base);
}

/**
 * Render the generated "Skill Graph context" Markdown section from a skill's
 * normalized frontmatter. Returns '' when no meaningful field is present (the
 * caller then appends nothing). Only present fields are emitted; order is fixed.
 *
 * @param {object} fm Normalized frontmatter (post normalizeFrontmatter).
 * @returns {string} Markdown section text (no trailing newline), or ''.
 *
 * Projects ONLY agent-facing guidance into the body: classification, when-to-use,
 * not-for, related skills, concept (Understanding fields), grounding, and keywords.
 * Maintenance state — audit verdicts, eval status, lifecycle, and provenance
 * (version / schema_version / owner) — is deliberately NOT projected. It is
 * bookkeeping for the audit loop, not guidance for an agent USING the skill, and
 * a vendor loader feeds this body straight to the model. There is exactly ONE
 * render shape; the former `full`/`runtime` profile split was removed so no path
 * can ever leak maintenance state into a consumed skill. See AGENTS.md.
 */
function renderSkillGraphContext(fm) {
  if (!fm || typeof fm !== 'object') return '';
  const rel = (fm.relations && typeof fm.relations === 'object') ? fm.relations : {};
  const blocks = [];

  const push = (heading, lines) => {
    const kept = lines.filter(Boolean);
    if (kept.length > 0) blocks.push(`**${heading}**\n${kept.join('\n')}`);
  };

  // 1. Classification
  {
    const lines = [];
    if (fm.subject) {
      const extra = Array.isArray(fm.subjects)
        ? fm.subjects.map(s => (typeof s === 'string' ? s : s && s.subject)).filter(s => s && s !== fm.subject)
        : [];
      lines.push(`- Subject: \`${oneLine(fm.subject)}\`${extra.length ? ` (also: ${extra.map(s => `\`${oneLine(s)}\``).join(', ')})` : ''}`);
    }
    if (fm.deployment_target) lines.push(`- Deployment: \`${oneLine(fm.deployment_target)}\``);
    if (fm.taxonomy_domain) lines.push(`- Domain: \`${oneLine(fm.taxonomy_domain)}\``);
    if (fm.scope) lines.push(`- Scope: ${oneLine(fm.scope)}`);
    push('Classification', lines);
  }

  // 2. When to use — positive activation signal
  {
    const lines = [];
    const examples = Array.isArray(fm.examples) ? fm.examples : [];
    for (const ex of examples) {
      const t = oneLine(typeof ex === 'string' ? ex : ex && (ex.prompt || ex.query));
      if (t) lines.push(`- ${t}`);
    }
    const triggers = Array.isArray(fm.triggers) ? fm.triggers.map(oneLine).filter(Boolean) : [];
    if (triggers.length) lines.push(`- Triggers: ${triggers.map(t => `\`${t}\``).join(', ')}`);
    push('When to use', lines);
  }

  // 3. Not for — negative boundary (readable form of the description projection)
  {
    const lines = [];
    const antis = Array.isArray(fm.anti_examples) ? fm.anti_examples : [];
    for (const a of antis) {
      const t = oneLine(typeof a === 'string' ? a : a && (a.prompt || a.query));
      if (t) lines.push(`- ${t}`);
    }
    const boundary = Array.isArray(rel.boundary) ? rel.boundary : [];
    for (const entry of boundary) {
      if (!entry || typeof entry !== 'object') continue;
      if (!entry.skill) continue;
      const owns = extractBoundaryOwnsClause(entry.reason);
      lines.push(`- Owned by \`${oneLine(entry.skill)}\`${owns ? `: ${owns}` : ''}`);
    }
    push('Not for', lines);
  }

  // 4. Related skills — the graph neighborhood
  {
    const lines = [];
    const depends = relationSlugs(rel, 'depends_on');
    const verify = relationSlugs(rel, 'verify_with');
    const related = [...relationSlugs(rel, 'related'), ...relationSlugs(rel, 'adjacent')];
    const broader = relationSlugs(rel, 'broader');
    const narrower = relationSlugs(rel, 'narrower');
    const disjoint = relationSlugs(rel, 'disjoint_with');
    const fmt = slugs => slugs.map(s => `\`${s}\``).join(', ');
    if (depends.length) lines.push(`- Depends on: ${fmt(depends)}`);
    if (verify.length) lines.push(`- Verify with: ${fmt(verify)}`);
    if (related.length) lines.push(`- Related: ${fmt([...new Set(related)])}`);
    if (broader.length) lines.push(`- Broader: ${fmt(broader)}`);
    if (narrower.length) lines.push(`- Narrower: ${fmt(narrower)}`);
    if (disjoint.length) lines.push(`- Distinct from: ${fmt(disjoint)}`);
    push('Related skills', lines);
  }

  // 5. Concept — Understanding fields (only when authored)
  {
    const lines = [];
    if (fm.mental_model) lines.push(`- Mental model: ${oneLine(fm.mental_model)}`);
    if (fm.purpose) lines.push(`- Purpose: ${oneLine(fm.purpose)}`);
    if (fm.boundary) lines.push(`- Boundary: ${oneLine(fm.boundary)}`);
    if (fm.analogy) lines.push(`- Analogy: ${oneLine(fm.analogy)}`);
    if (fm.misconception) lines.push(`- Common misconception: ${oneLine(fm.misconception)}`);
    push('Concept', lines);
  }

  // 6. Grounding
  {
    const g = (fm.grounding && typeof fm.grounding === 'object') ? fm.grounding : null;
    const lines = [];
    if (g) {
      if (g.grounding_mode) lines.push(`- Mode: \`${oneLine(g.grounding_mode)}\``);
      const sources = Array.isArray(g.truth_sources) ? g.truth_sources.map(truthSourceLabel).filter(Boolean) : [];
      if (sources.length) lines.push(`- Truth sources: ${sources.map(s => `\`${s}\``).join(', ')}`);
    }
    push('Grounding', lines);
  }

  // 7. Keywords — an activation/routing signal, useful to a consuming agent/router.
  // This is the ONLY non-Understanding metadata projected. Maintenance state
  // (audit verdicts, eval_state/eval_score, routing_eval, stability, freshness,
  // superseded_by, last_audited) and provenance identity (version, schema_version,
  // owner) are deliberately NOT projected: they are bookkeeping for the audit loop,
  // not guidance for an agent USING the skill. A vendor loader feeds this body
  // straight to the model, so nothing here may be maintenance state. See AGENTS.md.
  {
    const keywords = Array.isArray(fm.keywords) ? fm.keywords.map(oneLine).filter(Boolean) : [];
    if (keywords.length) push('Keywords', [`- ${keywords.map(k => `\`${k}\``).join(', ')}`]);
  }

  if (blocks.length === 0) return '';
  return [
    SKILL_GRAPH_CONTEXT_HEADING,
    '',
    CONTEXT_MARKER_START,
    '',
    blocks.join('\n\n'),
    '',
    CONTEXT_MARKER_END,
  ].join('\n');
}

module.exports = {
  SKILL_GRAPH_CONTEXT_HEADING,
  CONTEXT_MARKER_START,
  CONTEXT_MARKER_END,
  OWNS_CLAUSE_RE,
  extractBoundaryOwnsClause,
  oneLine,
  relationSlugs,
  truthSourceLabel,
  renderSkillGraphContext,
};
