/**
 * Root resolution for local development and installed CLI usage.
 *
 * The npm package lives in its own package root, but most commands should act
 * on the caller's workspace. `bin/skill-graph.js` sets SKILL_GRAPH_WORKSPACE
 * to the process cwd before spawning a script; direct `node scripts/*.js`
 * calls fall back to the current working directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = process.env.SKILL_GRAPH_PACKAGE_ROOT
  ? path.resolve(process.env.SKILL_GRAPH_PACKAGE_ROOT)
  : path.resolve(__dirname, '..', '..');

function workspaceRoot() {
  return path.resolve(process.env.SKILL_GRAPH_WORKSPACE || process.env.SKILL_GRAPH_ROOT || process.cwd());
}

function packageRoot() {
  return PACKAGE_ROOT;
}

function resolvePackagedOrWorkspacePath(root, ...parts) {
  const workspacePath = path.join(root, ...parts);
  if (fs.existsSync(workspacePath)) return workspacePath;
  return path.join(PACKAGE_ROOT, ...parts);
}

function resolveSchemaPath(root, fileName) {
  return resolvePackagedOrWorkspacePath(root, 'schemas', fileName);
}

function loadRootsConfig(root = workspaceRoot(), onWarning = null) {
  const configPath = path.join(root, '.skill-graph', 'config.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config || typeof config !== 'object') return null;
    // skill_roots lives at the top level. The v8 `workspace.skill_roots`
    // wrapper was removed (`workspace` vocabulary retirement).
    if (!Array.isArray(config.skill_roots)) return null;
    return { skill_roots: config.skill_roots };
  } catch (e) {
    if (typeof onWarning === 'function') {
      onWarning(`.skill-graph/config.json: cannot parse - ${e.message}`);
    }
    return null;
  }
}

// Back-compat alias for callers that haven't been renamed yet. New code should
// use loadRootsConfig directly.
const loadWorkspaceConfig = loadRootsConfig;

function resolveSkillRoots(root = workspaceRoot(), config = loadRootsConfig(root)) {
  const defaultRoot = { absPath: path.join(root, 'skills'), project: null };
  if (!config || !Array.isArray(config.skill_roots) || config.skill_roots.length === 0) {
    return [defaultRoot];
  }

  return config.skill_roots
    .map(entry => {
      if (typeof entry === 'string') {
        return { absPath: path.resolve(root, entry), project: null };
      }
      if (entry && typeof entry === 'object' && typeof entry.path === 'string') {
        return {
          absPath: path.resolve(root, entry.path),
          project: (typeof entry.project === 'string' && entry.project.length > 0) ? entry.project : null,
        };
      }
      return null;
    })
    .filter(Boolean);
}

function walkSkillFiles(rootDir, options = {}) {
  const maxDepth = Number.isFinite(options.maxDepth) ? options.maxDepth : 6;
  const results = [];
  if (!rootDir || !fs.existsSync(rootDir)) return results;

  function walk(dir, depth) {
    if (depth > maxDepth) return;
    const skillMd = path.join(dir, 'SKILL.md');
    if (fs.existsSync(skillMd)) {
      results.push(skillMd);
      return;
    }

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
      walk(path.join(dir, entry.name), depth + 1);
    }
  }

  walk(path.resolve(rootDir), 0);
  return results.sort((a, b) => a.localeCompare(b));
}

function collectSkillFilesFromRoots(roots, options = {}) {
  const files = [];
  const seen = new Set();
  for (const root of roots || []) {
    for (const filePath of walkSkillFiles(root.absPath, options)) {
      const key = path.resolve(filePath);
      if (seen.has(key)) continue;
      seen.add(key);
      files.push({ filePath: key, project: root.project || null, root: root.absPath });
    }
  }
  return files;
}

function collectSkillFiles(root = workspaceRoot(), config = loadRootsConfig(root), options = {}) {
  return collectSkillFilesFromRoots(resolveSkillRoots(root, config), options);
}

function normalizeSkillSpecifier(input) {
  return String(input || '')
    .replace(/\\/g, '/')
    .replace(/\/SKILL\.md$/i, '')
    .replace(/^\.?\//, '')
    .replace(/\/+$/, '');
}

function skillFileCandidate(candidate) {
  if (!candidate) return null;
  try {
    const abs = path.resolve(candidate);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile() && path.basename(abs) === 'SKILL.md') {
      return abs;
    }
    const skillFile = path.join(abs, 'SKILL.md');
    if (fs.existsSync(skillFile) && fs.statSync(skillFile).isFile()) {
      return skillFile;
    }
  } catch {
    // Ignore unreadable candidates and keep searching.
  }
  return null;
}

function buildSkillResolution(skillFile, input, rootEntry) {
  const filePath = path.resolve(skillFile);
  const rootPath = rootEntry && rootEntry.absPath ? path.resolve(rootEntry.absPath) : null;
  return {
    input,
    skillFile: filePath,
    skillDir: path.dirname(filePath),
    skillName: path.basename(path.dirname(filePath)),
    root: rootPath,
    project: rootEntry && rootEntry.project ? rootEntry.project : null,
    relativePath: rootPath ? path.relative(rootPath, filePath).replace(/\\/g, '/') : null,
  };
}

/**
 * Resolve a skill specifier to a concrete SKILL.md file.
 *
 * Supports:
 *   - absolute or workspace-relative SKILL.md file paths
 *   - absolute or workspace-relative skill directories
 *   - category-qualified slugs such as `data-engineering/replication-patterns`
 *   - bare nested v8 slugs such as `replication-patterns`
 *
 * The lookup is rooted in the same configured skill roots used by manifest,
 * lint, route, and drift so queue/support scripts do not each carry their own
 * flat-layout assumptions.
 */
function resolveSkillFileSpecifier(input, root = workspaceRoot(), config = loadRootsConfig(root), options = {}) {
  if (!input) return null;
  const normalized = normalizeSkillSpecifier(input);
  const roots = options.roots || resolveSkillRoots(root, config);
  const directCandidates = [
    input,
    path.resolve(root, normalized),
  ];

  for (const rootEntry of roots) {
    const rootAbs = path.resolve(rootEntry.absPath);
    directCandidates.push(path.join(rootAbs, normalized));
    if (normalized.startsWith('skills/')) {
      directCandidates.push(path.resolve(path.dirname(rootAbs), normalized));
    }
  }

  for (const candidate of directCandidates) {
    const skillFile = skillFileCandidate(candidate);
    if (!skillFile) continue;
    const owningRoot = roots.find(entry => {
      const rootAbs = path.resolve(entry.absPath);
      return skillFile === rootAbs || skillFile.startsWith(`${rootAbs}${path.sep}`);
    }) || null;
    return buildSkillResolution(skillFile, input, owningRoot);
  }

  const normalizedParts = normalized.split('/').filter(Boolean);
  const bareSlug = normalizedParts[normalizedParts.length - 1] || normalized;
  const suffix = `${normalized}/SKILL.md`;
  const matches = [];

  for (const entry of collectSkillFilesFromRoots(roots, options)) {
    const relFromRoot = path.relative(entry.root, entry.filePath).replace(/\\/g, '/');
    const parent = path.basename(path.dirname(entry.filePath));
    if (
      parent === bareSlug ||
      relFromRoot === suffix ||
      relFromRoot.endsWith(`/${suffix}`)
    ) {
      matches.push(entry);
    }
  }

  if (matches.length === 0) return null;
  matches.sort((a, b) => {
    const aParent = path.basename(path.dirname(a.filePath));
    const bParent = path.basename(path.dirname(b.filePath));
    const aExact = aParent === normalized ? 0 : 1;
    const bExact = bParent === normalized ? 0 : 1;
    return aExact - bExact || a.filePath.localeCompare(b.filePath);
  });

  return buildSkillResolution(matches[0].filePath, input, {
    absPath: matches[0].root,
    project: matches[0].project,
  });
}

function resolveSkillDirSpecifier(input, root = workspaceRoot(), config = loadRootsConfig(root), options = {}) {
  const resolved = resolveSkillFileSpecifier(input, root, config, options);
  return resolved ? { ...resolved, skillDir: path.dirname(resolved.skillFile) } : null;
}

/**
 * Resolve a truth_source-style workspace-relative path against the configured
 * skill library, falling back to the repo root for back-compat.
 *
 * Truth_source paths in eval files and `grounding.truth_sources` blocks look
 * like `skills/<name>/SKILL.md` — workspace-relative to where the skill
 * library lives. Pre-2026-05-16 monorepo split, that was always
 * `<repo-root>/skills/<name>/SKILL.md`. Post-split, the skill library can
 * live in a sibling repo configured via `.skill-graph/config.json` →
 * `workspace.skill_roots`. This helper tries the skill-library-aware
 * resolution first when the relPath starts with `skills/` and the configured
 * skill_root's basename is `skills`, then falls back to repo-root resolution.
 *
 * Behavior:
 *   - Default workspace (no config, skill_roots = ["./skills"]):
 *     `skills/a11y/SKILL.md` → `<repo-root>/skills/a11y/SKILL.md` (unchanged)
 *   - Configured workspace (skill_roots = ["../skills/skills"]):
 *     `skills/a11y/SKILL.md` → `<repo-root>/../skills/skills/a11y/SKILL.md`
 *   - Paths that don't start with `skills/` (e.g., `schemas/foo.json`) resolve
 *     against `<repo-root>` (the tooling repo) by default — they reference the
 *     tooling repo itself.
 *   - `extraRoots` (project-aware override): a workspace-anchored skill — one
 *     whose `project[]` names the surrounding workspace (e.g. `development`) —
 *     authors its non-`skills/` truth_sources relative to the WORKSPACE root
 *     (`AGENTS.md`, `docs/reference/...`, `skill-graph/...`), NOT this tooling
 *     repo. The caller passes the workspace root(s) in `extraRoots`; each is
 *     tried in priority order, existence-checked, and the first that exists
 *     wins. Callers that omit `extraRoots` (the default) get byte-identical
 *     behavior to plain `<repo-root>` resolution — so the three non-drift
 *     consumers are unaffected.
 *
 * @param {string} relPath — workspace-relative path from a truth_source
 * @param {string} repoRoot — the tooling repo workspace root (= REPO_ROOT)
 * @param {Array<{absPath: string, project?: string|null}>} skillRoots — output of resolveSkillRoots()
 * @param {string[]} [extraRoots] — additional candidate roots (priority order) to try,
 *   existence-checked, before falling back to `<repo-root>`. Used for project-aware
 *   (workspace-anchored) skills. Empty/omitted = current repo-root behavior.
 * @returns {string} absolute path (existence not guaranteed for the repo-root fallback)
 */
function resolveTruthSourcePath(relPath, repoRoot, skillRoots, extraRoots = []) {
  if (typeof relPath === 'string' && relPath.startsWith('skills/') && Array.isArray(skillRoots) && skillRoots.length > 0) {
    const firstRoot = skillRoots[0] && skillRoots[0].absPath;
    if (firstRoot && path.basename(firstRoot) === 'skills') {
      return path.resolve(path.dirname(firstRoot), relPath);
    }
  }
  // Project-aware resolution: try each extra (workspace) root, existence-checked,
  // first hit wins. Only populated for workspace-anchored skills; for everyone
  // else extraRoots is empty and this loop is skipped (no behavior change).
  if (Array.isArray(extraRoots) && extraRoots.length > 0) {
    for (const root of extraRoots) {
      if (!root) continue;
      const candidate = path.resolve(root, relPath);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return path.resolve(repoRoot, relPath);
}

/**
 * Detect whether a truth_source path has a redundant `skills/skills/` segment
 * that causes a spurious "file not found" result from resolveTruthSourcePath.
 *
 * The resolution rule for skill-library-aware paths is:
 *   `skills/<rest>` → `<library-parent>/skills/<rest>`
 * When the path was authored with the library root included redundantly, it
 * becomes `skills/skills/<rest>` → `<library-parent>/skills/skills/<rest>`
 * (triple-skills) → not found.  The path is structurally malformed; the file
 * is likely at `skills/<rest>` (single prefix).
 *
 * This function is a DIAGNOSTIC ONLY — it does not auto-correct the path.
 * Callers should emit a BROKEN (malformed path: ...) message and direct the
 * skill author to fix the `grounding.truth_sources` value in the SKILL.md.
 *
 * @param {string} relPath — workspace-relative path from a truth_source
 * @returns {{ malformed: boolean, suggestedPath: string|null }}
 *   malformed   — true when a redundant `skills/skills/` prefix is detected
 *   suggestedPath — the de-duplicated path (exists check is left to the caller)
 */
function detectMalformedTruthSourcePath(relPath) {
  if (typeof relPath !== 'string') return { malformed: false, suggestedPath: null };
  // Detect the canonical failure mode: path starts with `skills/skills/`
  // (the library root basename repeated as a leading path segment).
  if (relPath.startsWith('skills/skills/')) {
    const suggestedPath = relPath.replace(/^skills\/skills\//, 'skills/');
    return { malformed: true, suggestedPath };
  }
  return { malformed: false, suggestedPath: null };
}

module.exports = {
  packageRoot,
  workspaceRoot,
  collectSkillFiles,
  collectSkillFilesFromRoots,
  detectMalformedTruthSourcePath,
  loadRootsConfig,
  loadWorkspaceConfig, // back-compat alias for v8 callers; new code uses loadRootsConfig
  resolvePackagedOrWorkspacePath,
  resolveSchemaPath,
  resolveSkillDirSpecifier,
  resolveSkillFileSpecifier,
  resolveSkillRoots,
  resolveTruthSourcePath,
  walkSkillFiles,
};
