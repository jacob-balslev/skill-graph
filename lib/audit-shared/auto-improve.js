'use strict';

// Shared registry, ownership, and findings-ledger helpers for deterministic
// auto-improvement loops.

const fs = require('fs');
const path = require('path');

function resolveWorkspaceRoot() {
  if (process.env.SKILL_GRAPH_WORKSPACE) return path.resolve(process.env.SKILL_GRAPH_WORKSPACE);
  return process.cwd();
}

const WORKSPACE_ROOT = resolveWorkspaceRoot();
const AUTO_IMPROVE_DIR = process.env.SKILL_GRAPH_AUTO_IMPROVE_DIR
  ? path.resolve(process.env.SKILL_GRAPH_AUTO_IMPROVE_DIR)
  : fs.existsSync(path.join(WORKSPACE_ROOT, 'agent-orchestration'))
    ? path.join(WORKSPACE_ROOT, 'agent-orchestration', 'auto-improve')
    : path.join(WORKSPACE_ROOT, '.skill-graph', 'auto-improve');
const AUTO_IMPROVE_REGISTRY = path.join(AUTO_IMPROVE_DIR, 'registry.json');
const AUTO_IMPROVE_FINDINGS_LOG = process.env.SKILL_GRAPH_AUTO_IMPROVE_FINDINGS_LOG
  ? path.resolve(process.env.SKILL_GRAPH_AUTO_IMPROVE_FINDINGS_LOG)
  : fs.existsSync(path.join(WORKSPACE_ROOT, 'agent-orchestration', 'logs'))
    ? path.join(WORKSPACE_ROOT, 'agent-orchestration', 'logs', 'auto-improve-findings.jsonl')
    : path.join(WORKSPACE_ROOT, '.skill-graph', 'logs', 'auto-improve-findings.jsonl');
const SKILLS_MANIFEST = path.join(WORKSPACE_ROOT, 'skills.manifest.json');
const PROMPT_EVOLUTION_LOOP = 'prompt-evolution';
const SKILL_EVOLUTION_LOOP = 'skill-evolution';
const DETERMINISTIC_AUDIT_LOOP = 'deterministic-audit';
const OWNERSHIP_MODE_TEMPLATE = 'template';
const OWNERSHIP_MODE_AUTHORED = 'authored';
const TEMPLATE_OWNED_META_PILOT = 'template-owned-meta';
const TEMPLATE_OWNED_META_SKILLS = new Set([
  'ai-coding-agents',
  'code-review',
  'doc-updater',
  'task-execution',
]);
const QUALITY_HISTORY_CAP = 20;

function normalizeRel(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function parseJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function classifySkillTier(name, assetPath) {
  const subject = `${name || ''} ${assetPath || ''}`.toLowerCase();
  if (/(auth|security|payment|billing|credential|encryption|api-key|gdpr|nextauth|webhook|rls|tenant|financial-engine|financial-system|audit-api-keys)/.test(subject)) {
    return 1;
  }
  if (/(database|migration|sql|ledger|provider|integration|canonical|reconciliation|order-lifecycle)/.test(subject)) {
    return 2;
  }
  return 3;
}

function templatePathForEntry(entry) {
  return path.join(WORKSPACE_ROOT, path.dirname(entry.path), 'SKILL.md.tmpl');
}

function inferOwnerLoop(entry) {
  return fileExists(templatePathForEntry(entry)) ? PROMPT_EVOLUTION_LOOP : SKILL_EVOLUTION_LOOP;
}

function inferOwnershipMode(entry) {
  return fileExists(templatePathForEntry(entry)) ? OWNERSHIP_MODE_TEMPLATE : OWNERSHIP_MODE_AUTHORED;
}

function inferPilotTrack(entry) {
  if (inferOwnerLoop(entry) !== PROMPT_EVOLUTION_LOOP) return null;
  const normalizedPath = normalizeRel(entry.path);
  const skillName = normalizedPath.split('/').slice(-2, -1)[0] || '';
  return TEMPLATE_OWNED_META_SKILLS.has(skillName) ? TEMPLATE_OWNED_META_PILOT : null;
}

function buildSkillAssetsFromManifest(manifest) {
  const entries = [];
  if (manifest.repos) {
    for (const [repoKey, repoData] of Object.entries(manifest.repos)) {
      const repoSkills = repoData?.skills || [];
      const prefix = repoKey === 'shared' ? 'skills' : `skills/${repoKey}`;
      for (const skill of repoSkills) {
        entries.push({
          ...skill,
          path: skill.path || `${prefix}/${skill.name}/SKILL.md`,
          scope: skill.scope || repoKey,
        });
      }
    }
  } else if (Array.isArray(manifest.skills)) {
    // skill-graph generate-manifest emits a flat array under .skills (the
    // canonical post-2026-05 shape). Older Sales Hub manifests still use the
    // .shared / .salesHub split, so the fallback below stays for back-compat.
    entries.push(...manifest.skills);
  } else {
    entries.push(
      ...(manifest.skills?.shared || []),
      ...(manifest.skills?.salesHub || []),
    );
  }

  return entries.map((entry) => ({
    id: `skill:${entry.name}`,
    type: 'skill',
    path: normalizeRel(entry.path),
    owner_loop: inferOwnerLoop(entry),
    ownership_mode: inferOwnershipMode(entry),
    pilot_track: inferPilotTrack(entry),
    metric: 'eval_pass_rate',
    tier: classifySkillTier(entry.name, entry.path),
    scope: entry.scope,
  }));
}

function buildFallbackRegistry() {
  const manifest = fileExists(SKILLS_MANIFEST)
    ? parseJson(SKILLS_MANIFEST)
    : { skills: { shared: [], salesHub: [] } };

  const assets = buildSkillAssetsFromManifest(manifest);
  assets.push(
    {
      id: 'script:skill-census',
      type: 'script',
      path: 'scripts/skill/skill-census.js',
      owner_loop: DETERMINISTIC_AUDIT_LOOP,
      metric: 'duration_ms',
      tier: 1,
    },
    {
      id: 'log:auto-improve-findings',
      type: 'log',
      path: normalizeRel(path.relative(WORKSPACE_ROOT, AUTO_IMPROVE_FINDINGS_LOG)),
      owner_loop: DETERMINISTIC_AUDIT_LOOP,
      metric: 'finding_volume',
      tier: 2,
    },
  );

  return {
    version: 1,
    generated: new Date().toISOString(),
    source: 'lib/audit-shared/auto-improve.js:fallback',
    assets,
  };
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];

  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function appendJsonl(filePath, entry) {
  ensureParentDir(filePath);
  fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`);
}

function readRegistry(registryPath = AUTO_IMPROVE_REGISTRY) {
  if (!fileExists(registryPath)) return buildFallbackRegistry();

  try {
    return parseJson(registryPath);
  } catch {
    return buildFallbackRegistry();
  }
}

function parseList(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes'].includes(normalized)) return true;
  if (['false', '0', 'no'].includes(normalized)) return false;
  return fallback;
}

function writeRegistry(registry, registryPath = AUTO_IMPROVE_REGISTRY) {
  ensureParentDir(registryPath);
  registry.updated_at = new Date().toISOString();

  const tmpPath = `${registryPath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(registry, null, 2) + '\n');
  fs.renameSync(tmpPath, registryPath);
}

function updateRegistryScore(registry, assetId, score, evalTimestamp) {
  const asset = (registry.assets || []).find(a => a.id === assetId);
  if (!asset) return;

  asset.last_score = score;
  asset.last_eval_at = evalTimestamp || new Date().toISOString();
  asset.consecutive_failures = 0;

  if (!Array.isArray(asset.quality_history)) asset.quality_history = [];

  asset.quality_history.push({
    score,
    timestamp: asset.last_eval_at,
  });

  if (asset.quality_history.length > QUALITY_HISTORY_CAP) {
    asset.quality_history = asset.quality_history.slice(-QUALITY_HISTORY_CAP);
  }
}

function markPropagationPending(registry, assetIds) {
  const idSet = new Set(assetIds);
  for (const asset of registry.assets || []) {
    if (idSet.has(asset.id)) asset.propagation_pending = true;
  }
}

module.exports = {
  AUTO_IMPROVE_DIR,
  AUTO_IMPROVE_FINDINGS_LOG,
  AUTO_IMPROVE_REGISTRY,
  appendJsonl,
  buildFallbackRegistry,
  ensureParentDir,
  fileExists,
  inferOwnerLoop,
  parseBoolean,
  parseJson,
  parseList,
  readJsonl,
  readRegistry,
  writeRegistry,
  updateRegistryScore,
  markPropagationPending,
  classifySkillTier,
  OWNERSHIP_MODE_TEMPLATE,
  OWNERSHIP_MODE_AUTHORED,
  TEMPLATE_OWNED_META_PILOT,
  TEMPLATE_OWNED_META_SKILLS,
  inferOwnershipMode,
  inferPilotTrack,
};
