# Qoşa research status

Updated: 2026-10-27T23:49:13+04:00 (Asia/Baku)

## Verified cumulative
- Global provisional rounds **1,342,575**; one-side counterfactual **28,800**; all-current counterfactual **9,600**.
- **1,380,975** full model-rounds across incompatible assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** prior random opening deals; **6,906,900** exhaustively enumerated 9-stone hands (4,686,825 overlapping starter subsets).
- **355,000** synthetic opening hidden-world allocations (340,000 previous + 15,000 new), NOT model rounds.
- Engine `qosa-research-0.5.3` + `opening-pass-posterior-1.0`; recovered `qosa-1.0.0`; branch opening and blocked winner UNVALIDATED.
- Last seed range **2002940..2017999** (discovery 2002940..2002942, sampled 2003000..2017999); next fresh >=**2018000**.

## Latest checkpoint
- Starter forced pass after 1-1+stock, then first clockwise opponent also passes on unchanged 1 ends: exact **220 / 48,620 = 0.45249%** conditional on starter pass.
- Combined opening two-pass probability **0.0283774%**; all **six** remaining 1-X connectors must belong to the third player (exact conditional inference).
- Three known-hand fixtures × 48,620 exact allocations, 15,000 sampled conditional worlds. Six bridge-frequency calibration checks max |z| **2.18** < 5.
- Node 22 CLI test and run passed: seed replay, 28-tile conservation, pass constraints, known-hand rejection, exact seat symmetry.
- Code `simulator/opening-pass-posterior.js`, data `runs/2026-10-27-2349-opening-pass-posterior.json`.
- **No new reliable winning strategy.** The exact event is rare and limited to the confirmed opening; not a midgame inference.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Extend conditional hidden-world sampler to midgame public tile histories, asymmetric hidden hand sizes and multiple observed pass constraints; validate on small exact enumerations.
- Authenticate late-side branch unlocking and blocked-round tie convention before tactical rankings.
