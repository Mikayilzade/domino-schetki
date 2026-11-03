# Qoşa açdı research — current status

Last checkpoint: 2026-11-03T12:52:31+04:00 Asia/Baku.

- Latest checkpoint: deterministic initializer audit for first-round 1-1-in-stock redeal and later-round previous-winner initialization.
- Seed set 12000000–12001999: 2,000 draws, 2,000 unique allocations, 0 duplicate pairs.
- First-round path: 82 explicit redeal signals when 1-1 was in stock; 1,918 normal ready states. The initializer does not execute the caller-owned reshuffle.
- Continuation path: all three previous-winner seats checked on every deal (6,000 initializations); all 28 unique tile identities conserved across hands, stock, and played opening tiles.
- Regression audit: 201,597 assertions passed. Per-seat hand inventory, starter, clockwise next player, opening draw/follow-up/pass, branch update, pass counter, and no-input-mutation were checked.
- No strategy comparisons or promotion. No reliable tactical finding; physical branch/opening rules, block winner/tie allocation, and loneZero=10 remain unresolved.
- Cumulative cohorts remain separate: this initializer audit adds 2,000 seed draws / 2,000 allocations; previous round-driver audit 100 draws / 300 matched pairs; block audit 6,000 draws / 144,000 model-rounds; tie-break ablation 2,120 draws / 12,720 paired rounds. No historical-baseline pooling.

Exact next action: document the simulator's deterministic seed-retry convention, then audit a full first-round redeal loop and the first two clockwise post-opening turns for stock-1-1 and hand-owned-1-1 cases.

Results: qosha-research/RESULTS.md
Reproducer: qosha-research/simulator/initializer-redeal-conservation-audit.js
Test: qosha-research/simulator/initializer-redeal-conservation-audit-test.js
