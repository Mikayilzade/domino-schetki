# 2026-10-28 21:53 (+04, Asia/Baku) — one-stone hand perturbation of double-continuation safety

- **Engine/rules:** `qosa-research-0.5.3 + double-hand-perturbation-1.0`, recovered `qosa-1.0.0` 3×9; both branch interpretations **PROVISIONAL**.
- **New seeds:** `2805200..2807399`, **2200** independent deterministic hidden allocations (200 for each of 11 hand configurations). **0 new complete rounds / 0 forced full-game continuations**.
- **Exact exhaustive audit:** baseline plus 10 single-tile substitutions in the seven-tile focal hand; each yields exactly 12 unknown tiles and **924 distinct 6+6 opponent partitions**. These exact partitions are NOT additional random samples. Public trace, 0-0 and 6-6, and initial legal actions are held fixed.
- **Comparison:** six action+continuation plans (single0/single6/chain06 × focal low/high), under both provisional branch interpretations and three opponent greedy policies. Safety means a playable second return in all six scenarios without earlier terminal. Scenario weights are **not** calibrated human-play probabilities.

| Focal hand | single0/low safe /924 | single6/high safe /924 | chain06/high safe /924 | chain06/low safe /924 |
|---|---:|---:|---:|---:|
| baseline | 924 | 924 | 500 | 9 |
| keep-zero-bridge | 924 | 924 | 435 | 0 |
| remove-zero-bridge | 849 | 924 | 467 | 105 |
| add-zero-four | 924 | 924 | 226 | 1 |
| add-two-three | 924 | 924 | 377 | 8 |
| add-zero-five | 595 | 586 | 469 | 66 |
| add-three-six | 924 | 924 | 248 | 37 |
| add-double-five | 924 | 924 | 867 | 381 |
| replace-six-link | 924 | 924 | 497 | 8 |
| remove-six-link | 924 | 769 | 465 | 399 |
| add-four-six | 924 | 924 | 358 | 110 |

- **Main finding:** previous 924/924 safety for single0/low and single6/high is a property of the **specific focal hand**. Across 11 closely related hands, universal safety holds in **9/11** and **9/11** configurations, respectively. Neither is a general game rule. Changing a single connector can create counterexamples even when both doubles and initial board ends are unchanged.
- **Validation:** 28-tile conservation and 924-partition count for all 11 configurations, 0-0/6-6 initial legal moves under both models, deterministic seeded replay, prior exact baseline 924/924/500 and seed 2785200 trap checked. Self-contained CommonJS-compatible source executed as pure V8 JS in this run; **Node CLI not executed**. Sampling is only a replay/calibration check against exact partitions.
- **Limitations:** Synthetic trace; uniform opponent hands not conditioned on observed decisions/passes; changed focal hand also changes opponent pool; two unverified branch models and simplified policies; no game win, minus, blocked ties, loneZero or match-101 outcome inferred.
- **Cumulative:** **1,380,975** incompatible-model complete rounds and **1,898,856** forced continuations unchanged; **490,000** opening deals unchanged; **736400** separate hidden allocations (734,200 previous + 2200 new). Historical 4,000 separate. Next unused seed >= **2807400**.
- **Reproduce:** `node qosha-research/simulator/double-hand-perturbation.js test`; `node qosha-research/simulator/double-hand-perturbation.js 2805200 200`; raw `runs/2026-10-28-2153-double-hand-perturbation.json`.
- **Exact next hypothesis/action:** obtain an authenticated real-play late-arrival branch example and optional multi-double timing; then retest across diverse chronological states with pass-conditioned hidden worlds before proposing a practical retention rule.
