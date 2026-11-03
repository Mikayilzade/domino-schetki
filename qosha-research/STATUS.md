# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T10:45:25+04:00 Asia/Baku.

- Latest checkpoint: draw-enabled action/pass integration audit for recovered qosa-1.0.0, 3×9 coded model.
- New regression test passed 71 assertions across seven fixture groups: no-draw gate, drawn single, drawn double-sequence, drawn mixed finish, round-driver finish/pass, drawn pass retention, and pass counter / finish-before-block behavior.
- Existing mixed-finish contract test rerun: 1,095 assertions, 33 sequence orderings, 408 score-floor pairs.
- No simulated deals, seed draws, strategy comparisons, or strategy promotion. Finding is internal implementation consistency only; physical rules remain unauthenticated.
- Unresolved: physical branch lock/open semantics, block winner/tie allocation, and loneZero=10.

Cumulative independent cohorts remain separate: block audit 6,000 seed draws / 144,000 model-rounds; tie-break ablation 2,120 seed draws / 12,720 paired rounds; prior 88,886 allocations, 1,074 multi-action positions, 5,863 state-world assignments, and 5,000 smoke rounds. No historical-baseline pooling.

Exact next action: run a disjoint deterministic 100-seed 3×9 round-driver audit on seeds 11,000,000–11,000,099 with fixed random-legal/action-orbit policy; assert 28-tile conservation at every transition, duplicate-play absence, one-draw limit, pass counter behavior, and finish/block termination. Report seed draws separately from unique allocations.

Results entry: qosha-research/RESULTS.md.
Test: qosha-research/simulator/draw-enabled-action-contract-test.js
