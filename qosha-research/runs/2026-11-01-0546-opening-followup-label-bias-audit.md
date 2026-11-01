# Opening follow-up branch-label tie-break audit

**Timestamp:** 2026-11-01 05:46 (+04, Asia/Baku)  
**Engine/rules:** qosa-research-0.5.3 + opening-followup-label-bias-audit/v1; recovered qosa-1.0.0, 3×9+stock. The four branch labels are assumed interchangeable for this metamorphic audit only. Physical branch symmetry remains unconfirmed.

## Cohort

- 500 deterministic seed draws, 3407720–3408219; 500 unique full allocations, 0 duplicate allocation pairs.
- 1-1 was in a hand in 483 deals and in stock in 17. A legal follow-up existed in 468 deals; 32 opening follow-ups passed.
- Across eligible deals: 4,016 legal placements from 1,004 eligible follow-up tiles (four side placements per eligible tile).
- The current initializer selected **up in all 468/468 eligible cases**.

## Branch-label checks

Across 24 permutations for each eligible state:

- Default-choice mapping checks: **11,232**.
- The default canonical-up choice changed under relabeling in **8,424/11,232 (75%)**, exactly 18/24 permutations per eligible state.
- Legal action-set permutation mismatches: **0**.
- Uniform legal-action distribution mismatches: **0**.
- Tile-conservation checks: **500**, failures **0**.

The mismatch is a tie-break/representation effect: the initializer's canonical-up convention is not itself an equivariant policy. It is not evidence that the physical “up” branch is preferable. A uniform draw over legal opening placements is distributionally symmetric because each relabeling maps the candidate set bijectively with unchanged probability mass.

## Validation, confidence, and limits

- Deterministic 12-seed replay test passed; existing initializer regression passed.
- Node v22.16.0 used source mirrors with exact GitHub blob hashes: engine `82e5bd544a57683d5b4f7812beb2d4abf80da894`; initializer `8c3ba3b9baab4194a3e11b59db54fbf110fb2b49`.
- High confidence for the code-level audit on these allocations; four-branch physical symmetry remains an assumption.
- **0 full rounds, 0 strategy comparisons, 0 hidden worlds.** Historical and prior strategy populations are unchanged.

Cumulative validation allocation cohorts: **2,200 unique allocations** (the previous 1,700 property-audit allocations plus this disjoint 500-deal opening cohort); reachable decision-position total remains **39,262** because this audit did not traverse full rounds. Strategy samples remain 1,500 holdout deals / 18,000 arm-rounds plus the separate 120-deal pilot / 1,440 arm-rounds.

**Exact next action:** add an explicit seeded symmetric opening-follow-up selector for validation trajectories and measure matched-seed tie-break sensitivity. Keep strategy ranking paused until physical branch reopening and block/tie scoring are authenticated.
