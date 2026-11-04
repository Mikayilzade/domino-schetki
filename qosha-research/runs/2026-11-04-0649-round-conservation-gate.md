# 2026-11-04 06:49 Asia/Baku — round conservation regression checkpoint

- Engine: `qosha-research-0.5.3`; recovered `qosa-1.0.0` 3 players × 9 stones, first-round opening.
- New research-only test: `simulator/round-conservation-regression.js`. It proposes 1,000 deterministic deal seeds `21000000..21000999` (redeals use subsequent seeds), seeded action selection, and verifies at every turn that all 28 unique dominoes are conserved across hands, stock, and played tiles; dispatcher and round-driver agree; branch ends stay within 0..6; completed finishes empty the winner's hand and have an allowed minus.
- Executed new deals: **0**. Test has been committed but not executed; local container cannot resolve github.com, and connector exposes file reads/writes rather than Node execution. Do **not** count the proposed 1,000 seeds as simulated or infer pass status.
- Strategies: deterministic hash-choice among legal actions (test policy only, not a strategy contest).
- Metrics: no measured block rate, turn length, or minus frequency in this checkpoint. Previous accepted PWA-tie replay remains 4,000 dependent deals in four distinct cohorts; historic 180,000 matched-seat strategy rounds remain separate.
- Finding: source inspection shows that `round-driver.stepRound` and `turn-dispatcher.applyTurn` are independently callable on the same action, enabling a useful state-consistency regression. No newly verified gameplay advantage.
- Confidence: high that the new test is stored; **unverified** that it passes. Known limitations: provisional branch unlocking and block scoring; seed cursor advances on first-round redeals; this does not authenticate physical table rules.
- Exact next action: run `node qosha-research/simulator/round-conservation-regression.js` in a Node-enabled repository checkout; fix any failing invariant before counting these deals, then test 24 branch-label permutations and compare policies on matched seeds. Keep live PWA untouched.
