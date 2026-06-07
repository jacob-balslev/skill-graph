#!/usr/bin/env node
/**
 * Generate the public marketplace SKILL.md export surface.
 *
 * This script keeps Skill Metadata Protocol files authoritative under
 * skills/<name>/SKILL.md and writes plain SKILL.md exports under
 * marketplace/skills/<name>/SKILL.md for release to SKILL.md marketplaces.
 *
 * The generated surface is intentionally checked here, not by convention:
 *   - every exported skill is plain Agent Skills shape
 *   - every description fits the 1024-character marketplace limit
 *   - every exported skill carries Skill Graph provenance metadata
 *   - generated markdown links resolve or point back to the canonical repo
 *   - generated text is scanned for private/local/personal/token-like signals
 *
 * Usage:
 *   node scripts/export-marketplace-skills.js
 *   node scripts/export-marketplace-skills.js --check
 *   node scripts/export-marketplace-skills.js --validate-only
 *   node scripts/export-marketplace-skills.js --output marketplace
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeFrontmatter, parseFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFilesFromRoots, workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('./lib/roots');
const { buildExportedSkill, normalizeExportName } = require('./export-skill');
const { validateExportedFrontmatter } = require('./verify-skill-md-export');
const { checkFile } = require('./check-markdown-links');
const { PRIVACY_PATTERNS, scanPrivacyText } = require('./lib/privacy-patterns');
// The body-projection renderer and its helpers are the shared "compile" core,
// used by both this marketplace export and the local `scripts/render-skills.js`
// (the `skill-graph render` command). extractBoundaryOwnsClause is shared with
// the description projection below.
const { renderSkillGraphContext, extractBoundaryOwnsClause, relationSlugs, truthSourceLabel } = require('./lib/render-skill-context');

const REPO_ROOT = workspaceRoot();
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
// Primary skill root — first configured root, or local skills/ as fallback.
const DEFAULT_SOURCE_DIR = SKILL_ROOTS[0].absPath;
const DEFAULT_OUTPUT_ROOT = path.join(REPO_ROOT, 'marketplace');
const MARKETPLACE_DESCRIPTION_LIMIT = 1024;
const SKILL_GRAPH_SOURCE_REPO = 'https://github.com/jacob-balslev/skill-graph';
// SKILL_GRAPH_PROTOCOL removed 2026-05-26 per F8 in
// docs/reports/skill-system-understanding-teaching-docs-2026-05-26.md.
// The previous `'Skill Metadata Protocol v7'` constant was stamped onto every
// exported skill regardless of source content, producing a misleading
// "content verified at v7" signal (documented as the conformance caveat in
// SKILL_GRAPH.md § Source vs Marketplace). Per `.claude/rules/version-schema-contract.md`
// ("version labels are EARNED, not bumped"), the honest fix is to stop emitting
// the label; per-skill `schema_version` on the source SKILL.md is the real signal.
// The `skill_graph_protocol` key remains in scripts/lib/parse-frontmatter.js
// PROVENANCE_KEYS so historical marketplace exports still get their stale label
// stripped on read while the corpus re-exports drain.
const SKILL_GRAPH_PROJECT = 'Skill Graph';
const RELEASE_TARGET_REPO = 'jacob-balslev/skills';
// Public GitHub URL for the release target repo (skills library). Used to rewrite
// relative cross-repo links that resolve into the sibling skills library.
const SKILLS_LIBRARY_REPO = `https://github.com/${RELEASE_TARGET_REPO}`;

// PROVENANCE_KEYS — keys the exporter emits as marketplace-export traceback.
// `skill_graph_protocol` was removed 2026-05-26 per F8 (see SKILL_GRAPH_PROTOCOL
// comment above). The remaining three keys carry useful traceback: source repo,
// project name, canonical SKILL.md path.
const PROVENANCE_KEYS = [
  'skill_graph_source_repo',
  'skill_graph_project',
  'skill_graph_canonical_skill',
];

// Export description overrides for skills whose canonical description exceeds the
// 1024-character Agent Skills marketplace limit. Only add an entry when the canonical
// description (in the skills/ library) is actually over the limit — the export gate
// enforces this and will throw if an override exists for an under-limit description.
const EXPORT_DESCRIPTION_OVERRIDES = {
  'middleware-patterns': 'Use when designing or reviewing Next.js middleware: the single middleware.ts request preprocessor, Edge Runtime constraints, matcher config, NextRequest/NextResponse APIs, redirects, rewrites, pass-through responses, direct responses, auth gates, locale routing, A/B rewrites, security-header delivery, geo routing, bot blocking, and request ID injection. Use for fast cross-cutting request concerns that apply across many routes. Do NOT use for per-route API handlers, Server Actions, HTTP semantics, full security policy design, streaming logic, or webhook signature handling.',
  'route-handler-design': 'Use when designing or reviewing Next.js App Router Route Handlers: route.ts file placement, HTTP method exports, Web Request/Response APIs, body parsing, GET caching and opt-outs, dynamic segments, search params, CORS, Edge vs Node runtime choice, streaming responses, status and header discipline, error responses, and webhook endpoint shape. Use when the caller is mobile, third-party, webhook, server-to-server, cross-origin, or otherwise not your own typed UI. Do NOT use for internal UI mutations, broad API design, abstract HTTP semantics, request preprocessing, or full webhook reliability design.',
  'ref-patterns': 'Use when designing or reviewing React ref usage: refs as mutable handles that survive renders without triggering them, useRef for DOM access and instance values, ref callbacks for mount/unmount hooks, forwardRef and React 19 ref-as-prop, useImperativeHandle for controlled imperative APIs, and ref forwarding through compound-component primitives such as Radix Slot. Use for focus, measurement, animation, third-party DOM integration, and sparse imperative APIs; never as a substitute for reactive state. Do NOT use for the broader hook discipline (use react-hooks-patterns), state ownership decisions (use state-management), component-layering strategy (use component-architecture), Client/Server serialization boundaries (use client-server-boundary), or form validation UX (use form-ux-architecture).',
  // Canonical description is 1023 chars (at the marketplace limit) — leaving no
  // room for the boundary/anti-example projection tail. Per AGENTS.md, the
  // canonical description stays full; this marketplace-only override is tighter
  // so the projection fits. Keep the five pillars + the positive triggers.
  'no-cutting-corners': "Enforce five non-negotiable quality pillars as a pre-output gate: complete reporting (show ALL items, never filter unilaterally), verification (no claim of works/done/exists without a tool-call receipt in the same turn), thoroughness (every acceptance criterion verified with evidence; docs ship with the change), enrichment ('improve' adds capability, never trims), and anti-shortcut (exhaust deterministic lookup before guessing; findings demand action, not filing). Use when reviewing enumerated output for completeness, when an agent claims something works without evidence, when marking a task done, or when asked to 'improve' anything.",
  // Canonical description grew to ~1133 chars in the 2026-06-03 two-frontier enrich
  // (SH-6688), over the 1024 marketplace limit + projection tail. Per AGENTS.md the
  // canonical description stays full; this marketplace-only override is tighter (keeps
  // the load taxonomy + the positive triggers + the boundary).
  'cognitive-load-theory': "Sweller's Cognitive Load Theory (CLT) for agents reviewing skill bodies, prompts, docs, dashboards, and agent outputs for avoidable cognitive burden. Working memory holds ~4 chunks; CLT splits load into intrinsic (irreducible difficulty), extraneous (avoidable load from poor presentation — ELIMINATE), and germane (the schema-building work applied to intrinsic load — PROTECT). Use when writing a SKILL.md body, designing prompts (am I asking the model to hold too much at once?), building dashboards (per-screen cognitive budget), authoring docs (is intrinsic load segmented?), or checking whether modern features (long context, structured outputs, prompt caching, subagents) actually reduce load or just move it. Do NOT use for retrieval/session working-set design (use context-management), token budget and compaction timing (use context-window), prompt engineering tactics (use prompt-craft), or token-efficient representation (use compression).",
  // Canonical description grew to 1412 chars in the 2026-06-06 multi-model panel enrich
  // (over the 1024 marketplace limit + projection tail). Per AGENTS.md the canonical
  // description stays full; this marketplace-only override is tighter (keeps the five
  // primitives + judgment taxonomy + eval-surface stack + the positive triggers + boundaries).
  'eval-driven-development': "Use when building language-model-integrated systems by writing evaluations before and alongside the system: the statistical (not binary) nature of LLM evals, the five primitives (dataset, evaluation function, aggregation, iteration loop, regression budget), the judgment-mechanism taxonomy (programmatic, model-graded, human-graded, preference comparison), the eval-surface stack (final response, trajectory/tool-use, retrieval/RAG, safety, cost), the statistical-significance discipline (paired tests, bootstrap CI on the delta, minimum-detectable-effect), trajectory-vs-final-output evaluation for multi-step agents, judge calibration and bias, Goodhart's Law and suite saturation, and the offline-eval-vs-production-telemetry distinction. Do NOT use for deterministic unit testing or general TDD (use testing-strategy), production monitoring (use evaluation or error-tracking), or building individual eval rubrics and task sets (use agent-eval-design — it owns construction; this skill owns iteration discipline).",
  // Canonical description is 1581 chars (a prior-session enrich) — over the 1024 marketplace
  // limit. Per AGENTS.md the canonical stays full; this override keeps expand/contract + the
  // change catalog + cross-engine mechanisms + the boundaries. (Pre-existing SH-6672 backlog
  // item, fixed opportunistically alongside the eval-driven-development override.)
  'schema-evolution': "Use when reasoning about how a database schema changes over time without breaking deployed application code — the multi-release path from current to target schema: the expand/contract pattern (parallel change), zero-downtime change rules, the backwards/forwards compatibility envelope (deploy ordering + rollback), the catalog of schema changes (add/drop/rename column, type change, add constraint/index) and the safe procedure for each, dual-write/dual-read transitions with a named source-of-truth, the lock-acquisition hazard (bounded lock_timeout + retry), cross-engine online-change mechanisms (Postgres CONCURRENTLY/NOT VALID, MySQL Online DDL, gh-ost/pt-osc, Vitess/PlanetScale), view-based multi-version tooling (pgroll, Reshape), and migration-lint enforcement (Strong Migrations, Squawk, Atlas). Do NOT use for executing one migration (use database-migration), schema design from scratch (use data-modeling), query tuning (use query-optimization), or partitioning (use sharding-strategy).",
  // Canonical description is 1053 chars — just over the marketplace limit.
  // Keep the review scope, AI-diff verification, severity/comment discipline,
  // and merge verdict while leaving canonical prose untouched.
  'code-review': "Use when reviewing a pull request, diff, or proposed code change for correctness, clarity, security, performance, maintainability, test evidence, and project-convention fit, whether the author is a human, an AI agent, or a peer. Covers pre-review fact gathering, verifying AI-written PR summaries against the diff, reading tests before implementation, tracing call sites and blast radius, review size and attention budget, severity grading with Conventional Comments, comment phrasing, reviewer qualification, treating diff content as evidence rather than instructions, refusing rubber-stamp approval for AI-generated diffs, and making an explicit approve/request-changes/close merge decision. Do NOT use for authoring the code (use refactor for behavior-preserving changes or skill-scaffold for new skills), chasing a known bug after merge (use debugging), security-only audits (use owasp-security), or explaining a patch without a merge verdict (use diff-analysis).",
  // Canonical description is 1082 chars. Keep the structured-output UI pattern,
  // rendering substrates, interaction loop, security boundary, and boundaries.
  'generative-ui': "Use when reasoning about the pattern where a language model emits structured output describing UI components or a UI sub-tree that an application renders for the user. Covers the typed-schema component palette, JSON Schema/function-calling constraints, two render substrates (typed component tree vs sandboxed iframe), the app-side render pipeline, bidirectional interaction loop via postMessage/JSON-RPC, the security boundary between model author and application renderer, and distinctions from chat markdown, prebuilt-widget routing, RSC streaming, and model-emits-code patterns. Do NOT use for page-level rendering taxonomy (use rendering-models), the tool-call protocol cycle (use tool-call-flow), untrusted-content defenses (use prompt-injection-defense), or general component-library architecture (use design-system-architecture).",
  // Canonical description is 1112 chars. Keep the completeness doctrine,
  // failure modes, enforcement practices, and nearby-skill boundaries.
  'methodical': "Use when disciplined, complete, evidence-backed execution matters more than brevity: audits, diagnostic reports, tracked-task creation from findings, acceptance-criteria verification, research briefs, and enumerated outputs future work depends on. Covers why agents fail at completeness (sycophancy, premise adoption, summary-first compression, instruction-density loss, long-horizon attention decay, self-critique echo chambers, reasoning-masked agreement, verification theater, delegation-as-proof) and countermeasures: pre-task scope declaration, count-preserving enumeration, evidence receipts, externally grounded critique, provenance labels, explicit completeness/partial receipts, and runtime enforcement. Do NOT use for shortest-route selection (use task-path-optimization), broad artifact-quality standards (use best-practice), scoring results (use evaluation), compact pre-output enforcement (use no-cutting-corners), or post-enumeration compression (use summarization).",
  // Canonical description is 1026 chars. Keep the PESTEL scan dimensions and
  // strategic boundaries while dropping only redundant wording.
  'pestel': "Use when scanning an external macro environment with PESTEL/PESTLE and variants such as STEEPLE, STEEPLED, PESTLIED, STEEP, DESTEP, and LoNGPESTLE: political, economic, social, technological, environmental, and legal forces; evidence quality and recency; geography/jurisdiction and local/national/global level; time horizon; uncertainty; weak signals; impact/probability scoring; factor interactions; bias checks; opportunity/threat implications; assumptions; action conversion; and monitoring triggers. Covers external-environment scanning before strategy choices, market-entry reviews, strategic planning, product/service context, policy-aware planning, and risk/opportunity surfacing. Do NOT use for internal capability diagnosis (use swot-tows), industry profit-pressure diagnosis (use porters-five-forces), value-curve redesign (use blue-ocean-strategy), integrated strategy cascades (use playing-to-win), product positioning (use positioning), or quantified option comparison (use expected-value).",
  // Canonical description is 1244 chars. Keep cross-surface meaning encoding,
  // LLM/tool/telemetry signals, and boundaries.
  'semantics': "Use when choosing or auditing meaning encoded by names and signals across code, APIs, design tokens, HTTP responses, UI labels, error codes, branded types, tool schemas, telemetry attributes, and domain terms, especially when a name feels ambiguous, misleading, or stale. Covers naming smells, DDD ubiquitous language, SemVer, Conventional Commits type choice, branded/semantic types, parse-don't-validate, semantic design tokens/CSS/API signals, semantic UI affordances, machine-reader truthfulness for LLM tools and telemetry, and anti-patterns where syntax is valid but the signal lies. Do NOT use for morphology/register (use linguistics), casing/format or rename mechanics (use naming-conventions or refactor), typed concept-edge analysis (use semantic-relations), UI copy (use microcopy), taxonomy (use taxonomy-design), accessibility (use a11y), API/protocol design (use api-design or http-semantics), LLM tool design (use agent-engineering or tool-call-flow), or telemetry strategy (use observability-modeling).",
};

// PRIVACY_PATTERNS and scanPrivacyText are imported from ./lib/privacy-patterns —
// the single source of truth shared with the pre-push hook (L3) and CI scan (L4).
// Do not duplicate patterns here.

// ---------------------------------------------------------------------------
// Root-resolution guard
// ---------------------------------------------------------------------------
// The exporter reads skills from the first configured skill root. When invoked
// from the wrong CWD (e.g., the Development orchestration root instead of this
// skill-graph repo root), root resolution silently falls back to the flat
// operational copies under Development/skills/ — 244 scope:operational skills
// that legitimately cite internal sales-hub/ paths. The resulting marketplace
// surface fails the privacy gate, and any push to the release repo leaks
// internal codebase references. This guard catches that mis-invocation BEFORE
// generating the surface.
//
// Detection strategy (two signals, both checked):
//
//   1. PATH SIGNAL — if no .skill-graph/config.json was found at the resolved
//      workspace root, the skill root defaulted to <root>/skills/. When this
//      path exists but sits alongside a config-free workspace, it is very likely
//      the flat operational directory. We emit a detailed error explaining the
//      probable cause and the correct fix.
//
//   2. CONTENT SIGNAL — we sample up to GUARD_SAMPLE_SIZE skills from the
//      resolved source root. If more than GUARD_OPERATIONAL_THRESHOLD of the
//      sampled skills carry scope:operational or scope:codebase, the source is
//      the internal library and we must refuse to generate. This catches
//      renamed-but-mis-configured roots and future layout changes that the path
//      signal alone might miss.
//
// Both checks run unconditionally; if either fires, the process exits 1 with
// a message that names the bad path and explains the fix.
// ---------------------------------------------------------------------------

/** How many skills to sample for the content-based guard. */
const GUARD_SAMPLE_SIZE = 20;

/**
 * Fraction of sampled skills that may carry scope:operational/codebase before
 * the guard fires. The structured portable library (skills/skills/**) contains
 * zero operational skills; the flat internal library is ~100% operational.
 * 0.5 gives a generous margin that catches any realistic mis-configuration.
 */
const GUARD_OPERATIONAL_THRESHOLD = 0.5;

/**
 * Assert that `sourceDir` is the clean portable skill library, not the flat
 * internal operational copies. Throws with a clear, actionable message if the
 * resolved root looks wrong.
 *
 * Called from `collectCanonicalSkills()` before any skill text is read or
 * marketplace files are generated.
 *
 * @param {string} sourceDir - Absolute path of the resolved primary skill root.
 * @param {object|null} workspaceConfig - The parsed workspace config object (may be null).
 * @throws {Error} If the source root resolves to a predominantly operational library.
 */
function assertSourceRootIsPortable(sourceDir, workspaceConfig) {
  // --- Signal 1: no .skill-graph/config.json at the workspace root ----------
  // When the config is missing the skill root defaults to <cwd>/skills/. If
  // that happens to exist it is almost certainly the flat operational copies.
  // (The correct invocation always finds .skill-graph/config.json at
  // <skill-graph-repo>/ which points skill_roots at ../skills/skills.)
  if (!workspaceConfig && fs.existsSync(sourceDir)) {
    throw new Error(
      `Root-resolution guard: no .skill-graph/config.json found at workspace root.\n` +
      `  Resolved source root: ${sourceDir}\n` +
      `  This is likely the flat internal operational skill copies, not the clean\n` +
      `  portable library. Generating from this root would produce a leaky surface.\n` +
      `\n` +
      `  Fix: run this script from the skill-graph repo root, not from the\n` +
      `  Development orchestration root:\n` +
      `\n` +
      `    cd /path/to/skill-graph\n` +
      `    node scripts/export-marketplace-skills.js\n` +
      `\n` +
      `  Or set SKILL_GRAPH_WORKSPACE to the skill-graph repo root:\n` +
      `    SKILL_GRAPH_WORKSPACE=/path/to/skill-graph node scripts/export-marketplace-skills.js`
    );
  }

  // --- Signal 2: content probe — sample skills and count non-portable scope --
  // Walk only the top levels needed to collect GUARD_SAMPLE_SIZE skills; avoid
  // a full deep walk for speed. Re-use the same walker used by the real export.
  if (!fs.existsSync(sourceDir)) return; // nothing to probe — let downstream handle missing dir

  const samplePaths = [];
  const walkForSample = (dir, depth) => {
    if (samplePaths.length >= GUARD_SAMPLE_SIZE) return;
    if (depth > 6) return;
    const skillMd = path.join(dir, 'SKILL.md');
    if (fs.existsSync(skillMd)) { samplePaths.push(skillMd); return; }
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (samplePaths.length >= GUARD_SAMPLE_SIZE) break;
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      walkForSample(path.join(dir, entry.name), depth + 1);
    }
  };
  walkForSample(sourceDir, 0);

  if (samplePaths.length === 0) return; // empty dir — let downstream error handle

  const { parseFrontmatter: _parseFm } = require('./lib/parse-frontmatter');
  let operationalCount = 0;
  for (const skillMd of samplePaths) {
    try {
      const text = fs.readFileSync(skillMd, 'utf8');
      const fm = _parseFm(text);
      const scope = fm && (fm.scope || (fm.metadata && fm.metadata.scope));
      const deploymentTarget = fm && fm.deployment_target;
      // v8 primary gate: deployment_target === 'project' marks a repo-coupled skill.
      // Legacy back-compat: scope: 'operational'|'codebase'|'project' from unmigrated skills
      // also indicate internal-only content. Both check types remain so this guard
      // fires correctly regardless of how far the audit-loop migration has progressed.
      if (
        deploymentTarget === 'project' ||
        scope === 'operational' || scope === 'codebase' || scope === 'project'
      ) operationalCount++;
    } catch { /* skip unreadable files */ }
  }

  const operationalFraction = operationalCount / samplePaths.length;
  if (operationalFraction > GUARD_OPERATIONAL_THRESHOLD) {
    throw new Error(
      `Root-resolution guard: resolved source root appears to be the internal operational\n` +
      `  skill library (${operationalCount}/${samplePaths.length} sampled skills have deployment_target:project/scope:operational/codebase).\n` +
      `  Resolved source root: ${sourceDir}\n` +
      `  Generating from this root would include internal sales-hub/ references and fail\n` +
      `  the privacy gate. The marketplace export must run against the clean portable library.\n` +
      `\n` +
      `  Fix: run this script from the skill-graph repo root, not from the\n` +
      `  Development orchestration root:\n` +
      `\n` +
      `    cd /path/to/skill-graph\n` +
      `    node scripts/export-marketplace-skills.js\n` +
      `\n` +
      `  Or set SKILL_GRAPH_WORKSPACE to the skill-graph repo root:\n` +
      `    SKILL_GRAPH_WORKSPACE=/path/to/skill-graph node scripts/export-marketplace-skills.js`
    );
  }
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function isExternalTarget(target) {
  return /^(?:https?:|mailto:|tel:|ftp:|data:|javascript:)/i.test(target);
}

function splitMarkdownTarget(rawTarget) {
  let target = rawTarget.trim();
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
  const hashIdx = target.indexOf('#');
  if (hashIdx === -1) return { pathPart: target, anchor: '' };
  return {
    pathPart: target.slice(0, hashIdx),
    anchor: target.slice(hashIdx),
  };
}

// Relative posix prefix (from REPO_ROOT) that identifies the skills library repo root.
// When the source dir is inside the sibling skills repo, links that resolve to within
// that repo must be rewritten to SKILLS_LIBRARY_REPO rather than SKILL_GRAPH_SOURCE_REPO.
// Example: source at "../skills/skills/skill-scaffold/SKILL.md" → prefix "../skills/"
const SKILLS_LIBRARY_ROOT_PREFIX = (() => {
  const skillsDir = DEFAULT_SOURCE_DIR;
  // Compute the skills library *repo* root (parent of DEFAULT_SOURCE_DIR, e.g. "../skills")
  const skillsLibRoot = path.dirname(skillsDir);
  const rel = path.relative(REPO_ROOT, skillsLibRoot);
  // Convert to posix and ensure trailing slash for prefix matching
  const posix = rel.split(path.sep).join('/');
  return posix ? posix + '/' : '';
})();

function canonicalRepoUrlForLink(sourceRelPath, pathPart, anchor) {
  const sourceDir = path.posix.dirname(sourceRelPath);
  const normalized = path.posix.normalize(path.posix.join(sourceDir, pathPart));
  if (!normalized || normalized === '..') return null;

  // Link resolves within the skill-graph repo itself
  if (!normalized.startsWith('../')) {
    return `${SKILL_GRAPH_SOURCE_REPO}/blob/main/${normalized}${anchor || ''}`;
  }

  // Link resolves into the sibling skills library repo — rewrite to that repo's GitHub URL
  if (SKILLS_LIBRARY_ROOT_PREFIX && normalized.startsWith(SKILLS_LIBRARY_ROOT_PREFIX)) {
    const skillsRepoRelPath = normalized.slice(SKILLS_LIBRARY_ROOT_PREFIX.length);
    if (skillsRepoRelPath && !skillsRepoRelPath.startsWith('../')) {
      return `${SKILLS_LIBRARY_REPO}/blob/main/${skillsRepoRelPath}${anchor || ''}`;
    }
  }

  return null;
}

function rewriteLocalMarkdownLinksToCanonicalRepo(text, sourceRelPath) {
  return text.replace(/(!?\[[^\]\n]*\]\()([^) \n]+)(\))/g, (match, prefix, rawTarget, suffix) => {
    const { pathPart, anchor } = splitMarkdownTarget(rawTarget);
    if (!pathPart || isExternalTarget(pathPart) || pathPart.startsWith('#')) return match;
    const url = canonicalRepoUrlForLink(sourceRelPath, pathPart, anchor);
    return url ? `${prefix}${url}${suffix}` : match;
  });
}

// Root of the skills library repo (e.g. ~/Development/skills when using the sibling config).
// Used to compute canonical skill source paths relative to the skills library, not skill-graph.
const SKILLS_LIBRARY_REPO_ROOT = SKILLS_LIBRARY_ROOT_PREFIX
  ? path.resolve(REPO_ROOT, SKILLS_LIBRARY_ROOT_PREFIX.slice(0, -1))
  : REPO_ROOT;

/**
 * Returns the canonical source path for a skill file — relative to the skills library
 * repo root (e.g. "skills/a11y/SKILL.md"). When skills live in a sibling repo, this
 * strips the sibling prefix so the provenance value is stable and skills-library-relative
 * rather than skill-graph-relative ("../skills/skills/a11y/SKILL.md").
 */
function canonicalSourcePath(skillMd) {
  return path.relative(SKILLS_LIBRARY_REPO_ROOT, skillMd).split(path.sep).join('/');
}

/**
 * Recursively collect SKILL.md paths from a root directory.
 *
 * After the M1 category restructure (jacob-balslev/skills 42552d1), the
 * skills library uses a nested layout: <root>/<category>/[<domain>/]<name>/SKILL.md
 * rather than the old flat <root>/<name>/SKILL.md. This walker mirrors the
 * same recursive pattern used by skill-lint.js so both tools agree on which
 * skill files are canonical.
 *
 * Stops descending as soon as it finds a SKILL.md in a directory (that
 * directory is a skill, not a container). Skips _underscore and .dot dirs.
 *
 * @param {string} dir - Directory to search.
 * @param {number} depth - Current recursion depth (capped at 3).
 * @returns {string[]} Absolute paths to every discovered SKILL.md.
 */
function collectCanonicalSkills(sourceDir = DEFAULT_SOURCE_DIR) {
  // Guard: fail fast if the source root resolves to the internal operational
  // copies rather than the clean portable library. Pass the workspace config
  // so the guard can distinguish "no config (wrong CWD)" from "config found
  // but points at a bad root" (caught by the content probe).
  assertSourceRootIsPortable(sourceDir, WORKSPACE_CONFIG);

  const skills = [];
  for (const { filePath: skillMd } of collectSkillFilesFromRoots([{ absPath: sourceDir, project: null }])) {
    const text = fs.readFileSync(skillMd, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (!fm) {
      throw new Error(`Source skill has no parseable frontmatter: ${repoRelative(skillMd)}`);
    }

    // Block export for skills that have failed external-mandate checks.
    //
    // structural_verdict: FAIL means the skill violated at least one of the four
    // external mandates checked by skill-lint.js: YAML parse, name field present,
    // description <=1024 chars, and parent-directory match. A structurally broken
    // skill must not reach the marketplace until those violations are corrected.
    //
    // Today the corpus is uniformly UNVERIFIED, so this block is inert until
    // audit runs populate the field. That is correct and expected behavior —
    // land the wiring now so it activates as audits run.
    if (fm.structural_verdict === 'FAIL') {
      throw new Error(
        `Export blocked: ${repoRelative(skillMd)} has structural_verdict: FAIL.\n` +
        `  One or more external mandates failed for this skill (YAML parse, name field,\n` +
        `  description length <=1024, or parent-directory match). Fix the violations\n` +
        `  and re-run the audit to clear structural_verdict before exporting.`
      );
    }

    // Exclude skills that are project-grounded or internal-only.
    //
    // v8 uses `deployment_target: project` for skills anchored to one specific
    // project. Legacy exports may still carry the old closed-scope values, so
    // keep those as an additional exclusion guard until the audit loop drains
    // every historical source.
    //
    // Skills with grounding_mode: repo_specific or repo_internal are excluded
    // even if another field claims portability. A portable skill may reference
    // tooling files in this repo, but it should not declare repo-specific
    // grounding.
    //
    // These skills are excluded with a stderr notice so maintainers can audit the list.
    // They remain in the skills library for local use; only the marketplace surface is gated.
    const deploymentTarget = fm.deployment_target;
    const fmScope = fm.scope;
    const groundingMode = fm.grounding && fm.grounding.grounding_mode;
    const EXCLUDED_LEGACY_SCOPES = new Set(['codebase', 'operational', 'project']);
    const EXCLUDED_GROUNDING_MODES = new Set(['repo_specific', 'repo_internal']);
    const excludeByDeploymentTarget = deploymentTarget === 'project';
    const excludeByLegacyScope = EXCLUDED_LEGACY_SCOPES.has(fmScope);
    const excludeByGrounding = EXCLUDED_GROUNDING_MODES.has(groundingMode);
    if (excludeByDeploymentTarget || excludeByLegacyScope || excludeByGrounding) {
      process.stderr.write(
        `EXCLUDED from marketplace export: ${repoRelative(skillMd)}` +
        ` (deployment_target: ${deploymentTarget || 'unset'}, scope: ${fmScope || 'unset'}, grounding_mode: ${groundingMode || 'none'})\n`
      );
      continue;
    }

    skills.push({
      sourcePath: skillMd,
      // sourceRelPath: skill-graph-repo-relative path — used for link rewriting (filesystem context).
      sourceRelPath: repoRelative(skillMd),
      // canonicalSkillPath: skills-library-relative path — used for provenance metadata.
      // When skills live in the sibling skills repo, this is "skills/a11y/SKILL.md" rather
      // than the skill-graph-relative "../skills/skills/a11y/SKILL.md".
      canonicalSkillPath: canonicalSourcePath(skillMd),
      text,
      fm,
    });
  }
  return skills.sort((a, b) => String(a.fm.name).localeCompare(String(b.fm.name)));
}

function provenanceForSkill(sourceRelPath) {
  // `skill_graph_protocol` removed 2026-05-26 per F8 — see SKILL_GRAPH_PROTOCOL
  // comment above. The honest schema-version signal is per-skill `schema_version`.
  return {
    skill_graph_source_repo: SKILL_GRAPH_SOURCE_REPO,
    skill_graph_project: SKILL_GRAPH_PROJECT,
    skill_graph_canonical_skill: sourceRelPath,
  };
}

// ---------------------------------------------------------------------------
// Export-time description projection (added 2026-05-26)
// ---------------------------------------------------------------------------
// Anthropic's auto-invocation runtime only pre-loads `name + description` at
// startup (https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).
// The negative-boundary signal carried by the workspace's typed fields
// (anti_examples, relations.boundary) is invisible to it. This projection
// synthesizes that signal into the exported description while keeping the
// canonical SKILL.md source unchanged.
//
// Doctrine fit: AUGMENT, not REPLACE. Canonical descriptions still carry the
// workspace-mandated `Do NOT use for X (use Y).` clause per
// skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Identity. The projection appends additional
// boundary entries the canonical clause did not name. Deduplication via
// `collectMentionedSlugs` prevents stacking the same slug twice.
//
// Source plan: docs/plans/export-layer-description-projection-2026-05-26.md
// ---------------------------------------------------------------------------

const MENTIONED_SLUG_RE = /\(use ([a-z][a-z0-9-]*[a-z0-9])\)/g;
// OWNS_CLAUSE_RE + extractBoundaryOwnsClause now live in ./lib/render-skill-context
// (shared by the description projection here and the body projection there).

/**
 * Scan a description for `(use <slug>)` mentions so synthesis can skip slugs
 * the canonical description already names. Without this, the exporter would
 * stack `Do NOT use for X (use Y).` twice for the same boundary slug when
 * the author chose to name it in canonical prose AND also added it to
 * relations.boundary.
 *
 * @param {string} description Canonical or override description text.
 * @returns {Set<string>} Slugs already mentioned via `(use <slug>)`.
 */
function collectMentionedSlugs(description) {
  const slugs = new Set();
  if (!description) return slugs;
  MENTIONED_SLUG_RE.lastIndex = 0;
  let m;
  while ((m = MENTIONED_SLUG_RE.exec(description)) !== null) {
    slugs.add(m[1]);
  }
  return slugs;
}

/**
 * Synthesize a `Do NOT use for X (use Y).` tail from typed fields. Reads
 * skill.fm.anti_examples and skill.fm.relations.boundary; dedupes against
 * slugs already mentioned in the base description.
 *
 * Shape A boundary entries (bare slug, no reason) are skipped — the slug
 * alone is too information-poor for a meaningful tail. To project a
 * boundary entry, populate it as Shape B with an `owns` reason clause.
 *
 * @param {object} skill Skill record with .fm.
 * @param {Set<string>} alreadyMentioned Slugs to dedupe against; mutated as
 *   the function adds new slugs to prevent same-pass duplication between
 *   anti_examples and boundary.
 * @returns {{ tail: string, sources: Array<string> }}
 */
function synthesizeBoundaryTail(skill, alreadyMentioned) {
  const tailParts = [];
  const sources = new Set();

  // anti_examples: array of strings that typically already carry `(use <slug>)`.
  const antiExamples = Array.isArray(skill.fm.anti_examples) ? skill.fm.anti_examples : [];
  for (const phrase of antiExamples) {
    if (typeof phrase !== 'string') continue;
    const trimmed = phrase.trim();
    if (trimmed.length === 0) continue;
    MENTIONED_SLUG_RE.lastIndex = 0;
    const slugMatch = MENTIONED_SLUG_RE.exec(trimmed);
    if (slugMatch && alreadyMentioned.has(slugMatch[1])) continue;
    const terminated = /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
    tailParts.push(`Do NOT use for ${terminated}`);
    if (slugMatch) alreadyMentioned.add(slugMatch[1]);
    sources.add('anti_examples');
  }

  // relations.boundary: array of strings (Shape A) or objects { skill, reason } (Shape B).
  const boundary = Array.isArray(skill.fm.relations && skill.fm.relations.boundary)
    ? skill.fm.relations.boundary
    : [];
  for (const entry of boundary) {
    if (typeof entry === 'string') continue; // Shape A: no reason — skip.
    if (!entry || typeof entry !== 'object') continue;
    const slug = entry.skill;
    if (!slug || typeof slug !== 'string') continue;
    if (alreadyMentioned.has(slug)) continue;
    const owns = extractBoundaryOwnsClause(entry.reason);
    if (!owns) continue;
    tailParts.push(`Do NOT use for ${owns} (use ${slug}).`);
    alreadyMentioned.add(slug);
    sources.add('boundary');
  }

  if (tailParts.length === 0) return { tail: '', sources: [] };
  return { tail: ' ' + tailParts.join(' '), sources: Array.from(sources).sort() };
}

/**
 * Compose the exported description: base + projected tail, enforcing the
 * 1024-char marketplace ceiling. The canonical/override base is never
 * truncated; only the projected tail is truncated if needed (at the last
 * sentence boundary that fits).
 *
 * @param {string} baseDescription
 * @param {object} skill
 * @returns {{ description: string, projection: string, projectionTruncated: boolean }}
 */
function applyExportProjection(baseDescription, skill) {
  const mentioned = collectMentionedSlugs(baseDescription);
  const { tail, sources } = synthesizeBoundaryTail(skill, mentioned);
  if (tail.length === 0) {
    return { description: baseDescription, projection: 'none', projectionTruncated: false };
  }
  const projection = sources.join('+');
  const budget = MARKETPLACE_DESCRIPTION_LIMIT - baseDescription.length;
  // Need at least " X." (3 chars) for any meaningful tail. Under that, skip.
  if (budget < 3) {
    process.stderr.write(
      `PROJECTION SKIPPED for ${skill.fm.name}: base description is ${baseDescription.length} chars; no room under ${MARKETPLACE_DESCRIPTION_LIMIT} limit\n`
    );
    return { description: baseDescription, projection: 'none', projectionTruncated: true };
  }
  if (tail.length <= budget) {
    return { description: baseDescription + tail, projection, projectionTruncated: false };
  }
  // Tail exceeds budget — truncate at the last sentence boundary that fits.
  const truncated = tail.slice(0, budget);
  const lastSentenceEnd = truncated.lastIndexOf('.');
  const safeTail = lastSentenceEnd > 0 ? truncated.slice(0, lastSentenceEnd + 1) : '';
  if (safeTail.length === 0) {
    process.stderr.write(
      `PROJECTION SKIPPED for ${skill.fm.name}: tail (${tail.length} chars) would not fit any complete sentence in remaining ${budget} chars\n`
    );
    return { description: baseDescription, projection: 'none', projectionTruncated: true };
  }
  process.stderr.write(
    `PROJECTION TRUNCATED for ${skill.fm.name}: tail truncated from ${tail.length} to ${safeTail.length} chars to fit ${MARKETPLACE_DESCRIPTION_LIMIT} limit\n`
  );
  return { description: baseDescription + safeTail, projection, projectionTruncated: true };
}

function exportDescriptionForSkill(skill) {
  const sourceDescription = skill.fm.description || '';
  const override = EXPORT_DESCRIPTION_OVERRIDES[skill.fm.name];

  let base;
  let shortened;
  if (sourceDescription.length > MARKETPLACE_DESCRIPTION_LIMIT) {
    if (!override) {
      base = sourceDescription.slice(0, MARKETPLACE_DESCRIPTION_LIMIT - 1);
      shortened = true;
    } else {
      if (override.length > MARKETPLACE_DESCRIPTION_LIMIT) {
        throw new Error(
          `${skill.fm.name} export description is ${override.length} characters; limit is ${MARKETPLACE_DESCRIPTION_LIMIT}`
        );
      }
      base = override;
      shortened = true;
    }
  } else {
    if (override) {
      throw new Error(
        `${skill.fm.name} has an export description override but the canonical description is within the limit`
      );
    }
    base = sourceDescription;
    shortened = false;
  }

  const projected = applyExportProjection(base, skill);

  return {
    description: projected.description,
    shortened,
    sourceLength: sourceDescription.length,
    projection: projected.projection,
    projectionTruncated: projected.projectionTruncated,
  };
}

// The body-projection renderer (`renderSkillGraphContext`) and its helpers
// (`relationSlugs`, `truthSourceLabel`, `extractBoundaryOwnsClause`) now live in
// ./lib/render-skill-context — the shared compile core used by both this export
// and `scripts/render-skills.js` (the `skill-graph render` command). They are
// imported at the top of this file and re-exported below for back-compat.

function buildMarketplaceSkillText(skill) {
  const description = exportDescriptionForSkill(skill);
  // Use canonicalSkillPath (skills-library-relative) for provenance, so the value is
  // stable across layouts — "skills/a11y/SKILL.md" regardless of where skill-graph lives.
  const metadata = provenanceForSkill(skill.canonicalSkillPath);
  if (description.shortened) {
    metadata.skill_graph_export_description = 'shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract';
    metadata.skill_graph_canonical_description_length = String(description.sourceLength);
  }
  if (description.projection && description.projection !== 'none') {
    metadata.skill_graph_export_description_projection = description.projection;
    if (description.projectionTruncated) {
      metadata.skill_graph_export_description_projection_truncated = 'true';
    }
  }
  const exported = buildExportedSkill(skill.text, {
    description: description.description,
    metadata,
    bodySuffix: renderSkillGraphContext(skill.fm),
  });
  if (!exported) throw new Error(`Unable to export ${skill.sourceRelPath}`);
  return rewriteLocalMarkdownLinksToCanonicalRepo(exported, skill.sourceRelPath);
}

function generatedReadme(skillCount) {
  return [
    '# Skill Graph Marketplace Export',
    '',
    'This directory is generated from the canonical Skill Metadata Protocol source in `skills/`.',
    'Do not edit generated files here by hand; run `node scripts/export-marketplace-skills.js` from the canonical repo.',
    '',
    `Canonical source repo: ${SKILL_GRAPH_SOURCE_REPO}`,
    `Release target repo: ${RELEASE_TARGET_REPO}`,
    `Generated public skills: ${skillCount}`,
    '',
    'Each skill under `skills/<name>/SKILL.md` is a plain Agent Skills-compatible export.',
    'Protocol fields are preserved as string values under `metadata`, with factual Skill Graph provenance.',
    'The meaningful protocol fields are also projected into a readable `## Skill Graph context`',
    'section appended to each skill body, so vendor auto-loaders (which read the body on activation,',
    'not the `metadata` map) see the classification, relations, grounding, and audit status as prose.',
    '',
    'After the release target is published, install with:',
    '',
    '```bash',
    `npx skills add ${RELEASE_TARGET_REPO}`,
    '```',
    '',
  ].join('\n');
}

function expectedSurfaceFiles(outputRoot) {
  const skills = collectCanonicalSkills();
  const files = new Map();
  files.set(path.join(outputRoot, 'README.md'), generatedReadme(skills.length));

  for (const skill of skills) {
    const exportName = normalizeExportName(skill.fm.name);
    const dest = path.join(outputRoot, 'skills', exportName, 'SKILL.md');
    files.set(dest, buildMarketplaceSkillText(skill));
  }

  return { skills, files };
}

function assertSafeOutputRoot(outputRoot) {
  const resolved = path.resolve(outputRoot);
  const rel = path.relative(REPO_ROOT, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Refusing to write marketplace export outside a repo subdirectory: ${outputRoot}`);
  }
  const first = rel.split(path.sep)[0];
  const blocked = new Set(['.git', 'bin', 'docs', 'examples', 'schemas', 'scripts', 'skills']);
  if (blocked.has(first)) {
    throw new Error(`Refusing to use protected repo directory as marketplace output: ${rel}`);
  }
  return resolved;
}

function writeSurface(outputRoot, expectedFiles) {
  assertSafeOutputRoot(outputRoot);
  fs.rmSync(outputRoot, { recursive: true, force: true });
  for (const [filePath, text] of expectedFiles) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, text, 'utf8');
  }
}

function collectGeneratedSkillFiles(outputRoot) {
  const skillsDir = path.join(outputRoot, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillMd)) files.push(skillMd);
  }
  return files.sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
}

/**
 * Scan `text` for privacy violations, normalising `filePath` to a repo-relative
 * display form before storing it in each finding's `file` field.
 *
 * This is a thin wrapper around the shared `scanPrivacyText` from
 * `./lib/privacy-patterns` that applies the repo-relative normalisation that
 * the export pipeline uses for error messages. The shared function accepts
 * any `filePath` string — callers that do not need normalisation can import
 * the shared function directly.
 */
function scanPrivacyTextRepoRelative(text, filePath) {
  return scanPrivacyText(text, repoRelative(filePath));
}

function validateGeneratedSurface(outputRoot, expectedSkills = null) {
  const errors = [];
  const privacyFindings = [];
  const markdownFailures = [];
  const skillFiles = collectGeneratedSkillFiles(outputRoot);
  const expectedByName = new Map(
    (expectedSkills || collectCanonicalSkills()).map(skill => [normalizeExportName(skill.fm.name), skill])
  );

  if (skillFiles.length !== expectedByName.size) {
    errors.push(`expected ${expectedByName.size} exported skills, found ${skillFiles.length}`);
  }

  const seen = new Set();
  const readme = path.join(outputRoot, 'README.md');
  const markdownFiles = fs.existsSync(readme) ? [readme, ...skillFiles] : skillFiles;

  for (const filePath of markdownFiles) {
    const text = fs.readFileSync(filePath, 'utf8');
    privacyFindings.push(...scanPrivacyTextRepoRelative(text, filePath));
    for (const linkError of checkFile(filePath)) {
      markdownFailures.push({
        file: repoRelative(filePath),
        line: linkError.line,
        message: linkError.message,
        target: linkError.target,
      });
    }
  }

  for (const skillMd of skillFiles) {
    const parentName = path.basename(path.dirname(skillMd));
    seen.add(parentName);
    const text = fs.readFileSync(skillMd, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      errors.push(`${repoRelative(skillMd)} has no parseable frontmatter`);
      continue;
    }

    const shape = validateExportedFrontmatter(fm);
    for (const error of shape.errors) {
      errors.push(`${repoRelative(skillMd)}: ${error}`);
    }

    if (fm.name !== parentName) {
      errors.push(`${repoRelative(skillMd)}: exported name "${fm.name}" does not match parent directory "${parentName}"`);
    }

    if (typeof fm.description !== 'string' || fm.description.length > MARKETPLACE_DESCRIPTION_LIMIT) {
      errors.push(
        `${repoRelative(skillMd)}: description length ${(fm.description || '').length} exceeds ${MARKETPLACE_DESCRIPTION_LIMIT}`
      );
    }

    if (!fm.metadata || typeof fm.metadata !== 'object') {
      errors.push(`${repoRelative(skillMd)}: missing metadata provenance`);
      continue;
    }

    for (const key of PROVENANCE_KEYS) {
      if (typeof fm.metadata[key] !== 'string' || fm.metadata[key].length === 0) {
        errors.push(`${repoRelative(skillMd)}: missing metadata.${key}`);
      }
    }

    const expectedSkill = expectedByName.get(parentName);
    if (!expectedSkill) {
      errors.push(`${repoRelative(skillMd)}: no matching canonical skill`);
      continue;
    }
    if (fm.metadata.skill_graph_canonical_skill !== expectedSkill.canonicalSkillPath) {
      errors.push(
        `${repoRelative(skillMd)}: metadata.skill_graph_canonical_skill must be ${expectedSkill.canonicalSkillPath}`
      );
    }
  }

  for (const expectedName of expectedByName.keys()) {
    if (!seen.has(expectedName)) errors.push(`missing exported skill ${expectedName}`);
  }

  for (const finding of privacyFindings) {
    errors.push(`${finding.file}:${finding.line}: privacy ${finding.id}: ${finding.message} (${finding.match})`);
  }

  for (const failure of markdownFailures) {
    errors.push(`${failure.file}:${failure.line}: markdown link ${failure.message} (${failure.target})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    skillCount: skillFiles.length,
  };
}

function checkSurface(outputRoot, expectedFiles) {
  const errors = [];
  const expectedPaths = new Set([...expectedFiles.keys()].map(filePath => path.resolve(filePath)));

  for (const [filePath, expectedText] of expectedFiles) {
    if (!fs.existsSync(filePath)) {
      errors.push(`missing generated file ${repoRelative(filePath)}`);
      continue;
    }
    const actual = fs.readFileSync(filePath, 'utf8');
    if (actual !== expectedText) {
      errors.push(`stale generated file ${repoRelative(filePath)}`);
    }
  }

  if (fs.existsSync(outputRoot)) {
    const stack = [outputRoot];
    while (stack.length > 0) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          stack.push(abs);
        } else if (!expectedPaths.has(path.resolve(abs))) {
          errors.push(`unexpected generated file ${repoRelative(abs)}`);
        }
      }
    }
  }

  return errors;
}

function parseArgs(argv) {
  const options = {
    outputRoot: DEFAULT_OUTPUT_ROOT,
    check: false,
    validateOnly: false,
    json: false,
    quiet: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--check') {
      options.check = true;
    } else if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '--output') {
      if (!argv[i + 1]) throw new Error('--output requires a path');
      options.outputRoot = path.resolve(argv[++i]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/export-marketplace-skills.js [options]

Options:
  --output <dir>    Marketplace output root. Default: marketplace
  --check           Do not write; fail if generated files are missing or stale
  --validate-only   Validate an existing generated surface only
  --json            Print JSON summary
  --quiet           Suppress success text
  --help            Show this help
`);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exit(0);
    }

    const outputRoot = assertSafeOutputRoot(options.outputRoot);
    const expected = options.validateOnly ? null : expectedSurfaceFiles(outputRoot);
    const errors = [];

    if (options.check) {
      errors.push(...checkSurface(outputRoot, expected.files));
    } else if (!options.validateOnly) {
      writeSurface(outputRoot, expected.files);
    }

    const validation = validateGeneratedSurface(outputRoot, expected ? expected.skills : null);
    errors.push(...validation.errors);

    const result = {
      output: repoRelative(outputRoot),
      canonical_skills: expected ? expected.skills.length : collectCanonicalSkills().length,
      exported_skills: validation.skillCount,
      ok: errors.length === 0,
      errors,
    };

    if (options.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (!options.quiet) {
      for (const error of errors) process.stderr.write(`FAIL ${error}\n`);
      if (errors.length === 0) {
        const mode = options.check ? 'checked' : options.validateOnly ? 'validated' : 'generated';
        process.stdout.write(`OK   marketplace export ${mode}: ${validation.skillCount} skill(s) in ${repoRelative(outputRoot)}\n`);
      }
    }

    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    process.stderr.write(`ERROR ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  EXPORT_DESCRIPTION_OVERRIDES,
  GUARD_OPERATIONAL_THRESHOLD,
  GUARD_SAMPLE_SIZE,
  MARKETPLACE_DESCRIPTION_LIMIT,
  PRIVACY_PATTERNS,
  PROVENANCE_KEYS,
  RELEASE_TARGET_REPO,
  SKILL_GRAPH_PROJECT,
  SKILL_GRAPH_SOURCE_REPO,
  applyExportProjection,
  assertSourceRootIsPortable,
  buildMarketplaceSkillText,
  collectCanonicalSkills,
  collectMentionedSlugs,
  exportDescriptionForSkill,
  extractBoundaryOwnsClause,
  provenanceForSkill,
  relationSlugs,
  renderSkillGraphContext,
  rewriteLocalMarkdownLinksToCanonicalRepo,
  scanPrivacyText,
  synthesizeBoundaryTail,
  truthSourceLabel,
  validateGeneratedSurface,
};

if (require.main === module) main();
