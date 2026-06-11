#!/usr/bin/env node

'use strict';

/**
 * Batch Skill Evaluator — runs the eval pipeline across all (or filtered) skills.
 *
 * Discovers skill directories, resolves their eval files, and runs evaluate-skill.js
 * for each skill with concurrency control and resume support.
 *
 * Usage:
 *   node scripts/skill/batch-eval.js                           # Run all unevaluated skills
 *   node scripts/skill/batch-eval.js --all                     # Run all skills (including already evaluated)
 *   node scripts/skill/batch-eval.js --concurrency 2           # Max 2 parallel eval jobs
 *   node scripts/skill/batch-eval.js --filter "dashboard,auth" # Only skills matching these names
 *   node scripts/skill/batch-eval.js --scope sales-hub         # Only sales-hub skills
 *   node scripts/skill/batch-eval.js --scope shared            # Only shared skills
 *   node scripts/skill/batch-eval.js --filter auth             # Run matching skill evals
 *   node scripts/skill/batch-eval.js --dry-run                 # List what would be evaluated
 *   node scripts/skill/batch-eval.js --max N                   # Evaluate at most N skills
 *   node scripts/skill/batch-eval.js --report                  # Just generate report from existing history
 *
 * Output (paths resolved via ./log-paths — monorepo layout shown; a standalone
 * install falls back to <workspace>/.skill-graph/{logs,progress}):
 *   - Eval results appended to agent-orchestration/logs/eval-history.jsonl (by evaluate-skill.js)
 *   - Batch report written to .opencode/progress/skills/batch-eval/latest-report.json
 *
 * Resume: By default, skips skills that already have entries in eval-history.jsonl.
 *         Use --all to force re-evaluation, or --since YYYY-MM-DD to only skip recent evals.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const { skillHistoryKeyFromDir } = require('./skill-improvement-helpers');
// Standalone-safe path resolution (no `path.resolve(__dirname, '../..')`
// monorepo assumption): roots.js resolves the configured skill library
// (nested-aware) from .skill-graph/config.json; log-paths.js resolves the eval
// history + progress dir via env-var → monorepo → standalone fallback.
const { resolveSkillRoots, walkSkillFiles } = require('./roots');
const { WORKSPACE, EVAL_HISTORY_LOG, PROGRESS_BASE_DIR } = require('./log-paths');
const { writeRunnerHeartbeat } = require('./panel-status-file');

const EVAL_HISTORY = EVAL_HISTORY_LOG;
const REPORT_DIR = path.join(PROGRESS_BASE_DIR, 'skills', 'batch-eval');
const EVALUATE_SCRIPT = path.join(__dirname, 'evaluate-skill.js');

// Skill roots come from the configured skill library (.skill-graph/config.json),
// not a hardcoded workspace layout. Each configured root carries an optional
// `project` tag, which becomes the eval scope ('shared' when unscoped) so the
// --scope filter keeps working across both monorepo and standalone installs.
const SKILL_ROOTS = resolveSkillRoots(WORKSPACE).map((entry) => ({
  root: entry.absPath,
  scope: entry.project || 'shared',
}));

// ─── CLI Parsing ────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--all') { args.all = true; continue; }
    if (token === '--dry-run') { args.dryRun = true; continue; }
    if (token === '--report') { args.reportOnly = true; continue; }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ─── Skill Discovery ────────────────────────────────────────────────

function discoverSkills(scopeFilter) {
  const skills = [];

  for (const { root, scope } of SKILL_ROOTS) {
    if (scopeFilter && scope !== scopeFilter) continue;
    if (!fs.existsSync(root)) continue;

    // walkSkillFiles is nested-aware — the canonical library is laid out as
    // skills/<subject>/<name>/SKILL.md, so a flat readdir would only see the
    // subject directories. It also skips `_`/`.`-prefixed dirs internally.
    for (const skillFile of walkSkillFiles(root)) {
      const skillDir = path.dirname(skillFile);
      const name = path.basename(skillDir);
      if (name.startsWith('_')) continue;

      // Find eval file
      let evalFile = null;
      for (const candidate of ['evals/evals.json', 'evals/eval-set.json']) {
        const fp = path.join(skillDir, candidate);
        if (fs.existsSync(fp)) {
          try {
            const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
            const count = data.evals ? data.evals.length : 0;
            if (count > 0) { evalFile = fp; break; }
          } catch { /* skip corrupt files */ }
        }
      }

      if (!evalFile) continue;

      const data = JSON.parse(fs.readFileSync(evalFile, 'utf8'));
      skills.push({
        name,
        historyKey: skillHistoryKeyFromDir(skillDir),
        scope,
        skillDir,
        evalFile,
        evalCount: data.evals ? data.evals.length : 0,
        lines: fs.readFileSync(skillFile, 'utf8').split('\n').length,
      });
    }
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── History Reading ────────────────────────────────────────────────

function loadEvalHistory(sinceDate) {
  const evaluated = new Map(); // skill -> { count, lastTimestamp, passRate }

  if (!fs.existsSync(EVAL_HISTORY)) return evaluated;

  for (const line of fs.readFileSync(EVAL_HISTORY, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line);
      if (sinceDate && new Date(entry.timestamp) < sinceDate) continue;

      const skillKey = entry.skill_key || entry.skill;
      if (!skillKey) continue;

      if (!evaluated.has(skillKey)) {
        evaluated.set(skillKey, { count: 0, passed: 0, failed: 0, lastTimestamp: entry.timestamp });
      }
      const record = evaluated.get(skillKey);
      record.count++;
      if (entry.passed) record.passed++;
      else record.failed++;
      if (entry.timestamp > record.lastTimestamp) record.lastTimestamp = entry.timestamp;
    } catch { /* skip corrupt lines */ }
  }

  return evaluated;
}

// ─── Eval Execution ─────────────────────────────────────────────────

function runSkillEval(skill, options) {
  return new Promise((resolve) => {
    const args = [
      EVALUATE_SCRIPT,
      '--workspace', WORKSPACE,
      '--grader', options.grader || 'opencode',
    ];

    const artifactDir = path.join(REPORT_DIR, 'artifacts', skill.name);
    fs.mkdirSync(artifactDir, { recursive: true });
    args.push('--artifacts-dir', artifactDir);
    args.push('--output', path.join(artifactDir, 'results.json'));
    args.push(skill.evalFile);

    const startTime = Date.now();

    const child = execFile(process.execPath, args, {
      cwd: WORKSPACE,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    }, (error, stdout, stderr) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (error) {
        console.log(`  ✗ ${skill.name} (${elapsed}s) — ${error.message.split('\n')[0]}`);
        resolve({
          skill: skill.name,
          scope: skill.scope,
          status: 'error',
          error: error.message.split('\n')[0],
          elapsed: Number(elapsed),
        });
        return;
      }

      // Parse results from artifacts
      let results = null;
      try {
        results = JSON.parse(fs.readFileSync(path.join(artifactDir, 'results.json'), 'utf8'));
      } catch { /* results file may not exist */ }

      const passed = results ? results.candidatePassed : 0;
      const total = results ? results.total : skill.evalCount;

      console.log(`  ✓ ${skill.name} (${elapsed}s) — ${passed}/${total} passed`);
      resolve({
        skill: skill.name,
        scope: skill.scope,
        status: 'completed',
        passed,
        total,
        elapsed: Number(elapsed),
      });
    });
  });
}

// ─── Concurrency Limiter ────────────────────────────────────────────

async function runWithConcurrency(tasks, concurrency, executor) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await executor(tasks[currentIndex], currentIndex);
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
  return results;
}

// ─── Report Generation ──────────────────────────────────────────────

function generateReport(evalResults, history) {
  const now = new Date().toISOString();
  const completed = evalResults.filter(r => r.status === 'completed');
  const errored = evalResults.filter(r => r.status === 'error');

  const totalPassed = completed.reduce((s, r) => s + (r.passed || 0), 0);
  const totalCases = completed.reduce((s, r) => s + (r.total || 0), 0);
  const totalElapsed = evalResults.reduce((s, r) => s + (r.elapsed || 0), 0);

  const report = {
    timestamp: now,
    summary: {
      skillsEvaluated: completed.length,
      skillsErrored: errored.length,
      totalEvalCases: totalCases,
      totalPassed: totalPassed,
      passRate: totalCases > 0 ? (totalPassed / totalCases * 100).toFixed(1) + '%' : 'N/A',
      totalElapsedSeconds: Number(totalElapsed.toFixed(1)),
    },
    historyCoverage: {
      skillsInHistory: history.size,
      totalHistoryEntries: Array.from(history.values()).reduce((s, h) => s + h.count, 0),
    },
    results: evalResults,
    errors: errored.map(r => ({ skill: r.skill, error: r.error })),
  };

  return report;
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const concurrency = Number(args.concurrency) || 1;
  const maxSkills = args.max ? Number(args.max) : Infinity;
  const nameFilter = args.filter ? args.filter.split(',').map(s => s.trim().toLowerCase()) : null;
  const scopeFilter = args.scope || null;
  const sinceDate = args.since ? new Date(args.since) : null;

  // Load history for resume
  const history = loadEvalHistory(sinceDate);

  if (args.reportOnly) {
    console.log('=== Eval History Report ===');
    console.log(`Skills in history: ${history.size}`);
    for (const [skill, data] of Array.from(history.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
      const rate = data.count > 0 ? (data.passed / data.count * 100).toFixed(0) : '?';
      console.log(`  ${skill}: ${data.passed}/${data.count} (${rate}%) — last: ${data.lastTimestamp}`);
    }
    return;
  }

  // Discover skills
  const allSkills = discoverSkills(scopeFilter);
  console.log(`Discovered ${allSkills.length} skills with eval files`);

  // Apply filters
  let skills = allSkills;

  if (nameFilter) {
    skills = skills.filter(s =>
      nameFilter.some(f => s.name.toLowerCase().includes(f))
    );
    console.log(`After name filter: ${skills.length} skills`);
  }

  // Resume filter: skip already-evaluated skills
  if (!args.all) {
    const before = skills.length;
    skills = skills.filter(s => !history.has(s.historyKey));
    if (before !== skills.length) {
      console.log(`Skipping ${before - skills.length} already-evaluated skills (use --all to re-evaluate)`);
    }
  }

  // Apply max limit
  if (skills.length > maxSkills) {
    skills = skills.slice(0, maxSkills);
    console.log(`Limited to ${maxSkills} skills`);
  }

  if (skills.length === 0) {
    console.log('No skills to evaluate. Use --all to re-evaluate previously completed skills.');
    return;
  }

  console.log(`\nWill evaluate ${skills.length} skills (${skills.reduce((s, sk) => s + sk.evalCount, 0)} eval cases)`);
  console.log(`Concurrency: ${concurrency}\n`);

  if (args.dryRun) {
    console.log('=== Dry Run — would evaluate: ===');
    for (const s of skills) {
      console.log(`  ${s.name} (${s.scope}, ${s.evalCount} evals, ${s.lines} lines)`);
    }
    console.log(`\nTotal: ${skills.length} skills, ${skills.reduce((s, sk) => s + sk.evalCount, 0)} eval cases`);
    return;
  }

  // Ensure report directory
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  // D5: heartbeat status.json so watch-panel.js / watch-audit-batch.sh can observe the
  // batch run (default under the report dir; --status-file overrides). One agents[] row
  // per skill; counters update as results land.
  const statusFile = args['status-file'] || path.join(REPORT_DIR, 'status.json');
  const heartbeatRows = skills.map((s) => ({ model: s.name, tier: 'eval', phase: 'evaluate', state: 'pending' }));
  let hbDone = 0;
  let hbFailed = 0;
  const heartbeat = (complete = false) => writeRunnerHeartbeat(statusFile, {
    skill: null, phase: 'batch-eval', total: skills.length, done: hbDone, failed: hbFailed, complete, agents: heartbeatRows,
  });
  heartbeat();

  // Run evaluations
  const startTime = Date.now();
  const options = {
    grader: args.grader || 'opencode',
  };

  const results = await runWithConcurrency(skills, concurrency, async (skill, index) => {
    console.log(`[${index + 1}/${skills.length}] Evaluating ${skill.name} (${skill.evalCount} cases)...`);
    heartbeatRows[index].state = 'running';
    heartbeat();
    const r = await runSkillEval(skill, options);
    if (r && r.status === 'error') { heartbeatRows[index].state = 'failed'; hbFailed += 1; }
    else { heartbeatRows[index].state = 'done'; hbDone += 1; }
    heartbeat();
    return r;
  });

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Batch Complete (${totalElapsed}s) ===`);
  heartbeat(true);

  // Reload history to include new results
  const updatedHistory = loadEvalHistory(null);

  // Generate and save report
  const report = generateReport(results, updatedHistory);
  const reportPath = path.join(REPORT_DIR, 'latest-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${path.relative(WORKSPACE, reportPath)}`);

  // Summary
  console.log(`\nSkills evaluated: ${report.summary.skillsEvaluated}`);
  console.log(`Skills errored: ${report.summary.skillsErrored}`);
  console.log(`Total cases: ${report.summary.totalEvalCases}`);
  console.log(`Pass rate: ${report.summary.passRate}`);
  console.log(`History coverage: ${updatedHistory.size}/${allSkills.length} skills`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
