# Branch-label permutation audit + isolated block-remainder fixtures — 2026-11-01 20:47:18 +04 (Asia/Baku)

## Run

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3×9 + 1 stock.
- Existing runner: [`simulator/branch-label-stratified-transition-audit.js`](../simulator/branch-label-stratified-transition-audit.js).
- Fresh seeds `3414120–3414619`: **500 draws, 500 unique full allocations, 0 duplicates**. Trajectories used the deterministic seeded legal-action-index selector only to generate reachable validation states.
- 11,838 reachable decision positions generated; 476 finish / 24 block / 0 unresolved; mean turn counter including opening setup 24.676 (block rate 4.8%).

## Metamorphic result

Across six strata, the union selected **209 unique states within this cohort** (pass 60, single 60, double 60, mixed 32, multi-action 60, late-open 60; overlapping strata are unioned).

- All 24 branch-label permutations were checked.
- **5,016 legal action-set checks**, **12,600 mapped legal-action transitions** (8,928 singles / 2,856 double sequences / 816 mixed finishes), and **1,440 pass transitions**.
- Explicit draw fixtures: 48 option/permutation checks, 96 draw-then-play transitions, 24 draw-then-pass transitions.
- **0 action-set, action-transition, pass-transition, or draw-fixture mismatches.**

This supports internal model-level label equivariance for the tested states. It does not prove that real-table branch locking/reopening is physically symmetric.

## Block scoring/remainder contract

Added [`simulator/block-score-fixtures.js`](../simulator/block-score-fixtures.js) and ran 22 assertions across:
- 3-player block with a unique minimum remainder;
- 3-player block with a tied minimum;
- 5-player block with a zero-pip hand;
- per-seat remainder sums/order, no inferred block winner, no minus assigned to a block, and stock/pass-threshold gates.

The existing scoring contract also passed **1,056 assertions** (including 1,010 score-floor grid checks and finish classes). These are code-contract tests only. The actual blocked-round point allocation and winner/tie rule remain unauthenticated.

## Cumulative research scale

- Branch-label audit cohorts: **1,000 unique deal allocations** across two disjoint 500-deal cohorts; 23,701 reachable decision positions generated; 435 selected-state records summed across cohorts (not globally deduplicated); 10,440 action-set checks / 26,736 action transitions / 2,880 pass transitions; zero recorded mismatches.
- Separate validation/opening/tie-break allocation cohort remains **7,550**; reachable property-audit positions remain **52,315**; branch-lock audit remains **550 deals**.
- Strategy tournament unchanged: **1,500 deals / 18,000 arm-rounds** (+ separate 120-deal / 1,440-arm pilot). This run adds no strategy arms and no hidden-world allocations.

## Finding, confidence, limitations

No reliable tactical finding or strategy advantage. Confidence is high for the internal metamorphic and deterministic checks. Physical four-side locking/reopening, blocked-round winner/tie scoring, `loneZero=10`, and `bust=101` match semantics remain provisional/unverified.

## Exact next action

Run a disjoint branch-label audit with policy-generated trajectories (rather than only seeded legal-action-index trajectories), keep all 24-permutation action/pass/transition checks, and add mixed-finish/block edge fixtures. Keep strategy ranking paused and physical branch/block rules provisional until an authentic table trace or explicit ruling is available.
