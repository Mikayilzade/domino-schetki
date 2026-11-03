# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T11:46:19+04:00 Asia/Baku.

- Latest checkpoint: deterministic 3×9 round-driver conservation audit, recovered qosa-1.0.0 coded model.
- Seed set 11000000–11000099: 100 seed draws, 100 unique allocations, 0 duplicates. Three seat rotations; stable-key baseline vs symmetric action-orbit; 300 matched round pairs / 600 total rounds.
- All rounds resolved. 15,209 exact 28-tile inventory snapshots, 14,609 round-driver/manual transition equivalence checks, and 13,559 played-tile provenance/uniqueness checks passed. No inventory mismatch or repeated tile.
- Pass counter increment/reset and finish/block termination were checked per transition. In-round draws: 0; max stock consumption per turn: 0. The sole stock tile is consumed during mandatory 1-1 opening setup in this primary mode; draw-enabled paths are covered by prior fixtures.
- Tie-break sensitivity: round kind changed 4.00%; finish winner changed 21.05% of both-finish pairs. This is not strategy superiority; no strategy promoted.
- No new reliable tactical finding and no physical rule authentication. Branch lock/open semantics, block winner/tie allocation, and loneZero=10 remain unresolved.
- Cumulative independent cohorts unchanged except this run adds 100 seed draws / 100 allocations and 300 matched pairs. No historical-baseline pooling.

Exact next action: deterministic initializer audit for first-round 1-1-in-stock redeal and later-round previous-winner start, checking full 28-tile conservation before/after opening setup.

Results entry: qosha-research/RESULTS.md
Reproducer: qosha-research/simulator/round-conservation-audit.js
Test: qosha-research/simulator/round-conservation-audit-test.js
