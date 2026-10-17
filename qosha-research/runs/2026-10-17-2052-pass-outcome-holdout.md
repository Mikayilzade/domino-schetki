# Qoşa exact-pass outcome holdout — 2026-10-17 20:52 Asia/Baku

Engine: `qosa-research-0.5.3`; recovered rules `qosa-1.0.0`; primary 3×9. Runner: `simulator/pass-outcome-holdout.js`.

Reproduce:
`node qosha-research/simulator/pass-outcome-holdout.js 800000 830000 30 64`
`node qosha-research/simulator/pass-outcome-holdout.js 830000 860000 30 64`

## Sampling
Two disjoint seed sets 800000..829999 and 830000..859999; 5,807 and 7,331 deals scanned, 30 first-eligible reachable late-game positions each (23 and 22 with unequal exact-pass forecasts). 64 hidden-world allocations per position: **3,840 hidden worlds** and **23,040 forced-candidate continuations**. No new full strategy rounds; verified **186,000** full strategy rounds unchanged; historical 4,000 separate. Deterministic world seeds: `(1800000000+Math.imul(dealSeed,103)+worldIndex)>>>0`.

The two actions are equal-pip connector vs unrelated single; same own hand, visible board, played tiles and unknown-world allocation; stock empty; next opponent has 1–2 stones. Compare action with **higher exact immediate next-opponent pass probability** against lower, with 7/8 pass ties omitted. Discovery strategy `min-hand-pips`; continuation policies `closed-branch-control`, `min-hand-pips`, `fast-doubles`. Metrics: own finish-first, remaining pips, and own minus-finish probability (−10/−20 etc). Block winners not assigned.

## Position-weighted results (higher-pass minus lower-pass action)

| Deal seeds | Continuation | Finish-first difference | Mean remainder | Minus-finish difference |
|---|---|---:|---:|---:|
| 800000..829999 | closed-branch | +25.61 pp (CI +8.07..+43.16) | -2.85 | +23.71 pp |
| 800000..829999 | min-pips | +22.01 pp (CI +5.76..+38.26) | -2.76 | +19.36 pp |
| 800000..829999 | fast-doubles | +1.02 pp (CI -0.52..+2.55) | -1.18 | 0 pp |
| 830000..859999 | closed-branch | +35.80 pp (CI +18.46..+53.13) | -3.19 | +31.46 pp |
| 830000..859999 | min-pips | +35.80 pp (CI +18.46..+53.13) | -3.19 | +31.46 pp |
| 830000..859999 | fast-doubles | +0.92 pp (CI -0.51..+2.36) | -2.16 | 0 pp |

Exploratory 95% normal confidence intervals cluster at **position** level (not independent sampled worlds); no multiple-testing correction. Higher-pass candidate was connector in 11/23 and 9/22 informative positions, unrelated in 12/23 and 13/22. Thus this is not simply a connector-vs-unrelated result.

## Validation and confidence
Executed runner in V8 CommonJS harness (not Node CLI). Deterministic fixture seed 715654 reproduced identically twice: 2 worlds, 12 continuations, exact pass difference -3/7. Both 64-world sets finished without unresolved outcomes. Full selected deal seeds and position-level metrics are generated in the runner JSON output.

**Provisional, policy-dependent result:** in these selected late-game positions, higher forecast pass chance coincides with materially better finish-first rates against two bot policies on disjoint seeds, **not** against fast-doubles. This is NOT proof that forcing the pass causes the advantage: changed branch geometry, tile identity, and later connector access are confounded. Further limitations: first-eligible selection, assumed branch opening, uniform hidden allocations ignore opponent history, 64 worlds/position, deterministic bots, block winner unspecified; finish-first is not full match win. Do not generalize these numbers to human opponents.

## Exact next hypothesis/action
Stratify by next opponent's hand size (1 vs 2); add same-pass and same-geometry controls, then compare a pass-maximizing move policy against branch-control on fresh matched seeds. Keep all changes in `qosha-research/`; do not modify scoreboard/PWA files.
