# GitHub Actions Integration

Add Skill Graph lint to your own repository's CI pipeline.

> **Package shape.** The GitHub repository is `jacob-balslev/skill-graph`. The npm package is `@skill-graph/cli`, and it exposes the `skill-graph` binary. The CLI is a thin dispatcher over the same zero-dependency scripts used in this repo, so local development, CI, and installed usage share one code path.

## Installation (npm package)

After the package is published, install it as a dev dependency and run the binary through `npx`:

```bash
npm install --save-dev @skill-graph/cli
```

```yaml
# .github/workflows/skill-graph-lint.yml
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
        run: npm install --save-dev @skill-graph/cli
      - name: Run skill lint
        run: npx skill-graph lint
      - name: Verify SKILL.md export
        run: npx skill-graph export-verify
```

For local release testing before npm publish, run `npm link` from a clone of this repo, then use `skill-graph lint`, `skill-graph manifest`, `skill-graph route`, and `skill-graph drift` from the consumer repository.

## Installation (clone and vendor)

For air-gapped environments or repos with strict supply-chain policy, copy the self-contained scripts into your repository and commit them alongside your skills. The scripts use only Node built-ins once vendored.

### 1. Vendor the scripts

From the Skill Graph repo, copy these paths into your own repository under a path you control (example uses `tools/skill-graph/`):

```
scripts/skill-lint.js           → tools/skill-graph/skill-lint.js
scripts/lib/                    → tools/skill-graph/lib/
scripts/lint/                   → tools/skill-graph/lint/
scripts/check-protocol-consistency.js  (optional) → tools/skill-graph/check-protocol-consistency.js
scripts/generate-manifest.js    (optional) → tools/skill-graph/generate-manifest.js
scripts/export-skill.js         (optional) → tools/skill-graph/export-skill.js
schemas/SKILL_METADATA_PROTOCOL_schema.json       → tools/skill-graph/schemas/SKILL_METADATA_PROTOCOL_schema.json
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

**Trade-off.** No external dependency. You own the script and update it manually by re-copying from the Skill Graph repo when you want a newer version. This is the right path for air-gapped environments and repos with strict supply-chain policies.

### 3. Pointing at a non-default skills directory

If your skills live somewhere other than `skills/`, either declare the roots in `.skill-graph/config.json` or pass the root directory explicitly. The linter treats a directory containing many `<skill>/SKILL.md` folders as a skill root:

```yaml
- name: Run skill lint
  run: node tools/skill-graph/skill-lint.js src/skills
```

Update the `paths:` filter to match:

```yaml
paths:
  - 'src/skills/**'
```

### 4. Skipping generator parity when you intentionally diverge

When `examples/skills.manifest.sample.json` is absent, generator parity is skipped automatically. Use `--skip-generator-parity` only when the sample manifest exists but your CI job intentionally does not want to compare it with freshly generated output:

```yaml
- name: Run skill lint
  run: node tools/skill-graph/skill-lint.js --skip-generator-parity
```

## What the lint checks

The same checks run whether you install the npm package or vendor the script:

1. Valid YAML frontmatter
2. Schema validation against `SKILL_METADATA_PROTOCOL_schema.json`
3. `name` field shape
4. Non-empty `description`
5. Parent directory name equals the final `name` segment
6. `subjects[0]` matches `subject` when both fields are present

Export compatibility is checked by the marketplace export tools, not by `skill-lint.js`.

See `skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 2 — Per-Skill Audit Checklist for the full list of what each check catches.

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
