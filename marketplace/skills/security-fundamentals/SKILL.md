---
name: security-fundamentals
description: "Use when reasoning about the security properties any application must satisfy: threat modeling (assets, threats, adversaries, surfaces), Saltzer and Schroeder's eight design principles (1975), input validation discipline, authentication vs authorization, secrets handling, secure-by-default, least-privilege, the OWASP Top 10 as recurring vulnerability classes, and defense in depth. Covers cross-cutting decisions about trust boundaries, where validation belongs, where authn/authz checks live, and how to bound blast radius. Do NOT use for LLM-specific prompt-injection (use prompt-injection-defense), cryptographic primitive implementation (use vendor libs), security-scanning tools (use security-scanning), credential-encryption schemes (use credential-encryption), GDPR/regulatory compliance (use gdpr-compliance), or the social/organizational side of security (out of scope)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/security
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"security fundamentals\",\"threat modeling\",\"input validation\",\"authentication\",\"authorization\",\"authn\",\"authz\",\"least privilege\",\"defense in depth\",\"secure by default\",\"OWASP Top 10\",\"Saltzer and Schroeder\",\"secrets handling\",\"attack surface\",\"trust boundary\",\"principle of least privilege\"]"
  triggers: "[\"is this secure\",\"where should validation happen\",\"authentication vs authorization\",\"what could go wrong here\",\"threat model\",\"OWASP\",\"do I need to check permissions here\"]"
  examples: "[\"audit a route handler for authn, authz, and input validation\",\"decide where to validate inbound data when the same shape comes in through multiple endpoints\",\"decide whether a piece of data is a secret, a credential, or non-sensitive — and what handling each requires\",\"produce a threat model for a new feature before any code is written\"]"
  anti_examples: "[\"implement HMAC verification for a Shopify webhook (use webhook-integration)\",\"configure a SAST scanner for the CI pipeline (use security-scanning)\",\"store an OAuth refresh token in an encrypted column (use credential-encryption)\",\"respond to a GDPR data-subject-access request (use gdpr-compliance)\",\"defend an LLM agent against prompt injection (use prompt-injection-defense)\"]"
  relations: "{\"related\":[\"type-safety\",\"api-design\",\"http-semantics\",\"prompt-injection-defense\"],\"boundary\":[{\"skill\":\"type-safety\",\"reason\":\"type-safety provides compile-time guarantees about the SHAPE of data inside the program; security-fundamentals provides the runtime discipline that decides what to trust and what to validate at the system's TRUST BOUNDARIES. The two compose: validate at the boundary, then trust the type inside.\"},{\"skill\":\"api-design\",\"reason\":\"api-design owns the external surface contract (endpoints, methods, schemas); this skill owns the security properties any such surface must enforce regardless of design choices (authn, authz, input validation, rate limiting).\"},{\"skill\":\"prompt-injection-defense\",\"reason\":\"prompt-injection-defense owns the LLM-specific threat class where untrusted text is interpreted as instructions by a model; this skill owns the general security framing that prompt injection specializes from. Prompt injection is one row in the OWASP LLM Top 10; this skill covers the broader discipline.\"},{\"skill\":\"http-semantics\",\"reason\":\"http-semantics owns the protocol-level meaning of methods, status codes, and headers; this skill owns the security properties that protocol must enforce at every endpoint (authn, authz, rate limiting, validation). They compose: HTTP gives the protocol; this skill gives the security discipline applied to it.\"}],\"verify_with\":[\"type-safety\",\"api-design\"]}"
  concept: "{\"definition\":\"Security fundamentals are the cross-cutting design principles, threat-modeling discipline, and recurring vulnerability classes that determine whether a system can be trusted to handle data, identity, and authority safely under adversarial conditions. The discipline is upstream of any specific vulnerability or vendor tool: it asks 'what are we protecting,' 'from whom,' 'what could go wrong,' and 'what's the cost if it does' before any implementation choice is made. Security fundamentals are not a feature added after the system works; they are a property of the design from the first commit, encoded in trust boundaries, validation choices, default permissions, and the placement of authentication and authorization checks. The discipline acknowledges that perfect security is impossible (any system can be attacked given sufficient resources and time), so the goal is to make attacks expensive, traceable, and limited in blast radius — defense in depth rather than perimeter security, least privilege rather than convenience, secure defaults rather than opt-in protections.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/security-fundamentals/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1212"
---

# Security Fundamentals

## Coverage

The cross-cutting design principles, threat-modeling discipline, and recurring vulnerability classes that determine whether a system can safely handle data, identity, and authority under adversarial conditions. Covers the foundational discipline upstream of any specific vulnerability or tool: Shostack's four threat-modeling questions, Saltzer and Schroeder's eight design principles (1975), trust boundaries, the authentication/authorization distinction, input validation as a boundary discipline, defense in depth, least privilege, and the OWASP Top 10 as a working enumeration of recurring failure classes. Does NOT cover the implementation of specific cryptographic primitives, the configuration of specific scanners, the regulatory artifacts of compliance regimes, the LLM-specific specialization to prompt injection, or the organizational/social side of security.

## Philosophy

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
| Encrypting stored credentials (envelope encryption, KMS) | `credential-encryption` | credential-encryption owns the specific patterns for stored secrets |
| Choosing and configuring a SAST/DAST/dependency scanner | `security-scanning` | security-scanning owns the tooling discipline |
| GDPR / data-subject rights / regulatory artifacts | `gdpr-compliance` | gdpr-compliance owns the legal framing of data protection; this skill owns the underlying security |
| Implementing a specific cryptographic primitive (AES, RSA, hashing) | Well-reviewed crypto library docs (libsodium, BouncyCastle, native APIs) | Implementation is library territory; this skill is upstream of "which primitive" |
| Webhook signature verification for a specific platform (Shopify, Stripe) | `webhook-integration` | webhook-integration owns vendor-specific patterns; this skill provides the framing |
| Social engineering, phishing, organizational security awareness | (no skill — out of scope) | Organizational security is a separate discipline |
| Penetration testing methodology | (no skill — out of scope) | A specialized professional discipline |

## Key Sources

- Saltzer, J. H., & Schroeder, M. D. (1975). ["The Protection of Information in Computer Systems"](https://www.cs.virginia.edu/~evans/cs551/saltzer/). *Proceedings of the IEEE, 63*(9), 1278–1308. The foundational paper on security design principles; the eight principles articulated here remain canonical across every subsequent technology shift.
- Shostack, A. (2014). *Threat Modeling: Designing for Security*. Wiley. The canonical modern reference on threat modeling, including the four-question framework and STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
- OWASP. [OWASP Top 10 (2021)](https://owasp.org/Top10/). The most-cited working enumeration of recurring web application vulnerability classes; updated periodically as the threat landscape shifts.
- OWASP. [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/). The LLM-specific specialization, including prompt injection (LLM01), excessive agency (LLM08), and insecure plugin design (LLM07).
- Anderson, R. (2020). *Security Engineering: A Guide to Building Dependable Distributed Systems* (3rd ed.). Wiley. The comprehensive treatment of security engineering across cryptography, access control, authentication, and large-system architecture; the discipline's modern textbook.
- Kerckhoffs, A. (1883). "La cryptographie militaire." *Journal des sciences militaires*, IX, 5–83. The foundational articulation of "security must not depend on the secrecy of the design" — the principle Saltzer & Schroeder generalized as "open design."
- NIST. [Special Publication 800-63B: Digital Identity Guidelines — Authentication and Lifecycle Management](https://pages.nist.gov/800-63-3/sp800-63b.html). The reference standard for authentication: password requirements, MFA categorization (memorized secrets, OOB devices, OTPs, cryptographic keys), session management.
- Lampson, B. W. (1973). "A Note on the Confinement Problem." *Communications of the ACM, 16*(10), 613–615. The foundational paper on confinement — the question of whether a program can be prevented from leaking information it has access to.
- King, A. (2019). ["Parse, don't validate"](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/). Modern articulation of the validation discipline: convert untrusted data to typed values once at the boundary, then trust the type.
- Bell, D. E., & LaPadula, L. J. (1973). "Secure Computer Systems: Mathematical Foundations." MITRE technical report. The Bell-LaPadula model — foundational work on formal access-control models that underpin modern RBAC/ABAC systems.
