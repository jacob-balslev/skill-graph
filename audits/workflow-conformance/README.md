# Workflow Conformance Spec

> Type: Reference + executable BDD scenarios (SYSTEM).
> Purpose: verify that Skill Audit Loop agent entrypoints connect docs, ADRs,
> BDD scenarios, prompts, skills, scripts, metrics, and display expectations.

The gate conformance suite proves that concrete fixtures make concrete gates
pass, fail, or warn. This suite proves that agents are pointed at the right
context before they run those gates.

It exists because an agent delegated from a shell command can otherwise read
only a prompt and a script, miss the governing ADRs and BDD examples, and then
misstate what the Skill Audit Loop is evaluating.

## Files

| File | Purpose |
|---|---|
| `../../skill-audit-loop/AGENT_CONTEXT.yaml` | Machine-readable packet wiring mission, vision, goal, rules, docs, BDD suites, and scripts. |
| `spec.yaml` | Given/When/Then scenarios for workflow-context orientation. |
| `../../scripts/__tests__/test-workflow-conformance.js` | Runner that checks referenced entrypoints contain the required context/metric pointers and that every lifecycle step has a BDD contract. |
| `../../skill-audit-loop/WORKFLOW_CONTRACT.md` | Human-readable contract defining metrics, evidence, and display shape. |
| `../gate-conformance/spec.yaml` | Lower-level BDD suite for per-skill deterministic gates. |

## Boundary

This suite checks deterministic orientation facts:

- the workflow contract defines evaluation surfaces and metrics
- the workflow contract defines the Read, Verify, Evaluate baseline, Research, Improve, Use, Evaluate candidate, and Grade step contracts
- the agent context manifest wires mission, vision, goal, rules, BDD suites, and execution scripts to existing files
- prompts point to the workflow contract, relevant ADRs, and BDD suites
- command docs point agents to the same contract
- the unit gate runs this suite

It does not grade whether a skill teaches well. That remains Behavior Gate
work, with artifacts and grader receipts.
