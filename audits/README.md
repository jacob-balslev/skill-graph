# Skill Audit Artifacts

This directory contains historical and compatibility audit artifacts. Treat per-skill files under
`audits/<skill>/` as snapshots unless a newer run explicitly says they are current.

Current autonomous Skill Audit Loop evidence is written by the claim/release system under:

```text
../skill-audit-loop/progress/skill-audits/<skill>/
../skill-audit-loop/progress/skill-audits/<skill>/history.jsonl
../skill-audit-loop/progress/skill-audits/<skill>/latest
```

Use the workspace adapter to locate the active run directory:

```bash
node ../scripts/skill/skill-audit-claim.js rundir <skill>
```

Do not infer current Audit Status from `audits/<skill>/findings.md`,
`audits/<skill>/scorecard.md`, or `audits/<skill>/verdict.md` alone. Seed artifacts can contain
TODO placeholders or deterministic `skill-graph audit` output that is not a completed qualitative
audit. The authoritative per-skill status is the skill's `audit-state.json` sidecar plus the
released queue-worker run evidence in `skill-graph/skill-audit-loop/progress/skill-audits/<skill>/`.
