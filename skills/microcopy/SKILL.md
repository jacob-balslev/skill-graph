---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: microcopy
description: "Use when writing or reviewing functional UI text: button labels, empty states, tooltips, dialogs, placeholders, loading/progress messages, toasts, inline validation, permission copy, or onboarding steps. Covers interface-copy patterns such as verb-first action labels, acknowledge-explain-guide empty states, one-sentence tooltips, consequence-first confirmations, progressive loading language, and blur/fix validation messages. Do NOT use for marketing persuasion, documentation prose/guide structure, feedback-state staging, or general linguistic rationale behind wording."
version: 1.0.0
type: capability
category: design
domain: design/ux
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: present
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Stack-agnostic UX-writing patterns. The button-label, empty-state, tooltip, dialog, loading, validation, and toast rules apply to any web, mobile, or desktop UI; example product copy uses generic e-commerce framings (storefront, fulfillment partner, orders) — substitute the equivalents from your own product domain."
allowed-tools: Read Grep
keywords:
  - button label microcopy
  - empty-state copy
  - tooltip text rule
  - confirmation dialog wording
  - inline validation message
  - toast notification copy
  - placeholder text rule
  - loading-state messaging
  - functional UI text
  - ux writing patterns
  - destructive-action confirmation copy
  - permission request copy
  - onboarding step copy
  - microcopy verb-first button
  - acknowledge-explain-guide empty state
  - blame-free toast wording
examples:
  - "rewrite this button label so it names the actual action instead of saying Submit"
  - "what should the empty state say when a user has no orders yet?"
  - "draft tooltip text for a production-cost field that explains what it means in one sentence"
  - "this destructive confirmation dialog says OK — what should the button label be instead?"
  - "the inline validation message says Invalid input — make it specific and actionable"
  - "draft a toast message for a successful order export with undo"
  - "what should the loading state say when a sync takes longer than 10 seconds?"
anti_examples:
  - "write the marketing headline for the pricing page"
  - "review this WCAG 2.2 contrast violation on the dashboard"
  - "explain the morphology rule behind verb-first function names"
  - "restructure this help-center article into a tutorial"
  - "decide the kebab-case format for this new CSS class"
  - "rename this React component across all call-sites"
relations:
  boundary:
    - skill: linguistics
      reason: "linguistics owns the underlying language rules (morphology, polysemy, audience register, blame-free framing as a general principle); microcopy owns the specific UI-text patterns where those rules apply (button label rule, empty-state structure, tooltip rule, confirmation-dialog rule) — the same 'rewrite this UI text' prompt routes by whether the user wants the linguistic rationale or the concrete UX-writing pattern"
    - skill: documentation
      reason: "documentation owns long-form prose inside guides, tutorials, and reference docs; microcopy owns short-form text inside the working interface (buttons, dialogs, empty states) — the same 'review this writing' prompt routes by whether the writing lives in a doc or in the live UI"
    - skill: a11y
      reason: "a11y owns the accessibility contracts that govern how copy is announced (aria-live regions, aria-label fallbacks, screen-reader semantics); microcopy owns the words themselves — the same 'fix this UI text' prompt routes by whether the trigger is accessibility compliance or copy quality"
    - skill: interaction-feedback
      reason: "interaction-feedback owns when, where, and how feedback states appear; microcopy owns the words inside those states"
  related:
    - linguistics
    - task-analysis
    - intent-recognition
    - interaction-feedback
    - form-ux-architecture
  verify_with:
    - linguistics
    - a11y
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Microcopy

## Coverage

Functional UI text patterns across all interactive surfaces:

- **Button labels** — verb-first, specific action, max 3 words; never generic ("Submit", "OK", "Yes", "Continue")
- **Empty states** — three-part structure: acknowledge → explain → guide, with one primary action
- **Tooltips** — one sentence, no terminal period, answers "what is this?"
- **Confirmation dialogs** — state the consequence first, name the action in the button, always provide an escape
- **Placeholder text** — example format not instruction; never the only label for a field
- **Loading and progress messages** — progressive disclosure: nothing → spinner → skeleton → message → reassurance, by elapsed time
- **Error / success / warning messages** — three-part What → Why → What-to-do structure with blame-free framing
- **Inline form-validation messages** — appear on blur, disappear on fix, specific not generic
- **Toast / snackbar messages** — action plus context, undo for reversible actions, auto-dismiss after 5 seconds, max 2 lines
- **Permission request copy** — explain *why* before asking
- **Onboarding step copy** — one action per step, progressive disclosure, time-honest

## Philosophy

Microcopy is the most-read, least-reviewed text in any application. A user may never read the docs, skip the onboarding, and ignore the marketing — but they will read the button label before clicking it. They will read the error message when something fails. They will read the empty state when they first arrive. These micro-moments determine whether the user feels confident or confused, and they compound across every interaction.

The failure mode is predictable: developers write placeholder microcopy during implementation ("Click here", "Error occurred", "No data"), it ships because nobody reviews it, and it stays forever. Agents make it worse — they default to verbose, hedged, generic text ("An error has occurred while processing your request. Please try again later.") when users need short, specific, actionable text ("Payment failed — check your card number.").

This skill exists because microcopy quality is structurally unowned in most projects. Marketing copy has a copywriter. Documentation has a tech writer. Naming has a convention. But nobody owns the words *inside* the working interface — the button that says "Submit" when it should say "Save Changes", the empty state that says "No items" when it should say "No orders yet — connect your storefront to start syncing." The cost of that gap is paid one click at a time.

> **Scope boundary:** microcopy writes FUNCTIONAL UI text — button labels, error messages, empty states, tooltips, confirmation dialogs. It does NOT cover marketing copy or content-strategy decisions; those belong to dedicated copywriting and content-strategy skills.

---

## 1. Button Labels

Buttons are the primary action interface. Every button label is a micro-contract: it promises what will happen when clicked.

**Rules:**

1. **Verb-first**: "Save Changes", "Connect Storefront", "Export CSV" — not "Changes", "Storefront", "CSV"
2. **Specific action**: "Delete Order" not "Delete", "Send Invitation" not "Send"
3. **Max 3 words** for primary actions: "Save", "Save Changes", "Save and Close"
4. **Match the consequence**: if clicking deletes data, the button says "Delete" not "OK". If it sends an email, it says "Send Email" not "Confirm"
5. **Avoid generic labels**: "Submit", "OK", "Yes", "Continue" are almost always wrong — name the actual action
6. **Cancel is always available**: destructive dialogs need both the action ("Delete Order") and the escape ("Cancel")

**Button label patterns by context:**

| Context | Bad | Good |
| --- | --- | --- |
| Save form | Submit | Save Changes |
| Delete item | OK | Delete Order |
| Connect platform | Continue | Connect Storefront |
| Export data | Download | Export as CSV |
| Confirm send | Yes | Send Invitation |
| Dismiss dialog | Close | Cancel |

---

## 2. Empty States

Empty states are the first impression for every new feature. They must acknowledge, explain, and guide.

**Three-part structure:**

1. **Acknowledge** — "No orders yet" — confirm the user is in the right place and the emptiness is expected
2. **Explain** — "Orders will appear here once your storefront syncs" — tell them why it's empty and when it won't be
3. **Guide** — "Connect Storefront" (button) — give them the action that fills the empty state

**Rules:**

- Never just "No data" or "Nothing to show" — this is a dead end
- Use "yet" to imply future content: "No orders yet" vs "No orders"
- Include one primary action button that resolves the empty state
- For filtered empty states: "No orders match your filters" + "Clear filters" button
- For error empty states: "Could not load orders" + "Try again" button + brief explanation

**Common empty-state patterns:**

| Surface | Message | Action |
| --- | --- | --- |
| Orders table (new user) | No orders yet | Connect Storefront |
| Orders table (filtered) | No orders match these filters | Clear filters |
| Dashboard (no data) | Connect a storefront to see your profits | Get Started |
| Product list (empty) | No products synced yet | Sync Products |

---

## 3. Tooltips

Tooltips answer one question: "What is this?"

**Rules:**

- One sentence maximum, no period at the end
- Answer "what is this?" or "why would I use this?" — not "how does this work?"
- Never repeat the label the tooltip is attached to
- No links in tooltips (they disappear on mouseout)
- Use sentence case for the first word only
- Appear on hover after 300ms delay, dismiss on mouseout

**Examples:**

- Production-cost field: "Cost of goods sold, including production and shipping to your fulfillment center"
- Confidence badge: "How complete the profit calculation is for this order"
- Sync status icon: "Last synced 5 minutes ago from your storefront"

---

## 4. Confirmation Dialogs

Confirmation dialogs exist for one reason: preventing irreversible mistakes.

**Rules:**

1. **State the consequence first**: "This will permanently delete 3 orders and their associated profit data."
2. **Name the action in the button**: "Delete 3 Orders" not "Confirm" or "OK"
3. **Provide the escape**: "Cancel" button, always present
4. **No double negatives**: "Don't cancel" is never the right label
5. **Include the count**: "Delete 3 orders" not "Delete selected orders"
6. **Distinguish destructive from reversible**: red button + explicit "permanently" for destructive; normal button for reversible

---

## 5. Error Messages

Error messages are the most important microcopy in the application. When something fails, the user needs clarity, not apology.

**Three-part structure:**

1. **What happened**: "Payment failed" — state the failure clearly
2. **Why**: "Your card was declined" — give the specific reason if known
3. **What to do**: "Check your card details or try a different payment method" — actionable next step

**Rules:**

- Never "An error occurred" — say *what* errored
- Never "Please try again later" — say *what* to try or *when* later is
- Blame-free framing: "We couldn't sync your orders" not "You have a sync error"
- Include error codes only in technical contexts, never in user-facing messages
- For transient errors: "Sync paused — retrying automatically" with a progress indicator

The general blame-free / What → Why → What-to-do framing is the linguistic rule (see `linguistics`); microcopy applies it specifically to in-product error toasts, banners, and inline messages.

---

## 6. Loading and Progress

Users tolerate waiting when they understand what's happening.

**Progressive disclosure by elapsed time:**

- **0 – 300 ms**: show nothing (the action feels instant)
- **300 ms – 2 s**: show spinner or skeleton (brief acknowledgment)
- **2 – 10 s**: show message ("Syncing your orders from your storefront…")
- **10 s+**: show progress ("Syncing orders… 47 of 312")
- **30 s+**: show reassurance ("This may take a few minutes for large stores. You can leave this page.")

---

## 7. Inline Validation Messages

Validation messages appear at the field level, not the form level.

**Rules:**

- Appear on blur (not on keystroke — that's hostile)
- Disappear as soon as the user fixes the input
- Specific, not generic: "Email must include @" not "Invalid input"
- Placed below the field, not in an alert box
- Red text + icon for errors, green for success (with non-color indicator for accessibility)
- Never use exclamation marks in validation messages

---

## 8. Toast / Snackbar Messages

Toasts confirm completed actions. They are the UI's "done" signal.

**Rules:**

- Action + context: "Order #1234 deleted" not "Item deleted"
- Include undo for reversible actions: "Order archived. Undo"
- Auto-dismiss after 5 seconds (configurable for actions with undo)
- Max 2 lines of text
- Stack from bottom, newest on top
- Never use toasts for errors — errors need persistent, in-context display

---

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/microcopy.json`](../../examples/evals/microcopy.json). The checklist below is the authoring gate for functional UI text; the eval file is the grader surface.

## Verification

After writing or reviewing UI text, verify:

- [ ] Button labels are verb-first and name the actual action (no "Submit", "OK", "Yes", "Continue" alone)
- [ ] Empty states acknowledge → explain → guide, with a real next-step button
- [ ] Tooltips are one sentence, no terminal period, and answer "what is this?"
- [ ] Confirmation dialogs state the consequence first and name the action in the button (with a Cancel escape)
- [ ] Placeholder text is an example format, not the only label
- [ ] Loading messages follow progressive disclosure by elapsed time, not a single state
- [ ] Error messages follow What → Why → What-to-do, blame-free, with a specific action
- [ ] Inline validation appears on blur and disappears on fix; messages are specific, not generic
- [ ] Toasts include action + context and an undo path for reversible actions
- [ ] Functional UI text stays inside the interface — does not drift into marketing or documentation territory

## Do NOT Use When

| Instead, use | Why |
| --- | --- |
| `linguistics` | The user wants the underlying linguistic rule (morphology, polysemy, register), not the specific UI-text pattern. Linguistics owns the *why*; microcopy owns the *what to write*. |
| `documentation` | Writing or restructuring long-form prose for guides, tutorials, reference docs, or help-center articles. Documentation owns doc architecture and prose; microcopy owns in-product UI text. |
| `a11y` | Auditing UI text for screen-reader announcement, aria-live behavior, or color-contrast compliance. A11y owns the accessibility contracts; microcopy owns the words. |
| `naming-conventions` | Deciding the casing format for an artifact kind (kebab vs camel vs snake). Naming-conventions is for code identifiers, not user-facing UI strings. |
| `intent-recognition` | Disambiguating a user's intent from an ambiguous prompt. Intent-recognition is upstream of any UI; microcopy is the words the UI uses to respond. |
| (a copywriting skill) | Marketing headlines, pricing copy, landing-page persuasion, brand-voice work. Copywriting owns persuasive product surfaces; microcopy owns functional in-product text. |
| (a content-strategy skill) | Page structure, funnel strategy, or what content belongs on each page. Content strategy is upstream of microcopy. |
| `interaction-feedback` | When and how feedback states appear (timing, placement, persistence, recovery). Interaction-feedback owns the staging; microcopy owns the words inside the staged element. |
