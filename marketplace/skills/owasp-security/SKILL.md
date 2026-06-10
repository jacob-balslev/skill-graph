---
name: owasp-security
description: "Use when reviewing code for security vulnerabilities, threat-modelling a new feature, implementing authentication or authorization, handling user input, hardening dependencies or CI/CD against software-supply-chain compromise, or auditing a codebase against the current OWASP Top 10 (2025, with the 2021 mapping retained). Covers broken access control (incl. SSRF), security misconfiguration, software supply chain failures, cryptographic failures, injection (SQL, NoSQL, command, LDAP, XSS), insecure design, authentication failures, software/data integrity failures, security logging and alerting failures, and mishandling of exceptional conditions (fail-open error paths, error leakage). Do NOT use for general code review (use `code-review` for the holistic per-PR pass), for chasing a known production bug (use `debugging`), for defending an LLM against prompt/RAG injection or agent-tool-authority abuse (use `prompt-injection-defense`), or for writing a security policy doc (use `documentation`)."
license: MIT
compatibility: "Language-agnostic; anchored on OWASP Top 10:2025 with a 2021 compatibility map retained"
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"guardrails\",\"code-review\",\"testing-strategy\",\"debugging\",\"best-practice\",\"prompt-injection-defense\",\"security-fundamentals\"],\"suppresses\":[\"code-review\",\"testing-strategy\"],\"verify_with\":[\"testing-strategy\",\"code-review\",\"security-fundamentals\"]}"
  subject: quality-assurance
  scope: "Teaches the security-specific review lens for the OWASP Top 10:2025 (mapped to 2021): per-category detection greps, mitigations, a procedural source-to-sink review workflow over trust boundaries, severity grading and responsible disclosure, software-supply-chain hardening, error-path (fail-open) review, security-test probes, and the elevated-risk patterns of AI-generated code — turning findings into severity-ranked, root-cause remediation. Applies when the task is an explicit security audit, a feature threat model, or an auth / input-handling implementation. Out of scope: holistic per-PR review (code-review), production-bug hunts (debugging), broad test-level strategy (testing-strategy), LLM prompt/RAG injection and agent-tool-authority defence (prompt-injection-defense), and security-policy authoring (documentation)."
  public: "true"
  taxonomy_domain: quality/security
  grounding: "{\"subject_matter\":\"Application-security review using OWASP Top 10:2025, ASVS 5.0, OWASP Cheat Sheets, current supply-chain/tooling guidance, and empirical AI-generated-code risk evidence\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://owasp.org/www-project-top-ten/\",\"https://github.com/OWASP/Top10\",\"https://owasp.org/Top10/2025/\",\"https://owasp.org/Top10/2025/0x00_2025-Introduction/\",\"https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/\",\"https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/\",\"https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/\",\"https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/\",\"https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/\",\"https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html\",\"https://github.com/OWASP/ASVS\",\"https://slsa.dev/spec/v1.2/\",\"https://docs.npmjs.com/trusted-publishers/\",\"https://help.openai.com/en/articles/20001107-codex-security\",\"https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code\",\"https://www.veracode.com/blog/genai-code-security-report/\",\"https://appsecsanta.com/research/ai-code-security-study-2026\"],\"failure_modes\":[\"Citing 2021 category numbers after the 2025 renumber (e.g. calling SSRF 'A10') and mis-routing a finding's A0x label\",\"SSRF removed instead of re-homed under Broken Access Control\",\"Vulnerable components treated as only CVE scanning, not whole-chain supply-chain integrity\",\"Treating a clean SAST/SCA scan as proof of safety rather than the absence of a known-pattern match\",\"AI security reviewer treated as a replacement for human security judgment\",\"Stamping a single AI-vuln-rate multiplier as fixed when published rates vary by language, model, and methodology\",\"Applying this web-appsec taxonomy to an LLM instruction-channel attack (prompt/RAG injection) that belongs to the OWASP LLM Top 10 and prompt-injection-defense\",\"Exception handlers reviewed as code quality, not as security-relevant fail-open paths\",\"Security findings disclosed with exploit payloads or secrets\"],\"evidence_priority\":\"general_knowledge_first\"}"
  stability: experimental
  keywords: "[\"security\",\"owasp\",\"owasp top 10\",\"vulnerability\",\"sql injection\",\"xss\",\"authentication\",\"authorization\",\"supply chain\",\"access control\"]"
  examples: "[\"audit this endpoint for SQL injection and XSS specifically\",\"this PR adds user input — what security checks should I run?\",\"threat-model this new file-upload feature\",\"review this auth flow against OWASP — is there a bypass?\",\"the dependency scanner flagged 12 vulnerabilities — which ones matter?\",\"is this code path vulnerable to SSRF?\",\"review this access-control logic — can a non-admin escalate?\",\"audit our CI/CD and dependencies for supply-chain compromise\",\"does this error handler fail open or leak a stack trace?\",\"what security tests should prove this authorization change is safe?\"]"
  anti_examples: "[\"review this PR holistically\",\"production users are reporting an error — debug it\",\"write our company security policy doc\",\"scaffold a new skill teaching security review\",\"rename this auth function for clarity\",\"harden my chatbot against prompt injection and jailbreaks\",\"my RAG agent is following instructions hidden in retrieved documents\"]"
  mental_model: "Application-security review is source-to-sink reasoning over trust boundaries. The reviewer identifies attacker-controlled inputs, privileged operations, sensitive data, external dependencies, configuration, and error paths, then asks whether each path preserves confidentiality, integrity, availability, and authorization under hostile input and partial failure."
  purpose: "This skill prevents plausible-looking code from shipping with security-relevant decisions left implicit. It gives agents a current OWASP vocabulary, concrete detection patterns, mitigations, abuse tests, and reporting discipline so security review finds root causes rather than isolated symptoms."
  concept_boundary: "This skill owns traditional application-security review, OWASP Top 10 web-app weaknesses, and security-specific threat modeling. It does not own holistic PR approval, root-cause debugging after a failure, broad test-level strategy, policy documentation, or LLM-specific prompt-injection and agent-authority architecture."
  analogy: "An OWASP review is a border inspection for a software system: every crossing between trust zones is checked for identity, permission, payload, destination, and failure behavior."
  misconception: "The common mistake is treating the OWASP Top 10 as ten labels to memorize. The better model is to use the labels as routing names for underlying CWE-shaped failure modes; the fix follows the weakness and the trust boundary, not the A0x number."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/owasp-security/SKILL.md
---

# OWASP Security

## Concept of the skill

Application-security review is source-to-sink reasoning over trust boundaries. The reviewer identifies attacker-controlled inputs, privileged operations, sensitive data, external dependencies, configuration, and error paths, then asks whether each path preserves confidentiality, integrity, availability, and authorization under hostile input and partial failure.

## Concept of the Skill

**What it is.** A security-specific review discipline for code, design, and configuration. It uses the current OWASP Top 10:2025 as its primary vocabulary, retains the 2021 mapping for compatibility, and turns each suspected weakness into concrete evidence, impact, mitigation, and tests.

**Mental model.** Security failures occur at boundaries: user to server, tenant to tenant, client to data store, app to dependency, CI to registry, normal path to error path, log stream to human response. Review every boundary as hostile unless the code proves otherwise.

**What it is NOT.** It is not a holistic PR review, incident debugging, policy writing, or LLM prompt-injection architecture. It may compose with those skills, but it owns the application-security deep pass.

## Coverage

- The OWASP Top 10:2025 categories: A01 Broken Access Control (now including SSRF), A02 Security Misconfiguration, A03 Software Supply Chain Failures, A04 Cryptographic Failures, A05 Injection, A06 Insecure Design, A07 Authentication Failures, A08 Software or Data Integrity Failures, A09 Security Logging and Alerting Failures, A10 Mishandling of Exceptional Conditions
- The 2021→2025 mapping, so a finding is communicable in either edition's vocabulary (many compliance frameworks, scanners, and CWE mappings still cite 2021)
- A procedural review workflow: the order in which to walk a diff or codebase so nothing is skipped
- Detection patterns per category: the code shapes, configuration shapes, dependency shapes, and data-flow paths that signal vulnerability — plus the grep / static-analysis queries that surface them
- Mitigation patterns per category: default-deny authorization, parameterised queries, output encoding, secure defaults, signed/pinned dependencies and SBOMs, adaptive password hashing, fail-closed error handling, input allowlisting, structured logging, and alerting
- Automation mapping: which class of tool (SAST, DAST, SCA, secret scan, IaC scan, SBOM, provenance) catches which category, how to treat each tool's output as evidence rather than authority, and concrete security test probes per category
- Threat modelling: the four-question STRIDE-lite (what are we building, what could go wrong, what are we doing about it, did we do a good job) for new features
- The AI-generated code premium: vulnerabilities specifically common in LLM-authored code (Veracode 2025: ~45% of samples carry an OWASP Top 10 flaw, ~72% for Java; independent 2026 study: ~26%) and what to look for
- Severity grading and responsible disclosure: when a finding is critical, high, medium, or informational, and how to communicate fixes without leaking exploitable detail
- Defence in depth: why a single mitigation is insufficient, and how to layer controls
- The auth invariants that recur: authentication separated from authorisation, every privileged action checked, sessions invalidated on logout, secrets never in code or logs

## Philosophy of the skill
Security is not a feature; it is a *property* of the system that erodes silently unless actively maintained. The OWASP Top 10 is not a checklist to memorise — it is a shared vocabulary for naming the most-common ways software fails under hostile input, missing boundaries, weak configuration, and partial failure. A reviewer who can name "this is A05 Injection" and "this is A07 Authentication Failure" can communicate findings to teammates, prioritise against industry data, and reach mitigations that are already documented and known to work.

The most expensive security bug is the one nobody *noticed was a security bug*. A route with no ownership check, a `catch` block that returns `true`, a dependency publish workflow with a long-lived token, or a helpful stack trace can all look like ordinary engineering until you ask who controls the input, what privilege is exercised, and what happens when the happy path fails. The point of this skill is to enrich your default reading of code with a security lens — not as a separate review pass, but as a way of seeing every input, every boundary, every privileged action, and every *error path*.

**The taxonomy moves; the bugs do not.** OWASP renumbers categories every release, but the underlying CWEs (the concrete weakness classes) are stable: CWE-89 SQL injection, CWE-918 SSRF, CWE-636 fail-open, CWE-532 secrets in logs. Anchor your reasoning on the weakness and the trust boundary, and treat the A0x label as a routing/communication aid. That is why this skill keeps the 2021↔2025 mapping: the *name* of a finding may differ by edition, but the *fix* does not.

## Security Review Workflow

Walk a diff or codebase in this order; each step narrows the surface before the next. Skipping a step is how a vulnerability survives review.

1. **Name the asset and attacker.** What data, account, money movement, privileged action, infrastructure, or availability guarantee matters? Who benefits from breaking it?
2. **Inventory the entry points.** HTTP params/headers/body, GraphQL resolvers, webhooks, CLI flags, file uploads, query strings, background jobs, browser storage, environment variables, package install scripts, CI workflows, admin consoles, and any deserialised payload are all input boundaries. You cannot review what you have not listed.
3. **Draw the trust boundaries.** Browser/server, anonymous/authenticated, user/admin, tenant/tenant, app/database, app/third-party, app/CI, CI/package registry, and normal/error path.
4. **Map the change to the Top 10:2025 and trace source to sink.** For each attacker-controlled value, name the category and CWE, then follow it to where it lands — SQL/NoSQL, shell, LDAP, the DOM, file paths, an outbound `fetch`, an auth decision, a deserialiser, a log sink, or a payment/business-rule decision — and verify it is parameterised, encoded, allowlisted, or schema-validated at the sink. Naming forces recognition; an unnamed line is an unreviewed line.
5. **Check the default and walk the error paths (A10).** Safe systems deny, encode, validate, roll back, and alert by default. The happy path is the half reviewers skip: check every `catch`, guard, and early return — does failure deny and roll back, or grant and continue? Does it leak a stack trace?
6. **Audit dependencies and the supply chain (A03).** Lockfile committed? Vulnerability scan in CI? SBOM generated? Install scripts constrained? CI publish tokens least-privilege and short-lived?
7. **Validate exploitability, then grade and document.** Prefer a harmless proof of concept, failing test, or SAST trace — never paste real secrets, customer data, private URLs, or destructive payloads into the report. Assign severity + CWE + a concrete root-cause fix (see § Severity and Disclosure).
8. **Fix the root cause and add a regression test.** The best fix removes the vulnerable construction or centralises the control; a local allowlist is weak if other paths bypass the same boundary. Confirm the fix fails *closed*, then write the security test that would have caught it (see § Security Test Probes) so the regression cannot return silently.

## OWASP Top 10 — 2021 ↔ 2025 Mapping

This skill is anchored on the **2025** edition (final, published by OWASP in late 2025 from analysis of 589 CWEs across 2.8M+ applications). The 2021 edition is still widely cited by compliance regimes and scanners, so the mapping is retained, not discarded.

| 2025 | Category | 2021 lineage | Practical change |
|---|---|---|---|
| A01 | Broken Access Control | A01 (+ A10 SSRF) | Still #1. **SSRF folded in** as an authorization failure — the server is tricked into reaching resources it should not access. |
| A02 | Security Misconfiguration | A05 | Rose #5 → #2. Cloud, CORS, headers, default services, and exposed storage matter. |
| A03 | **Software Supply Chain Failures** | A06 (expanded) | **Broadened** from "Vulnerable & Outdated Components" to the whole build/distribute/update chain. |
| A04 | Cryptographic Failures | A02 | Dropped #2 → #4. Same root class; weak crypto, key leakage, random-token mistakes, nonce reuse, missing encryption remain high-impact. |
| A05 | Injection | A03 | Dropped #3 → #5. Still broad: SQL, NoSQL, OS command, LDAP, template, HTML/DOM/XSS, dynamic code evaluation. |
| A06 | Insecure Design | A04 | Dropped #4 → #6. Threat modeling and abuse-case design remain required before implementation. |
| A07 | Authentication Failures | A07 | Renamed (dropped "Identification and"). Focus on authentication, sessions, MFA, reset flows, token lifecycle. |
| A08 | Software or Data Integrity Failures | A08 | Stable. Runtime integrity of data, update mechanisms, deserialization; build/distribution moves to A03. |
| A09 | Security Logging and Alerting Failures | A09 | Renamed ("Monitoring" → "Alerting"): a log nobody acts on is not a detective control. |
| A10 | **Mishandling of Exceptional Conditions** | — (new) | **New**: fail-open, error leakage, unchecked return values, uncaught exceptions, partial-state rollback. |

## The OWASP Top 10:2025 — Detection and Mitigation

### A01 — Broken Access Control (now includes SSRF)

**Detection.** Missing authorisation checks on routes, IDOR-shaped URLs (`/users/{id}/...` with no ownership check), client-side-only role checks, force-browsing exposed endpoints, path traversal into files, open redirects, permissive CORS, missing CSRF tokens on state-changing requests (CWE-352), JWT or cookie metadata trusted without server-side validation, and search/vector-retrieval paths that apply tenant filters only *after* fetching from a shared index. In 2025 this category also owns **Server-Side Request Forgery** (CWE-918): user input flowing into outbound requests (`fetch(userInput)`, `axios.get(userInput)`), webhook-URL validation that allows internal IPs, and image-proxy / URL-preview endpoints — OWASP reclassified SSRF as an authorization failure (the server is tricked into accessing resources it should not reach).

```
grep -rn "router\.\(get\|post\|put\|delete\)" --include="*.ts" \
  | grep -v "requireAuth\|requireAdmin\|allowAnonymous"
grep -rn "fetch(\|axios\.\(get\|post\)\|http\.request(" --include="*.ts" --include="*.js"
grep -rn "sendFile\|readFile\|createReadStream" --include="*.ts" --include="*.js"
```

**Mitigation.** Centralise authorisation in server-side middleware or request-scoped helpers (`requireAuth`, `requireOrgAccess`, `requireResourceOwnership`). Default to deny; require an explicit positive decision to allow, and enforce record ownership in the domain model, not only the route handler. Test access denial as carefully as access success. For SSRF: allowlist outbound destinations; reject URLs that resolve to RFC 1918 private addresses, link-local, or loopback (resolve-then-check to defeat DNS rebinding); use a separate egress-restricted network namespace for user-driven outbound calls. Invalidate stateful sessions server-side on logout; keep stateless JWTs short-lived and revocable through refresh-token flows.

**Retrieval tenant-isolation (RAG / vector stores).** A vector database or search index that serves an AI feature is a *data store* subject to the same access control as any other — and the most common 2025-era failure is a missing tenant/owner filter on the retrieval query, so user A's query surfaces user B's documents. This is **classical broken access control (CWE-285/CWE-639), not prompt injection**: scope every similarity search and full-text query with a server-side tenant/ownership predicate (a `WHERE org_id = $current` equivalent on the vector filter, enforced in the storage/query layer via row-level security, namespaces, collections, or mandatory pre-retrieval filters — never post-retrieval filtering), default to deny, and test cross-tenant retrieval the same way you test IDOR. The *content* of a retrieved document being able to subvert the model is a separate, LLM-layer concern owned by `prompt-injection-defense` — this skill owns only that the right *rows* are returned to the right *principal*.

### A02 — Security Misconfiguration

**Detection.** Default credentials in production. Exposed admin consoles. Publicly readable storage buckets. Verbose error messages (stack traces) returned to users. Unnecessary services enabled. Debug mode left on. Permissive CORS (`Access-Control-Allow-Origin: *` on credentialed endpoints). Missing security headers (CSP, X-Frame-Options, X-Content-Type-Options, HSTS). Broad cloud IAM roles. Config drift between environments.

**Mitigation.** Treat configuration as code and review it like code. Start from secure defaults; disable unused services; use least-privilege cloud/IAM roles; allowlist specific CORS origins on credentialed endpoints; return generic user-facing errors and send detail only to internal logs (the user-facing half of this overlaps A10 — see below). Prefer `frame-ancestors` CSP over legacy frame controls where supported. Helmet (Node) or equivalent for header defaults. Verify headers, CORS, cookies, and exposed buckets in CI or deployment checks.

### A03 — Software Supply Chain Failures

This is the 2025 expansion of the old "Vulnerable and Outdated Components" — it now covers the *entire* build, distribution, and update chain, not just stale dependencies.

**Detection.** Dependency lockfile not committed. Unpinned direct dependencies. No automated dependency-vulnerability scanning (Dependabot, Snyk, `npm audit`, OSV-Scanner). Outdated framework versions with known CVEs (CWE-1395). Unmaintained packages (CWE-1104). Components that cannot be updated (CWE-1329). CI/CD that pulls and executes from mutable sources. Build steps with broad write access to artifact registries. Package publishing that uses long-lived tokens. No provenance/signature verification on installed or published artifacts. Absent SBOM, or no process for vulnerability triage / VEX decisions. Postinstall scripts running with full network + filesystem access (the vector behind the 2025 *Shai-Hulud* self-propagating npm worm, which harvested credentials and re-published infected packages).

```
# lockfile present and committed?
git ls-files | grep -E "package-lock.json|pnpm-lock.yaml|yarn.lock|Cargo.lock|poetry.lock|go.sum"
# pipe-to-shell of remote scripts in CI?
grep -rn "curl.*|.*\(sh\|bash\)\|wget.*|.*\(sh\|bash\)" --include="*.yml" --include="*.yaml" --include="Dockerfile"
# long-lived publish tokens in CI?
grep -rn "NPM_TOKEN\|PYPI_TOKEN\|GITHUB_TOKEN" --include="*.yml" --include="*.yaml"
```

**Mitigation.** Commit lockfiles. Pin direct dependencies; let the lockfile pin transitive ones. Use SCA on every PR plus continuous SBOM monitoring for released software. Generate and retain a **Software Bill of Materials (SBOM)** — ideally CycloneDX or SPDX — and feed it into a system such as Dependency-Track when you need portfolio visibility; monitor it against CVE/NVD/OSV feeds. Prefer registries/installers that **verify provenance and signatures** (npm provenance via trusted publishing / OIDC, Sigstore, SLSA-style attestations) so publishing requires no long-lived token. Stage rollouts of vendor updates rather than auto-applying. Constrain CI/CD with least-privilege, short-lived tokens, separation of duties, and MFA on publish. Disable or sandbox dependency install scripts where the package manager allows. Patch high/critical CVEs within the disclosure SLA (typically 7–30 days). Remember that provenance proves *where and how* an artifact was built — it does not prove the source code or workflow is harmless.

### A04 — Cryptographic Failures

**Detection.** Plaintext storage of credentials/PII, weak hashing (`md5`, `sha1`) for passwords, secrets or keys committed to source, reused IVs/nonces, ECB/CBC where authenticated encryption is required, hardcoded keys, non-cryptographic random sources for security tokens, missing TLS, missing HSTS, certificate validation disabled, deprecated protocols, caches that store sensitive responses.

**Mitigation.** Use library primitives, not hand-rolled crypto. `crypto.randomBytes` (or platform CSPRNG) for tokens. **Argon2id** for password hashing — OWASP's current parameters (RFC 9106): minimum 19 MiB memory, iteration count 2, parallelism 1 (or 46 MiB / t=1 / p=1 as an equivalent memory-CPU trade). If Argon2id is unavailable, scrypt (N=2^17 / r=8 / p=1), or bcrypt (work factor ≥ 10, and enforce a ≤ 72-byte password length because bcrypt silently truncates beyond it), or PBKDF2-HMAC-SHA-256 ≥ 600,000 iterations where FIPS compliance is required. AES-256-GCM or XChaCha20-Poly1305 with unique nonces for symmetric encryption. TLS 1.3 in transit (1.2 minimum) with HSTS; environment-variable secrets that the deployment system injects. Plan post-quantum migration for long-lived, high-risk confidentiality.

### A05 — Injection (SQL, NoSQL, command, LDAP, XSS)

**Detection.** String concatenation building SQL/NoSQL/LDAP queries, shell commands, template code, or HTML; template literals with user input interpolated into queries; dynamic-code-evaluation primitives (`eval`, `Function`, dynamic import on user-controlled paths); direct DOM injection (`innerHTML`, unsafe markdown rendering) from user-controlled strings; missing output encoding in templates; user-controlled file paths passed to interpreters or command shells.

```
grep -rn "eval(\|new Function\|innerHTML\s*=" --include="*.ts" --include="*.js"
grep -rn "query.*\${\|SELECT .*+" --include="*.ts" --include="*.js" --include="*.sql"
grep -rn "exec(\|spawn(\|system(" --include="*.ts" --include="*.js" --include="*.py"
```

The dynamic-code-evaluation family of primitives — those that take a string and execute it as code — is the highest-severity injection surface and should be banned in production code on user-controlled paths.

**Mitigation.** Parameterised queries always (`db.query("WHERE id = $1", [id])`, not template-literal interpolation of user input) and ORM parameter binding. Pass command arguments as arrays to non-shell execution APIs; avoid shell interpretation. Encode output for the target context — HTML text, HTML attribute, URL, JavaScript string, CSS, log line. Sanitize rich text with a proven sanitizer and a strict allowlist; allowlist user input where the input space is narrow (enums, IDs). Use Content-Security-Policy as blast-radius reduction, not as the primary XSS fix. Forbid the dynamic-code-evaluation primitives entirely on production paths via a project-wide lint rule.

### A06 — Insecure Design

**Detection.** No threat model exists for the feature. No abuse cases. Trust boundaries are not documented. Rate limiting or quotas absent on expensive operations. Business logic that can be subverted (price-tampering, quantity-tampering, role-tampering, redirect-tampering). Missing business invariants; workflows that assume honest users; features that cannot answer "what evidence proves this is safe?"

**Mitigation.** Threat-model new features at design time, not at review time. Define security requirements and abuse cases next to product requirements. Document trust boundaries (what data is trusted, what is not). Server-side validate every business rule the client could subvert. Use rate limits, quotas, circuit breakers, idempotency, and replay protection. Make the security invariant testable: "a user cannot export another tenant's data", "a payment amount cannot be client-tampered", "a reset token is single-use and expires."

### A07 — Authentication Failures

**Detection.** Hand-rolled auth. Weak or outdated password policy; no breached-password / common-password checks. No rate limiting or lockout/backoff on login and reset flows. Predictable session or reset tokens; reset tokens reusable or long-lived. No MFA option on sensitive accounts. Sessions not invalidated on logout, password change, or privilege change. Cookies missing `HttpOnly`, `Secure`, or an appropriate `SameSite`. Privilege escalation without reauthentication.

**Mitigation.** Use a battle-tested auth library or provider (NextAuth, Auth0, Clerk, Devise) — do not hand-roll. Support MFA for sensitive accounts and require reauthentication for high-risk actions. Rate-limit authentication and reset flows. Password reset tokens must be cryptographically random, single-use, and short-lived. Rotate session identifiers after privilege changes; store sessions and refresh tokens so they can be revoked. Invalidate sessions on logout, password change, and privilege escalation. Do not log credentials, tokens, or reset links.

### A08 — Software or Data Integrity Failures

**Detection.** Insecure deserialisation — using language-native binary deserialisers (e.g., Python's object-deserialisation module, Java native serialisation) on untrusted input is a remote code execution surface. JSON-parse / object-merge with prototype-pollution risk on untrusted input. Unsigned packages or scripts loaded at runtime. Auto-update mechanisms without signature verification. Webhook payloads trusted without signature verification. Mutable script sources loaded at runtime. Data imported across a trust boundary without schema validation. Retrieved documents or embeddings accepted as tenant-authorized without a storage-layer isolation check. *(The supply-chain build/distribution half of integrity now lives in A03; A08 owns the runtime integrity of data, updates, and artifacts.)*

**Mitigation.** Treat deserialised data as untrusted; validate against a schema before consuming. Prefer JSON or schema-validated formats over native binary deserialisers for any cross-trust-boundary data. Verify webhook signatures and timestamps before parsing business fields. Sign artifacts and verify signatures before loading or auto-updating. In RAG or semantic-search systems, bind retrieved records to the authenticated tenant before the model or application consumes them.

### A09 — Security Logging and Alerting Failures

**Detection.** Authentication failures not logged. Access-control denials not logged. Sensitive operations (privilege change, data export) not logged. Logs containing PII or secrets (CWE-532). Log entries vulnerable to injection (`\n`, control characters, unencoded user input). No alert thresholds or playbook. Logs stored only locally; log integrity unprotected. A DAST or penetration test that triggers no alert. Alert volume so noisy that real issues are ignored. (The 2025 rename emphasises that logging without *alerting* is not enough — a log nobody reads in time is not a detective control.)

**Mitigation.** Log every authentication attempt (success and failure) and every privileged operation with actor, target, action, result, correlation ID, and timestamp. Encode untrusted log fields; strip secrets and minimise PII. Store logs centrally with tamper resistance or append-only controls. **Alert** in near-real-time on suspicious behaviour — credential stuffing, repeated authorization failures, unexpected privilege changes, large exports, honeytoken access, unusual admin actions — wiring logs to a detection that pages a human, not just a dashboard. A dashboard alone is not alerting.

### A10 — Mishandling of Exceptional Conditions (new in 2025)

OWASP added this category because these weaknesses were too often dismissed as generic "code quality" issues even though they directly produce security failures. It covers what happens on the *error path* — the half of the code that the happy-path review skips.

**Detection.** Look for:
- **Fail-open (CWE-636).** A `catch` block, auth check, or feature flag that, on error, *grants* access or continues instead of denying. The classic shape: `try { return authorize(user) } catch { return true }` — an exception silently becomes "allowed".
- **Error-message info disclosure (CWE-209).** Stack traces, SQL errors, internal paths, or framework versions returned to the user. (Overlaps A02's verbose-errors; here the lens is the *exception handler* that produces them.)
- **Unchecked return values / uncaught exceptions (CWE-252, CWE-248).** A security-relevant call (auth, crypto, storage) whose failure is ignored, so the code proceeds as if it succeeded; top-level handlers that swallow security-relevant failures.
- **Missing-parameter / null-deref handling (CWE-234, CWE-476).** Abnormal input that crashes or skips a guard.
- Resource leaks on repeated errors, and partial mutations not rolled back when an operation fails midway — leaving the system in an inconsistent (often privilege-leaking) state.

```
# crude fail-open smell: catch blocks that return truthy / allow
grep -rn "catch" --include="*.ts" --include="*.js" -A4 | grep -i "return true\|allow\|next()"
grep -rn "catch.*{}\|except.*pass" --include="*.ts" --include="*.js" --include="*.py"
```

**Mitigation.** **Fail closed**: on any error in a security-relevant path, deny access, roll back the whole transaction, release resources, and log internally rather than continuing on partial state. Catch and handle errors at the point they occur; do not let them bubble into a generic top-level handler that swallows them. Centralise error handling so every path returns a generic message to the user and the detail only to internal logs. Check return values of security-relevant calls. Add rate limits, quotas, and throttling so exceptional conditions cannot become denial-of-service or brute-force amplifiers. Treat a global exception handler as a backstop, not the primary strategy.

## Automation and Tooling

Manual review and automated scanning are complementary: tools catch the broad, known patterns at scale; the human catches the business-logic and design flaws no scanner understands. Use tools to widen coverage, not to outsource judgment.

**Which class of tool surfaces which category:**

| Category (2025) | Tool class | Representative tools |
|---|---|---|
| A01 Access control / SSRF | DAST + manual auth tests | OWASP ZAP, Burp; custom IDOR/SSRF probes |
| A02 Misconfiguration | IaC + config scan, header check | Checkov, tfsec, `securityheaders.com`, ScoutSuite |
| A03 Supply chain | SCA + SBOM + secret scan | Dependabot, Snyk, OSV-Scanner, Syft, Trivy, Dependency-Track, gitleaks, trufflehog |
| A04 Crypto | SAST rules | Semgrep, CodeQL (weak-hash / hardcoded-key rules) |
| A05 Injection | SAST + DAST | Semgrep, CodeQL, ZAP |
| A06 Insecure design | Threat model (manual) | STRIDE / attack-tree review — no scanner substitutes |
| A07 Authentication | DAST + manual | Burp Intruder (rate-limit), session-fixation probes |
| A08 Integrity | SAST + signature verify | CodeQL deserialisation rules, Sigstore/cosign verify |
| A09 Logging/alerting | Detection review (manual) | SIEM rule review; log-redaction lint |
| A10 Exceptional conditions | SAST + manual error-path review | Semgrep fail-open rules; the catch-block grep above |

**How to treat each tool's output (evidence, not authority):**

| Tool class | Finds | What to verify manually |
|---|---|---|
| SAST / CodeQL / Semgrep | Source-to-sink data flows, known insecure APIs, injection, XSS, auth smells | Whether the flagged path is attacker-controlled, reachable, exploitable, and fixed at the root cause |
| SCA / Dependabot / OSV-Scanner / Dependency-Track | Known vulnerable or malicious dependencies, vulnerable SBOM components | Whether the dependency is reachable, exploitable, patched, replaceable, or covered by a VEX decision |
| Secret scanning | Committed credentials and tokens | Whether the secret was live, where it was used, and whether rotation and audit are complete |
| DAST / ZAP / Burp | Runtime behaviour and missing controls | Whether the scanner had authentication, realistic state, and alert coverage |
| Supply-chain provenance / SLSA / npm trusted publishing | Where and how an artifact was built or published | Whether the source, workflow, maintainer permissions, install scripts, and release approvals are trustworthy |
| AI security reviewers (Codex Security, Claude Code security review) | Threat-model-guided candidates, attack paths, validated findings, proposed patches | The threat-model assumptions, validation evidence, patch safety, test coverage, and normal code-review outcome |

Wire SAST + SCA + secret scanning into CI to gate every PR; reserve DAST and threat modelling for staging and design time. A scanner's silence is not proof of safety — it is the absence of a known-pattern match.

**AI security reviewers are evidence sources, not authorities.** Modern AI-driven review tools have improved materially: OpenAI Codex Security builds repo-specific threat models, validates candidate findings in isolated environments, and proposes patches for human review; Claude Code's automated security review runs `/security-review` and GitHub Actions checks. Treat their output exactly as you treat a SAST report — a lead to verify, never a verdict. Every AI-generated finding still needs a human or responsible-agent to confirm the exploit path is real (they over-report), and every AI-proposed patch must be reviewed for correctness and for *failing closed* before merge — an automated fix can itself introduce a fail-open or a regression. The reviewer that ships the change owns the finding, not the tool that suggested it.

## The AI-Generated Code Premium

Multiple 2024–2026 studies find AI-generated code introduces security vulnerabilities at a materially elevated rate, and it often looks idiomatic while missing boundary checks. Veracode's *GenAI Code Security Report* (2025) tested 100+ models and found **~45% of AI-generated code samples introduced an OWASP Top 10 vulnerability**, rising to roughly **72% for Java**; an independent 2026 OWASP Top 10:2025 study across six models found **~26% (25.7%)** of generated samples contained at least one confirmed vulnerability. The exact rate varies by language, model, and methodology — treat these as drift-watch signals of "materially elevated" risk, not a single fixed multiplier, and refresh them when the source reports update. Treat AI-authored diffs as higher-risk until verified, especially when they introduce endpoints, auth flows, database queries, file handling, dependency changes, or error handling. The recurring failure modes:

- **CWE-89 SQL Injection** — string-concatenated queries, the most common AI failure.
- **CWE-79 XSS** — direct DOM or markdown injection from user-controlled strings, the second most common.
- **CWE-306 / CWE-862 Missing Authentication or Authorization** — generated endpoints without real server-side gates.
- **CWE-918 SSRF** — user-input URLs passed to outbound request APIs with no validation (now A01:2025).
- **CWE-22 Path Traversal** — file operations with unsanitised paths.
- **CWE-636 Fail-Open** — generated error handlers that swallow exceptions and continue, especially in auth guards (now A10:2025).
- **Supply-chain hallucination** — package names, versions, or install scripts added without provenance or maintainer review.

When reviewing AI-generated diffs, give these categories deliberate attention. The code "looks fine" because it pattern-matches reasonable code; the security flaw is invisible at the line level and visible only when you ask the security questions explicitly. The test for an AI-generated security-sensitive change is not "does it compile?" — it is "can a hostile user cross a boundary the author did not model?"

## Threat-Modelling a New Feature

Four questions, asked at design time, before implementation:

1. **What are we building?** A one-paragraph summary naming the feature, its users, assets, entry points, and privileged operations.
2. **What could go wrong?** Walk through STRIDE: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For each, name a concrete attacker-story.
3. **What are we doing about it?** For each "could go wrong", name at least one preventive control and, where the risk justifies it, one detective or recovery control. Defence in depth — at least two independent controls per high-risk category.
4. **Did we do a good job?** What evidence will convince us the mitigations work? Unit/integration/security tests, SAST or DAST runs, code review, penetration testing, logging and alert checks, rollout monitoring.

The four questions are due *before* implementation, not during review. A feature without a threat model is shipping its security as a guess.

## Security Test Probes

For each category, write a test that *attempts* the attack and asserts it is refused. These are the regressions that keep a fixed vulnerability fixed. Coordinate with `testing-strategy` for test level and maintenance cost.

| Risk | Probe / test to write |
|---|---|
| Broken access control | Authenticated user A cannot read/update/delete user B's resource (expect 403, not 200); non-admin cannot call an admin route; unauthenticated request is denied; client-side role changes do nothing. |
| CSRF | Cross-site state-changing request without a valid token/origin is rejected. |
| Search/vector retrieval isolation | Tenant A cannot retrieve tenant B's documents or embeddings via keyword search, semantic search, metadata filters, or RAG retrieval; storage/query-layer isolation is asserted *before* results reach application or model code. |
| SSRF | Submit a URL resolving to `169.254.169.254`, `127.0.0.1`, `10.0.0.0/8`, a link-local, a DNS-rebinding, or a cloud metadata-service address → expect rejection *after* DNS resolution. |
| Injection | Feed `' OR 1=1--`, `<script>alert(1)</script>`, `$(whoami)`, `; ls` to each input → expect parameterised / encoded handling, no execution; the parameterised-query or encoded-output path is asserted. |
| Supply chain | Lockfile exists; SCA gate runs; SBOM is produced for release; high/critical CVEs have triage decisions; a dependency with a `postinstall` script is sandboxed/blocked; CI fails on an unscanned lockfile; publish workflow uses short-lived credentials. |
| Auth/session | Send 100 logins/min → expect rate-limit/lockout; reset token is single-use and expires; logout/password change invalidates the session immediately. |
| Deserialization/integrity | Send a crafted serialised payload or schema-violating untrusted input to a deserialiser → expect schema rejection, not object instantiation; an unsigned update/plugin/webhook is rejected. |
| Logging/alerting | A failed-login burst, repeated authorization denial, and honeytoken access produce alerts; secrets and PII are absent from logs. |
| Exceptional conditions | Force the authorisation check to throw (mock the dependency) → expect deny, not allow; auth/payment/export/privilege-change errors fail closed and roll back partial state. |

## Severity and Disclosure

Grade every finding so prioritisation is a property of the finding, not a debate. Severity is a function of impact, exploitability, reachability, privilege required, and blast radius.

| Severity | Use when | Report shape |
|---|---|---|
| **Critical** | Unauthenticated (or low-privilege) remote code execution, authentication/authorisation bypass, tenant-wide / mass data exposure, credential theft, supply-chain compromise, or a live secret in a public artifact | Private channel only; minimal public detail until fixed; include safe reproduction and affected versions. Fix before merge; escalate immediately. |
| **High** | Exploitable injection, SSRF reaching internal/sensitive services, authenticated privilege escalation, reliable account takeover, weak credential hashing, or CI/publish-token exposure | Private or restricted issue; include source-to-sink path, impact, fix, and regression test. Fix before release. |
| **Medium** | Requires existing privilege, narrow scope, uncommon preconditions, or bounded data exposure; missing hardening (headers, rate limits); drift from a patched dependency | Normal tracker acceptable if no exploit payloads, secrets, or private data are included. |
| **Low / Informational** | Defence-in-depth gap, low-impact missing header, weak alerting signal, or hardening recommendation; observations with no current exploit path | State why it matters; record without blocking unrelated work unless policy requires it. |

**Responsible disclosure.** Describe the *weakness and the fix*, never a working exploit. Redact payloads, tokens, credentials, PII, customer data, and the specific request that triggers the flaw from any shared report. For an unpatched live vulnerability, use a private channel (security inbox / advisory draft), not a public PR comment or issue, until a fix is deployed. Quote only the minimum evidence needed to prove the finding.

## Verification

- [ ] Every input boundary (HTTP, CLI, file upload, webhook, environment, CI, dependency, browser storage, background job) is identified and its trust posture is explicit
- [ ] Every privileged action has a server-side authorisation check that defaults to deny
- [ ] Tenant, organization, role, and resource-ownership checks are tested for *denial* as well as success
- [ ] Search, vector database, and RAG retrieval paths enforce tenant isolation *before* results reach application or model code
- [ ] All database queries and command executions use parameterised APIs; no string-concatenated SQL/NoSQL/shell reaches production paths
- [ ] All HTML/markdown output from user-controlled strings is encoded or sanitized for the output context; direct DOM injection is absent
- [ ] Dynamic-code-evaluation primitives are absent from user-controlled paths or blocked by policy
- [ ] Secrets are loaded from managed secret storage or environment — never committed in source, fixtures, logs, screenshots, or audit artifacts
- [ ] Supply-chain posture is explicit: lockfile committed, SCA enabled every PR, SBOM available for release artifacts, publish credentials short-lived, install scripts constrained, and high/critical CVEs triaged within SLA
- [ ] Passwords are hashed with Argon2id (or scrypt/bcrypt/PBKDF2 fallback) at OWASP-recommended parameters; tokens use a CSPRNG with no predictable seed
- [ ] Authentication is rate-limited; sessions invalidate on logout, password change, and privilege escalation; reset tokens are single-use and short-lived
- [ ] Outbound HTTP driven by user input is allowlisted and rejects private/loopback/link-local destinations after DNS resolution (no SSRF surface)
- [ ] Deserialization, webhook, plugin, and update paths validate schema/signature/integrity before business logic
- [ ] Error paths fail *closed*: no exception handler grants access, leaks a stack trace, or proceeds on partial state; partial transactions roll back
- [ ] Security events are logged AND alerted on in near-real-time, with logs redacted (no PII/secrets) and tamper-resistant
- [ ] AI-generated diffs have been audited specifically for the most-common AI failure modes (injection, missing auth/authz, SSRF, path traversal, fail-open, hallucinated dependencies)
- [ ] Each finding carries a severity grade and a concrete root-cause fix, with exploit detail redacted from shared reports
- [ ] A threat model exists for the security-sensitive feature being shipped

## Do NOT Use When

| Use instead | When |
|---|---|
| `code-review` | Conducting a holistic per-PR review (security is one concern of many) |
| `debugging` | Investigating a known production failure (security or otherwise) |
| `prompt-injection-defense` | Defending an LLM/agent against prompt injection, RAG/context injection, or agent-tool-authority abuse (the instruction-vs-data channel) |
| `documentation` | Writing security policy or contributor security guide |
| `testing-strategy` | Deciding broadly what to test (security tests are one slice of strategy) |
| `skill-scaffold` | Authoring a new SKILL.md, including a security-themed skill |

## Key Sources

- OWASP Top 10 project page: https://owasp.org/www-project-top-ten/
- OWASP Top 10:2025 index and introduction: https://owasp.org/Top10/2025/ and https://owasp.org/Top10/2025/0x00_2025-Introduction/
- OWASP Top 10 GitHub repository: https://github.com/OWASP/Top10
- OWASP A01:2025 Broken Access Control: https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/
- OWASP A03:2025 Software Supply Chain Failures: https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/
- OWASP A04:2025 Cryptographic Failures: https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/
- OWASP A09:2025 Security Logging and Alerting Failures: https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/
- OWASP A10:2025 Mishandling of Exceptional Conditions: https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP ASVS 5.0: https://github.com/OWASP/ASVS
- SLSA v1.2 specification: https://slsa.dev/spec/v1.2/
- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- OpenAI Codex Security: https://help.openai.com/en/articles/20001107-codex-security
- Claude Code automated security reviews: https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code
- Veracode 2025 GenAI Code Security Report: https://www.veracode.com/blog/genai-code-security-report/
- AppSec Santa AI-generated code security study (2026): https://appsecsanta.com/research/ai-code-security-study-2026

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/security`
- Scope: Teaches the security-specific review lens for the OWASP Top 10:2025 (mapped to 2021): per-category detection greps, mitigations, a procedural source-to-sink review workflow over trust boundaries, severity grading and responsible disclosure, software-supply-chain hardening, error-path (fail-open) review, security-test probes, and the elevated-risk patterns of AI-generated code — turning findings into severity-ranked, root-cause remediation. Applies when the task is an explicit security audit, a feature threat model, or an auth / input-handling implementation. Out of scope: holistic per-PR review (code-review), production-bug hunts (debugging), broad test-level strategy (testing-strategy), LLM prompt/RAG injection and agent-tool-authority defence (prompt-injection-defense), and security-policy authoring (documentation).

**When to use**
- audit this endpoint for SQL injection and XSS specifically
- this PR adds user input — what security checks should I run?
- threat-model this new file-upload feature
- review this auth flow against OWASP — is there a bypass?
- the dependency scanner flagged 12 vulnerabilities — which ones matter?
- is this code path vulnerable to SSRF?
- review this access-control logic — can a non-admin escalate?
- audit our CI/CD and dependencies for supply-chain compromise
- does this error handler fail open or leak a stack trace?
- what security tests should prove this authorization change is safe?

**Not for**
- review this PR holistically
- production users are reporting an error — debug it
- write our company security policy doc
- scaffold a new skill teaching security review
- rename this auth function for clarity
- harden my chatbot against prompt injection and jailbreaks
- my RAG agent is following instructions hidden in retrieved documents

**Related skills**
- Verify with: `testing-strategy`, `code-review`, `security-fundamentals`
- Related: `guardrails`, `code-review`, `testing-strategy`, `debugging`, `best-practice`, `prompt-injection-defense`, `security-fundamentals`

**Concept**
- Mental model: Application-security review is source-to-sink reasoning over trust boundaries. The reviewer identifies attacker-controlled inputs, privileged operations, sensitive data, external dependencies, configuration, and error paths, then asks whether each path preserves confidentiality, integrity, availability, and authorization under hostile input and partial failure.
- Purpose: This skill prevents plausible-looking code from shipping with security-relevant decisions left implicit. It gives agents a current OWASP vocabulary, concrete detection patterns, mitigations, abuse tests, and reporting discipline so security review finds root causes rather than isolated symptoms.
- Boundary: This skill owns traditional application-security review, OWASP Top 10 web-app weaknesses, and security-specific threat modeling. It does not own holistic PR approval, root-cause debugging after a failure, broad test-level strategy, policy documentation, or LLM-specific prompt-injection and agent-authority architecture.
- Analogy: An OWASP review is a border inspection for a software system: every crossing between trust zones is checked for identity, permission, payload, destination, and failure behavior.
- Common misconception: The common mistake is treating the OWASP Top 10 as ten labels to memorize. The better model is to use the labels as routing names for underlying CWE-shaped failure modes; the fix follows the weakness and the trust boundary, not the A0x number.

**Grounding**
- Mode: `universal`
- Truth sources: `https://owasp.org/www-project-top-ten/`, `https://github.com/OWASP/Top10`, `https://owasp.org/Top10/2025/`, `https://owasp.org/Top10/2025/0x00_2025-Introduction/`, `https://owasp.org/Top10/2025/A01_2025-Broken_Access_Control/`, `https://owasp.org/Top10/2025/A03_2025-Software_Supply_Chain_Failures/`, `https://owasp.org/Top10/2025/A04_2025-Cryptographic_Failures/`, `https://owasp.org/Top10/2025/A09_2025-Security_Logging_and_Alerting_Failures/`, `https://owasp.org/Top10/2025/A10_2025-Mishandling_of_Exceptional_Conditions/`, `https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html`, `https://github.com/OWASP/ASVS`, `https://slsa.dev/spec/v1.2/`, `https://docs.npmjs.com/trusted-publishers/`, `https://help.openai.com/en/articles/20001107-codex-security`, `https://support.claude.com/en/articles/11932705-automated-security-reviews-in-claude-code`, `https://www.veracode.com/blog/genai-code-security-report/`, `https://appsecsanta.com/research/ai-code-security-study-2026`

**Keywords**
- `security`, `owasp`, `owasp top 10`, `vulnerability`, `sql injection`, `xss`, `authentication`, `authorization`, `supply chain`, `access control`

<!-- skill-graph-context:end -->
