# Qoşa açdı research — current status

Last checkpoint: 2026-11-02T19:08:35+04:00 Asia/Baku.

- Added `simulator/score-floor-contract-test.js`; 41,237 assertions passed over 8,262 score/delta pairs, monotonicity, and valid/invalid finish-minus cases.
- Existing exact-source Node tests passed: `turn-test.js`, `four-branch-lock-kernel-test.js`, `block-score-fixtures.js` (22 assertions), and `finish-minus-test.js`. Source blobs were hash-verified from GitHub before execution in an isolated temporary directory; a full clone was unavailable because GitHub DNS could not resolve.
- No new deals, seeds, real decision traces, or strategy comparisons. No tactical finding and no strategy promoted.
- Cumulative separate game cohorts unchanged: 88,886 deal allocations, 1,074 selected multi-action positions, 5,863 state-world assignments; additive summaries, no global dedup.
- The tested contracts cover the coded score floor, draw/pass gate, four-branch lock/open, block remainder and −10/−20/−30/−40 finish mapping only. They do not authenticate physical rules.
- Complete match-level `loneZero=10` and 101-point bust scoring are not implemented in the current research kernel; do not infer semantics. Block winner/tie allocation remains provisional.
- Exact next: clarify `loneZero=10` and bust semantics; then implement isolated match-score fixtures while continuing branch/block physical-rule validation. Avoid large strategy batches until these semantics are sufficiently authenticated.

Report: qosha-research/runs/2026-11-02-1908-score-floor-round-invariants.md
Data: qosha-research/runs/2026-11-02-1908-score-floor-round-invariants.json
Test: qosha-research/simulator/score-floor-contract-test.js
