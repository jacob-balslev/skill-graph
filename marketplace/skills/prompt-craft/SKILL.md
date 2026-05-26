---
name: prompt-craft
description: "Use when writing, tightening, evaluating, or repairing an LLM prompt or reusable prompt template for completion, agent dispatch, grading, structured extraction, tool use, or prompt-engineered workflows. Covers instruction hierarchy, message roles, context placement, few-shot examples, structured output, positive constraints, reasoning guidance, prompt-injection resistance, provider differences, and eval-driven iteration. Do NOT use for whole context-system design (use context-engineering), eval dataset or grader design (use agent-eval-design), reviewing generated code (use code-review), authoring SKILL.md files (use skill-scaffold), choosing which skill or agent should activate (use skill-router), or root-causing a deployed failure after outputs already exist (use debugging). Do NOT use for review this AI-generated PR for correctness. Do NOT use for scaffold a new skill that teaches prompt engineering."
license: MIT
compatibility: "Provider-agnostic prompt-design discipline for OpenAI, Anthropic, Google Gemini, open-weight models, and agent runtimes; provider-specific APIs, role names, structured-output features, and reasoning controls must be checked before implementation."
allowed-tools: Read Grep Bash Edit
metadata:
  schema_version: "8"
  version: "1.1.0"
  type: capability
  operation: know
  category: agent
  subject: agent-ops
  domain: agent/prompts
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"prompt\",\"prompt engineering\",\"prompt craft\",\"write a prompt\",\"improve this prompt\",\"iterate on prompt\",\"prompt template\",\"system prompt\",\"developer prompt\",\"user prompt\",\"few shot\",\"few-shot examples\",\"role prompt\",\"instruction hierarchy\",\"message roles\",\"output format\",\"structured output\",\"reasoning prompt\",\"prompt injection\",\"adversarial input\",\"llm prompt\",\"agent prompt\"]"
  triggers: "[\"prompt-craft-skill\",\"prompt-engineering-skill\",\"prompt-template-skill\"]"
  examples: "[\"write a reusable prompt for an LLM to classify support tickets and return one JSON object\",\"improve this system prompt because the model keeps giving generic answers\",\"how do I get the model to return strict JSON and retry safely when it does not?\",\"tighten this sub-agent prompt so it knows what evidence to gather and when to stop\",\"should this task use zero-shot, few-shot examples, or a separate eval loop?\",\"the model follows instructions embedded in user content; harden the prompt against injection\",\"review this LLM-as-judge prompt for clarity and output constraints\",\"how do I prompt the model to ask clarifying questions only when ambiguity blocks the task?\"]"
  anti_examples: "[\"review this AI-generated PR for correctness\",\"scaffold a new skill that teaches prompt engineering\",\"which skill should the router pick for this query?\",\"design an eval suite and grader thresholds for this agent\",\"debug why the deployed prompt failed last night\",\"write a doc explaining our prompt conventions for humans only\"]"
  relations: "{\"boundary\":[{\"skill\":\"context-engineering\",\"reason\":\"context-engineering designs the whole information environment, retrieval payload, memory, compaction, and context budget; prompt-craft shapes the instructions and prompt template that consume that context.\"},{\"skill\":\"agent-eval-design\",\"reason\":\"agent-eval-design creates eval datasets, graders, thresholds, hard negatives, and harnesses; prompt-craft uses eval evidence to revise prompt wording and structure.\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates generated or human-written code; prompt-craft writes or improves the prompt that may produce or grade code.\"},{\"skill\":\"skill-scaffold\",\"reason\":\"skill-scaffold owns SKILL.md authoring and metadata structure; prompt-craft owns prompts used by agents or tools.\"},{\"skill\":\"skill-router\",\"reason\":\"skill-router decides which skill or agent activates for a user request; prompt-craft writes the selected prompt or dispatch instruction after that routing decision.\"},{\"skill\":\"debugging\",\"reason\":\"debugging investigates a known deployed failure and root cause; prompt-craft provides prompt-level remediation once evidence shows prompt wording or structure is the failing surface.\"}],\"related\":[\"context-engineering\",\"agent-eval-design\",\"evaluation\",\"guardrails\",\"debugging\",\"code-review\"],\"verify_with\":[\"agent-eval-design\",\"evaluation\",\"guardrails\"]}"
  grounding: "{\"domain_object\":\"Portable LLM prompt design, instruction hierarchy, structured-output prompting, adversarial-input boundaries, and eval-driven prompt iteration\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/prompt-engineering\",\"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview\",\"https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices\",\"https://ai.google.dev/gemini-api/docs/prompting-strategies\",\"https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html\"],\"failure_modes\":[\"prompt_shipped_after_one_plausible_output_without_eval\",\"role_or_instruction_authority_confused_with_user_input\",\"examples_teach_surface_patterns_instead_of_decision_boundaries\",\"structured_output_assumed_without_validation_or_schema_support\",\"negative_instruction_increases_salience_without_positive_target\",\"hidden_chain_of_thought_requested_or_exposed_unnecessarily\",\"prompt_injection_treated_as_wording_problem_instead_of_data_instruction_separation\",\"prompt_changes_claimed_success_without_rerunning_linked_eval\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  mental_model: "A prompt is an executable instruction contract: stable rules and examples define the function, variable user content supplies arguments, and evals decide whether revisions improved behavior."
  purpose: "Make LLM behavior more reliable, inspectable, portable, and safe by turning vague requests into tested instruction structures with clear boundaries and output contracts."
  boundary: "This skill owns prompt wording and template structure. It does not own the entire context system, eval harness design, generated-code review, SKILL.md authoring, routing selection, or root-cause debugging of an already observed failure."
  analogy: "Prompt craft is like writing a contract for a skilled but unfamiliar collaborator: specify the job, available evidence, allowed moves, examples, and acceptance format before judging the result."
  misconception: "The common mistake is believing a clever prompt can replace context quality, tool permissions, evals, validation, or security controls. Good prompts make those surfaces explicit; they do not substitute for them."
  concept: "{\"definition\":\"Prompt craft is the disciplined design and revision of LLM instructions, examples, context boundaries, and output constraints so a model can perform a target task reliably under measured conditions.\",\"mental_model\":\"Treat the prompt as an executable contract. Stable instructions and examples define the function, variable user content supplies arguments, and eval results decide whether the contract works.\",\"purpose\":\"It turns vague intent into inspectable instructions with clear task framing, input boundaries, output shape, safety constraints, and revision evidence.\",\"boundary\":\"It does not design the full context stack, create eval harnesses, review generated code, author SKILL.md files, select routing, or debug deployed failures without prompt-specific evidence.\",\"taxonomy\":\"Core surfaces are instruction authority, role and tone, task statement, context and retrieval payload, constraints, examples, variable input delimitation, output format, tool-use instructions, safety boundaries, provider controls, and eval-linked revision.\",\"analogy\":\"It is like writing a contract for a skilled but unfamiliar collaborator: the contract names the job, evidence, allowed moves, examples, acceptance format, and escalation path.\",\"misconception\":\"A longer or more forceful prompt is not automatically better. Prompt quality is measured by reliable task performance, format compliance, safety behavior, and maintainability under realistic inputs.\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/prompt-craft/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Prompt Craft

## Coverage

This skill covers portable prompt design for LLM-backed tasks and agents:

- Instruction hierarchy and message roles: where stable policy, developer rules, user requests, examples, and variable input belong.
- Prompt anatomy: task statement, context, constraints, examples, input delimiters, output cue, refusal or escalation rule, and verification plan.
- Context placement: what belongs in the prompt template versus the surrounding context, retrieval, memory, tool output, or runtime config.
- Few-shot examples: choosing boundary examples, counterexamples, and diverse cases that teach the pattern without leaking private data.
- Output-format discipline: schema-shaped responses, enum outputs, concise prose, tables, JSON, Markdown, validation, retries, and fallback behavior.
- Positive constraints and negative boundaries: replacing vague prohibitions with explicit target behavior while retaining safety-critical refusals.
- Reasoning guidance: when to ask for concise rationale or internal carefulness, when to avoid visible reasoning, and when provider effort controls are the better lever.
- Adversarial-input resistance: separating instructions from user data, validating outputs, limiting tool authority, and routing security-sensitive controls to guardrails.
- Iterative improvement: hold eval cases fixed, change one prompt surface at a time, measure behavior, and document the delta.
- Provider differences: OpenAI, Anthropic, Gemini, and open-weight models vary in role semantics, structured-output APIs, reasoning controls, and prompt sensitivity.

## Philosophy

A prompt is a specification, not a wish list. The goal is not the shortest possible wording or the most elaborate incantation; the goal is the smallest inspectable instruction contract that reliably produces the required behavior on realistic inputs.

Prompt craft is also not a substitute for system design. A model cannot reliably follow context it never received, validate JSON the runtime never checks, refuse tool calls the application allows, or prove quality on examples that were never run. Good prompt work names those boundaries. It tells the model what to do, tells the runtime what must be validated, and tells the maintainer what evidence would justify keeping a revision.

The largest failure mode is prompt-and-pray: write a prompt, run one plausible example, and ship. Prompt engineering becomes engineering only when a stable eval set, format checker, or trace review can show whether the change improved the target metric without causing regressions.

## Prompt Anatomy

A non-trivial prompt usually has these layers. The order is a starting point, not a universal law; provider docs and eval results should decide the final shape.

| Layer | Purpose | Guidance |
|---|---|---|
| Authority frame | Put stable rules, product policy, and business logic above variable user input | Use the highest-authority message or instructions surface your provider supports; keep user-controlled data out of that layer. |
| Identity or role | Set expertise, tone, or operating stance when it changes behavior | Keep it short. A precise task instruction usually beats a broad persona. |
| Task statement | Name the exact deliverable | One sentence should answer: what should the model produce? |
| Context | Provide definitions, source text, business rules, retrieved snippets, or constraints the model cannot infer | Include only relevant context; route larger context design to context-engineering. |
| Procedure | Give ordered steps when sequence or completeness matters | Use numbered steps for workflows; avoid hidden requirements buried in prose. |
| Examples | Demonstrate desired input/output shape and edge decisions | Use diverse boundary examples; avoid production or private examples unless scrubbed and authorized. |
| Variable input | Present the user data, document, trace, or item being processed | Delimit it and state that it is data to analyze, not instructions to obey. |
| Output contract | Define response shape, enum, schema, length, tone, or citation requirements | Prefer provider structured-output features for complex JSON; validate after generation. |
| Failure path | Tell the model what to do when information is missing, unsafe, ambiguous, or outside scope | Use explicit fallback labels, clarification rules, or refusal criteria. |
| Verification hook | State what will be checked or how success is measured | Tie prompt revisions to evals, tests, schema validation, or human review. |

## Instruction Hierarchy And Message Roles

Place instructions where the runtime's authority model expects them. OpenAI's prompt-engineering docs describe developer messages as the system's rules and business logic, while user messages carry inputs and configuration. Anthropic docs similarly emphasize clear, direct instructions, examples, XML-style structure, and model-specific prompt tuning. Gemini docs emphasize direct structure, constraints, response format, context, and prompt iteration.

Use these defaults unless provider guidance or eval evidence says otherwise:

- Stable identity, product rules, safety boundaries, and business logic belong in the highest-authority instruction surface available.
- User input, retrieved documents, tool observations, emails, tickets, code snippets, and uploaded files belong in data sections, not in system or developer instructions.
- Examples should be visibly separated from live inputs so the model does not confuse demonstration with task data.
- Long-lived prompt objects should be versioned; every production change should be traceable to an eval, metric, or observed failure.
- Do not rely on wording alone for tool safety. Tool availability, arguments, side effects, and permissions need runtime guardrails.

## Prompt Versus Context Boundary

Use prompt-craft for the wording and structure of instructions. Use context-engineering when the problem is the information environment around the prompt.

| Symptom | Prompt-craft owns | Context-engineering owns |
|---|---|---|
| The model ignores the required output shape | Output contract, example, final cue, retry instruction | Runtime parser, schema validation, downstream repair loop |
| The model lacks domain facts | Instruction that says how to use supplied evidence | Retrieval, source selection, chunking, memory, context budget |
| The model follows malicious text inside an input | Data/instruction separation wording | Sanitization, tool permissions, content isolation, guardrails |
| The model is verbose or under-specific | Tone, length, and specificity instructions | Product-level response policy and reusable context packs |
| The agent misses steps | Task procedure and stop criteria | Workflow state, TODO tracking, orchestration, tool traces |

If changing the prompt cannot plausibly fix the observed behavior without changing retrieved data, tool authority, memory, schema validation, or runtime state, switch skills.

## Output-Format Discipline

For structured output, the prompt should describe the contract and the runtime should enforce it. Do not treat model obedience as validation.

Use a layered approach:

1. State the output type and allowed fields or labels.
2. Prefer native structured-output or JSON-schema features when the provider supports them, especially for complex schemas.
3. Include one small example that demonstrates the exact shape.
4. Put a final output cue at the end of the prompt.
5. Validate the result outside the model.
6. Retry once with the validation error only when retrying is safe.
7. Fall back to a clear error, clarification, or human review path when validation still fails.

Example pattern:

    Return one JSON object with this shape:
    { "label": "SPAM" | "HAM" | "UNDETERMINED", "confidence": 0.0-1.0 }

    Output no prose outside the JSON object.

    If the input cannot be classified from the supplied evidence, use "UNDETERMINED".

Avoid exact reliability claims such as a fixed breakage percentage unless you have measurements for the model, prompt, sampling settings, and input distribution in front of you.

## Positive Constraints And Negative Boundaries

Negative instructions are sometimes necessary, especially for safety, privacy, authorization, and output exclusions. But a prohibition alone often leaves the model without a target behavior. Pair negative boundaries with positive replacements.

| Weak | Stronger |
|---|---|
| Do not be vague. | State the verdict in the first sentence, then give two evidence bullets. |
| Do not output private data. | Output only the label and confidence; do not copy any input text into the response. |
| Do not use Markdown. | Output plain text sentences only; no headings, bullets, tables, or formatting characters. |
| Do not hallucinate. | Use only facts in the Source section. If the source is insufficient, answer INSUFFICIENT_SOURCE. |
| Do not call dangerous tools. | Before any side-effecting tool call, state the intended action and require explicit approval. |

The principle is salience plus target: reduce unnecessary mention of forbidden content, and give the model an allowed behavior it can execute instead.

## Few-Shot Example Selection

Few-shot examples teach pattern and boundaries. They are not a storage place for every rule.

Choose examples that:

- Match the real task closely enough to transfer.
- Cover category boundaries, ambiguous cases, and known failure modes.
- Vary length, style, vocabulary, and input shape so the model does not learn a superficial cue.
- Include at least one negative or counterexample when confusion between categories is likely.
- Demonstrate the exact output contract, including labels, field names, citation style, or refusal path.
- Are newly authored or scrubbed so private, customer, credential, or local-path content is not embedded in a reusable prompt.

Use zero-shot for simple, well-defined tasks. Use one example to establish shape. Use three to five examples for nuanced classification or style. More examples can help exemplar-driven tasks, but if the prompt needs many examples to work, consider whether the task should be decomposed, retrieved examples should be selected dynamically, or the behavior belongs in a fine-tuned model, rules engine, or eval-guided workflow.

## Reasoning Guidance

Do not ask the model to reveal hidden chain-of-thought. Ask for the visible artifact you need: a concise rationale, assumptions, cited evidence, decision table, calculation trace, or verification checklist. For models with explicit reasoning controls, tune the provider's effort or thinking budget instead of trying to coerce hidden reasoning through prose.

Use visible reasoning when it improves auditability:

- Decisions that need a short justification.
- Classification tasks where a label without evidence is hard to trust.
- Safety or authorization checks where the deciding rule must be inspectable.
- Multi-step tasks where the user benefits from a compact plan or progress update.

Suppress visible reasoning when it harms the product:

- Strict machine-readable output.
- User-facing answers where only the final result is needed.
- Sensitive workflows where exposing intermediate reasoning may reveal policy, private context, or attack surface.
- Latency-sensitive workflows where internal effort controls are the better knob.

## Defence Against Adversarial Input

Any prompt that processes user-controlled or retrieved content is exposed to prompt injection. OWASP describes the core problem as natural-language instructions and data being processed together without clear separation, with impacts such as safety bypass, data exfiltration, prompt leakage, and unauthorized tool use.

Prompt-level defenses:

- Delimit user data and retrieved content with explicit section labels or tags.
- State that delimited content is data to analyze, not instructions to follow.
- Keep system, developer, and policy instructions separate from user-controlled text.
- Use allowlisted labels, schemas, and tool names where possible.
- Tell the model how to respond to attempted overrides, prompt extraction, hidden instructions, or tool manipulation.
- Avoid rendering model output as trusted HTML or Markdown without sanitization in applications that display it.

Runtime defenses that prompt-craft must not pretend to solve alone:

- Input validation and sanitization.
- Output monitoring and schema validation.
- Least-privilege tool permissions.
- Human-in-the-loop controls for side effects.
- Remote-content sanitization and retrieval hygiene.
- Security evals and adversarial tests.

When user input can cause tool calls, financial actions, data access, credential exposure, or customer-impacting changes, verify with guardrails.

## Iterative Improvement Loop

Prompt changes need evidence. Use this loop for any prompt that matters:

1. Define success criteria before editing: accuracy, format compliance, refusal quality, latency, cost, tool-use precision, or user satisfaction.
2. Hold a representative eval set fixed. Include edge cases, hard negatives, adversarial cases, and known failure examples.
3. Run the current prompt and record baseline behavior.
4. Change one surface at a time: wording, context order, example set, output contract, role, reasoning guidance, or provider parameter.
5. Re-run the same eval set under the same model and sampling conditions.
6. Keep the change only if it improves the target metric without unacceptable regressions.
7. Record the changed surface, evidence, date, model, and residual risks.
8. If the failure is not prompt-controllable, route to context-engineering, guardrails, agent-eval-design, debugging, or model/runtime configuration.

A prompt that has not been measured may be a good draft. It is not yet an engineered prompt.

## Provider-Specific Checks

Before finalizing a prompt, verify the provider/runtime details that affect behavior:

| Surface | Check |
|---|---|
| Role semantics | Which instruction levels exist, and which wins on conflict? |
| Structured output | Is JSON schema or constrained decoding available, or is the prompt only advisory? |
| Tool use | How are tools described, selected, authorized, and validated? |
| Reasoning controls | Is there an effort, thinking, or budget parameter that should be used instead of prompt wording? |
| Context window | How much context can be supplied, and where should reusable versus variable content sit? |
| Sampling | Are temperature, top-p, stop sequences, max output, and retries pinned for reproducibility? |
| Persistence | Are prompt versions, eval links, and rollback paths available? |

Provider docs can conflict in emphasis because models differ. Treat provider guidance as a hypothesis to test against your own eval set, not as a permanent universal rule.

## Source Notes

- OpenAI grounds message authority, developer versus user message separation, structured prompt sections, prompt versioning, few-shot learning, eval-linked publication, and agentic prompt practices.
- Anthropic grounds success criteria before prompt engineering, clear and direct instructions, examples, XML-style structure, role prompting, effort controls, and measuring prompt changes against evals.
- Google Gemini grounds constraints, response formats, structured-output feature preference for complex JSON, context insertion, prompt iteration, content-order experiments, and parameter tuning.
- OWASP grounds prompt-injection attack classes and primary defenses such as input validation, structured separation, output validation, least privilege, monitoring, and human controls.

## Verification

After applying this skill, verify:

- [ ] The prompt has one clear task statement and an explicit output contract.
- [ ] Stable instructions are separated from variable user input and retrieved content.
- [ ] User-controlled content is delimited and treated as data, not commands.
- [ ] Required context is present, and missing context is routed to context-engineering rather than hidden in wording.
- [ ] Few-shot examples, if used, cover boundaries and known failure modes without private data.
- [ ] Structured output is backed by provider features or runtime validation when correctness matters.
- [ ] Negative boundaries have positive replacement behavior where possible.
- [ ] Reasoning guidance asks for visible rationale only when useful and does not require hidden chain-of-thought disclosure.
- [ ] Prompt-injection and tool-use risks are checked with guardrails when user-controlled content can trigger actions or data access.
- [ ] The revised prompt was measured against a stable eval set or clearly labeled as an unverified draft.
- [ ] Eval, routing, freshness, and verification claims are no stronger than the evidence from this run.

## Do NOT Use When

| Use instead | When |
|---|---|
| context-engineering | Designing retrieval payloads, context windows, memory, compaction, source selection, or the broader information environment around the prompt. |
| agent-eval-design | Creating eval datasets, graders, hard negatives, thresholds, or a benchmark harness for future prompt or agent evaluation. |
| evaluation | Scoring a completed prompt change or deliverable against evidence and deciding whether it is done. |
| guardrails | Designing runtime controls for prompt injection, tool permissions, side effects, data exfiltration, or policy enforcement. |
| code-review | Reviewing AI-generated code or a pull request for correctness, security, maintainability, and regressions. |
| skill-scaffold | Authoring or restructuring a SKILL.md file and its metadata contract. |
| skill-router | Selecting which skill or agent should activate for a user query. |
| debugging | Investigating root cause for a deployed prompt or agent failure after bad outputs, traces, or incidents already exist. |
