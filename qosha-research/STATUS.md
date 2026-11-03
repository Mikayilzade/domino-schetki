# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T20:57:37+04:00 Asia/Baku.

- Event-level six-order replay of the existing 20M cohort; 1,000 accepted 3×9 outcomes / 1,035 attempts / 35 redeals / 942 finishes / 58 unscored blocks. No new independent deals.
- Six orders completed 76 matches on the same boundaries. The prior 26 dependent rank changes at gap 11–20 came from only 3 unique boundaries (560, 801, 856; 9/9/8 comparisons).
- In all 26, pending survivor deltas and survivor scores differed. None was sorting-only; no exploded-seat or pre-round-score difference. Pending events can include negative finish-minus.
- Validation: 28,265 trace/adapter checks; 146 regression assertions; exact full replay and 40-round smoke; full 26 pair traces stored in JSON.
- Order-sensitivity cumulative: 4,000 accepted outcomes across four separate cohorts (3,000 six-order); current run is a replay, not new data.
- Limits: provisional terminal-pip scoring, unscored blocks, unresolved physical branch/block rules, no strategy advantage established.

Exact next action: read-only verify live PWA pending-event behavior with positive and negative survivor deltas, then resume branch/block physical-rule validation and matched-seed strategy experiments.

Report: [event-level trace audit](runs/2026-11-03-2057-finish-score-order-event-traces.md)
Runner: [reproducer](simulator/finish-score-event-order-trace-20m.js)
Test: [regression](simulator/finish-score-event-order-trace-20m-test.js)
