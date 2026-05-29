#!/usr/bin/env node
/**
 * render-skills.js — `skill-graph render`
 *
 * Compile the canonical Skill Graph library into the best consumable Agent
 * Skills SKILL.md form, for ACTUAL USE — yours locally, or any developer who
 * clones the project. This is the primary deployment path; the public
 * marketplace export (`scripts/export-marketplace-skills.js`) is a gated,
 * privacy-scrubbed variant of the same compile core.
 *
 * Why this exists, distinct from `export`:
 *   - The Skill Audit Loop + Skill Graph evolve high-quality skills whose value
 *     lives in their rich protocol fields. A VENDOR auto-loader (Claude Code /
 *     Codex / OpenCode / Gemini) reads only `name + description` and the BODY —
 *     never the `metadata:` map. So a skill consumed straight from the canonical
 *     source is blind to the graph. `render` compiles each skill so the graph is
 *     projected into the readable `## Skill Graph context` body section (via the
 *     shared renderer in ./lib/render-skill-context), making the consumed skill
 *     carry the full evolved intelligence.
 *   - Unlike `export`, `render` applies NO publication gate and NO privacy
 *     scrub: it includes EVERY skill in the configured roots — including
 *     `deployment_target: project` skills — because the output is for local use
 *     by whoever owns those roots, not for public skills.sh publication.
 *
 * What the body projection contains: agent-facing guidance ONLY — classification,
 * when-to-use, not-for, related skills, concept (Understanding fields), grounding,
 * and keywords. Maintenance state (audit verdicts, eval status, lifecycle,
 * provenance/version/owner) is deliberately NOT projected — it is bookkeeping for
 * the audit loop, not guidance for an agent USING the skill. There is exactly one
 * render shape (the former `--profile full/runtime` split was removed so no path
 * can leak maintenance state into a consumed skill).
 *
 * Output: a plain Agent Skills tree at <out>/<name>/SKILL.md. Point a runtime at
 * it (e.g. `skill-graph render --out ~/.claude/skills`) to consume the compiled
 * skills, or `--out dist/skills` (default) to inspect them.
 *
 * Usage:
 *   node scripts/render-skills.js
 *   node scripts/render-skills.js --out ~/.claude/skills
 *   node scripts/render-skills.js --check
 *
 * Self-contained — Node built-ins only.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeFrontmatter, parseFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFilesFromRoots, workspaceRoot, loadWorkspaceConfig, resolveSkillRoots } = require('./lib/roots');
const { buildExportedSkill, normalizeExportName } = require('./export-skill');
const { renderSkillGraphContext } = require('./lib/render-skill-context');

const REPO_ROOT = workspaceRoot();
const DEFAULT_OUT = path.join(REPO_ROOT, 'dist', 'skills');

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

/**
 * Collect EVERY skill in the configured roots — no publication gate, no scope
 * exclusion. A skill with unparseable frontmatter or no `name` is skipped with a
 * stderr notice (it cannot produce a valid Agent Skills directory).
 */
function collectAllSkills() {
  const cfg = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
  const roots = resolveSkillRoots(REPO_ROOT, cfg).map(r => ({ absPath: r.absPath, project: r.project || null }));
  const skills = [];
  for (const { filePath } of collectSkillFilesFromRoots(roots)) {
    const text = fs.readFileSync(filePath, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (!fm || !fm.name) {
      process.stderr.write(`SKIP ${repoRelative(filePath)}: no parseable frontmatter or missing name\n`);
      continue;
    }
    skills.push({ sourcePath: filePath, text, fm });
  }
  return skills.sort((a, b) => String(a.fm.name).localeCompare(String(b.fm.name)));
}

/**
 * Compile one skill to its consumable text: clean Agent Skills frontmatter +
 * authored body + the projected `## Skill Graph context` section.
 */
function buildRenderedSkillText(skill) {
  const out = buildExportedSkill(skill.text, {
    bodySuffix: renderSkillGraphContext(skill.fm),
  });
  if (!out) throw new Error(`Unable to render ${repoRelative(skill.sourcePath)}`);
  return out;
}

/** Map of absolute output file path → rendered text, for the whole library. */
function expectedFiles(outRoot) {
  const skills = collectAllSkills();
  const files = new Map();
  const collisions = new Map(); // exportName → first source, to detect name clashes
  for (const skill of skills) {
    const name = normalizeExportName(skill.fm.name);
    const dest = path.join(outRoot, name, 'SKILL.md');
    if (collisions.has(name)) {
      throw new Error(
        `render: two skills normalize to the same directory "${name}":\n` +
        `  ${repoRelative(collisions.get(name))}\n  ${repoRelative(skill.sourcePath)}`
      );
    }
    collisions.set(name, skill.sourcePath);
    files.set(dest, buildRenderedSkillText(skill));
  }
  return { skills, files };
}

function assertSafeOut(outRoot) {
  const resolved = path.resolve(outRoot);
  if (resolved === '/' || resolved === path.parse(resolved).root) {
    throw new Error(`Refusing to render into a filesystem root: ${resolved}`);
  }
  return resolved;
}

/**
 * Write each rendered file, creating parent dirs. Per-skill writes only — never
 * rm the output root — so rendering into a populated directory (e.g. a project's
 * .claude/skills with other, non-Skill-Graph skills) is safe and additive.
 */
function writeFiles(files) {
  for (const [filePath, text] of files) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, text, 'utf8');
  }
}

/** In --check mode, report files that are missing or differ from what render would write. */
function checkFiles(files) {
  const problems = [];
  for (const [filePath, expected] of files) {
    if (!fs.existsSync(filePath)) {
      problems.push(`missing ${filePath}`);
      continue;
    }
    if (fs.readFileSync(filePath, 'utf8') !== expected) {
      problems.push(`stale ${filePath}`);
    }
  }
  return problems;
}

function parseArgs(argv) {
  const options = { outRoot: DEFAULT_OUT, check: false, json: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg === '--check') options.check = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--quiet') options.quiet = true;
    else if (arg === '--out') {
      if (!argv[i + 1]) throw new Error('--out requires a path');
      options.outRoot = path.resolve(argv[++i]);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/render-skills.js [options]

Compile the canonical Skill Graph library into consumable Agent Skills SKILL.md
files (clean frontmatter + authored body + a readable "## Skill Graph context"
section projected from the protocol fields). Includes every skill — no
marketplace publication gate.

The body projection carries agent-facing guidance ONLY (classification,
when-to-use, not-for, related, concept, grounding, keywords). Maintenance state
(audit verdicts, eval status, lifecycle, provenance/version/owner) is never
projected into the consumed skill.

Options:
  --out <dir>         Output root (default: dist/skills). Use a runtime's skills
                      dir to consume directly, e.g. --out ~/.claude/skills
  --check             Do not write; fail if any rendered file is missing or stale
  --json              Print a JSON summary
  --quiet             Suppress success text
  --help              Show this help

Examples:
  node scripts/render-skills.js
  node scripts/render-skills.js --out ~/.claude/skills
  node scripts/render-skills.js --check
`);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) { printHelp(); process.exit(0); }

    const outRoot = assertSafeOut(options.outRoot);
    const { skills, files } = expectedFiles(outRoot);

    let problems = [];
    if (options.check) {
      problems = checkFiles(files);
    } else {
      writeFiles(files);
    }

    const result = {
      out: outRoot,
      rendered_skills: files.size,
      total_skills: skills.length,
      ok: problems.length === 0,
      problems,
    };

    if (options.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } else if (!options.quiet) {
      for (const p of problems) process.stderr.write(`FAIL ${p}\n`);
      if (problems.length === 0) {
        const verb = options.check ? 'checked' : 'rendered';
        process.stdout.write(`OK   ${verb} ${files.size} skill(s) → ${outRoot}\n`);
      }
    }

    process.exit(problems.length > 0 ? 1 : 0);
  } catch (error) {
    process.stderr.write(`ERROR ${error.message}\n`);
    process.exit(1);
  }
}

module.exports = {
  DEFAULT_OUT,
  buildRenderedSkillText,
  collectAllSkills,
  expectedFiles,
};

if (require.main === module) main();
