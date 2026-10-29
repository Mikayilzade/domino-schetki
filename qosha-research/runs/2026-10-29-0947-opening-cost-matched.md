# Matched opening pip-sacrifice vs tempo (two opponent turns)

- **Timestamp Asia/Baku:** 2026-10-29T09:48:16+04:00
- **Engine/rules:** `qosa-research-0.5.3+opening-cost-matched-1.0`; recovered `qosa-1.0.0` 3×9, confirmed first-round `1-1` + one stock draw. Late-arrival `global-ever-open` and `all-current-only` are **both provisional**.
- **Seeds:** opening deals 2817640..2847639 (30,000 independent deterministic deals; 28946 valid, 1054 stock-1-1 reshuffles, 10797 mixed-choice, 5998 pip-conflict). Hidden-world seeds 2847640..2855319: **7680** new matched allocations, 240 selected positions × 32 worlds. **0 new complete rounds, 0 full-game forced continuations**.
- **Actual legal choices:** play `1-X` with owned `X-X` retained (largest owned X), versus play higher-pip `1-Y` with unowned `Y-Y` (largest unowned Y). The same hand, opponents' 18 unknown tiles and world seed are used for both. Selection: first 120 qualifying hands with immediate pip sacrifice 1–2 and first 120 with sacrifice 3+, **not a representative hand sample**. Average immediate sacrifice **2.746 pips**.
- **Opponent policies:** high-pip or low-pip legal action; single stone or voluntary chained doubles (up to four); same continuation policy for both candidate moves. Two opponent turns, then count distinct legal tiles available to starter. Both provisional branch models evaluated separately; **zero model differences in these aggregate deltas**.

| Policy | Opponent stones, owned − high-pip | 95% exploratory position-cluster interval | Starter return legal stones, owned − high-pip | Next opponent pass advantage |
|---|---:|---:|---:|---:|
| high-single | -0.1199 | [-0.1359, -0.1040] | +0.6198 | +5.82 pp |
| high-chain | -0.2770 | [-0.2942, -0.2597] | +0.4388 | +5.82 pp |
| low-single | -0.1008 | [-0.1151, -0.0865] | +0.8637 | +5.82 pp |
| low-chain | -0.1844 | [-0.2006, -0.1682] | +0.7539 | +5.82 pp |

- **Gap strata (high-chain):** 1–2 pip sacrifice: opponent stones delta **-0.2776**, starter mobility **+0.3917**; 3+ pips: **-0.2763**, mobility **+0.4859**.
- **Exact first-pass calibration:** theoretical mean paired advantage **+6.01 pp**; sampled **+5.82 pp**. Tested 28-tile conservation, legal locked branch, optional double chain, no ordinary-plus-double append, deterministic replay and pass calibration in V8 JavaScript; **Node CLI from fresh checkout not run**.
- **Finding:** preserving the matching double suppresses immediate opponent tempo under all four simple opponent policies even when it costs 1–2 or 3+ immediate pips. **This does not establish a better winning policy**: the pip sacrifice is real, the comparison changes branch geometry, and later-game win/median remainder/minus/regret remain unknown.
- **Confidence/limitations:** paired worlds and position-cluster exploratory intervals, nonrandom position selection; opponents are deterministic toy policies; both late-arrival branch interpretations unverified; blocked winner/ties, loneZero, bust, 101 scoring unresolved. Do not pool these short windows with incompatible complete model rounds.
- **Reproduce:** `node qosha-research/simulator/opening-cost-matched.js` (prints complete per-policy, per-model JSON metrics); source `simulator/opening-cost-matched.js`.
- **Cumulative after run:** **1,380,975** incompatible-model complete rounds, **1,898,856** prior forced continuations, **756,368** separate seeded hidden allocations (748,688 prior + 7,680 new), **520,000** deterministic opening deals (490,000 prior + 30,000 new). Historical 4,000 separate. Next unused random seed **>=2855320**.
- **Exact next hypothesis/action:** authenticate physical late-arrival branch unlocking and blocked ties; then test first-finish/minus/decision regret for these same-hand actions under a confirmed full-round ruleset. Until then, keep this as an opening-only tempo tradeoff.
