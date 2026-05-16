#!/usr/bin/env node
/**
 * build-retrieval-baseline — Phase 0a evidence for the Skill Graph v5 plan.
 *
 * Produces `evals/retrieval-baseline-v0.json`: a 30-query corpus spanning
 * UX, UI, Visual Design, Digital Design, Development, Code Quality, and
 * AI Agent Web Dev, with each query's live router top-5 captured against
 * the current manifest. The artifact is the before-state every later
 * migration/authoring phase will be compared against.
 *
 * Per `docs/plans/skill-taxonomy-v5-and-gap-fill.md` § Phase 0:
 *   For each query record:
 *     (i)   which existing skill(s) the router activates today
 *     (ii)  whether a reviewer agrees
 *     (iii) which skill should have activated if it existed
 *
 * This builder records (i) live from the router, captures the agent's
 * single-rater (ii)/(iii) assessment, and leaves a `human_reviewer_override`
 * slot null for the user to fill on review. It also tags each query whose
 * intent probes one of the four deferred-pending-eval skills:
 *   state-management, component-architecture, security-fundamentals,
 *   mental-models.
 *
 * Usage:
 *   node scripts/build-retrieval-baseline.js                  # writes file
 *   node scripts/build-retrieval-baseline.js --dry-run        # stdout only
 *   node scripts/build-retrieval-baseline.js --manifest PATH  # custom manifest
 *
 * Re-runnable: rerun after manifest changes to refresh router_top_5.
 * Self-contained. Only Node built-ins + the existing routeSkills module.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { routeSkills } = require('./skill-graph-route');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const DEFAULT_MANIFEST = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'evals', 'retrieval-baseline-v0.json');
const TOP_K = 5;

// ---------------------------------------------------------------------------
// 30-query corpus
// ---------------------------------------------------------------------------
//
// Authoring rules:
//   - Realistic ask language a developer/designer would actually type.
//   - Topic assignment is the primary axis; one topic per query.
//   - `deferred_skill_probe` is set when the query's intent specifically tests
//     whether one of the four deferred skills (state-management,
//     component-architecture, security-fundamentals, mental-models) is needed.
//     At least 2 distinct probes per deferred skill so single-query noise
//     cannot falsify the gap claim.
//   - `agent_expectation_if_missing` records what skill (existing or
//     hypothetical) the agent reviewer believes should top the result.
//     This is a single-rater opinion; the user's `human_reviewer_override`
//     supersedes it.

const QUERIES = [
  // ----- UX (4) -----
  {
    id: 1,
    topic: 'UX',
    prompt: 'Whats the right empty state for a search results page with no matches',
    agent_expectation_if_missing: 'form-ux-architecture',
    deferred_skill_probe: null,
    note: 'Empty-state design is a recurring UX micro-pattern; tests whether the library has a coherent home for it.',
  },
  {
    id: 2,
    topic: 'UX',
    prompt: 'User keeps getting confused about how to undo their last action — what UX patterns help',
    agent_expectation_if_missing: 'interaction-patterns',
    deferred_skill_probe: null,
    note: 'Undo affordance is a Norman-style mental-model query; partial probe for mental-models gap.',
  },
  {
    id: 3,
    topic: 'UX',
    prompt: 'Should I use a modal or a side panel for editing this item',
    agent_expectation_if_missing: 'interaction-patterns',
    deferred_skill_probe: null,
    note: 'Modal-vs-panel is a classic UX decision; tests whether interaction-patterns owns it cleanly.',
  },
  {
    id: 4,
    topic: 'UX',
    prompt: 'How do I think about progressive disclosure when designing a complex form',
    agent_expectation_if_missing: 'mental-models',
    deferred_skill_probe: 'mental-models',
    note: 'Progressive disclosure is a named UX mental model (Nielsen); probes mental-models gap.',
  },

  // ----- UI (4) -----
  {
    id: 5,
    topic: 'UI',
    prompt: 'I need to design a data table with sortable columns and selectable rows',
    agent_expectation_if_missing: 'design-module-composition',
    deferred_skill_probe: null,
    note: 'Data-table is a high-frequency UI pattern; tests composition coverage.',
  },
  {
    id: 6,
    topic: 'UI',
    prompt: 'Whats the right button hierarchy when I have three actions of similar importance',
    agent_expectation_if_missing: 'visual-hierarchy',
    deferred_skill_probe: null,
    note: 'Button-hierarchy is a visual-design + UI decision; tests visual-hierarchy fit.',
  },
  {
    id: 7,
    topic: 'UI',
    prompt: 'How should I show 50 plus items in a list — pagination, infinite scroll, or virtualization',
    agent_expectation_if_missing: 'interaction-patterns',
    deferred_skill_probe: null,
    note: 'List rendering strategy spans UX + frontend perf; boundary query.',
  },
  {
    id: 8,
    topic: 'UI',
    prompt: 'Tooltip vs popover — which one for an inline help icon',
    agent_expectation_if_missing: 'interaction-patterns',
    deferred_skill_probe: null,
    note: 'Component-vocab decision; tests fine-grained UI coverage.',
  },

  // ----- Visual Design (4) -----
  {
    id: 9,
    topic: 'Visual Design',
    prompt: 'How do I pick a color palette that works in both light and dark mode',
    agent_expectation_if_missing: 'color-system-design',
    deferred_skill_probe: null,
    note: 'Direct color-system query; tests router on existing color-system-design.',
  },
  {
    id: 10,
    topic: 'Visual Design',
    prompt: 'Whats the right type scale for a dense data dashboard',
    agent_expectation_if_missing: 'typography-system',
    deferred_skill_probe: null,
    note: 'Type-scale query; tests typography-system fit.',
  },
  {
    id: 11,
    topic: 'Visual Design',
    prompt: 'My icons look inconsistent across the app — how do I systematize them',
    agent_expectation_if_missing: 'design-system-architecture',
    deferred_skill_probe: null,
    note: 'Icon-system is a sub-discipline of design-system-architecture; coverage probe.',
  },
  {
    id: 12,
    topic: 'Visual Design',
    prompt: 'How do I balance whitespace without making the page look empty',
    agent_expectation_if_missing: 'layout-composition',
    deferred_skill_probe: null,
    note: 'Whitespace is a Tufte-style visual-design concept; tests layout-composition.',
  },

  // ----- Digital Design (3) -----
  {
    id: 13,
    topic: 'Digital Design',
    prompt: 'Im building a design system from scratch — what tokens do I need first',
    agent_expectation_if_missing: 'design-system-architecture',
    deferred_skill_probe: null,
    note: 'Design-token entry-point query; tests whether existing skill answers it.',
  },
  {
    id: 14,
    topic: 'Digital Design',
    prompt: 'How do I structure components so they compose well across products',
    agent_expectation_if_missing: 'component-architecture',
    deferred_skill_probe: 'component-architecture',
    note: 'Direct probe for component-architecture deferred skill.',
  },
  {
    id: 15,
    topic: 'Digital Design',
    prompt: 'Whats the difference between primitives, patterns, and templates in a design system',
    agent_expectation_if_missing: 'design-module-composition',
    deferred_skill_probe: 'component-architecture',
    note: 'Brad Frost atomic-design vocabulary; secondary probe for component-architecture.',
  },

  // ----- Development (5) -----
  {
    id: 16,
    topic: 'Development',
    prompt: 'Where should I do form validation — client, server, or both',
    agent_expectation_if_missing: 'form-ux-architecture',
    deferred_skill_probe: null,
    note: 'Cross-boundary dev question; tests whether form-ux-architecture or client-server-boundary surfaces.',
  },
  {
    id: 17,
    topic: 'Development',
    prompt: 'I have a list of items that needs filtering, sorting, and pagination — whats the architecture',
    agent_expectation_if_missing: 'state-management',
    deferred_skill_probe: 'state-management',
    note: 'Probe for state-management deferred skill; list-state is the canonical use case.',
  },
  {
    id: 18,
    topic: 'Development',
    prompt: 'How do I structure a Next.js app for the App Router',
    agent_expectation_if_missing: 'frontend-architecture',
    deferred_skill_probe: null,
    note: 'Next App Router query; tests rendering-models / frontend-architecture coverage.',
  },
  {
    id: 19,
    topic: 'Development',
    prompt: 'Should this be a Server Component or a Client Component',
    agent_expectation_if_missing: 'client-server-boundary',
    deferred_skill_probe: null,
    note: 'Wave 2 skill (client-server-boundary) was authored explicitly for this query.',
  },
  {
    id: 20,
    topic: 'Development',
    prompt: 'How do I handle state that needs to live across multiple routes',
    agent_expectation_if_missing: 'state-management',
    deferred_skill_probe: 'state-management',
    note: 'Second probe for state-management; cross-route state is the harder case.',
  },

  // ----- Code Quality (5) -----
  {
    id: 21,
    topic: 'Code Quality',
    prompt: 'How do I write tests for code that calls an external API',
    agent_expectation_if_missing: 'test-doubles-design',
    deferred_skill_probe: null,
    note: 'Wave 4 skill (test-doubles-design) was authored for exactly this question.',
  },
  {
    id: 22,
    topic: 'Code Quality',
    prompt: 'What should I do with this 800 line component thats getting hard to maintain',
    agent_expectation_if_missing: 'refactor',
    deferred_skill_probe: 'component-architecture',
    note: 'Refactor query that also probes whether component-architecture would help here.',
  },
  {
    id: 23,
    topic: 'Code Quality',
    prompt: 'How do I make sure my refactor doesnt break anything',
    agent_expectation_if_missing: 'refactor',
    deferred_skill_probe: null,
    note: 'Tests refactor + testing-strategy coverage.',
  },
  {
    id: 24,
    topic: 'Code Quality',
    prompt: 'How do I detect security vulnerabilities in my code before shipping',
    agent_expectation_if_missing: 'security-fundamentals',
    deferred_skill_probe: 'security-fundamentals',
    note: 'Direct probe for security-fundamentals deferred skill.',
  },
  {
    id: 25,
    topic: 'Code Quality',
    prompt: 'OWASP says I should validate input — where do I actually do that in a typed system',
    agent_expectation_if_missing: 'security-fundamentals',
    deferred_skill_probe: 'security-fundamentals',
    note: 'Second probe for security-fundamentals; intersects with type-safety boundary.',
  },

  // ----- AI Agent Web Dev (5) -----
  {
    id: 26,
    topic: 'AI Agent Web Dev',
    prompt: 'Im building an agent that calls tools — how should I structure the tool definitions',
    agent_expectation_if_missing: 'tool-call-flow',
    deferred_skill_probe: null,
    note: 'Wave 3 skill (tool-call-flow) was authored for this question.',
  },
  {
    id: 27,
    topic: 'AI Agent Web Dev',
    prompt: 'The model passes my evals but users complain about quality — whats wrong',
    agent_expectation_if_missing: 'eval-driven-development',
    deferred_skill_probe: null,
    note: 'Goodhart-style query; eval-driven-development addresses it.',
  },
  {
    id: 28,
    topic: 'AI Agent Web Dev',
    prompt: 'How do I stream model output to the browser without blocking',
    agent_expectation_if_missing: 'streaming-architecture',
    deferred_skill_probe: null,
    note: 'Wave 3 skill (streaming-architecture).',
  },
  {
    id: 29,
    topic: 'AI Agent Web Dev',
    prompt: 'Someone could inject instructions into our agents context — how do I defend',
    agent_expectation_if_missing: 'prompt-injection-defense',
    deferred_skill_probe: null,
    note: 'Wave 3 skill (prompt-injection-defense).',
  },
  {
    id: 30,
    topic: 'AI Agent Web Dev',
    prompt: 'How do I think about race conditions when multiple tool calls run in parallel',
    agent_expectation_if_missing: 'mental-models',
    deferred_skill_probe: 'mental-models',
    note: 'Concurrency mental-model query; second probe for mental-models gap.',
  },
];

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

function loadManifest(manifestPath) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
}

function runQuery(manifest, prompt, todayISO) {
  const result = routeSkills(manifest, {
    query: prompt,
    project: null,
    maxResults: TOP_K,
    minEvalState: 'unverified',
    pathArg: null,
    todayISO,
  });

  const selected = result.selected.map((entry, idx) => ({
    rank: idx + 1,
    skill: entry.skill.name,
    score: entry.score,
    role: entry.role,
    reasons: entry.reasons,
  }));

  const coLoaded = (result.coLoaded || []).map(entry => ({
    skill: entry.skill.name,
    role: entry.role,
    reason: entry.reason,
  }));

  return {
    top_k: selected,
    co_loaded: coLoaded,
    no_match: selected.length === 0,
    notes: result.notes || [],
  };
}

function assessAgreement(query, routerResult) {
  // Agent single-rater assessment. The human_reviewer_override stays null
  // for the user to fill in on review.
  const topPick = routerResult.top_k[0]?.skill || null;
  const expected = query.agent_expectation_if_missing;

  let agrees;
  let routing_kind;
  if (routerResult.no_match) {
    agrees = false;
    routing_kind = 'no_match';
  } else if (topPick === expected) {
    agrees = true;
    routing_kind = 'top1_matches_expectation';
  } else {
    // Top-1 differs from agent expectation. Check if expectation appears in top-K.
    const expectedInTopK = routerResult.top_k.some(e => e.skill === expected);
    agrees = false;
    routing_kind = expectedInTopK ? 'expected_in_top_k_but_not_top1' : 'expected_absent_from_top_k';
  }

  return {
    agrees_with_top_router_pick: agrees,
    routing_kind,
    expected_skill: expected,
    actual_top_skill: topPick,
  };
}

function build({ manifestPath = DEFAULT_MANIFEST, dryRun = false } = {}) {
  const manifest = loadManifest(manifestPath);
  const todayISO = new Date().toISOString().slice(0, 10);

  const queries = QUERIES.map(q => {
    const routerResult = runQuery(manifest, q.prompt, todayISO);
    const agentAssessment = assessAgreement(q, routerResult);
    return {
      id: q.id,
      topic: q.topic,
      prompt: q.prompt,
      deferred_skill_probe: q.deferred_skill_probe,
      authoring_note: q.note,
      router_top_5: routerResult.top_k,
      router_co_loaded: routerResult.co_loaded,
      router_notes: routerResult.notes,
      agent_assessment: {
        ...agentAssessment,
        note: q.note,
      },
      human_reviewer_override: null,
    };
  });

  const topicDistribution = queries.reduce((acc, q) => {
    acc[q.topic] = (acc[q.topic] || 0) + 1;
    return acc;
  }, {});

  const deferredSkillProbes = queries.reduce((acc, q) => {
    if (q.deferred_skill_probe) {
      acc[q.deferred_skill_probe] = (acc[q.deferred_skill_probe] || 0) + 1;
    }
    return acc;
  }, {});

  const agreementRate = {
    total: queries.length,
    agent_agrees_with_top_pick: queries.filter(q => q.agent_assessment.agrees_with_top_router_pick).length,
    no_match: queries.filter(q => q.router_top_5.length === 0).length,
    expected_in_top_k_but_not_top1: queries.filter(q => q.agent_assessment.routing_kind === 'expected_in_top_k_but_not_top1').length,
    expected_absent_from_top_k: queries.filter(q => q.agent_assessment.routing_kind === 'expected_absent_from_top_k').length,
  };

  const artifact = {
    version: 0,
    generated_at: new Date().toISOString(),
    generator: 'scripts/build-retrieval-baseline.js',
    manifest_used: path.relative(REPO_ROOT, manifestPath),
    manifest_skill_count: Array.isArray(manifest.skills) ? manifest.skills.length : null,
    total_queries: queries.length,
    topic_distribution: topicDistribution,
    deferred_skill_probes: deferredSkillProbes,
    agent_agreement_summary: agreementRate,
    method: {
      top_k: TOP_K,
      min_eval_state: 'unverified',
      project: null,
      path: null,
      stopword_handling: 'router default (see scripts/skill-graph-route.js § STOPWORDS)',
    },
    reviewer_protocol: {
      step_1: 'Read each query.prompt; decide what skill SHOULD have top-1.',
      step_2: 'Compare to router_top_5[0].skill.',
      step_3: 'Set human_reviewer_override.agrees_with_router (bool).',
      step_4: 'Set human_reviewer_override.expected_skill (existing-skill name or hypothetical-skill name with leading `~`).',
      step_5: 'For queries tagged deferred_skill_probe, decide whether the deferred skill would actually fill the gap or whether an existing skill suffices.',
      step_6: 'Record per-query notes.',
      step_7: 'Aggregate: compute agreement-rate, deferred-skill-needed-rate, and the migration-justification metrics in docs/plans/skill-taxonomy-v5-and-gap-fill.md § Verification gate item 9.',
    },
    queries,
  };

  if (dryRun) {
    process.stdout.write(JSON.stringify(artifact, null, 2) + '\n');
    return artifact;
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
  return artifact;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { manifestPath: DEFAULT_MANIFEST, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--manifest') {
      args.manifestPath = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--help' || a === '-h') {
      process.stdout.write('Usage: node scripts/build-retrieval-baseline.js [--manifest PATH] [--dry-run]\n');
      process.exit(0);
    } else {
      process.stderr.write(`Unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = build(args);
  if (!args.dryRun) {
    process.stdout.write(`Wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)}\n`);
    process.stdout.write(`  total_queries: ${artifact.total_queries}\n`);
    process.stdout.write(`  topics: ${JSON.stringify(artifact.topic_distribution)}\n`);
    process.stdout.write(`  deferred_skill_probes: ${JSON.stringify(artifact.deferred_skill_probes)}\n`);
    process.stdout.write(`  agent_agreement_summary: ${JSON.stringify(artifact.agent_agreement_summary)}\n`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { build, QUERIES };
