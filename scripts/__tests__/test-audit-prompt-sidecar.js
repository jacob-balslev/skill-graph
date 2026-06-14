#!/usr/bin/env node
/**
 * Regression: graded audit prompts are sidecar-aware after ADR-0019.
 *
 * Metadata graders must see the joined SKILL.md + audit-state.json source model
 * and the sidecar validity checklist. Otherwise a migrated v8 skill can be
 * falsely reported as missing schema_version/eval_state/routing_eval from
 * SKILL.md frontmatter even though those fields correctly live in the sidecar.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  DIMENSIONS,
  collectContext,
  buildDimensionPrompt,
} = require('../lib/audit-prompt-builder');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else {
    process.stderr.write(`  FAIL  ${msg}\n`);
    failures += 1;
  }
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-prompt-sidecar-'));
const skillDir = path.join(root, 'skills', 'fixture-skill');
fs.mkdirSync(path.join(root, 'skill-audit-loop'), { recursive: true });
fs.mkdirSync(path.join(root, 'schemas'), { recursive: true });
fs.mkdirSync(skillDir, { recursive: true });

fs.writeFileSync(path.join(root, 'skill-audit-loop', 'SKILL_AUDIT_LOOP.md'), `# Intro

# Part 2 — Per-Skill Audit Checklist

### 1. Frontmatter validity

- [ ] \`name\` exists
- [ ] \`scope\` exists

### 1b. Sidecar validity (\`audit-state.json\` — ADR-0019)

- [ ] \`schema_version\` exists and equals \`8\`
- [ ] \`eval_artifacts\`, \`eval_state\`, \`routing_eval\` all exist

### 2. Activation quality

- [ ] activation terms are specific
`);

fs.writeFileSync(
  path.join(root, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json'),
  JSON.stringify({ type: 'object', required: ['name', 'description', 'subject', 'public', 'scope'] }, null, 2),
);
fs.writeFileSync(
  path.join(root, 'schemas', 'skill-audit-state.schema.json'),
  JSON.stringify({ type: 'object', required: ['schema_version', 'owner', 'freshness', 'drift_check', 'eval_artifacts', 'eval_state', 'routing_eval'] }, null, 2),
);

fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---
name: fixture-skill
description: "Fixture proving metadata audit prompts read sidecar fields from audit-state.json."
subject: quality-assurance
public: true
scope: "Fixture for audit prompt sidecar evidence."
---
# Fixture Skill

## Concept of the skill

Fixture content.
`);

fs.writeFileSync(path.join(skillDir, 'audit-state.json'), `${JSON.stringify({
  schema_version: 8,
  owner: 'test-owner',
  freshness: '2026-06-13',
  drift_check: { last_verified: '2026-06-13' },
  eval_artifacts: 'present',
  eval_state: 'passing',
  routing_eval: 'present',
  structural_verdict: 'PASS',
  truth_verdict: 'PASS',
  comprehension_verdict: 'UNVERIFIED',
  application_verdict: 'UNVERIFIED',
}, null, 2)}\n`);

const metadataDimension = DIMENSIONS.find((d) => d.id === 'metadata');
const evalDimension = DIMENSIONS.find((d) => d.id === 'eval');
const context = collectContext({ skillDir, repoRoot: root });

const metadataPrompt = buildDimensionPrompt({ dimension: metadataDimension, context });
const evalPrompt = buildDimensionPrompt({ dimension: evalDimension, context });

assert(metadataPrompt.includes('<audit-state path="audit-state.json">'), 'metadata prompt embeds audit-state sidecar');
assert(metadataPrompt.includes('<joined-metadata source="SKILL.md + audit-state.json">'), 'metadata prompt embeds joined source model');
assert(metadataPrompt.includes('"schema_version": 8'), 'metadata prompt exposes sidecar schema_version');
assert(metadataPrompt.includes('### 1b. Sidecar validity'), 'metadata prompt includes sidecar validity checklist');
assert(metadataPrompt.includes('schemas/skill-audit-state.schema.json'), 'metadata prompt embeds sidecar schema block');
assert(!metadataPrompt.includes('no audit-state.json sidecar on disk'), 'metadata prompt does not use missing-sidecar marker for migrated skill');
assert(evalPrompt.includes('<audit-state path="audit-state.json">'), 'eval prompt still embeds audit-state sidecar');

fs.rmSync(root, { recursive: true, force: true });

if (failures > 0) {
  process.stderr.write(`\ntest-audit-prompt-sidecar: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}

process.stdout.write('\nPASS test-audit-prompt-sidecar: graded prompts read sidecar evidence\n');
