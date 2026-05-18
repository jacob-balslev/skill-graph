#!/usr/bin/env node
"use strict";

/**
 * skill-test-runner.js
 *
 * Given a skill name, finds test files associated with its key files,
 * runs Jest scoped to those files, and returns structured results.
 *
 * Zero new test authoring required — runs existing tests only.
 * Uses execFileSync (not exec) — no shell injection risk.
 *
 * Usage:
 *   node scripts/skill/skill-test-runner.js --skill gdpr-compliance
 *   node scripts/skill/skill-test-runner.js --skill shopify --json
 *   node scripts/skill/skill-test-runner.js --skill webhook-integration --json --out /tmp/test-results.json
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT_DIR = path.resolve(__dirname, "../..");
const SKILLS_ROOT = path.join(ROOT_DIR, "skills");
const SALES_HUB_ROOT = path.join(ROOT_DIR, "sales-hub");
const SALES_HUB_WEB = path.join(ROOT_DIR, "sales-hub", "apps", "web");

function extractJestJson(output) {
  if (!output) return null;

  const trimmed = String(output).trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Jest can print console output before its pretty-printed JSON payload.
  }

  for (let i = trimmed.lastIndexOf("{"); i >= 0; i = trimmed.lastIndexOf("{", i - 1)) {
    try {
      const parsed = JSON.parse(trimmed.slice(i));
      if (
        parsed &&
        typeof parsed === "object" &&
        ("numTotalTests" in parsed || "testResults" in parsed)
      ) {
        return parsed;
      }
    } catch {
      // keep scanning older object starts
    }
  }

  const lines = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (!line.startsWith("{") || !line.endsWith("}")) continue;
    try {
      return JSON.parse(line);
    } catch {
      // keep scanning older lines
    }
  }

  return null;
}

function readJestJsonFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const cliArgs = process.argv.slice(2);

function getFlag(name) {
  return cliArgs.includes(`--${name}`);
}
function getFlagValue(name) {
  const idx = cliArgs.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= cliArgs.length) return null;
  return cliArgs[idx + 1];
}

const filterSkill = getFlagValue("skill");
const jsonOutput = getFlag("json");
const outFile = getFlagValue("out");
const dryRun = getFlag("dry-run");
const showHelp = getFlag("help") || getFlag("h");

if (showHelp || !filterSkill) {
  console.log(`Usage: node scripts/skill/skill-test-runner.js --skill <name> [options]

Options:
  --skill <name>   Skill to test (required)
  --json           Output as JSON
  --out <path>     Write JSON to file
  --dry-run        Find test files but don't run them
  --help           Show this help message

Examples:
  node scripts/skill/skill-test-runner.js --skill gdpr-compliance --json
  node scripts/skill/skill-test-runner.js --skill shopify --dry-run`);
  process.exit(showHelp ? 0 : 1);
}

// ---------------------------------------------------------------------------
// Reuse skill resolution and key file extraction from source-truth-catalog
// ---------------------------------------------------------------------------

function findSkillDir(name) {
  const candidates = [
    path.join(SKILLS_ROOT, name),
    path.join(SKILLS_ROOT, "sales-hub", name),
  ];
  try {
    for (const entry of fs.readdirSync(SKILLS_ROOT, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        entry.name !== "_meta" &&
        entry.name !== "_archived"
      ) {
        candidates.push(path.join(SKILLS_ROOT, entry.name, name));
      }
    }
  } catch {
    /* ignore */
  }

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "SKILL.md"))) return candidate;
  }
  return null;
}

const KEY_FILE_PATH_PATTERN = /`([^`\n]+\.[a-zA-Z]{1,6})`/g;
const KEY_FILES_SECTION_PATTERN =
  /##\s+(?:\d+\.\s+)?Key Files[\s\S]*?(?=\n##\s+(?:\d+\.\s+)?|\n---\s*$|$)/;

function extractKeyFilePaths(skillContent) {
  const keyFilesMatch = skillContent.match(KEY_FILES_SECTION_PATTERN);
  if (!keyFilesMatch) return [];
  const section = keyFilesMatch[0];
  const paths = [];
  let match;
  KEY_FILE_PATH_PATTERN.lastIndex = 0;
  while ((match = KEY_FILE_PATH_PATTERN.exec(section)) !== null) {
    const p = match[1];
    if (p.includes("/") && !p.startsWith("http")) paths.push(p);
  }
  return [...new Set(paths)];
}

const PATH_PREFIXES = [
  "",
  ROOT_DIR,
  path.join(ROOT_DIR, "sales-hub"),
  path.join(ROOT_DIR, "sales-hub", "apps", "web", "src"),
  path.join(ROOT_DIR, "agent-orchestration"),
];

function resolveFilePath(filePath) {
  const normalized = filePath.startsWith("@/")
    ? filePath.replace("@/", "sales-hub/apps/web/src/")
    : filePath;
  for (const prefix of PATH_PREFIXES) {
    const candidate = path.resolve(prefix, normalized);
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile())
        return candidate;
    } catch {
      /* ignore */
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Test file discovery
// ---------------------------------------------------------------------------

/**
 * Given an absolute source file path, find associated test files.
 * Conventions checked:
 *   1. __tests__/<basename>.test.ts(x)  (same directory)
 *   2. <basename>.test.ts(x) / .spec.ts(x)  (co-located)
 *   3. Parent __tests__/<basename>.test.ts(x)
 *   4. __tests__/<dirbasename>.test.ts(x)  (directory aggregate test file)
 *   5. scripts/__tests__/<basename>.test.js  (shared script tests for nested scripts/* files)
 */
function findTestFiles(absPath) {
  const dir = path.dirname(absPath);
  const ext = path.extname(absPath);
  const basename = path.basename(absPath, ext);
  const dirBasename = path.basename(dir);
  const relPath = path.relative(ROOT_DIR, absPath).replace(/\\/g, "/");
  const testExts = [".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx"];
  const found = [];

  for (const testExt of testExts) {
    // Convention 1: __tests__/ subdirectory
    const inTestDir = path.join(dir, "__tests__", basename + testExt);
    if (fs.existsSync(inTestDir)) found.push(inTestDir);

    // Convention 2: co-located
    const colocated = path.join(dir, basename + testExt);
    if (fs.existsSync(colocated)) found.push(colocated);

    // Convention 3: parent __tests__/
    const parentTestDir = path.join(
      path.dirname(dir),
      "__tests__",
      basename + testExt,
    );
    if (fs.existsSync(parentTestDir)) found.push(parentTestDir);

    // Convention 4: directory aggregate test file (e.g. lib/format/__tests__/format.test.ts)
    const dirAggregate = path.join(dir, "__tests__", dirBasename + testExt);
    if (fs.existsSync(dirAggregate)) found.push(dirAggregate);
  }

  if (relPath.startsWith("scripts/")) {
    for (const scriptTestExt of [".test.js", ".spec.js"]) {
      const sharedScriptTest = path.join(
        ROOT_DIR,
        "scripts",
        "__tests__",
        basename + scriptTestExt,
      );
      if (fs.existsSync(sharedScriptTest)) found.push(sharedScriptTest);
    }
  }

  return [...new Set(found)];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const skillDir = findSkillDir(filterSkill);
if (!skillDir) {
  console.error(`Skill not found: ${filterSkill}`);
  process.exit(1);
}

const skillFile = path.join(skillDir, "SKILL.md");
const skillContent = fs.readFileSync(skillFile, "utf8");
const keyFilePaths = extractKeyFilePaths(skillContent);

// Resolve key files and discover tests
const testMap = [];
const allTestFiles = [];
const noTestFiles = [];

for (const filePath of keyFilePaths) {
  const absPath = resolveFilePath(filePath);
  if (!absPath) continue;

  const ext = path.extname(absPath).toLowerCase();
  if (![".js", ".ts", ".tsx", ".jsx", ".mjs", ".cjs"].includes(ext)) continue;

  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(absPath)) {
    testMap.push({
      keyFile: filePath,
      testFiles: [path.relative(ROOT_DIR, absPath)],
    });
    allTestFiles.push(absPath);
    continue;
  }

  const tests = findTestFiles(absPath);
  if (tests.length > 0) {
    testMap.push({
      keyFile: filePath,
      testFiles: tests.map((t) => path.relative(ROOT_DIR, t)),
    });
    allTestFiles.push(...tests);
  } else {
    noTestFiles.push(filePath);
  }
}

const uniqueTestFiles = [...new Set(allTestFiles)];

const result = {
  skill: filterSkill,
  generatedAt: new Date().toISOString(),
  keyFilesAnalyzed: keyFilePaths.length,
  keyFilesWithTests: testMap.length,
  keyFilesWithoutTests: noTestFiles.length,
  totalTestFiles: uniqueTestFiles.length,
  testMap,
  noTestFiles,
  testExecution: null,
};

if (dryRun || uniqueTestFiles.length === 0) {
  if (uniqueTestFiles.length === 0) {
    result.testExecution = {
      status: "skipped",
      reason: "No test files found for any key file",
    };
  } else {
    result.testExecution = {
      status: "dry-run",
      testFiles: uniqueTestFiles.map((t) => path.relative(ROOT_DIR, t)),
    };
  }
} else {
  // Run Jest scoped to discovered test files
  const testPathPatterns = uniqueTestFiles
    .map((t) => path.relative(SALES_HUB_WEB, t).replace(/\\/g, "/"))
    .filter((t) => !t.startsWith("..")); // Only files inside sales-hub/apps/web

  if (testPathPatterns.length === 0) {
    result.testExecution = {
      status: "skipped",
      reason:
        "Test files are outside sales-hub/apps/web — not covered by Jest config",
      testFiles: uniqueTestFiles.map((t) => path.relative(ROOT_DIR, t)),
    };
  } else {
    const jestJsonPath = path.join(
      os.tmpdir(),
      `skill-test-runner-${filterSkill}-${process.pid}-${Date.now()}.json`,
    );
    try {
      // execFileSync: no shell — safe from injection
      const jestOutput = execFileSync(
        "npx",
        [
          "pnpm",
          "--filter",
          "sales-hub",
          "exec",
          "jest",
          "--testPathPatterns",
          ...testPathPatterns,
          "--passWithNoTests",
          "--ci",
           "--forceExit",
           "--json",
           "--outputFile",
           jestJsonPath,
        ],
        {
          cwd: SALES_HUB_ROOT,
          encoding: "utf8",
          timeout: 120000,
          stdio: ["pipe", "pipe", "pipe"],
        },
       );

       const jestResult = readJestJsonFile(jestJsonPath) || extractJestJson(jestOutput);
       if (!jestResult) {
         throw new Error("Jest JSON payload not found in stdout");
      }
      result.testExecution = {
        status: jestResult.success ? "passed" : "failed",
        numTotalTests: jestResult.numTotalTests,
        numPassedTests: jestResult.numPassedTests,
        numFailedTests: jestResult.numFailedTests,
        numPendingTests: jestResult.numPendingTests,
        testSuites: {
          total: jestResult.numTotalTestSuites,
          passed: jestResult.numPassedTestSuites,
          failed: jestResult.numFailedTestSuites,
        },
        failures: (jestResult.testResults || [])
          .filter((r) => r.status === "failed")
          .map((r) => ({
            file: path.relative(ROOT_DIR, r.name),
            failureMessages: (r.message || "").slice(0, 500),
          })),
      };
     } catch (err) {
       // Jest exits non-zero on test failures — parse the JSON from stdout
       const stdout = err.stdout || "";
       const stderr = err.stderr || "";
       try {
         const jestResult =
           readJestJsonFile(jestJsonPath) || extractJestJson(stdout) || extractJestJson(stderr);
         if (!jestResult) {
           throw new Error("Jest JSON payload not found in failure stdout");
        }
        result.testExecution = {
          status: "failed",
          numTotalTests: jestResult.numTotalTests,
          numPassedTests: jestResult.numPassedTests,
          numFailedTests: jestResult.numFailedTests,
          numPendingTests: jestResult.numPendingTests,
          testSuites: {
            total: jestResult.numTotalTestSuites,
            passed: jestResult.numPassedTestSuites,
            failed: jestResult.numFailedTestSuites,
          },
          failures: (jestResult.testResults || [])
            .filter((r) => r.status === "failed")
            .map((r) => ({
              file: path.relative(ROOT_DIR, r.name),
              failureMessages: (r.message || "").slice(0, 500),
            })),
        };
       } catch {
         result.testExecution = {
           status: "error",
           error: (stderr || stdout || err.message || "").slice(0, 500),
         };
       }
     } finally {
       try {
         fs.unlinkSync(jestJsonPath);
       } catch {
         /* ignore cleanup errors */
       }
     }
   }
 }

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

if (outFile) {
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(`Test results written to ${outFile}`);
}

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else if (!outFile) {
  console.log(`\nSkill Test Runner: ${filterSkill}`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Key files: ${keyFilePaths.length} analyzed`);
  console.log(`With tests: ${testMap.length}`);
  console.log(`Without tests: ${noTestFiles.length}`);
  console.log(`Test files found: ${uniqueTestFiles.length}`);
  console.log("");

  if (testMap.length > 0) {
    console.log("Test mapping:");
    for (const { keyFile, testFiles } of testMap) {
      console.log(`  ${keyFile}`);
      for (const tf of testFiles) {
        console.log(`    -> ${tf}`);
      }
    }
    console.log("");
  }

  if (noTestFiles.length > 0) {
    console.log("No tests found for:");
    for (const f of noTestFiles) {
      console.log(`  ${f}`);
    }
    console.log("");
  }

  if (result.testExecution) {
    const te = result.testExecution;
    if (te.status === "passed") {
      console.log(`Tests: ${te.numPassedTests}/${te.numTotalTests} passed`);
    } else if (te.status === "failed") {
      console.log(
        `Tests: ${te.numPassedTests}/${te.numTotalTests} passed, ${te.numFailedTests} FAILED`,
      );
      for (const f of te.failures || []) {
        console.log(`  FAIL ${f.file}`);
        console.log(`       ${f.failureMessages.slice(0, 200)}`);
      }
    } else {
      console.log(`Tests: ${te.status}${te.reason ? " — " + te.reason : ""}`);
    }
  }
}
