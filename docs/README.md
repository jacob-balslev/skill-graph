# Skill Graph Docs

Use this page when you know the kind of answer you need but not the owning file yet. Normative contracts still live in their owning docs; this page is only a navigation map.

## Start By Task

| If you need to... | Start here | Why |
|---|---|---|
| Author a skill quickly | [`QUICKSTART-30MIN.md`](QUICKSTART-30MIN.md) | Hands-on path from template to lint and drift baseline. |
| Understand adoption choices | [`ADOPTION.md`](ADOPTION.md) and [`CONFORMANCE.md`](CONFORMANCE.md) | Explains what adopting Skill Graph means and how conformance is judged. |
| Look up field meaning | [`../skill-metadata-protocol/field-reference.md`](../skill-metadata-protocol/field-reference.md) | Hand-authored semantics and authoring guidance for each field. |
| See manifest projection rules | [`manifest-field-mapping.md`](manifest-field-mapping.md) | Shows how `SKILL.md` plus `audit-state.json` become manifest fields. |
| Understand verdicts | [`verdict-semantics.md`](verdict-semantics.md) | Canonical enum meanings and confidence ordering. |
| Design or audit eval artifacts | [`comprehension-eval-spec.md`](comprehension-eval-spec.md) and [`application-eval-spec.md`](application-eval-spec.md) | Separate contracts for concept comprehension and behavior-change evidence. |
| Check audit-loop execution surfaces | [`skill-audit-loop-executable-map.md`](skill-audit-loop-executable-map.md) | Maps checks, scripts, artifacts, and write surfaces. |
| Follow current plans | [`plans/PLANS.md`](plans/PLANS.md) | Active plans index. |
| Read accepted decisions | [`adr/`](adr/) | Architecture decision records, including status updates and supersessions. |
| Review research and audits | [`research/`](research/) | Dated analysis, evidence reviews, and multi-model audit reports. |
| Publish or syndicate skills | [`publish-workflow.md`](publish-workflow.md), [`marketplace-syndication.md`](marketplace-syndication.md) | Public release and marketplace staging workflow. |

## Concept Owners

| Concept | Owning file |
|---|---|
| Protocol contract | [`../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`](../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md) |
| Protocol rationale | [`../skill-metadata-protocol/design-rationale.md`](../skill-metadata-protocol/design-rationale.md) |
| Field decisions | [`../skill-metadata-protocol/field-decision-guide.md`](../skill-metadata-protocol/field-decision-guide.md) |
| Graph authority tiers and current state | [`../SKILL_GRAPH.md`](../SKILL_GRAPH.md) |
| Audit loop doctrine and runbook | [`../skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md) |
| Quality bar | [`quality-doctrine.md`](quality-doctrine.md) |
| Glossary | [`glossary.md`](glossary.md) |

## Notes

- Generated docs such as [`status.generated.md`](status.generated.md) and [`marketplace-publication-queue.generated.md`](marketplace-publication-queue.generated.md) report current outputs; edit their generators instead of hand-editing them.
- Archived docs under [`_archived/`](_archived/) preserve historical context and should not be treated as current operating guidance.
- Drafts under [`_drafts/`](_drafts/) are not binding until promoted to an active owner.
