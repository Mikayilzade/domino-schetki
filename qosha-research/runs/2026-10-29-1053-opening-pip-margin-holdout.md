# Independent opening pip-margin holdout — 2026-10-29T10:53:49+04:00 Asia/Baku

- **Engine/rules:** `qosa-research-0.5.3+opening-pip-margin-holdout-1.0`, recovered `qosa-1.0.0`, first-round 3×9 opening with `1-1` and one stock draw. Both late-arrival branch models **provisional**; neither blocked ties nor 101 scoring used.
- **Independent seeds:** opening deals **2855320..2885319** (30,000 deterministic, 28,931 valid, 1069 stock-1-1 reshuffles); hidden-world seeds **2885320..2904519** (**19,200 distinct matched allocations**, 600 selected positions × 32 worlds). 0 new full rounds and 0 forced full-game continuations.
- **Same-hand choice:** play `1-X` retaining owned `X-X` (largest eligible X) versus higher-pip `1-Y` with unowned `Y-Y`, Y>X. 300 first eligible positions with immediate sacrifice 1–2 and 300 with 3+; **not a representative random sample**. Mean immediate sacrifice **2.755 pips**.
- **Paired evaluation:** same opponent hidden hands and same seeded policy for both choices. Two opponent turns, with single tile or optional double chain up to four. High-pip, low-pip, and seeded-random legal-move opponents; both provisional branch interpretations evaluated separately.
- **Pip margin:** (sum of both opponents' remaining pips) − (starter's remaining pips) after two opponent turns. Positive *owned − high-pip* means the owned-double connector improved this **short-window relative pip margin**, **not** a win probability.

| Opponent policy | Opponent pips shed, owned−high | Relative pip margin, owned−high | Exploratory 95% position-cluster CI | Gap 1–2 | Gap 3+ |
|---|---:|---:|---:|---:|---:|
| high-single | -6.32 | 3.56 | [3.28, 3.85] | 4.73 | 2.40 |
| high-chain | -7.51 | 4.76 | [4.48, 5.03] | 5.83 | 3.68 |
| low-single | -0.94 | -1.81 | [-1.96, -1.67] | -0.50 | -3.13 |
| low-chain | -1.79 | -0.97 | [-1.13, -0.80] | 0.42 | -2.35 |
| random-single | -2.15 | -0.60 | [-0.77, -0.43] | 0.75 | -1.95 |
| random-chain | -2.82 | 0.07 | [-0.11, 0.24] | 1.40 | -1.27 |

- **Finding:** despite suppressing opponent moves in all six policies, the relative pip-margin sign **reverses by opponent policy**: high-pip bots favour keeping the matching double, low-pip bots favour immediately shedding more pips; seeded-random single favours shedding, random chain is near zero with an interval crossing zero. The same result holds in both provisional branch models **within this two-turn horizon**. Therefore the previous tempo advantage **does not imply a universal pip or winning advantage**.
- **Validation:** deterministic small-run replay (32 worlds × 12 modes), 28-tile conservation, locked-branch and optional-double checks, paired pip-margin identity `Δmargin = −Δ(opponent pips shed) − immediate sacrifice`, exact first-pass calibration, 20 deal-seed replays, and zero two-turn aggregate disagreement between provisional branch models. Executed in V8 CommonJS-compatible runtime; **Node CLI from fresh checkout not run**.
- **Limitations:** selected opening conflicts, not representative full hands; high/low/random toy opponent policies; candidate pip value and branch geometry confounded with double ownership; exploratory CIs clustered by position, not independent worlds; only two opponent turns, no full-game win rate, median remainder, block, minus, regret or 101 match claims. Late-arrival physical rule and blocked tie unresolved.
- **Cumulative:** **1,380,975** complete model rounds across incompatible rule assumptions (unchanged), **1,898,856** prior forced continuations (unchanged), **775,568** separate seeded hidden-world allocations (756,368 + 19,200), **550,000** deterministic opening deals (520,000 + 30,000); historical 4,000 rounds separate. Next unused seed **>=2904520**.
- **Reproduce:** `node qosha-research/simulator/opening-pip-margin-holdout.js test`; `node qosha-research/simulator/opening-pip-margin-holdout.js`. Raw: [JSON](2026-10-29-1053-opening-pip-margin-holdout.json).
- **Exact next action:** authenticate a real late-arrival branch reopening and blocked tie scoring; then evaluate matched first-finish/minus regret under confirmed rules, and compare pip-balanced connector alternatives on fresh seeds.
