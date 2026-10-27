# Qoşa research status

Updated: 2026-10-27T22:49:46+04:00 (Asia/Baku)

## Verified cumulative
- Global provisional rounds **1,342,575**; one-side counterfactual **28,800**; all-current counterfactual **9,600**.
- **1,380,975** full model-rounds across incompatible assumptions (workload only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** previous random opening deals; **6,906,900** exhaustively enumerated 9-stone hands (overlapping 4,686,825 starter subsets); **340,000** NEW sampled synthetic opening hidden-world allocations, tracked separately, not model rounds.
- Engine `qosa-research-0.5.3` + `opening-hidden-calibration-1.0`; recovered `qosa-1.0.0`; branch opening and blocked winner UNVALIDATED.
- Last seed range **1662940..2002939**; next fresh >=**2002940**.

## Latest checkpoint
- Exact vs sampled unconditional bridge: **33.943% vs 34.086%**.
- Starter forced pass (0 1-X): **60.707% vs 60.265%**.
- Starter 2+ 1-X: **26.442% vs 26.616%**.
- All 7 conditional strata within 5-sigma gate (max |z| 1.28); 270 deterministic fixture worlds passed in V8, Node CLI not run.
- Script `simulator/opening-hidden-calibration.js`, data `runs/2026-10-27-2248-opening-hidden-calibration.json`.
- No strategic finding; scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Add known-focal tiles and observed opponent-pass constraints; compare small-world exact posterior counts to sampled allocations. Authenticate late-side legality and blocked-round tie convention before tactical claims.
