# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T16:47:36+04:00 Asia/Baku.

- Latest checkpoint: matched three-order PWA finish-score event-order sensitivity on one deterministic independent 3×9 round stream.
- Seeds: 17,000,000–17,001,028; 1,029 attempts, 29 redeals, 1,000 accepted rounds, 1,000 unique allocations, no duplicates.
- Round outcomes: 955 finishes / 45 blocks / 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = 913/41/1/0/0. Blocks remain unscored.
- Matched entry orders: 0-1-2, 1-2-0, 2-0-1. All arms completed 75 matches at the same 75 round indices; median match length 14, mean 13.293 rounds, tail 3.
- Applied / skipped / pending nonzero events: 1,902 / 913 zeros skipped / 50 pending for 0-1-2; 1,899 / 913 / 53 for 1-2-0; 1,914 / 913 / 38 for 2-0-1.
- At shared match boundaries, exploded-seat identity differed in 7/75, 10/75, and 5/75 pairwise comparisons. This is manual PWA entry-order sensitivity, not a strategy result.
- Validation: 37 assertions passed; full 1,000-round cohort plus exact 40-round replay. No historical baseline pooled.
- Limits: finish-pip-plus-finisher-minus mapping is provisional; only 3 of 6 permutations tested; block winner/tie allocation unresolved; no strategy comparison or promotion.

Exact next action: test all 6 seat permutations on a disjoint 1,000-round holdout; check match-ending boundary invariance and exploded-seat/survivor-place sensitivity.

Report: qosha-research/runs/2026-11-03-1647-finish-score-event-order-sensitivity.md
Runner: qosha-research/simulator/finish-score-event-order-sensitivity.js
Test: qosha-research/simulator/finish-score-event-order-sensitivity-test.js
