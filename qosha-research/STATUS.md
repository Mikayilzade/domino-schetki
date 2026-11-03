# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T13:51:32+04:00 Asia/Baku.

- Latest checkpoint: deterministic first-round redeal loop and two clockwise post-opening turns audit.
- First-round seed stream 13,000,000–13,002,077: 2,000 accepted deals / 2,078 attempts; 78 redeal signals; 2,000 unique accepted allocations, no duplicate pairs. Retry histogram 1,926 / 70 / 4 for 0 / 1 / 2 retries.
- Separate continuation seed set 14,000,000–14,001,999: 2,000 allocations, 74 with 1-1 in stock; all three previous-winner seats checked (222 initializer states).
- First two post-opening clockwise turns: 4,444 transitions; 6,666 exact 28-tile inventory snapshots; 4,444 round-driver/manual equivalence checks; 142,541 assertions passed. Full deterministic replay matched exactly.
- No strategy comparison or promotion. No reliable tactical finding; physical branch/opening semantics, block winner/tie allocation, and loneZero=10 remain unresolved.
- This cohort is separate from the prior initializer, round-driver, block-audit, and tie-break cohorts. No historical-baseline pooling.

Exact next action: extend both setup paths through full round termination under a fixed deterministic legal policy, then test score-floor/101-bust integration separately without assigning an unresolved block winner.

Results: qosha-research/RESULTS.md
Reproducer: qosha-research/simulator/redeal-loop-clockwise-audit.js
Test: qosha-research/simulator/redeal-loop-clockwise-audit-test.js
