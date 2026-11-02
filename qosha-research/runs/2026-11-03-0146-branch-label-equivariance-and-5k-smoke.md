# Branch-label transition equivariance and 5,000-round invariant smoke — 2026-11-03T01:46:01+04:00 (Asia/Baku)

## Scope

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0`; primary 3 players × 9 stones + one stock tile.
- This checkpoint is internal model validation, not physical-rule authentication or a strategy tournament.
- Four branch labels are assumed interchangeable for the metamorphic test only. Physical branch lock/open, block winner/tie, and `loneZero=10` remain unresolved.

## Reachable-state 24-permutation audit

- Seed draws: 3,404,360–3,404,399; 40 deals, 40 unique allocations, 0 duplicate allocation pairs.
- Reachable sampled positions: 891.
- All 24 branch-label permutations were checked at each sampled position: 21,384 action-set/state checks.
- Every mapped legal action was applied and compared: 61,800 legal-action transition checks; 2,760 pass-transition checks.
- All 40 validation rounds resolved: 38 finish, 2 block, 0 unresolved; mean resolved length 24.075 turns.
- No legal-action-set, action-transition, or pass-transition equivariance mismatch was found.

The deterministic policy tie-breaks did choose a different mapped action after relabeling in a minority of comparisons (18,624 checks per policy):
- min-hand-pips: 2,966 mismatches (15.93%);
- fast-doubles: 2,622 (14.08%);
- moderate-double-hold: 3,058 (16.42%);
- closed-branch-control: 3,178 (17.06%);
- random-legal: 3,308 (17.76%).

This is representation/tie-break sensitivity, not a win-rate difference or strategy advantage. It supports keeping branch-symmetric tie-breaking in strategy experiments.

## Regression and full-round smoke

- `branch-label-transition-equivariance.js test`: passed deterministic replay of 4 deals; 48 sampled positions, 1,152 permutation checks, 4,680 action transitions, 72 pass transitions.
- `branch-label-stratified-transition-audit.js test`: passed 8 replay seeds and 50 selected unique states; 1,200 action-set checks, 3,960 action transitions; explicit draw-then-play and draw-then-pass fixtures passed (48 option-permutation checks, 96 play transitions, 24 pass transitions).
- Full-round invariant smoke: seeds 7,105,000–7,109,999; 5,000 draws, 5,000 unique allocations, 0 duplicate allocation pairs; 956,148 assertions passed.
- Smoke outcomes under deterministic random-legal continuation: 4,740 finishes, 260 blocks, 0 unresolved. Mean 23.7572 turns, median 24, max 34.
- Opening: 4,680 mandatory follow-ups, 320 opening passes, 191 cases with 1-1 in stock.
- Finish-minus counts: 0 = 4,552; −10 = 184; −20 = 4; −30 = 0; −40 = 0.

These outcome frequencies describe the coded model and smoke policy only. Zero observed −30/−40 events is not evidence that those finishes are impossible.

## Execution and reproducibility

The exact repository JavaScript blobs were fetched from GitHub and executed in an isolated V8 harness with a small CommonJS loader and compatible assertion shim. A clean Node checkout could not be obtained because the container cannot resolve/connect to GitHub; this is not claimed as a clean Node regression.

Verified source blob SHAs:
- `branch-label-transition-equivariance.js`: `2066159470a6047f69849c68b11b2587aaaea2d4`
- `branch-label-stratified-transition-audit.js`: `a7ac66132facbe41b32d2466e8b96aaa51dad7b8`
- `full-round-invariant-smoke.js`: `2a797e1e0f9cdfa33ae9c4a2aef43d0dcb6f2117`
- `engine.js`: `82e5bd544a57683d5b4f7812b2d4abf80da894`
- `initializer.js`: `2fad29e516454580ec9a06115354e9866f3096e6`
- `turn-dispatcher.js`: `55b0bcf3f1653c64b4e06bc95d7e917a480562a0`
- `round-driver.js`: `fbaad78865adbddde1ea6651e6a501dc0bde3203`
- `turn-kernel.js`: `94657896e1f8e471ceb2e9a65d1842b6102dff18`
- `strategy-runner.js`: `b7078942bc8f5dac6a8b07494ae8aaeadbdb1f5f`

## Finding and limitations

The tested reachable states preserve legal-action sets and mapped successor transitions under all 24 branch relabelings. Existing deterministic policy choices are label-sensitive, so the next strategy study should use a symmetric/action-orbit tie-break and treat any outcome shift as tie-break sensitivity, not superiority.

No strategy comparison rounds or new hidden-world allocations were run. No strategy was promoted. The physical branch and block assumptions remain provisional.

## Separate cohort scale

- Prior separate cohorts remain: 88,886 deal allocations, 1,074 selected multi-action positions, and 5,863 state-world assignments; no global deduplication.
- Added this checkpoint: 40 unique branch-audit deals and 5,000 unique full-round smoke deals. The earlier 500-round smoke remains a separate seed cohort; these metrics are not pooled with it or with historical baselines.
- Regression replay seeds are test coverage, not additional strategy-study samples.

## Exact next action

Run a matched-seed full-round tie-break ablation: hold deals, seat rotations, and primary policy score fixed; compare canonical side-label tie-break against a seeded symmetric/action-orbit selector. Report paired round outcomes, block/finish, length, and finish-minus as representation sensitivity only. Keep strategy ranking gated on physical branch/block rule authentication.

Reproducers: `simulator/branch-label-transition-equivariance.js`, `simulator/branch-label-stratified-transition-audit.js`, `simulator/full-round-invariant-smoke.js`.
