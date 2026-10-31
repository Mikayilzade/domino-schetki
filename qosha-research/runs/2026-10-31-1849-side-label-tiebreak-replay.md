# 2026-10-31T18:49:45+04:00 — side-label tie-break replay and duplicate-world accounting

- **Engine/rules:** `qosa-research-0.5.3 + side-label-invariance-audit/v2`; recovered `qosa-1.0.0`, primary 3×9 plus one stock. Both late-arrival branch models remain **PROVISIONAL**; branch-label symmetry is a metamorphic/model assumption, not physical-rule authentication.
- **Run type:** reanalysis of two already-used seed cohorts on the same alternate chronological prefix (the 16:54 trace: `1-3` right, `1-4` left). **0 new seed draws, 0 new hidden worlds by design, 0 deals, 0 complete rounds, 0 full-game continuations.** Reused seed ranges: `3400264..3402311` and `3402312..3404359`.
- **Policy comparison:** canonical branch-label tie-break versus raw numeric side-index tie-break; 2 branch models × 4 reply styles (low/high/double-first/double-last) × single/greedy stopping; all 24 branch-label permutations.

## Replayed cohorts

| Reused seed range | Seed draws | Unique worlds | Duplicate pairs excluded | Eligible worlds | Candidate comparisons | Low/high safety flips | Canonical permutation mismatches | Numeric eligibility changes | Numeric classification mismatches / both-eligible comparisons |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 3400264–3402311 (prior 16:54 cohort) | 2,048 | 2,046 | 2 | 111 | 237 | 81/237 (34.18%) | 0/2664 | 192/2664 | 264/2472 (10.68%) |
| 3402312–3404359 (prior 17:53 cohort) | 2,048 | 2,048 | 0 | 111 | 239 | 106/239 (44.35%) | 0/2664 | 136/2664 | 188/2528 (7.44%) |
| **Combined descriptive total** | **4,096** | **4,094** | **2** | **222** | **476** | **187/476 (39.29%)** | **0/5328** | **328/5328** | **452/5000 (9.04%)** |

- The canonical tie-break was invariant in **0/5328** eligible-world × permutation checks.
- Raw numeric side order changed eligibility in **328/5328** checks and changed candidate classification in **452/5000** comparisons where both runs remained eligible.
- Across the two cohorts, **28/222** eligible worlds had an eligibility change and **38/222** had a classification change; these sets did not overlap in this sample, so **66/222** had either type.
- **Clarification of the 17:53 checkpoint:** its `16/111` is the number of worlds with a classification-map change; separately, `12/111` had an eligibility change. The combined “any numeric tie-break change” count for that cohort is **28/111**, not 16/111.

## Duplicate-world audit

The finite conditional allocation space permits different seeds to produce the same hidden assignment; seed count is not unique-world count. In the first replay range:
- seed `3401407` duplicates `3400549`;
- seed `3401867` duplicates `3400594`.

Both duplicate pairs were across development→holdout, and both worlds failed the candidate-eligibility gate. The v2 runner retains the seed audit, counts unique allocations, and excludes later duplicate allocations from analysis; headline eligible/candidate metrics therefore remain unchanged here. The regression test explicitly checks both duplicate pairs and no longer assumes every seed must be unique.

## Validation, confidence, and limits

- Exact committed source was fetched from GitHub and executed in an isolated V8 harness. Smoke test passed, including deterministic replay, 24-permutation canonical invariance, duplicate accounting, and the two duplicate-pair regressions.
- A clean local Node 22 checkout/CLI remains blocked because this runtime cannot resolve `github.com`; do not describe this as a clean Node CLI run.
- High confidence for the deterministic/metamorphic bookkeeping on these fixed synthetic worlds; low external validity for human play. Candidate rows are correlated and selected; branch reopening and blocked-tie scoring remain provisional. No first-place, final-pip, minus, block, or full-game regret result. The safety-flip percentages are conditional descriptive counts, not strategy effects.

## Cumulative scale and next action

- **Cumulative unchanged:** 1,380,975 incompatible-model complete rounds; 1,898,856 forced continuations; 630,000 opening deals; 1,195,408 seeded hidden allocations. Historical 4,000-round baseline remains separate. Next unused seed **≥3404360**.
- **Exact next action:** carry duplicate-aware world accounting and label-invariant tie-breaking into the remaining research policy runners; then seek an authenticated physical pass/branch trace. Keep raw numeric branch order as an explicit ablation only; do not promote full-round win/minus/regret claims before the physical branch and block rules are confirmed.

## Run data

```json
{
  "timestamp": "2026-10-31T18:49:45+04:00",
  "engine": "qosa-research-0.5.3 + side-label-invariance-audit/v2",
  "reusedSeedRanges": [
    [
      3400264,
      3402311
    ],
    [
      3402312,
      3404359
    ]
  ],
  "seedDraws": 4096,
  "uniqueHiddenAllocations": 4094,
  "duplicateAllocationPairs": [
    {
      "seed": 3401407,
      "duplicateOfSeed": 3400549
    },
    {
      "seed": 3401867,
      "duplicateOfSeed": 3400594
    }
  ],
  "newSeedDraws": 0,
  "newDeals": 0,
  "newCompleteRounds": 0,
  "newFullGameContinuations": 0,
  "branchLabelPermutations": 24,
  "canonicalPermutationMismatches": 0,
  "eligibleWorlds": 222,
  "candidateComparisons": 476,
  "safetyFlips": 187,
  "numericEligibilityChanges": 328,
  "numericClassificationMismatches": 452,
  "numericBothEligibleComparisons": 5000,
  "worldsWithAnyNumericChange": 66,
  "worldsWithNumericEligibilityChange": 28,
  "worldsWithNumericClassificationChange": 38,
  "nextSeed": 3404360
}
```
