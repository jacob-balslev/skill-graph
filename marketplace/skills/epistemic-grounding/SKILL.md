---
name: epistemic-grounding
description: "Use when authoring any artifact that makes claims — skill content, documentation, audit findings, architecture proposals, code review comments, research summaries, or agent output. Covers the discipline of grounding every claim to a verifiable source, distinguishing verified-by-evidence from inferred-from-context, Chain-of-Verification-style claim checking, RFC 2119/RFC 8174 modality, Toulmin argument structure, citation faithfulness, native citation-tool limits, and honest handling of inference, absence, conflict, and currentness. Do NOT use for execution-level evidence protocols or output-completeness enforcement (use methodology), naming precision (use semantics), or grader/rubric design (use evaluation or eval-driven-development). Do NOT use for decide which lint rule to add for a specific kind of drift (use skill-infrastructure). Do NOT use for evaluate a finished SKILL.md against the comprehension grader (use evaluation)."
license: MIT
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"semantics\",\"methodology\",\"evaluation\",\"best-practice\",\"context-engineering\",\"bayesian-reasoning\",\"first-principles-thinking\"],\"verify_with\":[\"evaluation\",\"best-practice\",\"context-engineering\",\"methodology\"]}"
  subject: reasoning-strategy
  scope: "Portable claim-grounding discipline for skill content, documentation, audit findings, architecture proposals, code review comments, research summaries, and other artifacts that assert facts. Teaches Toulmin claim/data/warrant/backing/qualifier/rebuttal structure, the verified/source-supported/inferred/asserted/unverified/contradicted claim-state labels, the chain-of-verification procedure for upgrading a claim's grounding state, RFC 2119/RFC 8174 modality, source-to-claim warrants, citation faithfulness, native citation-tool limits, source-priority (primary over secondary), scoped absence/negative claims, conflict handling, currentness checks, and honest hedging. Excludes execution-level evidence receipts and output completeness (methodology), naming precision (semantics), retrieval/context architecture (context-engineering), and grader/rubric design (evaluation or eval-driven-development)."
  public: "true"
  taxonomy_domain: foundations/epistemics
  stability: experimental
  keywords: "[\"epistemic grounding\",\"claim grounding\",\"source-to-claim warrant\",\"citation faithfulness\",\"RFC 2119 modality\",\"Toulmin argument\",\"verified inferred asserted\",\"chain-of-verification\",\"hallucination prevention\",\"evidence receipt\"]"
  triggers: "[\"ground this claim\",\"cite a source\",\"MUST vs SHOULD\",\"is this verified\",\"how do you know that\",\"does this citation support the claim\",\"mark this as inference\",\"upgrade this asserted claim to verified\"]"
  examples: "[\"before stating that this library supports X, confirm against the actual docs\",\"rewrite this finding so each assertion either cites a file or is marked as inference\",\"should this be a MUST or a SHOULD? what's the strength of the claim?\",\"the agent reported 'fix works' but no test was run — flag the gap in grounding\",\"this answer has citations, but do the cited pages actually support each claim?\"]"
  anti_examples: "[\"verify every step of an audit task with concrete evidence (use methodology)\",\"decide which lint rule to add for a specific kind of drift (use skill-infrastructure)\",\"evaluate a finished SKILL.md against the comprehension grader (use evaluation)\",\"design the retrieval context and memory stack for this agent (use context-engineering)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Epistemic grounding is to claims what double-entry bookkeeping is to financial transactions — every assertion has a corresponding source and warrant on the other side of the ledger, and any unpaired entry is a red flag in the audit."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/epistemic-grounding/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Epistemic Grounding

## Concept of the skill

Toulmin's six argument primitives — claim, data, warrant, backing, qualifier, rebuttal — define the internal structure of a grounded claim: data plus warrant produce a claim; backing strengthens the warrant; qualifier sets the claim's strength; rebuttal names where the claim fails. Layered atop this structural model are four operational checks: claim state (verified / source-supported / inferred / asserted / unverified / contradicted), the verification procedure (draft → generate independent questions → answer against real sources → reconcile) that upgrades a claim between those states, RFC 2119/RFC 8174 modality that gives qualifiers shared machine-readable strength only when the source creates genuine normative force, and attribution quality (a citation must exist, be relevant, support the specific claim, be current, and not be post-rationalized). The discipline is structural, not behavioral — you write each claim so a reader can reconstruct why it is allowed to stand, even when only the claim and its receipt are spelled out.

Distinguishes generated text from defended text. Without epistemic grounding, LLM output is fluent and confident regardless of whether the underlying claim is true — RLHF rewards plausibility, not verification — and the result is ungrounded text that is surface-indistinguishable from grounded text. The "be more careful" alternative fails because the model cannot see its own confidence: verbalized confidence words are empirically poorly calibrated, especially out-of-distribution. Native web-search and citation APIs improve the evidence-collection layer but do not remove the need to inspect the source-to-claim warrant, modality, currentness, and rebuttal. Epistemic grounding replaces the unreliable surface-signal model (tone, structure, vocabulary) with structural signals (citation form, support relation, qualifier word, checked date, hedge marker, verification receipt) that a reader can scan to tell at a glance which claims are grounded and which are not.

Distinct from methodology, which owns execution-level completeness and step-level evidence receipts — methodology enforces *that* evidence accompanies each step; epistemic-grounding decides *what counts* as evidence and how that support is marked in prose. Distinct from semantics, which owns naming and meaning-making — semantics governs how a name is precise; epistemic-grounding governs how a claim is defended. Distinct from first-principles-thinking and bayesian-reasoning, the cognitive primitives of drawing inferences from premises — epistemic-grounding is the surface-marking discipline for distinguishing observation from inference in the output. Distinct from evaluation and eval-driven-development, which own the grader-and-rubric framework — epistemic-grounding is the upstream structural discipline any verification protocol inspects. Distinct from context-engineering, which owns what evidence enters the model — epistemic-grounding owns whether the final artifact faithfully uses and labels that evidence. Epistemic grounding is to claims what double-entry bookkeeping is to financial transactions — every assertion has a corresponding source and warrant on the other side of the ledger, and any unpaired entry is a red flag in the audit. The wrong mental model is that a citation, a retrieval result, or a hedge word is itself grounding. None of the three is. A citation is only a pointer — grounding requires that the pointed-to source actually support the specific claim. A retrieval result is only available evidence — grounding requires that the output use it faithfully rather than post-rationalize an answer from prior belief. A hedge ("probably", "in most cases", "generally") only reduces claim strength; it does not show the source-to-claim chain. Hedging and grounding are orthogonal axes: a sentence can be heavily hedged AND ungrounded ("probably the API returns JSON" with no citation), or unhedged AND grounded ("DELETE is idempotent (RFC 9110 § 9.2.2)"). The discipline separates these axes so that a weak-but-sourced inference, a strong-but-grounded requirement, and an unsupported assertion are visibly different. The failure this prevents is "pseudo-hedge" output that looks careful but never exposes the source-warrant chain a reader needs to verify.

## Coverage

The discipline of grounding every claim to a verifiable source, marking the modality (RFC 2119 MUST/SHOULD/MAY) of the claim, and making the warrant from source to claim explicit. Covers the six-primitive Toulmin argument structure (claim/data/warrant/backing/qualifier/rebuttal); the verified/source-supported/inferred/asserted/unverified/contradicted claim-state labels (and how an *unlabeled* asserted-but-false claim is what readers experience as a hallucination); the chain-of-verification procedure that upgrades a claim from asserted to verified; the orthogonal source-support-vs-truth axis (a present citation must still clear existence/relevance/support/truth/faithful-use); source-priority (prefer the primary source over secondary); native citation-tool primitives and their limits; RFC 2119 and RFC 8174 normative vocabulary; scoped absence/negative claims; conflict handling; currentness checks for drift-prone claims; honest hedging; and the failure modes that make generated prose look grounded when it is not (cargo-cult citation, fabricated citation, wrong-section citation, citation laundering, authority projection, post-rationalization, stale grounding, vibe-based assertion, generalization bias, sycophantic agreement, and more).

Use this skill for any artifact that makes claims: SKILL.md content, audit findings, code review comments, documentation, architecture proposals, research summaries, incident writeups, migration plans, and agent output. The artifact does not need academic citations — file paths, line numbers, test output, command output, API docs, standards text, release notes, or retrieved web pages can all be evidence when the warrant is visible.

## Philosophy of the skill
Confidence is not evidence. An LLM trained to be helpful produces fluent, confident text whether or not the underlying claim is true — RLHF rewards plausibility, not verification — and a human writer does the same when compressing from memory. The result is that ungrounded text is indistinguishable from grounded text by surface signals alone: tone, structure, formatting, confident wording, and a trailing citation look identical whether or not the claim holds.

This is not a soft observation; it is empirically measured. The verbalized confidence markers a model emits ("I'm confident", "likely", "definitely") are poorly calibrated against its actual accuracy and become *inconsistent* out-of-distribution, so a reader cannot trust the model's own expressed certainty as a grounding signal (Liu et al., *Revisiting Epistemic Markers in Confidence Estimation*, ACL 2025). And hallucination is not merely a transient bug awaiting the next model upgrade: Xu et al. (2024) give a learning-theory argument that hallucination is an *innate* limitation of LLMs — a formal-world impossibility result, cited here as contested rather than settled. The practical conclusion holds either way: the burden of distinguishing grounded from ungrounded claims falls on the *artifact's structure*, not on hoping the model "knows better."

The countermeasure is not to ask the model to "be more careful" (it can't see its own confidence). It is to require structural signals that make grounding state visible: every important claim carries enough of a source-warrant-qualifier triple that a reader can verify it, or it carries an explicit label — inferred from cited evidence, asserted from prior knowledge, not verified in this session, or contradicted by a checked source.

Modern upstream tools raise the floor but do not remove this discipline. OpenAI Responses can return URL and file citation annotations; Anthropic's citation feature produces source-location pointers into provided documents; Gemini can ground answers with Google Search; OpenCode exposes `websearch`/`webfetch`. Treat these as evidence-acquisition and pointer-generation tools, not as proof that the final prose is warranted. The writer still owns the support check: source exists, source is relevant, source entails or backs the claim, source is current enough, and the claim strength matches what the source actually says.

This discipline serves three downstream uses: (1) audit and review become tractable because the reviewer knows exactly what to verify; (2) drift detection becomes possible because dated and sourced claims expose their dependencies; (3) downstream agents reading the artifact can decide which claims to trust, which to re-check, and which to treat as assumptions.

## The Six-Primitive Argument

Every grounded claim has six primitives, derived from Toulmin's argument structure (1958). Most agent output surfaces only the Claim and silently elides the rest.

| Primitive | What it answers | Example |
|---|---|---|
| **Claim** | What is being asserted? | "HTTP DELETE is idempotent." |
| **Data** | What source supports the claim? | "RFC 9110 § 9.2.2 (idempotency defined, DELETE listed) + § 9.3.5 (DELETE defined)" |
| **Warrant** | What rule connects data to claim? | "§ 9.2.2 defines idempotency and lists DELETE among the idempotent methods; § 9.3.5 specifies DELETE's semantics." |
| **Backing** | What gives the warrant authority? | "IETF standards body; RFC 9110 is the ratified, canonical HTTP semantics reference." |
| **Qualifier** | How strong is the claim, and on what authority? | "The spec states DELETE *is* idempotent **declaratively** (§ 9.2.2) — a definitional property, **NOT** an RFC 2119 'MUST'. Marking it 'MUST' would be overstated modality (see Failure Modes): RFC 2119 keywords govern conformance requirements, not definitional facts the spec simply asserts." |
| **Rebuttal** | Under what conditions does the claim fail or mislead? | "Server-side state changes that cause subsequent DELETEs to return different status codes do not violate idempotency in the spec sense — idempotency is about the server's resource state, not the response code." |

A grounded version of "HTTP DELETE is idempotent" might read in full: *"DELETE is idempotent under HTTP semantics — RFC 9110 § 9.2.2 (idempotency) defines the property and lists DELETE; § 9.3.5 defines DELETE itself. Repeated calls produce the same intended resource state; response codes may differ (404 after the first 204), which does not violate spec-level idempotency."* That sentence has all six primitives. The ungrounded version — "DELETE is idempotent" — has only the claim.

Notice what the corrected example teaches. The property is cited to the section that actually *defines* it (§ 9.2.2 Idempotent Methods), not merely the section that names the method (§ 9.3.5 DELETE), and its strength is stated as a declarative spec fact, not dressed up in RFC 2119 "MUST" weight it does not carry. Citing the naming-section instead of the defining-section is a quiet warrant gap (the cited text doesn't contain the claimed fact); projecting RFC 2119 modality onto a declarative fact is overstated modality. The skill's own canonical example is held to its own bar.

In a SKILL.md or review comment, you don't enumerate all six primitives in every sentence. You inline them via citation form, qualifier word, checked date, and parenthetical rebuttal. The discipline is to write each load-bearing claim such that the six primitives can be *reconstructed* by a reader, not necessarily that they are all surface-visible.

## Claim State Labels

Every claim has a grounding state. Label the state explicitly when context would otherwise imply stronger support than you have.

| State | Definition | Required marker |
|---|---|---|
| **Verified** | Confirmed by a tool call (Read, Grep, curl, test run), a line-cited file read, command output, primary source, or other evidence receipt in the same writing session. | Cite the receipt: "verified in `src/router.ts:41`", "ran `npm test`, 47 passed", "docs checked 2026-06-06". |
| **Source-supported** | A cited source directly supports the claim, but you did not independently test whether the source itself is true. | Cite the source without overstating: "the docs state…", "the RFC defines…", "the paper reports…". |
| **Inferred** | A reasonable conclusion from cited evidence, but the conclusion itself was not directly tested. | Mark with "inferred from", "follows from", "likely because", or "this suggests". |
| **Asserted** | From the writer's prior knowledge or judgment with no in-session verification. | Mark with "not verified in this pass", "as of <date>", or "in my experience". The weakest state; use sparingly. |
| **Unverified** | The claim has not been checked and the available context does not support it. | Say "not verified" or remove the claim until checked. |
| **Contradicted** | A checked source conflicts with the claim. | State the contradiction and cite the source; do not hedge it into neutrality. |

The failure mode is silent state-drift: asserting something as if verified, or inferring something as if asserted. The discipline is to mark the state when it differs from what context implies.

**Do not use "hallucinated" as an ordinary claim-state label inside an artifact.** "Hallucinated" is a diagnosis after inspection: a claim is hallucinated when it is fabricated or unsupported *while presented as grounded*. A hallucination is the visible symptom of the worst state-drift — an *asserted* claim (from parametric memory) presented as *verified*, when the claim is also false. The state labels are the prevention: forcing the asserted state to be marked — or, better, upgraded to verified via the procedure below — removes the disguise that lets a fabrication pass as fact.

**The marker must point at a structural receipt, not a confidence word.** "Verified" means a tool call happened or a receipt exists that a reader could re-run or re-read — *not* that the writer feels confident, the model said it was confident, or the source title looked relevant. This matters because expressed certainty and measured accuracy diverge, and the gap widens out-of-distribution (Liu et al., ACL 2025). The receipt, not the feeling, is the marker.

## Grounding a Claim: The Verification Procedure

The claim-state labels classify a claim's current state; this procedure *moves* a load-bearing claim from asserted to verified. It is the operational core of the skill — naming the states without a way to upgrade them leaves the writer describing the problem instead of fixing it. Use **chain-of-verification** (Dhuliawala et al., ACL Findings 2024), adapted from response generation into artifact authoring:

1. **Draft the claim** normally and assume the first version is *asserted* unless it already carries a receipt.
2. **Generate independent verification questions** that would prove or falsify the claim. For "the library supports streaming," ask: which version introduced it, what exact API exposes it, and does the cited page actually state support? Generating the questions separately from the answer is what makes the check independent.
3. **Answer each question in isolation against a real source** — Read the file, Grep the symbol, fetch the vendor doc, inspect the spec section, or run the test. Do not let the draft's wording supply the answer (the key CoVe insight: independent checks surface facts the long-form draft elided).
4. **Reconcile** the claim with the sourced answers. If the evidence contradicts or narrows the draft, correct the claim and preserve the qualifier or rebuttal.
5. **Attach the receipt** when the source confirms the claim: path + line range, command + output, doc URL + section, paper page/DOI, or checked date for current web facts. The claim is now *verified*.
6. **If no source can be found** in the declared scope, leave the claim *asserted* or *unverified* and say so — it MUST carry its marker. Do not silently promote it.

Run this loop first on the *load-bearing* claims: the ones that would mislead a reader, change a decision, create a requirement, or surprise a domain expert. For long artifacts, it is better to verify the load-bearing claims deeply than to attach decorative citations to every sentence.

## Source Support Is Not the Same as Truth

The claim-state labels classify how the *writer* came to the claim (the provenance axis). A second, orthogonal axis classifies the relationship between the claim and its cited *source* — and a present citation passes none of these checks automatically. The single most common grounding error after fabrication is treating "a citation is attached" as if it meant "the claim is true." It does not. A citation must clear five independent checks, and a claim can fail any one of them with its citation fully intact:

| Check | The question | Failure example |
|---|---|---|
| **Existence** | Does the cited source actually resolve? | A hallucinated RFC section or a dead file path — the receipt itself is invented (fabricated citation). |
| **Relevance** | Is the source even about this claim (same object, version, API, file, jurisdiction)? | A real, prestigious paper cited for a claim it never addresses (authority projection). |
| **Support** | Does the cited *text* substantiate the *specific* claim — is the claim "attributable to the identified source" (Rashkin et al.'s AIS criterion)? | The source is on-topic but the cited passage doesn't actually say what the claim asserts (cargo-cult / wrong-section citation). |
| **Truth / currentness** | Is the claim *true now*, even granting the source supports it? | The source supported the claim when written, but the fact has since changed (stale grounding); or the source itself is wrong. Support is necessary, not sufficient. |
| **Faithful use** | Did the claim genuinely come *from* the source, or was the source retrofitted to a pre-formed answer? | Post-rationalization: parametric memory produced the answer, then a token-matching search found a plausible-looking citation. Wallat et al. (2024) found a citation can be correct yet unfaithful in this sense. |

This gives a richer set of operational claim-states than the provenance labels alone — a claim can be **source-supported** (passes Support), **unsupported** (a citation that fails Support), or **contradicted** (the cited source actively disagrees). "Contradicted" is the state the *buried conflict* failure mode hides; surface it, don't drop it.

A green "cited" badge is therefore not enough: link validity and topical relevance can stay high while factual accuracy varies substantially (Onweller et al., 2026, *Cited but Not Verified*). The discipline: when you attach a citation, you are asserting all five checks passed — so check them, in that order, before the citation goes in.

## Evidence Priority

When grounding a claim, cite the source that *originates* the fact, not a source that repeats it. Prefer the narrowest authoritative source that directly owns the claim. The ranking, strongest first: an in-session tool result on the actual artifact > the primary spec/source > a reputable secondary that itself cites the primary > an uncited secondary. Secondary sources may have misread the primary (the *citation laundering* failure mode); when you can only reach a secondary source, say so and mark the claim as inference-from-secondary, not verified.

| Claim type | Strongest evidence | Weaker evidence |
|---|---|---|
| Current API behavior | Official docs, API reference, release notes, SDK source, reproducible API call | Blog posts, examples, outdated tutorials |
| Repository behavior | Current source file with line number, tests, command output | README claims, comments, memory |
| Standards / protocol semantics | Current RFC/spec section, standards-body docs | Secondary explanations of the spec |
| Empirical research claim | Paper page / DOI / PubMed / ACL / arXiv record plus a scoped summary of what it reports | News article about the paper |
| Product availability or pricing | Vendor docs / pricing page checked with date | Prior knowledge, cached snippets |
| Negative / absence claim | Stated search scope: paths, queries, docs checked, date | "I did not see it" |

Use secondary sources for orientation, then cite the primary source for the claim. If no primary source is accessible, say so and lower the claim strength.

## Native Citation Tools

Use native citation features when the platform provides them — structured pointers are stronger than prompt-only "please cite your sources" requests. Do not treat them as complete grounding: each has a different scope and limit, and none is a general substitute for the discipline. Treat them as the mechanism for the *verified* state in one specific setting — claims grounded against documents/searches you put in context — not as a replacement for the manual procedure when the claim has no supplied source (prior-knowledge claims, code-review judgments, audit findings, architecture rationale).

| Tool / source | Native primitives to inspect | What it gives | What still needs human/agent grounding |
|---|---|---|---|
| **OpenAI Responses web search** | `web_search_call.action` (`search`, `open_page`, `find_in_page`); searched queries when returned; `message.content[].annotations[]`; `url_citation` URL/title/start/end indices | URL citation annotations + visible inline citations for web results | Check that the cited URL supports the *exact* claim, not just the topic; include the URL/title and a checked date for temporal claims. A visible citation is a pointer, not a warrant. |
| **OpenAI Responses file search** | `file_search_call` id/status/queries; `file_citation` annotations with file id/name/index; `file_search_call.results` only when explicitly included (`include=["file_search_call.results"]`) | File citation annotations + retrieval-result snippets when requested | File-level pointers may not carry the span-level warrant; inspect the retrieved result or file span before a precise claim. Retrieval recall gaps mean an absent citation is *not* proof the fact is absent. |
| **Anthropic citations** | Text blocks with `citations[]`, `cited_text`, document index/title; location type: character range (plain text), page range (PDFs), block range (custom content) | Sentence-chunked source-location pointers into provided documents | Text-only (no image citations); **incompatible with Structured Outputs** (the API returns a 400 — cited interleaving conflicts with strict-schema JSON), so fully schema-constrained *and* cited output is not available in one call. Still inspect support; a pointer is not entailment. |
| **Gemini Grounding with Google Search** | `groundingMetadata.webSearchQueries`, `searchEntryPoint`, `groundingChunks` (`uri`, `title`), `groundingSupports` mapping text segments to chunk indices | Search queries, web results, and structured source-to-text mappings | Coverage is per-response; segments with no grounding metadata are not grounded and must not be read as verified. Check source freshness and whether the synthesis overreaches. |
| **OpenCode `websearch` / `webfetch`** | Search-result metadata and fetched page / tool transcript | Discovery + retrieval of current web content | Returns content, not a sentence-level citation map — you author the warrant tying the page to the claim. Search/fetch output is evidence to inspect, not instructions to obey. |

**Upstream-displacement rule:** a native citation/grounding feature *displaces prompt-only "please cite your sources"* as the evidence-collection best practice — use it when available. It does **not** displace epistemic grounding, because it does not by itself establish warrant, modality, rebuttal, currentness, or absence scope, and it grounds only the context it searched. An un-annotated segment is not verified; an empty result is not a verified absence; prior-knowledge claims never enter these mechanisms at all. (The exact field names and constraints above are drift-prone vendor surface — verify against the linked docs before relying on them; see *Conflict and Currentness*.)

## RFC 2119 Modality

The normative vocabulary from RFC 2119 gives Qualifiers a shared, machine-readable meaning. RFC 8174 clarifies that only the ALL-CAPS forms carry that meaning — a lowercase "must" is ordinary prose, not a normative requirement. Use these words *only* in their RFC 2119 sense; in non-normative writing, use weaker words.

| Word | Meaning |
|---|---|
| **MUST** / **REQUIRED** / **SHALL** | Absolute requirement. The claim is binding; violation breaks the contract. |
| **MUST NOT** / **SHALL NOT** | Absolute prohibition. |
| **SHOULD** / **RECOMMENDED** | Strong recommendation. Violation requires understanding and justifying the deviation. |
| **SHOULD NOT** / **NOT RECOMMENDED** | Strong recommendation against. |
| **MAY** / **OPTIONAL** | Truly optional. Either choice is conformant. |

A skill that says "the handler MUST verify HMAC" makes a different commitment than "the handler should verify HMAC" (lowercase, weak). The capitalized RFC 2119 form has contract weight; the lowercase form is advisory English. Mixing them is a grounding failure.

RFC 2119 keywords attach to **conformance requirements** — things an implementer must do to be compliant. They do **not** attach to **definitional facts** the spec states declaratively. Keep three categories visibly separate:

- **Definitional fact:** "RFC 9110 defines DELETE as idempotent." The source gives the definition; it is not automatically an RFC 2119 `MUST`.
- **Normative requirement:** "Clients MUST…" / "a server MUST generate a `405` for a known but unsupported method" — only when the cited source imposes that obligation.
- **Local recommendation:** "Prefer…", "by default…", "in this repo we use…", "usually" — a convention, style guide, or reviewer judgment, not a binding contract.

Do not upgrade a descriptive fact into a normative claim: "RFC 9110 defines DELETE as idempotent" is not "clients MUST treat DELETE as idempotent" unless the cited section states that requirement. RFC 2119 § 6 itself cautions that the keywords are reserved for genuine interoperability/conformance needs and used sparingly. Stamping a definitional fact with "MUST" is overstated modality even when the fact is true. In SKILL.md authoring, reserve RFC 2119 vocabulary for genuinely normative claims (a protocol requirement, a security invariant, a financial correctness rule).

## Writing Grounded Claims

Use the smallest form that exposes the warrant.

| Form | Use when | Example |
|---|---|---|
| `Claim (source, qualifier). Warrant.` | The source directly supports the claim. | "OpenAI Responses web search returns URL citation annotations by default (OpenAI docs, checked 2026-06-06). So UI output using those web results needs visible clickable citations." |
| `Observed: … Evidence: … Inferred: …` | You need to separate fact from impact. | "Observed: `relations.suppresses` removes sibling skills from co-routing when this skill wins (`SKILL.md:66-75`). Inferred: a reversed reason phrase can mislead authors even if runtime behavior is correct." |
| `I checked X/Y/Z; not found in that scope.` | Making an absence claim. | "Not found in `src/**`, `docs/**`, or `package.json` via `rg \"legacyRouter\"` on 2026-06-06; I did not check generated artifacts." |
| `The source says X; it does not establish Y.` | Preventing overgeneralization. | "The paper reports overgeneralization in tested summarization tasks; it does not prove all LLM summaries are unreliable." |
| `Source A conflicts with Source B; prefer A because…` | Sources disagree. | "The release note says the model is deprecated, while an older guide still names it. Prefer the release note because it is newer and owns lifecycle status." |

For dense paragraphs, split claims atomically before grounding them. A paragraph with one citation but five assertions is not grounded unless the citation supports all five.

## Absence and Negative Claims

"X does not exist," "the function is never called," "there is no auth check," "no docs mention this" are among the most dangerous claims, because absence is hard to prove and easy to assert. A bare negative is almost always overreach. **The scope of the search IS the warrant for the negative** — ground it by stating the exact scope you searched, the method, and the date. Retrieval gaps mean a vector-search or web-search miss is *not* a verified absence — only an exhaustive, bounded search is. If the scope is incomplete, mark the claim as *scoped* absence, not global absence.

Prefer:

- "No `routing_eval` receipt is present in `audit-state.json` as of 2026-06-06."
- "`rg \"foo\" src docs package.json` returned no matches; generated files were not checked."
- "The cited Anthropic citations docs do not state that citations work with Structured Outputs; they state the opposite."

Avoid:

- "There is no routing eval."
- "The docs never mention this."
- "This API cannot do X."

A negative claim outside a stated scope is an *asserted* claim wearing a verified costume.

## Conflict and Currentness

**Conflict — surface contradictions, don't silently pick a winner.** When two sources disagree (the doc says one thing, the code does another; two specs differ; an older and a newer source conflict):

1. Identify the conflict instead of smoothing it away.
2. Prefer the source that *owns* the fact: spec over tutorial, release note over older guide, code over README, current vendor doc over cached memory.
3. Either ground a resolution in a higher-authority or more-current source, or carry the conflict forward as an explicit qualifier ("the README claims X; the code at `foo.ts:42` does Y — unresolved; code is authoritative for runtime behavior").
4. Re-run the source check before reusing the claim in a later artifact.

Burying a known conflict is a grounding failure even when each individual citation is real.

**Currentness — date the drift-prone claims.** Some claims are true *as of a moment* and silently rot: version numbers, pricing, model names, API shapes, "the latest", "currently supported", default config values. For any claim whose truth has a shelf life, attach an as-of date and, where possible, the source's own version/date so a future reader can tell whether it has expired. "The API returns JSON (as of v2.3, checked 2026-06-06)" ages honestly; "the API returns JSON" silently becomes a stale-grounding landmine. Prefer linking to a versioned/permalinked source over a moving "latest" URL.

## Honest Hedging

A hedge reduces claim *strength*; it does not supply grounding (see the misconception in this skill's metadata). But hedging, done honestly, has real value: surfacing genuine uncertainty reduces a reader's over-reliance and improves their downstream decisions, especially when the hedge is specific and first-person ("I have not verified X" rather than a vague "this might not be right").

Honest hedging rules:

- **Hedge the real uncertainty, not the whole sentence.** "The handler validates the signature (verified); whether it also checks the timestamp is not clear from the code I read" beats "this probably works."
- **Name what would resolve the hedge.** "Unverified — would need to run the integration test" tells the reader the exact next step.
- **Never hedge to dodge accountability for a claim you could have checked.** A hedge on a claim you had the tools to verify is a pseudo-hedge: it looks careful but is really an excuse for not grounding. If you can check it, check it; only then hedge what remains.

## Failure Modes

| Failure | What it looks like | Why it fails |
|---|---|---|
| **Cargo-cult citation** | A reference is added at the end of a paragraph but doesn't support the specific claims in it. | The warrant from source to claim is missing; the citation is decorative. |
| **Fabricated citation** | A citation to a source that does not exist — an invented RFC section, a non-existent paper, a hallucinated file path or line number. | The single most documented LLM grounding failure; the receipt itself is the hallucination, so the claim has *negative* grounding — it looks more trustworthy than an honest "unverified." Always confirm the cited artifact resolves. |
| **Wrong-section citation** | Citing the section that *names* a thing instead of the section that *defines* the claimed property (e.g. citing DELETE's method-definition section for an idempotency claim defined in the idempotency section). | The citation resolves but the warrant doesn't hold — the cited text doesn't contain the claimed fact. A quieter cousin of cargo-cult citation. |
| **Citation laundering** | Citing a secondary source (a blog post citing an RFC) without going to the primary. | The chain of warrants is weak; the secondary source may have misread the primary. |
| **Authority projection** | Citing a high-authority source for a claim it doesn't actually make. | The source's authority is projected beyond its content. |
| **Post-rationalization** | Forming the answer from parametric memory first, then finding a citation that superficially matches (token overlap) to dress it as sourced. | The citation can be *correct* yet *unfaithful* — the claim wasn't derived from it (Wallat et al., 2024). Fails the Faithful-use check. |
| **Link-validity illusion** | A cited URL works, but the page does not actually substantiate the claim. | Existence is mistaken for support; link validity ≠ factual accuracy (Onweller et al., 2026). |
| **Retrieval-use confusion** | A relevant document was retrieved, so the answer is assumed grounded. | Available context is not the same as faithfully used context. |
| **Stale grounding** | A claim cites a source that has since moved/renamed/rewritten — or a drift-prone fact (version, price, "latest") stated with no as-of date. | The grounding was once valid but isn't anymore; the reader trusts it without knowing. |
| **Unscoped / false absence** | "Nothing calls this," "X doesn't exist," "no docs mention X," stated without the search scope that would prove it. | Absence can't be asserted, only bounded-searched; without the scope and method, the negative is asserted, not verified. |
| **Buried conflict** | Two sources disagree and the writer silently picks one without flagging the disagreement. | A known contradiction is hidden; the reader can't see that the claim is contested. |
| **Vibe-based assertion** | A claim is stated with no marker, in a context where the reader will assume it's grounded. | Silent state-drift from asserted to verified. |
| **Overstated modality** | "MUST" used for a preference or stamped on a definitional fact; "MAY" used for a hard requirement. | RFC 2119 vocabulary loses its load-bearing meaning when applied to non-conformance text. |
| **Pseudo-hedge** | "Probably", "generally", "I'm confident", "in most cases" applied where the writer actually knows the answer or could have checked. | Lower claim strength or expressed certainty is substituted for a checkable receipt. |
| **Generalization bias** | Dropping the source's scope qualifiers — turning "in this 200-patient cohort" into "studies show", or a hedged finding into a flat fact. | The claim now asserts more than the source supports; LLM summaries overgeneralize at high rates (Peters & Chin-Yee 2025). The qualifier *is* part of the warrant. |
| **Sycophantic agreement** | Revising, softening, or reframing a grounded claim to match a user's nudge ("are you sure? I thought it was X") instead of re-checking the source. | Tone-based agreement displaces evidence; Fanous et al. (2025) observed sycophantic shifts in a majority of cases. The source, not the interlocutor's confidence, is the authority. |
| **Structured-output citation loss** | A strict JSON output drops source pointers or forces citations into an underspecified field (e.g. Anthropic citations are incompatible with Structured Outputs). | The output shape cannot carry the attribution detail the claim needs. |

## Verification

After applying this skill, verify:

- [ ] Every claim that would surprise a domain expert has a source, evidence receipt, or explicit "not verified" label.
- [ ] Every citation actually resolves — the file/line exists, the RFC section is real, the paper can be found (catches fabricated citation).
- [ ] Each citation supports the specific sentence it is attached to, not just the general topic.
- [ ] Section-level citations point to the exact section that *defines or supports* the claimed property, not merely a nearby section that names the object (catches wrong-section citation).
- [ ] Existence, relevance, support, truth/currentness, and faithful-use were treated as separate checks when they matter — a present citation is not a passed check.
- [ ] Citations prefer the primary source; any reliance on a secondary source is marked as such.
- [ ] The claim preserves the source's scope qualifiers (sample size, conditions, hedges) rather than flattening them into a broader assertion (catches generalization bias).
- [ ] No grounded claim was revised to agree with a user nudge without re-checking the source (catches sycophantic agreement).
- [ ] RFC 2119/RFC 8174 vocabulary is used only in genuinely normative conformance claims — not in advisory prose, and not stamped on definitional facts.
- [ ] Inferences are marked as inferences and not presented as direct observations.
- [ ] Load-bearing asserted claims were run through the verification procedure (or carry an explicit asserted/unverified marker when no source was found).
- [ ] Confidence words and hedge words were not treated as verification receipts.
- [ ] Every negative/absence claim states the exact scope searched, the method, and the date.
- [ ] Any conflict between sources is surfaced and either resolved with a cited higher authority or carried forward as an explicit qualifier.
- [ ] Drift-prone claims (versions, prices, "latest", API shapes) carry an as-of date and a versioned source where possible.
- [ ] Dense paragraphs are split enough that each citation's scope is clear.
- [ ] Native citation-tool output was inspected for support rather than accepted as sufficient.
- [ ] The strongest claims have the most explicit grounding; the weakest claims have hedges.
- [ ] At least one Rebuttal or boundary condition is acknowledged for the central claim of the artifact.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Enforcing step-level evidence receipts and output completeness | `methodology` | methodology owns the execution discipline; this skill is the upstream grounding discipline that decides what counts as evidence in the first place |
| Naming things precisely (variables, functions, files) | `semantics` | semantics owns naming precision; this skill owns claim grounding |
| Designing retrieval payloads, memory, or source-selection architecture | `context-engineering` | context-engineering owns what evidence enters the model; this skill owns how the final artifact uses and labels that evidence |
| Drawing inferences from premises | `first-principles-thinking` or `bayesian-reasoning` | those skills own reasoning moves; this skill is the marking discipline for distinguishing inference from observation |
| Scoring a completed artifact against a rubric | `evaluation` | evaluation owns the verdict/rubric framework; this skill supplies the claim-level grounding criteria it inspects |
| Designing agent eval suites or graders | `eval-driven-development` | eval-driven-development owns eval cases, graders, thresholds, and hard negatives |
| Designing skill-library lint/drift tooling | `skill-infrastructure` | skill-infrastructure owns deterministic health checks; this skill governs the claim-grounding semantics those checks may inspect |

## Key Sources

- Toulmin, S. (1958). *The Uses of Argument*. Cambridge University Press. The canonical six-primitive argument structure (claim/data/warrant/backing/qualifier/rebuttal).
- Bradner, S. (1997). [RFC 2119: Key words for use in RFCs to Indicate Requirement Levels](https://datatracker.ietf.org/doc/html/rfc2119). IETF. The standardized MUST/SHOULD/MAY normative vocabulary; [§ 6](https://datatracker.ietf.org/doc/html/rfc2119#section-6) cautions the keywords are for genuine conformance/interoperability needs, used sparingly.
- Leiba, B. (2017). [RFC 8174: Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words](https://datatracker.ietf.org/doc/html/rfc8174). IETF. Clarifies that only ALL-CAPS forms carry RFC 2119 weight.
- Fielding, R., Nottingham, M., & Reschke, J. (2022). RFC 9110: HTTP Semantics. IETF. [§ 9.2.2 Idempotent Methods](https://datatracker.ietf.org/doc/html/rfc9110#section-9.2.2) (defines idempotency, lists DELETE) and [§ 9.3.5 DELETE](https://datatracker.ietf.org/doc/html/rfc9110#section-9.3.5) (defines the method) — the corrected grounding for the worked example.
- Dhuliawala, S. et al. (2024). [Chain-of-Verification Reduces Hallucination in Large Language Models](https://aclanthology.org/2024.findings-acl.212/). *Findings of the ACL 2024*. The draft → independent-verification-questions → answer-in-isolation → revise procedure this skill adapts for upgrading a claim from asserted to verified.
- Xu, Z., Jain, S., & Kankanhalli, M. (2024). [Hallucination is Inevitable: An Innate Limitation of Large Language Models](https://arxiv.org/abs/2401.11817). arXiv:2401.11817. A learning-theory argument that hallucination cannot be fully eliminated — cited here as a *contested* formal impossibility result, not a settled architectural fact, which is why the skill's philosophy hedges it.
- Rashkin, H. et al. (2023). [Measuring Attribution in Natural Language Generation Models](https://aclanthology.org/2023.cl-4.2/). *Computational Linguistics 49(4)*. The Attributable-to-Identified-Sources (AIS) framework — the basis for the "Support" check (is the claim attributable to the cited text?) distinct from whether the claim is true.
- Wallat, J. et al. (2024). [Correctness is not Faithfulness in RAG Attributions](https://arxiv.org/abs/2412.18004). arXiv:2412.18004. Disentangles citation *correctness* from *faithfulness* and quantifies post-rationalization (a citation can be correct yet not the actual source of the claim) — the basis for the "Faithful-use" check and the post-rationalization failure mode.
- Onweller, C. et al. (2026). [Cited but Not Verified: Parsing and Evaluating Source Attribution in LLM Deep Research Agents](https://arxiv.org/abs/2605.06635). arXiv:2605.06635 (resolves as of 2026-06-06; v1 dated 2026-05-07). Reports that link validity and topical relevance can remain high while factual accuracy varies substantially — supports separating the support/truth checks from citation existence.
- Liu, J., Zong, Q., Wang, W., & Song, Y. (2025). [Revisiting Epistemic Markers in Confidence Estimation: Can Markers Accurately Reflect LLMs' Uncertainty?](https://arxiv.org/abs/2505.24778) *ACL 2025*. Verbalized epistemic markers are inconsistent out-of-distribution; supports tying the "verified" marker to a structural receipt rather than a confidence word.
- Anthropic (2025). [Introducing Citations on the Anthropic API](https://www.anthropic.com/news/introducing-citations-api) and the [Citations docs](https://platform.claude.com/docs/en/build-with-claude/citations). Character/page/block-level source-span grounding against a provided document corpus — the mechanical verified-state receipt for corpus-grounded answers; text-only and incompatible with Structured Outputs (does not displace manual grounding for prior-knowledge claims).
- OpenAI. [Web search tool](https://developers.openai.com/api/docs/guides/tools-web-search) and [File search tool](https://developers.openai.com/api/docs/guides/tools-file-search). URL/file citation annotations for live-web and uploaded-corpus grounding — scoped to what each tool retrieved that turn; file-search results returned only with the include parameter.
- Google. [Grounding with Google Search (`groundingMetadata`)](https://ai.google.dev/gemini-api/docs/google-search). Per-response supporting chunks + grounding-supports mapping; segments without metadata are not grounded.
- OpenCode. [Tools (`websearch` / `webfetch`)](https://opencode.ai/docs/tools). Returns fetched/searched content as the receipt; the warrant tying page to claim is author-supplied.
- Fanous et al. (2025). [SycEval: Evaluating LLM Sycophancy](https://ojs.aaai.org/index.php/AIES/article/view/36598). *AAAI/ACM AIES 2025*. Reports sycophantic behavior in a majority of evaluated cases; supports structural countermeasures over tone-based trust.
- Peters, U., & Chin-Yee, B. (2025). [Generalization bias in large language model summarization of scientific research](https://doi.org/10.1098/rsos.241776). *Royal Society Open Science*. Reports overgeneralization in tested LLM scientific-summarization tasks; supports explicit source-to-claim warrant and qualifier preservation.
</content>
</invoke>

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/epistemics`
- Scope: Portable claim-grounding discipline for skill content, documentation, audit findings, architecture proposals, code review comments, research summaries, and other artifacts that assert facts. Teaches Toulmin claim/data/warrant/backing/qualifier/rebuttal structure, the verified/source-supported/inferred/asserted/unverified/contradicted claim-state labels, the chain-of-verification procedure for upgrading a claim's grounding state, RFC 2119/RFC 8174 modality, source-to-claim warrants, citation faithfulness, native citation-tool limits, source-priority (primary over secondary), scoped absence/negative claims, conflict handling, currentness checks, and honest hedging. Excludes execution-level evidence receipts and output completeness (methodology), naming precision (semantics), retrieval/context architecture (context-engineering), and grader/rubric design (evaluation or eval-driven-development).

**When to use**
- before stating that this library supports X, confirm against the actual docs
- rewrite this finding so each assertion either cites a file or is marked as inference
- should this be a MUST or a SHOULD? what's the strength of the claim?
- the agent reported 'fix works' but no test was run — flag the gap in grounding
- this answer has citations, but do the cited pages actually support each claim?
- Triggers: `ground this claim`, `cite a source`, `MUST vs SHOULD`, `is this verified`, `how do you know that`, `does this citation support the claim`, `mark this as inference`, `upgrade this asserted claim to verified`

**Not for**
- verify every step of an audit task with concrete evidence (use methodology)
- decide which lint rule to add for a specific kind of drift (use skill-infrastructure)
- evaluate a finished SKILL.md against the comprehension grader (use evaluation)
- design the retrieval context and memory stack for this agent (use context-engineering)

**Related skills**
- Verify with: `evaluation`, `best-practice`, `context-engineering`, `methodology`
- Related: `semantics`, `methodology`, `evaluation`, `best-practice`, `context-engineering`, `bayesian-reasoning`, `first-principles-thinking`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Epistemic grounding is to claims what double-entry bookkeeping is to financial transactions — every assertion has a corresponding source and warrant on the other side of the ledger, and any unpaired entry is a red flag in the audit.
- Common misconception: |

**Keywords**
- `epistemic grounding`, `claim grounding`, `source-to-claim warrant`, `citation faithfulness`, `RFC 2119 modality`, `Toulmin argument`, `verified inferred asserted`, `chain-of-verification`, `hallucination prevention`, `evidence receipt`

<!-- skill-graph-context:end -->
