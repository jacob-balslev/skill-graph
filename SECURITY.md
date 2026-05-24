# Security Policy

## Reporting a Vulnerability

Report security issues privately via GitHub Security Advisories:

👉 **https://github.com/jacob-balslev/skill-graph/security/advisories/new**

Please do **not** open a public issue for security reports.

If you cannot use GitHub Security Advisories, open a minimal public issue requesting an alternate private security channel. Do not include vulnerability details, secrets, reproduction payloads, or personal data in that public request.

## Response SLA

| Phase | Target |
|---|---|
| Triage acknowledgement | within 7 calendar days of report |
| Initial assessment | within 14 days |
| Fix or mitigation plan | within 30 days for high-severity issues; 90 days otherwise |

These are targets, not guarantees. Single-maintainer project — please be patient and follow up if you have not heard back.

## Scope

In scope:
- Source code, CLI binaries, and published `@skill-graph/cli` npm package.
- The `marketplace/` export pipeline and the scripts in `scripts/`.
- Documentation in this repository.

Out of scope:
- Skills loaded into third-party agent runtimes.
- Forks of this repo published outside `github.com/jacob-balslev`.
- Vulnerabilities in upstream dependencies — please report to those projects.
- Issues in the sibling repos ([skill-metadata-protocol](https://github.com/jacob-balslev/skill-metadata-protocol), [skill-audit-loop](https://github.com/jacob-balslev/skill-audit-loop), [skills](https://github.com/jacob-balslev/skills)) — file those against the respective repo.

## Coordinated Disclosure

We follow coordinated disclosure. Reporters will be credited in the published security advisory once a fix is released, unless the reporter requests anonymity.

## Supported Versions

Only the latest minor release line on `main` receives security fixes. Older lines are upgrade-only.
