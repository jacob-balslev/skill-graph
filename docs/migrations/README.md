# Skill Metadata Protocol Migrations

This directory holds migration notes for authored `SKILL.md` frontmatter changes.

Start with the migration that matches the `schema_version` currently present in the skill you are editing, then run:

```bash
node scripts/skill-lint.js <skill>
node scripts/check-protocol-consistency.js
```

Available migrations:

- [`v6-to-v7.md`](v6-to-v7.md) — split the single `audit_verdict` into the four v7 Health Block verdicts.
