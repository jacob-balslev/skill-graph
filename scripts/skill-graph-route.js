#!/usr/bin/env node
/**
 * skill-graph route — the reference consumer for the Skill Graph contract.
 *
 * Reads a compiled manifest (`skills.manifest.json` or
 * `examples/skills.manifest.sample.json`) and picks skills for a natural-language
 * query using every graph field that differentiates Skill Graph from plain
 * Agent Skills:
 *
 *   - activation.keywords / activation.triggers — scoring signal
 *   - activation.paths                          — optional `--path` boost
 *   - project_tags + workspace.projects         — project-scope filter
 *   - relations.depends_on                      — transitive co-load
 *   - relations.boundary                        — anti-ownership exclusion
 *   - relations.verify_with                     — secondary co-load
 *   - health.eval_state                         — quality gate
 *   - health.drift_check + health.lifecycle     — staleness annotation
 *
 * The output explains WHY each skill was selected or excluded. That is the
 * point: the reference consumer exists so `boundary` and `depends_on` and
 * `eval_state` are visible in a routing decision, not just declared in a
 * frontmatter nobody reads.
 *
 * Usage:
 *   node scripts/skill-graph-route.js "shopify webhook signature"
 *   node scripts/skill-graph-route.js "refactor" --project sales-hub
 *   node scripts/skill-graph-route.js "ssr hydration" --max 5
 *   node scripts/skill-graph-route.js "types" --min-eval-state passing
 *   node scripts/skill-graph-route.js "css" --path src/components/Header.tsx
 *   node scripts/skill-graph-route.js --manifest examples/skills.manifest.sample.json "css"
 *   node scripts/skill-graph-route.js --json "css"
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success, 1 on manifest load failure or no query.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'skills.manifest.json');
const SAMPLE_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');

// ---------------------------------------------------------------------------
// Tokenization & scoring
// ---------------------------------------------------------------------------

/**
 * English function-word stopwords. Dropped from both query and keyword
 * tokenization so that matches are carried by content tokens, not by
 * pronouns / articles / auxiliaries / WH-words that appear in almost every
 * natural-language prompt.
 *
 * Without this set, a query like "fix this" exact-matches any keyword phrase
 * containing "this", driving library-wide false positives. See
 * `docs/plans/routing-harness-followup.md` § M1.
 */
/**
 * Scope tiebreaker ranks (lower wins). Doctrine: a skill bound to a specific
 * codebase is always more specific than a reference skill, which is always
 * more specific than a portable skill. Used in `routeSkills()` sort. Unknown
 * scopes fall back to `_default` so a manifest with a new scope value sorts
 * last rather than throwing.
 */
const SCOPE_RANK = { codebase: 0, reference: 1, portable: 2, _default: 99 };

/**
 * Type tiebreaker ranks (lower wins). Doctrine: workflow > capability >
 * router > overlay. Matches `skills/skill-router/SKILL.md § Type tiebreaker`.
 */
const TYPE_RANK = { workflow: 0, capability: 1, router: 2, overlay: 3, _default: 99 };

const STOPWORDS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'as', 'if',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'it', 'its', 'my', 'our', 'your', 'their', 'his', 'her',
  'do', 'does', 'did', 'can', 'could', 'may', 'might', 'should', 'would',
  'have', 'has', 'had',
  'how', 'when', 'where', 'what', 'why', 'who', 'which',
  'and', 'or', 'not', 'but', 'so', 'then',
]);

/**
 * Split a query or keyword into lowercase content tokens.
 *
 * A token must be length ≥ 2 and NOT a stopword. The stopword filter applies
 * equally on both sides of the comparison (query and keyword), so dropping a
 * token from one side implicitly drops it from the other. The keyword side
 * additionally enforces length ≥ 3 in `scoreSkill()` to prevent short-token
 * false positives surviving stopword removal (e.g. "up", "it" in phrases
 * like "set up the …").
 */
function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(t => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * Score a skill's activation against a query. Higher is better.
 *
 * Signals, in decreasing weight:
 *   - trigger exact match: 5
 *   - keyword exact-token match: 3 (each query token credited at most ONCE
 *     per skill, regardless of how many keyword phrases contain it —
 *     prevents keyword-bag stuffing, see M2 in the follow-up plan)
 *   - keyword substring match: 1 (per distinct query token, also deduped
 *     against tokens already credited as exact matches)
 *   - path match on --path arg: 2
 *
 * Returns { score, matchedBecause } where matchedBecause is a short tag list
 * used to explain the routing decision back to the user.
 */
function scoreSkill(skill, queryTokens, pathArg) {
  let score = 0;
  const reasons = [];

  const activation = skill.activation || {};
  const triggers = activation.triggers || [];
  const keywords = activation.keywords || [];
  const paths = activation.paths || [];

  // Triggers: exact match on the entire query OR on any word boundary.
  const queryJoined = queryTokens.join(' ');
  for (const trigger of triggers) {
    const t = String(trigger).toLowerCase();
    if (t === queryJoined || queryTokens.includes(t)) {
      score += 5;
      reasons.push(`trigger:${t}`);
    }
  }

  // Keywords scored in TWO passes, each with its own per-token dedup set:
  //
  //   Pass 1 (exact):     each query token earns +3 AT MOST ONCE per skill,
  //                       regardless of how many keyword phrases contain it.
  //                       Prevents keyword-bag stuffing (M2 in the follow-up
  //                       plan) — e.g. a skill with six phrases all containing
  //                       "skill" can no longer beat a skill with two phrases
  //                       but more precise content.
  //
  //   Pass 2 (substring): each query token earns +1 AT MOST ONCE per skill,
  //                       and ONLY if it did not already earn an exact match
  //                       in pass 1. Running substring in a second pass —
  //                       rather than falling back per-keyword inside pass 1
  //                       — is the critical fix for the "cleanup" vs
  //                       "clean this up" interaction. A substring credit on
  //                       "clean" from the phrase "cleanup" must not poison a
  //                       later exact match on "clean" from the phrase
  //                       "clean this up". Separate sets keep the two dedups
  //                       independent.
  const exactMatchedTokens = new Set();
  for (const keyword of keywords) {
    const kwTokens = tokenize(keyword).filter(t => t.length >= 3);
    for (const kw of kwTokens) {
      if (queryTokens.includes(kw) && !exactMatchedTokens.has(kw)) {
        exactMatchedTokens.add(kw);
        score += 3;
        reasons.push(`keyword:${keyword}`);
        break;
      }
    }
  }

  const substringMatchedTokens = new Set();
  for (const keyword of keywords) {
    const full = String(keyword).toLowerCase();
    for (const q of queryTokens) {
      if (
        q.length >= 3 &&
        !exactMatchedTokens.has(q) &&
        !substringMatchedTokens.has(q) &&
        full.includes(q)
      ) {
        substringMatchedTokens.add(q);
        score += 1;
        reasons.push(`~keyword:${keyword}`);
        break;
      }
    }
  }

  // Path match: if the caller passed --path, boost skills whose paths glob matches.
  if (pathArg) {
    for (const pattern of paths) {
      if (matchesGlob(pathArg, pattern)) {
        score += 2;
        reasons.push(`path:${pattern}`);
        break;
      }
    }
  }

  return { score, reasons };
}

/**
 * Minimal glob matcher supporting `*`, `**`, `?`, and `!` negation prefix.
 * Paths are matched against posix-style separators.
 *
 * Returns true when the pattern matches. Negation patterns return false when
 * they match (the caller is responsible for handling mixed positive+negative
 * lists, which this routing tool does NOT do yet — keep single-pattern match
 * simple here).
 */
function matchesGlob(filePath, pattern) {
  let negate = false;
  let pat = pattern;
  if (pat.startsWith('!')) { negate = true; pat = pat.slice(1); }

  const re = new RegExp(
    '^' + pat
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '::DOUBLE_STAR::')
      .replace(/\*/g, '[^/]*')
      .replace(/::DOUBLE_STAR::/g, '.*')
      .replace(/\?/g, '[^/]') + '$'
  );
  const matched = re.test(filePath.replace(/\\/g, '/'));
  return negate ? !matched : matched;
}

// ---------------------------------------------------------------------------
// Relation helpers
// ---------------------------------------------------------------------------

/** Extract a skill name from a v2 bare-string or v3 {skill, ...} relation item. */
function relItemName(item) {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object' && typeof item.skill === 'string') return item.skill;
  return null;
}

/** Extract a human-readable reason from a v3 boundary item, if present. */
function boundaryReason(item) {
  if (item && typeof item === 'object' && typeof item.reason === 'string') return item.reason;
  return null;
}

// ---------------------------------------------------------------------------
// Project-tag matching
// ---------------------------------------------------------------------------

/**
 * Decide whether a skill applies to a given project handle, using the
 * workspace config's semantic-tag mapping to expand the project into a set
 * of matchable tags.
 *
 * A skill matches when:
 *   - it has no project_tags (ambient / cross-project), OR
 *   - any tag in project_tags matches the literal project handle, OR
 *   - any tag in project_tags matches one of the project's semantic_tags.
 */
function skillAppliesToProject(skill, project, workspace) {
  const tags = skill.project_tags || [];
  if (tags.length === 0) return { applies: true, reason: 'ambient' };
  if (!project) return { applies: true, reason: 'no project filter active' };

  if (tags.includes(project)) return { applies: true, reason: `literal:${project}` };

  const semanticTags = (workspace && workspace.projects && workspace.projects[project] && workspace.projects[project].semantic_tags) || [];
  for (const tag of tags) {
    if (semanticTags.includes(tag)) return { applies: true, reason: `semantic:${tag}` };
  }
  return { applies: false, reason: `project_tags [${tags.join(', ')}] exclude project "${project}"` };
}

// ---------------------------------------------------------------------------
// Staleness detection
// ---------------------------------------------------------------------------

function daysBetween(isoA, isoB) {
  const a = new Date(isoA).getTime();
  const b = new Date(isoB).getTime();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.floor((b - a) / 86400000);
}

/**
 * Compute staleness for a skill: { stale: boolean, days: number|null }.
 *
 * A skill is stale when lifecycle.stale_after_days is declared AND the days
 * elapsed since drift_check.last_verified exceed that limit.
 */
function computeStaleness(skill, today) {
  const health = skill.health || {};
  const lifecycle = (health.lifecycle) || {};
  const driftCheck = health.drift_check;
  if (!lifecycle.stale_after_days || !driftCheck || !driftCheck.last_verified) {
    return { stale: false, days: null };
  }
  const days = daysBetween(driftCheck.last_verified, today);
  if (days === null) return { stale: false, days: null };
  return { stale: days > lifecycle.stale_after_days, days };
}

// ---------------------------------------------------------------------------
// Routing pipeline
// ---------------------------------------------------------------------------

function routeSkills(manifest, options) {
  const {
    query,
    project,
    maxResults,
    minEvalState,
    pathArg,
    todayISO,
  } = options;

  const skills = Array.isArray(manifest.skills) ? manifest.skills : [];
  const workspace = manifest.workspace || null;
  const queryTokens = tokenize(query);

  const byName = new Map();
  for (const s of skills) byName.set(s.name, s);

  // -------------------------------------------------------------------------
  // Stage 1: score every skill and filter by project.
  // -------------------------------------------------------------------------
  const scored = [];
  const excludedByProject = [];

  for (const skill of skills) {
    const projectCheck = skillAppliesToProject(skill, project, workspace);
    if (!projectCheck.applies) {
      excludedByProject.push({ skill, reason: projectCheck.reason });
      continue;
    }
    const { score, reasons } = scoreSkill(skill, queryTokens, pathArg);
    if (score > 0) {
      scored.push({ skill, score, reasons, role: 'match', projectMatch: projectCheck.reason });
    }
  }

  if (scored.length === 0) {
    return {
      selected: [],
      coLoaded: [],
      excluded: [],
      excludedByProject,
      notes: ['no skills matched the query'],
    };
  }

  // Tiebreakers implement the doctrine documented in
  // `skills/skill-router/SKILL.md § Scope tiebreaker` and `§ Type tiebreaker`:
  //   1. Highest score wins.
  //   2. On a score tie, narrower scope wins: codebase > reference > portable.
  //   3. On a scope tie, more specific type wins: workflow > capability > router > overlay.
  //   4. On a complete tie, alphabetical by name (stable, deterministic output).
  scored.sort((a, b) =>
    (b.score - a.score) ||
    (SCOPE_RANK[a.skill.scope] ?? SCOPE_RANK._default) - (SCOPE_RANK[b.skill.scope] ?? SCOPE_RANK._default) ||
    (TYPE_RANK[a.skill.type] ?? TYPE_RANK._default) - (TYPE_RANK[b.skill.type] ?? TYPE_RANK._default) ||
    a.skill.name.localeCompare(b.skill.name)
  );

  // -------------------------------------------------------------------------
  // Stage 2: top-N matches seed the selection set.
  // -------------------------------------------------------------------------
  const topMatches = scored.slice(0, maxResults);
  const selectedNames = new Set(topMatches.map(e => e.skill.name));

  // -------------------------------------------------------------------------
  // Stage 3: expand via depends_on transitive closure.
  // -------------------------------------------------------------------------
  const coLoaded = [];
  const queue = topMatches.map(e => e.skill.name);
  const visited = new Set(queue);

  while (queue.length > 0) {
    const current = queue.shift();
    const skill = byName.get(current);
    if (!skill || !skill.relations || !Array.isArray(skill.relations.depends_on)) continue;
    for (const dep of skill.relations.depends_on) {
      const depName = relItemName(dep);
      if (!depName || visited.has(depName)) continue;
      visited.add(depName);
      const depSkill = byName.get(depName);
      if (depSkill) {
        const projectCheck = skillAppliesToProject(depSkill, project, workspace);
        if (projectCheck.applies) {
          coLoaded.push({
            skill: depSkill,
            reason: `depends_on closure from ${current}`,
            role: 'depends_on',
          });
          selectedNames.add(depName);
          queue.push(depName);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Stage 4: verify_with co-loading (one hop only — no transitive).
  // -------------------------------------------------------------------------
  for (const { skill } of topMatches) {
    if (!skill.relations || !Array.isArray(skill.relations.verify_with)) continue;
    for (const v of skill.relations.verify_with) {
      const vName = typeof v === 'string' ? v : null;
      if (!vName || selectedNames.has(vName)) continue;
      const vSkill = byName.get(vName);
      if (vSkill) {
        const projectCheck = skillAppliesToProject(vSkill, project, workspace);
        if (projectCheck.applies) {
          coLoaded.push({
            skill: vSkill,
            reason: `verify_with partner of ${skill.name}`,
            role: 'verify_with',
          });
          selectedNames.add(vName);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Stage 4b: broader (SKOS generalisation) parent recall boost.
  //
  // Per ADR 0001 Decision #3, `relations.broader` declares cross-skill
  // generalisation — the target is a more general skill the author wants
  // co-loaded when the specific (child) skill matches. SKOS semantics:
  //   skos:broader(child, parent) means "parent is broader than child".
  //
  // Recall behaviour: when a topMatch declares `broader: [parent]`, the parent
  // is co-loaded as a generalisation companion — the agent gets the broader
  // context alongside the specific match. One hop only (no transitive
  // ancestor walk), to mirror Stage 4's verify_with shape and avoid
  // accidentally pulling in entire taxonomy chains.
  //
  // Inverse direction (`narrower`) is NOT co-loaded because if the parent
  // matched, the children are NOT necessarily relevant — only an explicit
  // child match should pull the parent in. (Authors who want parent →
  // child co-loading should use `verify_with` or `depends_on`.)
  // -------------------------------------------------------------------------
  for (const { skill } of topMatches) {
    if (!skill.relations || !Array.isArray(skill.relations.broader)) continue;
    for (const b of skill.relations.broader) {
      const bName = typeof b === 'string' ? b : null;
      if (!bName || selectedNames.has(bName)) continue;
      const bSkill = byName.get(bName);
      if (bSkill) {
        const projectCheck = skillAppliesToProject(bSkill, project, workspace);
        if (projectCheck.applies) {
          coLoaded.push({
            skill: bSkill,
            reason: `broader generalisation of ${skill.name}`,
            role: 'broader',
          });
          selectedNames.add(bName);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // Stage 5: score-aware boundary exclusion.
  //
  // A skill listed in another SELECTED skill's boundary[] is removed from
  // the selection, subject to two guards:
  //
  //   (1) Only skills that scored in stage 1 — i.e. topMatches — may act as
  //       declaring skills. Co-loaded skills (brought in via depends_on or
  //       verify_with, with no independent query score) MUST NOT boundary-
  //       exclude anyone. Otherwise a topMatch that pulls in a verify_with
  //       partner can be excluded BY THAT PARTNER if the partner's boundary
  //       names the topMatch — a cyclic invalidation of the topMatch's own
  //       win. The partner's boundary is authored as a request-time guard
  //       for when the partner itself is the primary match, not as a veto
  //       on whatever brought it along.
  //
  //   (2) Even among topMatches, exclusion only fires if the declarer
  //       actually outscored the target. A weaker match cannot veto a
  //       stronger, more direct match on its own vocabulary (M3 in the
  //       follow-up plan). Score ties fall through to exclusion, so
  //       authored boundaries still break ties deterministically.
  // -------------------------------------------------------------------------
  const boundaryExcluded = [];
  for (const declaring of topMatches) {
    const skill = declaring.skill;
    if (!skill.relations || !Array.isArray(skill.relations.boundary)) continue;
    for (const b of skill.relations.boundary) {
      const bName = relItemName(b);
      const reason = boundaryReason(b);
      if (!bName) continue;
      if (!selectedNames.has(bName)) continue;

      const bScored = scored.find(e => e.skill.name === bName);
      if (bScored && bScored.score > declaring.score) {
        // Target outscored the declarer on the query; keep it in selection.
        continue;
      }

      const bSkill = byName.get(bName);
      if (bSkill) {
        boundaryExcluded.push({
          skill: bSkill,
          reason: reason
            ? `in boundary[] of ${skill.name}: ${reason}`
            : `in boundary[] of ${skill.name}`,
          role: 'boundary_excluded',
        });
        selectedNames.delete(bName);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Stage 6: quality gate (eval_state).
  // -------------------------------------------------------------------------
  const gateRank = { unverified: 0, passing: 1, monitored: 2 };
  const minGate = gateRank[minEvalState] ?? 0;
  const qualityExcluded = [];

  function passesGate(skill) {
    const state = (skill.health && skill.health.eval_state) || 'unverified';
    return (gateRank[state] ?? 0) >= minGate;
  }

  const filterGate = (list) => list.filter(entry => {
    if (passesGate(entry.skill)) return true;
    qualityExcluded.push({
      skill: entry.skill,
      reason: `eval_state=${(entry.skill.health && entry.skill.health.eval_state) || 'unverified'} below --min-eval-state=${minEvalState}`,
      role: 'quality_excluded',
    });
    return false;
  });

  const selectedFiltered = filterGate(topMatches.filter(e => selectedNames.has(e.skill.name)));
  const coLoadedFiltered = filterGate(coLoaded.filter(e => selectedNames.has(e.skill.name)));

  // -------------------------------------------------------------------------
  // Stage 7: staleness annotation (does not exclude).
  // -------------------------------------------------------------------------
  function annotate(entry) {
    const s = computeStaleness(entry.skill, todayISO);
    return { ...entry, staleness: s };
  }

  return {
    selected: selectedFiltered.map(annotate),
    coLoaded: coLoadedFiltered.map(annotate),
    excluded: boundaryExcluded.concat(qualityExcluded).map(annotate),
    excludedByProject,
    notes: [],
  };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function pad(str, width) {
  const s = String(str);
  if (s.length >= width) return s.slice(0, width - 1) + '…';
  return s + ' '.repeat(width - s.length);
}

function renderText(result, query) {
  const lines = [];
  lines.push(`Query: "${query}"`);
  lines.push('');

  if (result.notes.length > 0) {
    for (const note of result.notes) lines.push(`  (${note})`);
    lines.push('');
  }

  const sec = (title, list, formatter) => {
    if (list.length === 0) return;
    lines.push(title);
    lines.push('  ' + pad('Skill', 24) + pad('Score', 7) + pad('State', 12) + 'Reason');
    lines.push('  ' + '─'.repeat(72));
    for (const entry of list) lines.push('  ' + formatter(entry));
    lines.push('');
  };

  sec('SELECTED', result.selected, e =>
    pad(e.skill.name, 24) +
    pad(String(e.score != null ? e.score : ''), 7) +
    pad((e.skill.health && e.skill.health.eval_state) || '-', 12) +
    (e.reasons ? e.reasons.join(', ') : '') +
    (e.staleness && e.staleness.stale ? `  ⚠ stale (${e.staleness.days}d since last verify)` : '')
  );

  sec('CO-LOADED', result.coLoaded, e =>
    pad(e.skill.name, 24) +
    pad('—', 7) +
    pad((e.skill.health && e.skill.health.eval_state) || '-', 12) +
    e.reason +
    (e.staleness && e.staleness.stale ? `  ⚠ stale (${e.staleness.days}d)` : '')
  );

  sec('EXCLUDED', result.excluded, e =>
    pad(e.skill.name, 24) +
    pad('—', 7) +
    pad((e.skill.health && e.skill.health.eval_state) || '-', 12) +
    e.reason
  );

  if (result.excludedByProject.length > 0) {
    lines.push(`EXCLUDED BY PROJECT FILTER (${result.excludedByProject.length} skill(s) — not shown)`);
    lines.push('');
  }

  const sCount = result.selected.length;
  const cCount = result.coLoaded.length;
  const xCount = result.excluded.length;
  const staleCount = [...result.selected, ...result.coLoaded].filter(e => e.staleness && e.staleness.stale).length;
  lines.push(`${sCount} selected, ${cCount} co-loaded, ${xCount} excluded. ${staleCount} stale.`);
  return lines.join('\n');
}

function renderJson(result, query) {
  // Trim the skill objects to a useful subset for programmatic consumers.
  const trim = (e) => ({
    name: e.skill.name,
    id: e.skill.id,
    path: e.skill.path,
    score: e.score,
    role: e.role,
    eval_state: (e.skill.health && e.skill.health.eval_state) || null,
    reasons: e.reasons,
    reason: e.reason,
    staleness: e.staleness,
  });
  return JSON.stringify({
    query,
    selected: result.selected.map(trim),
    co_loaded: result.coLoaded.map(trim),
    excluded: result.excluded.map(trim),
    excluded_by_project: result.excludedByProject.map(e => ({ name: e.skill.name, reason: e.reason })),
  }, null, 2);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function argValue(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const manifestArg = argValue(args, '--manifest');
  const project = argValue(args, '--project') || process.env.SKILL_GRAPH_PROJECT || null;
  const maxResults = parseInt(argValue(args, '--max') || '10', 10);
  const minEvalState = argValue(args, '--min-eval-state') || 'unverified';
  const pathArg = argValue(args, '--path');

  // Everything that is not a flag and not a flag argument is treated as the query.
  const nonFlag = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      if (['--manifest', '--project', '--max', '--min-eval-state', '--path'].includes(a)) i++;
      continue;
    }
    nonFlag.push(a);
  }
  const query = nonFlag.join(' ').trim();

  if (!query) {
    console.error('Usage: skill-graph-route.js <query> [--project P] [--max N] [--min-eval-state unverified|passing|monitored] [--path FILE] [--manifest PATH] [--json]');
    process.exit(1);
  }

  const manifestPath = manifestArg
    ? path.resolve(manifestArg)
    : (fs.existsSync(DEFAULT_MANIFEST) ? DEFAULT_MANIFEST : SAMPLE_MANIFEST);

  if (!fs.existsSync(manifestPath)) {
    console.error(`ERROR manifest not found: ${manifestPath}`);
    console.error('Run `node scripts/generate-manifest.js --output skills.manifest.json` first, or pass --manifest <path>.');
    process.exit(1);
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    console.error(`ERROR cannot parse manifest: ${e.message}`);
    process.exit(1);
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const result = routeSkills(manifest, { query, project, maxResults, minEvalState, pathArg, todayISO });

  if (outputJson) {
    process.stdout.write(renderJson(result, query) + '\n');
  } else {
    process.stdout.write(renderText(result, query) + '\n');
  }
  process.exit(0);
}

// Allow require() from scripts/skill-graph-routing-eval.js so the harness
// can reuse the scoring + boundary-exclusion pipeline without shelling out.
module.exports = { routeSkills, tokenize, matchesGlob, computeStaleness };

if (require.main === module) main();
