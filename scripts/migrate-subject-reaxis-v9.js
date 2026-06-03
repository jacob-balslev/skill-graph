#!/usr/bin/env node
/**
 * One-time migration codemod: 9-shelf → 12-shelf competency re-axis (ADR-0020).
 *
 * Per AGENTS.md § "Major Version Is a Clean Cut", this codemod is run ONCE then
 * deleted (history lives in git). It encodes the reviewed per-skill `subject`
 * mapping from the approved re-axis plan and applies it to the canonical skill
 * library:
 *   1. rewrites the frontmatter `subject:` value (the real line under metadata,
 *      never the `# subject:` doc-comment line),
 *   2. inserts/sets a `subjects:` polyhierarchy block for the reviewed hedge
 *      skills,
 *   3. `git mv`s the skill folder from skills/<old-subject>/<name>/ to
 *      skills/<new-subject>/<name>/ so the on-disk layout keeps mirroring
 *      `subject` 1:1.
 *
 * It does NOT touch taxonomy_domain (free-text, non-schema-breaking; sub-shelf
 * normalization is a documented follow-up). It REPORTS any on-disk skill whose
 * name is absent from the mapping (completeness guard — nothing is left behind).
 *
 * Usage:
 *   node migrate-subject-reaxis-v9.js            # dry-run (default; no writes)
 *   node migrate-subject-reaxis-v9.js --apply    # edit frontmatter + git mv
 *
 * Operates on the sibling canonical library resolved from SKILLS_ROOT (default
 * ../skills/skills relative to this repo).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const APPLY = process.argv.includes('--apply');
const SKILLS_ROOT = process.env.SKILLS_ROOT
  || path.resolve(__dirname, '..', '..', 'skills', 'skills');

// name -> primary subject (the reviewed ADR-0020 mapping).
const TARGET = {
  // backend-engineering
  'api-design': 'backend-engineering', 'http-semantics': 'backend-engineering',
  'route-handler-design': 'backend-engineering', 'background-jobs': 'backend-engineering',
  'cron-scheduling': 'backend-engineering', 'connection-pooling': 'backend-engineering',
  'acid-fundamentals': 'backend-engineering', 'transaction-isolation': 'backend-engineering',
  'compression': 'backend-engineering', 'real-time-updates': 'backend-engineering',
  'streaming-architecture': 'backend-engineering', 'webhook-integration': 'backend-engineering',
  // frontend-engineering
  'client-server-boundary': 'frontend-engineering', 'frontend-architecture': 'frontend-engineering',
  'hooks-patterns': 'frontend-engineering', 'ref-patterns': 'frontend-engineering',
  'rendering-models': 'frontend-engineering', 'server-components-design': 'frontend-engineering',
  'server-actions-design': 'frontend-engineering', 'suspense-patterns': 'frontend-engineering',
  'middleware-patterns': 'frontend-engineering', 'state-management': 'frontend-engineering',
  'error-boundary': 'frontend-engineering', 'vercel-composition-patterns': 'frontend-engineering',
  'mobile-responsive-ux': 'frontend-engineering', 'generative-ui': 'frontend-engineering',
  'theme-system-design': 'frontend-engineering', 'design-system-architecture': 'frontend-engineering',
  // software-architecture
  'architecture-decision-records': 'software-architecture', 'bounded-context-mapping': 'software-architecture',
  'dependency-architecture': 'software-architecture', 'framework-fit-analysis': 'software-architecture',
  'system-interface-contracts': 'software-architecture', 'conceptual-modeling': 'software-architecture',
  'entity-relationship-modeling': 'software-architecture', 'state-machine-modeling': 'software-architecture',
  'event-contract-design': 'software-architecture', 'event-storming': 'software-architecture',
  'data-modeling': 'software-architecture', 'agent-engineering': 'software-architecture',
  // data-engineering
  'data-modeling-fundamentals': 'data-engineering', 'database-migration': 'data-engineering',
  'schema-evolution': 'data-engineering', 'indexing-strategy': 'data-engineering',
  'query-optimization': 'data-engineering', 'replication-patterns': 'data-engineering',
  'sharding-strategy': 'data-engineering', 'cap-theorem-tradeoffs': 'data-engineering',
  'observability-modeling': 'data-engineering',
  // agent-ops
  'ai-native-development': 'agent-ops', 'autonomous-loop-patterns': 'agent-ops',
  'content-monitor': 'agent-ops', 'context-engineering': 'agent-ops', 'context-graph': 'agent-ops',
  'context-management': 'agent-ops', 'context-window': 'agent-ops', 'skill-infrastructure': 'agent-ops',
  'skill-router': 'agent-ops', 'skill-scaffold': 'agent-ops',
  // ai-engineering
  'agent-eval-design': 'ai-engineering', 'eval-driven-development': 'ai-engineering',
  'evaluation': 'ai-engineering', 'prompt-craft': 'ai-engineering', 'tool-call-strategy': 'ai-engineering',
  'tool-call-flow': 'ai-engineering', 'intent-recognition': 'ai-engineering', 'guardrails': 'ai-engineering',
  'prompt-injection-defense': 'ai-engineering', 'summarization': 'ai-engineering',
  'project-knowledge-extraction': 'ai-engineering',
  // quality-assurance
  'a11y': 'quality-assurance', 'code-review': 'quality-assurance', 'cognitive-load-theory': 'quality-assurance',
  'contract-testing': 'quality-assurance', 'e2e-test-design': 'quality-assurance',
  'integration-test-design': 'quality-assurance', 'mutation-testing': 'quality-assurance',
  'performance-testing': 'quality-assurance', 'property-based-testing': 'quality-assurance',
  'snapshot-testing': 'quality-assurance', 'test-coverage-strategy': 'quality-assurance',
  'test-doubles-design': 'quality-assurance', 'test-driven-development': 'quality-assurance',
  'testing-strategy': 'quality-assurance', 'type-safety': 'quality-assurance',
  'owasp-security': 'quality-assurance', 'security-fundamentals': 'quality-assurance',
  'lint-overlay': 'quality-assurance', 'best-practice': 'quality-assurance',
  'error-tracking': 'quality-assurance', 'diff-analysis': 'quality-assurance',
  'graph-audit': 'quality-assurance', 'performance-budgets': 'quality-assurance',
  'performance-engineering': 'quality-assurance', 'seo-strategy': 'quality-assurance',
  // design
  'color-system-design': 'design', 'dark-mode-implementation': 'design',
  'design-module-composition': 'design', 'design-thinking': 'design', 'form-ux-architecture': 'design',
  'ideation': 'design', 'interaction-feedback': 'design', 'interaction-patterns': 'design',
  'journey-mapping': 'design', 'microcopy': 'design', 'prototyping': 'design',
  'research-synthesis': 'design', 'semiotics': 'design', 'typography-system': 'design',
  'usability-testing': 'design', 'user-research': 'design', 'visual-hierarchy': 'design',
  'writing-humanizer': 'design', 'visual-design-foundations': 'design', 'layout-composition': 'design',
  'information-architecture': 'design', 'component-architecture': 'design',
  // reasoning-strategy
  'bayesian-reasoning': 'reasoning-strategy', 'expected-value': 'reasoning-strategy',
  'first-principles-thinking': 'reasoning-strategy', 'inversion': 'reasoning-strategy',
  'mental-models': 'reasoning-strategy', 'pattern-recognition': 'reasoning-strategy',
  'second-order-thinking': 'reasoning-strategy', 'constraint-awareness': 'reasoning-strategy',
  'epistemic-grounding': 'reasoning-strategy', 'principled-negotiation': 'reasoning-strategy',
  'playing-to-win': 'reasoning-strategy', 'porters-five-forces': 'reasoning-strategy',
  'positioning': 'reasoning-strategy', 'seven-powers': 'reasoning-strategy',
  'swot-tows': 'reasoning-strategy', 'pestel': 'reasoning-strategy', 'kano-model': 'reasoning-strategy',
  'blue-ocean-strategy': 'reasoning-strategy', 'problem-framing': 'reasoning-strategy',
  'task-analysis': 'reasoning-strategy', 'okrs': 'reasoning-strategy',
  // software-engineering-method
  'spec-driven-development': 'software-engineering-method', 'methodology': 'software-engineering-method',
  'prioritization': 'software-engineering-method', 'problem-approach-router': 'software-engineering-method',
  'problem-locating-solving': 'software-engineering-method', 'diagnosis': 'software-engineering-method',
  'debugging': 'software-engineering-method', 'refactor': 'software-engineering-method',
  'version-control': 'software-engineering-method', 'merge-queue': 'software-engineering-method',
  'no-cutting-corners': 'software-engineering-method', 'methodical': 'software-engineering-method',
  'doc-updater': 'software-engineering-method', 'task-path-optimization': 'software-engineering-method',
  'naming-conventions': 'software-engineering-method',
  // knowledge-organization
  'knowledge-modeling': 'knowledge-organization', 'linguistics': 'knowledge-organization',
  'ontology-modeling': 'knowledge-organization', 'semantic-center': 'knowledge-organization',
  'semantic-relations': 'knowledge-organization', 'semantics': 'knowledge-organization',
  'taxonomy-design': 'knowledge-organization', 'skill-evolution': 'knowledge-organization',
  'keywords': 'knowledge-organization',
  // product-domain (genuine vendor verticals; floor-exception w/ recruit path per ADR-0020)
  'etsy': 'product-domain', 'shopify': 'product-domain', 'printify': 'product-domain',
};

// name -> ordered [primary, secondary] polyhierarchy for the reviewed hedges.
const SECONDARY = {
  'agent-engineering': ['software-architecture', 'ai-engineering'],
  'information-architecture': ['design', 'knowledge-organization'],
  'generative-ui': ['frontend-engineering', 'ai-engineering'],
  'observability-modeling': ['data-engineering', 'quality-assurance'],
  'shopify': ['product-domain', 'backend-engineering'],
  'printify': ['product-domain', 'backend-engineering'],
  'seo-strategy': ['quality-assurance', 'product-domain'],
  'webhook-integration': ['backend-engineering', 'product-domain'],
};

function findSkillFiles(root) {
  const out = [];
  for (const subj of fs.readdirSync(root)) {
    const subjDir = path.join(root, subj);
    if (!fs.statSync(subjDir).isDirectory()) continue;
    for (const name of fs.readdirSync(subjDir)) {
      const f = path.join(subjDir, name, 'SKILL.md');
      if (fs.existsSync(f)) out.push({ name, subj, dir: path.join(subjDir, name), file: f });
    }
  }
  return out;
}

// Real `subject:` line (either indented under metadata: or flat at column 0;
// never a `#` doc-comment line). Both frontmatter styles exist in the corpus.
const SUBJECT_RE = /^(\s*)subject:\s*([a-z][a-z0-9-]*)\s*$/;

function readSubject(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith('#')) continue;
    const m = lines[i].match(SUBJECT_RE);
    if (m) return { idx: i, indent: m[1], value: m[2] };
  }
  return null;
}

function main() {
  const files = findSkillFiles(SKILLS_ROOT);
  const moves = [], unchanged = [], unmapped = [], errors = [], secondaryOnly = [];

  for (const s of files) {
    const target = TARGET[s.name];
    if (!target) { unmapped.push(s.name + '  (in ' + s.subj + ')'); continue; }
    const raw = fs.readFileSync(s.file, 'utf8');
    const lines = raw.split(/\r?\n/);
    const cur = readSubject(lines);
    if (!cur) { errors.push(s.name + ': no real subject line found'); continue; }

    const sec = SECONDARY[s.name];
    const needsSubjectChange = cur.value !== target;
    const move = cur.value !== target; // folder mirrors subject

    if (!needsSubjectChange && !sec) { unchanged.push(s.name); continue; }

    if (APPLY) {
      let newLines = lines.slice();
      newLines[cur.idx] = `${cur.indent}subject: ${target}`;
      // Insert/replace a subjects: block immediately after the subject line.
      if (sec) {
        // remove an existing inline subjects: line if present (rare)
        newLines = newLines.filter((l, i) => !(i !== cur.idx && /^\s+subjects:/.test(l)));
        const subjectsBlock = `${cur.indent}subjects: [${sec.join(', ')}]`;
        newLines.splice(cur.idx + 1, 0, subjectsBlock);
      }
      fs.writeFileSync(s.file, newLines.join('\n'));
    }

    if (move) {
      const destDir = path.join(SKILLS_ROOT, target, s.name);
      if (APPLY) {
        fs.mkdirSync(path.join(SKILLS_ROOT, target), { recursive: true });
        // Tracked dirs move via `git mv`; untracked (another session's
        // not-yet-committed skills) move loss-free via fs.rename, then staged.
        let tracked = true;
        try { execFileSync('git', ['-C', SKILLS_ROOT, 'ls-files', '--error-unmatch', s.file], { stdio: 'ignore' }); }
        catch { tracked = false; }
        if (tracked) {
          execFileSync('git', ['-C', SKILLS_ROOT, 'mv', s.dir, destDir]);
        } else {
          fs.renameSync(s.dir, destDir);
        }
        execFileSync('git', ['-C', SKILLS_ROOT, 'add', path.join(destDir, 'SKILL.md')]);
      }
      moves.push(`${s.subj}/${s.name}  ->  ${target}/${s.name}` + (sec ? `  [subjects: ${sec.join(', ')}]` : ''));
    } else if (sec) {
      if (APPLY) execFileSync('git', ['-C', SKILLS_ROOT, 'add', s.file]);
      secondaryOnly.push(`${s.name}  [subjects: ${sec.join(', ')}]`);
    }
  }

  const out = (label, arr) => { console.log(`\n### ${label} (${arr.length})`); arr.slice(0, 200).forEach(x => console.log('  ' + x)); };
  console.log(`mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}   root: ${SKILLS_ROOT}   skills: ${files.length}`);
  out('MOVED (subject changed + folder relocated)', moves.sort());
  out('SECONDARY-ONLY (shelf unchanged; subjects[] hedge added)', secondaryOnly.sort());
  out('UNCHANGED (already correct shelf)', unchanged.sort());
  out('UNMAPPED — NOT in mapping (MUST be empty before --apply)', unmapped.sort());
  out('ERRORS', errors.sort());
  if (!APPLY) console.log('\n(dry-run — re-run with --apply to perform edits + git mv)');
  if (unmapped.length || errors.length) process.exitCode = 2;
}

module.exports = { TARGET, SECONDARY };
if (require.main === module) main();
