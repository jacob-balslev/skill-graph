---
name: owasp-security
description: "Use when reviewing code for security vulnerabilities, threat-modelling a new feature, implementing authentication or authorization, handling user input, or auditing a codebase against the OWASP Top 10 (2021). Covers injection (SQL, NoSQL, command, LDAP, XSS), broken access control, cryptographic failures, insecure design, security misconfiguration, vulnerable dependencies, identification and authentication failures, software and data integrity failures, logging and monitoring failures, and server-side request forgery. Do NOT use for general code review (use `code-review` for the holistic per-PR pass), for chasing a known production bug (use `debugging`), or for writing a security policy doc (use `documentation`)."
license: MIT
compatibility: Language-agnostic; OWASP Top 10 2021 reference
allowed-tools: Read Grep Bash
metadata:
  schema_version: "7"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/security
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-04"
  drift_check: "{\"last_verified\":\"2026-05-04\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"security\",\"owasp\",\"owasp top 10\",\"vulnerability\",\"sql injection\",\"xss\",\"cross site scripting\",\"csrf\",\"authentication\",\"authorization\",\"access control\",\"broken access control\",\"secret in code\",\"insecure design\",\"cryptographic failure\",\"ssrf\",\"threat model\",\"security review\",\"dependency vulnerability\",\"audit code for security\",\"is this code safe\",\"detect security vulnerabilities\"]"
  examples: "[\"audit this endpoint for SQL injection and XSS specifically\",\"this PR adds user input — what security checks should I run?\",\"threat-model this new file-upload feature\",\"review this auth flow against OWASP — is there a bypass?\",\"I'm building a search box — how do I prevent injection?\",\"the dependency scanner flagged 12 vulnerabilities — which ones matter?\",\"is this code path vulnerable to SSRF?\",\"review this access-control logic — can a non-admin escalate?\"]"
  anti_examples: "[\"review this PR holistically\",\"production users are reporting an error — debug it\",\"write our company security policy doc\",\"scaffold a new skill teaching security review\",\"rename this auth function for clarity\"]"
  relations: "{\"boundary\":[{\"skill\":\"code-review\",\"reason\":\"code-review is the holistic per-PR pass that includes security as one of many concerns; owasp-security is the security-specific deep audit\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases a known failure (security or otherwise); owasp-security finds vulnerabilities BEFORE they are exploited in production\"},{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy decides what to test broadly; owasp-security defines security-specific test cases (auth bypass tests, injection tests, etc.) as a sub-concern\"}],\"related\":[\"code-review\",\"testing-strategy\"],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality/security/owasp-security/SKILL.md
---

# OWASP Security

## Coverage

- The OWASP Top 10 (2021) categories: A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable Components, A07 Identification and Authentication Failures, A08 Software and Data Integrity Failures, A09 Security Logging and Monitoring Failures, A10 Server-Side Request Forgery
- Detection patterns per category: the code shapes that signal vulnerability and the grep / static-analysis queries that surface them
- Mitigation patterns per category: parameterised queries, output encoding, principle-of-least-privilege access checks, secure defaults, dependency pinning, input allowlisting, structured logging
- Threat modelling: the four-question STRIDE-lite (what are we building, what could go wrong, what are we doing about it, did we do a good job) for new features
- The AI-generated code premium: vulnerabilities specifically common in LLM-authored code (1.7-2.74× rate per published research) and what to look for
- Severity grading and disclosure: when a finding is critical, high, medium, or informational, and how to communicate fixes without leaking exploitable detail
- Defence in depth: why a single mitigation is insufficient, and how to layer controls
- The auth invariants that recur: authentication separated from authorisation, every privileged action checked, sessions invalidated on logout, secrets never in code or logs

## Philosophy

Security is not a feature; it is a *property* of the system that erodes silently unless actively maintained. The OWASP Top 10 is not a checklist to memorise — it is a vocabulary for naming the most-common ways software fails. A reviewer who can name "this is A03 Injection" and "this is A07 Identification Failure" can communicate findings to teammates, prioritise against industry data, and reach mitigations that are already documented and known to work.

The most expensive security bug is the one you didn't *notice was a security bug*. Most live vulnerabilities started life as a perfectly reasonable-looking line of code that the author did not recognise as a security-relevant decision. The point of this skill is to enrich your default reading of code with a security lens — not as a separate review pass, but as a way of seeing every input, every boundary, and every privileged action.

## The OWASP Top 10 — Detection and Mitigation

### A01 — Broken Access Control

**Detection.** Look for: missing authorisation checks on routes, IDOR-shaped URLs (`/users/{id}/...` with no ownership check), client-side-only role checks, force-browsing exposed endpoints, missing CSRF tokens on state-changing requests.

```
grep -rn "router\.\(get\|post\|put\|delete\)" --include="*.ts" \
  | grep -v "requireAuth\|requireAdmin\|allowAnonymous"
```

**Mitigation.** Centralise authorisation in middleware or a request-scoped helper (`requireAuth`, `requireOrgAccess`, `requireResourceOwnership`). Default to deny; require an explicit positive decision to allow. Test access denial as carefully as access success.

### A02 — Cryptographic Failures

**Detection.** Plaintext storage of credentials/PII, weak hashing (`md5`, `sha1`) for passwords (use Argon2 or bcrypt), reused IVs, hardcoded keys, missing TLS on sensitive endpoints, weak random sources (non-cryptographic random functions) for security tokens.

**Mitigation.** Use library primitives, not hand-rolled crypto. `crypto.randomBytes` for tokens; Argon2id/bcrypt for password hashing; AES-256-GCM with unique nonces for symmetric encryption; TLS 1.3 in transit; environment-variable secrets that the deployment system injects.

### A03 — Injection (SQL, NoSQL, command, LDAP, XSS)

**Detection.** String concatenation building queries, unparameterised user input interpolated into SQL/NoSQL/shell, dynamic-code-evaluation primitives invoked on any user input, direct DOM injection from user-controlled strings, missing output encoding in templates.

```
grep -rn "exec\|innerHTML\s*=" --include="*.ts" --include="*.js"
grep -rn "query.*\${" --include="*.ts" --include="*.sql"
```

The dynamic-code-evaluation family of primitives — those that take a string and execute it as code — is the highest-severity injection surface and should be banned in production code on user-controlled paths.

**Mitigation.** Parameterised queries always (`db.query("WHERE id = $1", [id])`, not template-literal interpolation of user input). Output encoding by default in the templating layer. Allowlist user input where the input space is narrow (enums, IDs). Content-Security-Policy headers to limit XSS blast radius. Forbid the dynamic-code-evaluation primitives entirely on production paths via a project-wide lint rule.

### A04 — Insecure Design

**Detection.** No threat model exists for the feature. Trust boundaries are not documented. Rate limiting absent on expensive operations. Business logic that can be subverted (price-tampering, quantity-tampering, redirect-tampering).

**Mitigation.** Threat-model new features at design time, not at review time. Document trust boundaries (what data is trusted, what is not). Rate-limit expensive operations and authentication endpoints. Server-side validate every business-rule the client could subvert.

### A05 — Security Misconfiguration

**Detection.** Default credentials in production. Verbose error messages (stack traces) returned to users. Unnecessary services enabled. Permissive CORS (`Access-Control-Allow-Origin: *` on credentialed endpoints). Missing security headers (CSP, X-Frame-Options, X-Content-Type-Options).

**Mitigation.** Secure defaults. Generic error messages to users; verbose logs to internal-only systems. Minimal services. Specific allowlisted origins for CORS on credentialed endpoints. Helmet (Node) or equivalent for header defaults.

### A06 — Vulnerable Components

**Detection.** Dependency lockfile not committed. No automated dependency-vulnerability scanning (Dependabot, Snyk, npm audit). Outdated framework versions with known CVEs.

**Mitigation.** Lockfiles committed. Automated vulnerability scanning on every PR. Pin direct dependencies; let the lockfile pin transitive ones. Patch high/critical CVEs within the disclosure SLA (typically 7-30 days).

### A07 — Identification and Authentication Failures

**Detection.** Weak password policies, no rate limiting on login, predictable session tokens, sessions not invalidated on logout, missing MFA option on sensitive accounts, password reset flow with predictable tokens.

**Mitigation.** Use a battle-tested auth library (NextAuth, Auth0, Clerk, Devise) — do not hand-roll. Rate-limit authentication. Invalidate sessions on logout, password change, and privilege escalation. Offer MFA. Password reset tokens must be cryptographically random and single-use with a short expiry.

### A08 — Software and Data Integrity Failures

**Detection.** Insecure deserialisation — using language-native binary deserialisers (e.g., Python's object-deserialisation module, Java native serialisation) on untrusted input is a remote code execution surface. JSON-parse with prototype-pollution risk on untrusted input. Unsigned packages or scripts loaded at runtime. CI/CD pipelines that pull and execute from mutable sources (pipe-to-shell of remote scripts).

**Mitigation.** Treat deserialised data as untrusted; validate against a schema before consuming. Prefer JSON or schema-validated formats over native binary deserialisers for any cross-trust-boundary data. Sign artifacts; verify signatures. Pin script sources by hash for any pipe-to-shell.

### A09 — Security Logging and Monitoring Failures

**Detection.** Authentication failures not logged. Sensitive operations (privilege change, data export) not logged. Logs that contain PII or secrets. No alerting on auth-anomaly patterns.

**Mitigation.** Log every authentication attempt (success and failure). Log every privileged operation with actor and target. Strip PII and secrets from logs. Alert on burst-authentication-failure patterns and unusual privileged actions.

### A10 — Server-Side Request Forgery (SSRF)

**Detection.** User input flowing into outbound HTTP requests (`fetch(userInput)`, `axios.get(userInput)`). Webhook URL validation that allows internal IPs. Image-proxying or URL-preview endpoints.

**Mitigation.** Allowlist outbound destinations. Reject URLs that resolve to RFC 1918 private addresses, link-local, or loopback. Use a separate egress-restricted network namespace for user-driven outbound calls.

## The AI-Generated Code Premium

Empirical studies (Stanford/Microsoft 2023, GitClear 2024) report AI-generated code has 1.7-2.74× the security-issue rate of human-authored equivalents. The recurring failure modes:

- **CWE-89 SQL Injection** — string-concatenated queries, the most common AI failure.
- **CWE-79 XSS** — direct DOM injection patterns from user-controlled strings, the second most common.
- **CWE-306 Missing Authentication** — endpoints generated without a thought to who can hit them.
- **CWE-918 SSRF** — user-input URLs passed to fetch with no validation.
- **CWE-22 Path Traversal** — file operations with unsanitised paths.

When reviewing AI-generated diffs, give these five categories deliberate attention. The code "looks fine" because it pattern-matches reasonable code; the security flaw is invisible at the line level and visible only when you ask the security questions explicitly.

## Threat-Modelling a New Feature

Four questions, asked at design time:

1. **What are we building?** A one-paragraph summary of the feature, including who the users are.
2. **What could go wrong?** Walk through STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For each, name a concrete attacker-story.
3. **What are we doing about it?** For each "could go wrong", name the mitigation. Defence in depth — at least two independent controls per category.
4. **Did we do a good job?** What evidence will convince us the mitigations work? Tests, code review, penetration testing, monitoring alerts.

The four questions are due *before* implementation, not during review. A feature without a threat model is shipping its security as a guess.

## Verification

- [ ] Every input boundary (HTTP, CLI, file upload, environment) is identified and the trust posture is explicit
- [ ] Every privileged action has an authorisation check that defaults to deny
- [ ] All database queries are parameterised; no string-concatenated SQL/NoSQL
- [ ] All HTML output is encoded by default; direct DOM injection from user-controlled strings is absent
- [ ] Dynamic-code-evaluation primitives are forbidden on production paths
- [ ] Secrets are loaded from environment, not committed in code or logs
- [ ] Dependencies are scanned on every PR; high/critical CVEs are patched within SLA
- [ ] Authentication is rate-limited; sessions invalidate on logout, password change, privilege escalation
- [ ] Outbound HTTP from user input is allowlisted (no SSRF surface)
- [ ] AI-generated diffs have been audited specifically for the five most-common AI failure modes
- [ ] A threat model exists for the feature being shipped

## Do NOT Use When

| Use instead | When |
|---|---|
| `code-review` | Conducting a holistic per-PR review (security is one concern of many) |
| `debugging` | Investigating a known production failure (security or otherwise) |
| `documentation` | Writing security policy or contributor security guide |
| `testing-strategy` | Deciding broadly what to test (security tests are one slice of strategy) |
| `skill-scaffold` | Authoring a new SKILL.md, including a security-themed skill |
