# Qoşa research status

Updated: 2026-10-28T11:45:35+04:00 (Asia/Baku)

## Verified cumulative
- **1,380,975** complete model-rounds across incompatible branch assumptions; historical 4,000 separate.
- **1,898,856** forced hidden-world continuations; **14,082** next-pass labels; **4,900** known-world diagnostics (unchanged).
- **280,000** deterministic opening deals (230,000 previous + 50,000 new), separate from rounds.
- **571,000** synthetic hidden allocations (555,000 previous + 16,000 new), separate from rounds.
- Engine `qosa-research-0.5.3 + fixed-connector-ownership-1.0`; recovered `qosa-1.0.0`.
- Late-arrival branch, blocked winner/ties, loneZero/bust and 101 scoring **UNVALIDATED**.
- Fresh deal seeds **2366000..2415999**, world seeds **2416000..2431999**; next unused **>=2432000**.

## Latest checkpoint — fixed 1-X connector, hypothetical ownership swap
- 50,000 new deals, 24844 eligible, 500 balanced hands (250 X>Y and 250 X<Y) × 32 matched worlds = **16,000** allocations; 0 full model-rounds.
- Same 1-X and identical opening pip cost/geometry. Compare focal X-X vs synthetic exchange for unseen Y-Y (X-X moves to an opponent). **Not a legal game move**; focal and opponent hand pip sums change.
- High-pip optional chain: opponent stones in two turns **1.88194 vs 2.07063**, paired delta **-0.18869**, exploratory position-cluster 95% CI **[-0.19906, -0.17831]**.
- Low-pip chain paired delta **-0.15350**; exact first-opponent pass delta **0.04525** versus sampled **0.04594**.
- Two exhaustive 48,620-way checks, 100 seed replays, conservation, multi-double/no-ordinary-append and pass calibration passed. 0/16,000 return-mobility disagreements under two provisional branch models.
- **Audit warning:** prior `opening-two-opponent-chain.js` removed connector via noncanonical `1-X` string; for X=0 this fails to remove `0-1` in focal return-mobility. Opponent-move metrics do not use focal hand and are unaffected; X=0 return-mobility needs correction.
- **Finding:** fixed-connector comparison removes earlier different-X opening-pip confound, but only measures synthetic ownership sensitivity; no confirmed winning tactic.
- Script: `simulator/opening-fixed-connector-ownership.js`; data: `runs/2026-10-28-1145-fixed-connector-ownership-2366000-2431999.json`.

## NEXT ACTION
- Compare actual legal 1-X versus 1-Y choices on matched worlds, stratify pip gap and connector count; audit prior X=0 return-mobility; authenticate late-arrival branch and block ties.
