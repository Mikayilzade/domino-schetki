# Matched three-order finish-score event-order sensitivity — 2026-11-03T16:47:36+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0 coded round model; primary 3×9 plus one stock. Branch/opening interpretation remains provisional.
- **Seeds/deals:** 17,000,000–17,001,028; 1,029 attempts, 29 first-round 1-1-in-stock redeal signals, 1,000 accepted rounds, 1,000 unique allocations, 0 duplicate allocations.
- **Round outcomes:** 955 finishes, 45 blocks, 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = 913/41/1/0/0. Blocks were not scored.
- **Policy:** deterministic seed/turn/player hash chooses a legal action index. This is a validation policy, not a strategy arm.
- **Matched orders:** 0-1-2, 1-2-0, and 2-0-1. Each order replayed the exact same 1,000 round outcomes. The score mapping remains provisional: each seat receives terminal hand pips, with finish-minus added to the empty finisher. Zero score inputs are skipped; after the PWA adapter completes a match, later nonzero events remain pending.

| Manual entry order | Matches | Mean / median rounds | Tail rounds | Nonzero events applied | Zero inputs skipped | Nonzero events pending | Floor hits | Bust events | Max score | Exploded seats (0 / 1 / 2) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 0-1-2 | 75 | 13.293 / 14 | 3 | 1,902 | 913 | 50 | 9 | 75 | 137 | 24 / 33 / 18 |
| 1-2-0 | 75 | 13.293 / 14 | 3 | 1,899 | 913 | 53 | 9 | 75 | 129 | 17 / 34 / 24 |
| 2-0-1 | 75 | 13.293 / 14 | 3 | 1,914 | 913 | 38 | 9 | 75 | 129 | 18 / 29 / 28 |

- **Paired boundary result:** all three arms completed matches at the same 75 accepted-round indices; no order had a unique match-ending boundary in this cohort. At those shared boundaries, the newly exploded seat differed in 7/75 comparisons for 0-1-2 vs 1-2-0, 10/75 for 0-1-2 vs 2-0-1, and 5/75 for 1-2-0 vs 2-0-1.
- **Most useful finding:** in this deterministic cohort, manual event order changed which seat exploded at a shared match boundary and changed applied/pending event counts and maximum observed score, while match-ending round indices and lengths stayed the same. This is PWA input-order sensitivity—not a strategy advantage or a physical scoring rule.
- **Validation:** regression suite passed 37 assertions, including the full 1,000-round cohort and an exact 40-round replay. Historical baseline was not pooled.
- **Confidence/limitations:** high confidence in exact deterministic replay of the fetched source modules. Only 3 of 6 possible seat permutations were tested; this is one 1,000-round stream. Terminal-pip-plus-finish-minus mapping remains provisional, blocks remain unscored, and manual PWA entry order is not a table rule.
- **Exact next action:** evaluate all 6 seat permutations on a disjoint 1,000-round holdout; test whether match-ending boundaries remain invariant and quantify exploded-seat / survivor-place sensitivity. Keep scoring assumptions explicit and do not promote a strategy.

**Source blob hashes used:** engine `82e5bd544a57683d5b4f7812beb2d4abf80da894`; initializer `2fad29e516454580ec9a06115354e9866f3096e6`; turn-kernel `94657896e1f8e471ceb2e9a65d1842b6102dff18`; turn-dispatcher `55b0bcf3f1653c64b4e06bc95d7e917a480562a0`; round-driver `fbaad78865adbddde1ea6651e6a501dc0bde3203`; match-scoring `8e91a87672cca56d65fa6ac6e07d4eb3589d019b`; finish-score-match-integration `c65202f6efa9d13fc41cbddffa9ed2134f53dd23`.

**Reproducers:** `simulator/finish-score-event-order-sensitivity.js` and `simulator/finish-score-event-order-sensitivity-test.js`.
