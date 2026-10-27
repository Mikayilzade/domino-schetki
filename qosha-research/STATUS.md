# Qoşa research status

Updated: 2026-10-27T21:49:54+04:00 (Asia/Baku)

## Verified cumulative
- Global provisional rounds **1,342,575**; one-side counterfactual **28,800**; all-current counterfactual **9,600**.
- **1,380,975** full model-rounds across incompatible assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** previous rule-invariant opening deals / 180,000 initial hands / 57,883 valid starters; this run **0 new random deals** and **6,906,900 exhaustively enumerated possible 9-stone hands** (4,686,825 overlapping starter post-draw subset).
- Engine `qosa-research-0.5.3` + `opening-bridge-exact-1.0`; recovered `qosa-1.0.0`; branch opening and blocked winner UNVALIDATED.
- Last simulation seeds **1602940..1662939**; next fresh >=**1662940**.

## Latest checkpoint
- Exact bridge prevalence: **40.5204%** all 9-stone hands; **33.9426%** starter post-draw.
- Bridge among forced-pass starter hands with zero 1-X connectors: **60.7066%**; among starter hands with >=2 1-X connectors: **26.4422%**. Descriptive composition, not tactical win rate.
- Independent exhaustive V8 enumeration agreed with analytic formula for every connector stratum; Node CLI not run.
- Script `simulator/opening-bridge-exact.js`, data `runs/2026-10-27-2149-opening-bridge-exact.json`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Calibrate hidden-world sampling to exact conditional starter bridge counts; authenticate late-side legality and blocked-round tie convention before promoting bridge-preservation tactics.
