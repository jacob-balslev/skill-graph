#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "../../skills/skills");
const APPLY = process.argv.includes("--apply");
const QUORUM = 3;
const VALID = ["foundations", "engineering", "design", "quality", "agent", "product"];

function readFrontmatter(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  if (lines[0] !== "---") return { category: null, domain: null };
  let inMeta = false, category = null, domain = null;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---") break;
    if (/^metadata:\s*$/.test(line)) { inMeta = true; continue; }
    if (inMeta && /^[a-zA-Z_]/.test(line)) inMeta = false;
    if (inMeta) {
      const c = line.match(/^\s+category:\s*['"]?([a-z]+)['"]?\s*$/);
      if (c) category = c[1];
      const d = line.match(/^\s+domain:\s*['"]?([a-z0-9/-]+)['"]?\s*$/);
      if (d) domain = d[1];
    } else {
      const c = line.match(/^category:\s*['"]?([a-z]+)['"]?\s*$/);
      if (c && !category) category = c[1];
      const d = line.match(/^domain:\s*['"]?([a-z0-9/-]+)['"]?\s*$/);
      if (d && !domain) domain = d[1];
    }
  }
  return { category, domain };
}

const skills = [];
const errors = [];
for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!e.isDirectory() || e.name.startsWith("_") || e.name.startsWith(".")) continue;
  const md = path.join(ROOT, e.name, "SKILL.md");
  if (!fs.existsSync(md)) continue;
  const fm = readFrontmatter(md);
  if (!fm.category || !VALID.includes(fm.category)) {
    errors.push({ name: e.name, reason: `category=${fm.category}` });
    continue;
  }
  skills.push({ name: e.name, currentPath: path.join(ROOT, e.name), category: fm.category, domain: fm.domain });
}

const counts = new Map();
for (const s of skills) {
  if (!s.domain) continue;
  const k = `${s.category}/${s.domain}`;
  counts.set(k, (counts.get(k) || 0) + 1);
}
const planned = skills.map((s) => {
  const k = s.domain ? `${s.category}/${s.domain}` : null;
  const useSub = k && counts.get(k) >= QUORUM;
  const rel = useSub
    ? path.join(s.category, s.domain.split("/").pop(), s.name)
    : path.join(s.category, s.name);
  return { ...s, targetPath: path.join(ROOT, rel), targetRel: rel };
});

console.log(`${planned.length} skills, ${errors.length} errors`);
if (errors.length) console.log("Errors:", errors);

if (!APPLY) {
  console.log("Dry-run. Pass --apply.");
  process.exit(0);
}

let moved = 0, failed = 0;
for (const s of planned) {
  if (s.currentPath === s.targetPath) continue;
  const dir = path.dirname(s.targetPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  try {
    execSync(`git mv "${s.currentPath}" "${s.targetPath}"`, { cwd: ROOT, stdio: "pipe" });
    moved++;
  } catch (err) {
    failed++;
    console.error(`FAIL ${s.name}: ${err.message.split("\n")[0]}`);
  }
}
console.log(`Moved ${moved}, failed ${failed}.`);
