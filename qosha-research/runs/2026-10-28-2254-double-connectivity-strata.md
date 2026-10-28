# 2026-10-28 22:54 (+04, Asia/Baku) — double retention by connector structure

- **Engine/rules:** `qosa-research-0.5.3 + double-connectivity-strata-1.0`, recovered `qosa-1.0.0` 3×9. **Both late-arrival branch interpretations remain PROVISIONAL.**
- **New deterministic seeds:** `2807400..2809447`; **2,048** fresh sampled hidden allocations (32 focal hands × 64). **0 new full rounds / 0 full-game continuations**.
- **Exact study:** enumerate all **6,188** possible five-nondouble additions to a fixed hand with 0-0 and 6-6; stratify by whether at least one connector touches 0 and/or 6. Deterministically hash-select 8 distinct hands per stratum, then exhaustively evaluate **924 = C(12,6)** opponent allocations per hand (**29,568** exact hand-world partitions, NOT 29,568 additional random worlds). Compare four focal action+continuation plans under 2 provisional branch models × 3 opponent greedy policies. The same hidden allocation is used for all actions for a given hand.
- **Metric:** safety = second-return legal move, with no earlier terminal, **in all six model/opponent scenarios**. Scenario choices are not probabilities; this is NOT a win-rate metric.

| Connectors in focal hand | Single 0-0 then low | Single 6-6 then high | Chain both then high | Chain both then low |
|---|---:|---:|---:|---:|
| Neither 0 nor 6 | 80.4% (2/8 universal) | 46.3% (0/8) | 43.8% | 48.1% |
| At least one 0, no 6 | 100.0% (8/8 universal) | 94.7% (1/8) | 36.4% | 19.5% |
| No 0, at least one 6 | 93.7% (3/8 universal) | 82.7% (3/8) | 31.8% | 25.5% |
| Both 0 and 6 | 92.5% (6/8 universal) | 95.6% (6/8) | 38.4% | 19.0% |

- **Finding:** in this synthetic two-cycle fixture, keeping one double is often more robust for retaining a legal move than playing both immediately. With a 0-connector but no 6-connector, **single0/low was safe for all 924 allocations in all 8 sampled hands**, but the same rule fails on other connector structures. For hands with neither 0 nor 6 connectors, mean exact safety of single6/high was only **46.3%**. This is a *structural observation*, not a validated real-game recommendation.
- **Validation:** baseline `double-hand-perturbation.test()` passed; 6,188 candidate hands, unique 32 focal hands, 28-tile conservation, 924 exact partitions/hand, initial action legality under both models and deterministic seed replay. Pure V8 CommonJS-compatible execution; Node CLI not executed.
- **Limitations:** fixed synthetic public trace; opponents sampled uniformly, not conditioned on real passes/choices; two unverified branch rules; artificial continuation policies. Hand strata have very unequal underlying populations (56, 736, 736, 4,660); 8 hash-selected hands per stratum are **not** population estimates. No blocked winner, 101 scoring, minus, or full-game win inference.
- **Cumulative:** **1,380,975** complete model-rounds across incompatible assumptions and **1,898,856** forced continuations unchanged; **490,000** opening deals unchanged; **738,448** separate synthetic hidden allocations (736,400 previous + 2,048 new). Historical 4,000 rounds excluded.
- **Reproduce:** `node qosha-research/simulator/double-connectivity-strata.js test`; `node qosha-research/simulator/double-connectivity-strata.js 2807400 64 8`; raw `runs/2026-10-28-2254-double-connectivity-strata.json`.
- **Exact next action:** authenticate real late-arrival branch unlocking and optional multi-double timing; then repeat on chronological pass-conditioned positions and evaluate win/minus risk only after rules are confirmed.
