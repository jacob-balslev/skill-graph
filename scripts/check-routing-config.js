#!/usr/bin/env node
/**
 * Gate: validate the skill-injector routing-config INSTANCE against its schema.
 *
 * ADR-0016 surface #4 made `schemas/routing-config.schema.json` the project-owned
 * binding shape for the cross-project routing-config instance, but left it
 * "authored, unwired" — no gate enforced it (the repo carries no ajv dependency,
 * by policy it uses Node built-ins only). This script is that wiring.
 *
 * The instance lives at the CONSUMER location (the workspace orchestration repo),
 * not in skill-graph — ADR-0016 deliberately keeps the type here and the instance
 * there. So this gate resolves the instance relative to the parent workspace and
 * SKIPS gracefully (exit 0) when it is not reachable (e.g. a standalone clone of
 * skill-graph). When the instance IS reachable, it must conform: every required
 * top-level key present and of the schema-declared type.
 *
 * This is a structural validator (required-keys + top-level type), not a full
 * JSON-Schema engine — sufficient to catch the drift ADR-0016 cared about
 * (instance missing a key the schema now requires) without taking an ajv dep.
 *
 * Resolution order for the instance:
 *   1. $SKILL_ROUTING_CONFIG (explicit override)
 *   2. <repo>/../agent-orchestration/references/skill-routing-config.json (default sibling layout)
 *
 * Usage:
 *   node scripts/check-routing-config.js          # validate (or skip), exit 1 on violation
 *   node scripts/check-routing-config.js --json    # machine-readable result
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'routing-config.schema.json');

function resolveInstancePath() {
  if (process.env.SKILL_ROUTING_CONFIG) return path.resolve(process.env.SKILL_ROUTING_CONFIG);
  return path.resolve(REPO_ROOT, '..', 'agent-orchestration', 'references', 'skill-routing-config.json');
}

// Map a JSON-Schema `type` (or `type` array) to a runtime predicate.
function typeMatches(value, schemaType) {
  const types = Array.isArray(schemaType) ? schemaType : [schemaType];
  return types.some(t => {
    switch (t) {
      case 'array': return Array.isArray(value);
      case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number';
      case 'integer': return Number.isInteger(value);
      case 'boolean': return typeof value === 'boolean';
      case 'null': return value === null;
      default: return true; // unknown/absent type → don't fail on it
    }
  });
}

function main() {
  const json = process.argv.includes('--json');
  const emit = (result) => {
    if (json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    return result;
  };

  let schema;
  try {
    schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (e) {
    process.stderr.write(`FAIL routing-config: schema unreadable at ${path.relative(REPO_ROOT, SCHEMA_PATH)} — ${e.message}\n`);
    emit({ status: 'ERROR', reason: 'schema-unreadable' });
    process.exit(1);
  }

  const instancePath = resolveInstancePath();
  if (!fs.existsSync(instancePath)) {
    process.stdout.write(`SKIP routing-config: instance not reachable at ${instancePath} (standalone clone — ADR-0016 keeps the instance at the consumer location). Schema is valid JSON.\n`);
    emit({ status: 'SKIP', reason: 'instance-absent', instancePath });
    process.exit(0);
  }

  let instance;
  try {
    instance = JSON.parse(fs.readFileSync(instancePath, 'utf8'));
  } catch (e) {
    process.stderr.write(`FAIL routing-config: instance is not valid JSON at ${instancePath} — ${e.message}\n`);
    emit({ status: 'FAIL', reason: 'instance-invalid-json', instancePath });
    process.exit(1);
  }

  const required = Array.isArray(schema.required) ? schema.required : [];
  const props = schema.properties || {};
  const violations = [];

  for (const key of required) {
    if (!(key in instance)) {
      violations.push(`missing required key "${key}"`);
      continue;
    }
    const declaredType = props[key] && props[key].type;
    if (declaredType && !typeMatches(instance[key], declaredType)) {
      violations.push(`key "${key}" is ${Array.isArray(instance[key]) ? 'array' : typeof instance[key]}, schema requires ${JSON.stringify(declaredType)}`);
    }
  }

  if (violations.length > 0) {
    process.stderr.write(`FAIL routing-config: instance ${path.relative(path.resolve(REPO_ROOT, '..'), instancePath)} violates schemas/routing-config.schema.json:\n`);
    for (const v of violations) process.stderr.write(`  - ${v}\n`);
    emit({ status: 'FAIL', reason: 'schema-violation', violations, instancePath });
    process.exit(1);
  }

  process.stdout.write(`OK   routing-config: instance conforms (${required.length} required keys present + typed)\n`);
  emit({ status: 'PASS', requiredKeys: required.length, instancePath });
  process.exit(0);
}

if (require.main === module) main();

module.exports = { typeMatches, resolveInstancePath };
