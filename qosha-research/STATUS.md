# Latest checkpoint — policy-generated branch-label audit + mixed-finish/block edge fixtures (2026-11-01 21:46:08 +04 Asia/Baku)

- **Policy-generated trajectories:** seeds 3414620–3415119; 500 unique full allocations, 0 duplicates; three policy mixes/seat rotations = 1,500 rounds; 1,441 finishes / 59 blocks / 0 unresolved; mean turns 25.382.
- **Reachable-state sample:** 36,573 positions generated; 235 selected unique states across pass/single/double/mixed/multi/late strata.
- **24-permutation checks:** 5,640 legal action-set checks; 14,064 mapped transitions (8,256 singles / 4,152 double sequences / 1,656 mixed finishes); 1,440 pass transitions; 21,000 policy-distribution checks across five policies. **0 mismatches**.
- **Edge fixtures:** 11 assertions passed, including mixed-prefix exposure and −20, block no-winner/no-minus and stock gate, and four-double −40.
- **Cumulative branch-label cohorts:** 1,500 unique deal allocations; 60,274 reachable positions; 16,080 action-set checks / 40,800 transitions / 4,320 pass transitions; zero recorded mismatches.
- **Cumulative baseline:** separate validation/opening/tie-break allocations 7,550; property audit 52,315 positions; branch-lock audit 550 deals. Strategy tournament unchanged: 1,500 deals / 18,000 arm-rounds (+120-deal / 1,440-arm pilot).
- **Interpretation:** high confidence in internal model-level equivariance; no tactical finding. Physical branch locking/reopening and block winner/tie scoring remain provisional. Numeric execution used a source-faithful V8 mirror; clean Node checkout was blocked by GitHub DNS.
- **Exact next:** run matched sensitivity variants for alternate branch-lock/reopening and block-winner assumptions; keep strategy ranking paused until a real-table trace or explicit ruling is available.

See [run report](runs/2026-11-01-2146-policy-branch-label-audit.md) and [raw JSON](runs/2026-11-01-2146-policy-branch-label-audit.json).
