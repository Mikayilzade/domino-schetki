# 2026-10-29 00:51 (+04 Asia/Baku) — 5-5 as a structural countercondition (post-hoc audit)

- **Engine/rules:** `qosa-research-0.5.3 + double-five-structural-audit-1.0` / recovered `qosa-1.0.0` 3×9. Both branch interpretations **PROVISIONAL**.
- **New simulations:** **0** deals, **0** hidden allocations, **0** full rounds, **0** forced continuations. Reanalysed **64 disjoint focal hands × 924 exact opponent partitions = 59,136 previously computed conditional partitions**. Do not add these to cumulative random worlds.
- **Source cohorts:** discovery `2807400..2809447` and disjoint holdout `2809448..2811495` (original seeded allocations, not newly generated); each has 8 hash-ranked hands per zero/six connector stratum.
- **Policies:** `single0/low`, `single6/high`, `chain06/high`, `chain06/low`, compared on identical exact opponent partitions within each focal hand. Metric: fraction of partitions with a legal second-return move and no earlier terminal **under all 2 branch models × 3 greedy opponent policies**; scenarios are not real probabilities.

## Main observation — chain06/high

| Cohort | Hands with 5-5 | Safe with 5-5 | Safe without 5-5 | Unstratified gap | Equal-stratum gap |
|---|---:|---:|---:|---:|---:|
| Discovery | 14 / 32 | 54.44% | 24.52% | 29.92% | 36.58% |
| Holdout | 15 / 32 | 50.71% | 19.34% | 31.37% | 35.22% |

- All **4/4 connector strata** show a positive association in each cohort (**8/8 cohort-stratum cells**), unlike the earlier blanket claim that any 0-connector guarantees safety.
- Holdout equal-stratum difference: **35.22%**; hand-level stratified bootstrap 95% interval **[20.01%, 51.22%]** (10,000 fixed-seed resamples). Within-stratum permutation exploratory two-sided p ≈ **0.0001** (10,000 fixed-seed permutations). These are **not confirmatory p-values**: the feature was inspected after looking at several candidates, including the holdout.
- **Practical counterweight:** chain06/high was safer than `single0/low` in only **1/32 discovery** and **0/32 holdout** hands. Presence of 5-5 **does not justify** automatically spending both 0-0 and 6-6.
- This is an association between hand compositions with **different conditional opponent pools**, not a causal comparison of adding 5-5 to an otherwise fixed hand, and **not a win-rate or minus-risk claim**.

## Confidence and exact next action

Confidence high for deterministic reanalysis of exact counts; limited for real play because the synthetic trace, branch reopening, optional double timing, greedy continuations, blocked ties, loneZero/bust and 101 scoring remain unauthenticated. Hash-ranked 8-hand strata are not population samples.

**Next:** pre-register the 5-5 predictor and test unseen hash-ranked hands **16..23** in each of the four connector strata (32 hands × 924 exact partitions, optional fresh hidden-world seeds **2811496..2813543** for 64 per hand). Compare all four plans, record counterexamples, and obtain a real late-arrival branch fixture before promoting tactics.

**Reproduce:** `node qosha-research/simulator/double-five-structural-audit.js`; raw `runs/2026-10-29-0051-double-five-structural-audit.json`. No scoreboard/PWA or GitHub Actions touched.
