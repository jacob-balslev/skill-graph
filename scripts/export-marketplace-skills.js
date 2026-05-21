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

const REPO_ROOT = workspaceRoot();
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);
// Primary skill root — first configured root, or local skills/ as fallback.
const DEFAULT_SOURCE_DIR = SKILL_ROOTS[0].absPath;
const DEFAULT_OUTPUT_ROOT = path.join(REPO_ROOT, 'marketplace');
const MARKETPLACE_DESCRIPTION_LIMIT = 1024;
const SKILL_GRAPH_SOURCE_REPO = 'https://github.com/jacob-balslev/skill-graph';
const SKILL_GRAPH_PROTOCOL = 'Skill Metadata Protocol v7';
const SKILL_GRAPH_PROJECT = 'Skill Graph';
const RELEASE_TARGET_REPO = 'jacob-balslev/skills';
// Public GitHub URL for the release target repo (skills library). Used to rewrite
// relative cross-repo links that resolve into the sibling skills library.
const SKILLS_LIBRARY_REPO = `https://github.com/${RELEASE_TARGET_REPO}`;

const PROVENANCE_KEYS = [
  'skill_graph_source_repo',
  'skill_graph_protocol',
  'skill_graph_project',
  'skill_graph_canonical_skill',
];

// Export description overrides for skills whose canonical description exceeds the
// 1024-character Agent Skills marketplace limit. Only add an entry when the canonical
// description (in the skills/ library) is actually over the limit — the export gate
// enforces this and will throw if an override exists for an under-limit description.
const EXPORT_DESCRIPTION_OVERRIDES = {};

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
      if (scope === 'operational' || scope === 'codebase') operationalCount++;
    } catch { /* skip unreadable files */ }
  }

  const operationalFraction = operationalCount / samplePaths.length;
  if (operationalFraction > GUARD_OPERATIONAL_THRESHOLD) {
    throw new Error(
      `Root-resolution guard: resolved source root appears to be the internal operational\n` +
      `  skill library (${operationalCount}/${samplePaths.length} sampled skills have scope:operational/codebase).\n` +
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
  return {
    skill_graph_source_repo: SKILL_GRAPH_SOURCE_REPO,
    skill_graph_protocol: SKILL_GRAPH_PROTOCOL,
    skill_graph_project: SKILL_GRAPH_PROJECT,
    skill_graph_canonical_skill: sourceRelPath,
  };
}

function exportDescriptionForSkill(skill) {
  const sourceDescription = skill.fm.description || '';
  const override = EXPORT_DESCRIPTION_OVERRIDES[skill.fm.name];

  if (sourceDescription.length > MARKETPLACE_DESCRIPTION_LIMIT) {
    if (!override) return {
      description: sourceDescription.slice(0, MARKETPLACE_DESCRIPTION_LIMIT - 1),
      shortened: true,
      sourceLength: sourceDescription.length,
    };
    if (override.length > MARKETPLACE_DESCRIPTION_LIMIT) {
      throw new Error(
        `${skill.fm.name} export description is ${override.length} characters; limit is ${MARKETPLACE_DESCRIPTION_LIMIT}`
      );
    }
    return {
      description: override,
      shortened: true,
      sourceLength: sourceDescription.length,
    };
  }

  if (override) {
    throw new Error(
      `${skill.fm.name} has an export description override but the canonical description is within the limit`
    );
  }

  return {
    description: sourceDescription,
    shortened: false,
    sourceLength: sourceDescription.length,
  };
}

function buildMarketplaceSkillText(skill) {
  const description = exportDescriptionForSkill(skill);
  // Use canonicalSkillPath (skills-library-relative) for provenance, so the value is
  // stable across layouts — "skills/a11y/SKILL.md" regardless of where skill-graph lives.
  const metadata = provenanceForSkill(skill.canonicalSkillPath);
  if (description.shortened) {
    metadata.skill_graph_export_description = 'shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract';
    metadata.skill_graph_canonical_description_length = String(description.sourceLength);
  }
  const exported = buildExportedSkill(skill.text, {
    description: description.description,
    metadata,
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
  SKILL_GRAPH_PROTOCOL,
  SKILL_GRAPH_PROJECT,
  SKILL_GRAPH_SOURCE_REPO,
  assertSourceRootIsPortable,
  buildMarketplaceSkillText,
  collectCanonicalSkills,
  exportDescriptionForSkill,
  provenanceForSkill,
  rewriteLocalMarkdownLinksToCanonicalRepo,
  scanPrivacyText,
  validateGeneratedSurface,
};

if (require.main === module) main();
