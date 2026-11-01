# Latest checkpoint — branch-label permutation audit + block-remainder fixtures (2026-11-01 20:47:18 +04 (Asia/Baku))

- **Branch-label audit:** seeds 3414120–3414619; 500 unique full allocations, 0 duplicates; 11,838 reachable decision positions; 476 finishes / 24 blocks / 0 unresolved; mean turns 24.676.
- **24-permutation checks:** 209 selected unique states within the cohort; 5,016 legal action-set checks, 12,600 legal transitions (8,928 singles / 2,856 double sequences / 816 mixed finishes), 1,440 pass transitions; explicit draw fixtures 48 option checks / 96 draw-play transitions / 24 draw-pass transitions. **0 mismatches**.
- **Block fixtures:** new `simulator/block-score-fixtures.js`, 22 assertions passed; unique-minimum, tied-minimum, and 5-player zero-pip block cases preserve per-seat remainders and do not infer a winner. Existing scoring contract passed 1,056 assertions.
- **Cumulative branch-label cohorts:** 1,000 unique deal allocations across two disjoint 500-deal cohorts; 23,701 reachable decision positions generated; 435 selected-state records summed (not globally deduplicated); 10,440 action-set checks / 26,736 transitions / 2,880 pass transitions, zero mismatches.
- **Cumulative baseline:** separate validation/opening/tie-break allocations 7,550; property audit 52,315 positions; branch-lock audit 550 deals. Strategy tournament unchanged: 1,500 deals / 18,000 arm-rounds (+120-deal / 1,440-arm pilot).
- **Interpretation:** high confidence in internal model-level branch-label equivariance and coded block-remainder accounting; no reliable strategy finding. Physical branch locking/reopening and block winner/tie scoring remain provisional. `loneZero=10` and `bust=101` remain unverified.
- **Exact next:** repeat the branch-label metamorphic audit on disjoint policy-generated trajectories and add mixed-finish/block edge fixtures. Keep strategy ranking paused until authentic physical branch/block evidence is available.

See [run report](runs/2026-11-01-2047-branch-label-block-contract.md) and [raw JSON](runs/2026-11-01-2047-branch-label-block-contract.json).
