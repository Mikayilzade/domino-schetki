# Qoşa açdı research — current status

Last checkpoint: 2026-11-02 04:33 Asia/Baku (+04:00).

- Added a current-only-generated counterfactual trace cohort and a model-aware actual-world assertion to exact pass-history support.
- Seed scan 3454291–3455100: 810 unique deals, 31 finishes, 779 blocks, 0 unresolved; 100 selected late positions, 129 eligible states, 3,866 no-stock pass observations.
- Exact state-world support totals: raw 1,081; global-ever-open 52; current-only 786; joint 52; global-only 0; current-only-exclusive 734; neither 295. Actual current-only allocation survived 100/100; global-compatible 8/100; joint support non-empty in 17/100 positions.
- The high block frequency is specific to the provisional current-only counterfactual and is not a real-game estimate. No candidate comparison or tactic promotion.
- V8 in-memory reference execution completed. Clean Node runner/test integration was not available because the container could not resolve github.com; regression files are committed for the next clean execution.
- Live scoreboard/PWA files remain untouched.
- Exact next: run matched candidate continuations only over the 17 joint-support positions / 52 state-world assignments; keep this diagnostic and seek authentic public traces/ruling for branch opening.

Report: runs/2026-11-02-current-only-pass-support.md  
Data: runs/2026-11-02-current-only-pass-support.json  
Runner/test: simulator/pass-history-current-only-cohort.js and simulator/pass-history-current-only-cohort-test.js
