# Qoşa research status

Updated: 2026-10-28 00:47:25 +04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** full model-rounds across incompatible branch assumptions (workload scale only); historical 4,000 separate.
- **1,898,856** forced hidden-world continuations, **14,082** next-pass labels, **4,900** known-world diagnostics (unchanged).
- **60,000** random opening deals; **6,906,900** exact 9-stone hands enumerated (previous).
- **367,000** synthetic hidden-world allocations: 355,000 previous opening + 12,000 new midgame; NOT model rounds.
- Engine `qosa-research-0.5.3 + midgame-exact-posterior-1.0`; recovered `qosa-1.0.0`. Branch unlock, block winner/ties and match scoring UNVALIDATED.
- Last seed range **2018000..2029999**; next fresh >=**2030000**.

## Latest checkpoint
- Generalized exact posterior to public played tiles, asymmetric opponent sizes, optional stock and known opponent tiles, with explicit no-intervening-draw pass masks.
- Synthetic 5/9/8 hand-size midgame fixture: independent enumeration gives **21 feasible of 24,310** hidden allocations; a flexible 3-4 tile is held by seat 1 in **15/21**.
- **12,000** deterministic posterior worlds cover all 21 feasible allocations; sampled marginal 71.38% vs exact 71.43%, z=-0.13.
- V8 CommonJS-compatible tests passed: replay, 28-tile conservation, fixed-known-opponent + stock, pass contradictions. Node CLI not run. No reliable winning tactic.
- Source `simulator/midgame-exact-posterior.js`; data `runs/2026-10-28-0045-midgame-exact-posterior.json`; checkpoint `runs/2026-10-28-0045-midgame-exact-posterior.md`.
- Scoreboard/PWA and GitHub Actions untouched.

## NEXT ACTION
- Validate pass-time legal masks against authentic public midgame histories and intervening draws; confirm branch unlock and blocked tie convention before strategic Monte Carlo rankings.
