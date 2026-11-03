# 3×9 round-driver conservation audit — 2026-11-03T11:46:19+04:00 (Asia/Baku)

- **Engine/rules:** qosha-research-0.5.3; recovered qosa-1.0.0 coded model, primary 3 players × 9 stones + one stock tile. Physical branch/opening semantics remain provisional.
- **Seeds/deals:** 11000000–11000099; 100 seed draws, 100 unique seat-labelled allocations, 0 duplicate pairs.
- **Matched design:** mix `random-legal / min-hand-pips / closed-branch-control`; three seat rotations; stable-key baseline vs symmetric action-orbit tie-break; same deal and rotation in both arms. 300 paired round comparisons (600 total rounds).
- **Validation:** all rounds resolved; 0 unresolved. 15,209 exact 28-tile inventory snapshots; 14,609 round-driver/manual transition equivalence checks; 13,559 played-tile uniqueness/provenance checks. No repeated tile identity or inventory mismatch.
- **Draw/pass:** 1,513 pass turns; pass count increment/reset and block termination checked on every transition. In-round draws: 0; maximum consumed stock tiles per turn: 0. The sole stock tile is normally consumed by mandatory 1-1 opening setup in this 3×9 mode; separate fixture tests cover draw-enabled turns.
- **Arm metrics:** baseline 290 finishes / 10 blocks, mean 25.380 turns, block rate 3.33%; action-orbit 292 finishes / 8 blocks, mean 25.317 turns, block rate 2.67%.
- **Paired sensitivity:** outcome kind changed in 12/300 pairs (4.00%); winner changed in 60/285 pairs where both finished (21.05%); minus changed in 29/285 (10.18%). This is tie-break sensitivity, **not strategy superiority**.
- **Finding/confidence:** strong internal validation of tile conservation and round-driver integration for these deterministic trajectories. No reliable strategic finding; no strategy promoted. This does not authenticate physical branch/block rules or loneZero=10.
- **Cumulative:** adds 100 seed draws / 100 unique allocations and 300 matched pairs. Previous cohorts remain separate; no historical-baseline pooling.
- **Exact next action:** deterministic initializer audit for first-round 1-1-in-stock redeal and later-round previous-winner start, including complete inventory conservation before and after opening setup.
- **Reproducer:** `simulator/round-conservation-audit.js`; test `simulator/round-conservation-audit-test.js`. Exact fetched GitHub source blobs were executed in an isolated V8 harness; a clean Node checkout remains unavailable in this environment.
