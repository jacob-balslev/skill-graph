#!/usr/bin/env node
'use strict';

// ─── Browser findings-review server — a button PER finding + bulk triage + flagging ────────
//
// The terminal viewer (scripts/watch-panel.js --review-findings) renders approve/disapprove
// buttons only for the currently-SELECTED finding and needs a raw-mode TTY. This server is the
// rendered, visual counterpart: a localhost web page where EVERY finding is a row with its OWN
// [Approve] [Disapprove] [Pending] buttons + an inline note, and a click writes the decision
// straight to the SAME review-state JSON contract (via finding-review.js).
//
// Two review modes, by use case:
//   • PER-FINDING — the default; click each finding's own buttons. The anti-exploit mode for the
//     audit-loop merge-ledger review (where a batch-accept rewards flooding the ledger).
//   • BULK TRIAGE — Select-all (of the current FILTERED view) + Approve/Disapprove/Pending selected,
//     and one-click Approve-all-shown / Disapprove-all-shown (with confirm). For triaging large
//     accumulated finding stores (e.g. 980 session-log findings, mostly telemetry noise) where
//     per-finding clicking is impractical. Bulk acts on the CURRENT FILTER, so you narrow then act.
//
// FLAGGING (⚑): each finding is heuristically flagged for "you'll want eyes on this" — high severity,
// privacy/security/financial, multiple-outcome/ambiguous decisions (where agents slop), destructive
// actions, vague+unverified claims (AI-slop risk), and agent-reliability findings. Flagged-first sort
// keeps them at the top so bulk-disapproving noise never buries something that needs judgment.
//
// Bound to 127.0.0.1 only — findings may carry internal data.
//
// Usage:
//   node scripts/findings-review-server.js --findings-file <ledger.json|.md> \
//     [--review-file <review.json>] [--status-file <heartbeat.json>] [--port 7777]

const http = require('http');
const fs = require('fs');
const path = require('path');
const fr = require('../lib/audit/finding-review');

function parseArgs(argv) {
  const v = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { v[key] = true; } else { v[key] = next; i += 1; }
  }
  return v;
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return null; }
}

const args = parseArgs(process.argv.slice(2));
const findingsFile = args['findings-file'] ? path.resolve(args['findings-file']) : null;
const statusFile = args['status-file'] ? path.resolve(args['status-file']) : null;
const reviewFile = args['review-file']
  ? path.resolve(args['review-file'])
  : (findingsFile ? `${findingsFile}.review.json` : path.resolve('findings-review.json'));
const port = Number(args.port) || 7777;

if (!findingsFile && !statusFile) {
  process.stderr.write('Usage: node scripts/findings-review-server.js --findings-file <ledger.json|.md> [--review-file <review.json>] [--status-file <heartbeat.json>] [--port 7777]\n');
  process.exit(2);
}

function loadFindings() {
  const fromHeartbeat = statusFile ? fr.extractFindings(readJson(statusFile) || {}) : [];
  const fromFile = findingsFile ? fr.loadFindingsFile(findingsFile) : [];
  return fr.mergeFindings(fromHeartbeat, fromFile);
}

// ─── Triage via the Findings Filter classifier (the firewall brain) ───────────────────────
// classify-findings.js buckets each finding into drop / verify / auto-file / review, clusters
// near-duplicates, and explains WHY (triage_reasons). The server defaults the human surface to the
// REVIEW bucket, clustered representatives only, so the developer sees the few genuine decisions —
// not 980 items. Other buckets are inspectable for transparency/calibration, never hidden silently.
const { classifyFindings } = require('./classify-findings');
const REPO_ROOT = path.resolve(__dirname, '..', '..');

let findings = loadFindings();
let reviewState = fr.loadReviewState(reviewFile, { findings_file: findingsFile, status_file: statusFile });
let classified = classifyFindings(findings, { repoRoot: REPO_ROOT });

function reclassify() { classified = classifyFindings(findings, { repoRoot: REPO_ROOT }); }

function bucketCounts() {
  const dc = fr.decisionCounts(findings, reviewState);
  return { ...classified.counts, approved: dc.approved, disapproved: dc.disapproved, pending: dc.pending };
}

// bucket: 'review' (default human surface) | 'auto-file' | 'drop' | 'all'. Representatives only
// (clustered) so 30 variants of one failure collapse to a single row with a count.
function statePayload(bucket = 'review') {
  const reps = classified.findings.filter((f) => f.is_representative && (bucket === 'all' || f.triage === bucket));
  const items = reps.map((f, i) => {
    const rec = fr.decisionRecord(f, reviewState);
    return {
      n: i + 1, id: f.id, title: f.title, detail: f.detail || null, severity: f.severity || null,
      skill: f.skill || null, model: f.model || null, verdict: f.verdict || null, source: f.source || null,
      peek: (f.peek || []).map((p) => ({ label: p.label, text: p.text })),
      decision: rec.decision, note: rec.note || null,
      triage: f.triage, why: f.triage_reasons || [], cluster_size: f.cluster_size || 1,
    };
  });
  return { items, bucket, counts: bucketCounts(), reviewFile };
}

function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (_) { resolve({}); } });
  });
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${port}`);
  if (req.method === 'GET' && u.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
  if (req.method === 'GET' && u.pathname === '/api/state') return send(res, 200, statePayload(u.searchParams.get('bucket') || 'review'));

  if (req.method === 'POST' && u.pathname === '/api/decision') {
    const body = await readBody(req);
    const id = body && body.id;
    if (!id) return send(res, 400, { ok: false, error: 'missing id' });
    const note = Object.prototype.hasOwnProperty.call(body, 'note') ? String(body.note || '') : undefined;
    reviewState = fr.applyFindingDecision(reviewState, id, body.decision, undefined, note);
    reviewState.source = { findings_file: findingsFile, status_file: statusFile, ...(reviewState.source || {}) };
    try { fr.writeReviewState(reviewFile, reviewState); } catch (e) { return send(res, 500, { ok: false, error: e.message }); }
    const rec = reviewState.decisions[id] || {};
    return send(res, 200, { ok: true, id, decision: rec.decision, note: rec.note || null, counts: bucketCounts() });
  }

  // Bulk: apply ONE decision to many ids (the current filtered/selected set), persist once.
  if (req.method === 'POST' && u.pathname === '/api/bulk') {
    const body = await readBody(req);
    const ids = Array.isArray(body && body.ids) ? body.ids.filter(Boolean) : [];
    if (!ids.length) return send(res, 400, { ok: false, error: 'no ids' });
    const decision = body.decision;
    for (const id of ids) {
      reviewState = fr.applyFindingDecision(reviewState, id, decision);
    }
    reviewState.source = { findings_file: findingsFile, status_file: statusFile, ...(reviewState.source || {}) };
    try { fr.writeReviewState(reviewFile, reviewState); } catch (e) { return send(res, 500, { ok: false, error: e.message }); }
    return send(res, 200, { ok: true, applied: ids.length, decision, counts: bucketCounts() });
  }

  // Apply/Export: hand the APPROVED set to the agent. Writes a curated JSON + readable markdown
  // sibling of the review file. Disapproved/pending need no action — they're already in the review file.
  if (req.method === 'POST' && u.pathname === '/api/apply') {
    const approved = classified.findings.filter((f) => fr.decisionFor(f, reviewState) === 'approved').map((f) => {
      const rec = fr.decisionRecord(f, reviewState);
      return {
        id: f.id, title: f.title, severity: f.severity || null, skill: f.skill || null,
        verdict: f.verdict || null, source: f.source || null, detail: f.detail || null,
        peek: f.peek || [], note: rec.note || null,
        triage: f.triage, why: f.triage_reasons || [], cluster_size: f.cluster_size || 1,
      };
    });
    const jsonPath = `${reviewFile}.approved.json`;
    const mdPath = `${reviewFile}.approved.md`;
    const ts = new Date().toISOString();
    try {
      fs.writeFileSync(jsonPath, `${JSON.stringify({ exported_at: ts, count: approved.length, source_findings: findingsFile, review_file: reviewFile, findings: approved }, null, 2)}\n`);
      const md = [`# Approved findings (${approved.length}) — exported ${ts}`, `> source: ${findingsFile}`, ''];
      approved.forEach((f, i) => {
        md.push(`## ${i + 1}. ${f.title}`);
        md.push(`- severity: ${f.severity || '?'}${f.skill ? ` · type: ${f.skill}` : ''}${f.source ? ` · source: ${f.source}` : ''}${f.cluster_size > 1 ? ` · +${f.cluster_size - 1} duplicates` : ''}`);
        if ((f.why || []).length) md.push(`- why surfaced: ${f.why.join('; ')}`);
        if (f.note) md.push(`- note: ${f.note}`);
        if (f.detail) md.push('', f.detail);
        md.push('');
      });
      fs.writeFileSync(mdPath, `${md.join('\n')}\n`);
    } catch (e) { return send(res, 500, { ok: false, error: e.message }); }
    return send(res, 200, { ok: true, count: approved.length, jsonPath, mdPath });
  }

  if (req.method === 'POST' && u.pathname === '/api/reload') {
    findings = loadFindings();
    reviewState = fr.loadReviewState(reviewFile, { findings_file: findingsFile, status_file: statusFile });
    reclassify();
    return send(res, 200, statePayload('review'));
  }
  return send(res, 404, { error: 'not found' });
});

server.listen(port, '127.0.0.1', () => {
  const c = bucketCounts();
  process.stdout.write(`Findings Filter (Human in the Loop): http://127.0.0.1:${port}\n`);
  process.stdout.write(`  ${c.total} findings → DROP ${c.drop} · AUTO-FILE ${c['auto-file']} · REVIEW ${c.review} (${c.review_clusters} clusters)\n`);
  process.stdout.write(`  human surface = the ${c.review_clusters} REVIEW clusters; review file: ${reviewFile}\n`);
});

// ─── The page (single-file, no build, no deps) ───────────────────────────────────────────
const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Findings Filter (Human in the Loop)</title>
<style>
  :root{
    --bg:#0b0d10; --panel:#13171c; --panel2:#171c22; --line:#232a32; --txt:#e6edf3; --dim:#8b98a6;
    --green:#2ea043; --green-bg:#0f2a16; --red:#da3633; --red-bg:#2d1111;
    --crit:#f85149; --high:#ff9b50; --med:#d2a8ff; --low:#6e7681; --accent:#2f81f7; --flag:#e3b341;
  }
  *{box-sizing:border-box} html,body{margin:0}
  body{background:var(--bg);color:var(--txt);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif}
  header{position:sticky;top:0;z-index:10;background:rgba(11,13,16,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:12px 20px}
  h1{font-size:16px;margin:0 0 8px;font-weight:600;letter-spacing:-.01em}
  .counts{display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:13px}
  .pill{padding:2px 9px;border-radius:999px;font-weight:600;font-variant-numeric:tabular-nums}
  .pill.appr{background:var(--green-bg);color:#3fb950} .pill.disa{background:var(--red-bg);color:#ff7b72}
  .pill.pend{background:#1c2128;color:var(--dim)} .pill.flag{background:#2a1e07;color:var(--flag)}
  .banner{margin-top:8px;padding:7px 12px;border-radius:8px;font-weight:600;font-size:13px}
  .banner.inc{background:#2a1e07;color:#e3b341;border:1px solid #3d2c0a}
  .banner.done{background:var(--green-bg);color:#3fb950;border:1px solid #1a3a22}
  .toolbar{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  input,select{background:var(--panel2);color:var(--txt);border:1px solid var(--line);border-radius:7px;padding:6px 10px;font:inherit}
  input#q{min-width:240px}
  label.chk{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--dim);cursor:pointer;user-select:none}
  .help{margin-top:8px;font-size:12px;color:var(--dim)} .help b{color:var(--txt);font-weight:600}
  .bulkbar{margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:8px 10px;background:var(--panel2);border:1px solid var(--line);border-radius:9px}
  .bulkbar .lab{font-size:12px;color:var(--dim)}
  button.primary{border-color:var(--accent);background:#10243f;color:#cfe2ff} button.primary:hover{background:var(--accent);color:#fff}
  #toast{color:#3fb950;font-weight:600}
  button{cursor:pointer;border:1px solid var(--line);background:var(--panel2);color:var(--txt);border-radius:7px;padding:6px 11px;font:600 12px/1 inherit;transition:transform .06s,background .12s,border-color .12s}
  button:hover{transform:translateY(-1px)} button:active{transform:translateY(0)}
  button.bappr{border-color:#1f5132} button.bappr:hover{background:var(--green);color:#fff}
  button.bdisa{border-color:#5a2120} button.bdisa:hover{background:var(--red);color:#fff}
  button.danger{border-color:#5a2120;color:#ff9b94}
  main{padding:14px 20px;max-width:1140px;margin:0 auto}
  .grp{margin:16px 0 4px;color:var(--dim);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .row{background:var(--panel);border:1px solid var(--line);border-left:3px solid var(--low);border-radius:10px;padding:11px 13px;margin:7px 0;display:grid;grid-template-columns:26px 40px 1fr auto;gap:11px;align-items:start;transition:border-color .12s,background .12s}
  .row[data-sev=critical]{border-left-color:var(--crit)} .row[data-sev=high]{border-left-color:var(--high)}
  .row[data-sev=medium]{border-left-color:var(--med)} .row[data-sev=low]{border-left-color:var(--low)}
  .row[data-flagged=true]{box-shadow:inset 3px 0 0 0 var(--flag)}
  .row[data-decision=approved]{background:linear-gradient(0deg,var(--green-bg),var(--panel));border-color:#1a3a22}
  .row[data-decision=disapproved]{background:linear-gradient(0deg,var(--red-bg),var(--panel));border-color:#3a1a1a;opacity:.72}
  .row.sel{outline:2px solid var(--accent);outline-offset:-2px}
  .cbx{padding-top:3px}
  .num{color:var(--dim);font-variant-numeric:tabular-nums;font-size:12px;padding-top:3px}
  .title{font-weight:600;letter-spacing:-.01em}
  .flag{color:var(--flag);font-weight:700;cursor:help}
  .meta{margin-top:4px;color:var(--dim);font-size:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center}
  .tag{background:var(--panel2);border:1px solid var(--line);border-radius:5px;padding:0 6px;font-size:11px}
  .tag.sev-critical{color:var(--crit)} .tag.sev-high{color:var(--high)} .tag.sev-medium{color:var(--med)}
  .tag.fl{color:var(--flag);border-color:#3d2c0a;background:#2a1e07}
  details{margin-top:6px} summary{cursor:pointer;color:var(--accent);font-size:12px;user-select:none}
  .detail{white-space:pre-wrap;color:#c5cdd6;font-size:12.5px;margin-top:6px;border-left:2px solid var(--line);padding-left:10px}
  .actions{display:flex;flex-direction:column;gap:6px;align-items:stretch;min-width:128px}
  .btns{display:flex;gap:6px}
  button.act{flex:1;padding:7px 8px}
  button.appr.on{background:var(--green);border-color:var(--green);color:#fff}
  button.disa.on{background:var(--red);border-color:var(--red);color:#fff}
  button.pend.on{background:#30363d;border-color:#444c56}
  .noteline{display:flex;gap:6px} .noteline input{flex:1;font-size:12px;padding:5px 8px}
  .state{font-size:11px;color:var(--dim);text-align:right;min-height:13px}
  .empty{color:var(--dim);padding:40px;text-align:center}
</style></head>
<body>
<header>
  <h1>Findings Filter <span style="color:var(--dim);font-weight:400">(Human in the Loop)</span></h1>
  <div class="counts" id="counts"></div>
  <div class="banner" id="banner"></div>
  <div class="toolbar">
    <input id="q" placeholder="Filter (title, type, severity, text)…">
    <select id="group"><option value="severity">Group: severity</option><option value="skill">Group: type</option><option value="decision">Group: decision</option><option value="none">Group: none</option></select>
    <select id="bucket"><option value="review">Bucket: ⚖ review (decisions)</option><option value="auto-file">Bucket: auto-file (agent acts)</option><option value="drop">Bucket: dropped (noise)</option><option value="all">Bucket: all</option></select>
    <select id="show"><option value="all">all</option><option value="pending">pending</option><option value="decided">decided</option></select>
  </div>
  <div class="help">You only see the <b>⚖ review</b> bucket — the findings that need YOUR judgment (the filter dropped noise + sent basic stuff to the agent). Each shows <b>why it surfaced</b>. Approve/Disapprove each (saved live), then <b>Export approved →</b> hands the kept set to the agent. Switch <b>Bucket</b> to inspect what was auto-handled.</div>
  <div class="bulkbar">
    <label class="chk"><input type="checkbox" id="selall"> Select all shown</label>
    <span class="lab" id="selcount">0 selected</span>
    <button class="bappr" id="apprSel">Approve selected</button>
    <button class="bdisa" id="disaSel">Disapprove selected</button>
    <button id="pendSel">Set selected pending</button>
    <span class="lab">·</span>
    <button class="bappr" id="apprAll">Approve ALL shown</button>
    <button class="bdisa danger" id="disaAll">Disapprove ALL shown</button>
    <button class="primary" id="exportApproved">Export approved →</button>
    <span class="lab" id="toast"></span>
    <span class="lab" id="reviewfile" style="margin-left:auto"></span>
  </div>
</header>
<main id="list"><div class="empty">Loading…</div></main>
<script>
let DATA={items:[],counts:{}};
const SEL=new Set();
const SEVRANK={critical:0,high:1,medium:2,low:3};
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

async function load(){
  const bk=document.getElementById('bucket').value;
  const r=await fetch('/api/state?bucket='+encodeURIComponent(bk));
  DATA=await r.json();SEL.clear();
  document.getElementById('reviewfile').textContent='→ '+DATA.reviewFile;render();
}
function renderCounts(){
  const c=DATA.counts||{};const C=document.getElementById('counts');C.innerHTML='';
  C.append(
    el('span','pill flag','⚖ '+(c.review||0)+' review · '+(c.review_clusters||0)+' clusters'),
    el('span','pill','auto-file '+(c['auto-file']||0)),
    el('span','pill','dropped '+(c.drop||0)),
    el('span','','of '+(c.total||0)+' total'),
    el('span','pill appr',(c.approved||0)+' approved'),
    el('span','pill disa',(c.disapproved||0)+' disapproved'),
    el('span','pill pend',(c.pending||0)+' pending'));
  const shown=(DATA.items||[]).length;
  const decidedShown=(DATA.items||[]).filter(it=>it.decision!=='pending').length;
  const b=document.getElementById('banner');
  if(DATA.bucket==='review'){
    const pend=shown-decidedShown;
    if(pend>0){b.className='banner inc';b.textContent='⚠ '+decidedShown+' of '+shown+' review decisions made · '+pend+' to go (decide each; export approved when done)';}
    else if(shown>0){b.className='banner done';b.textContent='✓ all '+shown+' review decisions made — Export approved to hand to the agent';}
    else{b.className='banner done';b.textContent='✓ nothing needs your review';}
  } else {b.className='banner';b.textContent='Viewing the '+(DATA.bucket||'')+' bucket (transparency/calibration — NOT the human review surface).';}
}
function visible(){
  const q=document.getElementById('q').value.trim().toLowerCase();
  const show=document.getElementById('show').value;
  return DATA.items.filter(it=>{
    if(show==='pending'&&it.decision!=='pending')return false;
    if(show==='decided'&&it.decision==='pending')return false;
    if(!q)return true;
    const hay=[it.title,it.detail,it.severity,it.skill,it.verdict,it.source,it.note,(it.why||[]).join(' ')].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  });
}
function ordered(){
  const g=document.getElementById('group').value;
  let items=visible().slice();
  items.sort((a,b)=>{
    if(g==='severity')return ((SEVRANK[a.severity]??9)-(SEVRANK[b.severity]??9))||a.n-b.n;
    if(g!=='none')return String(gk(a,g)).localeCompare(String(gk(b,g)))||a.n-b.n;
    return a.n-b.n;
  });
  return items;
}
function gk(it,g){if(g==='none')return '';if(g==='severity')return it.severity||'unknown';if(g==='decision')return it.decision;return it[g]||'(none)';}
function render(){
  renderCounts();
  const g=document.getElementById('group').value;
  const items=ordered();
  const L=document.getElementById('list');L.innerHTML='';
  if(!items.length){L.append(el('div','empty','No findings match.'));updateSel();return;}
  let cur=null;
  for(const it of items){
    if(g!=='none'){const k=gk(it,g);if(k!==cur){cur=k;const cnt=items.filter(x=>gk(x,g)===k).length;L.append(el('div','grp',esc(g+': '+k+' ('+cnt+')')));}}
    L.append(rowEl(it));
  }
  updateSel();
}
function rowEl(it){
  const row=el('div','row'+(SEL.has(it.id)?' sel':''));row.dataset.sev=it.severity||'';row.dataset.decision=it.decision;row.dataset.id=it.id;
  const cb=el('div','cbx');const box=el('input');box.type='checkbox';box.checked=SEL.has(it.id);box.onchange=()=>{if(box.checked)SEL.add(it.id);else SEL.delete(it.id);row.classList.toggle('sel',box.checked);updateSel();};cb.append(box);row.append(cb);
  row.append(el('div','num',it.n+'.'));
  const mid=el('div','');
  mid.append(el('div','title',esc(it.title)));
  const meta=el('div','meta','');
  if(it.severity)meta.append(el('span','tag sev-'+it.severity,esc(it.severity)));
  if(it.skill)meta.append(el('span','tag',esc(it.skill)));
  if(it.cluster_size>1)meta.append(el('span','tag','+'+(it.cluster_size-1)+' dupes'));
  if(it.source)meta.append(el('span','tag',esc(it.source)));
  (it.why||[]).forEach(r=>meta.append(el('span','tag fl','⚖ '+esc(r))));
  mid.append(meta);
  if(it.detail||(it.peek&&it.peek.length)){const d=el('details');d.append(el('summary',null,'details'));
    if(it.detail)d.append(el('div','detail',esc(it.detail)));
    (it.peek||[]).forEach(p=>d.append(el('div','detail',esc(p.label+': '+p.text))));mid.append(d);}
  row.append(mid);
  const act=el('div','actions');const btns=el('div','btns');
  const mk=(cls,lbl,dec)=>{const b=el('button','act '+cls+(it.decision===dec?' on':''),lbl);b.onclick=()=>decide(it,dec,row);return b;};
  btns.append(mk('appr','Approve','approved'),mk('disa','Disapprove','disapproved'),mk('pend','Pending','pending'));
  act.append(btns);
  const nl=el('div','noteline');const ni=el('input');ni.placeholder='note (optional)…';ni.value=it.note||'';
  ni.onkeydown=e=>{if(e.key==='Enter'){decide(it,it.decision,row,ni.value);ni.blur();}};nl.append(ni);act.append(nl);
  const st=el('div','state',it.note?'note saved':'');act.append(st);row._state=st;
  row.append(act);return row;
}
function updateSel(){
  document.getElementById('selcount').textContent=SEL.size+' selected';
  const vis=visible();const allSel=vis.length>0&&vis.every(it=>SEL.has(it.id));
  const m=document.getElementById('selall');m.checked=allSel;m.indeterminate=!allSel&&vis.some(it=>SEL.has(it.id));
}
async function decide(it,decision,row,note){
  const payload={id:it.id,decision};if(note!==undefined)payload.note=note;
  const r=await fetch('/api/decision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json();if(!j.ok){if(row._state)row._state.textContent='ERROR: '+(j.error||'?');return;}
  it.decision=j.decision;it.note=j.note;DATA.counts=j.counts;
  row.dataset.decision=it.decision;
  row.querySelectorAll('button.act').forEach(b=>b.classList.remove('on'));
  const map={approved:'appr',disapproved:'disa',pending:'pend'};const on=row.querySelector('button.'+map[it.decision]);if(on)on.classList.add('on');
  if(row._state)row._state.textContent=it.decision+(it.note?' · note saved':'');
  renderCounts();
  if(document.getElementById('show').value!=='all')render();
}
async function bulk(ids,decision){
  if(!ids.length)return;
  const r=await fetch('/api/bulk',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ids,decision})});
  const j=await r.json();if(!j.ok){alert('Bulk failed: '+(j.error||'?'));return;}
  ids.forEach(id=>{const it=DATA.items.find(x=>x.id===id);if(it)it.decision=decision;});
  DATA.counts=j.counts;render();
}
// Select-all toggles the CURRENT FILTERED view only.
document.getElementById('selall').onchange=(e)=>{const vis=visible();if(e.target.checked)vis.forEach(it=>SEL.add(it.id));else vis.forEach(it=>SEL.delete(it.id));render();};
document.getElementById('apprSel').onclick=()=>bulk([...SEL],'approved');
document.getElementById('disaSel').onclick=()=>bulk([...SEL],'disapproved');
document.getElementById('pendSel').onclick=()=>bulk([...SEL],'pending');
document.getElementById('apprAll').onclick=()=>{const ids=visible().map(it=>it.id);if(ids.length&&confirm('Approve ALL '+ids.length+' shown findings?'))bulk(ids,'approved');};
document.getElementById('disaAll').onclick=()=>{const ids=visible().map(it=>it.id);if(ids.length&&confirm('Disapprove ALL '+ids.length+' shown findings?'))bulk(ids,'disapproved');};
document.getElementById('exportApproved').onclick=async()=>{
  const appr=(DATA.counts&&DATA.counts.approved)||0;
  if(!appr){alert('No approved findings yet — approve some first.');return;}
  if(!confirm('Export '+appr+' approved findings to hand to the agent?'))return;
  const r=await fetch('/api/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  const j=await r.json();
  const t=document.getElementById('toast');
  if(j.ok){t.textContent='✓ Exported '+j.count+' approved → '+j.jsonPath+'  (tell the agent: act on the approved set)';}
  else{t.style.color='#ff7b72';t.textContent='Export failed: '+(j.error||'?');}
};
['q','group','show'].forEach(id=>document.getElementById(id).addEventListener(id==='q'?'input':'change',render));
document.getElementById('bucket').addEventListener('change',load);
load();
</script>
</body></html>`;
