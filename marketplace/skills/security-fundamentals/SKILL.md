---
name: security-fundamentals
description: "Use when reasoning about baseline application-security properties: threat modeling, trust boundaries, Saltzer and Schroeder design principles, input validation, authentication vs authorization, secrets handling, secure-by-default choices, least privilege, defense in depth, and OWASP vulnerability classes as recurring failure modes. Covers cross-cutting decisions about what is trusted, where validation belongs, where authn/authz checks live, and how to bound blast radius. Do NOT use for LLM-specific prompt injection or agent-tool authority (use prompt-injection-defense), OWASP-category deep code review (use owasp-security), vendor webhook mechanics (use webhook-integration), cryptographic primitive implementation or key-management mechanics (use vendor/KMS/library docs), compliance/legal artifacts, or the social/organizational side of security. Do NOT use for configure a specific SAST or dependency scanner (use the scanner docs, then owasp-security for review)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"webhook-integration\",\"code-review\",\"http-semantics\",\"error-tracking\",\"guardrails\",\"owasp-security\",\"type-safety\",\"api-design\",\"prompt-injection-defense\"],\"verify_with\":[\"owasp-security\",\"type-safety\",\"api-design\",\"prompt-injection-defense\"]}"
  subject: quality-assurance
  scope: "Teaching the portable design discipline behind secure applications: threat modeling, assets/adversaries/trust boundaries, Saltzer and Schroeder principles, input-validation placement, authentication vs authorization, secret classification, least privilege, secure defaults, defense in depth, and blast-radius reduction. Applies before and during feature/API/route/data-flow design when the question is whether a system can safely handle data, identity, and authority under hostile input and partial failure. Excludes OWASP-category deep code review (owasp-security), LLM-specific prompt/context/tool injection (prompt-injection-defense), vendor webhook signing/retry mechanics (webhook-integration), implementation of cryptographic primitives or KMS/envelope-encryption mechanics (vendor/library docs), legal/compliance artifacts, and organizational security training."
  public: "true"
  taxonomy_domain: quality/security
  grounding: "{\"subject_matter\":\"Portable application-security fundamentals: threat modeling, trust boundaries, secure design principles, input validation, identity, authorization, least privilege, and defense in depth\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.cs.virginia.edu/~evans/cs551/saltzer/\",\"https://owasp.org/Top10/2021/\",\"https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html\",\"https://pages.nist.gov/800-63-4/sp800-63b.html\",\"https://www.cisa.gov/sites/default/files/2023-06/principles_approaches_for_security-by-design-default_508c.pdf\",\"https://owasp.org/www-project-top-10-for-large-language-model-applications/\"],\"failure_modes\":[\"Treating security as a checklist of controls rather than a property of trust boundaries\",\"Conflating authentication with authorization and checking permissions only at session establishment\",\"Relying on client-side validation or type annotations instead of server-side boundary parsing\",\"Routing OWASP-category deep code review to the broad fundamentals skill instead of owasp-security\",\"Routing LLM instruction-channel attacks to classical application-security review instead of prompt-injection-defense\",\"Referencing non-existent skill ids for compliance, scanner configuration, or credential-encryption implementation\"],\"evidence_priority\":\"general_knowledge_first\"}"
  stability: experimental
  keywords: "[\"security fundamentals\",\"threat modeling\",\"input validation\",\"authentication\",\"authorization\",\"authn\",\"authz\",\"least privilege\",\"defense in depth\",\"secure by default\"]"
  triggers: "[\"is this secure\",\"where should validation happen\",\"authentication vs authorization\",\"what could go wrong here\",\"threat model\",\"OWASP\",\"do I need to check permissions here\"]"
  examples: "[\"audit a route handler for authn, authz, and input validation\",\"decide where to validate inbound data when the same shape comes in through multiple endpoints\",\"decide whether a piece of data is a secret, a credential, or non-sensitive — and what handling each requires\",\"produce a threat model for a new feature before any code is written\"]"
  anti_examples: "[\"implement HMAC verification for a Shopify webhook (use webhook-integration)\",\"audit code against OWASP Top 10 categories (use owasp-security)\",\"configure a specific SAST or dependency scanner (use the scanner docs, then owasp-security for review)\",\"choose an envelope-encryption/KMS implementation for stored credentials (use vendor/KMS/library docs)\",\"respond to a GDPR data-subject-access request (use legal/compliance docs)\",\"defend an LLM agent against prompt injection (use prompt-injection-defense)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Security fundamentals is to a software system what structural engineering is to a building — load-bearing walls, fire egress, electrical isolation, foundation depth are not features added after the building works; they are properties of the design from the first sketch, and retrofitting them costs ten times more and produces worse results than designing them in. A building that survives an earthquake does so because of decisions made at the structural-engineering stage, not because of decorations added later."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/security-fundamentals/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** Security fundamentals are the design principles and threat-modeling habits that decide whether a system can safely handle data, identity, and authority under adversarial conditions.

**Mental model:** Start with assets, adversaries, trust boundaries, and privileged actions. Every mitigation should be traceable to what crosses a boundary, who controls each side, what can go wrong, and how much damage remains if the boundary fails.

**Why it exists:** Security added after the system works is expensive and incomplete. Designing security in early makes attacks harder, slower, easier to detect, and smaller in blast radius.

**What it is NOT:** It is not an OWASP deep audit, LLM prompt-injection architecture, vendor webhook mechanics, scanner configuration, cryptographic primitive implementation, or legal compliance workflow.

**Adjacent concepts:** `owasp-security` owns category-specific application-security review; `prompt-injection-defense` owns LLM instruction-channel threats; `type-safety` carries validated values after boundary parsing; `api-design` and `http-semantics` shape public interfaces; `webhook-integration` owns vendor webhook mechanics.

**One-line analogy:** Security fundamentals are like structural engineering for software: load-bearing decisions must be in the design before people move in.

**Common misconception:** A pile of controls is not the same as a security argument; controls matter only when they are placed at the right trust boundaries and fail safely.

# Security Fundamentals

## Coverage

The cross-cutting design principles, threat-modeling discipline, and recurring vulnerability classes that determine whether a system can safely handle data, identity, and authority under adversarial conditions. Covers the foundational discipline upstream of any specific vulnerability or tool: Shostack's four threat-modeling questions, Saltzer and Schroeder's eight design principles (1975), trust boundaries, the authentication/authorization distinction, input validation as a boundary discipline, defense in depth, least privilege, and the OWASP Top 10 as a working enumeration of recurring failure classes. Does NOT cover the implementation of specific cryptographic primitives, the configuration of specific scanners, the regulatory artifacts of compliance regimes, the LLM-specific specialization to prompt injection, or the organizational/social side of security.

## Philosophy of the skill
Security is a property of the design, not a feature added after the system works. The cost of designing security in is small; the cost of retrofitting it is order-of-magnitude larger and produces worse results. The discipline of security fundamentals is the discipline of paying these costs early — at the threat-modeling stage, at the trust-boundary stage, at the authentication-design stage — before the system has accumulated the structural debt that makes retrofitting expensive.

The discipline does not promise prevention of attacks. Any non-trivial system will be attacked; some attacks will succeed. The goal is to make attacks expensive, slow, traceable, and limited in blast radius. Every design choice is evaluated by what it costs the defender vs what it costs the attacker. Secure-by-default choices cost the defender slightly more code upfront but cost the attacker a working exploit; opt-in security features cost the defender nothing upfront but cost the attacker very little when the developer inevitably forgets. The discipline is the deliberate placement of costs on the attacker rather than the defender.

For agents writing code, the discipline is what lets the agent reason about a security-relevant change without having to read the entire system. An agent that knows the trust boundaries, the authn/authz distinction, and the input-validation discipline can look at a new endpoint and ask: 'where is this endpoint receiving data from?' 'Is the data validated at the boundary?' 'Is authentication checked?' 'Is authorization checked at the moment of the privileged action?' 'What's the blast radius if any of these fail?' These questions produce the right code without the agent having to recall every OWASP entry.

## The Four Threat-Modeling Questions (Shostack)

| Question | What it produces | Common failure |
|---|---|---|
| **What are we working on?** | The system diagram, asset inventory, data classification, trust boundaries | Skipped; analysis proceeds against an unstated model |
| **What can go wrong?** | The threat list: STRIDE categories, attacker scenarios, abuse cases | Jumped to mitigation without enumerating threats |
| **What are we going to do about it?** | The mitigations: design choices, controls, monitoring | The bulk of effort goes here; without the first two, mitigations are random |
| **Did we do a good job?** | Verification: tests, reviews, ongoing monitoring | Declared without testing; threat model never revisited |

A team that answers all four iteratively, with each system change, is doing security fundamentals. A team that answers only three, or answers them once, is doing security theater.

## Saltzer & Schroeder's Eight Principles (1975)

These predate every modern technology and remain canonical because they describe properties, not implementations.

| Principle | One-line gloss | What it forbids |
|---|---|---|
| **Economy of mechanism** | Keep it simple | Sprawling, complex security architectures with many components |
| **Fail-safe defaults** | Deny by default; permit by exception | "is_admin defaults to true" patterns |
| **Complete mediation** | Check every access; never cache "I checked this earlier" | First-request-only auth checks; trust-on-session |
| **Open design** | Don't depend on secrecy of the design (Kerckhoffs) | Security through obscurity; secret algorithms |
| **Separation of privilege** | Require multiple independent conditions for sensitive operations | Single-credential vault access for irreversible actions |
| **Least privilege** | Minimum permissions per entity | Service accounts with admin keys; over-scoped tokens |
| **Least common mechanism** | Minimize shared mechanism across users | Global state that leaks information between requests |
| **Psychological acceptability** | Security users will bypass is not security | Onerous policies that drive workarounds (sticky-note passwords) |

## The Authn / Authz Distinction

| Concern | Question it answers | Verified by | Where it lives | When it runs |
|---|---|---|---|---|
| **Authentication** | "Who are you?" | Credentials (password, token, certificate, MFA) | Auth middleware, login flow | At session establishment |
| **Authorization** | "Are you allowed to do this?" | Policy against identity (RBAC, ABAC, ACLs) | At every privileged action | Every request to a protected resource |

Conflating these is the #1 issue in the OWASP Top 10. The pattern: authenticate at the entry point; authorize at every privileged action. Never short-circuit authorization on the basis of having a valid session.

## Input Validation As Boundary Discipline

The pattern, in order:

1. **Define expectations.** Every input has an explicit shape, range, and meaning expectation. Document it as a schema (Zod, JSON Schema, OpenAPI).
2. **Validate at the boundary.** Validation happens at the entry point of the request, not three function calls in. The earlier validation fails, the less the system has done with bad data.
3. **Parse, don't validate (Alexis King).** Convert the untrusted value into a typed, validated value once; trust the typed form everywhere downstream. This composes with `type-safety` — the type system carries the validation forward.
4. **Treat validation failure as a response-shaped outcome.** Return a structured error (400 Bad Request with field-level detail) rather than throwing in the middle of business logic.
5. **Log validation failures.** Repeated validation failures from a specific source may be probing for vulnerabilities; logged failures feed monitoring.

| Boundary | Untrusted source | Validation discipline |
|---|---|---|
| User → application | HTTP request bodies, form inputs, query params, headers | Schema-based parsing at the entry point |
| External API → application | Webhook payloads, third-party responses, OAuth callbacks | Signature verification + schema validation |
| Database → application | (Trust your DB, but validate cross-tenant) | Org-scoped queries; row-level security |
| Client → server (API) | API requests | Schema validation + authn + authz |
| Process boundary (microservices) | Inter-service calls | mTLS or signed tokens + schema validation |
| Untrusted file → application | Uploaded files | Type detection, size limits, sandbox parsing |
| LLM → application (tool calls) | Tool arguments produced by LLM | Treat as untrusted; validate against tool schema |

## Defense In Depth — Layered Controls

| Layer | Purpose | Failure mode when missing |
|---|---|---|
| **Network** | Firewall, segmentation, WAF | Direct exposure of internal services to internet |
| **Identity** | Authn, MFA, SSO | Credential stuffing, account takeover |
| **Application authz** | RBAC/ABAC, per-action checks | Broken access control (OWASP A01) |
| **Input validation** | Schema parse, sanitize | Injection (OWASP A03) |
| **Data encryption** | At-rest, in-transit, end-to-end | Cryptographic failure (OWASP A02) |
| **Output encoding** | Escape on output (XSS, log forging) | XSS, log poisoning |
| **Rate limiting** | Throttling, anomaly detection | Brute force, scraping, DoS |
| **Logging & monitoring** | Audit trails, alerts | Undetected breach (OWASP A09) |
| **Incident response** | Playbooks, forensics, recovery | Slow response when attacks succeed |

The property of defense in depth is the *composition* — no single layer is the security; the security is what remains when one layer fails.

## Verification

After applying this skill, verify:
- [ ] A threat model exists for the system or feature, answering all four Shostack questions; it is dated and reviewed at meaningful intervals.
- [ ] Trust boundaries are explicitly enumerated; each boundary has a validation discipline applied.
- [ ] Authentication is required at every entry point that needs identity; authorization is checked at every privileged action — not just at session start.
- [ ] Input validation happens at the trust boundary, returns structured errors, and is logged.
- [ ] Sensitive data has been classified (public, internal, confidential, restricted, secrets); each tier has handling rules; secrets are never logged or stored unencrypted.
- [ ] Service-to-service calls use mTLS or signed tokens; no service trusts another solely on network position.
- [ ] Defaults are fail-safe (deny by default; permit by explicit exception with justification).
- [ ] Every entity (user, service, process) has minimum-necessary permissions; service accounts do not have admin keys; tokens are scoped to the minimum action set.
- [ ] Sensitive actions are logged with sufficient detail to reconstruct what happened; logs are protected from modification.
- [ ] Monitoring is in place to detect anomalies and failed validations; alerts are tested.
- [ ] Cryptographic primitives are implemented by well-reviewed libraries, not custom code; keys are managed (rotation, escrow, scoped access).
- [ ] Compliance documentation (where applicable) is downstream of the security property, not a substitute for it.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Defending an LLM agent against prompt injection | `prompt-injection-defense` | prompt-injection-defense owns the LLM-specific specialization; this skill is the broader framing |
| Encrypting stored credentials (envelope encryption, KMS) | Vendor/KMS/library docs, then `owasp-security` for review | implementation mechanics are outside this active skill library; this skill owns deciding what counts as a secret |
| OWASP-category code audit or vulnerability triage | `owasp-security` | owasp-security owns category-specific security review; this skill owns the upstream design principles |
| Choosing and configuring a SAST/DAST/dependency scanner | Scanner/vendor docs, then `owasp-security` for review | scanner setup is tooling-specific; this skill owns why the scan exists |
| GDPR / data-subject rights / regulatory artifacts | Legal/compliance docs | compliance workflow is outside this active skill library; this skill owns the underlying security design properties |
| Implementing a specific cryptographic primitive (AES, RSA, hashing) | Well-reviewed crypto library docs (libsodium, BouncyCastle, native APIs) | Implementation is library territory; this skill is upstream of "which primitive" |
| Webhook signature verification for a specific platform (Shopify, Stripe) | `webhook-integration` | webhook-integration owns vendor-specific patterns; this skill provides the framing |
| Social engineering, phishing, organizational security awareness | (no skill — out of scope) | Organizational security is a separate discipline |
| Penetration testing methodology | (no skill — out of scope) | A specialized professional discipline |

## Key Sources

- Saltzer, J. H., & Schroeder, M. D. (1975). ["The Protection of Information in Computer Systems"](https://www.cs.virginia.edu/~evans/cs551/saltzer/). *Proceedings of the IEEE, 63*(9), 1278–1308. The foundational paper on security design principles; the eight principles articulated here remain canonical across every subsequent technology shift.
- Shostack, A. (2014). *Threat Modeling: Designing for Security*. Wiley. The canonical modern reference on threat modeling, including the four-question framework and STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
- OWASP. [OWASP Top 10 (2021)](https://owasp.org/Top10/2021/). The current stable awareness document for recurring web application vulnerability classes. Use `owasp-security` for OWASP-category deep review and newer Top 10 release-candidate mapping.
- OWASP. [OWASP Top 10 for Large Language Model Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/). The LLM-specific specialization, including prompt injection and excessive agency; use `prompt-injection-defense` for that territory.
- OWASP. [Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html). Current practical guidance for validating untrusted input early and server-side.
- Anderson, R. (2020). *Security Engineering: A Guide to Building Dependable Distributed Systems* (3rd ed.). Wiley. The comprehensive treatment of security engineering across cryptography, access control, authentication, and large-system architecture; the discipline's modern textbook.
- Kerckhoffs, A. (1883). "La cryptographie militaire." *Journal des sciences militaires*, IX, 5–83. The foundational articulation of "security must not depend on the secrecy of the design" — the principle Saltzer & Schroeder generalized as "open design."
- NIST. [Special Publication 800-63B-4: Digital Identity Guidelines — Authentication and Lifecycle Management](https://pages.nist.gov/800-63-4/sp800-63b.html). The current reference standard for authentication and lifecycle guidance.
- CISA et al. [Shifting the Balance of Cybersecurity Risk: Principles and Approaches for Secure by Design Software](https://www.cisa.gov/sites/default/files/2023-06/principles_approaches_for_security-by-design-default_508c.pdf). Secure-by-design and secure-by-default principles for software manufacturers.
- Lampson, B. W. (1973). "A Note on the Confinement Problem." *Communications of the ACM, 16*(10), 613–615. The foundational paper on confinement — the question of whether a program can be prevented from leaking information it has access to.
- King, A. (2019). ["Parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). Modern articulation of the validation discipline: convert untrusted data to typed values once at the boundary, then trust the type.
- Bell, D. E., & LaPadula, L. J. (1973). "Secure Computer Systems: Mathematical Foundations." MITRE technical report. The Bell-LaPadula model — foundational work on formal access-control models that underpin modern RBAC/ABAC systems.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/security`
- Scope: Teaching the portable design discipline behind secure applications: threat modeling, assets/adversaries/trust boundaries, Saltzer and Schroeder principles, input-validation placement, authentication vs authorization, secret classification, least privilege, secure defaults, defense in depth, and blast-radius reduction. Applies before and during feature/API/route/data-flow design when the question is whether a system can safely handle data, identity, and authority under hostile input and partial failure. Excludes OWASP-category deep code review (owasp-security), LLM-specific prompt/context/tool injection (prompt-injection-defense), vendor webhook signing/retry mechanics (webhook-integration), implementation of cryptographic primitives or KMS/envelope-encryption mechanics (vendor/library docs), legal/compliance artifacts, and organizational security training.

**When to use**
- audit a route handler for authn, authz, and input validation
- decide where to validate inbound data when the same shape comes in through multiple endpoints
- decide whether a piece of data is a secret, a credential, or non-sensitive — and what handling each requires
- produce a threat model for a new feature before any code is written
- Triggers: `is this secure`, `where should validation happen`, `authentication vs authorization`, `what could go wrong here`, `threat model`, `OWASP`, `do I need to check permissions here`

**Not for**
- implement HMAC verification for a Shopify webhook (use webhook-integration)
- audit code against OWASP Top 10 categories (use owasp-security)
- configure a specific SAST or dependency scanner (use the scanner docs, then owasp-security for review)
- choose an envelope-encryption/KMS implementation for stored credentials (use vendor/KMS/library docs)
- respond to a GDPR data-subject-access request (use legal/compliance docs)
- defend an LLM agent against prompt injection (use prompt-injection-defense)

**Related skills**
- Verify with: `owasp-security`, `type-safety`, `api-design`, `prompt-injection-defense`
- Related: `webhook-integration`, `code-review`, `http-semantics`, `error-tracking`, `guardrails`, `owasp-security`, `type-safety`, `api-design`, `prompt-injection-defense`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: Security fundamentals is to a software system what structural engineering is to a building — load-bearing walls, fire egress, electrical isolation, foundation depth are not features added after the building works; they are properties of the design from the first sketch, and retrofitting them costs ten times more and produces worse results than designing them in. A building that survives an earthquake does so because of decisions made at the structural-engineering stage, not because of decorations added later.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.cs.virginia.edu/~evans/cs551/saltzer/`, `https://owasp.org/Top10/2021/`, `https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html`, `https://pages.nist.gov/800-63-4/sp800-63b.html`, `https://www.cisa.gov/sites/default/files/2023-06/principles_approaches_for_security-by-design-default_508c.pdf`, `https://owasp.org/www-project-top-10-for-large-language-model-applications/`

**Keywords**
- `security fundamentals`, `threat modeling`, `input validation`, `authentication`, `authorization`, `authn`, `authz`, `least privilege`, `defense in depth`, `secure by default`

<!-- skill-graph-context:end -->
