---
name: pattern-recognition
description: "Use when auditing for recurring issues, clustering errors, detecting drift from conventions, or when an agent keeps fixing symptoms instead of root causes. Covers the Observe -> Cluster -> Name -> Codify -> Detect -> Prevent loop, grep-based audits, normalize-then-hash error clustering, board-health patterns, design-token and heading drift, domain-encoding patterns, eval-as-pattern-tests, 5 Whys, pattern lifecycle states, and drift traps. Do NOT use for one-off bug localization without recurrence, or for designing the classification system itself; this skill detects violations of conventions that already exist."
license: MIT
compatibility: "Language- and stack-agnostic. The recognition loop, clustering method, eval pipeline, and 5-Whys ladder apply to any codebase; the grep patterns and example detection rules are illustrative — substitute the equivalents of your stack."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.2.0"
  type: capability
  operation: do
  category: foundations
  subject: meta-methods
  domain: foundations/cognition
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"recurring code pattern detection\",\"anti-pattern audit\",\"convention drift detection\",\"error cluster triage\",\"normalize-then-hash error grouping\",\"five-whys root cause ladder\",\"eval as pattern test\",\"heading hierarchy violation\",\"design token drift\",\"null-vs-zero domain encoding\"]"
  examples: "[\"I keep seeing the same null-pointer crash in three different files — what's the systemic fix?\",\"audit this codebase for hardcoded colors instead of design tokens\",\"cluster the errors from this session log into root-cause buckets\",\"I've fixed this bug five times in five different places — how do I codify a detection rule?\",\"the agent keeps treating null and zero as the same thing in financial calculations — flag the pattern class\",\"every PR introduces a new convention violation — what's the lint rule that would prevent it?\",\"the same Linear ticket keeps reappearing under different titles — how do I deduplicate?\"]"
  anti_examples: "[\"review this code for semantic correctness\",\"find where the user-auth helper is defined\",\"design a MECE classification taxonomy for our error catalogue\",\"investigate why this single failing test is breaking\",\"trigger an alert when CPU exceeds 80% for 5 minutes\",\"rewrite this function to be cleaner\"]"
  relations: "{\"boundary\":[{\"skill\":\"debugging\",\"reason\":\"debugging fixes one specific bug; pattern-recognition identifies the recurring class behind many bugs and proposes a structural fix that prevents the whole class — same recurring-bug prompt routes to debugging for the immediate fix and to pattern-recognition for the systemic rule\"},{\"skill\":\"code-review\",\"reason\":\"code-review judges quality of a specific change at PR scope; pattern-recognition systematically detects recurring structural issues across the entire codebase — same 'recurring violation in PRs' prompt routes to code-review for blocking that PR and to pattern-recognition for adding a lint rule\"}],\"related\":[\"refactor\",\"naming-conventions\",\"lint-overlay\",\"diagnosis\"],\"verify_with\":[\"context-graph\",\"skill-infrastructure\",\"tool-call-strategy\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Pattern recognition is to a codebase what epidemiology is to a city's public health — a doctor (debugging) treats one patient with one infection; the epidemiologist (this skill) notices that fourteen patients across three hospitals all have the same infection, traces it back to a contaminated water source (root cause), names the outbreak, prescribes a public-health intervention (lint rule, type constraint, architectural fix) that prevents the next thousand cases, and updates the surveillance protocol so the next outbreak is caught at three cases instead of fourteen."
  misconception: "|"
  concept: "{\"definition\":\"Pattern recognition is the cognitive and methodological discipline of identifying recurring structures across instances — separating signal from noise, naming the structure once detected, and elevating it into durable, transmissible knowledge. Drawing from Gestalt perception (Wertheimer 1923), expert intuition research (Klein 1998, Chase & Simon 1973), and the software-pattern tradition (Alexander 1977, Gamma et al. 1994), it treats pattern as a class noun: a regularity worth naming because it explains many observations through one structure.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/foundations/pattern-recognition/SKILL.md
---

# Pattern Recognition

## Coverage

The methodology for identifying recurring structures across code, errors, board state, design systems, and domain data — then acting on them systematically rather than symptom-by-symptom. Names the six-step recognition loop (Observe → Cluster → Name → Codify → Detect → Prevent) with an optional Refine stage and the discipline at each stage. Catalogues code pattern classes (naming violations, duplication, anti-patterns, convention drift, missing guards, stale patterns) with detection methods and false-positive risks. Specifies the grep-based audit pattern as a six-step sequence (define → scan → count → sample → classify → triage) and the three-pass audit strategy (discovery → refinement → verification). Documents error-pattern clustering via normalize-then-hash extraction with ten error categories and severity-by-frequency triage rules. Names nine board-health patterns (stale in-progress, column overflow, WIP overflow, duplicate suspect, orphan in-progress, etc.) and the structural prevention each implies. Covers design pattern recognition (heading hierarchy contract violations, design token drift, triple-encoding requirement, component boundary violations) and domain-encoding patterns (null-vs-zero distinction, integer encoding for monetary amounts, magnitude-conversion at display boundary, source-rank trust hierarchy). Defines the eval-as-pattern-test pipeline and a 5-Whys ladder for root cause vs symptom analysis. Closes with pattern lifecycle states (Active / Fixed / Stale / Migrated), cross-session pattern persistence, a verification checklist, and six named drift traps (pareidolia, false clustering, stale patterns, over-abstraction, ignoring context, fixing at the wrong level).

## Philosophy

Agents that operate symptom-by-symptom burn tokens without building leverage. An agent that recognizes patterns can propose systemic fixes, write automated detection rules, and prevent entire classes of bugs from recurring. This skill teaches the methodology — not just what to look for, but how to elevate a single finding into a durable detection and prevention mechanism.

The core discipline: **require three instances before codifying a pattern**. One is a bug. Two is a coincidence. Three is a pattern worth naming and automating. In a high-velocity agentic environment, manual review scales poorly — pattern recognition lets agents "see" the codebase as a system of rules rather than a collection of files. The premature codification of a pattern after one or two instances creates false rules that block valid code; the failure to codify after the third instance leaves the team to keep paying the same review cost on every future commit.

## 1. The Pattern Recognition Loop

```
Observe → Cluster → Name → Codify → Detect → Prevent
   ↓         ↓        ↓       ↓         ↓         ↓
See it    Group     Give it  Write    Automate   Make it
3x+       similar   a name   a rule   checking   impossible
```

An optional **Refine** stage closes the loop: monitor the effectiveness of the fix and update the codified rule if false positives emerge or the pattern mutates.

### Discipline at each stage

- **Observe:** Do not claim a pattern after one instance. One = bug. Two = coincidence. Three = pattern. Premature codification creates false rules that block valid code.
- **Cluster:** Group similar instances and verify they share a root cause. Similar *symptoms* may have different roots — a null pointer and a type error both cause crashes, but fixing null checking does not fix the type error. Group by symptom first, then verify each member shares a root.
- **Name:** Give the pattern a name short enough to grep for (3–5 words). A pattern named "bad cost handling" is unsearchable. "null-vs-zero cost confusion" is greppable, discussable, and findable in evals. If you cannot name it concisely, it is too vague to be actionable.
- **Codify:** Document the pattern in a skill section, a rules file, or a lint rule so it can be searched, discussed, and taught to other agents. Include the detection method (grep pattern, file check, or manual review trigger).
- **Detect:** Automate detection via eval, lint rule, board-health check, or file watcher. Detection should be on-by-default and produce a signal (warn, fail, or task creation) when the pattern is found — not dependent on human memory.
- **Prevent:** Restructure the system so the pattern becomes impossible. Examples: a type-system constraint that prevents the null-pointer pattern, a hook that enforces the session-closeout protocol before session end, a lint rule that blocks the pattern from merging, or an architectural change that eliminates the root cause entirely. Structural prevention is the goal when the cost is proportionate; not all patterns reach this stage.

## 2. Code Pattern Detection

### Pattern classes and detection methods

| Pattern class | Examples | Detection method | False-positive risk |
|--------------|---------|-----------------|-------------------|
| **Naming violations** | Generic names (`data`, `result`, `temp`, `foo`, `item`), wrong prefix, snake_case in camelCase context | Grep for common bad names; manual review | Low |
| **Duplication** | Same logic in 3+ places, repeated imports, copy-pasted error handlers and types | Grep for repeated code blocks; tools like `jscpd` | Medium — similar code may be intentional |
| **Anti-patterns** | String interpolation in SQL, `any` type usage, `console.log` in production, `await` inside `forEach` | Grep for known bad patterns; type-checker strict mode | Low to medium |
| **Convention drift** | Hardcoded hex instead of design tokens, raw `px` instead of spacing scale, import from wrong path | Grep for raw values and non-standard imports | Medium — intentional deviations exist |
| **Missing guards** | `DELETE` without `WHERE`, mutation without auth, missing tenant-scope filter, missing null check before `.length` | Grep for unguarded operations; read surrounding context | Medium — guards may be higher in call stack |
| **Stale patterns** | Old import paths, deprecated API usage, an old prefix that has been renamed, removed abstraction still referenced | Grep for known-deprecated patterns; check git blame | Low |

### The grep-based audit pattern

For any code pattern, the detection method follows this sequence:

1. **Define** the pattern as a regex specific enough to minimize false positives, with scope (which files, which languages).
2. **Run** the scan with appropriate `include` / `exclude` filters.
3. **Count** matches first — `output_mode: "count"` or `| wc -l` gives scale before committing to review. >20 matches = significant systemic issue.
4. **Sample** matches — `output_mode: "content"` with `head_limit: 10` confirms the pattern is real.
5. **Classify** — true positive (genuine violation) vs false positive (intentional or contextual).
6. **Triage** — fix trivial matches in one commit, create a tracker issue for architectural fixes, or add a lint rule for prevention.
7. **Verify prevention** — if you add a lint rule, confirm it catches the pattern in a test commit before shipping.

### The 3-pass audit strategy

1. **Discovery pass:** broad, case-insensitive grep to find potential candidates.
2. **Refinement pass:** regex lookaheads/lookbehinds or `-v` exclusions to remove known intentional patterns (vendor code, token files, fixtures).
3. **Verification pass:** read 3–5 random samples manually to confirm true-positive status before acting on the whole set.

### Example: detecting hardcoded colors

```bash
# Find hardcoded hex in component styles (excluding token sources)
grep -rE '#[0-9a-fA-F]{3,8}' src/ \
  --include='*.scss' --include='*.module.scss' \
  | grep -v '_design-tokens.scss' \
  | grep -v '_foundation.scss' \
  | head -20

# Each match: file:line → replace with var(--color-*) token from your token-source file
```

### Example: detecting stale ticket-prefix references

```bash
# After renaming a project's ticket prefix from OLD- to NEW-, any OLD- reference is stale
grep -rE "OLD-[0-9]+" . --include='*.md' --include='*.ts' --include='*.js'
# → Replace OLD-XXXX with NEW-XXXX
```

### Example: detecting unguarded mutations

```bash
# DELETE without WHERE — data-safety violation
grep -rE 'DELETE FROM' . --include='*.ts' --include='*.sql' | grep -v 'WHERE'

# UPDATE without tenant-scope filter — multi-tenant isolation violation (requires manual review)
grep -rE 'UPDATE.*SET' src/ --include='*.ts' | head -20
# For each match: verify the tenant-id filter is in the WHERE clause
```

### False-positive discipline

Not every grep match is a violation. Before filing or fixing:

- Check if the match is inside a test fixture (intentional by definition).
- Check if the match is inside a comment documenting the old pattern (informational, not active).
- Check if the file is explicitly excluded from the convention (e.g., a token file is allowed to contain hex literals).
- Check if there is an inline exemption comment (`// @intentional: <reason>`).

**Document false-positive exclusion rules in the grep pattern itself, not just in memory.** A rule that only exists in your head will be rediscovered and re-debated by the next agent.

## 3. Error Pattern Clustering

A deterministic error-extraction phase (no model involved, no hallucination risk) clusters session-log errors into actionable categories.

### Error categories and responses

| Category | Detection signature | Severity | Auto-response |
|----------|-------------------|----------|---------------|
| **Tool failure** | Tool call returned error status ≠ 0 | Medium | Check tool availability, retry with backoff |
| **Tool loop** | Same tool called 3× with same params | High | Stop, analyze parameters, pivot strategy |
| **Type error** | `error` contains a type-checker code (e.g., `TS` + number) or "not assignable to type" | Medium | Fix types, check imports, check recent schema changes |
| **Runtime crash** | `error` contains "Uncaught" or stack trace | High | Debug with stack trace; may indicate missing validation |
| **Stall / timeout** | No tool output for >5 minutes | High | Check for infinite loop, resource exhaustion, blocked I/O |
| **Permission denied** | `error` contains "denied", "permission", "forbidden" | Medium | Check hook configuration; verify authorization; adjust scope |
| **Permission tripwire** | Permission denied on a protected resource (env files, credential files, `.git/`) | High | Do NOT retry; explain the security constraint to the user |
| **Context exhaustion** | Session ends mid-task or model reports context full | High | Previous session should have run a closeout protocol; check continuation signal; split task |
| **Configuration error** | `error` about missing env var, bad flag, or invalid config | Medium | Verify environment; check flags and settings; update config |
| **Ghost context** | Agent references files from a prior session | Medium | Run `ls` to verify existence; update memory |

### Clustering method

1. **Extract** error messages from the session log (deterministic — no model involved).
2. **Normalize** each error: strip timestamps, file paths, line numbers, variable names, session IDs.
3. **Hash** the normalized message to group identical errors into buckets.
4. **Count** occurrences per hash → frequency is the primary severity signal (5+ = systemic issue).
5. **Deduplicate** against existing tracker issues via Levenshtein similarity → prevent duplicate tickets for the same error class.
6. **Classify** each bucket: real pattern vs one-off instance; edge cases require manual review.

**Key insight:** normalizing before hashing is what makes clustering work. Two errors that look different because one says `line 47` and the other says `line 52` are the same error. Strip the specifics first.

### When clusters point to root causes

A cluster of 8 "Cannot read property of undefined" errors normalized to the same code path means there is one missing null guard, not 8 bugs. Fix the guard once; the cluster disappears. If the errors normalize to 3 different code paths, there are 3 root causes — do not collapse them into one ticket.

### When to file a tracker issue from an error pattern

- **Frequency ≥5 in one session** OR **≥3 across recent sessions** → file a bug task.
- **Blocking task completion** → file immediately regardless of frequency.
- **Prevents the agent from proceeding** → escalate to an infrastructure task.
- **Root cause is addressable** (missing feature, not "agent made a mistake") → prioritize for implementation.
- If the root cause is agent logic, defer to post-mortem; do not task the infrastructure.

## 4. Board-Health Patterns

A board-health checker can detect nine board-level patterns. Each implies a process fix, not just an alert.

| Pattern | Threshold | Severity | Auto-Fix |
|---------|-----------|----------|----------|
| **Stale In Progress** | >3 days no update | Warning | Move to Ready + comment |
| **Stale Needs Planning** | >14 days | Info | Archive |
| **Column overflow** | >column limit | Warning | Alert only |
| **Resolved blocker** | Blocking task is Done (dependency deadlock) | Warning | Comment (clear dependency) |
| **Priority drift** | P1/P2 in Ready >5 days | Warning | Alert only |
| **WIP overflow** | >N In Progress per agent | Critical | Alert only |
| **Missing priority** | No priority set | Info | Alert only |
| **Duplicate suspect** | >85% title similarity (Levenshtein) | Warning | Alert + link |
| **Orphan In Progress** | No assignee | Warning | Alert only |

### Using patterns for prevention

Each pattern implies a structural fix:

| Pattern | Prevention |
|---------|-----------|
| **Stale In Progress** | Agents must run a session-closeout protocol before ending a session — make it a mandatory hook |
| **WIP overflow** | The dispatcher must cap concurrent claims per agent; set a hard `WIP_LIMIT` in env |
| **Duplicate suspect** | Task creators must search the tracker before creating; add a pre-create search gate |
| **Missing priority** | Task templates must include a required priority field |
| **Orphan In Progress** | Claiming a task must set the assignee atomically — no claim without assignment |
| **Priority drift** | High-priority tasks should have clear owners; the dispatcher should prioritize them |
| **Column overflow** | Process needs a triage gate or WIP limit; adjust column policy |

### Pattern interaction: WIP overflow + stale in-progress

These two patterns frequently co-occur: WIP overflow happens because agents claim tasks and then stall, creating stale in-progress tasks. The root cause is not "too many tasks claimed" but "tasks are claimed without a completion guarantee." The fix is a closeout protocol that forces resolution (Done or Blocked) before a new task can be claimed.

**Triage action, not just reporting:** when a pattern is detected, move stale tasks to Ready, flag duplicates for merge, and ping the owner of dependency deadlocks.

## 5. Design Pattern Recognition

### Heading hierarchy contract violations

A heading hierarchy contract defines (typically) six semantic levels mapped to typography tokens with a strict component → level map. Pattern detection:

```bash
# Components defining their own font-size (violation of the contract)
grep -r "font-size:" src/ --include='*.module.scss' \
  | grep -v '_foundation.scss' | head -20

# Components with hardcoded font-weight (should use heading token)
grep -r "font-weight:" src/components --include='*.scss' | head -20
```

**Rule:** no component may define `font-size`, `font-weight`, or `font-family` for headings. Use the foundation heading tokens or semantic HTML (`<h1>`–`<h6>`) with foundation styles. If a title needs different styling, the heading hierarchy is wrong — fix the hierarchy in the token source, not the component.

### Triple-encoding verification

Status meaning in any UI should be "triple encoded": **color + icon + text**.

- **Violation:** a badge that uses green color but no checkmark icon, or an icon with no accompanying text label.
- **Detection:** check component props for `icon` and `variant` alignment; run an accessibility audit for color-only signals.
- **Why:** color-only encoding fails for colorblind users and monochrome rendering.

### Design token drift patterns

| Pattern | Detection | Rule |
|---------|-----------|------|
| Hardcoded colors | `grep -r "color:" --include='*.scss' \| grep -v "var(--"` | Use CSS custom properties from your token source |
| Raw pixel spacing off-grid | `grep -rE "margin:\|padding:" --include='*.scss' \| grep -E "[0-9]{2,}px"` | Use the spacing scale: 4, 8, 12, 16, 24, 32, ... |
| Hardcoded hex in component | `grep "#[0-9a-fA-F]" --include='*.module.scss'` | Hex belongs in the token source, not components |
| Missing dark mode | Check for the `[data-theme="dark"]` variant for each color variable | Every semantic color needs a `.light` and `.dark` variant |
| Inline styles in JSX | `grep "style={{" --include='*.tsx'` | Use CSS modules or class names |

### Component pattern violations — enforcement

Document the contract in a design guide and enforce via:

- ESLint / Stylelint rules that catch hardcoded values.
- A design-review checklist for PRs.
- Evals that test design compliance.
- A heading-audit script for semantic-hierarchy checks.

### Why design-pattern detection is high-leverage

A single hardcoded color in one component is a one-line fix. But the same hardcoded color appearing in 15 components means a developer practice is broken — adding a new component will likely introduce color 16. The fix at the root-cause level is: (a) a lint rule that fails CI on hardcoded colors, and (b) a design-review gate before merge. Fixing 15 instances without the lint rule means instance 16 will appear next sprint.

## 6. Domain-Encoding Patterns

Every domain has encoding conventions that, when misread, produce silent incorrect calculations — the most dangerous class of bug because the output looks valid. Monetary amounts are the classic example, but the same principles apply to any domain primitive (timestamps, percentages, dimensions, weights, currency codes).

| Principle | What it means | Common mistake | Consequence |
|---------|-------------|----------------|-------------|
| **Null vs zero distinction** | `null` means "we don't know"; `0` means "we know and it's zero" | Treating `null` as `0` | Overstated outcomes (e.g., fake zero cost → fake 100% margin) |
| **Integer encoding for monetary amounts** | Store amounts as integer minor units (cents, satoshis) to prevent floating-point drift (`0.1 + 0.2 ≠ 0.3`) | Dividing by 100 mid-calculation | Floating-point precision loss accumulating across operations |
| **Magnitude conversion at the display boundary only** | Conversion from minor units to major units (cents → dollars) happens once, in formatters, never in business logic | Hidden `/100` deep in a calculation chain | Magnitude bugs and precision loss |
| **Source-rank trust hierarchy** | Each data field has a rank: verified > calculated > estimated > defaulted | Treating estimated/defaulted values as authoritative | Overconfidence in unverified data |
| **Customer-facing vs internal totals** | Same number can mean two different things depending on perspective (e.g., shipping charged to customer ≠ shipping cost paid to fulfillment) | Confusing the two | Double-counting or sign error |
| **Division-by-zero guard** | A safe-percent helper returns `null` (or a sentinel) when the denominator is zero, never `NaN` or accidentally `0%` | Displaying `NaN` or silently returning `0%` | Misleading analytics |

### Domain-encoding pattern detection

```bash
# Premature minor → major conversion (may lose precision mid-chain)
grep -r "/ 100" src/ --include='*.ts' \
  | grep -E 'cents|price|cost|total'

# Confusion between zero and null in domain fields
grep -r "amountCents === 0" src/ --include='*.ts' | head -10
# → verify the logic correctly distinguishes "unknown" from "zero"

# toFixed on minor units (wrong magnitude)
grep -r "toFixed" src/ --include='*.ts' | grep -v '/ 100'

# Missing minor → major formatting at the UI boundary
grep -rE "\{.*_cents\}" src/components/ | grep -v 'formatMoney'

# Unguarded division that could NaN
grep -r "safe-percent\|safeRatio\|safeDiv" src/ --include='*.ts' | wc -l
# → if the count is low, there may be unsafe divisions elsewhere
```

### The null-vs-zero trap

This is a high-frequency domain-encoding pattern violation in any codebase that handles partial data. The invariant: `null` means "we don't know," `0` means "we know and it's zero." Code that treats them identically will either:

- Report a successful outcome when it is actually unknown (null cost → fake zero cost → fake 100% margin).
- Hide genuine zero-value cases as unknowns.

Always write explicit checks:

```ts
if (amountCents === null) return null; // unknown, not zero
```

The lesson generalizes beyond money: a `lastSeenAt` of `null` ≠ "seen at epoch zero"; an unknown shipping weight ≠ a zero-weight package; a missing `assignedTo` ≠ "assigned to no one on purpose." Build the null-vs-zero distinction into the type system at the boundary, and propagate it through the calculation chain.

## 7. The Eval-as-Pattern-Test Approach

Every recognized pattern should become a testable eval. This is how patterns survive beyond the session that discovered them — agents in future sessions can verify they detect the pattern reliably under new inputs.

```json
{
  "id": 1,
  "name": "heading-hierarchy-violation-detection",
  "prompt": "Review this SCSS for design token compliance:\n.chart-title { font-size: 16px; color: #333; font-weight: 600; }",
  "expected_output": "Identifies #333 and font-size: 16px as token violations",
  "expectations": [
    "Flags #333 as hardcoded color — should use a color token",
    "Flags font-size: 16px as raw value — should use a heading token or semantic <h3>",
    "Does NOT flag font-weight: 600 if it matches the heading-h3 spec",
    "Does NOT flag colors inside the token source files"
  ],
  "model": "any frontier model"
}
```

### Pattern → eval pipeline

1. **Detect** the pattern manually in a session (this document, codebase scan, or error clustering).
2. **Write** a skill section documenting the pattern, detection method, and fix.
3. **Capture** the offending code snippet to `evals/fixtures/`.
4. **Create** an eval in `evals/patterns.json` that tests detection with known inputs and expected outputs.
5. **Run** the eval to verify agents can detect it reliably in zero-shot review.
6. **Automate** detection in CI (lint rule, grep gate, or board-health check).
7. **Verify** the automated check catches the pattern in a test commit before shipping.
8. **Document** the pattern in the relevant canonical doc (design guide, security policy, data-handling spec).

### Why the eval step is non-optional

A skill section documents a pattern for human readers. An eval tests whether an agent can apply the pattern reliably under new inputs. Without the eval, a skill section about "null-vs-zero confusion" may be read and then misapplied on the next input — the agent learned the name but not the detection logic. The eval closes that gap.

## Evals

This skill ships `evals/evals.json` with scenarios for recurrence thresholds, convention drift, error clustering, board-health patterns, root-cause depth, pattern lifecycle states, and negative routing boundaries. The eval artifact is intentionally kept as ordinary scenario JSON rather than a repo-specific fixture suite because the skill is portable and teaches a cross-codebase method.

## 8. Root Cause vs Symptom Recognition

Agents that fix symptoms create the illusion of progress while the root cause generates new instances. Pattern recognition locates the level at which a fix propagates to all instances.

| Symptom | Root cause pattern | Symptom fix | Root cause fix |
|---------|-------------------|-------------|----------------|
| Function crashes on null input | Missing null guard on parameter | Add null check | Non-null type narrowing at the boundary |
| Same bug in 3 files | Duplicated logic across files | Fix each file | Extract shared utility; replace callsites |
| Hardcoded hex colors everywhere | No design token available or lint rule | Replace hex one by one | Add token to the token source + CI lint rule |
| Users report "permission denied" weekly | Missing tenant-scope filter in query `WHERE` | Fix the query | Enforce a tenant-scope rule at the query layer; use a scoped-query helper |
| Tasks go stale in In Progress | Agents don't run the session-closeout protocol | Manually move tasks | A session-end hook enforces closeout |
| Type errors on every merge | Missing integration test | Fix case-by-case | Add cross-module type test in CI |
| Same design violation in every PR | No automated check | Review PRs manually | ESLint / Stylelint rule + design-review eval |
| Numeric display shows NaN | Safe-percent helper not used at display | Add `\|\| 0` at callsite | Enforce the safe-percent wrapper at all display boundaries via lint |

### The 5-Whys for agents

Work down to the level where a fix prevents all future instances, not just the current one.

**Example: repeated null-check bug**

1. **Why** does this calculation crash? → `amountCents` is null, no guard exists.
2. **Why** is the guard missing? → The function assumes the amount is always recorded.
3. **Why** does it assume that? → No type constraint enforces nullable amounts.
4. **Why** no type constraint? → The function accepts `number` instead of `number | null`.
5. **Why** the wrong type? → The type was copied from an older schema before the field became nullable.

**Fix at level 5:** update the type signature to `amountCents: number | null`, add a comment explaining the null semantics, run type-check across all callers. This prevents the bug for all future callers, not just the one that crashed today.

Fixing at level 1 (add `|| 0`) silently converts "unknown" to "zero assumed" — the wrong fix that creates a new category of silent error. Always aim for level 4–5 when possible. Levels 1–2 are debugging; levels 4–5 are process improvement.

## 9. Pattern Lifecycle Management

Patterns are not permanent truths. They require maintenance.

### Pattern states

| State | Meaning | Action |
|-------|---------|--------|
| **Active** | Still occurring; detection rule running | Enforce, measure frequency |
| **Fixed** | Root cause resolved; new instances impossible | Verify with grep; archive if clean |
| **Stale** | Pattern was fixed but detection rule still runs | Prune detection rule; note in skill |
| **Migrated** | Pattern replaced by a different convention | Update detection to flag old AND new violations |

### Pruning stale detection rules

A detection rule for a pattern that no longer exists creates false positives and alert fatigue. After a root-cause fix ships:

1. Run the grep / lint rule: if zero matches, the pattern is gone.
2. Archive the detection rule with a note: "Fixed in commit XXXXXXXX — null-vs-zero domain-value type was corrected."
3. Keep the skill section (documents WHY the fix was needed) but mark detection as `[archived]`.

### Migrated patterns require dual detection

When a convention changes (e.g., the ticket prefix is renamed from `OLD-` to `NEW-`), the detection rule must flag:

- **Old pattern:** still-existing `OLD-` references (violations to fix).
- **New pattern:** any new `OLD-` references introduced after migration (regressions to prevent).

A single grep covers both: `OLD-[0-9]+` catches all instances regardless of when they were written.

### Detection decay

A detection rule added today may not catch future variants of the same pattern. Periodically verify that your detection rules still catch the pattern *class*, not just the specific instances you fixed. Rules age; patterns mutate.

## 10. Cross-Session Pattern Persistence

Patterns span multiple sessions. Track them so discovery is not repeated:

- **Memory file:** save significant patterns to a file like `memory/pattern-<name>.md` with detection method and prevention status.
- **Tracker tasks:** file bugs for high-frequency patterns; link tasks to the pattern for traceability.
- **Lint / eval:** add automated checks so future agents detect the pattern without rediscovery.
- **Canonical docs:** update the design guide, security policy, or data-handling spec to document the pattern and its rule.

If you detect a pattern that was supposedly fixed, investigate:

- Is the fix incomplete? (Some instances still exist.)
- Did a new instance slip through the detection rule? (Rule is incomplete.)
- Was the prevention mechanism removed? (Regression in process or codebase.)

## Verification

Before codifying a pattern, confirm:

- [ ] **Observed at least 3 times?** One is a bug, two is a coincidence. Three is a pattern.
- [ ] **Same root cause across instances?** Similar symptoms ≠ pattern if roots differ.
- [ ] **Can name it in 3–5 words?** "Hardcoded color instead of token" ✓ vs "design issue" ✗.
- [ ] **Can write a detection rule?** A grep pattern, lint rule, or board-health check exists or can be added.
- [ ] **Root cause identified, not just symptom?** 5-Whys applied; the fix prevents recurrence.
- [ ] **Pattern documented?** Skill section, rules file, design rule, or security/data-handling policy doc.
- [ ] **False-positive exclusions documented?** Test files, token files, legacy-exempt areas — inline in the grep pattern.
- [ ] **Detection automated?** Lint runs on CI, eval runs on pilot, or check is in the board-health pipeline.
- [ ] **Eval created for high-frequency patterns?** Agents verify detection under new inputs.
- [ ] **Prevention possible?** Architecture change, type-system guard, or process hook can make the pattern impossible.
- [ ] **Checked the inverse?** Places where the pattern *should* be applied but isn't (e.g., guards missing at new callsites).

## Drift Traps

1. **Pattern inflation (pareidolia)** — Not everything is a pattern. Require 3+ instances before codifying. A single bug is a bug; calling it a pattern adds false urgency and misleads future agents. Seeing patterns where only random noise exists wastes effort.

2. **False clustering** — Similar symptoms often have different root causes. A cluster of "null reference" errors may have 3 different call sites with 3 different missing guards. Verify each cluster member shares a root before proposing a unified fix.

3. **Stale patterns** — Patterns that were fixed but whose detection rules remain. A grep that always returns zero matches is noise and creates alert fatigue. Prune periodically; see §9.

4. **Over-abstraction** — Creating a framework or lint plugin to detect one pattern. Detection should be proportional to frequency. One pattern = grep rule. Three patterns = lint plugin. A complex wrapper that is harder to maintain than the duplication itself is its own anti-pattern.

5. **Ignoring context** — A pattern in test code may be intentional by design (e.g., testing null handling, hardcoded fixture values). A pattern in a token source file is by definition the source of truth. A pattern in a config file may be valid (comments that look like code). Context determines whether a match is a violation.

6. **Fixing at the wrong level (symptom loop)** — See §8. Fixing symptoms without the 5-Whys produces fix churn. Measure whether the cluster shrinks after the fix; if not, you fixed a symptom. Repeatedly addressing the 1st Why without ever reaching the 5th Why is the most expensive form of pattern work.

### When NOT to declare a pattern

- **Single instance** — fix the bug; do not create a framework for it.
- **Legitimate deviation** — some code intentionally violates a rule. Document the reason inline (e.g., `// @intentional: dynamic SQL interpolation required because...`).
- **Tool limitation** — if you cannot write a detection rule because the tool is limited, either fix the tool or document the limitation.
- **Unclear root cause** — if you see similar symptoms but cannot determine a shared root cause, classify as "investigate further" not "pattern found".

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `code-review` | Reviewing a specific PR for semantic logic and quality. Code-review owns the per-change judgment; pattern-recognition owns the cross-codebase recurrence analysis. |
| `debugging` | Fixing one specific failing case — single-instance bug localization and resolution. Debugging owns the immediate fix; pattern-recognition owns the systemic rule that prevents the class from recurring. |
| `diagnosis` | Triaging an unknown software failure into a problem class before debugging begins. Diagnosis owns the per-incident triage; pattern-recognition owns the cross-incident class analysis. |
| `refactor` | Restructuring code once a pattern is identified. Refactor enacts the change; pattern-recognition decides what needs changing. |
| `naming-conventions` | Establishing or auditing the naming rules themselves. Naming-conventions owns the rules; pattern-recognition detects violations of those rules. |
| `lint-overlay` | Adding the lint rule that automates pattern detection. Lint-overlay owns the rule machinery; pattern-recognition decides which patterns warrant a rule. |
| `skill-infrastructure` | Performing dependency and structural audits across the skill library graph. Skill-infrastructure owns the structural health-tooling perspective; pattern-recognition owns the recurring-violation perspective. |
| `tool-call-strategy` | Deciding which tool (Grep / Glob / Read) to reach for during a scan. Tool-call-strategy owns the tool selection; pattern-recognition owns the analysis of what the tools find. |

## Key Sources

- Alexander, C., Ishikawa, S., & Silverstein, M. (1977). *A Pattern Language: Towns, Buildings, Construction*. Oxford University Press. The original use of "pattern" as a term of art in design; 253 patterns connecting urban planning to room layout. The framing — *context + problem + solution + relations to other patterns* — became the template every later pattern catalogue adopted.
- Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley. The "Gang of Four" catalogue: 23 patterns in creational, structural, and behavioral categories. Established the discipline of pattern documentation in software.
- Klein, G. (1998). *Sources of Power: How People Make Decisions*. MIT Press. The recognition-primed decision model: expert decision-making as pattern recognition against a learned library of cases. Empirical evidence from firefighters, NICU nurses, and military commanders.
- Chase, W. G., & Simon, H. A. (1973). "Perception in Chess." *Cognitive Psychology*, 4(1), 55-81. The foundational chunking study: chess masters perceive board positions as small numbers of meaningful patterns; novices see individual pieces. The mechanism behind all expertise.
- Miller, G. A. (1956). "The Magical Number Seven, Plus or Minus Two." *Psychological Review*, 63(2), 81-97. The original chunking paper; working-memory limits and the role of pattern recognition in expanding effective capacity.
- Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley. Software patterns at the application-architecture level; complements the Gang of Four with patterns for data access, web presentation, and distributed concerns.
- Hohpe, G., & Woolf, B. (2003). *Enterprise Integration Patterns*. Addison-Wesley. Messaging patterns: routing, transformation, endpoints. Demonstrates how the pattern method extends beyond OO design to distributed-systems concerns.
- Wertheimer, M. (1923). "Untersuchungen zur Lehre von der Gestalt II." *Psychologische Forschung*, 4. The Gestalt principles (proximity, similarity, continuity, closure); the perceptual mechanisms that make pattern recognition possible at the visual level.
- Brown, W. J., Malveau, R. C., McCormick, H. W., & Mowbray, T. J. (1998). *AntiPatterns: Refactoring Software, Architectures, and Projects in Crisis*. Wiley. The complementary anti-pattern catalogue; recurring solutions that predictably fail.
