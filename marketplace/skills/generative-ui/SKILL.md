---
name: generative-ui
description: "Use when reasoning about the pattern where a language model emits structured output describing UI components or a UI sub-tree that an application renders for the user. Covers the typed-schema component palette, JSON Schema/function-calling constraints, two render substrates (typed component tree vs sandboxed iframe), the app-side render pipeline, bidirectional interaction loop via postMessage/JSON-RPC, the security boundary between model author and application renderer, and distinctions from chat markdown, prebuilt-widget routing, RSC streaming, and model-emits-code patterns. Do NOT use for page-level rendering taxonomy (use rendering-models), the tool-call protocol cycle (use tool-call-flow), untrusted-content defenses (use prompt-injection-defense), or general component-library architecture (use design-system-architecture). Do NOT use for design the JSON shape of an HTTP API endpoint (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: frontend-engineering
  public: "true"
  subjects: "[\"frontend-engineering\",\"ai-engineering\"]"
  scope: "The pattern where a language model emits, as structured output, a description of UI components or a UI sub-tree that an application then renders — the typed-schema component palette, the structured-output mechanism (JSON Schema, function-calling) constraining emission to renderable specs, the two render substrates (typed-component-tree vs sandboxed-iframe HTML), the application-side render pipeline, the bidirectional interaction loop (postMessage/JSON-RPC) feeding user actions back into the next turn, the model-author/application-renderer security boundary, and the distinction from adjacent patterns (chat-with-markdown, prebuilt-widget routing, RSC streaming, model-emits-code). Portable across any LLM application that renders model-described UI; principle-grounded, not repo-bound. Excludes the page-level rendering taxonomy (rendering-models), the tool-call protocol cycle (tool-call-flow), the untrusted-content trust boundary (prompt-injection-defense), and general component-library architecture (design-system-architecture)."
  grounding: "{\"subject_matter\":\"Portable generative UI architecture for LLM applications: typed component palettes, structured output/tool-call constraints, render pipelines, interaction loops, render-substrate safety models, and renderer security boundaries\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/structured-outputs\",\"https://developers.openai.com/api/docs/guides/function-calling\",\"https://developers.openai.com/apps-sdk/reference\",\"https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/\",\"https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx\",\"https://a2ui.org/introduction/what-is-a2ui/\",\"https://a2ui.org/concepts/catalogs/\",\"https://a2ui.org/concepts/data-binding/\",\"https://github.com/google/A2UI\",\"https://docs.ag-ui.com/introduction\",\"https://docs.ag-ui.com/concepts/events\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming\",\"https://ai.google.dev/gemini-api/docs/structured-output\",\"https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces\",\"https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui\",\"https://docs.langchain.com/oss/python/langchain/structured-output\",\"https://docs.langchain.com/oss/python/langchain/frontend/structured-output\",\"https://json-schema.org/draft/2020-12/json-schema-core\",\"https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md\",\"https://www.nngroup.com/articles/generative-ui/\"],\"failure_modes\":[\"treating_valid_json_as_schema_adherence\",\"using_non_strict_tool_calling_as_a_production_render_contract\",\"letting_partial_streaming_output_render_or_execute_as_final_ui\",\"confusing_tool_result_to_component_binding_with_open_ended_component_tree_generation\",\"conflating_typed_component_tree_safety_by_restriction_with_sandboxed_iframe_safety_by_isolation\",\"treating_AG_UI_or_MCP_discovery_as_a_generation_constraint\",\"treating_RSC_streamUI_as_the_current_vercel_production_default\",\"rendering_model_authored_markup_or_external_resources_without_allowlists_CSP_and_component_policy\",\"surfacing_raw_chain_of_thought_or_reasoning_tokens_as_user_facing_UI\",\"letting_click_events_auto_execute_destructive_actions\",\"omitting_accessible_fallbacks_and_plain_text_equivalents_for_rich_components\",\"letting_provider_specific_schema_subsets_leak_into_a_portable_component_palette_without_compatibility_checks\"],\"evidence_priority\":\"equal\"}"
  taxonomy_domain: agent/ui
  stability: experimental
  keywords: "[\"generative UI\",\"generative interface\",\"structured output\",\"component schema\",\"typed UI spec\",\"JSON Schema\",\"function calling UI\",\"MCP Apps\",\"model-rendered components\",\"assistant UI\"]"
  triggers: "[\"the assistant should show a chart not a paragraph\",\"how does the model render a card\",\"structured output for UI\",\"is it safe to render what the model returned\",\"should this be a tool call or a UI emission\",\"render model UI in a sandboxed iframe\"]"
  examples: "[\"design the component schema for an assistant that can render a date picker, a chart, or a confirmation card depending on the question\",\"decide whether the model should emit a UI spec or call a tool that returns prerendered HTML\",\"explain why the model's output must be schema-validated before rendering\",\"design the interaction loop so a user clicking a button in a model-rendered card produces a follow-up turn the model can reason about\",\"decide between a typed-component palette and a sandboxed-iframe (MCP Apps / Apps SDK) render substrate\"]"
  anti_examples: "[\"design the JSON shape of an HTTP API endpoint (use api-design)\",\"decide the page-level rendering model (CSR vs SSR vs RSC) (use rendering-models)\",\"design the design-system component library itself (use design-system-architecture)\"]"
  relations: "{\"related\":[\"tool-call-flow\",\"rendering-models\",\"client-server-boundary\",\"prompt-injection-defense\",\"api-design\",\"type-safety\"],\"boundary\":[{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the page-level rendering taxonomy (CSR/SSR/SSG/RSC/streaming); this skill owns the model→spec→component pipeline that operates inside any of those rendering models. They compose.\"},{\"skill\":\"design-system-architecture\",\"reason\":\"design-system-architecture owns the component library and its tokens; this skill consumes a design system as the component palette the model can draw from.\"}],\"verify_with\":[\"api-design\",\"type-safety\",\"prompt-injection-defense\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Generative UI is to a model-rendered interface what a building's framework is to a tenant's customization — the architect (application) lays the structural floor plan, frames the walls, and provides a catalog of approved fixtures (component palette) plus sealed pre-fab rooms the tenant may install but not rewire (sandboxed iframes); the tenant (model) picks which fixtures and rooms to install where for this particular layout, but cannot punch new holes in load-bearing walls or wire fixtures that don't exist in the catalog. The freedom is in the composition; the safety is in the structure (restriction) or in the sealed room (isolation)."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/generative-ui/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1082"
  skill_graph_export_description_projection: anti_examples
---

# Generative UI

## Concept of the skill

Generative UI is the pattern in which a language model emits — as structured output constrained by a typed schema — a *specification* of a UI component or sub-tree that an application then renders for the user. The load-bearing distinction is that the model's output is neither a chat response, nor a tool call asking for execution, nor raw markup it freely authors: it is a typed instance of a component-vocabulary schema, plus the data to populate it. Three contracts must hold simultaneously for the pattern to work — the **component schema** (the typed vocabulary the model and application share), the **generation constraint** (the mechanism that forces the model's emission to be a valid schema instance — provider-native structured output or strict tool calling, not best-effort function calls), and the **render pipeline** (the application code that turns a validated spec into pixels). Rendering happens through one of two legitimate substrates that differ in where safety comes from: a *typed-component-tree* where safety is by **restriction** (the model can only name components in the published vocabulary; no HTML executes), or a *sandboxed-iframe* where safety is by **isolation plus host mediation** (a developer-authored HTML resource runs in a sandbox that cannot reach the parent DOM, fed the model's data over a postMessage/JSON-RPC bridge). The invariant across both is that the model never authors raw HTML injected into the host DOM — it authors a typed selection and data. The application owns rendering, the interaction layer, and visual design; the model owns the choice of which components to compose and with what data. A bidirectional interaction loop closes the cycle: a user action on a rendered component becomes a typed event the application encodes as the next turn the model reasons about, with destructive effects gated as separate, user-identity-authorized tool calls rather than auto-executed from a click.

## Coverage

The pattern where a language model emits or selects, as structured output constrained by a typed schema, a specification of a UI component or sub-tree that an application then renders for the user. Covers the three load-bearing contracts (component schema, generation constraint, render pipeline), the implementation variants (direct UI-spec generation, tool-result-to-component binding, hosted-widget bridge, RSC/component-streaming transport), component-palette design rules (semantic discriminated-union types, bounded props, versioning/migration, fallback representation, provider schema-compatibility testing), the two render substrates (typed-component-tree vs sandboxed-iframe HTML), streaming discipline (partial specs drive provisional UI only; final render waits for completed validation), the bidirectional interaction loop (postMessage/JSON-RPC) that closes the cycle from user action back into the model's next turn — including stable per-instance ids for multi-component disambiguation and per-control state-update rules, the UI lifecycle and human-in-the-loop states (idle/thinking/streaming/finalization; propose-edit, gated action, verification loop), the hosted-widget data-channel split (`structuredContent`/`content` visible to the model vs `_meta` component-only) and per-widget domain/CSP policy, the trust boundary that makes the rendering safe under adversarial input, the taxonomy by palette openness / generation mechanism / render substrate / interactivity / trust posture, the 2025–2026 protocol standardization (MCP Apps, OpenAI Apps SDK, MCP-UI, A2UI, AG-UI), and the distinction from adjacent patterns (chat with markdown, tool-call protocol mechanics, prebuilt-widget routing, RSC streaming / AG-UI as transport, AI-assisted design/codegen, model-emits-code which is something else).

## Philosophy of the skill

The conventional model-to-user pipeline is: model emits text; user reads text. Generative UI inverts this: model emits a typed component specification; application renders the specification; user sees a UI surface authored by the application's design system but composed by the model.

This indirection is what makes the pattern simultaneously safe and expressive. Safe, because the application owns the rendering — the model can only ask the application to render components/resources the application has chosen to expose, with data the schema permits, and where HTML executes at all it executes inside a sandbox the model cannot escape. Expressive, because the model can compose components, choose presentations per response, and adapt to the question at hand without the developer pre-building every variant.

The discipline is in the three contracts. The schema must be small enough to be a coherent design vocabulary but expressive enough to cover the assistant's responses. The generation constraint must be reliable enough that the model's emission is always renderable. The render pipeline must enforce validation, design-system compliance, and security policies — by *restriction* (typed component tree) or by *isolation* (sandboxed iframe) — independently of what the model intended. When all three hold, generative UI lets a language model author the choice of what to show without ever injecting raw markup into the rendering surface.

The practical discipline is to keep three decisions separate. The model may decide *what representation is appropriate* for this turn. The application decides *which component vocabulary exists and what each component means*. The renderer decides *whether a concrete emitted instance is safe, valid, accessible, and renderable*. Collapsing those roles is where the pattern fails: if the model gets to invent components, it has escaped the palette; if schema validity is treated as authorization, unsafe URLs and overlong content still reach the UI; if a click is treated as execution permission, an injected or mistaken UI can trigger real side effects.

## The Three Load-Bearing Contracts

| Contract | Owner | Defines | Failure mode if absent |
|---|---|---|---|
| Component schema | Application developer | The typed vocabulary the model may emit and the application will render | Model emits unrenderable specs; design inconsistency |
| Generation constraint | Model + API | The mechanism that forces the model's output to be a valid schema instance | Specs fail validation; retry loops; production flake |
| Render pipeline | Application | The code that turns a validated spec into pixels with design-system and security policies enforced | Model output reaches the DOM unchecked; security and design break |

## Implementation Variants

Generative UI ships in several shapes. They share the renderer discipline but differ in *what the model emits* and *what binds it to a component* — keep them distinct so a tool-result rendering is not mislabeled open-ended generation.

| Variant | What the model emits | What the app renders | Use when | Main risk |
|---|---|---|---|---|
| Direct UI-spec generation | A discriminated-union instance such as `{ "type": "chart", "props": … }`, A2UI JSON messages, or another declarative UI spec over a known catalog | A component registry maps `type`/`component` to application components | The answer shape is open-ended and the model should choose among several presentations | Schema too broad; recursive trees or unsafe props become hard to govern |
| Tool-result component binding | A tool call plus a typed tool result; the UI maps tool name/result to a component | A fixed component per tool or result type | The UI is a rich rendering of external data fetched by a tool | Mislabeling this as open-ended generative UI; the model chose the tool, not the component tree |
| Hosted-widget bridge | A tool descriptor declares an output schema plus a UI resource; result `structuredContent`/`content` feeds model and component, private `_meta` hydrates only the component | A sandboxed/iframe widget or host-provided component | Building inside a host such as ChatGPT Apps / MCP Apps | Assuming host sandboxing removes the need for schema, CSP, origin, and action policy |
| RSC/component-streaming transport | A tool/function call, structured selection, or tool result the framework maps into RSC payloads or UIMessage parts | Framework-managed React components | Low-latency rich chat UI in React/Next.js | Treating transport as the concept; experimental RSC APIs may not be production defaults |

The first variant is the cleanest expression of this skill. The others are common industry implementations that use the same renderer discipline, but they should not blur the boundary: tool-call-flow owns the call/result protocol, rendering-models owns the delivery model, and this skill owns the model-to-renderer UI contract.

## Generation Mechanisms Compared

| Mechanism | How it works | Production stance | Watchouts |
|---|---|---|---|
| Provider-native structured output | The API constrains the final answer to a JSON Schema or schema-like response format (logits masked at decode so only schema-valid tokens emit) | Strong default for direct UI-spec generation when the provider supports the needed schema subset | Every provider supports only a subset; keep the palette shallow, explicit, and compatibility-tested |
| Strict function/tool calling | The model emits a tool/function call whose arguments are schema-constrained, often through grammar-constrained sampling (`strict: true`) | Strong default when a UI component is represented as a tool, or when a tool result drives the component | Non-strict, best-effort tool calling is *not* a reliable render contract — require strict/schema-enforced mode where available |
| Framework strategy layer | A framework picks provider-native structured output when possible and falls back to a tool-calling strategy (e.g. LangChain ProviderStrategy/ToolStrategy) | Useful portability layer across providers | The framework does not remove the renderer contract; validation, fallback, and safety policy remain application work |
| Streaming structured output | Partial JSON / UIMessage / tool-argument deltas arrive before the final object completes | Useful for skeletons, progress, and perceived latency | Partial output is not final authority; render provisional UI only and commit after the completed object/spec validates |
| Free-form JSON / JSON mode + post-validation | The model is asked to emit JSON and the app validates/retries | Prototype fallback only | Valid JSON is not schema adherence; retries add latency and production variance |

Production-grade generative UI uses provider-native structured output (OpenAI Structured Outputs, Gemini response schema, Anthropic strict tool use) or strict function/tool calling for the generation-constraint contract. "Function calling" by itself is too broad: a best-effort function call that can omit required fields or invent argument shapes is not a reliable render contract.

## Component Palette Design

The component palette is the model-facing API of the UI system. Design it like a public contract, not like an internal React prop bag. A few rules separate a palette that survives production from one that produces constant validation failures and breaking changes:

- **Model the palette as a discriminated union, not a grab-bag object.** A single `type`/`kind` discriminator with a per-variant prop shape is what lets both the generation constraint and the render pipeline's component-lookup step be exhaustive and type-checked. An open object with optional everything pushes validation to runtime and invites ambiguous specs.
- **Keep component types semantic.** `comparison_table`, `confirmation_card`, `date_range_picker`, `line_chart` — not `blue_card` or `two_column_div`. The model reasons about meaning, not layout.
- **Keep props bounded and shallow.** Constrain enums, set `minLength`/`maxLength` and numeric bounds, allowed URL origins, allowed MIME types, finite nesting depth, and explicit nullability; prefer a shallow tree to deep recursion. Provider structured-output engines impose real limits — OpenAI Structured Outputs and Gemini response schemas cap total schema size, nesting depth, and property counts, and silently degrade or reject schemas that exceed them — so an unbounded palette can become un-emittable on a given model. Deeply nested schemas are also harder to generate, stream progressively, and migrate.
- **Version the palette and plan migration.** Carry a schema/palette version and treat a prop change as an API change: additive (new optional prop, new union variant) is safe; renaming or removing a variant is breaking. Persisted UI specs must either carry the palette version they were generated against or be treated as non-replayable after palette changes. Pin the version the renderer understands so a newer model emitting a newer variant degrades predictably instead of crashing.
- **Define an explicit fallback representation.** For every component, specify what the renderer shows when a spec is unknown, fails validation, or names a variant this renderer version does not ship (e.g. a `plain_text` summary, `aria_label`, `table_data`, or a generic card). "Unknown spec" must be a designed state, not a thrown exception reaching the user — and the fallback is also the accessibility/degradation path when the rich renderer is unavailable.
- **Give every interactive component a stable `component_id` or action target** so events can be correlated with the rendered instance (see The Interaction Loop).
- **Do not leak implementation details.** The model should not choose CSS classes, Tailwind strings, DOM structure, raw JSX, arbitrary component imports, or framework-specific props unless those are intentionally part of the published palette.
- **Test provider schema compatibility in CI.** Each target provider/model accepts a slightly different JSON Schema dialect and subset (required-ness handling, `$ref`/`anyOf` support, format keywords). Add a test that submits the palette schema to every provider you ship on and asserts it is accepted and round-trips, so a schema edit one provider rejects is caught before release, not in production.

## Two Render Substrates: Typed-Component-Tree vs Sandboxed-Iframe

A validated spec must be turned into pixels by *some* substrate. There are two legitimate ones, distinguished by **where the safety comes from**. Conflating them — or believing only one is "real" generative UI — is the most common 2026-era confusion.

| Property | Typed-component-tree | Sandboxed-iframe |
|---|---|---|
| What renders | The app's own registered components, selected by the spec's `type` discriminator | A developer-authored HTML/JS UI resource loaded into a sandboxed `<iframe>` |
| Safety comes from | **Restriction** — the model can only name components in the published vocabulary; no HTML is executed | **Isolation + host mediation** — the iframe sandbox blocks access to parent DOM, cookies, storage; HTML/JS runs but cannot escape, and the host enforces CSP/domain policy |
| Who authors the markup | Nobody emits markup; the app maps spec → component | The *developer* authors the HTML resource once; the model never writes it |
| What the model authors | A typed selection + data | A tool call that selects a UI resource + the data pushed into it |
| Interaction transport | App event-routing layer appends the action as a user-role turn (a `tool_result` or app-defined structured block — no standard provider `ui_event` content type exists) | postMessage / JSON-RPC bridge (`ui/`-prefixed methods) between iframe and host |
| Canonical implementations | A2UI (declarative JSON over a trusted client-held catalog), bespoke React/Vue component registries, Vercel AI SDK RSC `streamUI` (now paused — see vendor table) | MCP Apps (official MCP extension, 2026-01-26), OpenAI Apps SDK, MCP-UI |
| Best for | Tight design-system fidelity; small, well-known palettes; no third-party code | Rich/interactive apps (maps, dashboards, 3D, media viewers); third-party servers the host does not fully trust |

The shared invariant across both: **the model never authors raw HTML injected into the host DOM.** In the typed-component substrate it emits a typed spec; in the iframe substrate it emits a tool call that selects a *pre-authored* resource and supplies data. Unsandboxed model-emits-HTML-into-the-host-page is neither substrate — it is the dangerous anti-pattern both exist to avoid.

**A2UI deserves first-class treatment in the typed-component-tree substrate.** It is an open-source/open-standard public-preview example where the agent sends declarative JSON messages, the client renders native components from a *trusted catalog*, and data binding uses JSON-Pointer paths into application state. That makes A2UI a strong example of safety-by-vocabulary-restriction: expressive like UI, but still *data interpreted by trusted renderer code* rather than model-authored HTML/JSX/CSS/JS. Label its maturity clearly — A2UI is useful current evidence, but its public-preview versions and catalogs can still evolve.

**AG-UI is not a third render substrate.** It is an agent-to-frontend *event transport* that can carry message events, tool-lifecycle events (start → progress → finish), state snapshots/deltas, interrupts, and generative-UI specs such as A2UI — but it does not itself render. MCP discovery is likewise not a generation constraint. Keep *generation constraint*, *render substrate*, and *event transport* named separately.

## The Render Pipeline

A schema-validated spec is the *input* to the render pipeline, not permission to render. For the **typed-component substrate** the pipeline performs:

1. **Parse and schema validation.** Parse untrusted model output and validate it against the published JSON Schema or TypeScript type for the component vocabulary. Reject (and either retry or fall back) anything that doesn't match.
2. **Normalize and migrate.** Convert provider-specific shapes into the app's canonical UI-spec version; migrate older persisted specs, or refuse replay when no migration exists.
3. **Component lookup.** Map the spec's `type` discriminator to the application's registered component implementation. A spec asking for a component the application doesn't ship is a routing error, not permission to render arbitrary content.
4. **Props validation.** Validate props against the component's runtime schema independently of the static type — defense in depth against schema drift and untrusted runtime values.
5. **Safety policy.** For every prop that could be a security boundary — image URLs, link targets, embedded content, HTML strings — apply per-component policy: origin allowlists, `img-src`/`connect-src`/frame policy, URL/link sanitization, length caps, MIME checks, recursion-depth limits, external-resource controls. The schema describes structure; the safety policy describes acceptable content.
6. **Accessibility and fallback policy.** Confirm the target component implementation owns keyboard behavior, focus management, ARIA semantics, labels, reduced-motion behavior, and a fallback rendering for unsupported or inaccessible rich output.
7. **Recursive render.** Render the component with the validated props; for nested components in props, recurse *through the same pipeline*, to finite depth.
8. **Interaction wiring.** Wire interactive elements (buttons, inputs) to the application's event-routing layer, which encodes user actions as structured events the model can read in its next turn.
9. **Telemetry and fallback.** Log validation failures, unknown component types, safety-policy denials, and fallback usage so the palette and evals can improve.

For the **sandboxed-iframe substrate** the pipeline is different in shape but identical in intent: fetch the declared `ui://` resource (HTML+JS+CSS), render it in a sandboxed `<iframe>` whose permissions and content-security-policy the host controls (e.g. `_meta.ui.csp`, `_meta.ui.permissions` in MCP Apps), push the model's tool-result data into the iframe over the postMessage bridge, and proxy any tool calls the iframe requests back through the host's authorization. In both substrates the model's "intent" does not authorize anything; the pipeline (restriction) or the sandbox + host mediation (isolation) does.

If a provider or agent framework exposes reasoning, thinking, traces, or activity events, **do not pipe raw chain-of-thought or private reasoning tokens into the generated UI as content.** The UI may show sanitized progress labels, tool/activity traces, or collapsible status events when the product needs latency feedback, but the render contract remains the completed, validated UI spec or tool result.

### The hosted-widget data channel (iframe substrate)

A tool result that drives a hosted widget is not one undifferentiated blob — it has *three audiences*, and conflating them leaks data or starves the component. In the OpenAI Apps SDK / MCP Apps shape:

| Channel | Visible to | Use for |
|---|---|---|
| `structuredContent` | Model **and** the component | The data the model should reason about in its next turn *and* the component needs to render (e.g. the list of search results behind a results card) |
| `content` | Model **and** the component | The natural-language/text portion the model reads as the tool's textual result |
| `_meta` | The **component only** — never enters the model's context | Render-only payload the model neither needs nor should pay tokens for, and data you do not want influencing the model (full result sets, pagination cursors, presentation hints) |

Two rules fall out of the split: (1) put in `_meta` anything the component needs but the model should not see or be steered by — it is the lever that keeps a large render payload out of the context window and keeps untrusted bulk data from reaching the model; (2) anything the *model* must reason about in the next turn has to live in `structuredContent`/`content`, because `_meta` is invisible to it. Hidden-from-the-model data can still be visible to the component and browser environment — protect it according to the component's threat model. The host also enforces a **per-widget domain/CSP policy** (declared resource origins, allowed `connect-src`/`frame-src`): a widget may only load and call out to origins the host has allowlisted, so a compromised or malicious resource cannot exfiltrate to an arbitrary endpoint. UI-to-host messages travel through a declared bridge (JSON-RPC over postMessage); every callable method needs schema validation, origin/trust labeling, logging, and user-consent policy where appropriate. The data-channel split and the domain policy together are why the iframe substrate can host third-party, not-fully-trusted UI without handing it the model's context or the open network.

## Streaming Discipline

A spec usually arrives incrementally — partial JSON, partial tool-call arguments, or streamed UI deltas (Anthropic fine-grained tool streaming, the AI SDK `experimental_output` / partial-object stream, Gemini partial structured responses). Partial output is a *latency* affordance, not a render authorization. The discipline:

- **A partial spec may drive only provisional UI** — a skeleton, a loading placeholder, or an optimistic shell keyed off the discriminator once it is known. It must be visibly non-final.
- **Final rendering waits for completed validation.** The full spec must arrive, parse, and pass the same schema + props + safety-policy validation as the non-streamed path before any committed, interactive, or side-effecting component is mounted. Rendering off half-parsed JSON risks XSS through an un-sanitized prop, mounting a destructive action before its guard fields exist, or flicker/remount when the tail of the stream changes an earlier field.
- **Never wire interaction to a provisional render.** Buttons and inputs become live only after validation completes — a click on an optimistic shell has no validated action shape to encode.

The same rule holds in the iframe substrate: stream the model's data into the iframe as it arrives if the resource is built for it, but the host gates committed tool calls on completed, validated payloads, not on partial deltas.

## The Interaction Loop

For interactive generative UI, every interactive component needs five definitions:

| Definition | Example for a Confirm button | Why it matters |
|---|---|---|
| Instance identity | `{ component_id: "confirm-17" }` | A response that renders several of the same component needs each event to identify *which* rendered instance the user acted on |
| Action shape | `{ kind: "confirm", component_id: "confirm-17", accepted: true }` | The model receives a typed event in the next turn, not an ambiguous natural-language click |
| History encoding | A user-role turn carrying the action — e.g. a `tool_result` block keyed to the originating tool-use, or an application-defined structured content block. There is **no** standard provider `ui_event` content type; an `{ type: 'ui_event', … }` shape is an application convention, not a wire format. The MCP Apps dialect instead carries it as a `ui/`-prefixed JSON-RPC message over postMessage | The model reads it the same way it reads any other turn |
| Side-effect policy | Confirming requires an additional tool call gated by user identity, never auto-executed from the click | The click is a user signal, not authorization for the destructive operation |
| State-update rule | The component declares whether it is optimistic, disabled-while-pending, or waits for model/tool confirmation | The UI remains coherent while the next model/tool turn runs |

**Instance identity.** A response that renders several interactive components (three confirm cards, a list of editable rows) needs each emitted event to carry a stable per-instance id (`component_id`) so the model can correlate the event to the right rendered instance and the data that produced it. Without it, multi-component responses produce ambiguous events the model cannot route.

A generative UI with interactive components but no interaction-loop definition is one-way: the user clicks and nothing happens. A generative UI that auto-executes destructive actions on click is a prompt-injection-defense failure waiting to happen. The middle path — click produces a structured event the model reasons about, the model emits a tool call that goes through normal authorization, idempotency, and audit controls — is the discipline.

**Host-mediated capability delegation.** In the protocol-standardized world (MCP Apps, OpenAI Apps SDK), the embedded UI does not act on the world directly. It requests an *outcome* ("schedule this meeting", "send this email") and the **host** routes it through capabilities the user has already connected, subject to user consent. This is the same discipline at the protocol layer: the rendered surface emits a request, the trusted host applies authorization, and side effects happen only through gated, user-consented paths — never because a button was clicked inside a model-influenced surface.

## UI Lifecycle And Human-In-The-Loop States

A generative-UI surface is not a single render — it moves through a *lifecycle*, and with reasoning models the latency between "user asked" and "UI is final" is long enough that each phase needs its own designed state. Event-transport protocols (AG-UI's run/message/tool-lifecycle/state events) exist precisely to carry these phase transitions to the frontend. The phases:

| Phase | What the surface shows | Contract rule |
|---|---|---|
| **Idle / input** | The affordance to ask, empty states, suggested starters, or the last settled result | Do not pre-render a component that implies model certainty before the model commits to a representation |
| **Thinking / progress** | A non-final working indicator — reasoning/tool-call progress, status text, partial plan | Show sanitized progress labels or tool/activity events; **do not expose raw chain-of-thought or private reasoning tokens** as user-facing UI content |
| **Streaming / provisional** | Skeletons and optimistic shells keyed off the discriminator (see Streaming Discipline) — visibly non-final, interaction not yet wired | Treat deltas as provisional; no final commit or side-effect affordance until completed validation passes |
| **Revision / finalization** | The validated, interactive render; earlier provisional UI is replaced, not appended | Encode user edits/approvals as typed events; state-changing work still goes through authorized tool/server actions |

On top of the phases sit three **human-in-the-loop (HITL)** patterns, each a different answer to "who commits?":

- **Propose-edit.** The model proposes a populated surface (a drafted email, a filled form, a diff, an itinerary, a configuration); the user edits fields in place and approves. The model's output is a *starting point*, not a committed action — the edited values, not the proposed ones, flow back as the action event.
- **Gated action.** A rendered control whose effect is withheld until explicit user confirmation. The click produces the structured event; the destructive/external effect is a *separate*, user-identity-gated tool call (this is the side-effect policy of the interaction loop, surfaced as a UI state).
- **Verification loop.** The model emits a result, the user reviews and accepts/rejects/annotates, and the rejection or annotation is encoded back as a turn the model reasons about — turning a one-shot render into an iterative, user-supervised refinement.

The unifying rule across phases and HITL patterns: **a non-final state must be visibly non-final and must not be wired to side effects.** Provisional UI that looks committed, or a proposed action that fires before the user approves, is the lifecycle-level form of the same failure the interaction loop guards against at the event level.

## Upstream Displacement Check

Current upstream state does not make this skill obsolete. It changes which implementations are the best examples:

- OpenAI's current API framing is Responses-API structured output / function calling plus Apps SDK widgets — not new work on the older Assistants API as the canonical path.
- MCP Apps is now a portable hosted-widget *standard* (official 2026-01-26 extension: `ui://` resources, tool linkage, sandboxed iframes, JSON-RPC/postMessage), not just a vendor-local trick.
- A2UI is a current public-preview/open-standard example of the typed-component-tree substrate (declarative JSON over trusted catalogs, JSON-Pointer data binding, native rendering).
- AG-UI is useful context for evented agent/frontend interaction and HITL flows, but it is a *transport*, not a generation mechanism and not a renderer.
- Anthropic now documents strict tool use as grammar-constrained schema adherence; non-strict tool use should not be used as the production render contract.
- Vercel's current production path is AI SDK UI generative interfaces (UIMessage/tool parts); AI SDK RSC `streamUI` remains a useful example but Vercel's own docs call RSC experimental and recommend AI SDK UI for production.

The durable rule: prefer the strongest provider-native or strict-tool mechanism available, but keep the portable renderer contract independent of any one vendor — the pattern predates and outlives any single implementation.

## Vendor And Framework Examples

| Implementation | Provided by | Substrate / mechanism | Status (2026) |
|---|---|---|---|
| Structured Outputs (`text.format` / `response_format`) | OpenAI | Provider-native schema-constrained final output (grammar-constrained decoding against JSON Schema) | Current — strong for direct UI-spec generation; prefer over JSON mode |
| Responses-API function tools with `strict: true` | OpenAI | Strict JSON-Schema function-call arguments | Current — strong for component-as-tool or tool-result binding |
| OpenAI Apps SDK (`window.openai`, `apps-sdk-ui`) | OpenAI | Sandboxed-iframe components over MCP; host bridge for `toolInput`/`toolOutput`/`setWidgetState`/`callTool`/`requestDisplayMode`; inline-card/carousel/fullscreen display modes; transcript-visible data vs component-only `_meta` split | Current — still requires CSP, origin, and action policy; prefer the `ui/*` MCP-Apps bridge methods over legacy `window.openai`-only calls where both exist |
| MCP Apps (`@modelcontextprotocol/ext-apps`) | Model Context Protocol | Sandboxed-iframe HTML resource (`ui://`) + postMessage/JSON-RPC bridge; CSP/domain policy | First official MCP extension, ratified 2026-01-26; launch blog names ChatGPT, Claude, Goose, and VS Code as clients (MCP-UI adopters such as Postman/Shopify are a broader, separate set — do not conflate) |
| MCP-UI (`@mcp-ui/client`) | MCP-UI community / Shopify et al. | Three render modes: raw HTML, external URL, remote-DOM | Current — the rendering library behind many MCP Apps hosts; remote-DOM avoids iframe overhead but needs client-side component-library coordination |
| Anthropic strict tool use | Anthropic | Grammar-constrained schema adherence for tool inputs | Current — strong for schema-valid component/tool arguments |
| Anthropic fine-grained tool streaming | Anthropic | Streams tool-input deltas before buffering/validation | Current — latency feature; handle invalid/partial JSON and commit only after validation |
| Gemini response schema | Google | Response constrained to a JSON Schema subset | Current — strong for direct UI-spec generation; still validate semantic/business correctness in app code |
| A2UI | Google / A2UI project | Declarative JSON messages over a client-held component catalog, JSON-Pointer data binding, native renderer mapping | Current public-preview / open standard — first-class typed-component-tree (restriction) substrate; label maturity clearly |
| AG-UI protocol + A2UI | CopilotKit (adopted by Google, LangChain, AWS, Microsoft, Mastra, PydanticAI) | Event-based agent↔frontend *transport* (message/tool-lifecycle/state events); carries generative-UI specs including A2UI | Current — transport, distinct from the rendering substrate; visualize traces/tool events, not raw chain-of-thought |
| AI SDK UI generative user interfaces | Vercel | Tool calls/results rendered as typed React UI parts (UIMessage/tool parts) | Current — Vercel's production-oriented recommendation |
| Vercel AI SDK RSC (`streamUI`) | Vercel | RSC streaming of components selected by function calling | **Paused / experimental — not for production.** Known failure modes: stream-completion flicker/remount, multiple-suspense-boundary crashes, `createStreamableUI` quadratic data transfer; migrate to AI SDK UI (`useChat`); the older `render` API is removed |
| LangChain structured + frontend structured output | LangChain | ProviderStrategy vs ToolStrategy; validated structured response mapped to UI with progressive rendering and fallbacks | Current — portability layer; renderer still owns validation, fallback, and safety |
| Generic JSON mode / OpenRouter-compatible JSON | Multiple | Free-form JSON with post-validation, falling back to retry | Current — prototype-grade; not a production render contract by itself |

Citing one vendor's API as the canonical pattern is a category error; the pattern predates and outlives any single implementation. The 2025–2026 center of gravity shifted toward MCP-based sandboxed-iframe apps (MCP Apps, OpenAI Apps SDK), open typed-component standards (A2UI), and event-transport protocols (AG-UI). Use whichever substrate + mechanism the chosen host and model support most reliably.

## Verification

After applying this skill, verify:
- [ ] The component palette is a published, typed schema (JSON Schema, TypeScript discriminated union, or equivalent) — or, in the iframe substrate, a registered set of `ui://` resources — not an informal convention.
- [ ] The palette is a discriminated union with semantic type names and bounded, shallow props; it stays within every target provider's structured-output size/depth limits, carries a version, and has a CI test asserting each provider accepts and round-trips it.
- [ ] Provider schema compatibility is tested against the actual model/API, not assumed from full JSON Schema; unsupported keywords are removed or replaced deliberately, and provider-specific subsets do not leak into a portable palette.
- [ ] Every component has an explicit fallback representation (plain-text/summary/aria) for unknown / validation-failed / newer-than-renderer specs, and for when accessibility requirements cannot be met — "unknown spec" is a designed state, not an uncaught exception reaching the user.
- [ ] The generation mechanism is provider-native structured output or strict/schema-enforced tool calling — not best-effort function calls and not free-form-with-retry in production.
- [ ] Streamed/partial specs drive only visibly-provisional UI (skeletons, placeholders); committed, interactive, or side-effecting components mount only after the full spec passes validation, and interaction is wired only post-validation.
- [ ] The render substrate is explicitly chosen (typed-component-tree vs sandboxed-iframe) and its safety basis named (restriction vs isolation).
- [ ] Every spec the model emits is parsed and validated against the schema by the render pipeline before any component is invoked — the model's emission alone does not authorize rendering.
- [ ] In the typed-component substrate, per-component safety policies are enforced: image URLs pass an origin allowlist; link targets are sanitized; content-length is bounded; nested specs terminate in finite depth.
- [ ] In the sandboxed-iframe substrate, the iframe sandbox blocks parent-DOM/cookie/storage access; the host controls the iframe's permissions and CSP/domain policy; external opens are allowlisted; tool calls the iframe requests are proxied through host authorization, not granted by the iframe.
- [ ] For hosted widgets, the tool result splits its audiences correctly: data the model must reason about is in `structuredContent`/`content`; render-only or bulk/untrusted data the model should not see (or pay tokens for) is in `_meta` (component-only).
- [ ] Raw chain-of-thought / private reasoning tokens are never piped into the UI as content; only sanitized progress labels or tool/activity traces are shown.
- [ ] Each lifecycle phase has a designed, visibly-non-final state (thinking/progress, streaming/provisional) distinct from the finalized render; the chosen HITL pattern (propose-edit, gated action, or verification loop) is explicit, and no non-final state is wired to a side effect.
- [ ] Every interactive component has a stable per-instance id, a defined action shape, a history encoding (a user-role `tool_result`/app-defined block, or a `ui/` postMessage; **not** a standard provider `ui_event` content type, which does not exist), a side-effect policy, and a state-update rule. Auto-executing destructive actions on rendered-component clicks is forbidden; capability delegation routes through the host with user consent.
- [ ] Tool-result-to-component binding is named as such when the model chose a tool rather than an arbitrary UI tree.
- [ ] The model never authors raw HTML injected into the host DOM. What it authors is a typed selection plus data — in the iframe substrate the HTML resource is developer-authored, not model-written.
- [ ] The pattern is used for open-ended assistant responses, not for known repeated workflows where traditional UI design is the better fit.
- [ ] Accessibility (keyboard navigation, ARIA roles, focus management) is the responsibility of the application's component implementations (or, in the iframe substrate, the embedded app) — generative UI does not produce accessible UI for free.
- [ ] Vendor examples in docs name their maturity: production-oriented, experimental, hosted-platform-specific, or prototype-only.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the page-level rendering model (CSR vs SSR vs RSC vs streaming) | `rendering-models` | rendering-models owns the page-rendering taxonomy; this skill operates inside any of those models |
| Designing the protocol cycle of a tool call | `tool-call-flow` | tool-call-flow owns the model↔runtime cycle; this skill owns the model→render-pipeline pattern (even when, as in MCP Apps, the UI resource is declared inside a tool) |
| Defending against attacker-controlled directives in model input | `prompt-injection-defense` | prompt-injection-defense owns the security property; this skill owns the rendering pattern that must preserve it |
| Designing the component library itself (tokens, primitives, composition) | `design-system-architecture` | design-system-architecture owns the library; this skill consumes it as the palette |
| Designing the JSON shape of an HTTP API endpoint | `api-design` | api-design owns the request/response surface; this skill owns the model-to-renderer schema |
| Evaluating model accuracy on a specific task | `eval-driven-development` | eval-driven-development owns measurement; this skill owns the pattern being evaluated |

## Key Sources

- Model Context Protocol. [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview), [MCP Apps Now Official (blog, 2026-01-26)](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/), and [MCP Apps specification 2026-01-26](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx). The first official MCP extension: tools declare a `ui://` resource, the host renders it in a sandboxed iframe, and the iframe communicates over a postMessage JSON-RPC dialect (`ui/` methods). Canonical reference for the sandboxed-iframe substrate, its isolation-based security model, and CSP/domain policy.
- OpenAI. [Apps SDK Reference](https://developers.openai.com/apps-sdk/reference) and [Introducing apps in ChatGPT and the new Apps SDK](https://openai.com/index/introducing-apps-in-chatgpt/). MCP-based apps that render UI components in a sandboxed iframe, bridged to the host via `window.openai` (`toolInput`/`toolOutput`/`setWidgetState`/`callTool`/`requestDisplayMode`); the `structuredContent`/`content`/`_meta` data-channel split. A production instance of the sandboxed-iframe substrate.
- OpenAI. [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs) and [Function calling](https://developers.openai.com/api/docs/guides/function-calling). Canonical reference for grammar-constrained decoding against JSON Schema and current Responses-API strict function calling — the primary generation-constraint mechanisms; distinguishes schema adherence from JSON mode.
- Google / A2UI project. [What is A2UI?](https://a2ui.org/introduction/what-is-a2ui/), [Catalogs](https://a2ui.org/concepts/catalogs/), [Data Binding](https://a2ui.org/concepts/data-binding/), [A2UI repository](https://github.com/google/A2UI), and [launch post](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/). Public-preview/open-standard typed-component-tree substrate: declarative JSON messages, trusted client catalogs, JSON-Pointer bindings, native renderer mapping rather than executable model-authored code.
- AG-UI Protocol. [docs.ag-ui.com](https://docs.ag-ui.com/introduction) and [Events](https://docs.ag-ui.com/concepts/events). Event-based agent↔frontend transport (message, tool-lifecycle, state-snapshot, interrupt events) adopted by Google, LangChain, AWS, Microsoft, Mastra, PydanticAI; carries generative-UI specs including A2UI. The transport layer beneath streamed generative UI, distinct from the rendering substrate; guidance to visualize traces/tool events rather than raw chain-of-thought.
- MCP-UI. [mcp-ui.dev guide](https://mcpui.dev/) and [github.com/MCP-UI-Org/mcp-ui](https://github.com/MCP-UI-Org/mcp-ui). The client library (`@mcp-ui/client`) behind many MCP Apps hosts; supports raw HTML, external URL, and remote-DOM render modes. See also [Shopify Engineering: MCP UI — breaking the text wall](https://shopify.engineering/mcp-ui-breaking-the-text-wall).
- Anthropic. [Tool use overview](https://docs.anthropic.com/en/docs/build-with-claude/tool-use), [Strict tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use), and [Fine-grained tool streaming](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming). Strict tool use is grammar-constrained schema adherence (a function-calling-style mechanism for typed UI specs); fine-grained streaming delivers tool-call arguments as deltas — the basis for streaming-discipline (provisional UI on partial specs, final render on completed validation).
- Google. [Gemini structured output / response schema documentation](https://ai.google.dev/gemini-api/docs/structured-output). Third-vendor implementation of the generation-constraint contract; supports streaming partial JSON but still requires app-side semantic validation.
- Vercel. [AI SDK UI: Generative User Interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) and [Migrating from AI SDK RSC to AI SDK UI](https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui). AI SDK UI (`useChat`, tool parts) is the current production recommendation; AI SDK RSC (`streamUI`) is paused/experimental — cited as drift evidence and a worked (now-superseded) implementation, not the pattern itself.
- LangChain. [Structured output](https://docs.langchain.com/oss/python/langchain/structured-output) and [Frontend structured output](https://docs.langchain.com/oss/python/langchain/frontend/structured-output). ProviderStrategy vs ToolStrategy portability framing and guidance for mapping typed structured output to custom UI with progressive rendering and fallbacks.
- JSON Schema. [Draft 2020-12 specification](https://json-schema.org/draft/2020-12/json-schema-core). The schema language commonly used to type the component palette.
- React Team. [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md). The architectural basis for streaming UI from server to client used by several generative-UI implementations.
- Nielsen Norman Group. [Generative UI and Outcome-Oriented Design](https://www.nngroup.com/articles/generative-ui/). Practitioner framing of where generative UI fits in the broader UX landscape.
- Schick, T., et al. (2023). ["Toolformer: Language Models Can Teach Themselves to Use Tools"](https://arxiv.org/abs/2302.04761). Background on the structured-emission research thread that enabled reliable typed model outputs.
- Karpathy, A. [LLM OS framing](https://twitter.com/karpathy/status/1723140519554105733). Conceptual framing in which generative UI is one of the rendering surfaces of an LLM-as-OS — useful for situating the pattern in a broader architecture.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering` (also: `ai-engineering`)
- Public: `true`
- Domain: `agent/ui`
- Scope: The pattern where a language model emits, as structured output, a description of UI components or a UI sub-tree that an application then renders — the typed-schema component palette, the structured-output mechanism (JSON Schema, function-calling) constraining emission to renderable specs, the two render substrates (typed-component-tree vs sandboxed-iframe HTML), the application-side render pipeline, the bidirectional interaction loop (postMessage/JSON-RPC) feeding user actions back into the next turn, the model-author/application-renderer security boundary, and the distinction from adjacent patterns (chat-with-markdown, prebuilt-widget routing, RSC streaming, model-emits-code). Portable across any LLM application that renders model-described UI; principle-grounded, not repo-bound. Excludes the page-level rendering taxonomy (rendering-models), the tool-call protocol cycle (tool-call-flow), the untrusted-content trust boundary (prompt-injection-defense), and general component-library architecture (design-system-architecture).

**When to use**
- design the component schema for an assistant that can render a date picker, a chart, or a confirmation card depending on the question
- decide whether the model should emit a UI spec or call a tool that returns prerendered HTML
- explain why the model's output must be schema-validated before rendering
- design the interaction loop so a user clicking a button in a model-rendered card produces a follow-up turn the model can reason about
- decide between a typed-component palette and a sandboxed-iframe (MCP Apps / Apps SDK) render substrate
- Triggers: `the assistant should show a chart not a paragraph`, `how does the model render a card`, `structured output for UI`, `is it safe to render what the model returned`, `should this be a tool call or a UI emission`, `render model UI in a sandboxed iframe`

**Not for**
- design the JSON shape of an HTTP API endpoint (use api-design)
- decide the page-level rendering model (CSR vs SSR vs RSC) (use rendering-models)
- design the design-system component library itself (use design-system-architecture)
- Owned by `rendering-models`: the page-level rendering taxonomy (CSR/SSR/SSG/RSC/streaming)
- Owned by `design-system-architecture`: the component library and its tokens

**Related skills**
- Verify with: `api-design`, `type-safety`, `prompt-injection-defense`
- Related: `tool-call-flow`, `rendering-models`, `client-server-boundary`, `prompt-injection-defense`, `api-design`, `type-safety`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Generative UI is to a model-rendered interface what a building's framework is to a tenant's customization — the architect (application) lays the structural floor plan, frames the walls, and provides a catalog of approved fixtures (component palette) plus sealed pre-fab rooms the tenant may install but not rewire (sandboxed iframes); the tenant (model) picks which fixtures and rooms to install where for this particular layout, but cannot punch new holes in load-bearing walls or wire fixtures that don't exist in the catalog. The freedom is in the composition; the safety is in the structure (restriction) or in the sealed room (isolation).
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.openai.com/api/docs/guides/structured-outputs`, `https://developers.openai.com/api/docs/guides/function-calling`, `https://developers.openai.com/apps-sdk/reference`, `https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/`, `https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx`, `https://a2ui.org/introduction/what-is-a2ui/`, `https://a2ui.org/concepts/catalogs/`, `https://a2ui.org/concepts/data-binding/`, `https://github.com/google/A2UI`, `https://docs.ag-ui.com/introduction`, `https://docs.ag-ui.com/concepts/events`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/strict-tool-use`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming`, `https://ai.google.dev/gemini-api/docs/structured-output`, `https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces`, `https://ai-sdk.dev/docs/ai-sdk-rsc/migrating-to-ui`, `https://docs.langchain.com/oss/python/langchain/structured-output`, `https://docs.langchain.com/oss/python/langchain/frontend/structured-output`, `https://json-schema.org/draft/2020-12/json-schema-core`, `https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md`, `https://www.nngroup.com/articles/generative-ui/`

**Keywords**
- `generative UI`, `generative interface`, `structured output`, `component schema`, `typed UI spec`, `JSON Schema`, `function calling UI`, `MCP Apps`, `model-rendered components`, `assistant UI`

<!-- skill-graph-context:end -->
