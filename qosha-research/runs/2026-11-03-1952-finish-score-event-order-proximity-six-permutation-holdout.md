# Six-permutation PWA score-order proximity holdout — 2026-11-03T19:52:18+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0 coded 3×9 + one-stock round model. Branch/opening semantics remain provisional. The finish-pip-plus-finisher-minus adapter remains an explicit provisional assumption; blocks are unscored.
- **Deals/seeds:** attempt seeds 20,000,000–20,001,034; 1,035 attempts, 35 redeal signals, 1,000 accepted outcomes, 1,000 unique allocations, 0 duplicates.
- **Round outcomes:** 942 finishes / 58 blocks / 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = 908/34/0/0/0.
- **Policy:** deterministic seed/turn/player hash selects a legal action index. It is a validation policy, not a strategic arm.

## Six matched entry orders

All six seat-entry permutations replayed the same round outcomes. Every arm completed 76 matches with identical match-ending accepted-round indices (mean 13.158, median 14 rounds; no unfinished tail).

| Entry order | Matches | Applied nonzero | Zero skipped | Pending nonzero | Floor hits | Busts | Max score |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0-1-2 | 76 | 1,877 | 908 | 41 | 8 | 76 | 124 |
| 0-2-1 | 76 | 1,873 | 908 | 45 | 8 | 76 | 124 |
| 1-0-2 | 76 | 1,882 | 908 | 36 | 8 | 76 | 124 |
| 1-2-0 | 76 | 1,878 | 908 | 40 | 8 | 76 | 124 |
| 2-0-1 | 76 | 1,869 | 908 | 49 | 8 | 76 | 124 |
| 2-1-0 | 76 | 1,873 | 908 | 45 | 8 | 76 | 124 |

Across the 15 dependent pairwise contrasts, exploded-seat identity differed in 0–3 of 76 shared boundaries, survivor-place assignment in 5–17, and first-place identity in 3–15. No pair had a unique match-ending boundary.

## Proximity strata

The stratum is the smaller minimum pre-round gap to 101 across the two matched orders, among non-exploded seats with positive mapped deltas. Counts below pool the 15 dependent pairwise contrasts.

| Minimum pre-round gap | Pair-boundaries | Exploded-seat changes | Survivor-place changes | First-place changes |
|---|---:|---:|---:|---:|
| 1–10 | 885 | 27 | 128 | 107 |
| 11–20 | 195 | 0 | 26 | 26 |
| 21–40 | 60 | 0 | 0 | 0 |
| 41+ | 0 | 0 | 0 | 0 |
| No positive delta | 0 | 0 | 0 | 0 |

- **Most useful observation:** the prior 19M holdout's proximity pattern repeated: all observed order sensitivity in this cohort occurred at a minimum pre-round gap of 20 or less. At 21–40, there were no differences across 60 pooled pair-boundary comparisons. The 11–20 stratum is notable: survivor rank/first place changed 26 times while exploded-seat identity did not change. This is descriptive and the pairwise comparisons are dependent; it is not a physical scoring rule or a strategy advantage.
- **No 41+ cases** occurred, so this run says nothing about that stratum.

## Validation and cumulative scale

- **Validation:** 288 assertions passed; exact replay of the full 1,000-outcome cohort; separate 40-round smoke replay also matched exactly and resolved all rounds.
- **Cumulative order-sensitivity series:** this adds 1,000 accepted outcomes to three earlier disjoint cohorts (4,000 accepted outcomes total across four separate streams). The three six-permutation holdouts account for 3,000 outcomes; the initial 17M cohort tested three orders. Samples remain separate and were not pooled. Historical baseline was not mixed.
- **Limitations:** terminal-pip-plus-finish-minus remains provisional; blocks are unscored; event order is a manual PWA interaction, not a table rule. No strategy comparison or promotion.

- **Exact next action:** inspect event-level traces for the 26 rank changes in the 11–20 gap stratum where the exploded seat stayed the same. For each matched boundary, record event order, score before/after, threshold crossing, skipped zeros, and pending deltas; distinguish pending-event effects from survivor sorting. Do this on the existing matched cohort before spending another 1,000-deal holdout.

**Source blob hashes:** engine 82e5bd544a57683d5b4f7812beb2d4abf80da894; initializer 2fad29e516454580ec9a06115354e9866f3096e6; turn-kernel 94657896e1f8e471ceb2e9a65d1842b6102dff18; turn-dispatcher 55b0bcf3f1653c64b4e06bc95d7e917a480562a0; round-driver fbaad78865adbddde1ea6651e6a501dc0bde3203; match-scoring 8e91a87672cca56d65fa6ac6e07d4eb3589d019b; finish-score-match-integration c65202f6efa9d13fc41cbddffa9ed2134f53dd23.

**Reproducers:** [run-specific runner](../simulator/finish-score-event-order-proximity-six-permutation-20m.js), [test](../simulator/finish-score-event-order-proximity-six-permutation-20m-test.js), [machine data](2026-11-03-1952-finish-score-event-order-proximity-six-permutation-holdout.json), [shared runner](../simulator/finish-score-event-order-proximity-six-permutation-holdout.js).
