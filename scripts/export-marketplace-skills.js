#!/usr/bin/env node
/**
 * Generate the public marketplace SKILL.md export surface.
 *
 * This script keeps Skill Metadata Protocol files authoritative under
 * skills/<name>/SKILL.md and writes plain SKILL.md exports under
 * marketplace/skills/<name>/SKILL.md for release to SKILL.md marketplaces.
 *
 * The generated surface is intentionally checked here, not by convention:
 *   - every exported skill is plain Agent Skills shape
 *   - every description fits the 1024-character marketplace limit
 *   - every exported skill carries Skill Graph provenance metadata
 *   - generated markdown links resolve or point back to the canonical repo
 *   - generated text is scanned for private/local/personal/token-like signals
 *
 * Usage:
 *   node scripts/export-marketplace-skills.js
 *   node scripts/export-marketplace-skills.js --check
 *   node scripts/export-marketplace-skills.js --validate-only
 *   node scripts/export-marketplace-skills.js --output marketplace
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');
const { workspaceRoot } = require('./lib/roots');
const { buildExportedSkill, normalizeExportName } = require('./export-skill');
const { validateExportedFrontmatter } = require('./verify-skill-md-export');
const { checkFile } = require('./check-markdown-links');

const REPO_ROOT = workspaceRoot();
const DEFAULT_SOURCE_DIR = path.join(REPO_ROOT, 'skills');
const DEFAULT_OUTPUT_ROOT = path.join(REPO_ROOT, 'marketplace');
const MARKETPLACE_DESCRIPTION_LIMIT = 1024;
const SKILL_GRAPH_SOURCE_REPO = 'https://github.com/jacob-balslev/skill-graph';
const SKILL_GRAPH_PROTOCOL = 'Skill Metadata Protocol v4';
const SKILL_GRAPH_PROJECT = 'Skill Graph';
const RELEASE_TARGET_REPO = 'jacob-balslev/skills';

const PROVENANCE_KEYS = [
  'skill_graph_source_repo',
  'skill_graph_protocol',
  'skill_graph_project',
  'skill_graph_canonical_skill',
];

const EXPORT_DESCRIPTION_OVERRIDES = {
  'conceptual-modeling': 'Use when translating business requirements into a structured domain model before database schemas, API endpoints, or DDD aggregates are named. Covers entities, attributes, relationships, cardinality, specialization/generalization, aggregation/composition, roles, abstraction levels, stakeholder validation, and modeling anti-patterns such as implementation leakage, god entities, phantom relationships, premature normalization, attribute-as-entity, and unnamed relationships. Do NOT use for database ER diagrams with keys and normalization, formal ontology axioms with OWL/RDFS, or DDD tactical design; use those dedicated skills instead.',
  'context-graph': 'Use when designing or auditing the multi-graph context architecture of an AI-coding workspace: skill graph, document routing graph, memory index, script registry, and the cross-graph edges between them. Covers edge typing, orphan detection, connectivity health, deterministic graph synthesis signals, change-propagation checks, and drift or hub-and-spoke anti-patterns. Do NOT use for authoring one SKILL.md (use `skill-scaffold`), validating one skill (use `graph-audit`), live routing decisions (use `skill-router`), context-window budgeting (use `context-window`), or session load/drop choices (use `context-management`).',
  'contract-testing': 'Use when verifying the interface between two services or components by capturing the consumer\'s expectations as a contract artifact and verifying the provider satisfies it. Covers the consumer-driven contracts pattern (Fowler 2006; Pact), the contrast with schema-only validation (OpenAPI/JSON Schema captures shape, not behavioral expectations), the broker as the integration point between consumer and provider deploy schedules, two-phase verification (consumer-side mocks; provider-side replay), the difference between contract testing (verifies the interface) and integration testing (verifies the implementation through it), and how contract tests replace brittle cross-service e2e. Do NOT use for in-system integration (use `integration-test-design`), full user-journey testing (use `e2e-test-design`), single-unit testing (use `testing-strategy` + `test-doubles-design`), or pure OpenAPI schema validation (API-spec tooling).',
  'context-management': 'Use when deciding what to load into an active agent session, recovering from context drift, preparing compaction or restart, distilling raw inputs into a working summary, or writing a handoff another agent can resume quickly. Covers intake triage, the six-step context-management loop, working-set shaping, evidence-first loading, drift signals, anti-drift rules, compaction-ready handoffs, and selective rebuild after context loss. Do NOT use for token math (use `context-window`), prompt wording (use `prompt-craft`), persistent memory curation, or multi-graph context architecture (use `context-graph`).',
  'context-window': 'Use when allocating context-window budget across system, skill-injection, working, and output zones; monitoring context health; deciding when to compact; preserving state before compaction; recovering after compaction; or choosing strategies for 1M, 200K, or 128K context windows. Covers zone budgets, practical model-budget tables, the 80% compaction rule, pre/post-compact protocols, persistence hierarchy, operation token costs, and token-reduction techniques. Do NOT use for deciding what information belongs in the working set (use `context-management`), prompt design (use `prompt-craft`), graph architecture (use `context-graph`), or memory curation.',
  'error-tracking': 'Use when designing or extending an application exception-reporting pipeline: error boundary placement, tracker SDK wrappers, sanitized reporting calls, environment gating, user context without PII leaks, breadcrumbs, and verification that each layer reports correctly. Covers component, route, global, and manual capture surfaces plus central `reportError`/`reportMessage` patterns. Do NOT use for the visual error UX shown to users (use `a11y` and interaction skills), chasing one captured error (use `debugging`), or broad privacy and retention policy (use `owasp-security`).',
  'knowledge-modeling': 'Use when choosing the representation paradigm for domain knowledge: knowledge graph, frame, production rule, semantic network, concept map, procedural ontology, or hybrid. Covers knowledge acquisition from tacit to explicit, graph design principles, validation types, lifecycle states, AI-agent context systems, skills as frames, routing as rules, memory as graph, and GraphRAG patterns such as entity-anchored retrieval, relationship-aware context, path reasoning, subgraph summaries, and hybrid vector+graph retrieval. Do NOT use for human-readable domain analysis (`conceptual-modeling`), ER/database design, pure taxonomy work, formal ontology axioms, or live skill-library tooling (`skill-infrastructure`).',
  'pattern-recognition': 'Use when auditing for recurring issues, clustering errors, detecting drift from conventions, or when an agent keeps fixing symptoms instead of root causes. Covers the Observe -> Cluster -> Name -> Codify -> Detect -> Prevent loop, grep-based audits, normalize-then-hash error clustering, board-health patterns, design-token and heading drift, domain-encoding patterns, eval-as-pattern-tests, 5 Whys, pattern lifecycle states, and drift traps. Do NOT use for one-off bug localization without recurrence, or for designing the classification system itself; this skill detects violations of conventions that already exist.',
  'performance-testing': 'Use when measuring a system\'s non-functional properties — latency, throughput, error rate, resource utilization — by running it under controlled load and verifying against explicit SLO thresholds. Covers the five primitives (load profile, workload, latency metric, throughput metric, SLO target), the load-shape taxonomy (smoke, load, stress, spike, soak, breakpoint), the latency-percentile vocabulary (p50, p95, p99, p99.9) and why average latency misleads, the tool ecosystem (k6, JMeter, Locust, Gatling, Vegeta), and the offline-vs-observability distinction. Do NOT use for the optimization activity itself (use `performance-engineering`), declaring the threshold contract (use `performance-budgets`), runtime measurement of deployed systems (use `observability` or `error-tracking`), microbenchmarks of single functions (language benchmark tools), chaos engineering (use `chaos-engineering`), or test-suite quality measurement (use `mutation-testing`).',
  'problem-locating-solving': 'Use when locating a bug in an unfamiliar codebase, tracing a failure from symptom to source, or choosing between candidate fixes after the symptom is observed but before a patch lands. Covers the locate-to-solve workflow: problem-statement contract, search-space reduction, boundary-based fault localization, good-vs-bad path comparison, binary search through a call chain, minimal repro, root-cause isolation, fix option comparison, blast-radius review, and post-fix verification. Do NOT use for broad task planning once the bug is localized, test-pyramid design, or performance forensics.',
  'semantic-relations': 'Use when typing edges in a knowledge graph or concept map, resolving synonym/antonym/polysemy/homonym confusion, testing whether a connection is IS-A, PART-OF, causal, thematic, or vague, explaining adjacent concepts, or auditing whether hierarchy and skill-boundary decisions use the wrong relation type. Covers taxonomic, associative, and thematic relations plus symmetry, asymmetry, transitivity, reflexivity, and irreflexivity. Do NOT use for formal ontology axioms with reasoning constraints, database foreign-key or junction-table design, or operational data correspondence across systems.',
};

const PRIVACY_PATTERNS = [
  {
    id: 'windows_user_path',
    message: 'local Windows user path',
    regex: /\b[A-Za-z]:[\\/]+Users[\\/]+[^ \t\r\n"')]+/g,
  },
  {
    id: 'posix_user_path',
    message: 'local macOS user path',
    regex: /(^|[\s"'(])\/Users\/[^ \t\r\n"')]+/g,
  },
  {
    id: 'linux_home_path',
    message: 'local Linux home path',
    regex: /(^|[\s"'(])\/home\/[^\/\s"')]+\/[^ \t\r\n"')]+/g,
  },
  {
    id: 'email_address',
    message: 'email address',
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  },
  {
    id: 'private_key',
    message: 'private key block',
    regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    id: 'known_secret_prefix',
    message: 'token-like secret prefix',
    regex: /\b(?:AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|shpat_[A-Za-z0-9]{20,}|shpss_[A-Za-z0-9]{20,}|napi_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
  },
  {
    id: 'local_artifact_path',
    message: 'local-only artifact path',
    regex: /(^|[\s"'(])(?:\.artifacts|\.research|\.roundtable|audits\/_state|audits\\_state)(?:[\/\\]|$)/gi,
  },
  {
    id: 'private_project_name',
    message: 'known private project name',
    regex: /\b(?:placeholder-project-name|boardmeeting|free-oppression-data)\b/gi,
  },
];

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function isExternalTarget(target) {
  return /^(?:https?:|mailto:|tel:|ftp:|data:|javascript:)/i.test(target);
}

function splitMarkdownTarget(rawTarget) {
  let target = rawTarget.trim();
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
  const hashIdx = target.indexOf('#');
  if (hashIdx === -1) return { pathPart: target, anchor: '' };
  return {
    pathPart: target.slice(0, hashIdx),
    anchor: target.slice(hashIdx),
  };
}

function canonicalRepoUrlForLink(sourceRelPath, pathPart, anchor) {
  const sourceDir = path.posix.dirname(sourceRelPath);
  const normalized = path.posix.normalize(path.posix.join(sourceDir, pathPart));
  if (!normalized || normalized.startsWith('../') || normalized === '..') return null;
  return `${SKILL_GRAPH_SOURCE_REPO}/blob/main/${normalized}${anchor || ''}`;
}

function rewriteLocalMarkdownLinksToCanonicalRepo(text, sourceRelPath) {
  return text.replace(/(!?\[[^\]\n]*\]\()([^) \n]+)(\))/g, (match, prefix, rawTarget, suffix) => {
    const { pathPart, anchor } = splitMarkdownTarget(rawTarget);
    if (!pathPart || isExternalTarget(pathPart) || pathPart.startsWith('#')) return match;
    const url = canonicalRepoUrlForLink(sourceRelPath, pathPart, anchor);
    return url ? `${prefix}${url}${suffix}` : match;
  });
}

function collectCanonicalSkills(sourceDir = DEFAULT_SOURCE_DIR) {
  const skills = [];
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillDir = path.join(sourceDir, entry.name);
    const skillMd = path.join(skillDir, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;
    const text = fs.readFileSync(skillMd, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      throw new Error(`Source skill has no parseable frontmatter: ${repoRelative(skillMd)}`);
    }
    skills.push({
      dirName: entry.name,
      sourcePath: skillMd,
      sourceRelPath: repoRelative(skillMd),
      text,
      fm,
    });
  }
  return skills.sort((a, b) => String(a.fm.name).localeCompare(String(b.fm.name)));
}

function provenanceForSkill(sourceRelPath) {
  return {
    skill_graph_source_repo: SKILL_GRAPH_SOURCE_REPO,
    skill_graph_protocol: SKILL_GRAPH_PROTOCOL,
    skill_graph_project: SKILL_GRAPH_PROJECT,
    skill_graph_canonical_skill: sourceRelPath,
  };
}

function exportDescriptionForSkill(skill) {
  const sourceDescription = skill.fm.description || '';
  const override = EXPORT_DESCRIPTION_OVERRIDES[skill.fm.name];

  if (sourceDescription.length > MARKETPLACE_DESCRIPTION_LIMIT) {
    if (!override) {
      throw new Error(
        `${skill.sourceRelPath} description is ${sourceDescription.length} characters; add an export-specific override`
      );
    }
    if (override.length > MARKETPLACE_DESCRIPTION_LIMIT) {
      throw new Error(
        `${skill.fm.name} export description is ${override.length} characters; limit is ${MARKETPLACE_DESCRIPTION_LIMIT}`
      );
    }
    return {
      description: override,
      shortened: true,
      sourceLength: sourceDescription.length,
    };
  }

  if (override) {
    throw new Error(
      `${skill.fm.name} has an export description override but the canonical description is within the limit`
    );
  }

  return {
    description: sourceDescription,
    shortened: false,
    sourceLength: sourceDescription.length,
  };
}

function buildMarketplaceSkillText(skill) {
  const description = exportDescriptionForSkill(skill);
  const metadata = provenanceForSkill(skill.sourceRelPath);
  if (description.shortened) {
    metadata.skill_graph_export_description = 'shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract';
    metadata.skill_graph_canonical_description_length = String(description.sourceLength);
  }
  const exported = buildExportedSkill(skill.text, {
    description: description.description,
    metadata,
  });
  if (!exported) throw new Error(`Unable to export ${skill.sourceRelPath}`);
  return rewriteLocalMarkdownLinksToCanonicalRepo(exported, skill.sourceRelPath);
}

function generatedReadme(skillCount) {
  return [
    '# Skill Graph Marketplace Export',
    '',
    'This directory is generated from the canonical Skill Metadata Protocol source in `skills/`.',
    'Do not edit generated files here by hand; run `node scripts/export-marketplace-skills.js` from the canonical repo.',
    '',
    `Canonical source repo: ${SKILL_GRAPH_SOURCE_REPO}`,
    `Release target repo: ${RELEASE_TARGET_REPO}`,
    `Generated public skills: ${skillCount}`,
    '',
    'Each skill under `skills/<name>/SKILL.md` is a plain Agent Skills-compatible export.',
    'Protocol fields are preserved as string values under `metadata`, with factual Skill Graph provenance.',
    '',
    'After the release target is published, install with:',
    '',
    '```bash',
    `npx skills add ${RELEASE_TARGET_REPO}`,
    '```',
    '',
  ].join('\n');
}

function expectedSurfaceFiles(outputRoot) {
  const skills = collectCanonicalSkills();
  const files = new Map();
  files.set(path.join(outputRoot, 'README.md'), generatedReadme(skills.length));

  for (const skill of skills) {
    const exportName = normalizeExportName(skill.fm.name);
    const dest = path.join(outputRoot, 'skills', exportName, 'SKILL.md');
    files.set(dest, buildMarketplaceSkillText(skill));
  }

  return { skills, files };
}

function assertSafeOutputRoot(outputRoot) {
  const resolved = path.resolve(outputRoot);
  const rel = path.relative(REPO_ROOT, resolved);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Refusing to write marketplace export outside a repo subdirectory: ${outputRoot}`);
  }
  const first = rel.split(path.sep)[0];
  const blocked = new Set(['.git', 'bin', 'docs', 'examples', 'schemas', 'scripts', 'skills']);
  if (blocked.has(first)) {
    throw new Error(`Refusing to use protected repo directory as marketplace output: ${rel}`);
  }
  return resolved;
}

function writeSurface(outputRoot, expectedFiles) {
  assertSafeOutputRoot(outputRoot);
  fs.rmSync(outputRoot, { recursive: true, force: true });
  for (const [filePath, text] of expectedFiles) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, text, 'utf8');
  }
}

function collectGeneratedSkillFiles(outputRoot) {
  const skillsDir = path.join(outputRoot, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
    if (fs.existsSync(skillMd)) files.push(skillMd);
  }
  return files.sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
}

function scanPrivacyText(text, filePath) {
  const findings = [];
  for (const pattern of PRIVACY_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      findings.push({
        file: repoRelative(filePath),
        line: lineForIndex(text, match.index),
        id: pattern.id,
        message: pattern.message,
        match: String(match[0]).trim().slice(0, 120),
      });
      if (match.index === pattern.regex.lastIndex) pattern.regex.lastIndex++;
    }
  }
  return findings;
}

function validateGeneratedSurface(outputRoot, expectedSkills = null) {
  const errors = [];
  const privacyFindings = [];
  const markdownFailures = [];
  const skillFiles = collectGeneratedSkillFiles(outputRoot);
  const expectedByName = new Map(
    (expectedSkills || collectCanonicalSkills()).map(skill => [normalizeExportName(skill.fm.name), skill])
  );

  if (skillFiles.length !== expectedByName.size) {
    errors.push(`expected ${expectedByName.size} exported skills, found ${skillFiles.length}`);
  }

  const seen = new Set();
  const readme = path.join(outputRoot, 'README.md');
  const markdownFiles = fs.existsSync(readme) ? [readme, ...skillFiles] : skillFiles;

  for (const filePath of markdownFiles) {
    const text = fs.readFileSync(filePath, 'utf8');
    privacyFindings.push(...scanPrivacyText(text, filePath));
    for (const linkError of checkFile(filePath)) {
      markdownFailures.push({
        file: repoRelative(filePath),
        line: linkError.line,
        message: linkError.message,
        target: linkError.target,
      });
    }
  }

  for (const skillMd of skillFiles) {
    const parentName = path.basename(path.dirname(skillMd));
    seen.add(parentName);
    const text = fs.readFileSync(skillMd, 'utf8');
    const fm = parseFrontmatter(text);
    if (!fm) {
      errors.push(`${repoRelative(skillMd)} has no parseable frontmatter`);
      continue;
    }

    const shape = validateExportedFrontmatter(fm);
    for (const error of shape.errors) {
      errors.push(`${repoRelative(skillMd)}: ${error}`);
    }

    if (fm.name !== parentName) {
      errors.push(`${repoRelative(skillMd)}: exported name "${fm.name}" does not match parent directory "${parentName}"`);
    }

    if (typeof fm.description !== 'string' || fm.description.length > MARKETPLACE_DESCRIPTION_LIMIT) {
      errors.push(
        `${repoRelative(skillMd)}: description length ${(fm.description || '').length} exceeds ${MARKETPLACE_DESCRIPTION_LIMIT}`
      );
    }

    if (!fm.metadata || typeof fm.metadata !== 'object') {
      errors.push(`${repoRelative(skillMd)}: missing metadata provenance`);
      continue;
    }

    for (const key of PROVENANCE_KEYS) {
      if (typeof fm.metadata[key] !== 'string' || fm.metadata[key].length === 0) {
        errors.push(`${repoRelative(skillMd)}: missing metadata.${key}`);
      }
    }

    const expectedSkill = expectedByName.get(parentName);
    if (!expectedSkill) {
      errors.push(`${repoRelative(skillMd)}: no matching canonical skill`);
      continue;
    }
    if (fm.metadata.skill_graph_canonical_skill !== expectedSkill.sourceRelPath) {
      errors.push(
        `${repoRelative(skillMd)}: metadata.skill_graph_canonical_skill must be ${expectedSkill.sourceRelPath}`
      );
    }
  }

  for (const expectedName of expectedByName.keys()) {
    if (!seen.has(expectedName)) errors.push(`missing exported skill ${expectedName}`);
  }

  for (const finding of privacyFindings) {
    errors.push(`${finding.file}:${finding.line}: privacy ${finding.id}: ${finding.message} (${finding.match})`);
  }

  for (const failure of markdownFailures) {
    errors.push(`${failure.file}:${failure.line}: markdown link ${failure.message} (${failure.target})`);
  }

  return {
    ok: errors.length === 0,
    errors,
    skillCount: skillFiles.length,
  };
}

function checkSurface(outputRoot, expectedFiles) {
  const errors = [];
  const expectedPaths = new Set([...expectedFiles.keys()].map(filePath => path.resolve(filePath)));

  for (const [filePath, expectedText] of expectedFiles) {
    if (!fs.existsSync(filePath)) {
      errors.push(`missing generated file ${repoRelative(filePath)}`);
      continue;
    }
    const actual = fs.readFileSync(filePath, 'utf8');
    if (actual !== expectedText) {
      errors.push(`stale generated file ${repoRelative(filePath)}`);
    }
  }

  if (fs.existsSync(outputRoot)) {
    const stack = [outputRoot];
    while (stack.length > 0) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          stack.push(abs);
        } else if (!expectedPaths.has(path.resolve(abs))) {
          errors.push(`unexpected generated file ${repoRelative(abs)}`);
        }
      }
    }
  }

  return errors;
}

function parseArgs(argv) {
  const options = {
    outputRoot: DEFAULT_OUTPUT_ROOT,
    check: false,
    validateOnly: false,
    json: false,
    quiet: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--check') {
      options.check = true;
    } else if (arg === '--validate-only') {
      options.validateOnly = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--quiet') {
      options.quiet = true;
    } else if (arg === '--output') {
      if (!argv[i + 1]) throw new Error('--output requires a path');
      options.outputRoot = path.resolve(argv[++i]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/export-marketplace-skills.js [options]

Options:
  --output <dir>    Marketplace output root. Default: marketplace
  --check           Do not write; fail if generated files are missing or stale
  --validate-only   Validate an existing generated surface only
  --json            Print JSON summary
  --quiet           Suppress success text
  --help            Show this help
`);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exit(0);
    }

    const outputRoot = assertSafeOutputRoot(options.outputRoot);
    const expected = options.validateOnly ? null : expectedSurfaceFiles(outputRoot);
    const errors = [];

    if (options.check) {
      errors.push(...checkSurface(outputRoot, expected.files));
    } else if (!options.validateOnly) {
      writeSurface(outputRoot, expected.files);
    }

    const validation = validateGeneratedSurface(outputRoot, expected ? expected.skills : null);
    errors.push(...validation.errors);

    const result = {
      output: repoRelative(outputRoot),
      canonical_skills: expected ? expected.skills.length : collectCanonicalSkills().length,
      exported_skills: validation.skillCount,
      ok: errors.length === 0,
      errors,
    };

    if (options.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (!options.quiet) {
      for (const error of errors) process.stderr.write(`FAIL ${error}\n`);
      if (errors.length === 0) {
        const mode = options.check ? 'checked' : options.validateOnly ? 'validated' : 'generated';
        process.stdout.write(`OK   marketplace export ${mode}: ${validation.skillCount} skill(s) in ${repoRelative(outputRoot)}\n`);
      }
    }

    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    process.stderr.write(`ERROR ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  EXPORT_DESCRIPTION_OVERRIDES,
  MARKETPLACE_DESCRIPTION_LIMIT,
  PRIVACY_PATTERNS,
  PROVENANCE_KEYS,
  RELEASE_TARGET_REPO,
  SKILL_GRAPH_PROTOCOL,
  SKILL_GRAPH_PROJECT,
  SKILL_GRAPH_SOURCE_REPO,
  buildMarketplaceSkillText,
  collectCanonicalSkills,
  exportDescriptionForSkill,
  provenanceForSkill,
  rewriteLocalMarkdownLinksToCanonicalRepo,
  scanPrivacyText,
  validateGeneratedSurface,
};

if (require.main === module) main();
