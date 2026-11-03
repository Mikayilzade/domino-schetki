# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T17:49:56+04:00 Asia/Baku.

- Latest checkpoint: all-six seat-permutation PWA finish-score event-order holdout on a disjoint 3×9 round stream.
- Seeds: attempt range 18,000,000–18,001,037; 1,038 attempts, 38 redeals, 1,000 accepted rounds, 1,000 unique allocations, 0 duplicates.
- Round outcomes: 952 finishes / 48 blocks / 0 unresolved. Finish-minus 0/−10/−20/−30/−40 = 915/36/1/0/0. Blocks remain unscored.
- All six seat orders replayed the same outcomes. Each completed 72 matches with mean 13.778 / median 14 rounds and an 8-round tail.
- Match-ending accepted-round indices were invariant across all six orders: 72 common boundaries and 0 unique boundaries in every pairwise contrast.
- At shared boundaries, exploded-seat identity changed in 1–7/72 pairwise matches; survivor-place assignment in 5–21/72; first-place identity in 4–17/72. This is descriptive PWA input-order sensitivity, not a strategy result.
- Validation: 193 assertions; exact full 1,000-round replay; exact 40-round smoke replay; 0 unresolved smoke rounds. No historical baseline pooled.
- Limits: terminal-pip-plus-finish-minus mapping remains provisional; blocks remain unscored; manual PWA entry order is not a physical rule; no strategy comparison or promotion.

Exact next action: run a second disjoint 1,000-round holdout starting at seed 19,000,000 with all six orders; preregister match-boundary invariance and repeat exploded-seat/survivor-place comparisons, then stratify by score proximity to 101 only if invariance reproduces.

Report: [run report](runs/2026-11-03-1749-finish-score-event-order-six-permutation-holdout.md)
Runner: [reproducer](simulator/finish-score-event-order-six-permutation-holdout.js)
Test: [regression test](simulator/finish-score-event-order-six-permutation-holdout-test.js)
