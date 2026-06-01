#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — P3a Body-Aware Router (deterministic TF-IDF, path-a)
 *
 * WHY: the two deterministic routers in the repo (injector, routeSkills) score ONLY
 * on metadata (keywords/triggers/paths/relations) — they never read the SKILL.md body.
 * So they cannot answer the headline SkillRouter question (arXiv 2603.22455): "how much
 * routing signal does metadata add OVER the body text?" That paper found hiding the body
 * costs 31-44 pp — i.e. the body is the dominant signal and metadata is a small marginal.
 * The repo has no body-aware router, so this builds the minimal one: a local TF-IDF /
 * cosine retriever over the actual SKILL.md bodies. 0 model calls.
 *
 * THREE ARMS (same query set, same corpus, same IDF):
 *   body-only   — document = SKILL.md body text (frontmatter stripped)
 *   meta-only   — document = keywords + description (the routing metadata, as free text)
 *   body+meta   — document = body + keywords + description
 *
 * THE NUMBER THAT MATTERS — marginal of metadata over body:
 *   Δ_meta_over_body = Recall@1(body+meta) − Recall@1(body-only)
 *   If ≈0, metadata adds no routing signal a body retriever doesn't already have (DECORATIVE
 *   for path-a). If >0, the metadata fields carry routing signal beyond the body.
 * And the mirror — marginal of body over metadata:
 *   Δ_body_over_meta = Recall@1(body+meta) − Recall@1(meta-only)   [expect large per SkillRouter]
 *
 * CAVEAT (honest): TF-IDF/cosine is a WEAKER retriever than the LLM/embedding retriever
 * SkillRouter used; absolute Recall here is a floor, not the ceiling. The COMPARISON across
 * the three arms (which holds the retriever fixed) is the valid signal, not the absolute number.
 *
 * INVOCATION: node benchmarks/field-relevance/body-router.js [--baseline <path>] [--k 3]
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SG = path.resolve(__dirname, '..', '..');
const SKILLS_DIR = path.resolve(SG, '..', 'skills', 'skills');
const argv = process.argv.slice(2);
const baselineArg = argv[argv.indexOf('--baseline') + 1];
const BASELINE = baselineArg && !baselineArg.startsWith('--')
  ? path.resolve(baselineArg)
  : path.join(SG, 'evals', 'retrieval-baseline-v2.json');

const STOP = new Set(('a an the of to in on for and or but with without by from as at is are be been being this that these those it its ' +
  'you your we our they their i me my he she his her them us how what when where which who why do does did done can could should ' +
  'would will shall may might must not no yes if then else than so such into over under out up down off about against between ' +
  'use using used want need new one two get got make made via per each any all some more most other into also only just like ' +
  'skill skills md').split(/\s+/));

function tokenize(text) {
  const out = [];
  for (const m of text.toLowerCase().matchAll(/[a-z0-9][a-z0-9_-]{2,}/g)) {
    const t = m[0];
    if (!STOP.has(t)) out.push(t);
  }
  return out;
}

// ── Load corpus: split frontmatter, pull name(=dir)/keywords/description/body ──
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === 'SKILL.md') acc.push(p);
  }
  return acc;
}

function loadSkill(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const name = path.basename(path.dirname(file));
  let body = raw, fmText = '';
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (m) { fmText = m[1]; body = m[2]; }
  // shallow YAML-ish extraction of description + keywords (nested under metadata: too)
  let description = '';
  const dm = fmText.match(/^description:\s*(.+?)\s*$/m);
  if (dm) description = dm[1].replace(/^['"]|['"]$/g, '');
  const keywords = [];
  // keywords: [a, b]  OR  keywords:\n  - a\n  - b   (possibly indented under metadata:)
  const inline = fmText.match(/^\s*keywords:\s*\[(.*?)\]/m);
  if (inline) inline[1].split(',').forEach(k => { const t = k.trim().replace(/^['"]|['"]$/g, ''); if (t) keywords.push(t); });
  else {
    const block = fmText.match(/^\s*keywords:\s*$([\s\S]*?)(?=^\s*\S+:|\Z)/m);
    if (block) for (const lm of block[1].matchAll(/^\s*-\s*(.+?)\s*$/gm)) keywords.push(lm[1].replace(/^['"]|['"]$/g, ''));
  }
  return { name, description, keywords, body };
}

function docText(s, arm) {
  const meta = (s.keywords.join(' ') + ' ' + s.description);
  if (arm === 'body') return s.body;
  if (arm === 'meta') return meta;
  return s.body + '\n' + meta; // body+meta
}

// ── TF-IDF index over a chosen arm ──
function buildIndex(skills, arm) {
  const docs = skills.map(s => ({ name: s.name, tokens: tokenize(docText(s, arm)) }));
  const df = new Map();
  for (const d of docs) for (const t of new Set(d.tokens)) df.set(t, (df.get(t) || 0) + 1);
  const N = docs.length;
  const idf = (t) => Math.log((N + 1) / ((df.get(t) || 0) + 1)) + 1;
  const vectors = docs.map(d => {
    const tf = new Map();
    for (const t of d.tokens) tf.set(t, (tf.get(t) || 0) + 1);
    const v = new Map();
    let mag = 0;
    for (const [t, c] of tf) { const w = (1 + Math.log(c)) * idf(t); v.set(t, w); mag += w * w; }
    return { name: d.name, v, mag: Math.sqrt(mag) || 1 };
  });
  return { vectors, idf };
}

function rank(query, index, k) {
  const qtf = new Map();
  for (const t of tokenize(query)) qtf.set(t, (qtf.get(t) || 0) + 1);
  const qv = new Map(); let qmag = 0;
  for (const [t, c] of qtf) { const w = (1 + Math.log(c)) * index.idf(t); qv.set(t, w); qmag += w * w; }
  qmag = Math.sqrt(qmag) || 1;
  const scored = index.vectors.map(d => {
    let dot = 0;
    const small = qv.size < d.v.size ? qv : d.v;
    const big = small === qv ? d.v : qv;
    for (const [t, w] of small) { const o = big.get(t); if (o) dot += w * o; }
    return { name: d.name, score: dot / (d.mag * qmag) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

function evalArm(skills, queries, arm, k) {
  const index = buildIndex(skills, arm);
  let hit1 = 0, hit3 = 0, scored = 0;
  for (const q of queries) {
    const expected = new Set(q.expected_skills || []);
    if (!expected.size) continue;
    // only score queries whose expected skill exists in the corpus
    const exists = [...expected].some(e => skills.find(s => s.name === e));
    if (!exists) continue;
    scored++;
    const top = rank(q.query, index, Math.max(k, 3));
    if (top[0] && expected.has(top[0].name)) hit1++;
    if (top.slice(0, 3).some(t => expected.has(t.name))) hit3++;
  }
  return { arm, recall_at_1: +(hit1 / scored).toFixed(4), recall_at_3: +(hit3 / scored).toFixed(4), scored };
}

function main() {
  const k = parseInt(argv[argv.indexOf('--k') + 1], 10) || 3;
  const skills = walk(SKILLS_DIR, []).map(loadSkill);
  const baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
  const queries = baseline.queries || baseline.cases || baseline;

  const body = evalArm(skills, queries, 'body', k);
  const meta = evalArm(skills, queries, 'meta', k);
  const both = evalArm(skills, queries, 'body+meta', k);

  console.log('Field-Relevance P3a — Body-Aware Router (local TF-IDF/cosine, path-a)');
  console.log(`Corpus: ${skills.length} skills | Baseline: ${path.relative(SG, BASELINE)} | scored ${body.scored} queries\n`);
  console.log('ARM'.padEnd(12) + 'Recall@1   Recall@3');
  console.log('-'.repeat(34));
  for (const r of [body, meta, both]) {
    console.log(r.arm.padEnd(12) + r.recall_at_1.toFixed(4).padStart(8) + '   ' + r.recall_at_3.toFixed(4).padStart(8));
  }
  const dMetaOverBody = +(both.recall_at_1 - body.recall_at_1).toFixed(4);
  const dBodyOverMeta = +(both.recall_at_1 - meta.recall_at_1).toFixed(4);
  console.log('\nΔ marginal of METADATA over body  (body+meta − body):  ' + (dMetaOverBody >= 0 ? '+' : '') + dMetaOverBody);
  console.log('Δ marginal of BODY over metadata  (body+meta − meta):  ' + (dBodyOverMeta >= 0 ? '+' : '') + dBodyOverMeta);
  console.log('\nInterpretation:');
  console.log('  - Δ_meta_over_body ≈ 0  → metadata adds no path-a routing signal beyond the body (DECORATIVE for path-a).');
  console.log('  - Δ_body_over_meta large → body is the dominant routing signal (SkillRouter 31-44pp body-hiding effect).');
  console.log('  Caveat: TF-IDF is a floor retriever; the cross-arm COMPARISON is valid, the absolute Recall is not a ceiling.');

  fs.writeFileSync(path.join(__dirname, 'p3a-body-router.json'),
    JSON.stringify({ generated_for: 'field-relevance-benchmark/P3a-body-aware-router',
      path: 'a-tfidf-body', retriever: 'local-tfidf-cosine', corpus_skills: skills.length,
      baseline_file: path.relative(SG, BASELINE), arms: { body, meta, both },
      delta_meta_over_body_r1: dMetaOverBody, delta_body_over_meta_r1: dBodyOverMeta }, null, 2) + '\n');
  console.log('\nWrote p3a-body-router.json');
}

main();
