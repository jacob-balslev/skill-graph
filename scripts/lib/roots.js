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

function loadWorkspaceConfig(root = workspaceRoot(), onWarning = null) {
  const configPath = path.join(root, '.skill-graph', 'config.json');
  if (!fs.existsSync(configPath)) return null;
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config || typeof config !== 'object') return null;
    if (!config.workspace || typeof config.workspace !== 'object') return null;
    return config.workspace;
  } catch (e) {
    if (typeof onWarning === 'function') {
      onWarning(`.skill-graph/config.json: cannot parse - ${e.message}`);
    }
    return null;
  }
}

function resolveSkillRoots(root = workspaceRoot(), workspace = loadWorkspaceConfig(root)) {
  const defaultRoot = { absPath: path.join(root, 'skills'), project: null };
  if (!workspace || !Array.isArray(workspace.skill_roots) || workspace.skill_roots.length === 0) {
    return [defaultRoot];
  }

  return workspace.skill_roots
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

function collectSkillFiles(root = workspaceRoot(), workspace = loadWorkspaceConfig(root), options = {}) {
  return collectSkillFilesFromRoots(resolveSkillRoots(root, workspace), options);
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
 *   - Paths that don't start with `skills/` (e.g., `schemas/foo.json`) always
 *     resolve against `<repo-root>` — they reference the tooling repo itself.
 *
 * @param {string} relPath — workspace-relative path from a truth_source
 * @param {string} repoRoot — the tooling repo workspace root (= REPO_ROOT)
 * @param {Array<{absPath: string, project?: string|null}>} skillRoots — output of resolveSkillRoots()
 * @returns {string} absolute path (existence not guaranteed)
 */
function resolveTruthSourcePath(relPath, repoRoot, skillRoots) {
  if (typeof relPath === 'string' && relPath.startsWith('skills/') && Array.isArray(skillRoots) && skillRoots.length > 0) {
    const firstRoot = skillRoots[0] && skillRoots[0].absPath;
    if (firstRoot && path.basename(firstRoot) === 'skills') {
      return path.resolve(path.dirname(firstRoot), relPath);
    }
  }
  return path.resolve(repoRoot, relPath);
}

module.exports = {
  packageRoot,
  workspaceRoot,
  collectSkillFiles,
  collectSkillFilesFromRoots,
  loadWorkspaceConfig,
  resolvePackagedOrWorkspacePath,
  resolveSchemaPath,
  resolveSkillRoots,
  resolveTruthSourcePath,
  walkSkillFiles,
};
