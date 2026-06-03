---
name: prompt-injection-defense
description: "Use when reasoning about systems that pass untrusted content to a language model: the data-vs-instruction collapse that makes this attack class a structural property of LLMs rather than a fixable bug, the direct/indirect/exfiltration/action-trigger taxonomy, the role of every untrusted surface (RAG retrievals, tool results, attachments, web content, document parsing, user-provided text), why content filters and improved system prompts do not solve it, and the defense-in-depth measures that do (capability constraint, content origin tracking, separate planning and execution stages, human-in-the-loop gates, principle-of-least-authority for tools). Do NOT use for jailbreaking and policy circumvention (use model-safety), for general API security (use api-security), for runtime input validation patterns (use type-safety + api-design), or for the protocol cycle of tool calls (use tool-call-flow)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: ai-engineering
  deployment_target: portable
  scope: "Reasoning about prompt-injection defense for systems that pass untrusted content to language models: data-vs-instruction collapse, direct and indirect injection, exfiltration, action-trigger attacks, untrusted content surfaces, and defense-in-depth through capability constraint, origin tracking, separated planning/execution, human approval, and least authority. Portable across LLM-integrated products and agent architectures. Excludes model jailbreaking/policy bypass, general API security, non-LLM input validation, and ordinary tool-call protocol design."
  taxonomy_domain: quality/security
  stability: experimental
  keywords: "[\"prompt injection\",\"indirect prompt injection\",\"LLM01\",\"OWASP LLM\",\"data exfiltration\",\"tool abuse\",\"untrusted content\",\"RAG injection\",\"markdown image exfiltration\",\"jailbreak\"]"
  triggers: "[\"is this an injection vector\",\"how do we stop the model from following commands in user input\",\"the model is treating retrieved content as commands\",\"is RAG safe\",\"can the model exfiltrate data via a tool call\"]"
  examples: "[\"review whether retrieved documents in a RAG pipeline can override the system prompt\",\"design the boundary between a planning agent and an execution agent so injected commands cannot trigger destructive tool calls\",\"explain why a content filter that blocks one canonical attack phrase does not stop the broader class\",\"decide what tools an agent reading email attachments may invoke without human confirmation\"]"
  anti_examples: "[\"design the JSON shape of a tool's parameters (use tool-call-flow)\",\"harden an HTTP API against SQL injection or XSS (use api-security)\",\"audit a model's refusal behavior on disallowed content (use model-safety)\"]"
  relations: "{\"related\":[\"tool-call-flow\",\"http-semantics\",\"type-safety\",\"api-design\"],\"boundary\":[{\"skill\":\"tool-call-flow\",\"reason\":\"tool-call-flow owns the protocol cycle by which a model invokes a tool; this skill owns the security property the cycle must preserve when any message carries untrusted content.\"}],\"verify_with\":[\"api-design\",\"tool-call-flow\"]}"
  grounding: "{\"subject_matter\":\"Portable prompt-injection threat modeling and defense-in-depth for LLM-integrated systems and agents\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://genai.owasp.org/llmrisk/llm01-prompt-injection/\",\"https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html\",\"https://www.anthropic.com/research/prompt-injection-defenses\",\"https://csrc.nist.gov/pubs/ai/100/2/e2025/final\",\"https://arxiv.org/abs/2302.12173\"],\"failure_modes\":[\"treating_prompt_injection_as_a_model_bug_fixed_by_prompt_wording\",\"confusing_jailbreak_policy_bypass_with_agent_action_exfiltration_risk\",\"trusting_rag_tool_results_attachments_or_subagent_output_as_instructions\",\"allowing_untrusted_content_and_high_impact_tools_in_the_same_turn\",\"relying_on_content_filters_without_capability_constraint_or_human_approval\",\"rendering_model_output_with_unrestricted_external_image_or_link_targets\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Prompt injection defense is to LLM-integrated systems what blast walls are to fuel depots — you cannot prevent the fuel from being flammable (the structural property), so you do not try; you build the walls so that an ignition contains itself, the radius is bounded, and the rest of the depot survives. The walls are the architectural defense; the model's susceptibility is the fuel's flammability — a property of its physics, not a bug to fix."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/prompt-injection-defense/SKILL.md
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `ai-engineering`
- Deployment: `portable`
- Domain: `quality/security`
- Scope: Reasoning about prompt-injection defense for systems that pass untrusted content to language models: data-vs-instruction collapse, direct and indirect injection, exfiltration, action-trigger attacks, untrusted content surfaces, and defense-in-depth through capability constraint, origin tracking, separated planning/execution, human approval, and least authority. Portable across LLM-integrated products and agent architectures. Excludes model jailbreaking/policy bypass, general API security, non-LLM input validation, and ordinary tool-call protocol design.

**When to use**
- review whether retrieved documents in a RAG pipeline can override the system prompt
- design the boundary between a planning agent and an execution agent so injected commands cannot trigger destructive tool calls
- explain why a content filter that blocks one canonical attack phrase does not stop the broader class
- decide what tools an agent reading email attachments may invoke without human confirmation
- Triggers: `is this an injection vector`, `how do we stop the model from following commands in user input`, `the model is treating retrieved content as commands`, `is RAG safe`, `can the model exfiltrate data via a tool call`

**Not for**
- design the JSON shape of a tool's parameters (use tool-call-flow)
- harden an HTTP API against SQL injection or XSS (use api-security)
- audit a model's refusal behavior on disallowed content (use model-safety)
- Owned by `tool-call-flow`: the protocol cycle by which a model invokes a tool

**Related skills**
- Verify with: `api-design`, `tool-call-flow`
- Related: `tool-call-flow`, `http-semantics`, `type-safety`, `api-design`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Prompt injection defense is to LLM-integrated systems what blast walls are to fuel depots — you cannot prevent the fuel from being flammable (the structural property), so you do not try; you build the walls so that an ignition contains itself, the radius is bounded, and the rest of the depot survives. The walls are the architectural defense; the model's susceptibility is the fuel's flammability — a property of its physics, not a bug to fix.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://genai.owasp.org/llmrisk/llm01-prompt-injection/`, `https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html`, `https://www.anthropic.com/research/prompt-injection-defenses`, `https://csrc.nist.gov/pubs/ai/100/2/e2025/final`, `https://arxiv.org/abs/2302.12173`

**Keywords**
- `prompt injection`, `indirect prompt injection`, `LLM01`, `OWASP LLM`, `data exfiltration`, `tool abuse`, `untrusted content`, `RAG injection`, `markdown image exfiltration`, `jailbreak`

<!-- skill-graph-context:end -->
