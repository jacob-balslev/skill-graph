#!/usr/bin/env node
'use strict';

/**
 * Deterministic target selection for trusted auto-improve findings.
 *
 * This package-local copy keeps `skill-graph evolve` standalone: it reads the
 * bundled audit-shared helpers and the caller's workspace manifest instead of
 * reaching into the parent Development repo.
 */

const fs = require('fs');
const path = require('path');

const { AUTO_IMPROVE_REGISTRY, readRegistry } = require('../lib/audit-shared/auto-improve');
const { parseArgs } = require('../lib/audit-shared/parse-args');

const WORKSPACE_ROOT = process.env.SKILL_GRAPH_WORKSPACE
  ? path.resolve(process.env.SKILL_GRAPH_WORKSPACE)
  : process.cwd();
const MANIFEST_PATH = process.env.SKILL_GRAPH_MANIFEST
  ? path.resolve(process.env.SKILL_GRAPH_MANIFEST)
  : path.join(WORKSPACE_ROOT, 'skills.manifest.json');

const RELATION_SCORES = {
  related: 80,
  adjacent: 80,
  verify_with: 75,
  boundary: 65,
};
const DIRECT_ASSET_SCORE = 100;
const SELF_SKILL_SCORE = 95;

function parseJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeRel(filePath) {
  return String(filePath || '').replace(/\\/g, '/');
}

function getAssetOwnedPaths(asset) {
  const paths = new Set();
  if (asset?.path) paths.add(asset.path);
  if (asset?.template_path) paths.add(asset.template_path);
  if (Array.isArray(asset?.paths)) {
    for (const assetPath of asset.paths) paths.add(assetPath);
  }
  return Array.from(paths).map(normalizeRel).filter(Boolean);
}

function buildRegistryIndex(registry) {
  const byId = new Map();
  const byOwnedPath = new Map();

  for (const asset of registry.assets || []) {
    byId.set(asset.id, asset);
    for (const ownedPath of getAssetOwnedPaths(asset)) {
      byOwnedPath.set(normalizeRel(ownedPath), asset);
    }
  }

  return { byId, byOwnedPath };
}

function manifestEntries(manifest) {
  if (Array.isArray(manifest.skills)) return manifest.skills;
  if (manifest.repos && typeof manifest.repos === 'object') {
    return Object.values(manifest.repos).flatMap(repo => repo?.skills || []);
  }
  return [
    ...(manifest.skills?.shared || []),
    ...(manifest.skills?.salesHub || []),
  ];
}

function buildManifestIndex(manifest) {
  const entries = manifestEntries(manifest);
  const byName = new Map(entries.map((entry) => [entry.name, entry]));
  return { byName, entries };
}

function createContext({ registry, manifest } = {}) {
  const resolvedRegistry = registry || readRegistry(AUTO_IMPROVE_REGISTRY);
  const resolvedManifest = manifest || (fs.existsSync(MANIFEST_PATH) ? parseJson(MANIFEST_PATH) : { skills: [] });

  return {
    registry: resolvedRegistry,
    registryIndex: buildRegistryIndex(resolvedRegistry),
    manifestIndex: buildManifestIndex(resolvedManifest),
  };
}

function addTarget(targets, candidate) {
  if (!candidate.id) return;
  const key = `${candidate.type}:${candidate.id}`;
  const existing = targets.get(key);
  if (!existing || candidate.score > existing.score) targets.set(key, candidate);
}

function getSkillNameFromAssetId(assetId) {
  if (!assetId || !String(assetId).startsWith('skill:')) return null;
  return String(assetId).slice('skill:'.length);
}

function getTargetIdForAsset(asset) {
  if (!asset) return null;
  const rawId = String(asset.id || '');
  if (asset.type === 'skill') {
    return getSkillNameFromAssetId(rawId) || path.basename(path.dirname(asset.path || ''));
  }
  if (rawId.includes(':')) return rawId.split(':').slice(1).join(':');
  return rawId || path.basename(asset.path || '').replace(/\.[^.]+$/, '');
}

function addRegistryTargets(targets, finding, context) {
  if (finding.asset_id && context.registryIndex.byId.has(finding.asset_id)) {
    const asset = context.registryIndex.byId.get(finding.asset_id);
    addTarget(targets, {
      type: asset.type,
      id: getTargetIdForAsset(asset),
      score: DIRECT_ASSET_SCORE,
      reason: 'source asset is registry-owned',
    });
  }

  for (const affectedPath of finding.affected_paths || []) {
    const asset = context.registryIndex.byOwnedPath.get(normalizeRel(affectedPath));
    if (!asset) continue;
    addTarget(targets, {
      type: asset.type,
      id: getTargetIdForAsset(asset),
      score: DIRECT_ASSET_SCORE,
      reason: `matched owned path: ${affectedPath}`,
    });
  }
}

function addPathHeuristicTargets(targets, finding, context) {
  for (const affectedPath of finding.affected_paths || []) {
    const normalizedPath = normalizeRel(affectedPath);
    for (const entry of context.manifestIndex.entries || []) {
      const skillDir = normalizeRel(path.dirname(entry.path));
      if (!normalizedPath.startsWith(`${skillDir}/`) && normalizedPath !== entry.path) continue;
      addTarget(targets, {
        type: 'skill',
        id: entry.name,
        score: SELF_SKILL_SCORE,
        reason: `skill path ownership: ${affectedPath}`,
      });
    }
  }
}

function relationTargetName(target) {
  if (typeof target === 'string') return target;
  if (target && typeof target === 'object') return target.skill || target.name || null;
  return null;
}

function addManifestRelationTargets(targets, skillName, context) {
  if (!skillName) return;

  addTarget(targets, {
    type: 'skill',
    id: skillName,
    score: SELF_SKILL_SCORE,
    reason: 'source skill',
  });

  const manifestEntry = context.manifestIndex.byName.get(skillName);
  const relations = manifestEntry?.relations || {};

  for (const relationType of Object.keys(RELATION_SCORES)) {
    for (const relationTarget of relations[relationType] || []) {
      const relatedSkill = relationTargetName(relationTarget);
      if (!relatedSkill) continue;
      addTarget(targets, {
        type: 'skill',
        id: relatedSkill,
        score: RELATION_SCORES[relationType],
        reason: `manifest relation: ${relationType}`,
      });
    }
  }
}

function findPropagationTargets(finding, context = createContext(), options = {}) {
  const targets = new Map();
  addRegistryTargets(targets, finding, context);
  addPathHeuristicTargets(targets, finding, context);

  const skillNames = new Set();
  const assetSkillName = getSkillNameFromAssetId(finding.asset_id);
  if (assetSkillName) skillNames.add(assetSkillName);

  for (const candidate of targets.values()) {
    if (candidate.type === 'skill') skillNames.add(candidate.id);
    if (candidate.type === 'skill' && candidate.id.startsWith('skill:')) {
      const normalized = getSkillNameFromAssetId(candidate.id);
      if (normalized) skillNames.add(normalized);
    }
  }

  for (const skillName of skillNames) addManifestRelationTargets(targets, skillName, context);

  const maxTargets = Number(options.maxTargets || 8);
  return Array.from(targets.values())
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, maxTargets);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h || (!args['finding-file'] && !args['asset-id'])) {
    console.log([
      'find-propagation-targets.js',
      '',
      'Usage:',
      '  node docs/find-propagation-targets.js --finding-file /tmp/finding.json',
      '  node docs/find-propagation-targets.js --asset-id skill:code-review --affected-paths skills/code-review/SKILL.md',
    ].join('\n'));
    if (!args['finding-file'] && !args['asset-id']) return;
  }

  const finding = args['finding-file']
    ? parseJson(path.resolve(args['finding-file']))
    : {
        asset_id: args['asset-id'],
        affected_paths: String(args['affected-paths'] || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
      };

  process.stdout.write(JSON.stringify({
    targets: findPropagationTargets(finding, createContext(), { maxTargets: args['max-targets'] }),
  }, null, 2) + '\n');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  buildManifestIndex,
  buildRegistryIndex,
  createContext,
  findPropagationTargets,
  addPathHeuristicTargets,
  getSkillNameFromAssetId,
  getTargetIdForAsset,
};
