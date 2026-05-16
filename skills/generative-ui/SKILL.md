---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: generative-ui
description: "Use when reasoning about the pattern where a language model emits, as structured output, a description of UI components or a UI sub-tree that an application then renders for the user: the typed-schema component palette, the structured-output mechanism (JSON Schema, function-calling) that constrains emission to renderable specs, the application-side render pipeline that turns the spec into pixels, the interaction loop by which user actions on the rendered UI flow back into the next turn, the security boundary between model-author and application-renderer, and the difference between this and adjacent patterns (chat with markdown, prebuilt-widget routing, RSC streaming, model-emits-code). Do NOT use for the page-level rendering taxonomy (use rendering-models), the protocol cycle of tool calls (use tool-call-flow), the trust boundary against untrusted content (use prompt-injection-defense), or general component-library architecture (use design-system-architecture)."
version: 1.0.0
type: capability
category: agent
domain: agent/ui
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
  - generative UI
  - generative interface
  - structured output
  - component schema
  - typed UI spec
  - JSON Schema
  - function calling UI
  - RSC streaming UI
  - model-rendered components
  - assistant UI
  - chat UI components
  - widget palette
triggers:
  - "the assistant should show a chart not a paragraph"
  - "how does the model render a card"
  - "structured output for UI"
  - "is it safe to render what the model returned"
  - "should this be a tool call or a UI emission"
examples:
  - "design the component schema for an assistant that can render a date picker, a chart, or a confirmation card depending on the question"
  - "decide whether the model should emit a UI spec or call a tool that returns prerendered HTML"
  - "explain why the model's output must be schema-validated before rendering"
  - "design the interaction loop so a user clicking a button in a model-rendered card produces a follow-up turn the model can reason about"
anti_examples:
  - "design the JSON shape of an HTTP API endpoint (use api-design)"
  - "decide the page-level rendering model (CSR vs SSR vs RSC) (use rendering-models)"
  - "design the design-system component library itself (use design-system-architecture)"
relations:
  related:
    - tool-call-flow
    - rendering-models
    - client-server-boundary
    - prompt-injection-defense
    - api-design
    - type-safety
  boundary:
    - skill: tool-call-flow
      reason: "tool-call-flow owns the protocol cycle by which a model invokes external capabilities and receives results; this skill owns the pattern where the model's output is itself a UI specification rendered by the application. The two compose — a UI spec may be emitted via a tool-call-flow-shaped mechanism — but the conceptual surfaces differ."
    - skill: rendering-models
      reason: "rendering-models owns the page-level rendering taxonomy (CSR/SSR/SSG/RSC/streaming); this skill owns the model→spec→component pipeline that operates inside any of those rendering models. They compose."
    - skill: prompt-injection-defense
      reason: "prompt-injection-defense owns the security property that a system must preserve against attacker-controlled directives in model input; this skill owns the rendering pattern whose threat surface includes rendering attacker-influenced output. The two skills are read together for security analysis."
    - skill: api-design
      reason: "api-design owns the external HTTP request/response surface; this skill owns the model-to-renderer schema surface. Both are typed contracts, but between different actors."
    - skill: design-system-architecture
      reason: "design-system-architecture owns the component library and its tokens; this skill consumes a design system as the component palette the model can draw from."
  verify_with:
    - api-design
    - type-safety
    - prompt-injection-defense
concept:
  definition: "Generative UI is the pattern in which a language model emits, as structured output constrained by a typed schema, a specification of a UI component or sub-tree that an application then renders for the user. The model's output is not a chat response, not a tool call asking for execution, and not raw code — it is a typed instance of a component-vocabulary schema. The application owns the rendering, the interaction layer, and the visual design; the model owns the choice of which components to compose and with what data. The pattern depends on three contracts holding simultaneously: the schema (the typed component vocabulary the model and application share), the generation constraint (the model's emission is restricted to valid instances of the schema), and the render policy (the application renders only what the schema describes, with no escape to model-authored markup or code)."
  mental_model: |
    Five primitives structure generative-UI reasoning:

    1. **Component schema** — a typed vocabulary the model and application share. Each component in the palette has a name, a typed set of inputs (props), and a defined visual / interactive behavior on the application side. The schema is authored by the application developer, not by the model. Common encodings: a JSON Schema describing a discriminated union of component types; a function-calling tools list where each "function" is a component constructor; a TypeScript type the model is asked to emit. The schema is the contract; everything else is plumbing.

    2. **Generation constraint** — the mechanism that forces the model's emission to be a valid instance of the schema. Three current mechanisms: (a) structured output / JSON mode (OpenAI Structured Outputs, Anthropic JSON-shaped tool calls, Gemini response schema), which uses grammar-constrained decoding to guarantee schema validity; (b) function calling, which models each component constructor as a callable function whose arguments are the component props; (c) post-generation validation with retry on failure, the weakest of the three because it costs a retry round-trip when generation falls outside the schema. Modern systems use (a) or (b); legacy ones rely on (c).

    3. **Render pipeline** — the application code that consumes a schema-validated spec and produces actual UI. This is where the design system lives. The model emits `{ type: 'chart', kind: 'line', data: [...], x_axis: 'time', y_axis: 'revenue' }`; the render pipeline looks up the `chart` component in its registry, validates the props against the chart's TypeScript type, and renders the chart with the design system's chart implementation. The render pipeline never executes model-authored code, never injects model-authored markup into the DOM, never trusts the model to know how to draw a chart — it knows how to draw a chart and asks the model only which one to draw.

    4. **Interaction loop** — the channel by which user actions on the rendered UI flow back into the model's next turn. A user clicking "Confirm" on a model-rendered confirmation card must produce a message the model can read in its next prompt: typically a structured event (the rendered component name, the action taken, any captured input data) encoded into the conversation history. Without this loop, generative UI is one-way (the model shows; the user reads); with it, generative UI is interactive (the user acts; the model responds). The loop's encoding is part of the schema design — every interactive component needs a defined action shape.

    5. **Trust boundary** — every spec the model emits must be treated as untrusted until the render pipeline has validated it against the schema and applied any additional safety policies (origin allowlist for image URLs, link target sanitization, content-length caps, recursion depth limits). The model can be tricked into emitting hostile specs by indirect prompt injection (a retrieved document, a tool result, an attached file); the rendering pipeline is the boundary that must prevent the trickery from translating to harmful render output. This connects generative UI directly to the prompt-injection-defense discipline.

    The deep insight is that generative UI inverts the conventional model→text→user pipeline. In conventional chat, the model emits text and the user reads it. In generative UI, the model emits a typed component specification and the application *re-emits* the rendered component to the user. The model is no longer authoring what the user sees; it is authoring what the application asks itself to show. This indirection is what makes the pattern safe (the application enforces design and security) and what makes it expressive (the model's planning is about structure, not pixels).
  purpose: |
    Generative UI exists because three problems with plain-text chat become unsolvable as the assistant takes on more tasks.

    **Information density.** A line chart shows a trend; a paragraph describes the trend in words. The chart is denser, faster to parse, and more accurate for quantitative information. For any output where the data has structure, plain-text is a lossy encoding. Generative UI lets the model choose the appropriate visual form per response — chart for a trend, table for tabular data, card for a single record, confirmation dialog for a destructive operation — without the developer pre-committing to one shape.

    **Interactivity.** A plain-text response is read; a UI component can be interacted with. An assistant that responds with "would you like to confirm this purchase? Type yes or no" produces text the user must read, parse, and reply to. An assistant that emits a confirmation card with Confirm and Cancel buttons makes the action one click. Generative UI is what lets an assistant be a UI surface, not a text channel.

    **Adaptive presentation.** Different responses call for different presentations. A search result for a single restaurant calls for a card with name, hours, and a map. A search result for ten restaurants calls for a list. A search result for "what's open right now" calls for a filterable, sorted view. With generative UI, the model picks the presentation per turn from the available palette; without it, the developer must pre-build every variant and route the model through them, which collapses back to traditional routing-by-intent.

    The cost is design discipline. The application must publish a component palette that is small enough to be a coherent design system but expressive enough to cover the responses the assistant should produce. Too small a palette and the model falls back to plain text for anything that doesn't fit; too large a palette and the model picks inconsistently across runs. The discipline of generative UI is largely the discipline of palette curation: which components, with what props, what interaction contracts, and how does the model know when to pick each.

    The other cost is the rendering trust boundary. A model that emits a UI spec can be tricked into emitting a hostile spec by attacker-controlled content in its input (an indirect prompt injection vector). The rendering pipeline's schema validation, origin allowlists, and policy enforcement are the load-bearing security layer; the model is not the boundary.
  boundary: |
    **Generative UI is not the model emitting HTML or code.** A model that emits raw HTML, raw React, or raw any markup language asks the application to execute model-authored content; this is approximately the worst security posture available, equivalent to running attacker-controlled code. Generative UI emits a *typed specification*, not markup. The application owns the markup; the spec is the choice of which markup to invoke.

    **Generative UI is not RSC streaming.** React Server Components streaming is a rendering model (covered by rendering-models) for delivering React component trees from server to client incrementally; it is server-side rendering with serialization, not model-authored UI. Generative UI may *use* RSC streaming as one of its delivery mechanisms — Vercel's `streamUI` API does this — but the pattern is the same whether the components arrive over RSC, are rendered client-side from a JSON spec, or are server-rendered to HTML. RSC is transport; generative UI is the contract.

    **Generative UI is not a tool call.** A tool call is the model invoking an external capability and receiving a result that becomes a tool-result message in its history (covered by tool-call-flow). Generative UI is the model emitting output that becomes a UI surface for the user. The shapes overlap — a function-calling API can encode either a tool invocation or a UI component constructor — but the cycle structure differs: tool calls have a runtime that executes and returns a result the model continues from; UI emissions render to the user and may produce an interaction event in the next turn, but the model is not waiting on a return value.

    **Generative UI is not pre-built widget routing.** The traditional "assistant that can show widgets" pattern has a fixed set of widget components and a routing layer (regex, intent classifier, function-calling tool list) that picks one per query and passes data into it. Generative UI is the same idea pushed up one abstraction level: the model picks the component and the composition (a card with a chart inside, a list of cards with a filter bar), not just which pre-composed view to invoke. The line between "widget routing with N widgets" and "generative UI with a small palette" is fuzzy; the distinction sharpens when components can be composed and nested by the model.

    **Generative UI is not a substitute for traditional UI design.** A well-designed application UI for a known workflow is almost always better than a generative-UI rendering of the same workflow. The pattern is appropriate when the *response space is open* — the assistant can be asked anything, and the right presentation per response varies. For a known, repeated workflow (settings page, checkout flow, dashboard), traditional UI design wins; the design can be tuned per user research, the layout can be perfect for the case, and there's no model-generation latency. Generative UI is for the long tail.

    **Generative UI is not safe to render unconstrained.** Every spec the model emits is potentially attacker-influenced (via indirect prompt injection in retrieved content, tool results, or attached documents). The render pipeline must validate against the schema, apply per-component safety policies (image origin allowlists, URL sanitization, content-length caps), and refuse to render anything that doesn't pass. The model's intent does not authorize rendering; the schema authorizes rendering. See prompt-injection-defense for the broader threat model.

    **Generative UI components are not arbitrary code.** A component in the palette is a typed, design-system-aware, application-owned implementation. The model can compose components by emitting nested specs; it cannot author new components by emitting new code. Adding a new component to the palette is an application-developer task that goes through code review, design review, and accessibility review like any other component.
  taxonomy: |
    By palette openness:
    - **Closed palette** — the application defines a fixed set of components; the model picks from them and fills props. Highest discipline, smallest threat surface, strongest design consistency.
    - **Closed palette with composition** — same fixed set, but components can nest (a card containing a list containing buttons). The model emits a tree, not a single component. Most current production systems use this.
    - **Open palette with grammar constraint** — the model can emit any structure matching a permissive grammar (a generic JSON-Schema for "a UI sub-tree"), and the render pipeline interprets it. Higher expressiveness, more rendering surface to defend.
    - **Code-generating UI** — the model emits actual code (React, HTML, etc.) that the application compiles or evaluates. Not generative UI as defined here; this is closer to "live coding assistant rendering its own output" and has fundamentally different trust properties.

    By generation mechanism:
    - **Grammar-constrained decoding** — the model's logits are masked at decode time so only schema-valid tokens are emitted (OpenAI Structured Outputs, Anthropic Sonnet/Opus tool-use with `tool_choice`, llama.cpp grammar mode). The model cannot emit invalid output.
    - **Function calling** — each component constructor is a "function" in the tool list; the model emits a typed function-call message whose arguments are the props. Reliable enough for most production use.
    - **Free-form generation with schema validation** — the model emits JSON unconstrained; the application validates against the schema and retries on failure. Lowest cost to implement, highest failure rate, present in early generative-UI experiments.

    By rendering location:
    - **Client-side rendering** — the spec arrives at the client (over SSE, WebSocket, or HTTP response), and the client's component registry renders it. Lowest latency for re-renders driven by user interaction.
    - **Server-side rendering with RSC streaming** — the server renders the spec to React Server Components and streams them to the client. Allows components to do server work (data fetch, auth check) before reaching the client; Vercel's `streamUI` is the canonical example.
    - **Static server-side rendering** — the server fully renders to HTML and the client receives a complete page. Suitable for non-interactive responses.

    By interactivity:
    - **Display-only** — the rendered UI conveys information; no interactions feed back to the model.
    - **Single-shot interaction** — the rendered UI has a small fixed set of actions (Confirm/Cancel, choice picker); the chosen action produces one event back into the model's next turn.
    - **Sustained interaction** — the rendered UI is a live surface the user manipulates over time (a form being filled in, a draft being edited); intermediate state may or may not flow back to the model; the final action does.

    By trust posture:
    - **Trusted-only input** — the model's input has no untrusted content; the rendered UI's threat surface is mainly availability and correctness.
    - **Mixed input** — the model receives a mix of trusted and untrusted content; the rendered UI is a potential prompt-injection-defense surface (exfiltration via image URLs, action triggering via auto-rendered buttons).
    - **Multi-tenant rendering** — the rendered UI may be viewed by users other than the model's principal; the threat surface expands to include cross-user data leaks.
  analogy: |
    A magazine editor (the model) and a print shop (the application). The editor decides which articles to publish, what kind of layout each article needs ("this is a profile — use the full-page-photo layout; this is a recipe — use the ingredient-list layout; this is a chart of the year's data — use the data-visualization layout"), and which words and numbers go into each layout. The editor cannot operate the printing press; the editor sends a structured brief to the print shop, which has the press and the typefaces and knows how to make ink hit paper.

    The brief is precise: layout name, fields filled with the article's content, choices among the layout's predefined variations. The brief is not "set this in 14pt Adobe Garamond" — the print shop owns typography. The brief is not raw page-layout PostScript — the editor doesn't operate the press. The brief is the editor's editorial decisions encoded in a vocabulary both sides agreed on in advance.

    A new layout in the magazine requires the print shop to build it — a designer adds it, the printers learn it, and only then is it available in the editor's brief vocabulary. The editor cannot improvise a new layout by writing PostScript directly; the print shop wouldn't accept it because nobody knows whether it would render correctly or look like the rest of the magazine.

    When a reader writes in to "send this article to my friend," they fill out a form on the magazine's website — they don't email the editor directly. The form is the interaction loop, encoded by the magazine. The form's submission becomes a structured message the editor can read in tomorrow's editorial meeting and respond to in the next issue. The cycle is editor → brief → print → reader; reader-action → structured-event → editor.

    Generative UI is this pipeline. The model is the editor. The application is the print shop. The component palette is the vocabulary of layouts. The render pipeline is the printing press. The interaction loop is the reader-response form.
  misconception: |
    The most common misconception is that **generative UI means the model writes the UI code**. It does not. The model emits a typed specification that names which application-authored components to render and with what data. The components are written by the application developers, reviewed like any other code, and instrumented for accessibility and design-system compliance. The model is making editorial choices, not writing the press release in HTML.

    The second misconception is that **structured output APIs (JSON mode, function calling) are generative UI**. They are the enabling mechanism, not the pattern. Structured output is also used for many other purposes — extracting data from text, deciding which tool to call, classifying input, emitting any typed value. Generative UI is the specific application of structured output where the typed value is a UI specification consumed by a render pipeline.

    The third misconception is that **rendering model output is safe because it's "just JSON"**. A schema-validated JSON object can still describe a UI that exfiltrates data, deceives the user, or triggers an action the user did not intend. The validation must extend past schema-conformance: image URLs must pass an origin allowlist; link targets must be sanitized; content-length must be bounded; nested specs must terminate in finite depth. A spec that passes JSON-Schema validation is the *start* of safety analysis, not the end.

    The fourth misconception is that **generative UI scales linearly with palette size**. It does not. A palette of 4 well-chosen components produces a more consistent, predictable assistant than a palette of 40 fuzzy-bounded components. The model's choice quality degrades as the palette grows; the design coherence degrades too; the testing surface explodes. Palette curation is a design discipline, not a feature checklist.

    The fifth misconception is that **the interaction loop is automatic**. It is not. Every interactive component in the palette needs a defined action shape — what event is produced when the user clicks Confirm, what fields are captured when the user submits the form, how the event is encoded in the conversation history for the model's next turn. Without this design, interactive components are display-only; the user clicks Confirm and nothing happens because the application never wired the event back.

    The sixth misconception is that **generative UI replaces traditional UI design**. It does not. For known, repeated workflows, traditional design is faster, more reliable, more accessible, and more polished. Generative UI is for the long tail — responses to the open-ended assistant queries where the right presentation per response varies. The two coexist; an application has both traditional UI screens and an assistant surface that uses generative UI within itself.

    The seventh misconception is that **the Vercel AI SDK's `streamUI` is the protocol**. It is one implementation of the pattern, currently the most prominent in the JavaScript ecosystem, but the pattern is older than that SDK and exists in other forms (OpenAI's Assistants API, custom function-calling-based component palettes, anything from before "generative UI" was a coined term). Citing one vendor's API as the canonical reference for the pattern is a category error; the pattern is more general than any one implementation.

    The eighth misconception is that **model latency makes generative UI unfit for production**. Latency is real (the model must generate the spec before render can start), but mitigations are well-known: stream the spec so rendering can begin before the spec is complete (analogous to streaming HTML); cache common specs; use smaller models for the spec choice and larger models only for the data inside; pre-render and reveal incrementally. Latency is a tuning problem, not a disqualifying property.
---

# Generative UI

## Coverage

The pattern where a language model emits, as structured output constrained by a typed schema, a specification of a UI component or sub-tree that an application then renders for the user. Covers the three load-bearing contracts (component schema, generation constraint, render pipeline), the interaction loop that closes the cycle from user action back into the model's next turn, the trust boundary that makes the rendering safe under adversarial input, the taxonomy by palette openness / generation mechanism / rendering location / interactivity / trust posture, and the distinction from adjacent patterns (chat with markdown, prebuilt-widget routing, RSC streaming as a transport, model-emits-code which is something else).

## Philosophy

The conventional model-to-user pipeline is: model emits text; user reads text. Generative UI inverts this: model emits a typed component specification; application renders the specification; user sees a UI surface authored by the application's design system but composed by the model.

This indirection is what makes the pattern simultaneously safe and expressive. Safe, because the application owns the rendering — the model can only ask the application to render components the application has chosen to expose, with data the schema permits. Expressive, because the model can compose components, choose presentations per response, and adapt to the question at hand without the developer pre-building every variant.

The discipline is in the three contracts. The schema must be small enough to be a coherent design vocabulary but expressive enough to cover the assistant's responses. The generation constraint must be reliable enough that the model's emission is always renderable. The render pipeline must enforce schema validation, design-system compliance, and security policies independently of what the model intended. When all three hold, generative UI lets a language model author the choice of what to show without ever touching the rendering surface.

## The Three Load-Bearing Contracts

| Contract | Owner | Defines | Failure mode if absent |
|---|---|---|---|
| Component schema | Application developer | The typed vocabulary the model may emit and the application will render | Model emits unrenderable specs; design inconsistency |
| Generation constraint | Model + API | The mechanism that forces the model's output to be a valid schema instance | Specs fail validation; retry loops; production flake |
| Render pipeline | Application | The code that turns a validated spec into pixels with design-system and security policies enforced | Model output reaches the DOM unchecked; security and design break |

## Generation Mechanisms Compared

| Mechanism | How it works | Reliability | Cost |
|---|---|---|---|
| Grammar-constrained decoding | Logits are masked at decode time so only schema-valid tokens emit | Highest — schema-valid by construction | Higher decode cost; requires vendor support |
| Function calling | Each component is a function in the tool list; props are arguments | High — schema-valid in most cases; occasional mis-typed argument | Standard tool-use latency |
| Free-form + post-validation | Model emits JSON unconstrained; validator retries on failure | Lowest — retries are common | Cheapest to implement, most variance in production |

Production-grade generative UI uses grammar-constrained decoding (OpenAI Structured Outputs, Anthropic tool-use with strict schemas, Gemini response schema) or function calling. Free-form with post-validation should be considered a prototype mechanism.

## The Render Pipeline

A schema-validated spec is the *input* to the render pipeline, not the output of it. The pipeline performs:

1. **Schema validation.** Confirm the spec matches the published JSON Schema or TypeScript type for the component vocabulary. Reject (and either retry or fall back) anything that doesn't.
2. **Component lookup.** Map the spec's `type` discriminator to the application's registered component implementation. A spec asking for a component the application doesn't ship is a routing error, not a permission to render arbitrary content.
3. **Props validation.** Validate the spec's props against the component's TypeScript type independently of the schema — defense in depth against schema drift.
4. **Safety policy.** For every prop that could be a security boundary — image URLs, link targets, embedded content, HTML strings — apply per-component policy (origin allowlist, URL sanitization, length cap, recursion-depth limit). The schema describes structure; the safety policy describes acceptable content.
5. **Recursive render.** Render the component with the validated props; for nested components in props, recurse through the same pipeline.
6. **Interaction wiring.** Wire interactive elements (buttons, inputs) to the application's event-routing layer, which encodes user actions as structured events the model can read in its next turn.

This pipeline is the entire load-bearing surface of generative UI's safety. The model's "intent" does not authorize rendering; the pipeline does.

## The Interaction Loop

For interactive generative UI, every interactive component needs three definitions:

| Definition | Example for a Confirm button | Why it matters |
|---|---|---|
| Action shape | `{ kind: 'confirm', component_id: string, accepted: boolean }` | The model needs a typed event in the next turn |
| Encoding in history | A user-role message with `content: [{ type: 'ui_event', event: <action shape> }]` (Anthropic) or equivalent | The model reads it the same way it reads any other turn |
| Side-effect policy | Confirming requires an additional tool call gated by user identity, never auto-executed from the click | The click is a user signal, not authorization for the destructive operation |

A generative UI with interactive components but no interaction-loop definition is one-way: the user clicks and nothing happens. A generative UI that auto-executes destructive actions on click is a prompt-injection-defense failure waiting to happen. The middle path — click produces a structured event the model reasons about, the model emits a tool call that goes through normal authorization — is the discipline.

## Vendor And Framework Examples

| Implementation | Provided by | Mechanism |
|---|---|---|
| OpenAI Structured Outputs | OpenAI | Grammar-constrained decoding against a JSON Schema |
| OpenAI Assistants tools | OpenAI | Function calling where each function returns a UI fragment |
| Anthropic tool use with strict schemas | Anthropic | Function-calling-style tool list with schema-constrained inputs |
| Gemini response schema | Google | Response constrained to a typed schema |
| Vercel AI SDK `streamUI` | Vercel | RSC streaming of components selected by function calling |
| LangChain structured chat | LangChain | Pydantic-typed structured output |
| OpenRouter / generic JSON mode | Multiple | Free-form JSON with post-validation, falling back to retry |

Citing one vendor's API as the canonical pattern is a category error; the pattern predates and outlives any single implementation. Use whichever mechanism the chosen model supports most reliably.

## Verification

After applying this skill, verify:
- [ ] The component palette is a published, typed schema (JSON Schema, TypeScript discriminated union, or equivalent) — not an informal convention.
- [ ] The generation mechanism is grammar-constrained decoding or function calling — not free-form-with-retry in production.
- [ ] Every spec the model emits is validated against the schema by the render pipeline before any component is invoked — the model's emission alone does not authorize rendering.
- [ ] Per-component safety policies are enforced: image URLs pass an origin allowlist; link targets are sanitized; content-length is bounded; nested specs terminate in finite depth.
- [ ] Every interactive component has a defined action shape, history encoding, and side-effect policy. Auto-executing destructive actions on rendered-component clicks is forbidden.
- [ ] The render pipeline never executes model-authored markup, HTML, or code. The only thing the model authors is a typed selection from the palette.
- [ ] The pattern is used for open-ended assistant responses, not for known repeated workflows where traditional UI design is the better fit.
- [ ] Accessibility (keyboard navigation, ARIA roles, focus management) is the responsibility of the application's component implementations — generative UI does not produce accessible UI for free, only delegates it to the design system.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the page-level rendering model (CSR vs SSR vs RSC vs streaming) | `rendering-models` | rendering-models owns the page-rendering taxonomy; this skill operates inside any of those models |
| Designing the protocol cycle of a tool call | `tool-call-flow` | tool-call-flow owns the model↔runtime cycle; this skill owns the model→render-pipeline pattern |
| Defending against attacker-controlled directives in model input | `prompt-injection-defense` | prompt-injection-defense owns the security property; this skill owns the rendering pattern that must preserve it |
| Designing the component library itself (tokens, primitives, composition) | `design-system-architecture` | design-system-architecture owns the library; this skill consumes it as the palette |
| Designing the JSON shape of an HTTP API endpoint | `api-design` | api-design owns the request/response surface; this skill owns the model-to-renderer schema |
| Evaluating model accuracy on a specific task | `eval-driven-development` | eval-driven-development owns measurement; this skill owns the pattern being evaluated |

## Key Sources

- React Team. [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md). The architectural basis for streaming UI from server to client used by several generative-UI implementations.
- OpenAI. [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs). Canonical reference for grammar-constrained decoding against JSON Schema — one of the primary mechanisms for the generation-constraint contract.
- Anthropic. [Tool use overview](https://docs.anthropic.com/en/docs/build-with-claude/tool-use). Tool-use with input schemas as a function-calling-style mechanism for emitting typed UI specs.
- JSON Schema. [Draft 2020-12 specification](https://json-schema.org/draft/2020-12/json-schema-core). The schema language commonly used to type the component palette.
- Google. [Gemini structured output / response schema documentation](https://ai.google.dev/gemini-api/docs/structured-output). Third-vendor implementation of the same generation-constraint contract.
- Vercel. [AI SDK `streamUI` documentation](https://sdk.vercel.ai/docs/ai-sdk-rsc/streaming-react-components). One implementation example of the pattern delivered over React Server Components streaming — cited as a worked implementation, not as the pattern itself.
- Nielsen Norman Group. [Generative UI and Outcome-Oriented Design](https://www.nngroup.com/articles/generative-ui/). Practitioner framing of where generative UI fits in the broader UX landscape.
- Schick, T., et al. (2023). ["Toolformer: Language Models Can Teach Themselves to Use Tools"](https://arxiv.org/abs/2302.04761). Background on the structured-emission research thread that enabled reliable typed model outputs.
- Karpathy, A. [LLM OS framing](https://twitter.com/karpathy/status/1723140519554105733). Conceptual framing in which generative UI is one of the rendering surfaces of an LLM-as-OS — useful for situating the pattern in a broader architecture.
