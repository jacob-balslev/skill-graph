# Scorecard

## Skill

`documentation`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | All required frontmatter fields present; schema validates cleanly |
| Activation quality | 5 | Description is specific; keywords cover common entry phrases; label trigger present |
| Relation quality | 5 | Relations are conservative and real — no ornamental partners; three negative routes in `## Do NOT Use When` |
| Grounding fidelity | N/A | Skill is `scope: generic` with no `domain_frame`; grounding dimension does not apply to generic starters |
| Content quality | 5 | `## Coverage` is a six-item scope map; `## Philosophy` is two sentences with a clear stance; `## Verification` has five actionable items |
| Eval quality | 4 | `examples/evals/comprehension.json` ships seven grounded prompts; full coverage of boundary and semantic-layer concerns. Deduct one for no explicit failure-mode eval |
| Portability quality | 5 | Generic, no private assumptions, compatible with all declared export targets; `agent-skills` export works via `node scripts/export-skill.js <skill-dir>`; `cursor`, `windsurf`, and `copilot` targets are still aspirational |
