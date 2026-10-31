# 2026-10-31T17:53:30+04:00 — branch-label tie-break invariance audit

- **Engine/rules:** qosa-research-0.5.3 + side-label-invariance-audit/v1; recovered qosa-1.0.0, 3×9 + one stock. Both late-arrival branch models remain **PROVISIONAL**. The audit assumes the four branch labels are interchangeable; it does not authenticate physical branch rules.
- **Workload/seeds:** **2,048 NEW seeded conditional hidden allocations**, contiguous 3402312..3404359, split development 3402312..3403335 and disjoint holdout 3403336..3404359 (1,024 each). All 2,048 sampled allocations were unique. **0 new opening deals, 0 complete rounds, 0 full-game continuations.**
- **Design:** replay the same nine-event alternate prefix from the prior 16:54 checkpoint, test all **24 permutations** of four branch labels, and compare low/high extensions on common ordinary candidates. The deterministic policy tie-break was run in two modes: canonicalized to the original side labels versus raw numeric side index. Two branch models × four reply policies × single/greedy stopping remain in the short-horizon evaluation.

## Results

- Canonical tie-break: **0/2,664** branch-label permutation mismatches. This is the expected metamorphic invariant when branch labels are treated symmetrically.
- Numeric side-index tie-break: **136/2,664** permutation cases became ineligible relative to the identity-label result. Among the **2,528** cases where both identity and permuted numeric runs remained eligible, **188** candidate-classification maps differed (**7.44%**). Overall, **16/111** eligible hidden worlds had at least one numeric-tie-break change.
- The identity-label canonical baseline had **106/239** low-vs-high safety flips (development **52/133**, holdout **54/106**). This is descriptive conditional bookkeeping, not a tactical estimate.

**Finding:** a raw branch-index tie-break can change continuation eligibility or the “safe under low/high extension” classification even when the branch labels are only renamed. Research bots should use a label-invariant tie-break (or a seeded symmetric tie-break); raw numeric side order should be kept only as an explicit ablation.

- **Validation:** the standalone audit logic ran in Node **v22.16.0** with deterministic seed replay, unique-allocation checks, forced-pass checks, legal-action checks, and 28-tile conservation. A clean Git checkout CLI run of the committed file remains pending because this runtime could not resolve github.com; the repository itself was read from GitHub.
- **Confidence/limitations:** high for the metamorphic bookkeeping on these selected synthetic worlds; no external validity for human play. The prefix and common-candidate selection are fixed/conditional, candidate rows are correlated, opponent action likelihood is absent, and both branch models plus blocked-tie scoring remain provisional. No first-place, final-pip, minus, block, or decision-regret result.
- **Cumulative populations kept separate:** **1,380,975** incompatible-model complete rounds unchanged; **1,898,856** forced continuations unchanged; **630,000** opening deals unchanged; **1,195,408** seeded hidden allocations (**1,193,360 + 2,048**). Historical 4,000 rounds remain separate. Next seed **3404360**.
- **Reproduce:** node qosha-research/simulator/side-label-invariance-audit.js test; full run: node qosha-research/simulator/side-label-invariance-audit.js 3402312 2048.
- **Exact next action:** add a label-invariant tie-break to future research policies and rerun the previous late-return cohorts on their **same seeds** under both tie-breaks; retain old numbers as the numeric-side-index ablation. Then seek an authenticated physical pass/branch trace before full-round scoring claims.

## Run data

    {
      "timestamp": "2026-10-31T17:53:30+04:00",
      "engine": "qosa-research-0.5.3 + side-label-invariance-audit/v1",
      "seedRange": [3402312, 3404359],
      "newConditionalAllocations": 2048,
      "uniqueAllocations": 2048,
      "branchLabelPermutations": 24,
      "eligibleWorlds": 111,
      "candidateComparisons": 239,
      "safetyFlips": 106,
      "canonicalPermutationMismatches": 0,
      "numericPermutationIneligible": 136,
      "numericBothEligibleComparisons": 2528,
      "numericClassificationMismatches": 188,
      "worldsWithAnyNumericChange": 16,
      "newOpeningDeals": 0,
      "newCompleteRounds": 0,
      "newFullGameContinuations": 0,
      "nextSeed": 3404360
    }
