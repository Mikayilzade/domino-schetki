# 2026-10-29 16:50 +04 — exact third-turn mobility after two opponent replies

- **Engine/rules:** `qosa-research-0.5.3 + opening-third-return-exact-1.0`; recovered `qosa-1.0.0` 3×9 first-round `1-1` plus stock draw. Opponents choose one high- or low-pip legal tile; optional multi-double chains declined. Global-ever-open and current-only late-arrival branch models are both **provisional**.
- **Seed set:** reuse prior disjoint holdout deal seeds **2904520..2924519** (20,000 deals, 24 previously selected connector/gap-balanced starter hands); **0 new deals, 0 new random hidden allocations, 0 new full rounds, 0 new forced continuations**. Exact **24 × C(18,9) = 1,166,880** opponent partitions, not added to seeded Monte Carlo totals.
- **Paired choices:** play `1-X` while retaining owned `X-X`, versus play `1-Y` where `Y-Y` is unowned, on the same hand and exactly the same hidden world. Compare the starter's legal choices when the turn returns after one turn from each clockwise opponent.

| Metric: retain owned double minus unowned | High-pip opponents | Low-pip opponents |
|---|---:|---:|
| First-opponent pass | +7.353 pp | +7.353 pp |
| Second-opponent pass | +5.122 pp | +4.236 pp |
| Distinct playable starter stones on return | **+0.7611** | **+0.7306** |
| Legal placements (stone × branch) on return | **−0.3319** | **+0.0997** |
| Playable doubles on return | +1.0096 | +1.0073 |
| Available open `1` ends on return | **−0.5147** | **−0.2742** |
| Starter has any legal move | 100% both choices | 100% both choices |
| Hand-level legal-stone advantage | 24/24 positive | 22/24 positive, 2 negative |

- **Counterexamples:** under the low-pip policy, seed `2911227` (`X=4`, `Y=0`, 3 connectors) has **−0.05045** playable-stone delta despite **+4.005 pp** second-pass delta; seed `2904832` (`X=5`, `Y=3`, 4 connectors) has **−0.25294** playable-stone delta despite **+6.176 pp** second-pass delta. At world level, a second-pass gain coexists with *fewer* legal stones in **1.420%** (high) / **1.193%** (low) of all conditional partitions.
- **New finding:** retaining the matching double usually improves the number of *distinct stones* available when play returns, but can reduce the number of available **branch placements** and open `1` ends. A higher opponent pass probability is **not sufficient** to guarantee improved return mobility in every hand. Neither choice ever leaves this selected starter unable to move, because all 24 hands retain at least one `1` connector.
- **Validation:** local Node v22.16.0 full exact evaluation completed; 28-tile conservation, independent tile-level legal mask on every return state, per-hand first-pass hypergeometric identity, previous exact second-pass regression, and complete metric agreement of both provisional branch models in this two-turn window. New committed script is not separately run from a fresh GitHub checkout.
- **Confidence/limits:** exact conditional on these 24 deliberately balanced hands and the stated deterministic opponent policies. Not population-weighted; opponent worlds within a hand are not independent hand samples. Not first-place, win-rate, minus, block, score, or true decision-regret evidence. Human policies, later branch reopening, blocked ties, `loneZero`, bust and 101 remain unvalidated.
- **Reproduce:** `node qosha-research/simulator/opening-third-return-exact.js test` and `node qosha-research/simulator/opening-third-return-exact.js` (prints full per-hand JSON).
- **Cumulative unchanged:** **1,380,975** complete model rounds under incompatible rules; **1,898,856** forced continuations; **570,000** separate seeded opening deals; **775,568** separate seeded random hidden allocations; historical 4,000 separate. Next unused seed **>=2924520**.
- **Exact next action:** authenticate a real physical late-arrival branch reopening and blocked-tie outcome, then evaluate whether the legal-stone gain survives a *full* starter follow-up plus two further opponent turns, with matched hidden worlds and no unlabelled branch assumptions.
