#!/usr/bin/env node
/**
 * skill-graph route — the reference consumer for Skill Metadata Protocol metadata.
 *
 * Reads a compiled manifest (`skills.manifest.json` or
 * `examples/skills.manifest.sample.json`) and picks skills for a natural-language
 * query using every graph field that differentiates Skill Graph from plain
 * SKILL.md:
 *
 *   - activation.keywords / activation.triggers — scoring signal
 *   - activation.paths                          — optional `--path` boost
 *   - project[].handle                          — project-fit filter
 *   - relations.depends_on                      — transitive co-load
 *   - relations.boundary                        — anti-ownership exclusion
 *   - relations.verify_with                     — secondary co-load
 *   - health.structural_verdict / truth_verdict — hard integrity gate (broken → excluded)
 *   - health.application_verdict                — behavior gate (Decision A: gate-out
 *                                                 proven-negatives, rank-weight the rest)
 *   - health.eval_state                         — opt-in `--min-eval-state` quality gate
 *   - health.drift_check + health.lifecycle     — staleness annotation
 *
 * The output explains WHY each skill was selected or excluded. That is the
 * point: the reference consumer exists so `boundary`, `depends_on`, the
 * four-verdict Health Block, and `eval_state` are visible in a routing
 * decision, not just declared in a frontmatter nobody reads.
 *
 * Four-verdict Health Block contract (Step 5, 2026-05-31 — see
 * docs/plans/skill-audit-loop-end-to-end-completion-2026-05-30.md § Decision A
 * and docs/verdict-semantics.md):
 *   - HARD integrity block: structural_verdict=FAIL or truth_verdict=BROKEN excludes
 *     the skill (genuinely broken). UNVERIFIED structural/truth — the corpus default —
 *     stays routable; gating on PASS would remove ~the whole library (the kill-switch
 *     error Decision A explicitly avoids).
 *   - BEHAVIOR gate-out: a proven-negative application_verdict
 *     (HARMFUL / REDUNDANT / FALSE_POSITIVE) excludes the skill, UNLESS the verdict
 *     has expired (skill changed since the grade, or the grade is older than
 *     NEGATIVE_VERDICT_EXPIRY_DAYS) — so a since-fixed skill is not tombstoned.
 *     MIXED stays routable (it is not proven-negative).
 *   - RANK-WEIGHT: APPLICABLE / PROVISIONAL get a gentle additive boost
 *     (< one keyword hit) so a certified skill wins ties; UNVERIFIED stays neutral
 *     and routable. The boost is a tiebreaker, never an override of keyword relevance.
 *
 * Usage:
 *   node scripts/skill-graph-route.js "accessibility keyboard navigation"
 *   node scripts/skill-graph-route.js "refactor" --project <your-project>
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
const { packageRoot, workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const PACKAGE_ROOT = packageRoot();
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'skills.manifest.json');
const SAMPLE_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const PACKAGE_SAMPLE_MANIFEST = path.join(PACKAGE_ROOT, 'examples', 'skills.manifest.sample.json');

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
 * Deployment-target tiebreaker ranks (lower wins). Doctrine: a skill bound to
 * a specific project is always more specific than a portable skill. Used in
 * `routeSkills()` sort. Unknown values fall back to `_default` so a manifest
 * with an unexpected value sorts last rather than throwing.
 *
 * (2026-05-27): renamed from `SCOPE_RANK`. The v8 `scope` enum
 * was repurposed to PRD-style free-text; deployment-targeting moved to the new
 * `deployment_target` field with the `workspace` value removed.
 */
const DEPLOYMENT_TARGET_RANK = {
  project: 0,
  portable: 2,
  _default: 99,
};

/**
 * Legacy type tiebreaker ranks (lower wins). Current v8 skills no longer
 * author `type`, but older sample manifests can still carry it. Keep this as a
 * deterministic fallback for legacy fixtures; current routing specificity is
 * carried by deployment_target/project fit, quality signals, and relations.
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

function normalizePhrase(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
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
function scoreSkill(skill, queryTokens, pathArg, rawQuery) {
  let score = 0;
  const reasons = [];

  const activation = skill.activation || {};
  const triggers = activation.triggers || [];
  const keywords = activation.keywords || [];
  const paths = activation.paths || [];

  // Triggers: exact match on the full raw query OR on any retained query token.
  // Full-sentence triggers must compare against the raw query, not the
  // stopword-stripped token string, otherwise exact routing-eval prompts lose
  // the very words that make them exact.
  const queryJoined = queryTokens.join(' ');
  const normalizedQuery = normalizePhrase(rawQuery);
  for (const trigger of triggers) {
    const t = normalizePhrase(trigger);
    if (t === queryJoined || queryTokens.includes(t)) {
      score += 5;
      reasons.push(`trigger:${t}`);
    } else if (t && t === normalizedQuery) {
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

  // Path match: if the caller passed --path, boost skills whose positive path
  // list matches after gitignore-style negations have been applied.
  if (pathArg) {
    const pathMatch = matchPathList(pathArg, paths);
    if (pathMatch.matched) {
      score += 2;
      reasons.push(`path:${pathMatch.pattern}`);
    }
  }

  return { score, reasons };
}

/**
 * Dependency-free glob support for activation.paths.
 * Paths are matched against posix-style separators.
 *
 * `matchesGlob()` answers whether one concrete glob matches one path.
 * `matchPathList()` applies authored list semantics, where `!pattern` only
 * subtracts from prior positive includes.
 */
function expandBraces(pattern) {
  const match = String(pattern).match(/\{([^{}]+)\}/);
  if (!match) return [String(pattern)];
  const before = pattern.slice(0, match.index);
  const after = pattern.slice(match.index + match[0].length);
  return match[1].split(',').flatMap(part => expandBraces(before + part + after));
}

function globToRegExp(pattern) {
  const pat = String(pattern).replace(/\\/g, '/');
  let out = '^';
  for (let i = 0; i < pat.length; i++) {
    const ch = pat[i];
    if (ch === '*') {
      if (pat[i + 1] === '*') {
        if (pat[i + 2] === '/') {
          out += '(?:.*/)?';
          i += 2;
        } else {
          out += '.*';
          i += 1;
        }
      } else {
        out += '[^/]*';
      }
      continue;
    }
    if (ch === '?') {
      out += '[^/]';
      continue;
    }
    out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(out + '$');
}

function matchesGlob(filePath, pattern) {
  let pat = pattern;
  if (typeof pat !== 'string' || pat.length === 0) return false;
  if (pat.startsWith('!')) pat = pat.slice(1);
  const normalizedPath = String(filePath).replace(/\\/g, '/');
  return expandBraces(pat).some(expanded => globToRegExp(expanded).test(normalizedPath));
}

function matchPathList(filePath, patterns) {
  let matched = false;
  let matchedPattern = null;
  let excludedBy = null;
  if (!Array.isArray(patterns)) return { matched, pattern: null, excludedBy: null };

  for (const pattern of patterns) {
    if (typeof pattern !== 'string' || pattern.length === 0) continue;
    const negated = pattern.startsWith('!');
    if (!matchesGlob(filePath, pattern)) continue;
    if (negated) {
      if (matched) {
        matched = false;
        excludedBy = pattern;
      }
    } else {
      matched = true;
      matchedPattern = pattern;
      excludedBy = null;
    }
  }

  return { matched, pattern: matched ? matchedPattern : null, excludedBy };
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
 * Decide whether a skill applies to a given project handle.
 *
 * 2026-05-27: the project-fit filter reads the per-skill
 * `project[]` array (object-shape entries with `handle` + optional `role`).
 * The pre-v8 `workspace_tags` field and its `workspace.projects` semantic-tag
 * mapping are gone; the current contract uses `project[]` and `deployment_target`.
 *
 * A skill matches when:
 *   - it has no `project` array (ambient / cross-project), OR
 *   - any entry's `handle` matches the literal project handle.
 */
function skillAppliesToProject(skill, project /* unused workspace param removed */) {
  const projects = Array.isArray(skill.project) ? skill.project : [];
  if (projects.length === 0) return { applies: true, reason: 'ambient' };
  if (!project) return { applies: true, reason: 'no project filter active' };

  for (const entry of projects) {
    if (entry && typeof entry.handle === 'string' && entry.handle === project) {
      return { applies: true, reason: `literal:${project}` };
    }
  }
  const handles = projects.map(e => (e && e.handle) || '?').join(', ');
  return { applies: false, reason: `project [${handles}] excludes project "${project}"` };
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
// Four-verdict Health Block gate (Step 5 — Decision A contract migration)
// ---------------------------------------------------------------------------
//
// The router historically gated only on `eval_state`. Step 5 wires it onto the
// four-verdict Health Block (structural / truth / comprehension / application)
// per Decision A. Behavior verdicts gate routing; structural/truth are hard
// integrity blocks; comprehension is informational (it is the weaker signal and
// does not gate). Enum values are canonical per docs/verdict-semantics.md.

// Proven-negative APPLICATION verdicts that gate a skill OUT of routing.
// MIXED is intentionally absent — it means "some cases applicable", not proven-bad.
// REDUNDANT/FALSE_POSITIVE/HARMFUL are the three Decision A demotes.
const NEGATIVE_APPLICATION_VERDICTS = new Set(['HARMFUL', 'REDUNDANT', 'FALSE_POSITIVE']);

// Rank-weight boost (additive, gentle). A single exact keyword/trigger hit is +5
// (scoreSkill), so a boost of 2/1 moves ties but never overrides genuine keyword
// relevance — a strong keyword match on an UNVERIFIED skill still outranks a weak
// match on an APPLICABLE one. UNVERIFIED is neutral (0): "unknown" is not "bad".
const APPLICATION_VERDICT_BOOST = { APPLICABLE: 2, PROVISIONAL: 1 };

// A negative behavior verdict expires after this many days so a skill that has
// since been fixed (but not yet re-graded) is not tombstoned forever.
const NEGATIVE_VERDICT_EXPIRY_DAYS = 90;

// Hard integrity blocks. ONLY proven-broken values block — UNVERIFIED structural/
// truth (the corpus default) stays routable. Gating on PASS would delete ~90% of
// the library on day one (the kill-switch category error Decision A avoids).
const STRUCTURAL_HARD_FAIL = new Set(['FAIL']);
const TRUTH_HARD_FAIL = new Set(['BROKEN']);

/**
 * Rank-weight boost for a skill's application_verdict. Returns 0 for UNVERIFIED,
 * MIXED, any negative verdict, or a missing Health Block.
 */
function applicationVerdictBoost(skill) {
  const v = skill.health && skill.health.application_verdict;
  return (v && APPLICATION_VERDICT_BOOST[v]) || 0;
}

/**
 * Decide whether a negative behavior verdict has expired (and so should no longer
 * gate the skill out). Expiry fires when EITHER the skill changed after the grade
 * (`last_changed` newer than the `eval_last_run` receipt) OR the grade is older
 * than NEGATIVE_VERDICT_EXPIRY_DAYS. Returns { expired, detail }.
 *
 * A negative verdict with no `eval_last_run` receipt is conservatively treated as
 * still-active — a recorded HARMFUL/REDUNDANT/FALSE_POSITIVE is a real signal even
 * without a timestamp, and the fix path produces a fresh receipt that supersedes it.
 */
function negativeVerdictExpired(health, today) {
  const runAt = health.eval_last_run && health.eval_last_run.at;
  if (health.last_changed && runAt) {
    const changedAfter = daysBetween(runAt, health.last_changed);
    if (changedAfter !== null && changedAfter > 0) {
      return { expired: true, detail: `; expired — skill changed ${changedAfter}d after grade` };
    }
  }
  if (runAt) {
    const age = daysBetween(runAt, today);
    if (age !== null && age > NEGATIVE_VERDICT_EXPIRY_DAYS) {
      return { expired: true, detail: `; expired — grade ${age}d old > ${NEGATIVE_VERDICT_EXPIRY_DAYS}d` };
    }
    return { expired: false, detail: age !== null ? `; graded ${age}d ago` : '' };
  }
  return { expired: false, detail: '; no eval_last_run receipt' };
}

/**
 * Hard verdict exclusion check. Returns null if the skill is NOT excluded by the
 * integrity/behavior gates, or { role, reason } describing the exclusion.
 *
 *   role: 'integrity_excluded' — structural FAIL / truth BROKEN (genuinely broken)
 *   role: 'behavior_excluded'  — active proven-negative application verdict
 */
function verdictExclusion(skill, today) {
  const h = skill.health || {};
  if (STRUCTURAL_HARD_FAIL.has(h.structural_verdict)) {
    return { role: 'integrity_excluded', reason: `structural_verdict=${h.structural_verdict} (broken — hard block)` };
  }
  if (TRUTH_HARD_FAIL.has(h.truth_verdict)) {
    return { role: 'integrity_excluded', reason: `truth_verdict=${h.truth_verdict} (broken — hard block)` };
  }
  const av = h.application_verdict;
  if (NEGATIVE_APPLICATION_VERDICTS.has(av)) {
    const exp = negativeVerdictExpired(h, today);
    if (!exp.expired) {
      return { role: 'behavior_excluded', reason: `application_verdict=${av} (proven-negative — gated out${exp.detail})` };
    }
    // Expired: the skill stays routable, treated as if unassessed.
  }
  return null;
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
  // manifest no longer carries a top-level `workspace` block .
  const queryTokens = tokenize(query);

  const byName = new Map();
  for (const s of skills) byName.set(s.name, s);

  // -------------------------------------------------------------------------
  // Stage 1: score every skill and filter by project.
  // -------------------------------------------------------------------------
  const scored = [];
  const excludedByProject = [];

  for (const skill of skills) {
    const projectCheck = skillAppliesToProject(skill, project);
    if (!projectCheck.applies) {
      excludedByProject.push({ skill, reason: projectCheck.reason });
      continue;
    }
    const { score, reasons } = scoreSkill(skill, queryTokens, pathArg, query);
    if (score > 0) {
      // Decision A rank-weight: a gentle additive boost for a certified
      // application_verdict (APPLICABLE/PROVISIONAL). Folded into the sort key
      // below via score+qualityBoost; the raw `score` stays the keyword score so
      // the displayed reasons remain interpretable.
      const qualityBoost = applicationVerdictBoost(skill);
      if (qualityBoost > 0) {
        reasons.push(`application_verdict=${skill.health.application_verdict} (+${qualityBoost} routing boost)`);
      }
      scored.push({ skill, score, reasons, role: 'match', projectMatch: projectCheck.reason, qualityBoost });
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

  // Tiebreakers implement the current routing doctrine:
  //   1. Highest score wins.
  //   2. On a score tie, narrower deployment_target wins: project > portable.
  //   3. On a deployment_target tie, legacy `type` breaks ties only for older
  //      sample manifests that still carry it.
  //   4. On a complete tie, alphabetical by name (stable, deterministic output).
  //
  // (2026-05-27): DEPLOYMENT_TARGET_RANK replaces SCOPE_RANK.
  function typeRank(skill) {
    if (skill.type !== undefined) {
      return TYPE_RANK[skill.type] ?? TYPE_RANK._default;
    }
    return TYPE_RANK._default;
  }
  scored.sort((a, b) =>
    ((b.score + (b.qualityBoost || 0)) - (a.score + (a.qualityBoost || 0))) ||
    (DEPLOYMENT_TARGET_RANK[a.skill.deployment_target] ?? DEPLOYMENT_TARGET_RANK._default) - (DEPLOYMENT_TARGET_RANK[b.skill.deployment_target] ?? DEPLOYMENT_TARGET_RANK._default) ||
    typeRank(a.skill) - typeRank(b.skill) ||
    a.skill.name.localeCompare(b.skill.name)
  );

  // -------------------------------------------------------------------------
  // Stage 2: top-N matches seed the selection set.
  // -------------------------------------------------------------------------
  const topMatches = scored.slice(0, maxResults);
  const selectedNames = new Set(topMatches.map(e => e.skill.name));

  // -------------------------------------------------------------------------
  // Stage 3: score-aware boundary exclusion among independently matched skills.
  //
  // Boundary exclusions run BEFORE co-loading. A skill that is excluded by a
  // stronger/equal selected owner must not still contribute its own
  // verify_with/broader/depends_on partners to the final result.
  // -------------------------------------------------------------------------
  const boundaryExcluded = [];
  const boundaryExcludedNames = new Set();
  for (const declaring of topMatches) {
    const skill = declaring.skill;
    if (!selectedNames.has(skill.name)) continue;
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
        boundaryExcludedNames.add(bName);
      }
    }
  }

  const activeTopMatches = topMatches.filter(e => selectedNames.has(e.skill.name));

  // -------------------------------------------------------------------------
  // Stage 4: expand via depends_on transitive closure.
  // -------------------------------------------------------------------------
  const coLoaded = [];
  const queue = activeTopMatches.map(e => e.skill.name);
  const visited = new Set(queue);

  while (queue.length > 0) {
    const current = queue.shift();
    const skill = byName.get(current);
    if (!skill || !skill.relations || !Array.isArray(skill.relations.depends_on)) continue;
    for (const dep of skill.relations.depends_on) {
      const depName = relItemName(dep);
      if (!depName || visited.has(depName) || boundaryExcludedNames.has(depName)) continue;
      visited.add(depName);
      const depSkill = byName.get(depName);
      if (depSkill) {
        const projectCheck = skillAppliesToProject(depSkill, project);
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
  // Stage 5: verify_with co-loading (one hop only — no transitive).
  // -------------------------------------------------------------------------
  for (const { skill } of activeTopMatches) {
    if (!skill.relations || !Array.isArray(skill.relations.verify_with)) continue;
    for (const v of skill.relations.verify_with) {
      const vName = typeof v === 'string' ? v : null;
      if (!vName || selectedNames.has(vName) || boundaryExcludedNames.has(vName)) continue;
      const vSkill = byName.get(vName);
      if (vSkill) {
        const projectCheck = skillAppliesToProject(vSkill, project);
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
  // Stage 5b: broader (SKOS generalisation) parent recall boost.
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
  for (const { skill } of activeTopMatches) {
    if (!skill.relations || !Array.isArray(skill.relations.broader)) continue;
    for (const b of skill.relations.broader) {
      const bName = typeof b === 'string' ? b : null;
      if (!bName || selectedNames.has(bName) || boundaryExcludedNames.has(bName)) continue;
      const bSkill = byName.get(bName);
      if (bSkill) {
        const projectCheck = skillAppliesToProject(bSkill, project);
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
  // Stage 6: verdict gate (four-verdict Health Block, Decision A) + eval_state.
  //
  // Order per Decision A: (1) HARD integrity block (structural FAIL / truth
  // BROKEN) — a broken skill never routes. (2) BEHAVIOR gate-out — an active
  // proven-negative application_verdict is excluded. (3) the opt-in eval_state
  // `--min-eval-state` quality gate (preserved verbatim; default = no gating).
  // -------------------------------------------------------------------------
  const gateRank = { unverified: 0, passing: 1, monitored: 2 };
  const minGate = gateRank[minEvalState] ?? 0;
  const qualityExcluded = [];
  const integrityExcluded = [];
  const behaviorExcluded = [];

  function passesGate(skill) {
    const state = (skill.health && skill.health.eval_state) || 'unverified';
    return (gateRank[state] ?? 0) >= minGate;
  }

  const filterGate = (list) => list.filter(entry => {
    // (1)+(2) Hard verdict gates (integrity + behavior).
    const vex = verdictExclusion(entry.skill, todayISO);
    if (vex) {
      const bucket = vex.role === 'integrity_excluded' ? integrityExcluded : behaviorExcluded;
      bucket.push({ skill: entry.skill, reason: vex.reason, role: vex.role });
      return false;
    }
    // (3) Opt-in eval_state quality gate.
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
    excluded: boundaryExcluded.concat(integrityExcluded, behaviorExcluded, qualityExcluded).map(annotate),
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
    application_verdict: (e.skill.health && e.skill.health.application_verdict) || null,
    structural_verdict: (e.skill.health && e.skill.health.structural_verdict) || null,
    truth_verdict: (e.skill.health && e.skill.health.truth_verdict) || null,
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
    : (fs.existsSync(DEFAULT_MANIFEST)
        ? DEFAULT_MANIFEST
        : (fs.existsSync(SAMPLE_MANIFEST) ? SAMPLE_MANIFEST : PACKAGE_SAMPLE_MANIFEST));

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
module.exports = { routeSkills, tokenize, matchesGlob, matchPathList, computeStaleness };

if (require.main === module) main();
