# Policy-generated branch-label audit + mixed-finish/block edge fixtures — 2026-11-01 21:46:08 +04 (Asia/Baku)

## Reproducible cohort

- Engine: `qosha-research-0.5.3`; rules: recovered `qosa-1.0.0`, 3×9 + stock.
- Added `simulator/policy-branch-label-audit.js`; edge fixture runner: `simulator/mixed-finish-block-edge-fixtures.js`.
- Seeds `3414620–3415119`: **500 draws, 500 unique complete deal allocations, 0 duplicates**.
- Trajectories: 3 policy mix (fast-doubles, min-hand-pips, closed-branch-control), all three seat rotations; symmetric action-orbit tie-break and seeded symmetric 1-1 follow-up side selector.
- **1,500 trajectory rounds**: 1,441 finishes / 59 blocks / 0 unresolved; mean turns including opening setup **25.382**. These are validation trajectories, not strategy-comparison arms.

## Branch-label metamorphic checks

- 36,573 reachable positions generated; stratified union selected **235 unique states** (quota 60 each: pass, single, double, mixed, ≥4 legal actions, late-open).
- All 24 branch-label permutations checked: **5,640 legal action-set checks**, **14,064 mapped action transitions** (8,256 singles / 4,152 double sequences / 1,656 mixed finishes), and **1,440 pass transitions**.
- Policy action distributions: 4,200 checks each for random-legal, min-hand-pips, fast-doubles, moderate-double-hold, and closed-branch-control (**21,000 total**); **0 distributional mismatches**.
- Explicit draw fixtures: 48 option/permutation checks, 96 draw-then-play transitions, 24 draw-then-pass transitions; 0 mismatches.

## Mixed-finish / block edge fixtures

- **11 assertions passed**: an ordinary prefix extends a branch and exposes the remaining finish doubles; mixed finish empties the hand and scores −20; block keeps per-seat remainders and assigns neither winner nor minus; nonempty stock prevents block; four-double finish scores −40.
- These are coded-model fixtures, not physical-rule authentication.

## Finding, confidence, limitations

No tactical finding and no strategy ranking update. The useful result is that branch-label action/transition equivariance also holds on policy-generated reachable states, and the five tested policy tie-break distributions are label-equivariant in the sampled cohort. Confidence is high for internal metamorphic consistency.

The numeric run used a source-faithful V8 mirror of the current GitHub engine/dispatcher/initializer and symmetric action-orbit policy. A clean Node checkout could not be run because GitHub DNS resolution failed. The committed runner imports the repository modules and includes deterministic replay tests. Physical branch reopening/locking and block winner/tie scoring remain provisional.

## Cumulative scale

- Branch-label cohorts: **1,500 unique deal allocations** (1,000 prior + 500 this run); **60,274 reachable positions generated**; 670 selected-state records summed across cohorts (not globally deduplicated); 16,080 action-set checks / 40,800 mapped transitions / 4,320 pass transitions; zero recorded mismatches.
- Separate validation/opening/tie-break allocation cohort remains **7,550**; reachable property audit **52,315 positions**; branch-lock audit **550 deals**.
- Strategy tournament remains **1,500 deals / 18,000 arm-rounds** (+ separate 120-deal / 1,440-arm pilot). This run adds no strategy arms or hidden-world allocations.

## Exact next action

Run matched sensitivity variants for alternate branch-lock/reopening and block-winner assumptions. Keep strategy ranking paused until a real-table trace or explicit ruling authenticates those physical rules.

Raw data: [JSON](2026-11-01-2146-policy-branch-label-audit.json); runner: [policy-branch-label-audit.js](../simulator/policy-branch-label-audit.js); fixtures: [mixed-finish-block-edge-fixtures.js](../simulator/mixed-finish-block-edge-fixtures.js).
