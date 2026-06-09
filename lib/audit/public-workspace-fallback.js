'use strict';

// Public workspace fallback for Codex desktop / nested sandboxes.
//
// When macOS Seatbelt cannot be applied from a nested harness, run model CLIs from a
// physical public-only workspace. This is not a kernel fence by itself; it is a
// disclosure-minimizing fallback that gives the model process a cwd containing only
// Skill Graph system code and the canonical skills corpus. Pair it with the normal
// in-process public-content guard and, when possible, a model CLI sandbox.

const fs = require('fs');
const os = require('os');
const path = require('path');

const DEFAULT_SKILL_GRAPH_EXCLUDES = new Set([
  '.git',
  'node_modules',
  '.opencode',
  '.skill-graph',
  'skill-audit-loop/progress',
]);

function isUnder(child, parent) {
  const c = path.resolve(child);
  const p = path.resolve(parent);
  return c === p || c.startsWith(p + path.sep);
}

function relUnix(root, p) {
  return path.relative(root, p).split(path.sep).join('/');
}

function copySkillGraph(srcRoot, destRoot, fsImpl = fs) {
  fsImpl.cpSync(srcRoot, destRoot, {
    recursive: true,
    filter: (src) => {
      const rel = relUnix(srcRoot, src);
      if (!rel) return true;
      if (DEFAULT_SKILL_GRAPH_EXCLUDES.has(rel)) return false;
      const first = rel.split('/')[0];
      if (DEFAULT_SKILL_GRAPH_EXCLUDES.has(first)) return false;
      if (rel.startsWith('skill-audit-loop/progress/')) return false;
      return true;
    },
  });
  fsImpl.mkdirSync(path.join(destRoot, 'skill-audit-loop', 'progress', 'skill-audits'), { recursive: true });
  fsImpl.mkdirSync(path.join(destRoot, '.opencode', 'progress'), { recursive: true });
}

function copySkillsCorpus(skillsRoot, destRoot, fsImpl = fs) {
  const sourceCorpus = path.join(skillsRoot, 'skills');
  const destCorpus = path.join(destRoot, 'skills');
  fsImpl.mkdirSync(destRoot, { recursive: true });
  fsImpl.cpSync(sourceCorpus, destCorpus, {
    recursive: true,
    filter: (src) => {
      const base = path.basename(src);
      return base !== '.git' && base !== 'node_modules';
    },
  });
}

function preparePublicWorkspace(options = {}) {
  const fsImpl = options.fsImpl || fs;
  const enabled = Boolean(options.enabled);
  if (!enabled) {
    return { active: false, cleanup: () => {} };
  }

  const skillGraphRoot = path.resolve(options.skillGraphRoot || process.cwd());
  const workspaceRoot = path.resolve(options.workspaceRoot || path.join(skillGraphRoot, '..'));
  const skillsRoot = path.resolve(options.skillsRoot || path.join(workspaceRoot, 'skills'));
  const tmpBase = options.tmpDir || os.tmpdir();
  const root = fsImpl.mkdtempSync(path.join(tmpBase, 'skill-audit-public-workspace-'));
  try { fsImpl.chmodSync(root, 0o700); } catch (_) { /* best-effort */ }

  const publicSkillGraphRoot = path.join(root, 'skill-graph');
  const publicSkillsRoot = path.join(root, 'skills');
  copySkillGraph(skillGraphRoot, publicSkillGraphRoot, fsImpl);
  copySkillsCorpus(skillsRoot, publicSkillsRoot, fsImpl);

  function mapSkillDir(skillDir) {
    const resolved = path.resolve(skillDir);
    const corpusRoot = path.join(skillsRoot, 'skills');
    if (!isUnder(resolved, corpusRoot)) return resolved;
    return path.join(publicSkillsRoot, 'skills', path.relative(corpusRoot, resolved));
  }

  return {
    active: true,
    root,
    skillGraphRoot: publicSkillGraphRoot,
    skillsRoot: publicSkillsRoot,
    originalSkillGraphRoot: skillGraphRoot,
    originalSkillsRoot: skillsRoot,
    mapSkillDir,
    cleanup: () => {
      try { fsImpl.rmSync(root, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
    },
  };
}

module.exports = {
  DEFAULT_SKILL_GRAPH_EXCLUDES,
  preparePublicWorkspace,
  copySkillGraph,
  copySkillsCorpus,
};
