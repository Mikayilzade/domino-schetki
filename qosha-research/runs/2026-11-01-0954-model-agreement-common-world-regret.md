# Qoşa açdı — model-agreement common-world regret audit

**Timestamp:** 2026-11-01 09:54:30 +04 (Asia/Baku)  
**Source commit:** [4983bcf6c16bcdaccba4e5f0b16043f23d49c0e1](https://github.com/Mikayilzade/domino-schetki/commit/4983bcf6c16bcdaccba4e5f0b16043f23d49c0e1)  
**Rules/engine:** recovered `qosa-1.0.0`, 3×9+stock; audit port based on `qosa-research-0.5.3` GitHub modules.

## What was tested

- 250 unique deal allocations, seeds `3409720–3409969`; 6,342 decision positions from trajectories under the global-ever-open model and `closed-branch-control` with the symmetric action-orbit tie-break.
- Global-ever-open and current-only models had different legal action sets at 1,161/6,342 positions (**18.31%**). The 3,102 unique visible states with at least two legal actions and equal root action sets formed the agreement pool.
- Selected 24 states, one per deal, stratified across 4 action-count bands (2, 3, 4–6, 7–8) × 3 turn phases (early, mid, late), two per cell.
- For each state, held the focal hand and played/known tiles fixed; sampled hidden opponent allocations under the same conditional distribution. Small finite spaces were enumerated or hash-subsampled without replacement. Candidate sets were checked in both models and across all sampled worlds.
- Each candidate was forced in the same hidden world, then all continuations used the same `closed-branch-control` action-orbit policy. Regret was measured against a hindsight best candidate separately for first-finish chance, expected remainder, minus risk, and expected minus loss.

## Results

- **334 unique conditional hidden allocations**, 128 seeded draws, 0 duplicate allocations; 1,435 candidate-world evaluations per model, **2,870 full-round evaluations** across both models. 0 unresolved rounds and 0 candidate-set drift.
- Mean per-state oracle regret under global-ever-open: first-finish chance **2.86 pp**, remainder **0.122 pips**, minus-finish risk **10.49 pp**, expected minus loss **1.10 pips**.
- Under current-only: **2.38 pp**, **0.753 pips**, **6.25 pp**, and **0.625 pips**, respectively. Median regret was zero for every metric in both models.
- These are small, stratified exploratory samples. They do **not** establish a winning tactic; minus-risk maxima can be large when only a few worlds are available.

## Validation and limits

- Deal/opening compatibility matched the earlier committed 500-deal audit exactly: 500 unique allocations, 474 follow-ups, 26 opening passes; side counts up 118 / left 118 / right 120 / down 118.
- Tests passed: 100 deal seeds for tile conservation, the 500-deal opening regression, 3 hidden-world fixtures, and deterministic replay of 2 states / 4 worlds / 28 candidate-round evaluations.
- The audit ran as a standard-library Python port based on the exact GitHub source blob hashes recorded in the JSON; it was **not** a clean Node checkout run because DNS resolution to GitHub was unavailable. The simulator source itself was not changed.
- Branch reopening and block/tie scoring remain provisional. Hidden-world sampling did not condition on pass history. No 101-match scoring or human win-rate estimate was used.

## Exact next action

Persist a native Node runner using the existing engine/hidden-world/decision-regret modules, then repeat on disjoint deal seeds `3409970–3410469` with at least 72 agreement states and up to 24 unique hidden worlds per state. Keep root model-disagreement positions separate from the agreement regret cohort.
