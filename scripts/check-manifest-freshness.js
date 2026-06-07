#!/usr/bin/env node
/**
 * Generated-artifact freshness + count-parity gate (SYSTEM gate).
 *
 * The committed/on-disk `skills.manifest.json` is a GENERATED artifact compiled
 * from the canonical skill corpus by `scripts/generate-manifest.js`. Like any
 * generated artifact it goes STALE the moment the source corpus changes without
 * a regeneration — which is exactly the failure that motivated SKI-280 and
 * SKI-291: the on-disk manifest carried the old 9-shelf taxonomy
 * (`code-engineering`, `meta-methods`, `frontend-ui`, `design-craft`,
 * `data-analytics`) and a stale count of 165 while the source corpus had long
 * since moved to the clean v8 12-shelf shape with 170 skills.
 *
 * This gate enforces two invariants that catch that class of staleness:
 *
 *   1. FRESHNESS (SKI-280) — regenerate the manifest from source in-memory and
 *      diff it against the on-disk copy. If they differ, the on-disk manifest is
 *      stale; fail. This is the generated-artifact analogue of
 *      `build-status-doc.js --check` (regenerate-and-diff the status doc).
 *
 *   2. COUNT PARITY (SKI-291) — the manifest's `skills[]` count must equal the
 *      number of physical `SKILL.md` files reachable from the configured skill
 *      roots. The manifest compiler and the drift sentinel already share one
 *      walker (`lib/roots.js::collectSkillFilesFromRoots`), so divergence should
 *      only ever come from a stale manifest — but a count-parity invariant makes
 *      that divergence a HARD CI failure instead of a silent drift, and guards
 *      against any future walker fork re-introducing the 165-vs-170 split.
 *
 * IMPORTANT (per-skill lens — SKI-280 AC): this gate is a SYSTEM check. It does
 * NOT validate per-skill completeness (missing `scope`, ungraded evals, etc.).
 * Per-skill corpus completeness is `manifest:validate` and lives in the separate
 * `verify:corpus` gate (SKI-288) — folding it in here would wrongly couple the
 * SYSTEM gate to corpus completeness. This gate asks only "is the generated
 * artifact fresh and does its count match physical reality?", never "is every
 * skill complete?".
 *
 * The freshness comparison is structural (parsed JSON, with the time-varying
 * `generated_at` field stripped), not a byte diff — so a manifest that is
 * semantically identical but carries a different timestamp is NOT flagged stale.
 *
 * Usage:
 *   node scripts/check-manifest-freshness.js            # check, human output
 *   node scripts/check-manifest-freshness.js --json     # machine-readable result
 *
 * Exit codes:
 *   0 — manifest is fresh AND count matches physical SKILL.md count
 *   1 — manifest is stale (differs from regenerated) OR count parity violated
 *   2 — runtime error (missing manifest, unparseable JSON, generator failure)
 *
 * Self-contained. Only uses Node built-ins.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { collectSkillFiles, workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const MANIFEST_PATH = path.join(REPO_ROOT, 'skills.manifest.json');
const GENERATOR = path.join(REPO_ROOT, 'scripts', 'generate-manifest.js');

function fail(msg, code = 2) {
  process.stderr.write(`ERROR check-manifest-freshness: ${msg}\n`);
  process.exit(code);
}

// Regenerate the manifest from source to a TEMP file so we never touch the
// on-disk committed copy during a check. We use `--output` (not stdout
// capture) deliberately: `generate-manifest.js` writes the compiled manifest to
// the `--output` path even when per-skill schema validation fails (the missing
// `scope` backlog, SKI-283), whereas its stdout path stays empty on that
// failure. Per-skill completeness is NOT this gate's concern (it belongs to
// verify:corpus, SKI-288), so we accept the emitted manifest regardless of the
// generator's exit code as long as the file parses as JSON. A fixed
// `--timestamp` keeps `generated_at` deterministic; we also strip it before
// comparing, belt-and-suspenders.
function regenerateManifest() {
  const tmpPath = path.join(os.tmpdir(), `skill-graph-manifest-freshness-${process.pid}-${Date.now()}.json`);
  try {
    const result = spawnSync(
      process.execPath,
      [GENERATOR, '--output', tmpPath, '--timestamp', '1970-01-01T00:00:00.000Z'],
      { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    if (!fs.existsSync(tmpPath)) {
      fail(`generate-manifest.js produced no output file (exit ${result.status})\n${result.stderr || ''}`);
    }
    try {
      return JSON.parse(fs.readFileSync(tmpPath, 'utf8'));
    } catch (err) {
      fail(`could not parse regenerated manifest as JSON: ${err.message}`);
    }
  } finally {
    try { fs.rmSync(tmpPath, { force: true }); } catch { /* best-effort cleanup */ }
  }
}

// Strip time-varying / non-structural fields so the freshness comparison does
// not produce false positives from regeneration noise.
function normalizeForCompare(manifest) {
  const copy = JSON.parse(JSON.stringify(manifest));
  delete copy.generated_at;
  return JSON.stringify(copy);
}

function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');

  const regenerated = regenerateManifest();

  // The on-disk `skills.manifest.json` is gitignored — it is a build artifact,
  // not a committed file (per ADR-0014 / the clean-cut doctrine). On a fresh CI
  // clone it therefore does not exist yet. Absence is NOT staleness: there is no
  // stale copy to catch, the artifact simply needs building. Build it from the
  // freshly-regenerated source so downstream consumers (build-status-doc,
  // routing-eval) have it, and report fresh by construction. The check's real
  // job is catching a STALE *existing* copy, which is handled below.
  if (!fs.existsSync(MANIFEST_PATH)) {
    // Build with the generator's normal (real) timestamp, not the fixed
    // comparison timestamp, so the on-disk artifact carries an honest
    // `generated_at`. We accept the generator's exit code (per-skill scope
    // validation is verify:corpus's concern) as long as the file is produced.
    spawnSync(process.execPath, [GENERATOR, '--output', MANIFEST_PATH], {
      cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
    if (!fs.existsSync(MANIFEST_PATH)) {
      fail('on-disk manifest was absent and could not be built from source');
    }
    const built = collectSkillFiles().length;
    if (asJson) {
      process.stdout.write(JSON.stringify({
        ok: true, fresh: true, count_parity: true,
        manifest_count: Array.isArray(regenerated.skills) ? regenerated.skills.length : null,
        physical_skill_md_count: built, built: true,
      }, null, 2) + '\n');
    } else {
      process.stdout.write(`OK   skills.manifest.json was absent — built it from source (${built} skills); fresh by construction\n`);
    }
    process.exit(0);
  }

  let onDisk;
  try {
    onDisk = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } catch (err) {
    fail(`could not parse on-disk manifest: ${err.message}`);
  }

  // --- Invariant 1: freshness (SKI-280) ---
  const fresh = normalizeForCompare(onDisk) === normalizeForCompare(regenerated);

  // --- Invariant 2: count parity (SKI-291) ---
  const manifestCount = Array.isArray(onDisk.skills) ? onDisk.skills.length : null;
  const physicalCount = collectSkillFiles().length;
  const countParity = manifestCount === physicalCount;

  const ok = fresh && countParity;

  if (asJson) {
    process.stdout.write(JSON.stringify({
      ok,
      fresh,
      count_parity: countParity,
      manifest_count: manifestCount,
      physical_skill_md_count: physicalCount,
    }, null, 2) + '\n');
  } else if (ok) {
    process.stdout.write(`OK   skills.manifest.json is fresh and count matches physical SKILL.md count (${manifestCount} skills)\n`);
  } else {
    if (!fresh) {
      process.stderr.write('FAIL check-manifest-freshness: skills.manifest.json is STALE relative to the source corpus — '
        + 'run `node scripts/generate-manifest.js --output skills.manifest.json` to regenerate and commit the result.\n');
    }
    if (!countParity) {
      process.stderr.write(`FAIL check-manifest-freshness: count parity violated — manifest declares ${manifestCount} skills `
        + `but ${physicalCount} physical SKILL.md files exist under the configured skill roots. `
        + 'The manifest is stale or the walker has forked; regenerate the manifest.\n');
    }
  }

  process.exit(ok ? 0 : 1);
}

main();
