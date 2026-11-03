# Six-permutation PWA score-order proximity holdout — 2026-11-03T18:52:25+04:00 (Asia/Baku)

- **Engine/rules:** `qosha-research-0.5.3`; recovered `qosa-1.0.0` coded 3×9 + one-stock round model. Branch/opening semantics remain provisional. The active-PWA finish-pip-plus-finisher-minus score mapping is still an explicit assumption; block outcomes are left unscored.
- **Deals/seeds:** accepted first-round outcomes from attempt seeds **19,000,000–19,001,040**; 1,041 attempts, 41 redeal signals, 1,000 accepted deals, 1,000 unique allocations, 0 duplicates. The deterministic seed/turn/player hash selects a legal action index; it is a validation policy, not a strategic arm.
- **Round outcomes:** 942 finishes / 58 blocks / 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = **900/42/0/0/0**. Blocks remain unscored.
- **Six matched input orders:** all six seat permutations replayed the same round stream. Every arm completed **73 matches** on identical boundary indices (mean 13.589, median 13 rounds; 8-round unfinished tail). Pairwise event-order contrasts: exploded-seat identity changed in **0–5/73**, survivor places in **2–15/73**, first place in **2–11/73**.
- **Proximity stratification:** the gap is `101 − pre-round score` for non-exploded seats receiving a positive mapped delta. For a matched pair, the closer of the two arms' gaps assigns the stratum. Counts pool 15 *dependent* pairwise contrasts:

| Minimum pre-round gap | Matched pair-boundaries | Exploded-seat changes | Survivor-place changes | First-place changes |
|---|---:|---:|---:|---:|
| 1–10 | 825 | 27 | 92 | 74 |
| 11–20 | 225 | 18 | 45 | 27 |
| 21–40 | 45 | 0 | 0 | 0 |
| 41+ | 0 | 0 | 0 | 0 |

- **Most useful observation:** in this holdout, all observed order sensitivity was in boundaries where a positive-delta seat was within 20 points of 101; no differences appeared in the 45 pooled 21–40 pair-boundaries. This is descriptive only: there are just 3 such boundaries per pair, the 15 contrasts are dependent, and the scoring adapter remains provisional. It does **not** establish a physical scoring rule or strategic advantage.
- **Validation:** exact deterministic replay; 308 regression assertions passed, including event accounting, all 15 paired contrasts, identical 73 match boundaries, proximity strata, and a 40-round smoke replay.
- **Cumulative order-sensitivity scale:** this adds 1,000 accepted outcomes to the two earlier disjoint 1,000-outcome cohorts (3,000 accepted outcomes total across separate cohorts; no cross-cohort pooling). Historical baseline not mixed.
- **Exact next action:** run a further disjoint 1,000-outcome holdout from seed 20,000,000 with the same predeclared bins; check whether the concentration of changes within 20 points of 101 repeats. If it does, inspect event-level crossing/pending mechanics before making any broader claim.

Reproducers: [runner](../simulator/finish-score-event-order-proximity-six-permutation-holdout.js), [test](../simulator/finish-score-event-order-proximity-six-permutation-holdout-test.js), [machine data](2026-11-03-1852-finish-score-event-order-proximity-six-permutation-holdout.json).
