# 2026-10-28-2347 (+04 Asia/Baku) — independent connector-stratum exact holdout

- **Engine/rules:** `qosa-research-0.5.3 + double-connectivity-holdout-1.0`, recovered `qosa-1.0.0` 3×9. **Both branch interpretations PROVISIONAL.**
- **New seeds:** `2809448..2811495`; **2,048** fresh seeded hidden allocations (32 hands × 64), **0** new full rounds, **0** new forced full-game continuations.
- **Exact study:** next 8 hash-selected hands in each of four connector strata, disjoint from previous 8/stratum; **32 × C(12,6)=29,568** exact hand-world partitions (not independent new random worlds), same worlds compared across four plans and six model/opponent scenarios. 28-tile conservation and deterministic replay checked; prior regression fixtures passed. Executed via V8 CommonJS-compatible harness; Node CLI not executed.
- **Metric:** robust second-return mobility (a legal focal move and no earlier terminal) **in all 2 provisional branch models × 3 greedy opponent policies**. This is neither win rate nor probability over the six scenarios.

| Focal connector stratum | Single 0-0 then low | Single 6-6 then high | Both then high | Both then low |
|---|---:|---:|---:|---:|
| Z0/S0 | 74.1% (1/8 universal) | 59.7% (0/8) | 31.1% | 33.8% |
| Z+/S0 | 94.1% (7/8 universal) | 79.1% (0/8) | 35.4% | 22.4% |
| Z0/S+ | 88.1% (0/8 universal) | 89.3% (2/8) | 24.1% | 23.3% |
| Z+/S+ | 94.0% (5/8 universal) | 96.7% (4/8) | 45.6% | 20.9% |

- **Important counterexample:** prior discovery sample reported 8/8 universally safe for `Z+/S0` under single0/low. First fresh holdout hand `0-0, 6-6, 0-2, 0-4, 0-5, 2-5, 5-5` is safe only **490/924** exact opponent partitions, despite possessing 0-connectors and no 6-connector. The apparent universal connector rule **fails out of sample**. Other holdout rows are in the raw JSON.
- **Confidence:** high for this synthetic-model falsification because exhaustive within-hand allocations and disjoint hand selection; **no inference to authentic physical rules**, and no evidence of improved winning chances. Samples of 8 hands/stratum are descriptive, not representative population estimates.
- **Cumulative:** **1,380,975** incompatible-rule model rounds unchanged; **1,898,856** forced continuations unchanged; **490,000** opening deals unchanged; **740,496** separate synthetic hidden allocations (738,448 + 2,048). Historical 4,000 excluded.
- **Reproduce:** `node qosha-research/simulator/double-connectivity-holdout.js test`; `node qosha-research/simulator/double-connectivity-holdout.js 2809448 64`. Data `runs/2026-10-28-2347-double-connectivity-holdout.json`.
- **Exact next action:** isolate which zero-connector arrangements and other hand links explain counterexamples, with within-hand matched policies and disjoint holdouts; authenticate physical late-arrival branch unlocking and optional double-chain timing before any full-game win/minus recommendations.
