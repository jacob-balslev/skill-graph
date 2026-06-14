#!/usr/bin/env node
'use strict';

/**
 * test-workflow-conformance.js
 *
 * Executes `audits/workflow-conformance/spec.yaml`, the BDD suite for the
 * Skill Audit Loop's agent-orientation layer. The runner intentionally performs
 * deterministic checks only: it proves that entrypoint prompts and command docs
 * point agents to the workflow contract, relevant ADRs, BDD suites, metrics,
 * evidence rules, and all lifecycle step contracts before execution.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('../lib/parse-frontmatter');

const REPO_ROOT = path.resolve(__dirname, '../..');
const SPEC_DIR = path.join(REPO_ROOT, 'audits', 'workflow-conformance');
const SPEC_FILE = path.join(SPEC_DIR, 'spec.yaml');
const BOM = String.fromCharCode(0xfeff);
const LIFECYCLE_STEPS = [
  'Read',
  'Verify',
  'Evaluate baseline',
  'Research',
  'Improve',
  'Use',
  'Evaluate candidate',
  'Grade',
];
const REQUIRED_AGENT_CONTEXT_CHARTER = ['mission', 'vision', 'goal', 'rules'];
const REQUIRED_AGENT_CONTEXT_DOCS = [
  '../AGENTS.md',
  '../SKILL-SYSTEM-CHEAT-SHEET.md',
  'AGENTS.md',
  'SKILL_GRAPH.md',
  'skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md',
  'skill-audit-loop/SKILL_AUDIT_LOOP.md',
  'skill-audit-loop/WORKFLOW_CONTRACT.md',
  'skill-audit-loop/AGENT_CONTEXT.yaml',
];
const REQUIRED_AGENT_CONTEXT_SCRIPTS = [
  'scripts/__tests__/test-workflow-conformance.js',
  'scripts/__tests__/test-gate-conformance.js',
  'scripts/skill-audit-preflight.js',
  'lib/audit/skill-audit.js',
  'lib/audit/evaluate-skill.js',
  'lib/audit/run-skill-audit-loop.js',
  'scripts/run-panel-loop.sh',
  'bin/skill-graph.js',
];

const WHEN = {
  'text-references': runTextReferences,
  'lifecycle-step-contract': runLifecycleStepContract,
  'agent-context-manifest': runAgentContextManifest,
};

function loadScenarios() {
  assert(fs.existsSync(SPEC_FILE), `workflow-conformance spec not found: ${SPEC_FILE}`);
  const raw = fs.readFileSync(SPEC_FILE, 'utf8').split(BOM).join('');
  const fm = parseFrontmatter(`---\n${raw}\n---\n`);
  assert(
    fm && Array.isArray(fm.scenarios) && fm.scenarios.length > 0,
    'spec.yaml must parse to a non-empty `scenarios:` list'
  );
  return fm.scenarios;
}

function runTextReferences(scenario) {
  const givenAbs = path.resolve(SPEC_DIR, scenario.given);
  assert(fs.existsSync(givenAbs), `scenario ${scenario.id}: given file not found: ${scenario.given}`);
  const text = fs.readFileSync(givenAbs, 'utf8');
  const then = scenario.then || {};

  for (const needle of asList(then.contains)) {
    assert(
      text.includes(needle),
      `scenario ${scenario.id}: expected ${scenario.given} to contain "${needle}"`
    );
  }

  for (const needle of asList(then.absent)) {
    assert(
      !text.includes(needle),
      `scenario ${scenario.id}: expected ${scenario.given} not to contain "${needle}"`
    );
  }
}

function runAgentContextManifest(scenario) {
  const givenAbs = path.resolve(SPEC_DIR, scenario.given);
  assert(fs.existsSync(givenAbs), `scenario ${scenario.id}: given file not found: ${scenario.given}`);
  const raw = fs.readFileSync(givenAbs, 'utf8').split(BOM).join('');
  const manifest = parseFrontmatter(`---\n${raw}\n---\n`);
  assert(manifest && typeof manifest === 'object', `scenario ${scenario.id}: context manifest did not parse`);
  assert.strictEqual(manifest.type, 'skill-audit-loop-agent-context', `scenario ${scenario.id}: wrong manifest type`);
  assert.strictEqual(String(manifest.version), '1', `scenario ${scenario.id}: wrong manifest version`);
  assert.strictEqual(manifest.mode, 'SYSTEM', `scenario ${scenario.id}: manifest mode must be SYSTEM`);

  for (const needle of asList(scenario.then && scenario.then.contains)) {
    assert(raw.includes(needle), `scenario ${scenario.id}: expected manifest to contain "${needle}"`);
  }

  for (const key of REQUIRED_AGENT_CONTEXT_CHARTER) {
    const entry = manifest.charter && manifest.charter[key];
    assert(entry, `scenario ${scenario.id}: manifest missing charter.${key}`);
    assertReferencedFileContains(scenario, entry, `charter.${key}`);
  }

  const docs = asListOfObjects(manifest.required_documents, 'required_documents');
  assertContainsPaths(scenario, docs, REQUIRED_AGENT_CONTEXT_DOCS, 'required_documents');
  for (const doc of docs) assertExistingPath(scenario, doc.path, 'required_documents');

  const suites = asListOfObjects(manifest.bdd_suites, 'bdd_suites');
  assert(suites.length >= 2, `scenario ${scenario.id}: manifest must list BDD suites`);
  for (const suite of suites) {
    assert(suite.name, `scenario ${scenario.id}: BDD suite missing name`);
    assertExistingPath(scenario, suite.spec, `bdd_suites.${suite.name}.spec`);
    assertExistingPath(scenario, suite.runner, `bdd_suites.${suite.name}.runner`);
  }

  const scripts = asListOfObjects(manifest.scripts, 'scripts');
  assertContainsPaths(scenario, scripts, REQUIRED_AGENT_CONTEXT_SCRIPTS, 'scripts');
  for (const script of scripts) {
    assertExistingPath(scenario, script.path, 'scripts');
    assert(script.role, `scenario ${scenario.id}: script ${script.path} missing role`);
    const required = asList(script.requires);
    assert(required.length > 0, `scenario ${scenario.id}: script ${script.path} must name required context`);
    for (const requiredPath of required) assertExistingPath(scenario, requiredPath, `scripts.${script.path}.requires`);
  }

  assertReferencedFileContains(scenario, manifest.display_contract, 'display_contract');
}

function runLifecycleStepContract(scenario) {
  assert(scenario.step, `scenario ${scenario.id}: missing \`step\``);
  assert(
    LIFECYCLE_STEPS.includes(scenario.step),
    `scenario ${scenario.id}: unexpected lifecycle step: ${scenario.step}`
  );
  assert(
    asList(scenario.then && scenario.then.contains).includes(`| ${scenario.step} |`),
    `scenario ${scenario.id}: lifecycle scenarios must assert the contract row for "${scenario.step}"`
  );
  runTextReferences(scenario);
}

function asList(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
}

function asListOfObjects(value, label) {
  assert(Array.isArray(value), `${label} must be a list`);
  for (const entry of value) {
    assert(entry && typeof entry === 'object' && !Array.isArray(entry), `${label} entries must be objects`);
  }
  return value;
}

function assertContainsPaths(scenario, entries, expectedPaths, label) {
  const actual = new Set(entries.map((entry) => entry.path || entry.spec).filter(Boolean));
  const missing = expectedPaths.filter((expectedPath) => !actual.has(expectedPath));
  assert.strictEqual(
    missing.length,
    0,
    `scenario ${scenario.id}: ${label} missing required path(s): ${missing.join(', ')}`
  );
}

function assertExistingPath(scenario, relativePath, label) {
  assert(relativePath, `scenario ${scenario.id}: ${label} missing path`);
  const abs = path.resolve(REPO_ROOT, relativePath);
  assert(fs.existsSync(abs), `scenario ${scenario.id}: ${label} path not found: ${relativePath}`);
  return abs;
}

function assertReferencedFileContains(scenario, entry, label) {
  assert(entry && typeof entry === 'object', `scenario ${scenario.id}: ${label} must be an object`);
  const abs = assertExistingPath(scenario, entry.path, label);
  const text = fs.readFileSync(abs, 'utf8');
  for (const needle of asList(entry.contains)) {
    assert(text.includes(needle), `scenario ${scenario.id}: expected ${label} ${entry.path} to contain "${needle}"`);
  }
}

function assertLifecycleCoverage(scenarios) {
  const lifecycleScenarios = scenarios.filter((scenario) => scenario.when === 'lifecycle-step-contract');
  const actual = lifecycleScenarios.map((scenario) => scenario.step);
  const missing = LIFECYCLE_STEPS.filter((step) => !actual.includes(step));
  const unexpected = actual.filter((step) => !LIFECYCLE_STEPS.includes(step));
  const duplicates = actual.filter((step, index) => actual.indexOf(step) !== index);

  assert.strictEqual(
    missing.length,
    0,
    `workflow-conformance must cover every lifecycle step; missing: ${missing.join(', ')}`
  );
  assert.strictEqual(
    unexpected.length,
    0,
    `workflow-conformance has unknown lifecycle step(s): ${unexpected.join(', ')}`
  );
  assert.strictEqual(
    duplicates.length,
    0,
    `workflow-conformance has duplicate lifecycle step scenario(s): ${duplicates.join(', ')}`
  );
}

function main() {
  const scenarios = loadScenarios();
  const seen = new Set();
  assertLifecycleCoverage(scenarios);

  for (const scenario of scenarios) {
    assert(scenario.id, 'scenario is missing `id`');
    assert(!seen.has(scenario.id), `duplicate scenario id in spec.yaml: ${scenario.id}`);
    seen.add(scenario.id);
    assert(scenario.rule, `scenario ${scenario.id}: missing \`rule\``);
    assert(scenario.given, `scenario ${scenario.id}: missing \`given\``);
    assert(scenario.when, `scenario ${scenario.id}: missing \`when\``);
    assert(scenario.then, `scenario ${scenario.id}: missing \`then\``);

    const run = WHEN[scenario.when];
    assert(run, `scenario ${scenario.id}: unknown \`when: ${scenario.when}\``);
    run(scenario);
    console.log(`  ok  ${String(scenario.workflow || '?').padEnd(18)} ${scenario.id}`);
  }

  console.log(`\nPASS workflow-conformance: ${scenarios.length}/${scenarios.length} scenario(s)`);
}

main();
