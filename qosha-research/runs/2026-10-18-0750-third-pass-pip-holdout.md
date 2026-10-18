# Third fresh-seed public pass–pip holdout — 2026-10-18 07:50 Asia/Baku

Engine `qosa-research-0.5.3`, rules `qosa-1.0.0`, primary 3×9 later-round. Deterministic V8 CommonJS self-test passed (96 replay rounds); Node CLI was not run. Fresh seeds 1064000..1064159 (two disjoint 80-seed cohorts), **160 unique deals, 3840 complete matched-seat rounds, zero unresolved**. Previous 211680 + 3840 = **215520 cumulative matched-seat rounds**, historical 4000 separate.

Public-pass-pip-0.01 vs pure public-pass, identical deal/focal seat and two identical opponents; comparator policies no-pass and pip-weight 0.025 also run and included in JSON. `finishFirst` is first finisher, not match winner. `meanPips` is raw remainder; block winner unassigned.

| Opponent | Cohort | Pass first % | Hybrid first % | Δ first pp (95% seed CI) | Δ pips | Δ block pp |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| closed-branch-control | 1064000..1064079 | 43.33 | 39.17 | -4.17 [-9.54, 1.21] | -0.11 | 0.42 |
| closed-branch-control | 1064080..1064159 | 37.50 | 38.33 | 0.83 [-4.97, 6.64] | -0.01 | -0.83 |
| moderate-double-hold | 1064000..1064079 | 50.00 | 45.00 | -5.00 [-10.71, 0.71] | -0.24 | 3.33 |
| moderate-double-hold | 1064080..1064159 | 45.83 | 45.83 | -0.00 [-6.97, 6.97] | -0.37 | 0.83 |

**Finding:** The previously reported hybrid improvement did not replicate on these fresh seeds: three cohorts show a non-positive first-finisher delta, one shows a small positive delta, and every exploratory interval includes zero. Lower raw remainder in all four cells is likewise uncertain. No reliable new general gameplay rule.

**Limitations/confidence:** exploratory normal 95% CIs cluster by deal seed with 3 focal seats averaged; 80 seed clusters per cell, no multiplicity correction. Both opponent mixes reuse the same deals, so they are not independent replications. Opponent action history is ignored in uniform public unknown-pool pass estimates; branch opening assumptions are provisional; 5-player mode and full-match score floor/bust are not tested. This is evidence about deterministic bot policies, not human play.

**Exact next hypothesis/action:** test whether pass–pip tradeoffs vary with own remaining hand size (1–3, 4–6, 7–9) and the discarded-pip gap, using fixed-visible paired hidden-world counterfactuals on disjoint new seeds 1064160..1065559. Compare both forced legal actions under identical sampled hidden worlds and continuation policies; report finish-first, remainder, minus, blocks, and position-level regret. Run Node CLI invariants in an executable checkout.

Reproduce: `node qosha-research/simulator/public-pass-pip-frontier.js test` then `node -e "console.log(JSON.stringify(require('./qosha-research/simulator/public-pass-pip-frontier').run(1064000,80),null,2))"`. Data: `runs/2026-10-18-0750-third-pass-pip-holdout.json`.
