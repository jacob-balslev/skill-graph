#!/usr/bin/env node
/**
 * Validate deterministic composition hints declared under relations.io_contract.
 *
 * The field is opt-in. Skills without an io_contract are never flagged for
 * missing inputs or outputs. When both sides of an authored depends_on edge
 * declare compatible contracts, this checker verifies that the dependency's
 * outputs satisfy at least one of the dependent skill's inputs. It also checks
 * authored depends_on cycles among skills that participate in io_contract.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('../lib/parse-frontmatter');
const {
  collectSkillFilesFromRoots,
  loadRootsConfig,
  resolveSkillRoots,
  workspaceRoot,
} = require('../lib/roots');

function parseArgs(argv) {
  const opts = {
    json: false,
    quiet: false,
    root: workspaceRoot(),
    paths: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') opts.json = true;
    else if (arg === '--quiet') opts.quiet = true;
    else if (arg === '--root' && argv[i + 1]) opts.root = path.resolve(argv[++i]);
    else if (arg === '--path' && argv[i + 1]) opts.paths.push(path.resolve(argv[++i]));
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return opts;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/skill/check-io-composition.js [options]

Validate relations.io_contract composition hints.

Options:
  --path <dir>   Skill root to scan. May be passed more than once.
  --root <dir>   Workspace root for .skill-graph/config.json discovery.
  --json         Emit JSON.
  --quiet        Print only the summary line.
`);
}

function relationTargetName(edge) {
  if (typeof edge === 'string') return edge;
  if (edge && typeof edge === 'object' && typeof edge.skill === 'string') return edge.skill;
  return null;
}

function asTokens(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasContract(contract) {
  return Boolean(contract && (contract.inputs.length > 0 || contract.outputs.length > 0));
}

function contractFor(frontmatter) {
  const raw = frontmatter &&
    frontmatter.relations &&
    typeof frontmatter.relations === 'object' &&
    frontmatter.relations.io_contract &&
    typeof frontmatter.relations.io_contract === 'object'
      ? frontmatter.relations.io_contract
      : null;

  return {
    inputs: asTokens(raw && raw.inputs),
    outputs: asTokens(raw && raw.outputs),
  };
}

function skillName(frontmatter, filePath) {
  if (frontmatter && typeof frontmatter.name === 'string' && frontmatter.name.trim()) {
    return frontmatter.name.trim();
  }
  return path.basename(path.dirname(filePath));
}

function localName(name) {
  return String(name || '').split(/[/:]/).filter(Boolean).pop() || String(name || '');
}

function addAlias(map, key, record) {
  if (!key) return;
  if (map.has(key) && map.get(key) !== record) {
    map.set(key, null);
    return;
  }
  map.set(key, record);
}

function loadRecords(root, paths) {
  const config = loadRootsConfig(root);
  const roots = paths.length
    ? paths.map((entry) => ({ absPath: path.resolve(entry), project: null }))
    : resolveSkillRoots(root, config);
  const records = [];

  for (const entry of collectSkillFilesFromRoots(roots)) {
    const source = fs.readFileSync(entry.filePath, 'utf8');
    const parsed = parseFrontmatter(source);
    const frontmatter = normalizeFrontmatter(parsed || {});
    const name = skillName(frontmatter, entry.filePath);
    const contract = contractFor(frontmatter);
    const dependsOn = frontmatter &&
      frontmatter.relations &&
      typeof frontmatter.relations === 'object' &&
      Array.isArray(frontmatter.relations.depends_on)
        ? frontmatter.relations.depends_on.map(relationTargetName).filter(Boolean)
        : [];

    records.push({
      name,
      localName: localName(name),
      file: path.relative(root, entry.filePath).replace(/\\/g, '/'),
      contract,
      hasContract: hasContract(contract),
      dependsOn,
    });
  }

  return records.sort((a, b) => a.name.localeCompare(b.name));
}

function buildRegistry(records) {
  const byName = new Map();
  const byLocalName = new Map();
  for (const record of records) {
    addAlias(byName, record.name, record);
    addAlias(byLocalName, record.localName, record);
  }
  return { byName, byLocalName };
}

function resolveTarget(registry, target) {
  return registry.byName.get(target) || registry.byLocalName.get(localName(target)) || null;
}

function intersects(left, right) {
  const values = new Set(left);
  return right.some((item) => values.has(item));
}

function findBrokenChains(records, registry) {
  const findings = [];
  for (const record of records) {
    if (record.contract.inputs.length === 0) continue;
    for (const targetName of record.dependsOn) {
      const target = resolveTarget(registry, targetName);
      if (!target || target.contract.outputs.length === 0) continue;
      if (intersects(record.contract.inputs, target.contract.outputs)) continue;
      findings.push({
        skill: record.name,
        dependency: target.name,
        file: record.file,
        inputs: record.contract.inputs,
        dependency_outputs: target.contract.outputs,
      });
    }
  }
  return findings;
}

function buildDependsOnGraph(records, registry, options = {}) {
  const requireContracts = Boolean(options.requireContracts);
  const graph = new Map(records.map((record) => [record.name, new Set()]));
  for (const record of records) {
    for (const targetName of record.dependsOn) {
      const target = resolveTarget(registry, targetName);
      if (requireContracts && (!target || !target.hasContract)) continue;
      if (target) graph.get(record.name).add(target.name);
    }
  }
  return graph;
}

function findCycles(graph) {
  let index = 0;
  const stack = [];
  const onStack = new Set();
  const indexes = new Map();
  const lowlinks = new Map();
  const cycles = [];

  function strongConnect(node) {
    indexes.set(node, index);
    lowlinks.set(node, index);
    index += 1;
    stack.push(node);
    onStack.add(node);

    for (const next of graph.get(node) || []) {
      if (!indexes.has(next)) {
        strongConnect(next);
        lowlinks.set(node, Math.min(lowlinks.get(node), lowlinks.get(next)));
      } else if (onStack.has(next)) {
        lowlinks.set(node, Math.min(lowlinks.get(node), indexes.get(next)));
      }
    }

    if (lowlinks.get(node) !== indexes.get(node)) return;
    const component = [];
    let current;
    do {
      current = stack.pop();
      onStack.delete(current);
      component.push(current);
    } while (current !== node);

    if (component.length > 1) {
      cycles.push(component.sort());
      return;
    }
    const only = component[0];
    if (graph.get(only) && graph.get(only).has(only)) cycles.push([only]);
  }

  for (const node of graph.keys()) {
    if (!indexes.has(node)) strongConnect(node);
  }

  return cycles.sort((a, b) => a.join(' > ').localeCompare(b.join(' > ')));
}

function derivedEdges(records) {
  const producers = [];
  const edges = [];
  for (const record of records) {
    for (const output of record.contract.outputs) producers.push({ output, record });
  }
  for (const consumer of records) {
    for (const input of consumer.contract.inputs) {
      for (const producer of producers) {
        if (producer.record.name === consumer.name) continue;
        if (producer.output !== input) continue;
        edges.push({
          from: consumer.name,
          to: producer.record.name,
          artifact: input,
        });
      }
    }
  }
  return edges.sort((a, b) => `${a.from}:${a.to}:${a.artifact}`.localeCompare(`${b.from}:${b.to}:${b.artifact}`));
}

function run(options) {
  const root = path.resolve(options.root);
  const records = loadRecords(root, options.paths);
  const registry = buildRegistry(records);
  const contractRecords = records.filter((record) => record.hasContract);
  const graph = buildDependsOnGraph(contractRecords, registry, { requireContracts: true });
  const broken_chains = findBrokenChains(records, registry);
  const cycles = findCycles(graph);
  const derived_edges = derivedEdges(records);
  const withContracts = records.filter((record) => record.hasContract).length;

  return {
    root,
    skills_scanned: records.length,
    skills_with_io_contract: withContracts,
    derived_edges,
    broken_chains,
    cycles,
    ok: broken_chains.length === 0 && cycles.length === 0,
  };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}\n\n`);
    printHelp();
    process.exit(1);
  }

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const result = run(opts);
  if (opts.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const summary = `io composition: ${result.skills_scanned} skill(s), ${result.skills_with_io_contract} io_contract skill(s), ${result.broken_chains.length} broken chain(s), ${result.cycles.length} cycle(s)`;
    process.stdout.write(`${summary}\n`);
    if (!opts.quiet) {
      for (const finding of result.broken_chains) {
        process.stdout.write(`BROKEN ${finding.skill} depends_on ${finding.dependency}: inputs [${finding.inputs.join(', ')}] do not match outputs [${finding.dependency_outputs.join(', ')}]\n`);
      }
      for (const cycle of result.cycles) {
        process.stdout.write(`CYCLE ${cycle.join(' -> ')}\n`);
      }
    }
  }

  process.exit(result.ok ? 0 : 1);
}

module.exports = {
  findBrokenChains,
  findCycles,
  run,
};

if (require.main === module) main();
