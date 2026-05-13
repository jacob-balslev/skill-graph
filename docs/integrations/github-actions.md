# GitHub Actions Integration

Add Skill Graph lint to your own repository's CI pipeline.

> **Status.** Skill Graph has not been published to npm. The only working installation path today is **clone and vendor**. A future release will publish `skill-graph` as an npm package with an `npx skill-graph-lint` CLI entry point; those snippets are preserved below as **when-published** reference, not current guidance.

## Installation (current — clone and vendor)

The only working path today is to copy the self-contained lint scripts into your repository and commit them alongside your skills. The scripts use only Node built-ins — no `npm install` step is involved.

### 1. Vendor the scripts

From the Skill Graph repo, copy these paths into your own repository under a path you control (example uses `tools/skill-graph/`):

```
scripts/skill-lint.js           → tools/skill-graph/skill-lint.js
scripts/lib/                    → tools/skill-graph/lib/
scripts/lint/                   → tools/skill-graph/lint/
scripts/check-protocol-consistency.js  (optional) → tools/skill-graph/check-protocol-consistency.js
scripts/generate-manifest.js    (optional) → tools/skill-graph/generate-manifest.js
scripts/export-skill.js         (optional) → tools/skill-graph/export-skill.js
schemas/skill.schema.json       → tools/skill-graph/schemas/skill.schema.json
schemas/manifest.schema.json    → tools/skill-graph/schemas/manifest.schema.json
```

The lint script resolves its schema location relative to its own file path, so keep the `schemas/` directory alongside the scripts in whichever target layout you pick.

### 2. Commit and reference from CI

```yaml
# .github/workflows/skill-graph-lint.yml
name: Skill Graph Lint

on:
  push:
    branches: [main]
    paths:
      - 'skills/**'
      - 'tools/skill-graph/**'
  pull_request:
    paths:
      - 'skills/**'
      - 'tools/skill-graph/**'

jobs:
  lint:
    name: Lint skills
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Run skill lint
        run: node tools/skill-graph/skill-lint.js
```

This triggers on any PR or push to `main` that touches a file under `skills/` or the vendored scripts. It exits 1 (failing the job) when any skill file has a schema or structural error.

**Trade-off.** No external dependency. You own the script and update it manually by re-copying from the Skill Graph repo when you want a newer version. This is the right path for air-gapped environments, repos with strict supply-chain policies, and — today — for every consumer, because no published package exists yet.

### 3. Pointing at a non-default skills directory

If your skills live somewhere other than `skills/`, pass `--skills-dir`:

```yaml
- name: Run skill lint
  run: node tools/skill-graph/skill-lint.js --skills-dir src/agent-skills
```

Update the `paths:` filter to match:

```yaml
paths:
  - 'src/agent-skills/**'
```

### 4. Skipping generator parity when you don't vendor the sample manifest

The `--skip-generator-parity` flag tells the linter not to verify that `examples/skills.manifest.sample.json` matches generator output. Pass it if your repo vendors the lint scripts but does not vendor the sample manifest:

```yaml
- name: Run skill lint
  run: node tools/skill-graph/skill-lint.js --skip-generator-parity
```

## Installation (when published — not yet available)

The snippets in this section describe the planned npm-based flow. They **do not work today** because Skill Graph has not been published to npm. Keep this section as a reference until the package ships; when it ships, this document will be updated and the clone-and-vendor path above will become the secondary option.

### Planned minimal snippet

```yaml
# .github/workflows/skill-graph-lint.yml — WHEN PUBLISHED (not today)
name: Skill Graph Lint

on:
  push:
    branches: [main]
    paths:
      - 'skills/**'
  pull_request:
    paths:
      - 'skills/**'

jobs:
  lint:
    name: Lint skills
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install Skill Graph
        run: npm install --save-dev skill-graph  # WHEN PUBLISHED
      - name: Run skill lint
        run: npx skill-graph-lint                 # WHEN PUBLISHED
```

### Planned dev-dependency install

```bash
# WHEN PUBLISHED — not today
npm install --save-dev skill-graph
```

```yaml
# WHEN PUBLISHED — not today
- name: Install Skill Graph
  run: npm install --save-dev skill-graph
- name: Run skill lint
  run: npx skill-graph-lint
```

### Planned skills-dir flag

```yaml
# WHEN PUBLISHED — not today
- name: Run skill lint
  run: npx skill-graph-lint --skills-dir src/agent-skills
```

### Planned generator-parity skip flag

```yaml
# WHEN PUBLISHED — not today
- name: Run skill lint
  run: npx skill-graph-lint --skip-generator-parity
```

## What the lint checks

The same checks run whether you vendor the script today or (eventually) install via npm:

1. Schema validation against `skill.schema.json`
2. Parent-directory-matches-name (Agent Skills compatibility)
3. Relation target existence (linked skills must exist in the repo)
4. Eval artifact coherence (`eval_artifacts: present` requires at least one eval file)
5. Archetype-aware section validation (required H2 sections per archetype)
6. Routing quality (keywords required for `scope: codebase` skills)

See [`SKILL_AUDIT_CHECKLIST.md`](../../SKILL_AUDIT_CHECKLIST.md) for the full list of what each check catches.

## Example: PR blocked by a malformed skill

Given a skill file with a missing required `description` field:

```
ERR  skills/my-skill/SKILL.md:3:1
  |
3 | name: my-skill
  | ^
  |
  = description: required field is missing
    Add a one-line routing contract: `description: "What this skill does and when to use it."`
```

The job exits 1 and GitHub blocks the merge until the field is added.
