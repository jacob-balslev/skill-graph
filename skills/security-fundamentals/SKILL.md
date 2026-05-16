---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: security-fundamentals
description: "Use when reasoning about the security properties any application or system needs to satisfy: the foundational threat-modeling discipline (assets, threats, adversaries, surfaces), Saltzer and Schroeder's eight design principles (1975), the input-validation discipline and where validation belongs, the authentication vs authorization distinction, secrets handling and key hygiene, secure-by-default and least-privilege rules, the OWASP Top 10 as a working enumeration of recurring vulnerability classes, and the role of defense in depth. Covers the cross-cutting decisions every system makes about what it trusts, what it validates, where it checks permissions, and what it logs — independent of any specific vulnerability class or vendor. Do NOT use for LLM-specific prompt-injection defense (use prompt-injection-defense), the runtime cryptographic implementation of a primitive (use vendor cryptography libraries), security-scanning tool selection (use security-scanning), credential-encryption schemes for stored secrets (use credential-encryption), the GDPR / regulatory-compliance discipline (use gdpr-compliance), or the social/organizational side of security (out of scope — covered by industry training)."
version: 1.0.0
type: capability
category: quality
domain: quality/security
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - security fundamentals
  - threat modeling
  - input validation
  - authentication
  - authorization
  - authn
  - authz
  - least privilege
  - defense in depth
  - secure by default
  - OWASP Top 10
  - Saltzer and Schroeder
  - secrets handling
  - attack surface
  - trust boundary
  - principle of least privilege
triggers:
  - "is this secure"
  - "where should validation happen"
  - "authentication vs authorization"
  - "what could go wrong here"
  - "threat model"
  - "OWASP"
  - "do I need to check permissions here"
examples:
  - "audit a route handler for authn, authz, and input validation"
  - "decide where to validate inbound data when the same shape comes in through multiple endpoints"
  - "decide whether a piece of data is a secret, a credential, or non-sensitive — and what handling each requires"
  - "produce a threat model for a new feature before any code is written"
anti_examples:
  - "implement HMAC verification for a Shopify webhook (use webhook-integration)"
  - "configure a SAST scanner for the CI pipeline (use security-scanning)"
  - "store an OAuth refresh token in an encrypted column (use credential-encryption)"
  - "respond to a GDPR data-subject-access request (use gdpr-compliance)"
  - "defend an LLM agent against prompt injection (use prompt-injection-defense)"
relations:
  related:
    - type-safety
    - api-design
    - http-semantics
    - prompt-injection-defense
  boundary:
    - skill: type-safety
      reason: "type-safety provides compile-time guarantees about the SHAPE of data inside the program; security-fundamentals provides the runtime discipline that decides what to trust and what to validate at the system's TRUST BOUNDARIES. The two compose: validate at the boundary, then trust the type inside."
    - skill: api-design
      reason: "api-design owns the external surface contract (endpoints, methods, schemas); this skill owns the security properties any such surface must enforce regardless of design choices (authn, authz, input validation, rate limiting)."
    - skill: prompt-injection-defense
      reason: "prompt-injection-defense owns the LLM-specific threat class where untrusted text is interpreted as instructions by a model; this skill owns the general security framing that prompt injection specializes from. Prompt injection is one row in the OWASP LLM Top 10; this skill covers the broader discipline."
    - skill: http-semantics
      reason: "http-semantics owns the protocol-level meaning of methods, status codes, and headers; this skill owns the security properties that protocol must enforce at every endpoint (authn, authz, rate limiting, validation). They compose: HTTP gives the protocol; this skill gives the security discipline applied to it."
  verify_with:
    - type-safety
    - api-design
concept:
  definition: "Security fundamentals are the cross-cutting design principles, threat-modeling discipline, and recurring vulnerability classes that determine whether a system can be trusted to handle data, identity, and authority safely under adversarial conditions. The discipline is upstream of any specific vulnerability or vendor tool: it asks 'what are we protecting,' 'from whom,' 'what could go wrong,' and 'what's the cost if it does' before any implementation choice is made. Security fundamentals are not a feature added after the system works; they are a property of the design from the first commit, encoded in trust boundaries, validation choices, default permissions, and the placement of authentication and authorization checks. The discipline acknowledges that perfect security is impossible (any system can be attacked given sufficient resources and time), so the goal is to make attacks expensive, traceable, and limited in blast radius — defense in depth rather than perimeter security, least privilege rather than convenience, secure defaults rather than opt-in protections."
  mental_model: |
    Six primitives structure security-fundamentals reasoning:

    1. **Threat modeling — the four questions (Shostack)**. Every security analysis answers four questions in order: (a) *What are we working on?* — the system, its data, its assets, its trust boundaries. (b) *What can go wrong?* — the threats: what could an adversary do, what could a mistake do, what could a failure do. (c) *What are we going to do about it?* — the mitigations: design choices, controls, monitoring. (d) *Did we do a good job?* — verification: did the mitigation actually work, is the threat model still accurate. The discipline is to answer all four; common failure modes include jumping to (c) without doing (a) and (b), declaring (d) without testing, or doing the analysis once and never revisiting.

    2. **Saltzer and Schroeder's eight design principles (1975)** — the foundational checklist for the security properties of any system. *Economy of mechanism* (keep the design as simple and small as possible). *Fail-safe defaults* (base access decisions on permission rather than exclusion). *Complete mediation* (every access to every object must be checked for authority). *Open design* (security must not depend on the secrecy of the design — Kerckhoffs's principle for the broader system). *Separation of privilege* (where feasible, require multiple keys/conditions to unlock). *Least privilege* (every program and user should operate with the minimum privilege necessary). *Least common mechanism* (minimize the amount of mechanism common to more than one user). *Psychological acceptability* (the human interface must be designed for ease of use, so users do not routinely bypass security). These principles predate every modern technology and remain canonical because they describe properties, not implementations.

    3. **Trust boundaries**. A trust boundary is a line in the system across which data, authority, or identity changes its trustworthiness. The most consequential boundaries: (a) *user → application* — every input from a user is untrusted until validated; (b) *application → database* — queries must be parameterized to prevent untrusted data being interpreted as code; (c) *internal service → internal service* — even within a trusted network, services must authenticate to each other; (d) *application → external API* — responses from external systems are not under your control and may be compromised; (e) *authenticated user → privileged action* — an authenticated identity is not the same as an authorized action; authorization must be checked separately at the moment of access. The discipline is to enumerate the boundaries explicitly and to be deliberate about what crosses each.

    4. **The authentication / authorization distinction**. *Authentication* (authn) is the verification that an identity is who they claim to be — passwords, tokens, certificates, multi-factor. *Authorization* (authz) is the verification that the authenticated identity has permission to perform the specific action being attempted. These are different decisions, made at different times, often by different code. Conflating them ('the user is logged in, so they can do this') is the recurring source of broken access control (the #1 issue in the OWASP Top 10). The discipline is to check both at every privileged action — and to check authz at every action, not just at the entry point, because an authenticated session can be coerced into actions across many endpoints.

    5. **Input validation as a boundary discipline**. All data crossing a trust boundary must be validated against an explicit expectation before being used. The discipline is to (a) define the expected shape, range, and meaning of every input; (b) validate as close to the boundary as possible (at the entry point of the request, not three function calls in); (c) prefer parse-don't-validate (convert the untrusted value into a typed, validated value once, then trust the typed form everywhere downstream); (d) treat validation failure as an explicit, logged, response-shaped outcome — not as a thrown exception in the middle of business logic. The composition with type-safety: type systems guarantee the shape of values inside the program; validation guarantees the shape of values entering the program. Each handles the failure mode the other cannot.

    6. **Defense in depth and least privilege**. *Defense in depth* is the assumption that any single security control may fail, so multiple independent layers are placed around any sensitive asset. A firewall is not enough; a firewall plus authentication is not enough; a firewall plus authentication plus input validation plus authorization plus rate limiting plus audit logging plus monitored anomaly detection — that is defense in depth. *Least privilege* is the principle that every entity (user, service, process, request) operates with the minimum permissions necessary for its task. Both principles answer the question 'when something goes wrong, what is the blast radius' — depth limits the number of failures required to cause harm; least privilege limits the harm caused per failure. A system without either is one bug away from total compromise.

    The deep insight is that security is not about preventing attacks (impossible) but about *making attacks expensive, slow, traceable, and limited*. Every design choice is evaluated by what it costs the defender vs what it costs the attacker. A secure-by-default choice (rejecting unknown input) costs the defender slightly more code upfront but costs the attacker a working exploit; an opt-in security feature (a 'is_admin' flag the developer must remember to set false) costs the defender nothing upfront but costs the attacker very little when the developer inevitably forgets. The discipline is the deliberate placement of costs on the attacker rather than the defender.

    The complementary insight is that *the OWASP Top 10 is not a checklist; it is an enumeration of recurring failure classes*. The Top 10 changes its specific entries over time (broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable components, identification and authentication failures, software and data integrity failures, security logging failures, server-side request forgery — as of OWASP 2021), but the underlying truth is that these classes recur because the underlying disciplines are recurringly skipped. A team that reads OWASP and treats it as 'ten things to check' will miss the eleventh. A team that reads it as 'evidence that input validation, access control, and secure defaults are repeatedly the failure modes' will internalize the disciplines and prevent the eleventh.
  purpose: |
    Security fundamentals discipline exists because every non-trivial system handles data, identity, and authority that adversaries care about — and because the cost of a security failure is asymmetric: a single successful attack can cause data loss, regulatory penalties, business interruption, and reputational damage that vastly exceed the development cost of the controls that would have prevented it. The discipline is the only mechanism by which a team can reason about that asymmetry before the attack happens, rather than after.

    The discipline matters with particular force as the systems being built grow more interconnected, more data-rich, and more autonomous. A monolithic application with one database has a limited attack surface; a microservices architecture pulling from N internal APIs, M external SaaS providers, and a handful of LLM agents has an attack surface that grows with every service added. Each new boundary is a new place where trust must be re-established and authorization must be re-checked. Teams that grow systems without growing their security discipline accumulate latent vulnerabilities — broken access control between services, secrets passed in plaintext between internal hops, inputs validated at the gateway but trusted everywhere downstream — that an attacker eventually finds.

    For products handling user data, the discipline is also the underlying mechanism that makes regulatory compliance possible. GDPR, HIPAA, PCI-DSS, SOC 2, and similar frameworks are legal artifacts built on top of security properties — they require the system to protect data, enforce access controls, log activity, and respond to incidents. A system whose security fundamentals are sound can demonstrate compliance with each new regime by mapping its controls; a system whose fundamentals are not sound cannot pass compliance audits no matter how much process is added on top. Compliance is downstream of security, not a substitute for it.

    For agents and AI-integrated systems, security fundamentals matter both for the conventional reasons (the agent processes untrusted inputs, calls authenticated APIs, accesses sensitive data) and for new reasons (the agent itself can be manipulated through prompt injection, may take autonomous actions that need scoped permissions, may exfiltrate data through tool calls). The OWASP LLM Top 10 is a specialization of the broader Top 10 to the new attack surface; the underlying disciplines — input validation, least privilege, complete mediation, defense in depth — are the same. An agent that operates with broad credentials, against unvalidated tool inputs, with no per-action authorization, is the LLM equivalent of a web application with admin credentials and no input sanitization.

    Finally, the discipline matters because security is the canonical example of a quality property where the cost of doing it late is order-of-magnitude higher than the cost of doing it from the start. Retrofitting authentication into an application that wasn't designed for it is harder than designing it in. Adding authorization checks to a hundred endpoints after the fact is harder than designing the access-control model first. Re-architecting a system to enforce trust boundaries is harder than placing them at the start. The discipline of security-fundamentals is the discipline of paying these costs early, at the design stage, before the system has accumulated the structural debt that makes the costs astronomical.
  boundary: |
    **Security fundamentals are not a list of specific vulnerabilities to check.** They are the design principles, threat-modeling discipline, and trust-boundary framing that prevent whole classes of vulnerability from being reachable in the first place. A team that learns to check 'don't have SQL injection' will be vulnerable to NoSQL injection, LDAP injection, command injection, and the next injection class that emerges. A team that learns 'never interpret untrusted data as code; parameterize everything; validate at the boundary' is robust to all current and future injection variants. The discipline is the property; the specific vulnerabilities are instances.

    **Security fundamentals are not cryptography implementation.** Cryptographic primitives (AES, RSA, ECDSA, SHA-256, Argon2) are the building blocks; this skill is upstream of which primitive to use. The right answer for any specific cryptographic problem is 'use a well-reviewed library that implements the well-reviewed primitive' — not 'roll your own.' This skill helps decide *whether* a piece of data needs encryption (it's a secret, it crosses an untrusted network, it persists at rest in a sensitive environment), what kind of encryption (at-rest, in-transit, end-to-end, envelope), and what to do with the key. The specific primitive selection is a separate decision, handled by the encryption skills and library documentation.

    **Security fundamentals are not the same as compliance.** A system that satisfies SOC 2 has documented controls; a system that is genuinely secure has the underlying properties those controls describe. Compliance is necessary for business reasons in many domains (you can't sell to enterprise customers without SOC 2; you can't process EU personal data without GDPR controls; you can't take credit cards without PCI-DSS). But satisfying compliance documentation is not the same as being secure: a checklist-driven compliance approach can produce documented controls that don't enforce the property they claim. The disciplined approach is to design for the underlying property and document the controls that demonstrate it; the failing approach is to design for the documentation and hope the property follows.

    **Security fundamentals are not LLM-specific.** Prompt injection, data exfiltration through tool calls, jailbreaking, model extraction, and the rest of the OWASP LLM Top 10 are *specializations* of the underlying discipline to a new attack surface. The remedies are the same: identify trust boundaries (model input is untrusted; tool inputs are untrusted), validate at the boundary (sanitize tool inputs; structure prompts to delimit untrusted content), enforce least privilege (scope tool permissions; don't give the agent admin keys), and add defense in depth (output filters; review-before-execute for high-risk actions). The LLM-specific skill (`prompt-injection-defense`) owns the specifics; this skill owns the framing.

    **Security fundamentals are not organizational security.** Social engineering, phishing, insider threats, physical security, vendor risk management, and security awareness training are real concerns and are out of scope for this skill. The discipline here applies to the software system being designed; the organizational discipline applies to the humans operating it. The two intersect (every system the organization deploys has both technical and operational security characteristics), but the techniques and disciplines are different.

    **Security fundamentals are not a one-time activity.** A threat model produced once and shelved is a historical document, not a security property. Systems change, attack surfaces change, attacker capabilities change, and the underlying discipline requires that the model be revisited at meaningful intervals — when the system adds a new integration, when a new class of vulnerability emerges, when business context changes (entering a new regulated market, becoming a higher-value target). Treating security as a project that ships is a misframing; security is a property maintained continuously.

    **Security fundamentals do not promise prevention.** A well-designed system will still be attacked; some attacks will succeed. The discipline's goal is to make attacks expensive (the attacker spends more than the defender), slow (detection happens before the worst damage), traceable (post-incident analysis can determine what was lost), and limited (the blast radius is bounded). A system that aims to make attacks impossible aims for a thing that does not exist; a system that aims to make them costly, slow, traceable, and bounded is achieving a real and measurable property.

    **Code review is not a security review.** A code reviewer looking at a diff sees the change; they may not see how the change interacts with the rest of the system, with the threat model, with the authentication state at the call site, with the data sensitivity of the values being passed. Security review is a distinct discipline that examines the change in the context of the system's security properties. Both are valuable; conflating them produces code review that misses security issues and security review that becomes a bottleneck on shipping.
  taxonomy: |
    By Saltzer & Schroeder's eight principles (the foundational taxonomy):
    - **Economy of mechanism** — simpler designs have fewer places to be wrong.
    - **Fail-safe defaults** — deny by default; permit by exception with explicit justification.
    - **Complete mediation** — every access checks authority; no cached 'I checked this earlier.'
    - **Open design** — security must not depend on the secrecy of the design (Kerckhoffs's principle generalized).
    - **Separation of privilege** — require multiple independent conditions for sensitive operations.
    - **Least privilege** — every entity has minimum permissions for its task.
    - **Least common mechanism** — minimize what is shared across users; shared mechanism is a multiplier.
    - **Psychological acceptability** — security users will bypass is no security at all.

    By trust boundary:
    - **User boundary** — every user input is untrusted until validated.
    - **External-system boundary** — every response from an external API, webhook, or integration is partially untrusted.
    - **Service boundary (microservices)** — even internal services must authenticate and authorize to each other.
    - **Storage boundary** — data at rest may be exposed if storage is compromised; encrypt sensitive at-rest data.
    - **Network boundary** — data in transit may be intercepted; encrypt in-transit with TLS.
    - **Privilege boundary** — within an application, transitioning from a normal request to a privileged action is a boundary requiring re-check.

    By OWASP Top 10 (2021, the working enumeration of recurring failure classes):
    - **A01: Broken Access Control** — authorization checks missing or bypassable.
    - **A02: Cryptographic Failures** — sensitive data exposed due to bad cryptography or its absence.
    - **A03: Injection** — untrusted data interpreted as code/queries (SQL, NoSQL, command, LDAP).
    - **A04: Insecure Design** — flaws baked into architecture, not patchable by code-level fixes.
    - **A05: Security Misconfiguration** — insecure defaults, exposed admin interfaces, verbose errors.
    - **A06: Vulnerable and Outdated Components** — dependencies with known CVEs.
    - **A07: Identification and Authentication Failures** — weak passwords, missing MFA, session-management bugs.
    - **A08: Software and Data Integrity Failures** — unsigned updates, insecure deserialization, supply-chain risks.
    - **A09: Security Logging and Monitoring Failures** — undetected attacks because nothing was watching.
    - **A10: Server-Side Request Forgery** — application made to issue requests on behalf of an attacker.

    By OWASP LLM Top 10 (2023, the AI-specific specialization):
    - LLM01: Prompt Injection — handled by `prompt-injection-defense`.
    - LLM02: Insecure Output Handling — LLM outputs treated as trusted code.
    - LLM03: Training Data Poisoning — adversarial data introduced into training.
    - LLM04: Model Denial of Service — resource exhaustion through prompts.
    - LLM05: Supply Chain Vulnerabilities — compromised model weights or libraries.
    - LLM06: Sensitive Information Disclosure — model leaks training data.
    - LLM07: Insecure Plugin Design — tool calls without proper authorization or validation.
    - LLM08: Excessive Agency — agent given too much permission or too little oversight.
    - LLM09: Overreliance — humans accepting model output uncritically.
    - LLM10: Model Theft — extracting model weights or behavior via API.

    By defense layer (defense-in-depth taxonomy):
    - **Network layer** — firewalls, network segmentation, WAFs.
    - **Application layer** — authn, authz, input validation, output encoding.
    - **Data layer** — encryption at rest, parameterized queries, encryption in transit.
    - **Identity layer** — IAM, RBAC/ABAC, MFA.
    - **Monitoring layer** — logging, intrusion detection, anomaly detection, SIEM.
    - **Response layer** — incident response playbooks, forensics, recovery procedures.

    By data sensitivity tier:
    - **Public** — no protection needed beyond integrity.
    - **Internal** — protect against external exposure.
    - **Confidential** — protect against unauthorized internal access.
    - **Restricted / Regulated** — PCI cardholder data, PHI, EU personal data; requires specific regulatory handling.
    - **Secrets / Credentials** — must be encrypted at rest, transmitted only over secure channels, rotated, never logged.
  analogy: |
    A bank's physical security, before electronic systems.

    Several insights follow, all of them load-bearing:

    **The vault is not enough.** A bank doesn't put one big door on the outside of the building and call itself secure. It has the outer doors (the network perimeter), the lobby (the authenticated session), the teller window (the authorized transaction), the safe-deposit area (the privileged action), and the vault itself (the sensitive data) — each with its own access controls, each with its own audit trail. An attacker who gets past the front door is not yet in the vault; they have to defeat each subsequent control. This is defense in depth: the assumption that any one control might fail, so the security property is the *composition* of multiple controls, not any single one.

    **The teller cannot grant themselves a withdrawal.** Even a fully-authenticated bank employee must invoke a separate authorization for many actions — a manager's approval for large withdrawals, a dual-control protocol for vault access, an audit log for every transaction. Authentication ('I am Alice') is not authorization ('I am Alice and I am allowed to do this'). The two checks live in different places; the second one runs at the moment of action, not at login. This is the authn/authz distinction.

    **Doors are locked by default.** A bank doesn't have a 'lock all doors' option that someone has to remember to enable each evening. The doors are locked unless someone explicitly unlocks them, with a credential, at a specific time. The default state is closed; the open state is the deliberate exception. This is fail-safe defaults: the system is secure by default, and access is the explicit exception with justification.

    **Every employee has their own keys.** A bank doesn't give one master key to everyone who works there. Each role has the keys it needs — the teller has cash-drawer keys but not vault keys; the IT contractor has server-room keys but not customer-record keys; the cleaner has lobby keys but not anywhere with money or records. If an attacker compromises any single person's keys, the damage is bounded by what those keys open. This is least privilege.

    **The vault has cameras, not just a lock.** Even with a strong door, the vault is monitored — entries logged, anomalies flagged, regular audits. A successful breach of the door doesn't end the security story; it begins the detection story. The presence of monitoring changes attacker behavior (a sophisticated attacker assumes everything is logged and acts accordingly) and limits damage (an unlogged successful breach can be exploited for months; a logged breach is detected and contained). This is monitoring as part of defense in depth.

    **The branch manager doesn't know how the vault's combination is generated.** The security of the vault doesn't depend on keeping the existence of the vault secret, or its location secret, or even its lock mechanism secret. It depends on the combination — and the combination's secrecy is enforced by specific access controls, key escrow, and rotation rules. The general design is published; the specific keys are protected. This is open design (Kerckhoffs's principle): security from the secrets, not from the obscurity of the system.

    **A robbery still happens occasionally.** No bank claims to be unrobbable. The discipline aims to make robberies expensive (sophisticated equipment, careful planning, multiple people, getaway logistics), slow (alarm systems, dye packs, time-locked safes), traceable (cameras, marked bills, license plate readers), and limited (vault contents segregated, daily cash limits, FDIC insurance on the customer side). After a robbery, the bank is not 'done' — there is forensic analysis, control review, possible system updates. Security is a continuous property, not a binary success/failure.

    The analogy also illuminates *why retrofit is hard*. A bank built without a vault, without compartmentalized access, without audit trails, cannot have those properties added cheaply. The walls, the keying system, the staffing model, the camera placements — all are structural choices made at construction. Adding them later requires partial demolition. Software systems are the same: security designed in from the first commit is cheap; security retrofitted to a system that wasn't designed for it is expensive, lossy, and never quite right.
  misconception: |
    The most common misconception is that **security is something you add to a working system**. It is not. Security is a property of the design, not a layer applied on top. A system designed without trust boundaries, without authentication points, without authorization checks, without input validation, cannot have these added by inserting them in 'the right places' — there are no right places because the design didn't reserve them. Retrofitting security is the act of partially rebuilding the system; it's slower, more expensive, and produces worse results than designing it in. Treating security as 'something to do before launch' is the recurring source of late-stage security retrofits that ship broken, late, or both.

    The second misconception is that **passing a security scanner means the system is secure**. It does not. Security scanners (SAST, DAST, dependency scanners) detect known patterns — patterns we know are dangerous, in places we know to look. They do not detect: design-level flaws (broken access control patterns that look correct at the line level but are wrong at the architecture level), logic flaws (the business logic allows a state the developer didn't anticipate), composition flaws (each component is fine individually but composing them produces a vulnerability), or new vulnerability classes (the scanner only knows what it was programmed to know). The scanner is one layer of defense in depth; treating its silence as evidence of security is the canonical example of compliance-without-security.

    The third misconception is that **authentication and authorization are the same thing**. They are not. Authentication answers 'who are you' (verified by credentials). Authorization answers 'are you allowed to do this' (verified by policy against the authenticated identity). A logged-in user is authenticated; that fact alone tells you nothing about what they're permitted to do. Conflating the two — 'the session is valid, so the action is allowed' — is the #1 vulnerability class in the OWASP Top 10 (broken access control). The disciplined pattern: authn at the entry point, authz at every privileged action.

    The fourth misconception is that **input validation at the perimeter is enough**. It is not. A request validated at the API gateway can still cause damage downstream if internal services trust it implicitly. Defense in depth requires validation at every trust boundary, not just the outermost one. Sometimes this is called 'zero trust' — the modern articulation of complete mediation. The pattern: each service treats its callers as untrusted, validates inputs, enforces authorization, even if 'inside' the network. Networks themselves are not trust boundaries; identity and validation are.

    The fifth misconception is that **encrypting data at rest makes it safe**. It does not, by itself. Encryption at rest protects against an attacker who steals the storage media but cannot access the running system. It does not protect against an attacker who compromises the running application — the application has the keys and uses them; an attacker with application-level access reads the data as the application does. The discipline of which sensitive data needs encryption, with which key management model, against which threat is more nuanced than 'turn on encryption.' Envelope encryption with KMS-managed keys, key rotation, per-tenant key isolation, and access logs are common patterns; the right pattern depends on the threat model.

    The sixth misconception is that **secure-by-default is restrictive and annoying**. Sometimes it appears that way upfront; it is far less expensive than the alternative downstream. A system that requires explicit opt-in to every permission is slower to set up; it is also impossible to be one missing-default-config away from total compromise. A system that grants permissions by default and relies on the developer to remember to revoke them produces the recurring 'production database accessible from the internet because the prod config inherited from the dev default' incidents. Secure-by-default front-loads the work; insecure-by-default defers it to whoever forgets it.

    The seventh misconception is that **internal services can trust each other**. They cannot, in any system above trivial size. Internal-service trust was the implicit model of monolithic on-prem systems where the network perimeter was the trust boundary; that model doesn't survive the modern reality of cloud-hosted microservices, supply-chain attacks, lateral movement post-breach, and zero-day vulnerabilities in any one service. Service-to-service authentication (mTLS, signed tokens, API keys with scoped permissions) is the modern default; 'we're all behind the same VPC, so we trust each other' is the modern fragility.

    The eighth misconception is that **the OWASP Top 10 is the security to-do list**. It is not. It is a snapshot of recurring failure classes, useful as evidence that the underlying disciplines are repeatedly skipped, not as a checklist of items. A team that 'covers the Top 10' but doesn't internalize the disciplines (threat modeling, trust boundaries, least privilege, defense in depth) will be vulnerable to the eleventh class — and the Top 10 changes regularly precisely because the categories shift. Working from disciplines produces robustness to new classes; working from a checklist produces compliance with the old list and vulnerability to the new threats.

    The ninth misconception is that **security and usability are inherently in tension**. The Saltzer & Schroeder principle of psychological acceptability says the opposite: security that users routinely bypass is no security at all. Well-designed security is usable security — single-sign-on, passwordless auth, contextual MFA, copy that explains permissions clearly, controls that fail safely without losing user work. The recurring 'security made the system unusable' complaint is a sign of poorly-designed security, not of an inherent trade-off. The disciplined approach designs security and usability together; the failing approach treats them as opposing forces and ships compromises that satisfy neither.

    The tenth misconception is that **a one-time pen test makes you secure**. A pen test is a useful evidence-gathering exercise — it produces a list of specific vulnerabilities found during a specific window by a specific tester. It does not produce ongoing security. New vulnerabilities are discovered constantly; new code introduces new attack surface; new dependencies bring new risks. Continuous security — automated scanning in CI, dependency monitoring, log review, periodic re-testing — is what produces a maintained security property. The pen test is the snapshot; the discipline is the maintained state.
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
