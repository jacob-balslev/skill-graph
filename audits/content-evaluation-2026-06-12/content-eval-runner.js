'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

const { prepareModelCliHome, envForCli } = require('../../lib/audit/model-cli-home');

const ROOT = path.resolve(__dirname, '../../..');
const SKILLS_ROOT = path.join(ROOT, 'skills/skills');
const OUT_DIR = path.join(ROOT, 'skill-graph/audits/content-evaluation-2026-06-12');
const RUN_ID = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const RAW_DIR = path.join(OUT_DIR, `raw-reviewers-${RUN_ID}`);
const BUNDLE_DIR = path.join(RAW_DIR, 'review-bundles');
const MAX = process.env.MAX_SKILLS ? Number(process.env.MAX_SKILLS) : Infinity;
const START_AT = process.env.START_AT ? Number(process.env.START_AT) : 1;
const REVIEWERS_ENABLED = process.env.NO_REVIEWERS !== '1';
const DEFAULT_REVIEWER_TIMEOUT_MS = Number(process.env.REVIEWER_TIMEOUT_MS || 180_000);
const OPUS_TIMEOUT_MS = Number(process.env.OPUS_TIMEOUT_MS || DEFAULT_REVIEWER_TIMEOUT_MS);
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || DEFAULT_REVIEWER_TIMEOUT_MS);
const OPENCODE_TIMEOUT_MS = Number(process.env.OPENCODE_TIMEOUT_MS || DEFAULT_REVIEWER_TIMEOUT_MS);

const REQUIRED_DOCS = [
  'CLAUDE.md',
  'AGENTS.md',
  'SKILL-SYSTEM-CHEAT-SHEET.md',
  'skill-graph/AGENTS.md',
  'skill-graph/SKILL_GRAPH.md',
  'skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md',
  'skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md',
  'skill-graph/prompts/skill-audit-loop-codex-panel-supervisor-v1.md',
  'skill-graph/prompts/skill-audit-loop-opencode-panel-supervisor-v1.md',
  'skill-graph/prompts/skill-audit-loop-claude-panel-supervisor-v1.md',
  'skill-graph/docs/skill-audit-multimodel-merge.md',
  'skill-graph/docs/skill-audit-multimodel-merge-v2.md',
  'skill-graph/audits/lanes.json',
  'skill-graph/audits/merge-protocol.md',
  'agent-orchestration/config/org-chart.json',
];

const EXTERNAL_SOURCES = [
  {
    url: 'https://agentskills.io/skill-creation/evaluating-skills',
    note: 'Agent Skills eval guidance: realistic prompts, with/without baseline, assertions, grading evidence, aggregation, pattern analysis.',
  },
  {
    url: 'https://agentskills.io/skill-creation/optimizing-descriptions',
    note: 'Agent Skills description guidance: activation depends on precise descriptions, should-trigger and should-not-trigger queries, realistic trigger eval prompts.',
  },
  {
    url: 'https://developers.openai.com/blog/eval-skills',
    note: 'OpenAI guidance: evals are prompt plus captured run plus checks plus score over time; define measurable success and avoid vibe-based assessment.',
  },
  {
    url: 'https://www.langchain.com/blog/evaluating-skills',
    note: 'LangChain guidance: evaluate skills with clean environments, with/without comparisons, concrete tasks, clear metrics, and observability.',
  },
  {
    url: 'https://www.youtube.com/watch?v=C1WRly9nmnU',
    note: 'YouTube title/description verified: Claude Skills 2.0 Breakdown: Measure, Test, Improve; timedtext captions exposed but signed endpoint returned 404 in this environment.',
  },
  {
    url: 'https://sonusahani.com/blogs/claude-skills-measure-test-improve',
    note: 'Accessible article matching the video topic: evaluation cycle, model drift, pass/fail criteria, dry runs, audits, human review, token pruning.',
  },
];

const REVIEWERS = [
  {
    name: 'opus',
    model: 'opus',
    kind: 'claude',
    cmd: 'claude',
    args: ['--safe-mode', '-p', '--model', 'opus', '--permission-mode', 'plan', '--max-budget-usd', process.env.OPUS_MAX_BUDGET || '1.20'],
    timeout: OPUS_TIMEOUT_MS,
  },
  {
    name: 'gemini-flash',
    model: 'gemini-3-flash-preview',
    kind: 'gemini',
    cmd: 'gemini',
    args: ['-m', 'gemini-3-flash-preview', '-p', '', '--approval-mode', 'plan', '--output-format', 'json', '--skip-trust'],
    timeout: GEMINI_TIMEOUT_MS,
  },
  {
    name: 'deepseek-flash',
    model: 'opencode/deepseek-v4-flash-free',
    kind: 'opencode',
    cmd: 'opencode',
    args: ['--pure', 'run', '-m', 'opencode/deepseek-v4-flash-free', '--format', 'json'],
    timeout: OPENCODE_TIMEOUT_MS,
  },
  {
    name: 'mimo',
    model: 'opencode/mimo-v2.5-free',
    kind: 'opencode',
    cmd: 'opencode',
    args: ['--pure', 'run', '-m', 'opencode/mimo-v2.5-free', '--format', 'json'],
    timeout: OPENCODE_TIMEOUT_MS,
  },
];

function sha(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function listSkillFiles(dir) {
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out = out.concat(listSkillFiles(p));
    else if (ent.name === 'SKILL.md') out.push(p);
  }
  return out.sort();
}

function frontmatter(content) {
  if (!content.startsWith('---')) return { fm: '', body: content };
  const end = content.indexOf('\n---', 3);
  if (end < 0) return { fm: '', body: content };
  return { fm: content.slice(4, end), body: content.slice(end + 4) };
}

function scalar(fm, key) {
  let match = fm.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  if (!match) match = fm.match(new RegExp(`^\\s{2,}${key}:\\s*(.*)$`, 'm'));
  if (!match) return null;
  let value = match[1].trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value;
}

function blockHas(fm, key) {
  return new RegExp(`(^|\\n)\\s*${key}:`).test(fm);
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function readJsonMaybe(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (_) {
    return null;
  }
}

function findFiles(dir, predicate) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out = out.concat(findFiles(p, predicate));
    else if (predicate(p)) out.push(p);
  }
  return out.sort();
}

function evalSummary(skillDir) {
  const files = findFiles(path.join(skillDir, 'evals'), (file) => /\.json$/i.test(file));
  let cases = 0;
  let prompts = 0;
  let expected = 0;
  let assertions = 0;
  let baseline = 0;
  let hardNeg = 0;
  let boundary = 0;
  let regression = 0;
  const invalid = [];
  const details = [];

  for (const file of files) {
    const parsed = readJsonMaybe(file);
    if (!parsed) {
      invalid.push(file);
      continue;
    }
    const arr = Array.isArray(parsed.evals) ? parsed.evals : Array.isArray(parsed.cases) ? parsed.cases : [];
    cases += arr.length;
    for (const item of arr) {
      const text = JSON.stringify(item).toLowerCase();
      if (item.prompt || item.input || item.task) prompts += 1;
      if (item.expected_output || item.expected || item.expected_elements) expected += 1;
      if (Array.isArray(item.assertions)) assertions += item.assertions.length;
      if (/without[_ -]?skill|baseline|old[_ -]?skill|previous version/.test(text)) baseline += 1;
      if (/hard negative|negative|must not|should not|wrong skill|near[- ]miss/.test(text)) hardNeg += 1;
      if (/boundary|edge case|ambiguous|malformed|unusual/.test(text)) boundary += 1;
      if (/regression|prior failure|previous bug|fixed failure/.test(text)) regression += 1;
    }
    details.push({ path: file, cases: arr.length, shape: Array.isArray(parsed.evals) ? 'evals' : Array.isArray(parsed.cases) ? 'cases' : 'unknown' });
  }

  return { files, details, cases, prompts, expected, assertions, baseline, hardNeg, boundary, regression, invalid };
}

function auditSummary(skillDir) {
  const auditPath = path.join(skillDir, 'audit-state.json');
  const parsed = readJsonMaybe(auditPath);
  if (!parsed) return { path: auditPath, present: false };
  const out = { path: auditPath, present: true };
  for (const key of ['structural_verdict', 'truth_verdict', 'comprehension_verdict', 'application_verdict', 'eval_artifacts', 'eval_state', 'routing_eval']) {
    out[key] = parsed[key] ?? (parsed.audit_status && parsed.audit_status[key]) ?? (parsed.status && parsed.status[key]) ?? null;
  }
  return out;
}

function metadataFor(file) {
  const content = fs.readFileSync(file, 'utf8');
  const { fm, body } = frontmatter(content);
  const dir = path.dirname(file);
  const rel = path.relative(SKILLS_ROOT, file);
  const parts = rel.split(path.sep);
  const name = scalar(fm, 'name') || parts[parts.length - 2];
  const description = scalar(fm, 'description') || '';
  const subject = scalar(fm, 'subject') || scalar(fm, 'category') || parts[0];
  const isPublic = (scalar(fm, 'public') || 'true').toLowerCase() !== 'false';
  const scope = scalar(fm, 'scope') || '';
  return {
    file,
    dir,
    rel,
    name,
    description,
    subject,
    category: parts.slice(0, -2).join('/') || parts[0],
    public: isPublic,
    scope,
    content,
    fm,
    body,
    eval: evalSummary(dir),
    audit: auditSummary(dir),
    line_count: content.split('\n').length,
    char_count: content.length,
    hash: sha(content),
  };
}

function staticEval(skill) {
  const { fm, body } = skill;
  const ev = skill.eval;
  const audit = skill.audit;
  const headings = countMatches(body, /^##\s+/gm);
  const tables = countMatches(body, /^\|.+\|$/gm);
  const has = (regex) => regex.test(skill.content);
  const truthCount = countMatches(fm, /https?:\/\//g) + countMatches(body, /https?:\/\//g);
  const contentDims = {};
  const evalDims = {};

  contentDims.purpose_scope = Math.min(100, 35 + (skill.description.length > 80 ? 20 : 8) + (skill.scope.length > 120 ? 20 : 8) + (has(/## Concept of the skill|## Coverage/i) ? 15 : 0) + (blockHas(fm, 'mental_model') ? 10 : 0));
  contentDims.activation = Math.min(100, 30 + (skill.description.includes('Use when') ? 20 : 0) + (/Do NOT use|Do not use/i.test(skill.description) ? 18 : 0) + (blockHas(fm, 'examples') ? 12 : 0) + (blockHas(fm, 'anti_examples') ? 12 : 0) + (blockHas(fm, 'keywords') ? 8 : 0));
  contentDims.boundary = Math.min(100, 25 + (blockHas(fm, 'concept_boundary') ? 20 : 0) + (blockHas(fm, 'anti_examples') ? 18 : 0) + (/## Do NOT Use|Do NOT Use When|Boundary Decisions/i.test(body) ? 22 : 0) + (/suppresses:/i.test(fm) ? 10 : 0));
  contentDims.instructional = Math.min(100, 20 + Math.min(20, headings * 2) + Math.min(20, tables / 4) + (/## Method|## Workflow|## Process|## Verification|Checklist|Runbook/i.test(body) ? 25 : 0) + (blockHas(fm, 'mental_model') && blockHas(fm, 'purpose') ? 15 : 0));
  contentDims.grounding = Math.min(100, 20 + (blockHas(fm, 'grounding') ? 25 : 0) + (truthCount >= 3 ? 25 : truthCount * 7) + (/## References|## Source Notes|## Key Sources/i.test(body) ? 20 : 0) + (audit.truth_verdict === 'PASS' ? 10 : 0));

  evalDims.eval_artifact = Math.min(100, (ev.files.length ? 25 : 0) + Math.min(30, ev.cases * 3) + (ev.expected >= Math.max(1, ev.cases * 0.8) ? 15 : 0) + (ev.assertions >= ev.cases && ev.cases ? 20 : 0) + (ev.invalid.length ? 0 : 10));
  evalDims.agent_eval_readiness = Math.min(100, (ev.cases ? 20 : 0) + (ev.prompts >= ev.cases && ev.cases ? 15 : 0) + (ev.expected >= ev.cases && ev.cases ? 15 : 0) + (ev.assertions >= ev.cases && ev.cases ? 20 : 0) + (ev.baseline ? 12 : 0) + (audit.eval_state && audit.eval_state !== 'unverified' ? 10 : 0) + (audit.routing_eval === 'present' ? 8 : 0));
  evalDims.case_quality = Math.min(100, (ev.cases >= 10 ? 30 : ev.cases * 3) + (ev.hardNeg ? 18 : 0) + (ev.boundary ? 18 : 0) + (ev.regression ? 14 : 0) + (ev.cases >= 4 ? 10 : 0) + (ev.files.length > 1 ? 10 : 0));
  evalDims.audit_state = Math.min(100, (audit.present ? 25 : 0) + ['structural_verdict', 'truth_verdict', 'comprehension_verdict', 'application_verdict', 'eval_artifacts', 'eval_state', 'routing_eval'].filter((key) => audit[key]).length * 8 + (audit.application_verdict === 'APPLICABLE' ? 19 : 0));

  const contentWeights = {
    purpose_scope: 0.22,
    activation: 0.18,
    boundary: 0.18,
    instructional: 0.27,
    grounding: 0.15,
  };
  const evalWeights = {
    eval_artifact: 0.28,
    agent_eval_readiness: 0.32,
    case_quality: 0.25,
    audit_state: 0.15,
  };
  const contentScore = Math.round(Object.entries(contentWeights).reduce((sum, [key, weight]) => sum + contentDims[key] * weight, 0));
  const evalScore = Math.round(Object.entries(evalWeights).reduce((sum, [key, weight]) => sum + evalDims[key] * weight, 0));
  const contentFindings = [];
  const evalFindings = [];

  if (!ev.files.length) {
    evalFindings.push({
      severity: 'HIGH',
      dimension: 'eval artifacts',
      finding: 'No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent.',
      evidence: 'No files under evals/*.json',
      action: 'Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.',
    });
  } else {
    if (ev.cases < 10) {
      evalFindings.push({
        severity: 'MEDIUM',
        dimension: 'case quality',
        finding: `Eval coverage has ${ev.cases} cases, below the target of 10 distinct cases.`,
        evidence: ev.files.join(', '),
        action: 'Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.',
      });
    }
    if (ev.assertions < ev.cases) {
      evalFindings.push({
        severity: 'MEDIUM',
        dimension: 'eval readiness',
        finding: 'Some eval cases lack gradeable assertions.',
        evidence: `${ev.assertions} assertions across ${ev.cases} cases`,
        action: 'Add observable assertions or expected elements for each case.',
      });
    }
    if (!ev.baseline) {
      evalFindings.push({
        severity: 'MEDIUM',
        dimension: 'baseline',
        finding: 'Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability.',
        evidence: 'No baseline/without-skill marker detected in eval JSON text.',
        action: 'Add baseline configuration or fields that support delta comparison.',
      });
    }
  }

  if (!audit.present) {
    evalFindings.push({
      severity: 'MEDIUM',
      dimension: 'audit state',
      finding: 'No audit-state.json sidecar was found.',
      evidence: audit.path,
      action: 'Run the audit loop/evaluation pass that writes sidecar evidence.',
    });
  } else if (audit.application_verdict !== 'APPLICABLE') {
    evalFindings.push({
      severity: 'MEDIUM',
      dimension: 'audit state',
      finding: `application_verdict is ${audit.application_verdict || 'missing'}, so the skill is not certified useful by the Behavior Gate.`,
      evidence: audit.path,
      action: 'Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.',
    });
  }

  if (contentDims.boundary < 70) {
    contentFindings.push({
      severity: 'MEDIUM',
      dimension: 'boundary',
      finding: 'Boundary/anti-example surface is thin for routing precision.',
      evidence: 'Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section.',
      action: 'Add concrete anti-examples and adjacent-skill ownership boundaries.',
    });
  }

  if (contentDims.grounding < 65) {
    contentFindings.push({
      severity: 'MEDIUM',
      dimension: 'grounding',
      finding: 'Grounding/truth-source evidence is weak or not explicit.',
      evidence: `Detected ${truthCount} URL-like truth sources; truth_verdict=${audit.truth_verdict || 'missing'}.`,
      action: 'Add or refresh grounding truth sources and verify them through the sidecar.',
    });
  }

  if (contentDims.instructional < 70) {
    contentFindings.push({
      severity: 'MEDIUM',
      dimension: 'instructional content',
      finding: 'Reusable procedure or mental model is not explicit enough.',
      evidence: 'Weak workflow/process/checklist signals in SKILL.md body.',
      action: 'Add a concrete procedure, decision model, or verification checklist.',
    });
  }

  return {
    dimensions: { content: contentDims, eval: evalDims },
    content_score: contentScore,
    eval_readiness_score: evalScore,
    score: contentScore,
    content_findings: contentFindings,
    eval_findings: evalFindings,
    findings: [...contentFindings, ...evalFindings],
  };
}

function grade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function cleanJsonText(text) {
  if (!text) return null;
  let source = String(text).trim();
  const fence = source.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) source = fence[1].trim();
  const first = source.indexOf('{');
  const last = source.lastIndexOf('}');
  if (first >= 0 && last > first) source = source.slice(first, last + 1);
  try {
    return JSON.parse(source);
  } catch (_) {
    return null;
  }
}

function extractOpencodeText(stdout) {
  let text = '';
  for (const line of String(stdout || '').split(/\n+/)) {
    try {
      const event = JSON.parse(line);
      if (event.type === 'text' && event.part && event.part.text) text += event.part.text;
    } catch (_) {
      // ignore non-JSON log lines
    }
  }
  return text || stdout;
}

function runCmd(spec, prompt, timeoutMs, options = {}) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    const startedMs = Date.now();
    let home = null;
    let env = process.env;
    const cwd = options.cwd || ROOT;
    const args = options.args || spec.args;

    if (spec.kind === 'opencode') {
      home = prepareModelCliHome({ mode: 'scratch' });
      env = envForCli('opencode', process.env, {
        byCli: {
          opencode: {
            ...home.envByCli.opencode,
            OPENCODE_DISABLE_CLAUDE_CODE: '1',
            OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: '1',
            OPENCODE_DISABLE_DEFAULT_PLUGINS: '1',
          },
        },
      });
    }

    const child = spawn(spec.cmd, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = timeoutMs > 0 ? setTimeout(() => {
      timedOut = true;
      try { child.kill('SIGTERM'); } catch (_) {}
      setTimeout(() => {
        try { child.kill('SIGKILL'); } catch (_) {}
      }, 3000);
    }, timeoutMs) : null;

    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('error', (error) => {
      if (timer) clearTimeout(timer);
      if (home) home.cleanup();
      resolve({
        reviewer: spec.name,
        model: spec.model,
        ok: false,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        duration_ms: Date.now() - startedMs,
        error: error.message,
        stdout: '',
        stderr,
      });
    });
    child.on('close', (code) => {
      if (timer) clearTimeout(timer);
      if (home) home.cleanup();
      let response = stdout;
      if (spec.kind === 'gemini') {
        const outer = cleanJsonText(stdout);
        if (outer && outer.response) response = outer.response;
      }
      if (spec.kind === 'opencode') response = extractOpencodeText(stdout);
      const parsed = cleanJsonText(response);
      resolve({
        reviewer: spec.name,
        model: spec.model,
        ok: code === 0 && !timedOut,
        code,
        timeout: timedOut,
        started_at: startedAt,
        ended_at: new Date().toISOString(),
        duration_ms: Date.now() - startedMs,
        parsed,
        response: String(response || '').slice(0, 4000),
        stdout_bytes: stdout.length,
        stderr: String(stderr || '').slice(0, 2000),
      });
    });
    child.stdin.end(prompt);
  });
}

function promptFor(skill, staticResult) {
  const audit = JSON.stringify(skill.audit, null, 2);
  const evalFacts = JSON.stringify({
    files: skill.eval.files,
    cases: skill.eval.cases,
    prompts: skill.eval.prompts,
    expected: skill.eval.expected,
    assertions: skill.eval.assertions,
    baseline: skill.eval.baseline,
    hardNeg: skill.eval.hardNeg,
    boundary: skill.eval.boundary,
    regression: skill.eval.regression,
    invalid: skill.eval.invalid,
  }, null, 2);

  return `You are an independent reviewer in a Skill Graph CONTENT evaluation run.
Evaluate ONLY the skill artifact and its eval design. Do NOT judge whether agents used the skill correctly in the codebase. Do NOT suggest editing files now. Do not call tools; all evidence needed is inside this prompt.

Apply Skill Metadata Protocol v8: audit/eval/provenance state belongs outside SKILL.md, so do not mark missing audit fields inside SKILL.md as a defect.

Return one compact JSON object only:
{
  "content_score": 0-100,
  "eval_readiness_score": 0-100,
  "content_grade": "A|B|C|D|F",
  "verdict": "one short sentence",
  "findings": [
    {"severity":"HIGH|MEDIUM|LOW|INFO","dimension":"...","finding":"max 35 words","evidence":"max 25 words","action":"max 25 words"}
  ],
  "blockers": ["max 3 short strings"],
  "next_action": "one concrete action"
}
Include exactly 3 findings. Keep every string short.

Score separation is mandatory:
- content_score/content_grade evaluate authored SKILL.md content only: purpose/scope clarity; description activation; boundary/anti-examples; reusable procedure/mental model; grounding/truth sources.
- eval_readiness_score evaluates eval artifact quality, Agent Skills-style eval readiness, case quality target 10, and audit-state evidence.
- Missing eval cases are an eval-readiness/certification issue, not a content_score penalty.
- Findings may cover both content and eval design, but evidence must state which surface is being judged.

STATIC FACTS:
Name: ${skill.name}
Description: ${skill.description}
Subject/category: ${skill.subject} / ${skill.category}
Path: ${skill.file}
Public: ${skill.public}
Line count: ${skill.line_count}
Static content pre-score: ${staticResult.content_score}
Static eval readiness pre-score: ${staticResult.eval_readiness_score}
Eval summary: ${evalFacts}
Audit summary: ${audit}

SKILL.md:
${skill.content}
`;
}

function safeFilePart(name) {
  return String(name || 'skill').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
}

function writeReviewBundle(skill, staticResult, index, fullPrompt) {
  const dir = path.join(BUNDLE_DIR, `${String(index + 1).padStart(3, '0')}-${safeFilePart(skill.name)}`);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const bundlePath = path.join(dir, 'review-bundle.md');
  fs.writeFileSync(bundlePath, fullPrompt);
  return { dir, bundlePath };
}

function promptForReviewer(reviewer, fullPrompt, bundlePath) {
  if (reviewer.kind !== 'opencode') return fullPrompt;
  return `You are an independent reviewer in a Skill Graph CONTENT evaluation run.
The complete review bundle is attached as review-bundle.md and is also available in the current directory.
Evaluate only that attached bundle. Do not inspect the wider workspace.
Return one compact JSON object only with: content_score, eval_readiness_score, content_grade, verdict, exactly 3 findings, blockers, next_action.
Do not reduce content_score because eval cases are missing; missing evals affect eval_readiness_score only.
Use the rubric and evidence inside review-bundle.md.`;
}

function synthesize(skill, staticResult, reviews) {
  const parsedScore = (review, key, fallbackKey = null) => {
    if (!review.parsed) return null;
    if (typeof review.parsed[key] === 'number') return review.parsed[key];
    if (fallbackKey && typeof review.parsed[fallbackKey] === 'number') return review.parsed[fallbackKey];
    return null;
  };
  const validContent = reviews.filter((review) => parsedScore(review, 'content_score', 'score') != null);
  const validEval = reviews.filter((review) => parsedScore(review, 'eval_readiness_score') != null);
  let contentScore = staticResult.content_score;
  let evalReadinessScore = staticResult.eval_readiness_score;

  if (validContent.length) {
    const opus = validContent.find((review) => review.reviewer === 'opus');
    const advisory = validContent.filter((review) => review.reviewer !== 'opus');
    const advisoryAvg = advisory.length
      ? advisory.reduce((sum, review) => sum + parsedScore(review, 'content_score', 'score'), 0) / advisory.length
      : null;
    if (opus && advisoryAvg != null) contentScore = Math.round(parsedScore(opus, 'content_score', 'score') * 0.55 + staticResult.content_score * 0.25 + advisoryAvg * 0.20);
    else if (opus) contentScore = Math.round(parsedScore(opus, 'content_score', 'score') * 0.70 + staticResult.content_score * 0.30);
    else contentScore = Math.round(staticResult.content_score * 0.65 + advisoryAvg * 0.35);
  }

  if (validEval.length) {
    const opus = validEval.find((review) => review.reviewer === 'opus');
    const advisory = validEval.filter((review) => review.reviewer !== 'opus');
    const advisoryAvg = advisory.length
      ? advisory.reduce((sum, review) => sum + parsedScore(review, 'eval_readiness_score'), 0) / advisory.length
      : null;
    if (opus && advisoryAvg != null) evalReadinessScore = Math.round(parsedScore(opus, 'eval_readiness_score') * 0.55 + staticResult.eval_readiness_score * 0.25 + advisoryAvg * 0.20);
    else if (opus) evalReadinessScore = Math.round(parsedScore(opus, 'eval_readiness_score') * 0.70 + staticResult.eval_readiness_score * 0.30);
    else evalReadinessScore = Math.round(staticResult.eval_readiness_score * 0.65 + advisoryAvg * 0.35);
  }

  const contentFindings = [...staticResult.content_findings];
  const evalFindings = [...staticResult.eval_findings];
  for (const review of reviews.filter((item) => item.parsed)) {
    const reviewerFindings = Array.isArray(review.parsed.findings) ? review.parsed.findings : [];
    for (const finding of reviewerFindings) {
      if (finding == null) continue;
      const findingText = typeof finding === 'object'
        ? (finding.finding || finding.summary || finding.issue || JSON.stringify(finding))
        : String(finding);
      const normalized = {
        severity: typeof finding === 'object' && finding.severity ? finding.severity : 'INFO',
        dimension: typeof finding === 'object' && finding.dimension ? finding.dimension : `reviewer:${review.reviewer}`,
        finding: findingText,
        evidence: typeof finding === 'object' && finding.evidence ? finding.evidence : `reviewer ${review.reviewer}`,
        action: typeof finding === 'object' && finding.action ? finding.action : '',
      };
      if (/eval|case|baseline|assert|audit|certif|behavior gate/i.test(`${normalized.dimension} ${normalized.finding}`)) {
        evalFindings.push(normalized);
      } else {
        contentFindings.push(normalized);
      }
    }
  }

  const dedupe = (findings) => {
    const seen = new Set();
    const deduped = [];
    for (const finding of findings) {
      const key = `${finding.dimension}|${finding.finding}`.toLowerCase().slice(0, 240);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(finding);
    }
    return deduped;
  };
  const dedupedContent = dedupe(contentFindings);
  const dedupedEval = dedupe(evalFindings);
  const combinedFindings = [...dedupedContent, ...dedupedEval];

  const blockers = [];
  if (!skill.public) blockers.push('public:false; external reviewer panel skipped for privacy/publication boundary');
  for (const review of reviews.filter((r) => !r.ok || !r.parsed)) {
    blockers.push(`${review.reviewer}: ${review.timeout ? 'timeout' : review.error || (review.code != null ? `exit ${review.code}` : 'unparsed output')}`);
  }

  const concreteAction = (findings) => findings
    .map((finding) => String(finding.action || '').trim())
    .find((action) => action && !/^(none|no action|preserve|maintain|n\/a)\b/i.test(action));
  const nextAction = concreteAction(dedupedContent)
    || concreteAction(dedupedEval)
    || 'Run the audit loop evaluation gate and record sidecar evidence.';
  const certificationStatus = skill.audit.application_verdict === 'APPLICABLE' && skill.eval.files.length
    ? 'certified'
    : skill.eval.files.length
      ? 'has eval artifacts but not certified'
      : 'not certified; missing eval artifacts';

  return {
    score: contentScore,
    grade: grade(contentScore),
    content_score: contentScore,
    content_grade: grade(contentScore),
    eval_readiness_score: evalReadinessScore,
    eval_readiness_grade: grade(evalReadinessScore),
    certification_status: certificationStatus,
    verdict: contentScore >= 85
      ? 'Strong authored skill content; certification is reported separately.'
      : contentScore >= 75
        ? 'Useful authored skill content with some content-level hardening needed.'
        : contentScore >= 65
          ? 'Partial authored skill content; improve clarity, boundaries, procedure, or grounding.'
          : 'Weak authored skill content; repair the skill itself before certification work.',
    content_findings: dedupedContent,
    eval_findings: dedupedEval,
    findings: combinedFindings,
    blockers,
    next_action: nextAction,
  };
}

function buildMarkdown(report) {
  const lines = [];
  const results = report.results;
  lines.push(
    `# Skill Content Evaluation Run (${report.run_id})`,
    '',
    `Mode: ${report.mode}`,
    `Generated: ${report.generated_at}`,
    `Target: ${report.target}`,
    `Total skills evaluated: ${report.total_skills_evaluated}`,
    '',
    '## Methodology',
    'Evaluated the authored SKILL.md content and eval design only. The run did not evaluate whether agents used each skill correctly in the codebase and did not run SYSTEM evaluation. Skill Metadata Protocol v8 sidecar separation was applied: missing audit/eval fields inside SKILL.md were not treated as defects.',
    '',
    'Score/Grade mean authored SKILL.md content quality only: purpose/scope, activation, boundary, instructional procedure, and grounding. Eval artifacts, Agent Skills-style eval readiness, case quality, audit-state evidence, and certification blockers are reported separately and do not reduce the content score.',
    '',
    `Reviewer timeout: ${report.reviewer_timeout_ms}ms default; Opus ${report.reviewer_timeouts_ms.opus}ms, Gemini Flash ${report.reviewer_timeouts_ms['gemini-flash']}ms, DeepSeek Flash ${report.reviewer_timeouts_ms['deepseek-flash']}ms, MiMo ${report.reviewer_timeouts_ms.mimo}ms. Timeout is documented here and in JSON; set a timeout env var to 0 for no timeout.`,
    '',
    'External references used:',
  );
  for (const source of report.external_sources) {
    lines.push(`- ${source.url} — ${source.note}`);
  }
  lines.push(
    '',
    'OpenCode reviewers receive an attached per-skill `review-bundle.md` from a scratch directory; they are instructed to use only that bundle and not inspect the wider workspace.',
    '',
    '## Model / Agent Roster',
    '- Opus 4.8 via Claude CLI alias `opus`',
    '- Gemini Flash via Gemini CLI `gemini-3-flash-preview`',
    '- DeepSeek V4 Flash via OpenCode `opencode/deepseek-v4-flash-free`',
    '- MiMo V2.5 via OpenCode `opencode/mimo-v2.5-free`',
    '',
    'Gemini Pro (`gemini`) is in the current advisory alias set but is not a free agent; its smoke probe did not complete cleanly in this environment and it was excluded from the free-agent reviewer set.',
    '',
    '## Parallel Proof',
    report.parallel_proof.method,
    '',
    report.parallel_proof.unit_test,
    '',
    `Raw reviewer timing is stored per skill under ${report.raw_reviewer_dir}.`,
    '',
    '## Content Score Distribution',
    '| Grade | Count |',
    '|---|---:|',
  );
  for (const [gradeKey, count] of Object.entries(report.score_distribution)) lines.push(`| ${gradeKey} | ${count} |`);
  lines.push('', `Average content score: ${report.score_summary.avg}; min: ${report.score_summary.min}; max: ${report.score_summary.max}.`, '');

  lines.push('## Score Table', '| Skill | Category | Content score | Content grade | Eval readiness | Eval cases | Application verdict | Blocked? |', '|---|---|---:|:---:|---:|---:|---|---|');
  for (const result of results) {
    lines.push(`| ${result.name} | ${result.category} | ${result.synthesis.content_score} | ${result.synthesis.content_grade} | ${result.synthesis.eval_readiness_score} | ${result.eval_summary.cases} | ${result.audit_state.application_verdict || ''} | ${result.synthesis.blockers.length ? 'yes' : 'no'} |`);
  }

  lines.push('', '## Per-Skill Findings');
  for (const result of results) {
    lines.push(
      `### ${result.name}`,
      `Path: ${result.path}`,
      `Content score: ${result.synthesis.content_score} (${result.synthesis.content_grade})`,
      `Eval readiness score: ${result.synthesis.eval_readiness_score} (${result.synthesis.eval_readiness_grade})`,
      `Certification status: ${result.synthesis.certification_status}`,
      `Verdict: ${result.synthesis.verdict}`,
      `Next action: ${result.synthesis.next_action}`,
      '',
      'Content findings:',
    );
    for (const finding of result.synthesis.content_findings) {
      lines.push(`- [${finding.severity}] ${finding.dimension}: ${finding.finding} Evidence: ${finding.evidence} Action: ${finding.action}`);
    }
    if (!result.synthesis.content_findings.length) lines.push('- No material content finding from this pass.');
    lines.push('', 'Eval and certification findings:');
    for (const finding of result.synthesis.eval_findings) {
      lines.push(`- [${finding.severity}] ${finding.dimension}: ${finding.finding} Evidence: ${finding.evidence} Action: ${finding.action}`);
    }
    if (!result.synthesis.eval_findings.length) lines.push('- No material eval-readiness finding from this pass.');
    if (result.synthesis.blockers.length) {
      lines.push('', 'Blockers:');
      for (const blocker of result.synthesis.blockers) lines.push(`- ${blocker}`);
    }
    lines.push('');
  }

  lines.push(
    '## Corpus Summary',
    `- Blocked skills: ${report.blocked_skills.length}`,
    `- Strong but uncertified skills: ${report.strong_but_uncertified.length}`,
    `- Skills missing eval artifacts: ${report.skills_missing_eval_artifacts.length}`,
    `- Skills with weak eval artifacts: ${report.skills_weak_eval_artifacts.length}`,
    '',
    '## Recommended Next Actions',
    '1. Author or repair eval artifacts for every skill with no eval JSON, prioritizing high-scoring uncertified skills first.',
    '2. Expand existing eval sets to 10 cases with positives, hard negatives, boundary cases, and regression-style cases.',
    '3. Add baseline comparability and gradeable assertions to eval sets that currently have prompts/expected text only.',
    '4. Re-run the Behavior Gate for strong skills after eval artifacts are repaired so application_verdict can move from PROVISIONAL/UNVERIFIED to APPLICABLE when earned.',
  );

  return lines.join('\n');
}

async function evaluateSkill(file, index) {
  const skill = metadataFor(file);
  const claim = [
    'CLAIMING SKILL',
    `Name: ${skill.name}`,
    `Description: ${skill.description}`,
    `Category: ${skill.category || skill.subject}`,
    `Path: ${skill.file}`,
    '',
  ].join('\n');
  console.log(claim);

  const staticResult = staticEval(skill);
  let reviews = [];
  const rawPath = path.join(RAW_DIR, `${String(index + 1).padStart(3, '0')}-${skill.name}.reviewers.json`);
  if (process.env.REUSE_RAW === '1' && fs.existsSync(rawPath)) {
    reviews = readJsonMaybe(rawPath) || [];
  } else if (REVIEWERS_ENABLED && skill.public) {
    const fullPrompt = promptFor(skill, staticResult);
    const bundle = writeReviewBundle(skill, staticResult, index, fullPrompt);
    const starts = [];
    const promises = REVIEWERS.map((reviewer) => {
      starts.push({ reviewer: reviewer.name, spawn_requested_at: new Date().toISOString() });
      const prompt = promptForReviewer(reviewer, fullPrompt, bundle.bundlePath);
      const options = reviewer.kind === 'opencode'
        ? {
            cwd: bundle.dir,
            args: [
              ...reviewer.args,
              '--dir',
              bundle.dir,
              '--file',
              bundle.bundlePath,
              '--title',
              `content-eval-${skill.name}`,
            ],
          }
        : {};
      return runCmd(reviewer, prompt, reviewer.timeout, options);
    });
    reviews = await Promise.all(promises);
    for (const review of reviews) {
      review.spawn_requested_at = starts.find((start) => start.reviewer === review.reviewer)?.spawn_requested_at || null;
      review.review_bundle = bundle.bundlePath;
    }
  } else {
    const reason = skill.public ? 'reviewers disabled' : 'public:false; external dispatch skipped';
    reviews = REVIEWERS.map((reviewer) => ({
      reviewer: reviewer.name,
      model: reviewer.model,
      ok: false,
      skipped: true,
      started_at: null,
      ended_at: null,
      duration_ms: 0,
      error: reason,
    }));
  }

  fs.writeFileSync(rawPath, JSON.stringify(reviews, null, 2));

  const synthesis = synthesize(skill, staticResult, reviews);
  const topSource = [
    ...synthesis.content_findings.filter((finding) => finding.severity !== 'INFO'),
    ...synthesis.content_findings.filter((finding) => finding.severity === 'INFO'),
  ];
  const top = topSource.slice(0, 3).map((finding) => finding.finding);
  while (top.length < 3) {
    top.push(top.length === 0
      ? 'No material content finding from this pass; eval readiness is recorded separately.'
      : `No ${top.length === 1 ? 'second' : 'third'} material content finding from this pass.`);
  }
  const completed = [
    'COMPLETED SKILL',
    `Name: ${skill.name}`,
    `Score: ${synthesis.content_score}`,
    `Grade: ${synthesis.content_grade}`,
    `Verdict: ${synthesis.verdict}`,
    'Top findings:',
    `- ${top[0]}`,
    `- ${top[1]}`,
    `- ${top[2]}`,
    `Next action: ${synthesis.next_action}`,
    '',
  ].join('\n');
  console.log(completed);

  return {
    name: skill.name,
    description: skill.description,
    category: skill.category,
    subject: skill.subject,
    path: skill.file,
    public: skill.public,
    line_count: skill.line_count,
    hash: skill.hash,
    claim_block: claim,
    completion_block: completed,
    static: staticResult,
    audit_state: skill.audit,
    eval_summary: skill.eval,
    reviewer_raw_path: rawPath,
    reviewers: reviews.map((review) => ({
      reviewer: review.reviewer,
      model: review.model,
      ok: review.ok,
      timeout: review.timeout || false,
      skipped: review.skipped || false,
      started_at: review.started_at,
      ended_at: review.ended_at,
      duration_ms: review.duration_ms,
      spawn_requested_at: review.spawn_requested_at,
      content_score: review.parsed && (review.parsed.content_score ?? review.parsed.score),
      eval_readiness_score: review.parsed && review.parsed.eval_readiness_score,
      content_grade: review.parsed && (review.parsed.content_grade ?? review.parsed.grade),
      verdict: review.parsed && review.parsed.verdict,
      error: review.error || (!review.parsed ? 'unparsed' : null),
    })),
    synthesis,
  };
}

async function main() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  const allFiles = listSkillFiles(SKILLS_ROOT);
  const files = allFiles.slice(START_AT - 1, START_AT - 1 + MAX);
  const docs = REQUIRED_DOCS.map((rel) => {
    const file = path.join(ROOT, rel);
    const exists = fs.existsSync(file);
    const content = exists ? fs.readFileSync(file, 'utf8') : '';
    return { path: file, exists, lines: content ? content.split('\n').length : 0, sha256_16: content ? sha(content) : null };
  });

  const results = [];
  for (let i = 0; i < files.length; i += 1) {
    results.push(await evaluateSkill(files[i], START_AT - 1 + i));
    fs.writeFileSync(path.join(OUT_DIR, `skill-content-evaluation-${RUN_ID}.partial.json`), JSON.stringify({
      run_id: RUN_ID,
      mode: 'CONTENT',
      partial: true,
      generated_at: new Date().toISOString(),
      target: SKILLS_ROOT,
      total_completed: results.length,
      last_completed: results[results.length - 1].name,
      results,
    }, null, 2));
  }

  const scores = results.map((result) => result.synthesis.score);
  const distribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const result of results) distribution[result.synthesis.grade] += 1;

  const missingEval = results.filter((result) => !result.eval_summary.files.length).map((result) => result.name);
  const weakEval = results.filter((result) => result.eval_summary.files.length && (result.eval_summary.cases < 10 || result.eval_summary.assertions < result.eval_summary.cases || !result.eval_summary.baseline)).map((result) => result.name);
  const blocked = results.filter((result) => result.synthesis.blockers.length).map((result) => ({ name: result.name, blockers: result.synthesis.blockers }));
  const strongUncertified = results.filter((result) => result.synthesis.score >= 80 && (result.audit_state.application_verdict !== 'APPLICABLE' || result.eval_summary.files.length === 0)).map((result) => result.name);

  const report = {
    run_id: RUN_ID,
    mode: 'CONTENT',
    generated_at: new Date().toISOString(),
    target: SKILLS_ROOT,
    total_skills_evaluated: results.length,
    agents_used: ['opus', 'gemini-flash', 'deepseek-flash', 'mimo'],
    configured_advisory_note: 'Current Skill Audit Loop ADVISORY_MODELS are gemini, deepseek-flash, mimo, gemini-flash; this run used the free agents among them plus Opus. Gemini Pro smoke was unhealthy and is not a free agent.',
    reviewer_timeout_ms: DEFAULT_REVIEWER_TIMEOUT_MS,
    reviewer_timeouts_ms: Object.fromEntries(REVIEWERS.map((reviewer) => [reviewer.name, reviewer.timeout])),
    docs_read: docs,
    external_sources: EXTERNAL_SOURCES,
    raw_reviewer_dir: RAW_DIR,
    parallel_proof: {
      method: 'For each public skill, reviewer child processes are spawned before awaiting Promise.all; per-reviewer spawn_requested_at/started_at/ended_at are recorded. OpenCode reviewers use isolated temporary model CLI homes and attached per-skill review bundles in scratch directories to avoid shared SQLite locks and broad workspace reads.',
      unit_test: 'node skill-graph/scripts/__tests__/test-advisory-panel.js passed 30 checks, including worker panel starts advisory models in parallel.',
    },
    score_distribution: distribution,
    score_summary: {
      min: scores.length ? Math.min(...scores) : null,
      max: scores.length ? Math.max(...scores) : null,
      avg: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    },
    blocked_skills: blocked,
    strong_but_uncertified: strongUncertified,
    skills_missing_eval_artifacts: missingEval,
    skills_weak_eval_artifacts: weakEval,
    results,
  };

  const jsonPath = path.join(OUT_DIR, `skill-content-evaluation-${RUN_ID}.json`);
  const mdPath = path.join(OUT_DIR, `skill-content-evaluation-${RUN_ID}.md`);
  const logPath = path.join(OUT_DIR, `claim-completion-${RUN_ID}.log`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdPath, buildMarkdown(report));
  fs.writeFileSync(logPath, results.map((result) => `${result.claim_block}\n${result.completion_block}`).join('\n'));
  console.log(JSON.stringify({ jsonPath, mdPath, logPath, total: results.length }, null, 2));
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
