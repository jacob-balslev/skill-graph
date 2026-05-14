# Diff Reading Checklist

Use this checklist when reading a patch in the repo.

## Before opening hunks

- Identify the changed file set first.
- Tag each file as one of: rename, mechanical churn, local logic edit, contract edit, test-only change.
- Read the stated intent before trusting the patch shape.

## Per hunk

- What behavior existed before?
- What behavior exists now?
- Is the change additive, restrictive, or substitutive?
- What nearby path could now regress?

## Risk cues

- removed guards
- widened conditionals
- changed query predicates
- changed type/interface shapes
- snapshot churn without matching behavior explanation
- mixed formatting and logic in the same hunk

## Summary output

- file scope
- semantic delta
- risk surface
- next verification step

This file is reference-only. Keep examples and operating checks here rather than bloating `SKILL.md`.
