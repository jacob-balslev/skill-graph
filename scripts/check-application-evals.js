#!/usr/bin/env node
'use strict';

/**
 * check-application-evals.js — structural conformance gate for application evals.
 *
 * Validates every `evals/application.json` in the configured skill roots against
 * the binding shape in `schemas/application.schema.json` (v1, SH-6624 / SKI-51):
 * required top-level fields, the `mode: "application"` discriminator, the ≥5-case
 * floor, the per-case required-field set, unique case ids, and the red-herring
 * recommendation. The worked specimen at `examples/evals/application.sample.json`
 * is validated too.
 *
 * WHY THIS EXISTS. The application-eval schema is a binding SPEC doc that the
 * repo previously enforced "by construction + the audit loop" only — there was
 * NO standalone validator. The application runner (`lib/audit/application-eval.js`)
 * deliberately does NOT enforce the case floor at runtime, because a partial
 * `--case` filter must be runnable; and `scripts/check-audit-manifest.js` only
 * checks that the artifact *exists* when a graded `application_verdict` is
 * claimed — it never validates the `cases[]` shape. So an application.json could
 * drift below the floor, lose a required per-case field, or duplicate an id, and
 * nothing would catch it until a grader run failed opaquely. This script closes
 * that gap: it makes the schema mechanically checkable, mirroring how the
 * comprehension shape is covered by `lib/audit/eval-linter.js`.
 *
 * WORK MODE. This is a SYSTEM-mode tool (it reads CONTENT, never writes it). It
 * is report-only by default (exit 0 — the SYSTEM-safe debt ledger) so the SYSTEM
 * `verify:system` gate does not go red purely because corpus application.json
 * files have not yet been migrated to the ≥5-case floor through the audit loop
 * (that migration is CONTENT work, drained via `/audit:*`). The `--check` flag is
 * the opt-in HARD gate (exit 1 on any nonconformance) for use once the corpus has
 * migrated, or in a CONTENT pre-commit that just authored an application.json.
 *
 * Zero external dependencies — Node built-ins only, matching repo policy (no ajv).
 * The check is structural: required-keys + type + enum + cardinality, the same
 * subset the schema's `required`/`minItems`/`enum`/`const` keywords express.
 *
 * Usage:
 *   node scripts/check-application-evals.js                 # report-only (exit 0)
 *   node scripts/check-application-evals.js --check         # hard gate (exit 1 on any finding)
 *   node scripts/check-application-evals.js --json          # machine-readable report
 *   node scripts/check-application-evals.js --skill a11y    # one skill by name
 *   node scripts/check-application-evals.js --strict-floor  # also fail report mode summary on below-floor
 */

const fs = require('fs');
const path = require('path');

const {
  workspaceRoot,
  resolveSkillRoots,
  collectSkillFiles,
  resolveSchemaPath,
} = require('./lib/roots');

// ─── Schema-mirrored constants (kept in lockstep with schemas/application.schema.json) ──
//
// These mirror the schema's keywords so the check stays a Node-built-in structural
// validator (no ajv). If the schema's required sets / enums / floor change, update
// here in the same commit (the schema is the binding contract; this is its checker).
const REQUIRED_TOP = ['skill_name', 'subject', 'mode', 'cases'];
const REQUIRED_CASE = [
  'id',
  'scenario_type',
  'criticality',
  'red_herring',
  'scenario',
  'context',
  'question',
  'expected_flags',
  'expected_fix_hints',
  'absent_signals',
];
const CASE_FLOOR = 5; // schema cases.minItems
const CRITICALITY_ENUM = ['critical', 'high', 'normal', 'low'];
const STRING_ARRAY_CASE_FIELDS = ['expected_flags', 'expected_fix_hints', 'absent_signals'];

// ─── Finding helpers ────────────────────────────────────────────────────────────

function makeFinding(file, severity, code, message) {
  return { file, severity, code, message };
}

/**
 * Validate a single parsed application-eval object against the schema-mirrored
 * structural contract. Returns an array of findings (empty = conformant).
 *
 * Severity scale (workspace canonical 5-level): CRITICAL contract violations that
 * would break the runner or grader; HIGH correctness gaps; MEDIUM the ≥5-case
 * floor (an authoring-contract shortfall that is real but not a hard runner break);
 * LOW the red-herring recommendation (strongly recommended, not required).
 */
function validateApplicationEval(relFile, data) {
  const findings = [];

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    findings.push(makeFinding(relFile, 'CRITICAL', 'not-object', 'Top-level value is not a JSON object.'));
    return findings;
  }

  // Required top-level fields.
  for (const key of REQUIRED_TOP) {
    if (data[key] === undefined) {
      findings.push(makeFinding(relFile, 'CRITICAL', 'missing-top-field', `Missing required top-level field "${key}".`));
    }
  }

  // skill_name shape + directory match.
  if (data.skill_name !== undefined) {
    if (typeof data.skill_name !== 'string' || !/^[a-z][a-z0-9-]+$/.test(data.skill_name)) {
      findings.push(makeFinding(relFile, 'HIGH', 'bad-skill-name', `skill_name "${data.skill_name}" is not kebab-case (^[a-z][a-z0-9-]+$).`));
    } else {
      // The eval file lives at <skill-dir>/evals/application.json; skill_name must
      // match <skill-dir> basename (the schema's stated invariant). The worked
      // specimen at examples/evals/application.sample.json is exempt — it is an
      // illustrative fixture that lives in the tooling repo's examples/ tree, not
      // in a skill directory, so its skill_name names the skill it demonstrates
      // (database-migration), not its parent folder.
      const skillDirName = path.basename(path.dirname(path.dirname(relFile)));
      const isWorkedSpecimen = relFile.replace(/\\/g, '/').startsWith('examples/');
      if (!isWorkedSpecimen && skillDirName && skillDirName !== 'evals' && data.skill_name !== skillDirName) {
        findings.push(makeFinding(relFile, 'HIGH', 'skill-name-dir-mismatch', `skill_name "${data.skill_name}" does not match parent directory "${skillDirName}".`));
      }
    }
  }

  // subject must be a non-empty string.
  if (data.subject !== undefined && (typeof data.subject !== 'string' || data.subject.trim() === '')) {
    findings.push(makeFinding(relFile, 'HIGH', 'bad-subject', 'subject must be a non-empty string.'));
  }

  // mode discriminator.
  if (data.mode !== undefined && data.mode !== 'application') {
    findings.push(makeFinding(relFile, 'CRITICAL', 'bad-mode', `mode must be the literal "application" (got ${JSON.stringify(data.mode)}). An evals[]-shaped file is a comprehension eval — run --mode comprehension instead.`));
  }

  // schema_version, if present, must be a positive integer.
  if (data.schema_version !== undefined && (!Number.isInteger(data.schema_version) || data.schema_version < 1)) {
    findings.push(makeFinding(relFile, 'MEDIUM', 'bad-schema-version', `schema_version must be an integer ≥ 1 (got ${JSON.stringify(data.schema_version)}).`));
  }

  // cases[] — the core.
  if (data.cases === undefined) {
    return findings; // already reported missing-top-field
  }
  if (!Array.isArray(data.cases)) {
    findings.push(makeFinding(relFile, 'CRITICAL', 'cases-not-array', 'cases must be an array (the application layer uses cases[], NOT evals[]).'));
    return findings;
  }

  if (data.cases.length < CASE_FLOOR) {
    findings.push(makeFinding(relFile, 'MEDIUM', 'below-case-floor', `cases has ${data.cases.length} case(s); the schema floor is ${CASE_FLOOR} (mirrors the comprehension gate-8 floor: realistic positives + hard negatives + prior failures).`));
  }

  const seenIds = new Map();
  let hasRedHerring = false;

  data.cases.forEach((testCase, idx) => {
    const where = `cases[${idx}]`;
    if (testCase === null || typeof testCase !== 'object' || Array.isArray(testCase)) {
      findings.push(makeFinding(relFile, 'CRITICAL', 'case-not-object', `${where} is not an object.`));
      return;
    }

    for (const key of REQUIRED_CASE) {
      if (testCase[key] === undefined) {
        findings.push(makeFinding(relFile, 'CRITICAL', 'missing-case-field', `${where} (id=${testCase.id ?? '?'}) missing required field "${key}".`));
      }
    }

    // id: positive integer, unique.
    if (testCase.id !== undefined) {
      if (!Number.isInteger(testCase.id) || testCase.id < 1) {
        findings.push(makeFinding(relFile, 'HIGH', 'bad-case-id', `${where} id must be an integer ≥ 1 (got ${JSON.stringify(testCase.id)}).`));
      } else if (seenIds.has(testCase.id)) {
        findings.push(makeFinding(relFile, 'CRITICAL', 'duplicate-case-id', `${where} duplicates case id ${testCase.id} (first seen at cases[${seenIds.get(testCase.id)}]). The --case filter selects by id, so duplicates are ambiguous.`));
      } else {
        seenIds.set(testCase.id, idx);
      }
    }

    // criticality enum.
    if (testCase.criticality !== undefined && !CRITICALITY_ENUM.includes(testCase.criticality)) {
      findings.push(makeFinding(relFile, 'HIGH', 'bad-criticality', `${where} (id=${testCase.id ?? '?'}) criticality "${testCase.criticality}" not in ${JSON.stringify(CRITICALITY_ENUM)}.`));
    }

    // red_herring boolean.
    if (testCase.red_herring !== undefined && typeof testCase.red_herring !== 'boolean') {
      findings.push(makeFinding(relFile, 'HIGH', 'bad-red-herring', `${where} (id=${testCase.id ?? '?'}) red_herring must be a boolean (got ${JSON.stringify(testCase.red_herring)}).`));
    }
    if (testCase.red_herring === true) hasRedHerring = true;

    // Non-empty string narrative fields.
    for (const key of ['scenario', 'context', 'question']) {
      if (testCase[key] !== undefined && (typeof testCase[key] !== 'string' || testCase[key].trim() === '')) {
        findings.push(makeFinding(relFile, 'HIGH', 'empty-narrative', `${where} (id=${testCase.id ?? '?'}) ${key} must be a non-empty string.`));
      }
    }

    // The three observable-expectation arrays must be arrays of strings.
    for (const key of STRING_ARRAY_CASE_FIELDS) {
      if (testCase[key] !== undefined) {
        if (!Array.isArray(testCase[key])) {
          findings.push(makeFinding(relFile, 'HIGH', 'bad-expectation-array', `${where} (id=${testCase.id ?? '?'}) ${key} must be an array of strings.`));
        } else if (testCase[key].some((s) => typeof s !== 'string' || s.trim() === '')) {
          findings.push(makeFinding(relFile, 'HIGH', 'empty-expectation-entry', `${where} (id=${testCase.id ?? '?'}) ${key} contains an empty/non-string entry.`));
        }
      }
    }
  });

  if (data.cases.length > 0 && !hasRedHerring) {
    findings.push(makeFinding(relFile, 'LOW', 'no-red-herring', 'No red_herring:true case. A real-cases-only suite gives false confidence — at least one hard negative is strongly recommended (agent-eval-design).'));
  }

  return findings;
}

// ─── Discovery ────────────────────────────────────────────────────────────────

/**
 * Find every application.json in the configured skill roots plus the worked
 * specimen. Returns absolute paths.
 */
function discoverApplicationEvals(root, onlySkill) {
  const found = [];

  // Per-skill application.json files (next to each SKILL.md).
  const skillFiles = collectSkillFiles(root);
  for (const { filePath } of skillFiles) {
    const skillDir = path.dirname(filePath);
    if (onlySkill && path.basename(skillDir) !== onlySkill) continue;
    const evalPath = path.join(skillDir, 'evals', 'application.json');
    if (fs.existsSync(evalPath)) found.push(evalPath);
  }

  // The worked specimen lives in the tooling repo, not the skill library.
  if (!onlySkill) {
    const sample = path.join(workspaceRoot(), 'examples', 'evals', 'application.sample.json');
    if (fs.existsSync(sample)) found.push(sample);
  }

  return found.sort((a, b) => a.localeCompare(b));
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

function relTo(root, abs) {
  const rel = path.relative(root, abs);
  return rel.startsWith('..') ? abs : rel;
}

function main(argv) {
  const args = argv.slice(2);
  const hardGate = args.includes('--check');
  const jsonOut = args.includes('--json');
  const strictFloor = args.includes('--strict-floor');
  const skillIdx = args.indexOf('--skill');
  const onlySkill = skillIdx >= 0 ? args[skillIdx + 1] : null;

  const root = workspaceRoot();
  // Confirm the schema is resolvable so a missing schema is a loud SYSTEM error,
  // not a silent skip. We don't parse it for validation (the constants above
  // mirror it), but its presence is the contract anchor.
  const schemaPath = resolveSchemaPath(root, 'application.schema.json');
  if (!fs.existsSync(schemaPath)) {
    console.error(`[check-application-evals] FATAL: schema not found at ${schemaPath}. The validator mirrors schemas/application.schema.json — it must exist.`);
    process.exit(2);
  }

  const skillRoots = resolveSkillRoots(root);
  const files = discoverApplicationEvals(root, onlySkill);

  const report = [];
  for (const abs of files) {
    const rel = relTo(root, abs);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(abs, 'utf8'));
    } catch (e) {
      report.push({ file: rel, findings: [makeFinding(rel, 'CRITICAL', 'parse-error', `JSON parse failed: ${e.message}`)] });
      continue;
    }
    const findings = validateApplicationEval(rel, data);
    report.push({ file: rel, findings });
  }

  const allFindings = report.flatMap((r) => r.findings);
  const conformant = report.filter((r) => r.findings.length === 0).length;
  const nonconformant = report.length - conformant;
  // A "hard" finding is anything above the authoring-shortfall tier (below-floor /
  // red-herring recommendation). Those structural breaks fail the gate; the floor
  // and red-herring findings are corpus-migration debt, reported but not gating
  // unless --strict-floor is set.
  const hardCodes = new Set(allFindings
    .filter((f) => !['below-case-floor', 'no-red-herring'].includes(f.code))
    .map((f) => f.code));
  const hasHardFindings = hardCodes.size > 0;
  const hasFloorFindings = allFindings.some((f) => f.code === 'below-case-floor');

  if (jsonOut) {
    console.log(JSON.stringify({
      schema: relTo(root, schemaPath),
      skill_roots: skillRoots.map((r) => r.absPath),
      total_files: report.length,
      conformant,
      nonconformant,
      findings_total: allFindings.length,
      has_hard_findings: hasHardFindings,
      report,
    }, null, 2));
  } else {
    console.log(`[check-application-evals] schema: ${relTo(root, schemaPath)}`);
    console.log(`[check-application-evals] checked ${report.length} application.json file(s) across ${skillRoots.length} skill root(s)`);
    for (const { file, findings } of report) {
      if (findings.length === 0) continue;
      console.log(`\n  ${file}`);
      for (const f of findings) {
        console.log(`    [${f.severity}] ${f.code}: ${f.message}`);
      }
    }
    if (allFindings.length === 0) {
      console.log('[check-application-evals] OK — every application.json conforms to the schema.');
    } else {
      console.log(`\n[check-application-evals] ${nonconformant}/${report.length} file(s) nonconformant; ${allFindings.length} finding(s) total.`);
      if (hasFloorFindings && !hardGate) {
        console.log('[check-application-evals] NOTE: below-case-floor findings are CONTENT-migration debt (drain via /audit:*) — they do NOT fail report mode. Run with --check (or --strict-floor) to gate on them.');
      }
    }
  }

  // Exit policy:
  //   default (report-only): exit 0 unless a structural break that can't be
  //     CONTENT-migration debt is present (those are real authoring bugs).
  //   --check: exit 1 on ANY finding (the post-migration / CONTENT pre-commit gate).
  //   --strict-floor: also gate on below-floor findings in non-check mode.
  if (hardGate) {
    process.exit(allFindings.length > 0 ? 1 : 0);
  }
  if (hasHardFindings) {
    process.exit(1);
  }
  if (strictFloor && hasFloorFindings) {
    process.exit(1);
  }
  process.exit(0);
}

if (require.main === module) {
  main(process.argv);
}

module.exports = { validateApplicationEval, discoverApplicationEvals, REQUIRED_TOP, REQUIRED_CASE, CASE_FLOOR };
