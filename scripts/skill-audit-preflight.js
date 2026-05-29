#!/usr/bin/env node
/**
 * skill-audit-preflight.js — readiness gate for operating on a skill.
 *
 * WHY: agents (and the audit loop) keep starting an operation on a skill without first
 * checking the skill actually HAS what that operation needs — the right schema version,
 * the required metadata fields, the Understanding fields, a valid comprehension.json,
 * an application.json, etc. The symptom is exactly the recurring failure this tool fixes:
 * "I want to run X on skill Y" → halfway in, Y is missing the eval/fields X requires.
 *
 * This is the PRE-RUN companion to scripts/watch-audit-batch.sh (the during-run Monitor
 * wrapper): preflight readiness BEFORE the run, heartbeat monitoring DURING it.
 *
 * It reads the LIVE schema (schemas/SKILL_METADATA_PROTOCOL_schema.json) as the contract —
 * not a hardcoded field list — so it stays correct as the schema evolves. Frontmatter is
 * parsed via the shared parse-frontmatter (handles BOTH the flat top-level encoding and the
 * nested `metadata:` encoding).
 *
 * USAGE
 *   node scripts/skill-audit-preflight.js <skill-name|path> [--for <op>] [--json] [--ensure]
 *
 *   --for v8|comprehension|application|pairwise|all   operation to gate for (default: all)
 *   --json     machine-readable readiness object
 *   --ensure   apply the DETERMINISTIC remediations (create evals/ dir, scaffold a
 *              schema-valid comprehension.json SKELETON with clearly-marked TODO cases),
 *              and print the ordered plan for the gaps that need Opus authoring via /audit:*.
 *
 * EXIT CODES
 *   0  ready for the requested operation
 *   2  gaps remain (see report / remediation plan)
 *   3  error (skill not found, schema unreadable)
 *
 * OPERATIONS and what each needs:
 *   v8            all schema `required` fields present + valid `subject`/`deployment_target` enums
 *   comprehension v8 + comprehension_state:present + 5 Understanding fields + evals/comprehension.json
 *                 valid (skill_name, subject, evals, >=7 cases per the audit doctrine)
 *   application   evals/application.json present + valid-shaped
 *   pairwise      a non-empty SKILL.md body (always runnable); reports whether audit/eval/provenance
 *                 metadata is present to strip (the with-vs-without-metadata experiment needs it)
 *   all           the union; "ready" means ready for every operation above
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { parseFrontmatter, normalizeFrontmatter } = require('../lib/audit/parse-frontmatter');

const REPO = path.resolve(__dirname, '..');
const LIB = path.resolve(REPO, '..', 'skills', 'skills'); // canonical skill library
const SCHEMA_PATH = path.join(REPO, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
const COMPREHENSION_MIN_CASES = 7; // audit doctrine floor (schema minItems is 5; doctrine wants >=7)
const UNDERSTANDING_FIELDS = ['mental_model', 'purpose', 'boundary', 'analogy', 'misconception'];

// audit/eval/provenance fields — the "bloat" the with-vs-without-metadata experiment strips.
const BLOAT_FIELDS = [
  'eval_artifacts', 'eval_state', 'routing_eval', 'drift_check', 'drift_status',
  'lint_verdict', 'last_audited', 'structural_verdict', 'truth_verdict',
  'comprehension_verdict', 'application_verdict', 'schema_version', 'owner', 'freshness',
  'skill_graph_source_repo', 'skill_graph_project', 'skill_graph_canonical_skill',
];

function parseArgs(argv) {
  const o = { skill: null, for: 'all', json: false, ensure: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--for') o.for = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--ensure') o.ensure = true;
    else if (!a.startsWith('--') && !o.skill) o.skill = a;
  }
  return o;
}

/** Locate a skill's directory: an explicit path, else by name in the canonical library. */
function locateSkillDir(nameOrPath) {
  if (nameOrPath.includes('/') && fs.existsSync(nameOrPath)) {
    const stat = fs.statSync(nameOrPath);
    return stat.isDirectory() ? nameOrPath : path.dirname(nameOrPath);
  }
  const hits = execSync(
    `find ${JSON.stringify(LIB)} -type d -name ${JSON.stringify(nameOrPath)} 2>/dev/null || true`,
    { encoding: 'utf8' },
  ).trim().split('\n').filter(Boolean);
  for (const h of hits) if (fs.existsSync(path.join(h, 'SKILL.md'))) return h;
  return null;
}

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; } }

function loadSchema() {
  const s = readJson(SCHEMA_PATH);
  if (!s) { console.error(`[preflight] cannot read schema at ${SCHEMA_PATH}`); process.exit(3); }
  return s;
}

/** Build the readiness object for a skill against the schema. */
function assess(skillDir, schema) {
  const skillName = path.basename(skillDir);
  const mdPath = path.join(skillDir, 'SKILL.md');
  const raw = fs.readFileSync(mdPath, 'utf8');
  const fm = normalizeFrontmatter(parseFrontmatter(raw)) || {};
  const body = raw.split(/^---$/m).slice(2).join('---').trim();

  const required = schema.required || [];
  const props = schema.properties || {};
  const subjectEnum = (props.subject || {}).enum || [];
  const dtEnum = (props.deployment_target || {}).enum || [];

  // --- structural (v8) ---
  const missingRequired = required.filter((k) => fm[k] === undefined || fm[k] === null || fm[k] === '');
  const subjectValid = fm.subject !== undefined && subjectEnum.includes(fm.subject);
  const dtValid = fm.deployment_target !== undefined && dtEnum.includes(fm.deployment_target);
  const v8 = {
    ok: missingRequired.length === 0 && subjectValid && dtValid,
    schema_version: fm.schema_version,
    missing_required: missingRequired,
    subject: fm.subject, subject_valid: subjectValid,
    deployment_target: fm.deployment_target, deployment_target_valid: dtValid,
  };

  // --- comprehension ---
  const comprehensionState = fm.comprehension_state;
  const understandingPresent = UNDERSTANDING_FIELDS.filter((k) => fm[k] !== undefined && fm[k] !== '');
  const understandingMissing = UNDERSTANDING_FIELDS.filter((k) => !understandingPresent.includes(k));
  const legacyConcept = fm.concept && typeof fm.concept === 'object';
  const cPath = path.join(skillDir, 'evals', 'comprehension.json');
  const cJson = readJson(cPath);
  const cCases = cJson && Array.isArray(cJson.evals) ? cJson.evals.length : 0;
  const cShapeOk = !!cJson && !!cJson.skill_name && !!cJson.subject && Array.isArray(cJson.evals);
  const comprehension = {
    ok: v8.ok
      && comprehensionState === 'present'
      && (understandingMissing.length === 0 || legacyConcept)
      && cShapeOk && cCases >= COMPREHENSION_MIN_CASES,
    comprehension_state: comprehensionState || 'absent',
    understanding_fields_present: understandingPresent,
    understanding_fields_missing: legacyConcept ? [] : understandingMissing,
    legacy_concept_block: !!legacyConcept,
    comprehension_json_exists: !!cJson,
    comprehension_json_shape_ok: cShapeOk,
    comprehension_cases: cCases,
    comprehension_cases_required: COMPREHENSION_MIN_CASES,
  };

  // --- application ---
  const aPath = path.join(skillDir, 'evals', 'application.json');
  const aJson = readJson(aPath);
  const aShapeOk = !!aJson && (Array.isArray(aJson.evals) || Array.isArray(aJson.cases));
  const application = {
    ok: aShapeOk,
    application_json_exists: !!aJson,
    application_json_shape_ok: aShapeOk,
  };

  // --- pairwise (with-vs-without-metadata experiment) ---
  const bloatPresent = BLOAT_FIELDS.filter((k) => fm[k] !== undefined && fm[k] !== '');
  const pairwise = {
    ok: body.length > 0,
    body_nonempty: body.length > 0,
    bloat_fields_present: bloatPresent,
    has_bloat_to_strip: bloatPresent.length > 0,
  };

  return {
    skill: skillName, dir: skillDir,
    audit_status: {
      structural_verdict: fm.structural_verdict, truth_verdict: fm.truth_verdict,
      comprehension_verdict: fm.comprehension_verdict, application_verdict: fm.application_verdict,
      eval_state: fm.eval_state, eval_artifacts: fm.eval_artifacts,
    },
    operations: { v8, comprehension, application, pairwise },
  };
}

/** Ordered remediation plan for the gaps of one operation. Distinguishes deterministic vs Opus-authoring. */
function remediation(op, a) {
  const r = [];
  const o = a.operations;
  if ((op === 'v8' || op === 'all') && !o.v8.ok) {
    if (o.v8.missing_required.length) r.push({ kind: 'authoring', op: 'v8', action: `Author missing required fields: ${o.v8.missing_required.join(', ')}`, command: `/audit:improve --skill ${a.skill}  # add each missing required field` });
    if (!o.v8.subject_valid) r.push({ kind: 'authoring', op: 'v8', action: `Set a valid subject (currently ${JSON.stringify(o.v8.subject)})`, command: `/audit:improve --skill ${a.skill} --field subject` });
    if (!o.v8.deployment_target_valid) r.push({ kind: 'authoring', op: 'v8', action: `Set a valid deployment_target (currently ${JSON.stringify(o.v8.deployment_target)})`, command: `/audit:improve --skill ${a.skill} --field deployment_target` });
  }
  if ((op === 'comprehension' || op === 'all') && !o.comprehension.ok) {
    if (o.comprehension.comprehension_state !== 'present') r.push({ kind: 'authoring', op: 'comprehension', action: 'Set comprehension_state: present', command: `/audit:improve --skill ${a.skill} --field comprehension_state` });
    if (o.comprehension.understanding_fields_missing.length) r.push({ kind: 'authoring', op: 'comprehension', action: `Author Understanding fields: ${o.comprehension.understanding_fields_missing.join(', ')} (+ matching Concept Card in body)`, command: `/audit:improve --skill ${a.skill}  # author each Understanding field` });
    if (!o.comprehension.comprehension_json_exists) r.push({ kind: 'scaffold+authoring', op: 'comprehension', action: `Create evals/comprehension.json with >=${COMPREHENSION_MIN_CASES} dimension-tagged cases (--ensure scaffolds a TODO skeleton; an agent fills the cases)`, command: `node scripts/skill-audit-preflight.js ${a.skill} --for comprehension --ensure` });
    else if (o.comprehension.comprehension_cases < COMPREHENSION_MIN_CASES) r.push({ kind: 'authoring', op: 'comprehension', action: `comprehension.json has ${o.comprehension.comprehension_cases} cases; need >=${COMPREHENSION_MIN_CASES}`, command: `# add cases to ${path.join(a.dir, 'evals/comprehension.json')}` });
    else if (!o.comprehension.comprehension_json_shape_ok) r.push({ kind: 'authoring', op: 'comprehension', action: 'comprehension.json missing skill_name/subject/evals', command: `# fix shape of ${path.join(a.dir, 'evals/comprehension.json')}` });
  }
  if ((op === 'application' || op === 'all') && !o.application.ok) {
    r.push({ kind: 'scaffold+authoring', op: 'application', action: 'Create evals/application.json (--ensure scaffolds a TODO skeleton; an agent fills the cases)', command: `node scripts/skill-audit-preflight.js ${a.skill} --for application --ensure` });
  }
  return r;
}

/** Deterministic remediations only: create evals/ dir + schema-valid SKELETON files with TODO cases. */
function ensure(op, a) {
  const done = [];
  const evalsDir = path.join(a.dir, 'evals');
  const needC = (op === 'comprehension' || op === 'all') && !a.operations.comprehension.comprehension_json_exists;
  const needA = (op === 'application' || op === 'all') && !a.operations.application.application_json_exists;
  if (needC || needA) fs.mkdirSync(evalsDir, { recursive: true });
  if (needC) {
    const dims = ['definition', 'mental_model', 'purpose', 'boundary', 'taxonomy', 'application', 'application'];
    const skeleton = {
      skill_name: a.skill,
      subject: a.operations.v8.subject || 'TODO-subject',
      _SCAFFOLD: 'TODO: replace placeholder cases with real scenarios. Authored by an agent, not this script.',
      evals: dims.map((d, i) => ({
        id: i + 1, dimension: d, criticality: 'TODO', truth_mode: 'conceptual_correctness_plus_repo_application',
        prompt: `TODO scenario #${i + 1} testing the ${d} dimension of ${a.skill}.`,
        expected: 'TODO: what a correct answer must contain.',
        negative_expectation: 'TODO: what the answer must NOT say (catches filtering/softening).',
      })),
    };
    fs.writeFileSync(path.join(evalsDir, 'comprehension.json'), JSON.stringify(skeleton, null, 2) + '\n');
    done.push(`scaffolded evals/comprehension.json (${dims.length} TODO cases — agent must fill via /audit:*)`);
  }
  if (needA) {
    const skeleton = {
      skill_name: a.skill,
      _SCAFFOLD: 'TODO: replace placeholder cases with real application tasks. Authored by an agent, not this script.',
      evals: [{ id: 1, task: `TODO realistic task where ${a.skill} should change behavior.`, rubric: 'TODO scoring rubric.' }],
    };
    fs.writeFileSync(path.join(evalsDir, 'application.json'), JSON.stringify(skeleton, null, 2) + '\n');
    done.push('scaffolded evals/application.json (1 TODO case — agent must fill via /audit:*)');
  }
  return done;
}

function fmt(a, opSel, plan, ensured) {
  const L = [];
  L.push(`\n=== Skill Audit Preflight: ${a.skill} ===`);
  L.push(`dir: ${a.dir}`);
  L.push(`schema_version: ${a.operations.v8.schema_version}  |  audit status: structural=${a.audit_status.structural_verdict} truth=${a.audit_status.truth_verdict} comprehension=${a.audit_status.comprehension_verdict} application=${a.audit_status.application_verdict}`);
  const row = (label, ok, detail) => L.push(`  [${ok ? 'PASS' : 'GAP '}] ${label.padEnd(14)} ${detail}`);
  const o = a.operations;
  row('v8', o.v8.ok, o.v8.ok ? 'all required fields + valid enums' : `missing: ${o.v8.missing_required.join(', ') || '(enums)'}${o.v8.subject_valid ? '' : ' [subject invalid]'}${o.v8.deployment_target_valid ? '' : ' [deployment_target invalid]'}`);
  row('comprehension', o.comprehension.ok, `state=${o.comprehension.comprehension_state} understanding=${o.comprehension.understanding_fields_present.length}/5 comprehension.json=${o.comprehension.comprehension_json_exists ? `${o.comprehension.comprehension_cases} cases` : 'MISSING'}`);
  row('application', o.application.ok, o.application.application_json_exists ? 'application.json present' : 'application.json MISSING');
  row('pairwise', o.pairwise.ok, `body=${o.pairwise.body_nonempty ? 'ok' : 'EMPTY'} bloat-to-strip=${o.pairwise.bloat_fields_present.length} fields`);
  if (ensured && ensured.length) { L.push('\n  --ensure applied:'); ensured.forEach((d) => L.push(`    + ${d}`)); }
  if (plan.length) {
    L.push(`\n  Remediation plan for "${opSel}" (deterministic = run with --ensure; authoring = needs an agent via /audit:*):`);
    plan.forEach((p, i) => L.push(`   ${i + 1}. [${p.kind}] ${p.action}\n        ${p.command}`));
  } else {
    L.push(`\n  READY for "${opSel}".`);
  }
  return L.join('\n');
}

function main() {
  const o = parseArgs(process.argv.slice(2));
  if (!o.skill) { console.error('usage: skill-audit-preflight.js <skill-name|path> [--for v8|comprehension|application|pairwise|all] [--json] [--ensure]'); process.exit(3); }
  const dir = locateSkillDir(o.skill);
  if (!dir) { console.error(`[preflight] skill not found: ${o.skill} (searched ${LIB})`); process.exit(3); }
  const schema = loadSchema();
  let a = assess(dir, schema);
  let ensured = [];
  if (o.ensure) { ensured = ensure(o.for, a); a = assess(dir, schema); } // re-assess after scaffolding
  const plan = remediation(o.for, a);
  const ready = o.for === 'all'
    ? Object.values(a.operations).every((x) => x.ok)
    : a.operations[o.for] && a.operations[o.for].ok;

  if (o.json) {
    console.log(JSON.stringify({ ...a, requested: o.for, ready, ensured, remediation: plan }, null, 2));
  } else {
    console.log(fmt(a, o.for, plan, ensured));
  }
  process.exit(ready ? 0 : 2);
}

main();
