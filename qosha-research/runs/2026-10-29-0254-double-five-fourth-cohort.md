# 2026-10-29 02:56:19 (+04 Asia/Baku) — fourth disjoint 5-5 holdout and matched-policy safety

- **Engine/rules:** `qosa-research-0.5.3 + double-five-fourth-cohort-1.0 (analysis only)` / recovered `qosa-1.0.0` 3×9. Both late-arrival branch models **PROVISIONAL**; synthetic public history and greedy opponents.
- **Fresh seeds:** `2813544..2815591` = **2,048** seeded hidden allocations (32 hands × 64); **0** new complete rounds, **0** opening deals, **0** full-game forced continuations.
- **Exact enumeration:** 32 previously unseen hash-ranked hands (indices 24..31 in each of four zero/six connector strata) × 924 partitions = **29,568 exact conditional allocations**. Do not count these as independent new random worlds.
- **Controls:** existing `double-hand-perturbation.test()` and `double-connectivity-strata.test()` passed; 28-tile conservation, disjoint selection, deterministic seed replay, exact paired 2×2 contingency/marginal checks. Executed in V8 CommonJS-compatible evaluation; **Node CLI not run**.
- **Policies:** `single0/low`, `single6/high`, `chain06/high`, `chain06/low`. Same hidden world and six combinations of two branch models × three opponent policies per plan. Safety = legal focal stone on second return, with no earlier terminal in **all six** scenarios. The six scenarios are not probabilities.

## Previously specified structural prediction (not causal)

| Connector stratum | 5-5 hands / other hands | Chain safe with 5-5 | Chain safe without 5-5 | Difference |
|---|---:|---:|---:|---:|
| Z0/S0 | 5 / 3 | 48.27% | 19.08% | +29.18 pp |
| Z+/S0 | 1 / 7 | 87.88% | 26.89% | +60.99 pp |
| Z0/S+ | 1 / 7 | 22.62% | 17.59% | +5.02 pp |
| Z+/S+ | 2 / 6 | 41.94% | 36.62% | +5.32 pp |

The 5-5 association remains positive in **4/4 strata**; equal-stratum gap **+25.13 pp**. Prior three cohorts: +36.58, +35.22 and +23.91 pp. Fourth: +25.13 pp. **Small cells (1 or 2 5-5 hands in three strata)**, hand/pool confounding and post-hoc feature selection prevent causal or population claims.

## Primary within-hand paired comparison

| Plan | Robustly safe partitions / 29,568 | Safety |
|---|---:|---:|
| single0/low | 26,726 | 90.39% |
| single6/high | 24,535 | 82.98% |
| chain06/high | 9,462 | 32.00% |
| chain06/low | 6,819 | 23.06% |

On the **same exact hidden partitions**: `chain06/high` versus `single0/low` has **682 chain-only safe**, **17946 single-only safe**, **8780 both safe**, and **2160 neither safe**. The chain is safer on **0/32 focal hands**, including **0/9 hands containing 5-5**. This is a paired comparison of *synthetic second-return mobility*, not winning chances or proof of a universal rule.

The seeded diagnostic reused the exact conditional pools with a fresh deterministic seed set; max absolute hand/plan sample-to-exact deviation is 17.14 pp with only 64 samples per hand, so rely on exact counts for this fixture.

## Limits, cumulative scale, next

- **Cumulative:** 1,380,975 incompatible-rule complete model rounds (unchanged); 1,898,856 forced continuations (unchanged); 490,000 opening deals (unchanged); **744,592** separate seeded hidden allocations (**742,544 + 2,048**). Historical 4,000 separate. Next unused seed **>=2815592**.
- **Finding:** 5-5 repeatedly predicts better chain mobility *relative to other chain hands*, yet **does not make spending both doubles preferable to keeping one** in any of these 32 tested hands. This narrows the human hypothesis, not a confirmed tactic.
- **Confidence:** high for exact combinatorics, deterministic replay, and matched-policy comparison within this synthetic fixture; low for real-game transfer. Authentic late-arrival unlocking, block winner/ties, optional double timing, loneZero and 101 scoring remain unresolved.
- **Exact next action:** stop repeating uninformative 5-5-only cohorts; obtain a real chronological late-arrival branch fixture and blocked-tie scoring example, then test same-hand policies against pass-conditioned posterior worlds and measure full-round outcomes only after rules are validated.

Reproduce: `node qosha-research/simulator/double-five-fourth-cohort.js test`; `node qosha-research/simulator/double-five-fourth-cohort.js 2813544 64`. Machine-readable data: `runs/2026-10-29-0254-double-five-fourth-cohort.json`. No scoreboard/PWA or GitHub Actions modifications.
