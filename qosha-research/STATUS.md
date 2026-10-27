# Qoşa research status

Updated: 2026-10-27 12:51:20 +04 (Asia/Baku)

## Verified cumulative scale
- **1,270,575** complete rounds; historical 4,000 separate.
- **1,898,856** matched forced hidden-world continuations (unchanged).
- **4,900** separate known-world diagnostics; **10,248** immediate next-opponent pass labels.
- Engine `qosa-research-0.5.3` / recovered `qosa-1.0.0` 3×9; four-side number-lock **PROVISIONAL**.
- Fresh disjoint seeds **1590340..1593939**; next >=**1593940**.

## Latest checkpoint
- 3,600 deals, 21,600 complete baseline rounds, 1,345 selected positions, 2,690 immediate next-pass labels, 129,120 sampled hidden allocations (96/position); 0 new forced continuations.
- Added profile-blind 50/50 latent per-opponent policy-choice mixture, retaining previous oracle-profile calculation as diagnostic only.
- Non-certain 524 labels / 374 clusters: exact pass-only Brier **0.10869** versus blind **0.08685**; exploratory 95% cluster gain **+0.02185 ± 0.00831**.
- Independent two-cohort holdout 366 labels / 252 clusters: Brier **0.11220 → 0.09689**, gain **+0.01622 ± 0.00970**. BOTH-pass non-certain 9 labels / 7 clusters, inconclusive.
- 8-check deterministic V8 CommonJS pilot passed; Node CLI not run. No confirmed real-game tactic; no scoreboard/PWA changes.
- Code: `qosha-research/simulator/pass-choice-profile-blind.js`; raw and pooled files: `runs/2026-10-27-1246-profile-blind-*.json`.

## NEXT ACTION
- Fresh seeds >=1593940: **out-of-family opponent policy** test (random/tempo/anti-minus) of blind choice posterior vs exact pass-only, non-certain holdout and prior sensitivity. Authenticate branch locking and blocked winner.
