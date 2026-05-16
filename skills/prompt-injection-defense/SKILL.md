---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: prompt-injection-defense
description: "Use when reasoning about systems that pass untrusted content to a language model: the data-vs-instruction collapse that makes this attack class a structural property of LLMs rather than a fixable bug, the direct/indirect/exfiltration/action-trigger taxonomy, the role of every untrusted surface (RAG retrievals, tool results, attachments, web content, document parsing, user-provided text), why content filters and improved system prompts do not solve it, and the defense-in-depth measures that do (capability constraint, content origin tracking, separate planning and execution stages, human-in-the-loop gates, principle-of-least-authority for tools). Do NOT use for jailbreaking and policy circumvention (use model-safety), for general API security (use api-security), for runtime input validation patterns (use type-safety + api-design), or for the protocol cycle of tool calls (use tool-call-flow)."
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
  - prompt injection
  - indirect prompt injection
  - LLM01
  - OWASP LLM
  - data exfiltration
  - tool abuse
  - untrusted content
  - RAG injection
  - markdown image exfiltration
  - jailbreak
  - instruction confusion
  - principle of least authority
  - dual LLM pattern
triggers:
  - "is this an injection vector"
  - "how do we stop the model from following commands in user input"
  - "the model is treating retrieved content as commands"
  - "is RAG safe"
  - "can the model exfiltrate data via a tool call"
examples:
  - "review whether retrieved documents in a RAG pipeline can override the system prompt"
  - "design the boundary between a planning agent and an execution agent so injected commands cannot trigger destructive tool calls"
  - "explain why a content filter that blocks one canonical attack phrase does not stop the broader class"
  - "decide what tools an agent reading email attachments may invoke without human confirmation"
anti_examples:
  - "design the JSON shape of a tool's parameters (use tool-call-flow)"
  - "harden an HTTP API against SQL injection or XSS (use api-security)"
  - "audit a model's refusal behavior on disallowed content (use model-safety)"
relations:
  related:
    - tool-call-flow
    - http-semantics
    - type-safety
    - api-design
  boundary:
    - skill: tool-call-flow
      reason: "tool-call-flow owns the protocol cycle by which a model invokes a tool; this skill owns the security property the cycle must preserve when any message carries untrusted content."
    - skill: type-safety
      reason: "type-safety owns preventing type errors at compile time; this skill owns preventing command-execution errors at the data-vs-instruction boundary. Both are validate-at-the-boundary problems with different threat models."
    - skill: api-design
      reason: "api-design owns the request/response surface contract; this skill owns the constraint that no field carrying user content may be treated as commands by a downstream model."
    - skill: http-semantics
      reason: "http-semantics owns transport meaning (cache, idempotency, content type); this skill owns the threat that arrives over correct HTTP and is still harmful because the model interprets it as a command."
  verify_with:
    - api-design
    - tool-call-flow
concept:
  definition: "This attack class describes systems where untrusted content placed within a language model's input causes the model to follow attacker-controlled directives instead of, or in addition to, the application's legitimate ones. It is a structural property of how transformer-based language models consume their input — every token in the context window contributes to the next-token prediction, and the model has no reliable mechanism to distinguish 'directives from the application developer' from 'directives in a document the application happens to have loaded.' Defense, therefore, is not elimination of the vulnerability but architectural containment of its blast radius."
  mental_model: |
    Five primitives structure reasoning about this attack class:

    1. **Trust boundary** — every byte that enters the model's context window has a provenance: application-author (system prompt), trusted user (the operator), untrusted user (the operator's input that may carry attacker-controlled text), or third party (retrieved documents, tool results, web pages, attachments). Defense begins with naming these provenances explicitly per token, not per message.

    2. **Data-vs-directive collapse** — transformer-based models do not maintain a hard distinction between data and directives. Both are tokens in the same context. A document containing imperative text aimed at the model is, to the model, indistinguishable from a system-prompt segment containing the same imperative text. Marking text as "user content" in the prompt does not prevent the model from attending to its imperative force.

    3. **Direct vs indirect attack** — the direct case is the user typing the malicious text into the input field. The indirect case (Greshake et al. 2023) is the attacker placing the malicious text in content the model is *expected* to read for legitimate reasons — a webpage the agent visits, a document the user uploads, a database row returned by RAG, an email body summarized by an assistant. Indirect is the harder threat because the user is not the attacker.

    4. **Capability gradient** — the consequence of a successful attack scales with what the model can do. A model that only generates text has small blast radius (it can say wrong things). A model with tools to call APIs has larger blast radius (it can take actions). A model with destructive tools, broad permissions, and no confirmation gates has unbounded blast radius (it can move money, delete data, send messages on the user's behalf). Defense is largely about flattening this gradient where untrusted content is in scope.

    5. **Defense in depth** — no single layer prevents this attack class. Content filters can be bypassed (encoded text, unicode tricks, indirect channels). Improved system prompts are still in the same token space as the attack. Model training reduces susceptibility but does not eliminate it. The defenses that work compose multiple layers: capability constraint (the tool the model can call cannot do harm), origin tracking (the system knows which tokens are untrusted and routes them accordingly), separation of planning and execution (a planning model exposed to untrusted content does not have execution authority), and human-in-the-loop confirmation for high-impact actions.

    The deep insight is that this attack class is not a bug to fix but a *property of the medium* to design around. Transformer LLMs are persuadable by their input. The discipline is to ensure that persuasion to misbehavior does not translate to consequential action — the consequences live with the runtime, not the model, and the runtime is the layer that must enforce limits.
  purpose: |
    Naming this as a distinct discipline matters because it is *not* a special case of SQL injection, XSS, or any prior injection class. Earlier injection classes had a clear data-vs-directive boundary that was violated by an encoding mistake — SQL injection happens because the system concatenated user input into a SQL string instead of parameterizing; XSS happens because the system inserted user input into HTML instead of escaping. The fixes for those vulnerabilities were exact: separate data from directives at the encoding layer. The bug was that the boundary existed in principle and was violated in practice.

    The LLM case is different. The data-vs-directive boundary does not exist in the medium. There is no equivalent of parameterized SQL for an LLM prompt — every token influences the next-token prediction equally, and there is no syntax for "this is data, not directives" that the model is contractually required to honor. Adding a warning to the prompt about untrusted content reduces susceptibility but does not eliminate it; an attacker who phrases their directive confidently enough, or delivers it indirectly through retrieved content the model trusts, will sometimes succeed.

    The reason a dedicated discipline matters is that systems built without understanding this property bake the failure mode into their architecture. An agent that reads user-uploaded PDFs and has authority to send emails will eventually send an email because a directive inside a PDF told it to. An agent that browses the web on the user's behalf and has authority to make purchases will eventually make a purchase based on web content. The right defense is not "improve the prompt" — it is "the agent that reads the PDF does not have authority to send emails," or "the agent that browses the web does not have stored payment credentials," or "any purchase requires human confirmation regardless of model intent."

    Defense in depth, applied correctly, makes the inevitable compromise consequential only at the layer that already had safeguards. Defense in depth, applied incorrectly, is a stack of filters that an attacker walks around.
  boundary: |
    **This is not jailbreaking.** Jailbreaking is the attempt to get the model to violate its own training-time policies (produce disallowed content, ignore safety guidelines, generate harmful outputs). The attacker and the user are the same person, and the target is the model's policy boundary. This attack class is the attempt to redirect a model that is acting on behalf of a victim user — the attacker is a third party, the user is the victim, and the target is the application's intended behavior. Many defenses for jailbreaking (RLHF on refusals, content classifiers) are weak defenses here because the attack is not asking the model to violate a policy; it is asking the model to do something the policy permits, just on behalf of the wrong principal.

    **This is not hallucination.** Hallucination is the model emitting unsupported claims because its training pulled it that direction; the model is wrong, but it is wrong *consistent with itself*. This attack is the model being correct about following its input, where the input was crafted by an attacker. The fix for hallucination is grounding and verification; the fix for this attack class is architectural containment of input provenance.

    **This is not generic adversarial input.** Adversarial examples in image classifiers exploit specific high-dimensional gradients with perturbations imperceptible to humans. This attack class uses natural language an attacker writes deliberately — it is read and understood by humans, often plain English. The defenses are different because the threat is different.

    **Content filters are not the defense.** A filter that scans for one canonical phrasing of an attack stops that example, not the class. The attacker rephrases, encodes (base64, ROT13, leetspeak), uses other languages, or hides the directive in indirect content the filter doesn't scan. A filter raises the floor a few inches; an architectural defense raises the ceiling by a story.

    **Improving the system prompt is not the defense.** Adding a defensive instruction to the system prompt reduces success rate measurably but does not approach zero. The attacker's text sits in the same context window as your defense and influences the model's prediction with the same weight. A new model release can change the susceptibility in either direction; relying on prompting alone is relying on a moving floor.

    **The model is not the defender.** The runtime is the defender. Defense decisions — what tools the model may call, with what arguments, against what data, requiring what confirmation — are runtime decisions, not model decisions. A defense that depends on the model deciding not to do the dangerous thing is a defense that fails when the model is convinced to do the dangerous thing.

    **Smarter models are not the defense.** Newer models reduce susceptibility on benchmark sets but do not eliminate it. Each generation of model fixes some classes of attack and is fooled by new ones. A system whose security depends on the model being too smart to be tricked has bet against the entire research field of finding new ways to trick models.
  taxonomy: |
    By delivery vector:
    - **Direct case** — the user types the malicious text. The attacker and the user are the same person; the typical target is the application's intended behavior. Mitigations: privilege separation between user and application; output constraints.
    - **Indirect case** (Greshake et al. 2023) — the malicious text lives in content the model reads for legitimate reasons. The user is a victim; the attacker controls a document, webpage, email, tool result, RAG corpus entry, or anything else the model ingests. Mitigations: origin tracking, capability constraint, separation of planning from execution.

    By attacker goal:
    - **Action triggering** — the attacker wants the agent to perform a destructive or unwanted action (delete records, send messages, make purchases, change configuration). Mitigations: tool authority limits, confirmation gates, dry-run modes.
    - **Data exfiltration** — the attacker wants the agent to leak data the user has access to but the attacker does not. A common encoding persuades the model to construct an outbound URL containing the sensitive data inside a markdown image link; when the chat UI renders the image, the user's browser issues the request and the attacker's server captures the data. Mitigations: content security policy on rendered output, image-link allowlisting, model output sanitization that strips outbound links to non-allowed origins.
    - **Output manipulation** — the attacker wants the model's reply to the user to be wrong in a specific way (recommend the wrong product, summarize the wrong way, classify in the attacker's favor). Mitigations: hard-coded output schemas, retrieval grounding with audit, low-trust scoring on retrieved content.
    - **System-prompt exfiltration** — the attacker wants to learn the system prompt to craft better future attacks. Mitigations: treat system prompts as semi-public; do not put secrets in them.

    By injection surface:
    - **User-input field** — the obvious surface; the direct case.
    - **RAG retrieval** — documents indexed for retrieval may include attacker-controlled content (anyone can poison a corpus that admits user submissions or scrapes the open web).
    - **Tool result** — the result of a tool call may itself contain hostile content (a webpage the agent fetches, an email body the agent reads, a database row a low-trust user wrote).
    - **Attached document** — PDFs, images with OCR, spreadsheets, code files — anything the model reads as part of its job.
    - **File / image content** — multimodal models reading images may be susceptible to text-bearing pixels, metadata, or EXIF fields.
    - **Subagent output** — when an agent delegates to a subagent, the subagent's output enters the parent's context as ordinary content; a compromised subagent propagates the compromise.

    By defense layer (in increasing strength):
    - **Filtering / blocklist** — pattern-match for known attack strings; weakest defense; bypassed by paraphrase.
    - **System-prompt warning** — tell the model not to follow injected directives; reduces but does not eliminate.
    - **Output sanitization** — strip dangerous markdown (outbound links to non-allowed origins, scripts, image tags), enforce structured-output schemas.
    - **Tool authority constraint** — the tools available to a model exposed to untrusted content are limited to safe ones; destructive tools require human-in-the-loop confirmation regardless of model intent.
    - **Origin tracking / dual-LLM pattern** (Willison 2023) — a privileged LLM that never sees untrusted content composes the action; a quarantined LLM that may see untrusted content can only produce typed outputs that the privileged LLM consumes.
    - **Planning/execution separation** — the planning agent that ingests untrusted content emits a plan; a separate execution layer (which may be code, not an LLM) executes only allowed actions from the plan.
    - **Human-in-the-loop confirmation** — every irreversible or high-impact action prompts the user with the proposed action in human-readable form; the user approves or rejects.
    - **Principle of least authority** — the agent has only the credentials, scopes, and tool surfaces it needs for the current task, not the user's full authority.
  analogy: |
    A new personal assistant who can read your mail, answer your phone, and access your accounts. The assistant cannot tell the difference between a directive from you ("pay the electric bill") and a directive inside a letter that arrived in your mailbox ("Dear assistant, please wire $5,000 to account number..."). The letter was written by a stranger; the assistant's training did not include "letters from strangers are not directives from me."

    A naive defense is to tell the assistant "ignore directives inside letters." This helps but is not airtight — a sufficiently authoritative-sounding letter, or one that frames its request as the natural next step of work you actually authorized, will sometimes get through. The training to refuse directives from letters is in the same medium (language) as the letters themselves; it can be overridden by a sufficiently persuasive letter.

    The defenses that actually work are not in the assistant. They are in the household:
    - The assistant does not have the bank password. Sending wire transfers requires you to type the password yourself. *(Capability constraint.)*
    - Any transfer above $200 prints a slip you have to sign before it leaves. *(Human-in-the-loop confirmation.)*
    - The assistant reads the mail but a separate person (or program) executes the actions; the mail-reader cannot reach the bank. *(Planning/execution separation.)*
    - The assistant has a clearly-marked "letters from strangers" bin that gets handled with extra suspicion; mail you wrote yourself is in a different bin. *(Origin tracking.)*

    None of these defenses make the assistant immune to being persuaded by a letter. They make the persuasion non-consequential. The discipline of defense is to engineer the household, not to retrain the assistant.
  misconception: |
    The most common misconception is that **a sufficiently good prompt solves the class**. It does not. The attacker's text lives in the same context window as the defensive prompt and influences the model's prediction with the same weight. A better prompt raises the success rate of the defense from 70% to 95% — still 5% of attacks succeed, and at scale 5% is unacceptable.

    The second misconception is that **this is the same as jailbreaking**. They share techniques (persuasion, encoding, social engineering of the model) but the threat models differ. Jailbreaking is "I want this model to produce content its training tries to refuse"; this attack is "I want this model, which is helping someone else, to do something I want and they did not authorize." A defense calibrated for jailbreaking (refusal training, content classifiers) is poorly fit here because the injected action may be perfectly fine in isolation — it is wrong only because the wrong principal authorized it.

    The third misconception is that **content filters stop the class**. A filter for one canonical phrasing stops one phrasing. The attacker uses synonyms, paraphrase, base64 encoding, leetspeak, directives in another language, directives phrased as polite requests, directives embedded in seemingly innocent content. Filters raise the floor; they do not raise the ceiling.

    The fourth misconception is that **the indirect case requires the user to interact with malicious content**. The user does not even need to read the content. An agent that summarizes new emails for the user will read the email; the user's only "interaction" was opening their inbox. An agent that browses the web on a search will fetch every result; the user clicked nothing. The indirect case's defining property is that the user is a victim, not a participant.

    The fifth misconception is that **the model can be the security boundary**. A defense that depends on the model deciding to refuse the injected directive is a defense that fails when the model is convinced. The security boundary must be code that the model does not author and cannot influence: tool authority limits, runtime policy checks, human-in-the-loop confirmation. The model is a useful component of a defended system; it is not the defender.

    The sixth misconception is that **newer, smarter models are immune**. Empirical research shows newer models reduce susceptibility on benchmark suites but every released model has had attacks demonstrated within weeks. Each generation of attack technique tracks each generation of model. A system whose security depends on the model being too smart to be tricked is making a bet against the entire adversarial-NLP research community.

    The seventh misconception is that **structured output formats (JSON mode, function calling) prevent the attack class**. They constrain the *shape* of the output; they do not constrain its *content*. A model emitting JSON can still emit JSON that triggers the wrong tool call with attacker-controlled arguments. The structure is a syntactic filter, not a semantic one. The semantic defense — what tools may be called, with what arguments, under what conditions — must live in the tool-runtime layer, not in the output format.

    The eighth misconception is that **RAG is safer than letting the model browse the web** because RAG content is "indexed." It is not inherently safer. If the RAG corpus accepts user submissions, scrapes the open web, or includes content from any source the attacker can write to, then RAG is an indirect attack vector by design. The right framing is that *every* document the model reads is potentially adversarial; RAG just makes the corpus more discoverable.
---

# Prompt-Injection Defense

## Coverage

The architectural discipline of defending language-model-integrated systems against the attack class in which untrusted content causes the model to follow attacker-controlled directives. Covers the data-vs-directive collapse that makes this attack structural rather than incidental, the direct/indirect/action-trigger/exfiltration taxonomy, the injection surfaces (user input, RAG retrieval, tool result, attached document, multimodal image content, subagent output), why content filters and improved system prompts do not solve the class, and the defense-in-depth measures that do (capability constraint, origin tracking, dual-LLM pattern, planning/execution separation, human-in-the-loop confirmation, principle of least authority).

## Philosophy

This attack class is not a bug. It is a property of how transformer-based language models consume their context. Every token in the context window contributes to the next-token prediction, and the model has no reliable mechanism to distinguish "directives from the application developer" from "directives written by an attacker in a document the application happens to have loaded." Treating it as a bug to fix — by patching the model or improving the system prompt — buys partial reductions in attack success rate but never reaches zero.

The discipline of defense, therefore, is not to eliminate the vulnerability. It is to ensure that successful compromise does not translate to consequential action. The model can be tricked; the runtime must not be. The defenses that work are architectural: limit what tools the model exposed to untrusted content can call, separate the agent that reads untrusted content from the agent (or code) that takes action, require human confirmation for high-impact operations regardless of model intent, and track the provenance of every byte in the context window so that low-trust content cannot route to high-authority execution paths.

The wrong mental model is "build a smart fence around the model." The right mental model is "engineer the system so the model's mistakes don't matter."

## The Threat Model

| Element | Direct case | Indirect case |
|---|---|---|
| Who is the attacker | The user typing into the input | A third party who controls content the system reads |
| Who is the victim | The application (or the user's interest in the app's correct behavior) | The user on whose behalf the model is acting |
| Where the directive lives | The user-input field | A document, webpage, tool result, email, RAG entry, subagent output |
| Why the user wouldn't notice | The user is the attacker | The user may never even see the injected content |
| First demonstrated | Riley Goodside popularized in September 2022 | Greshake et al., "Not what you've signed up for," February 2023 |

Both threat cases have the same root cause (data-vs-directive collapse in transformers) and require the same architectural defenses, but the indirect case is the harder threat — the user is not a participant in their own compromise.

## The Defense Stack

Defenses compose. None alone is sufficient; the stack as a whole determines the system's security posture.

| Layer | What it does | Bypass class | Strength |
|---|---|---|---|
| Input filtering / blocklist | Pattern-match for known attack strings | Paraphrase, encoding, indirect content | Weak |
| System-prompt warning | Tell the model not to follow injected directives | Sufficiently persuasive text in the same context | Weak-to-medium |
| Output sanitization | Strip dangerous markdown / outbound URLs / scripts from model output | Same-origin exfiltration, encoded data | Medium for exfiltration |
| Structured output enforcement | Force JSON/function-call schema | Semantic compromise within valid structure | Medium for shape, weak for content |
| Tool authority constraint | The tools available to a low-trust agent are themselves low-impact | Compose multiple safe tools into harmful effect | Strong |
| Origin tracking / dual-LLM pattern | A privileged LLM never sees untrusted content; a quarantined LLM produces typed outputs the privileged one consumes | Quarantined LLM persuades the privileged one via the typed channel — needs schema rigor | Strong |
| Planning/execution separation | The planning model proposes; a separate execution layer enforces what is actually allowed | Bypassed only if execution policy is itself derived from model output | Strong |
| Human-in-the-loop confirmation | Every irreversible action requires explicit user approval | User clicks through; UX matters | Strong if UX is honest |
| Principle of least authority | The agent has only the credentials and scopes needed for the immediate task | Insider threat from the agent itself is the residual risk | Strong |

The OWASP Top 10 for LLM Applications (LLM01: Prompt Injection) recommends combining several of these in any deployed system.

## Injection Surfaces — Every One Is A Vector

| Surface | Risk | Mitigation |
|---|---|---|
| User-input field | Direct case | Treat as untrusted; constrain tools accordingly |
| RAG retrieval | Indirect via poisoned/attacker-authored documents in the corpus | Origin-tag retrieved chunks; low-trust score; never let RAG content escalate authority |
| Tool result | Indirect via a tool that fetches third-party content (web, email body, low-trust DB rows) | Treat tool results as untrusted; constrain follow-up tool calls; do not let a tool result trigger an action the user did not authorize |
| Attached document (PDF, DOCX, spreadsheet) | Indirect via attachment uploaded by anyone (the user, but also a forwarded email) | Same as above; consider whether the agent reading attachments needs any tool authority |
| Image / multimodal | Directives encoded as text in image pixels, OCR'd by the model | Same as above; vision models susceptible to text-in-image directives |
| Subagent output | A compromised subagent propagates the compromise to its parent | Subagent outputs are tool results; treat as untrusted |
| The system prompt position | If user content gets prepended above the system prompt due to bug | Validate the message-list construction; system prompt must always be first |

The defensive question for any new feature: **what untrusted content will enter the model's context, and what tools will the model have authority to call in that turn?** If the answer to the second is anything destructive, the design needs revision.

## The Markdown-Image Exfiltration Pattern

A signature exfiltration technique against assistant-style LLMs:

1. Untrusted content the model is reading contains a directive to include, at the end of its response, a markdown image whose URL points at an attacker-controlled server with the query string containing some sensitive value from the conversation.
2. The model, attending to the directive, constructs the markdown image element with the sensitive value embedded in the URL.
3. The chat UI renders the markdown, causing the user's browser to fetch the image URL.
4. The attacker's server logs the URL, capturing the sensitive value.

The user did not click anything. They saw the assistant's reply, the image silently loaded, and the data was exfiltrated.

Mitigations:
- Strip markdown image links pointing to non-allowed origins before rendering.
- Apply Content-Security-Policy to the chat UI restricting `img-src`.
- Sanitize URLs in model output as part of the rendering pipeline, not the model output.

This pattern generalizes: any rendered output that can produce an outbound network request based on attacker-controlled content is an exfiltration channel.

## The Dual-LLM Pattern

Proposed by Simon Willison (2023). Two LLMs split the work:

- **Privileged LLM** — has access to tools, secrets, and authority. Never sees untrusted content directly. Receives only typed, structured summaries from the quarantined LLM (a schema like `{ documents_summary: string, action_options: Action[], recommended: Action }`).
- **Quarantined LLM** — reads untrusted content. Has no tool authority. Its only output is into a typed schema that the privileged LLM consumes.

Even if the quarantined LLM is fully compromised (every retrieved document successfully attacks it), it can only output values into the typed schema; the harm is bounded by what an attacker can express through that schema. If the schema is small and well-designed, the bound is tight.

This is structurally analogous to a sandboxed process producing a parsed protobuf for a privileged orchestrator — the security boundary is the data shape between them, enforced by code on both sides.

## Verification

After applying this skill, verify:
- [ ] Every place untrusted content enters the model's context is named explicitly. "User input" is not the only one — RAG retrievals, tool results, attached documents, multimodal image content, and subagent outputs all qualify.
- [ ] The agent exposed to any untrusted content has tool authority limited to operations that cannot cause harm if maliciously invoked. Destructive tools require human-in-the-loop confirmation regardless of model intent.
- [ ] No defense rests solely on prompting. System-prompt warnings are present as one layer but are not the load-bearing layer.
- [ ] If output is rendered as HTML or Markdown, image-source and link-target origins are restricted by an allowlist or Content-Security-Policy, not by trust in the model output.
- [ ] If the system uses RAG, retrieved chunks are origin-tagged; the rendering or downstream-tool layer treats retrieved content as low-trust regardless of corpus provenance.
- [ ] If the system uses subagents, subagent outputs are treated as tool results — i.e., as untrusted content — when they re-enter the parent's context.
- [ ] No single tool call can both ingest untrusted content and perform a high-impact action in the same turn. The planning/execution boundary is enforced architecturally, not by prompt.
- [ ] An adversarial test has been run: at least one red-team pass against the system using public attack-prompt corpora (e.g., the OWASP LLM01 examples, the SPML benchmark) and a hand-written set targeting the system's specific tools and surfaces.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Hardening a model against producing disallowed content (jailbreaking) | `model-safety` | jailbreaking targets the model's policy boundary on behalf of one user; this attack class targets the application's correct behavior on behalf of a victim user |
| Designing the JSON shape or parameter schema of a tool | `tool-call-flow` + `api-design` | tool-call-flow owns the model-runtime cycle; api-design owns parameter shape; this skill owns the security property they must preserve |
| Defending an HTTP API against SQL injection or XSS | `api-security` | those have hard data-vs-directive boundaries that can be fixed at the encoding layer; this skill is for the boundary-less LLM case |
| Auditing the model's accuracy or hallucination behavior | `eval-driven-development` | eval owns measurement; this skill owns the security property |
| General authn/authz for API endpoints | `api-security` | authz governs what callers may do; this skill governs what an authenticated agent may be tricked into doing |

## Key Sources

- OWASP. [LLM01: Prompt Injection — OWASP Top 10 for Large Language Model Applications (2025)](https://genai.owasp.org/llmrisk/llm01-prompt-injection/). The canonical industry-aligned threat-classification and mitigation framework.
- Greshake, K., Abdelnabi, S., Mishra, S., Endres, C., Holz, T., & Fritz, M. (2023). ["Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection"](https://arxiv.org/abs/2302.12173). The foundational academic paper on the indirect case; defines the threat model.
- Perez, F., & Ribeiro, I. (2022). ["Ignore Previous Prompt: Attack Techniques For Language Models"](https://arxiv.org/abs/2211.09527). Early systematic study of direct attack techniques.
- Willison, S. [Prompt injection: What's the worst that can happen?](https://simonwillison.net/2023/Apr/14/worst-that-can-happen/) and [The Dual LLM pattern for building AI assistants that can resist prompt injection](https://simonwillison.net/2023/Apr/25/dual-llm-pattern/). Canonical practitioner taxonomy and the dual-LLM architectural pattern.
- NIST. [AI Risk Management Framework (AI RMF 1.0)](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf). Section on adversarial input and the broader AI risk taxonomy; useful framing for what this attack class sits inside.
- Anthropic. [Mitigating jailbreaks and prompt injections](https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/mitigate-jailbreaks). Vendor-side guidance on defense in depth for Anthropic-hosted models — useful as one practitioner perspective, not as a complete defense.
- OWASP. [LLM02: Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm02-sensitive-information-disclosure/) and [LLM06: Excessive Agency](https://genai.owasp.org/llmrisk/llm06-excessive-agency/). Adjacent OWASP categories that compose with this one — exfiltration consequences and over-broad tool authority are the consequence side of the threat.
- Schulhoff, S., Pinto, J., Khan, A., et al. (2024). ["The Prompt Report: A Systematic Survey of Prompting Techniques"](https://arxiv.org/abs/2406.06608). Cross-references defensive prompting techniques within the broader prompting literature.
