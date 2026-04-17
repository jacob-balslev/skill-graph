# GitHub Actions Integration

Add Skill Graph lint to your own repository's CI pipeline in under five minutes.

## Minimal snippet (copy-paste)

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
        run: npm install --save-dev skill-graph
      - name: Run skill lint
        run: npx skill-graph-lint
```

This triggers on any PR or push to `main` that touches a file under `skills/`. It exits 1 (failing the job) when any skill file has a schema or structural error.

## Pointing at a non-default skills directory

If your skills live somewhere other than `skills/`, pass `--skills-dir`:

```yaml
- name: Run skill lint
  run: npx skill-graph-lint --skills-dir src/agent-skills
```

Update the `paths:` filter to match:

```yaml
paths:
  - 'src/agent-skills/**'
```

## Installing the lint script: two paths

### Path A — install as a dev dependency (recommended)

```bash
npm install --save-dev skill-graph
```

Then in your workflow:

```yaml
- name: Install Skill Graph
  run: npm install --save-dev skill-graph
- name: Run skill lint
  run: npx skill-graph-lint
```

**Trade-off:** Your `package.json` takes a dependency. You get automatic updates via `npm update` and version pinning via `package-lock.json`. This is the right default for most teams.

### Path B — vendor the lint script

Copy `scripts/skill-lint.js`, `scripts/lib/`, and `scripts/lint/` from this repo into your own repository under a path you control (e.g. `tools/skill-graph/`). Then call it directly:

```yaml
- name: Run skill lint
  run: node tools/skill-graph/skill-lint.js
```

**Trade-off:** No external dependency. You own the script and updates are manual (copy the new version when Skill Graph releases one). Good for air-gapped environments or repos with strict supply-chain policies.

> The script is self-contained — it uses only Node built-ins (`fs`, `path`, `child_process`) and has no `npm install` step of its own.

## What the lint checks

The same checks run whether you install via npm or vendor the script:

1. Schema validation against `skill.schema.json`
2. Parent-directory-matches-name (Agent Skills compatibility)
3. Relation target existence (linked skills must exist in the repo)
4. Eval artifact coherence (`eval_artifacts: present` requires at least one eval file)
5. Archetype-aware section validation (required H2 sections per archetype)
6. Routing quality (keywords required for `scope: codebase` skills)

See `docs/skill-audit-checklist.md` for the full list of what each check catches.

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

## Skipping generator parity in consumer repos

The `--skip-generator-parity` flag tells the linter not to verify that
`examples/skills.manifest.sample.json` matches generator output. Pass it if
your repo does not vendor the sample manifest:

```yaml
- name: Run skill lint
  run: npx skill-graph-lint --skip-generator-parity
```

This flag is typically not needed when installing via npm — the sample manifest
is included in the package and kept in sync by the Skill Graph release process.
It is useful when vendoring only the lint scripts without the full `examples/` tree.
