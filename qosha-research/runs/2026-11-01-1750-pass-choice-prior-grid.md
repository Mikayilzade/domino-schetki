# Discovery-selected prior-grid pass-choice audit — 2026-11-01 17:50:15 +04

- **Runner:** `simulator/pass-choice-prior-grid.js`; engine `qosha-research-0.5.3`; recovered `qosa-1.0.0`, 3×9 + stock. Four-side number-lock, late reopening and block/tie scoring remain **PROVISIONAL**.
- **Seeds:** `3412770–3413169`; 400 unique full deal allocations, split 200 discovery / 200 holdout. Opponent mixes: random-legal/random-legal, tempo-open/tempo-open, anti-minus/anti-minus, random-legal/tempo-open; three seat rotations.
- **Diagnostic trajectories:** 4,800 rounds (4,599 finishes / 201 blocks; 4.19% block rate), mean 25.47 turns, 0 unresolved. Minus finishes: −10 639, −20 29, −30 1, −40 0. Not a strategy-strength tournament.
- **Discovery prior grid** (lower Brier is better; gain is state-clustered pass-only minus mixture, approximate 95% half-width):

  | Closed-control prior | Pass-only Brier | Mixture Brier | Clustered gain ± half-width | Mean ESS |
  |---:|---:|---:|---:|---:|
  | 10% | 0.11933 | 0.10032 | +0.02294 ± 0.03310 | 53.2/64 |
| 20% | 0.11933 | 0.10084 | +0.02257 ± 0.03381 | 52.8/64 |
| 50% | 0.11933 | 0.10175 | +0.02176 ± 0.03595 | 51.3/64 |
| 80% | 0.11933 | 0.10192 | +0.02101 ± 0.03858 | 49.2/64 |
- **Selection rule:** choose the prior with the largest positive discovery clustered gain; ties go to the lower prior. If none is positive, select pass-only. The selected prior was **10%**; discovery gain 0.02294 ± 0.03310. Discovery intervals include zero, and the 4-way selection is exploratory; the untouched holdout guards against selection optimism.
- **Locked holdout:** 35 uncertain positions / 46 labels. Pass-only Brier 0.12371; selected-mixture Brier 0.12066; paired state-clustered gain **+0.00553 ± 0.01187** (approx. 95%). The interval includes zero.
- **Hidden-world coverage:** 16,512 draws; 3,952 unique complete allocations counted **within visible states**; 12,560 repeated draws (76.07%). In the selected holdout uncertain-state subset: mean 25.34 unique worlds and ESS 55.47/64 (86.67%).
- **Regression:** prior-grid deterministic/accounting test passed 10 checks. These validate coded contracts, not physical rule truth. V8 execution used exact GitHub-fetched CommonJS modules; native Node checkout could not be launched because GitHub DNS was unavailable.
- **Finding / confidence:** 10% closed-control prior won discovery, but holdout gain is small and uncertain. No reliable predictive improvement and no tactic promoted. High confidence in deterministic replay/accounting; low external validity because opponent policies/likelihoods are synthetic, pass positions are enriched, importance samples are finite/repeated, and physical branch/block rules are unauthenticated.
- **Cumulative:** separate validation/opening/tie-break allocation cohorts **7,150** (6,750 + 400); reachable-position property audits **39,262**; strategy-strength holdout unchanged at **1,500 deals / 18,000 arm-rounds** (+120-deal / 1,440-arm pilot). This diagnostic cohort is not added to the tournament.
- **Exact next action:** lock the 10% prior and run a disjoint 400-deal holdout on seeds **3413170–3413569**, with no re-selection. If the clustered interval again crosses zero, close the choice-history weighting line as unsupported and prioritize an authenticated physical branch-opening / block-scoring trace.
