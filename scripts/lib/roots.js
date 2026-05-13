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

module.exports = {
  packageRoot,
  workspaceRoot,
  loadWorkspaceConfig,
  resolvePackagedOrWorkspacePath,
  resolveSchemaPath,
  resolveSkillRoots,
};
