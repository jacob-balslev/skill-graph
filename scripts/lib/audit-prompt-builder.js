'use strict';

/**
 * audit-prompt-builder.js — per-dimension prompt composition for skill-audit.js --graded.
 *
 * Builds the context and prompts for the seven scorecard dimensions defined in
 * SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist. The audit runner calls an external
 * grader CLI for each dimension, collects the structured
 * verdicts, and merges them into findings.md / verdict.md / scorecard.md.
 *
 * This file is self-contained. It only uses Node built-ins and does not depend
 * on any specific provider — the grader CLI is resolved by the caller.
 */

const fs   = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./parse-frontmatter');
const { resolveSkillRoots, resolveTruthSourcePath, collectSkillFiles } = require('./roots');
// ADR-0019: a skill is SKILL.md frontmatter + a sibling audit-state.json sidecar. The
// audit/eval/provenance fields (eval_artifacts, eval_state, portability, the four verdicts)
// live in the sidecar. The graders must read the JOINED view, never raw frontmatter.
const { readSidecar, joinSidecar } = require('./audit-state-sidecar');

// ---------------------------------------------------------------------------
// Dimension registry
// ---------------------------------------------------------------------------

/**
 * The seven dimensions mirror the scorecard rows in
 * SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist § Standard Artifact Structure, so the
 * grader output slots directly into the existing scorecard.md shape.
 *
 * `checklistAnchor` is the section heading (without the leading "### ") in
 * the single-skill audit checklist that defines the pass criteria for the
 * dimension. The prompt builder extracts the bullet list under that heading
 * and injects it as the "pass criteria" block.
 *
 * `appliesWhen` is an optional predicate that takes the parsed frontmatter
 * and returns true/false. If it returns false, the dimension is graded as
 * N/A and no grader call is made (e.g. grounding for scope: portable).
 */
const DIMENSIONS = [
  {
    id: 'metadata',
    label: 'Metadata validity',
    checklistAnchor: '1. Frontmatter validity',
    appliesWhen: () => true,
  },
  {
    id: 'activation',
    label: 'Activation quality',
    checklistAnchor: '2. Activation quality',
    appliesWhen: () => true,
  },
  {
    id: 'relation',
    label: 'Relation quality',
    checklistAnchor: '3. Relation quality',
    appliesWhen: () => true,
  },
  {
    id: 'grounding',
    label: 'Grounding fidelity',
    checklistAnchor: '4. Grounding quality',
    // v8: project anchoring is carried by non-empty project[]; public is only
    // publishability. Keep retired deployment_target/scope checks for back-compat
    // with unmigrated skills.
    appliesWhen: (fm) => fm && (
      (Array.isArray(fm.project) && fm.project.length > 0) ||
      fm.deployment_target === 'project' ||
      fm.scope === 'codebase' ||
      (fm.grounding && fm.grounding.grounding_mode === 'repo_specific')
    ),
  },
  {
    id: 'content',
    label: 'Content quality',
    checklistAnchor: '5. Content quality',
    appliesWhen: () => true,
  },
  {
    id: 'eval',
    label: 'Eval quality',
    checklistAnchor: '6. Eval quality',
    appliesWhen: () => true,
  },
  {
    id: 'portability',
    label: 'Portability quality',
    checklistAnchor: '7. Portability quality',
    appliesWhen: () => true,
  },
];

// ---------------------------------------------------------------------------
// Context collection
// ---------------------------------------------------------------------------

const DEFAULT_TRUTH_SOURCE_CHAR_LIMIT = 6000;
const DEFAULT_EVAL_ARTIFACT_CHAR_LIMIT = 12000;
const DEFAULT_SCHEMA_CHAR_LIMIT = 20000;
const DEFAULT_NEIGHBOR_CHAR_LIMIT = 800;
const EVAL_ARTIFACTS_DIR_REL = path.join('examples', 'evals');
const SCHEMA_REL = path.join('schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
const SKILLS_DIR_REL = 'skills';
const EXPORT_SCRIPT_REL = path.join('scripts', 'export-skill.js');
// The single-skill audit checklist lives in SKILL_AUDIT_LOOP.md § Part 2. The doc moved
// into the skill-audit-loop/ folder in the 2026-05-31 reorg (SH-6652): the old code
// joined the whole reference string "SKILL_AUDIT_LOOP.md § Part 2 — …" as a FILENAME at
// the repo root, which never existed — a latent ENOENT crash whenever this builder ran.
const CHECKLIST_REL = path.join('skill-audit-loop', 'SKILL_AUDIT_LOOP.md');
const CHECKLIST_SECTION_ANCHOR = '# Part 2 — Per-Skill Audit Checklist';

/**
 * Read the skill, its truth sources, its eval artifacts, and the checklist.
 * Returns the payload the prompt builder needs. Reads are bounded so a single
 * massive file does not explode the prompt budget.
 *
 * Eval artifact discovery mirrors the lint contract in `scripts/skill-lint.js`
 * (checkEvalCoherence): scan `<repoRoot>/examples/evals/*.json` and collect
 * every file whose parsed JSON has `skill_name === frontmatter.name`. Only
 * runs when `frontmatter.eval_artifacts === 'present'` — `planned` / `none` /
 * missing frontmatter all produce an empty `evalArtifacts` array.
 *
 * @param {object} opts
 * @param {string} opts.skillDir        Absolute path to the skill directory.
 * @param {string} opts.repoRoot        Absolute path to the repo root.
 * @param {number} [opts.truthSourceCharLimit] Per-file character cap for truth sources.
 * @param {number} [opts.evalArtifactCharLimit] Per-file character cap for eval artifacts.
 * @returns {{
 *   skillName: string,
 *   skillBody: string,
 *   frontmatter: object|null,
 *   truthSources: Array<{ path: string, content: string, truncated: boolean }>,
 *   evalArtifacts: Array<{ path: string, content: string, truncated: boolean }>,
 *   checklist: string,
 * }}
 */
function collectContext(opts) {
  const {
    skillDir,
    repoRoot,
    truthSourceCharLimit = DEFAULT_TRUTH_SOURCE_CHAR_LIMIT,
    evalArtifactCharLimit = DEFAULT_EVAL_ARTIFACT_CHAR_LIMIT,
  } = opts;

  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillBody = fs.readFileSync(skillFile, 'utf8');
  const frontmatter = parseFrontmatter(skillBody);

  // ADR-0019 join: eval_artifacts / eval_state / portability / the four verdicts moved to
  // the sibling audit-state.json. Read the sidecar and compute the JOINED view (frontmatter
  // wins on collision, sidecar fills the moved fields). A missing sidecar is the honest
  // unmigrated/new case — readSidecar→null, joinSidecar→frontmatter unchanged, never a crash.
  const sidecar = readSidecar(skillFile);
  const joined = joinSidecar(frontmatter || {}, sidecar);

  const truthSources = [];
  const declared = (frontmatter && frontmatter.grounding && Array.isArray(frontmatter.grounding.truth_sources))
    ? frontmatter.grounding.truth_sources
    : [];

  // Truth sources are resolved against the configured skill roots, not blindly
  // against repoRoot. Post-monorepo-split, the canonical skill library lives in
  // a sibling repo (../skills/skills), so a `skills/…`-prefixed truth_source
  // must resolve there — resolving it relative to the tooling repoRoot would
  // emit a false "grounding drift" for every codebase-scoped skill. Tooling-repo
  // paths (examples/evals/…, scripts/…) and URLs fall through to repoRoot
  // resolution unchanged. (SH-6129)
  const skillRoots = resolveSkillRoots(repoRoot);

  for (const relPath of declared) {
    const abs = resolveTruthSourcePath(String(relPath), repoRoot, skillRoots);
    if (!fs.existsSync(abs)) {
      truthSources.push({ path: relPath, content: '[file not found — grounding drift]', truncated: false });
      continue;
    }
    const raw = fs.readFileSync(abs, 'utf8');
    const truncated = raw.length > truthSourceCharLimit;
    const content = truncated ? raw.slice(0, truthSourceCharLimit) + '\n\n[…truncated]' : raw;
    truthSources.push({ path: relPath, content, truncated });
  }

  const evalArtifacts = collectEvalArtifacts({
    frontmatter,
    joined,
    skillDir,
    repoRoot,
    charLimit: evalArtifactCharLimit,
  });

  // E1: active schema. Embedded on the `metadata` dimension so the grader can
  // cross-check every required field, enum, and conditional rule without
  // relying on recall. Truncated defensively — current schema is ~12KB.
  const schemaContent = readFileBounded(
    path.join(repoRoot, SCHEMA_REL),
    DEFAULT_SCHEMA_CHAR_LIMIT
  );

  // E2: neighbor skill summaries. Every skill referenced in
  // `relations.*` becomes a short
  // summary block {name, type, scope, description} so the `relation` dimension
  // grader can judge whether the linkage targets a semantically correct peer
  // (not merely whether the name exists — that's already a lint check).
  const neighborSummaries = collectNeighborSummaries({
    frontmatter,
    repoRoot,
    charLimit: DEFAULT_NEIGHBOR_CHAR_LIMIT,
  });

  // E4: portability export transform. The sole supported target is
  // `skill-md` and the transform lives at scripts/export-skill.js.
  // We pass a boolean so the `portability` dimension can note whether the
  // transform ships — the grader uses this to judge "export targets are
  // realistic" concretely rather than speculatively.
  const exportTransformAvailable = fs.existsSync(path.join(repoRoot, EXPORT_SCRIPT_REL));

  const checklistPath = path.join(repoRoot, CHECKLIST_REL);
  if (!fs.existsSync(checklistPath)) {
    throw new Error(
      `audit-prompt-builder: per-skill audit checklist not found at ${checklistPath} `
      + '(SKILL_AUDIT_LOOP.md § Part 2). It is required to build the grader prompt.',
    );
  }
  const checklistFull = fs.readFileSync(checklistPath, 'utf8');
  // Extract the "Part 2 — Per-Skill Audit Checklist" section: from its `# ` anchor to
  // the next top-level (`# `) heading or EOF. If the anchor was renamed/moved, fall back
  // to the whole doc rather than crash — the grader still gets the checklist content.
  const checklist = (() => {
    const lines = checklistFull.split('\n');
    const start = lines.findIndex((l) => l.trim() === CHECKLIST_SECTION_ANCHOR);
    if (start === -1) return checklistFull;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^# /.test(lines[i])) { end = i; break; }
    }
    return lines.slice(start, end).join('\n');
  })();

  const skillName = path.basename(skillDir);
  return {
    skillName,
    skillBody,
    frontmatter,
    auditState: sidecar || null,
    truthSources,
    evalArtifacts,
    schemaContent,
    neighborSummaries,
    exportTransformAvailable,
    checklist,
  };
}

/**
 * Read a file and truncate it to `charLimit` characters. Returns `null` if the
 * file does not exist. Used for optional context blocks that should fail
 * quietly — the grader prompt then emits an explicit "absent" marker instead.
 */
function readFileBounded(absPath, charLimit) {
  if (!fs.existsSync(absPath)) return null;
  try {
    const raw = fs.readFileSync(absPath, 'utf8');
    return raw.length > charLimit ? raw.slice(0, charLimit) + '\n\n[…truncated]' : raw;
  } catch (_) {
    return null;
  }
}

/**
 * Collect summary blocks for every sibling skill referenced in this skill's
 * relations. Each summary is `{name, type, scope, description}` — enough to
 * judge semantic neighborhood without embedding full sibling SKILL.md bodies.
 *
 * Supports polymorphic relation items: `boundary` and `disjoint_with` may be
 * bare strings or `{skill, reason}` objects; `depends_on` may be a bare string
 * or `{skill, min_version}` object.
 * The target name is extracted from both shapes identically to
 * `scripts/skill-lint.js#checkRelationTargets`.
 *
 * Silent on missing peers — the lint check already fails on dangling relation
 * targets, so the grader does not need to duplicate that error class.
 */
function collectNeighborSummaries({ frontmatter, repoRoot, charLimit }) {
  if (!frontmatter || !frontmatter.relations) return [];

  const rels = frontmatter.relations;
  const kinds = [
    'adjacent',
    'related',
    'broader',
    'narrower',
    'boundary',
    'disjoint_with',
    'verify_with',
    'depends_on',
  ];
  const targetsByKind = new Map();
  const allTargets = new Set();

  for (const kind of kinds) {
    const list = Array.isArray(rels[kind]) ? rels[kind] : [];
    const names = [];
    for (const item of list) {
      let name = null;
      if (typeof item === 'string') name = item;
      else if (item && typeof item === 'object' && typeof item.skill === 'string') name = item.skill;
      if (name && name !== frontmatter.name) {
        names.push(name);
        allTargets.add(name);
      }
    }
    if (names.length > 0) targetsByKind.set(kind, names);
  }

  if (allTargets.size === 0) return [];

  // Build a name → SKILL.md path index by walking the configured skill roots
  // recursively. This mirrors the SH-6129 fix for grounding.truth_sources: the
  // canonical library lives at ../skills/skills/<category>/<name>/SKILL.md (a
  // nested sibling layout), so a flat path.join(repoRoot, "skills", name,
  // "SKILL.md") always misses and every neighbor summary is silently dropped.
  // resolveSkillRoots + collectSkillFiles handle both the default flat layout
  // and the configured nested sibling layout transparently. (SH-6317)
  const skillFileEntries = collectSkillFiles(repoRoot);
  const nameToSkillMd = new Map();
  for (const entry of skillFileEntries) {
    // Derive the skill name from the immediate parent directory of SKILL.md.
    const skillName = path.basename(path.dirname(entry.filePath));
    if (!nameToSkillMd.has(skillName)) {
      nameToSkillMd.set(skillName, entry.filePath);
    }
  }
  // Fallback: also check the flat repoRoot/skills/<name>/SKILL.md layout in
  // case collectSkillFiles returns nothing (e.g., skill roots not configured).
  // This keeps behaviour identical to the pre-fix code when the sibling library
  // is absent, and satisfies the silent-skip-for-truly-missing contract.
  if (nameToSkillMd.size === 0) {
    const skillsRoot = path.join(repoRoot, SKILLS_DIR_REL);
    if (!fs.existsSync(skillsRoot)) return [];
  }

  const out = [];
  for (const name of Array.from(allTargets).sort()) {
    let skillMd = nameToSkillMd.get(name);
    // If the index didn't find it, try the flat fallback layout so we still
    // skip cleanly for skills that genuinely don't exist.
    if (!skillMd) {
      skillMd = path.join(repoRoot, SKILLS_DIR_REL, name, 'SKILL.md');
    }
    if (!fs.existsSync(skillMd)) continue;
    let body;
    try {
      body = fs.readFileSync(skillMd, 'utf8');
    } catch (_) {
      continue;
    }
    const fm = parseFrontmatter(body);
    if (!fm || !fm.name) continue;

    const description = typeof fm.description === 'string'
      ? (fm.description.length > charLimit ? fm.description.slice(0, charLimit) + '…' : fm.description)
      : '';

    // Discover which of the caller's relation kinds reference this neighbor.
    const relatedVia = [];
    for (const [kind, names] of targetsByKind) {
      if (names.includes(name)) relatedVia.push(kind);
    }

    out.push({
      name:        fm.name,
      type:        fm.type || null,
      scope:       fm.scope || null,
      description,
      relatedVia,  // ["related"], ["boundary", "verify_with"], etc.
    });
  }

  return out;
}

/**
 * Discover and read the eval artifacts associated with a skill.
 *
 * Resolution order (A1 fix — the grader was reading the legacy path only):
 *   1. PER-SKILL: `skills/<name>/evals/{comprehension,application}.json` — the canonical
 *      per-skill location. On-disk presence is ground truth: these files are included
 *      whenever they exist, regardless of the `eval_artifacts` flag, because a stale flag
 *      must never hide an eval that is actually shipped. This was the symptom — a skill with
 *      8+7 cases on disk + `eval_artifacts: present` graded "no eval file exists".
 *   2. LEGACY FALLBACK: every `<repoRoot>/examples/evals/*.json` whose parsed JSON has
 *      `skill_name === frontmatter.name` (the old `checkEvalCoherence` contract). Used only
 *      when no per-skill file is found, and gated on the JOINED `eval_artifacts === 'present'`
 *      flag (A2 fix — `eval_artifacts` is a sidecar field post-ADR-0019, so gating on raw
 *      `frontmatter.eval_artifacts` false-failed every migrated skill).
 *
 * Malformed JSON files are skipped silently — they surface as a lint error
 * elsewhere and should not break the grader run.
 *
 * @param {object} args
 * @param {object|null} args.frontmatter Parsed frontmatter from the skill.
 * @param {object|null} [args.joined]    Joined frontmatter+sidecar view (sidecar-aware flag).
 * @param {string} [args.skillDir]       Absolute path to the skill directory (per-skill evals).
 * @param {string} args.repoRoot         Absolute repo root.
 * @param {number} args.charLimit        Per-file character cap.
 * @returns {Array<{ path: string, content: string, truncated: boolean }>}
 */
function collectEvalArtifacts({ frontmatter, joined, skillDir, repoRoot, charLimit }) {
  const name = frontmatter && frontmatter.name;
  const out = [];

  const bound = (raw) => {
    const truncated = raw.length > charLimit;
    return { content: truncated ? raw.slice(0, charLimit) + '\n\n[…truncated]' : raw, truncated };
  };

  // 1. Per-skill canonical location — on-disk truth, flag-independent.
  if (skillDir) {
    const leaf = name || path.basename(skillDir);
    for (const fileName of ['comprehension.json', 'application.json']) {
      const abs = path.join(skillDir, 'evals', fileName);
      if (!fs.existsSync(abs)) continue;
      let raw;
      try { raw = fs.readFileSync(abs, 'utf8'); } catch (_) { continue; }
      try { JSON.parse(raw); } catch (_) { continue; } // malformed → lint error elsewhere, skip
      const { content, truncated } = bound(raw);
      out.push({ path: path.posix.join('skills', leaf, 'evals', fileName), content, truncated });
    }
  }
  if (out.length > 0) return out;

  // 2. Legacy fallback — examples/evals/*.json, gated on the sidecar-aware joined flag.
  const flag = (joined && joined.eval_artifacts) || (frontmatter && frontmatter.eval_artifacts);
  if (flag !== 'present' || !name) return out;

  const evalsDir = path.join(repoRoot, EVAL_ARTIFACTS_DIR_REL);
  if (!fs.existsSync(evalsDir)) return out;

  let files;
  try {
    files = fs.readdirSync(evalsDir).filter(f => f.endsWith('.json')).sort();
  } catch (_) {
    return out;
  }

  for (const fileName of files) {
    const abs = path.join(evalsDir, fileName);
    let raw;
    try {
      raw = fs.readFileSync(abs, 'utf8');
    } catch (_) {
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      continue; // malformed eval files surface as lint errors, not grader breakage
    }
    if (!parsed || parsed.skill_name !== name) continue;

    const { content, truncated } = bound(raw);
    const relPath = path.posix.join(EVAL_ARTIFACTS_DIR_REL.split(path.sep).join('/'), fileName);
    out.push({ path: relPath, content, truncated });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Checklist slicing
// ---------------------------------------------------------------------------

/**
 * Extract the checklist bullet list under a given H3 anchor.
 *
 * The checklist file formats each dimension as:
 *
 *   ### 2. Activation quality
 *
 *   - [ ] description names real trigger scenarios
 *   - [ ] keywords are not empty for routable skills
 *   ...
 *
 *   ### 3. Relation quality
 *
 * This function returns the bullets under the matching anchor, stopping at
 * the next H2 or H3.
 *
 * @param {string} checklist Full checklist markdown.
 * @param {string} anchor    Section title without the leading "### ".
 * @returns {string} The bullet block, or an empty string if anchor not found.
 */
function sliceChecklist(checklist, anchor) {
  const lines = checklist.split('\n');
  const startPattern = new RegExp(`^###\\s+${escapeRegex(anchor)}\\s*$`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startPattern.test(lines[i])) { start = i + 1; break; }
  }
  if (start === -1) return '';

  const out = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    if (/^###\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Prompt composition
// ---------------------------------------------------------------------------

const VERDICT_ENUM = ['PASS', 'PASS WITH FIXES', 'PARTIAL', 'FAIL', 'N/A'];

// v0.5.0: align with the evaluation-doctrine principle that a task is not
// "Done" until per-dimension scores are >= 4. This constant is the min-pass
// threshold on the 1–5 dimension score. Exposed for overrides via
// `skill-audit.js --min-pass-score <n>`.
const MIN_PASS_SCORE = 4;
const SEVERITY_ENUM = ['P0', 'P1', 'P2', 'P3', 'P4'];

/**
 * Compose the grader prompt for a single dimension. Follows the
 * IDENTITY → STEPS → INPUT → OUTPUT structure from skills/prompt-craft.
 *
 * The prompt is evidence-first and forces a single <verdict>...</verdict>
 * JSON block with a fixed schema so the parser is deterministic.
 *
 * @param {object} opts
 * @param {object} opts.dimension  One element of DIMENSIONS.
 * @param {object} opts.context    Output of collectContext().
 * @returns {string} The full prompt text.
 */
function buildDimensionPrompt(opts) {
  const { dimension, context } = opts;
  const {
    skillName,
    skillBody,
    auditState,
    truthSources,
    evalArtifacts,
    schemaContent,
    neighborSummaries,
    exportTransformAvailable,
    checklist,
  } = context;
  const criteria = sliceChecklist(checklist, dimension.checklistAnchor) || '[checklist anchor not found]';

  const truthBlock = truthSources.length === 0
    ? '(no truth_sources declared in frontmatter — grounding block is absent or empty)'
    : truthSources.map(ts => [
        `<truth-source path="${ts.path}"${ts.truncated ? ' truncated="true"' : ''}>`,
        ts.content.trim(),
        '</truth-source>',
      ].join('\n')).join('\n\n');

  // Eval artifacts are embedded only for the `eval` dimension. Other dimensions
  // do not need them and including them everywhere would inflate every prompt.
  // When a skill declares `eval_artifacts: present` but no matching file is
  // found on disk, we still emit the section with an explicit missing marker
  // so the grader can flag the drift rather than silently assume absence.
  const includeEvalBlock = dimension.id === 'eval';
  const evalArtifactsArr = Array.isArray(evalArtifacts) ? evalArtifacts : [];
  const evalBlock = !includeEvalBlock
    ? null
    : (evalArtifactsArr.length === 0
        ? '(no eval artifact found — checked skills/<name>/evals/{comprehension,application}.json and the legacy examples/evals/*.json. Either none are shipped, or audit-state.json `eval_artifacts` is not `present`. Read the <audit-state> block for the declared eval_artifacts / eval_state value before concluding absence — those fields live in the sidecar, not the SKILL.md body.)'
        : evalArtifactsArr.map(ea => [
            `<eval-artifact path="${ea.path}"${ea.truncated ? ' truncated="true"' : ''}>`,
            ea.content.trim(),
            '</eval-artifact>',
          ].join('\n')).join('\n\n'));

  // E1: active schema. Embedded only on the `metadata` dimension — other
  // dimensions don't need to re-verify field definitions and embedding 12KB
  // of schema on every call would waste tokens.
  const includeSchemaBlock = dimension.id === 'metadata';
  const schemaBlock = !includeSchemaBlock
    ? null
    : (schemaContent
        ? `<schema path="${SCHEMA_REL}">\n${schemaContent.trim()}\n</schema>`
        : `<schema path="${SCHEMA_REL}">(schema file not found at this path — grader should flag this as infrastructure drift)</schema>`);

  // E2: neighbor summaries. Embedded only on the `relation` dimension so the
  // grader can judge semantic adjacency against actual peer metadata rather
  // than recall. Empty when the skill has no relations.
  const includeNeighborBlock = dimension.id === 'relation';
  const neighbors = Array.isArray(neighborSummaries) ? neighborSummaries : [];
  const neighborBlock = !includeNeighborBlock
    ? null
    : (neighbors.length === 0
        ? '(this skill declares no relations — nothing to cross-check)'
        : neighbors.map(n => [
            `<neighbor name="${n.name}" type="${n.type || 'unknown'}" scope="${n.scope || 'unknown'}" related-via="${(n.relatedVia || []).join(',')}">`,
            n.description,
            '</neighbor>',
          ].join('\n')).join('\n\n'));

  // E4: export transform reference. Embedded only on the `portability`
  // dimension. The sole supported target is `skill-md` and the transform
  // lives at scripts/export-skill.js. Stating whether the script exists
  // converts the `readiness: scripted` claim from self-report to verifiable.
  const includePortabilityBlock = dimension.id === 'portability';
  const portabilityBlock = !includePortabilityBlock
    ? null
    : (exportTransformAvailable
        ? `<export-transform path="${EXPORT_SCRIPT_REL}" available="true">\nThe export transform exists on disk. Run \`node ${EXPORT_SCRIPT_REL} skills/${skillName}\` to produce a SKILL.skill-md.md with only SKILL.md base fields at the top level. Only \`skill-md\` is a valid portability.targets value today; other runtimes (cursor, windsurf, copilot, agents-md) are deferred per v0.3.0 CHANGELOG.\n</export-transform>`
        : `<export-transform path="${EXPORT_SCRIPT_REL}" available="false">\nThe export transform script is missing from the repo. A skill declaring \`portability.readiness: scripted\` while the transform is absent is over-claiming — flag this as a contract violation.\n</export-transform>`);

  // ADR-0019: the eval & portability graders must see the audit-state.json sidecar —
  // eval_artifacts, eval_state, portability, and the four verdicts live there, NOT in the
  // SKILL.md body embedded below. Without this block the grader inspects frontmatter only
  // and false-reports "no portability block" / "eval_artifacts not present" for every
  // migrated skill (A2). Embedded on the two dimensions that actually read those fields.
  const includeAuditStateBlock = dimension.id === 'eval' || dimension.id === 'portability';
  const auditStateBlock = !includeAuditStateBlock
    ? null
    : (auditState
        ? `<audit-state path="audit-state.json">\n${JSON.stringify(auditState, null, 2)}\n</audit-state>`
        : '<audit-state>(no audit-state.json sidecar on disk — this skill is not yet migrated to the ADR-0019 sidecar, so eval_artifacts / eval_state / portability / verdicts are genuinely absent. That is the honest unmigrated state, NOT over-claiming — judge accordingly.)</audit-state>');

  // STEPS are composed dynamically per dimension so only the context sources
  // the grader actually has are referenced. This keeps the step count honest
  // (no "read the schema" when no schema block is present) and the numbering
  // contiguous — important for LLMs that interpret step numbers literally.
  const steps = [
    `1. Read the SKILL.md body for the skill named \`${skillName}\`.`,
    '2. Read the truth_source files listed in the skill\'s frontmatter (if any).',
  ];
  let n = 3;
  if (includeSchemaBlock) {
    steps.push(`${n++}. Read the embedded <schema> — this is the active Skill Graph JSON Schema that every field must conform to.`);
  }
  if (includeNeighborBlock) {
    steps.push(`${n++}. Read the <neighbor-skills> summaries — each is a sibling skill this one links to via relations. Judge whether the linkage is semantically correct.`);
  }
  if (includeEvalBlock) {
    steps.push(`${n++}. Read the eval artifacts embedded in <eval-artifacts> — these are the authored evaluation cases for this skill.`);
  }
  if (includePortabilityBlock) {
    steps.push(`${n++}. Read the <export-transform> note — it states whether the SKILL.md export script actually ships and how to invoke it.`);
  }
  if (includeAuditStateBlock) {
    steps.push(`${n++}. Read the <audit-state> block — it carries the skill's audit-state.json sidecar (eval_artifacts, eval_state, portability, the four verdicts). These fields live in the sidecar, NOT the SKILL.md body above; judge eval/portability claims against it, never against the body alone.`);
  }
  steps.push(`${n++}. Read the pass criteria for dimension "${dimension.label}".`);
  steps.push(`${n++}. For each checklist bullet, mark PASS, PASS WITH FIXES, or FAIL with a quoted evidence snippet.`);
  steps.push(`${n++}. Aggregate into one dimension verdict and a 1–5 score (5 = state of the art, 1 = broken).`);
  steps.push(`${n++}. Produce a finding row for every checklist bullet that is not a full PASS.`);

  // Evidence-sources clause reflects whichever blocks are embedded — the
  // grader is constrained to cite only what it can see.
  const evidenceParts = ['the skill', 'a truth source'];
  if (includeSchemaBlock)     evidenceParts.push('the schema');
  if (includeNeighborBlock)   evidenceParts.push('a neighbor summary');
  if (includeEvalBlock)       evidenceParts.push('an eval artifact');
  if (includePortabilityBlock) evidenceParts.push('the export-transform note');
  if (includeAuditStateBlock) evidenceParts.push('the audit-state sidecar');
  const evidenceSources = evidenceParts.length === 2
    ? evidenceParts.join(' or ')
    : evidenceParts.slice(0, -1).join(', ') + ', or ' + evidenceParts[evidenceParts.length - 1];

  const inputSections = [
    `<skill-name>${skillName}</skill-name>`,
    '',
    '<skill-body>',
    skillBody.trim(),
    '</skill-body>',
    '',
    '<truth-sources>',
    truthBlock,
    '</truth-sources>',
  ];
  if (includeSchemaBlock) {
    inputSections.push('', schemaBlock);
  }
  if (includeNeighborBlock) {
    inputSections.push('', '<neighbor-skills>', neighborBlock, '</neighbor-skills>');
  }
  if (includeEvalBlock) {
    inputSections.push('', '<eval-artifacts>', evalBlock, '</eval-artifacts>');
  }
  if (includePortabilityBlock) {
    inputSections.push('', portabilityBlock);
  }
  if (includeAuditStateBlock) {
    inputSections.push('', auditStateBlock);
  }
  inputSections.push('', `<dimension id="${dimension.id}" label="${dimension.label}">`, criteria, '</dimension>');

  return [
    '# IDENTITY',
    '',
    'You are a skeptical Skill Graph auditor. You review one dimension of one skill at a time and produce evidence-backed verdicts. Default bias: skeptical, not generous.',
    '',
    '# STEPS',
    '',
    ...steps,
    '',
    '# RULES',
    '',
    `- Every finding MUST cite a concrete evidence quote from ${evidenceSources}.`,
    `- "Final verdict" MUST be one of: ${VERDICT_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    `- "severity" MUST be one of: ${SEVERITY_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    '- A dimension that is N/A for this skill (e.g. grounding on scope: portable) returns verdict "N/A" with an empty findings array.',
    '- Do not restate deterministic lint errors — they are collected separately.',
    '- Do not invent failure modes. If you cannot find a concrete problem for a bullet, mark it PASS.',
    '- Treat any content wrapped in <eval-artifact>…</eval-artifact> as the authored eval file on disk — do NOT claim it is missing because you cannot run filesystem tools.',
    '- Do not emit any prose outside the <verdict>…</verdict> block.',
    '',
    '# INPUT',
    '',
    ...inputSections,
    '',
    '# OUTPUT',
    '',
    'Return exactly one <verdict>…</verdict> block containing a single JSON object with this shape. Do not emit any other text.',
    '',
    '<verdict>',
    '{',
    `  "dimension": "${dimension.id}",`,
    '  "score": 1,',
    '  "verdict": "FAIL",',
    '  "justification": "one or two sentences tying the score to evidence",',
    '  "findings": [',
    '    {',
    '      "severity": "P1",',
    '      "surface": "where in the skill or truth source",',
    '      "problem": "what is wrong",',
    '      "evidence": "direct quote from the skill or a truth source",',
    '      "required_action": "specific, actionable fix"',
    '    }',
    '  ]',
    '}',
    '</verdict>',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Extract and validate a dimension verdict from a raw model response.
 *
 * Accepts the response body exactly as the CLI printed it. Locates the
 * <verdict>…</verdict> block (first occurrence), parses the inner JSON,
 * and coerces fields into the expected shape. Missing optional fields are
 * filled with sensible defaults.
 *
 * @param {string} response    Raw stdout from the grader CLI.
 * @param {object} dimension   The dimension record this response corresponds to.
 * @returns {{
 *   ok: boolean,
 *   error: string|null,
 *   verdict: {
 *     dimension: string,
 *     score: number|string,
 *     verdict: string,
 *     justification: string,
 *     findings: Array<{ severity: string, surface: string, problem: string, evidence: string, required_action: string }>,
 *     raw: string,
 *   }|null,
 * }}
 */
function parseDimensionResponse(response, dimension) {
  if (!response || typeof response !== 'string') {
    return { ok: false, error: 'empty response from grader', verdict: null };
  }

  const blockMatch = response.match(/<verdict>([\s\S]*?)<\/verdict>/);
  if (!blockMatch) {
    return { ok: false, error: 'no <verdict>…</verdict> block found in response', verdict: null };
  }

  let parsed;
  try {
    parsed = JSON.parse(blockMatch[1].trim());
  } catch (e) {
    return { ok: false, error: `verdict block is not valid JSON: ${e.message}`, verdict: null };
  }

  const verdict = {
    dimension: String(parsed.dimension || dimension.id),
    score: normalizeScore(parsed.score),
    verdict: normalizeVerdict(parsed.verdict),
    justification: String(parsed.justification || '').trim() || '(no justification provided)',
    findings: Array.isArray(parsed.findings) ? parsed.findings.map(normalizeFinding).filter(Boolean) : [],
    raw: blockMatch[1].trim(),
  };

  // Contract: N/A verdict implies empty findings.
  if (verdict.verdict === 'N/A') verdict.findings = [];

  return { ok: true, error: null, verdict };
}

function normalizeScore(s) {
  if (s === 'N/A' || s === 'n/a') return 'N/A';
  const n = Number(s);
  if (!Number.isFinite(n)) return 'N/A';
  if (n < 1) return 1;
  if (n > 5) return 5;
  return Math.round(n);
}

function normalizeVerdict(v) {
  const up = String(v || '').trim().toUpperCase();
  if (VERDICT_ENUM.includes(up)) return up;
  // tolerate minor formatting drift
  if (up === 'PASS WITH FIX') return 'PASS WITH FIXES';
  if (up === 'FAILED') return 'FAIL';
  return 'PASS WITH FIXES';
}

function normalizeFinding(f) {
  if (!f || typeof f !== 'object') return null;
  const severityRaw = String(f.severity || 'P2').trim().toUpperCase();
  const severity = SEVERITY_ENUM.includes(severityRaw) ? severityRaw : 'P2';
  return {
    severity,
    surface: String(f.surface || '(unknown)').trim(),
    problem: String(f.problem || '(unspecified)').trim(),
    evidence: String(f.evidence || '(no evidence cited)').trim(),
    required_action: String(f.required_action || f.requiredAction || '(no action proposed)').trim(),
  };
}

// ---------------------------------------------------------------------------
// Verdict aggregation
// ---------------------------------------------------------------------------

/**
 * Derive a single overall verdict from the per-dimension verdicts AND scores.
 *
 * v0.5.0: rewritten to honor the `evaluation` doctrine's `min_pass_score: 4`
 * threshold (see skills/evaluation/SKILL.md:69-106). The prior implementation
 * used labels only and ignored the 1–5 numeric scores the grader emits,
 * producing PASS WITH FIXES defaults that masked sub-threshold scores.
 *
 * Rule set (evaluated in order — first match wins):
 *   1. Any dimension with an explicit verdict of FAIL (non-N/A)               → FAIL
 *   2. Any dimension with a numeric score ≤ 2                                  → FAIL
 *   3. Any dimension with a numeric score < `minPassScore` (default 4)         → PARTIAL
 *   4. Any dimension with verdict `PASS WITH FIXES` and score >= `minPassScore`→ PASS WITH FIXES
 *   5. Any dimension with verdict `PARTIAL`                                    → PARTIAL
 *   6. All dimensions PASS or N/A, all scores >= `minPassScore`                → PASS
 *
 * N/A dimensions count as PASS with score = N/A (neither raises nor lowers).
 *
 * @param {Array<{ verdict: string, score: number|string }>} dimensionVerdicts
 * @param {object} [opts]
 * @param {number} [opts.minPassScore=MIN_PASS_SCORE] Override the 1–5 pass threshold.
 * @returns {'PASS' | 'PASS WITH FIXES' | 'PARTIAL' | 'FAIL'}
 */
function aggregateVerdict(dimensionVerdicts, opts) {
  const minPass = (opts && Number.isFinite(opts.minPassScore)) ? opts.minPassScore : MIN_PASS_SCORE;

  let sawPartial = false;
  let sawWithFixes = false;
  let sawSubThreshold = false;

  for (const d of dimensionVerdicts) {
    const verdict = d.verdict;
    const score = (typeof d.score === 'number') ? d.score : null;

    if (verdict === 'FAIL') return 'FAIL';
    if (score !== null && score <= 2) return 'FAIL';

    if (score !== null && score < minPass) sawSubThreshold = true;
    if (verdict === 'PARTIAL') sawPartial = true;
    if (verdict === 'PASS WITH FIXES') sawWithFixes = true;
  }

  if (sawSubThreshold) return 'PARTIAL';
  if (sawPartial) return 'PARTIAL';
  if (sawWithFixes) return 'PASS WITH FIXES';
  return 'PASS';
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  DIMENSIONS,
  VERDICT_ENUM,
  MIN_PASS_SCORE,
  SEVERITY_ENUM,
  collectContext,
  sliceChecklist,
  buildDimensionPrompt,
  parseDimensionResponse,
  aggregateVerdict,
};
