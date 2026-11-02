# Exact joint-support paired candidate audit — 2026-11-02 04:54:38+04 (Asia/Baku)

## Cohort and exact support

- Engine/rules: qosha-research-0.5.3 + current-only-pass-support-1.0 + model-agreement-common-world-regret-node; recovered qosa-1.0.0; 3x9; global-ever-open and current-only branch models remain provisional.
- Seed scan 3454291–3455100: 810 unique 3×9 deals, 0 duplicate allocations. Current-only discovery outcomes: 31 finishes, 779 blocks, 0 unresolved; 3866 no-stock pass observations.
- 100 late positions were selected; 17 had non-empty joint pass-conditioned support. Comparisons are limited to these positions.
- Exact support over these state-world assignments: raw 212; global 52; current-only 151; joint 52; current-only-exclusive 99; neither 61. Enumerated 212 allocations; within-state duplicates 0.
- Joint support contains 52 state-world assignments (not globally unique allocations). All 17 selected states had at least two common root actions.

## Matched candidate continuations

- 133 candidate-action × hidden-world pairs; 266 full continuations, one for each candidate under each model. Candidate arms reuse the exact hidden allocation and continuation seed.
- Global model outcomes: 127 finishes, 6 blocks, 0 unresolved. Current-only: 23 finishes, 110 blocks, 0 unresolved.
- State-cluster global minus current-only focal first-finish chance: 15.44 pp ± 12.13 pp (95% normal CI); focal remainder: -4.63 ± 2.47 pips.
- Average within-state candidate regret: global 9.36 pp ± 8.29 pp first-finish and 1.37 ± 0.49 pips; current-only 5.69 pp ± 8.23 pp and 1.91 ± 0.68 pips.
- No minus finish was observed in these 266 continuations; this is not a general estimate of minus risk.

## Finding and limitations

The paired evaluator now compares candidates only on the exact intersection of both pass-conditioned supports. The branch models produce substantially different continuation outcomes in this selected synthetic cohort. This is model sensitivity, not evidence which physical rule is correct and not a tactical recommendation. No strategy was promoted.

Counts are exact under the stated allocation and pass-mask assumptions. Positions are selected synthetic late-game states; pass consistency is used without opponent-choice likelihood. Confidence intervals are state-cluster descriptive intervals, not population-level guarantees. The clean Node checkout was unavailable because github.com DNS resolution failed; regression was executed in a V8 harness against the repository source modules.

## Exact next action

Continue the current-only pass-support scan from fresh seed 3455101; target at least 50 joint-support positions with two or more common root actions, then replicate with a third continuation profile. Keep the result diagnostic and seek an authentic table trace or explicit branch-opening ruling.

Runner/test: `simulator/pass-history-joint-support-choice-audit.js`, `simulator/pass-history-joint-support-choice-audit-test.js`.
Data: `runs/2026-11-02-0454-pass-history-joint-support-choice-audit.json`.
